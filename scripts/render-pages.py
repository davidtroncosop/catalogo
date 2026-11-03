"""Render magazine pages, covers and downloadable copies from the cycle PDFs.

Usage: python3 scripts/render-pages.py 17 [slug ...]
Pages go to public/catalogs/<slug>/<n>.webp (703 px wide), the cover to
public/covers/<slug>-c<cycle>.jpg and a copy under 25 MiB to public/pdf/.
"""
import io
import sys
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CYCLE = int(sys.argv[1])
SOURCES = {
    'natura': f'c{CYCLE}/Natura c{CYCLE}.pdf',
    'avon': f'c{CYCLE}/Avon c{CYCLE}.pdf',
    'casa-estilo': f'c{CYCLE}/Outlet Casa y Estilo c{CYCLE}.pdf',
}
PAGES_LIMIT = 25 * 1024 * 1024  # Cloudflare Pages per-file limit


def render(page, width):
    pix = page.get_pixmap(matrix=pymupdf.Matrix(width / page.rect.width, width / page.rect.width), alpha=False)
    return Image.frombytes('RGB', [pix.width, pix.height], pix.samples)


def recompress(source, target, quality, max_side):
    """Re-encode large opaque images as JPEG; text and vector content are untouched.

    MuPDF's rewrite_images skips most images in these magazines (many small
    placements), so each image is re-encoded explicitly.
    """
    doc, done = pymupdf.open(source), set()
    for page in doc:
        for xref, smask, *_ in page.get_images(full=True):
            if xref in done: continue
            done.add(xref)
            raw = len(doc.xref_stream_raw(xref) or b'')
            if raw < 20000: continue
            pix = pymupdf.Pixmap(doc, xref)
            if pix.alpha or pix.n not in (1, 3, 4): continue
            if pix.n == 4: pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            image = Image.frombytes('L' if pix.n == 1 else 'RGB', [pix.width, pix.height], pix.samples)
            image.thumbnail((max_side, max_side), Image.LANCZOS)
            buffer = io.BytesIO()
            image.save(buffer, 'JPEG', quality=quality, optimize=True)
            if buffer.tell() < raw * 0.9: page.replace_image(xref, stream=buffer.getvalue())
    doc.save(target, garbage=4, deflate=True, use_objstms=1)


def compress(source, target):
    """Recompress embedded images until the copy fits the hosting limit, keeping text."""
    for quality, max_side in [(75, 2000), (65, 1600), (55, 1300)]:
        recompress(source, target, quality, max_side)
        if target.stat().st_size < PAGES_LIMIT: return f'JPEG q{quality}, max {max_side}px'
    raise SystemExit(f'{source.name}: copy still over 25 MiB')


for slug in sys.argv[2:] or SOURCES:
    source = ROOT / 'inputs' / SOURCES[slug]
    doc = pymupdf.open(source)
    out = ROOT / 'public' / 'catalogs' / slug
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob('*.webp'):
        if int(old.stem) > len(doc): old.unlink()  # pages from a longer previous cycle
    for number, page in enumerate(doc, 1):
        render(page, 703).save(out / f'{number}.webp', 'WEBP', quality=72, method=6)
    covers = ROOT / 'public' / 'covers'
    for old in covers.glob(f'{slug}-c*.jpg'): old.unlink()
    render(doc[0], 482).save(covers / f'{slug}-c{CYCLE}.jpg', 'JPEG', quality=82, optimize=True)
    pdf_dir = ROOT / 'public' / 'pdf'
    for old in pdf_dir.glob(f'{slug}-c*.pdf'): old.unlink()
    target = pdf_dir / f'{slug}-c{CYCLE}.pdf'
    if source.stat().st_size < PAGES_LIMIT:
        target.write_bytes(source.read_bytes())
        note = 'copied'
    else:
        note = f'{compress(source, target)}'
    print(slug, len(doc), 'pages;', f'{target.stat().st_size / 2**20:.1f} MiB', note, flush=True)
