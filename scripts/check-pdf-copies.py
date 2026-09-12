"""Check optimised PDF copies by text or rendered thumbnails, not binary identity."""
import hashlib
import json
from pathlib import Path

import pymupdf
from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[1]
FILES = {'Natura c14.pdf': 'natura-c14.pdf', 'Avon c14.pdf': 'avon-c14.pdf',
         'Casa y Estilo c14.pdf': 'casa-estilo-c14.pdf', 'Ciclo_14.pdf': 'ciclo-14.pdf'}
results = []
for source, copy in FILES.items():
    source_path, copy_path = ROOT / 'inputs' / source, ROOT / 'public' / 'pdf' / copy
    a, b = pymupdf.open(source_path), pymupdf.open(copy_path)
    assert len(a) == len(b), source
    max_error, raster_pages = 0, 0
    for pa, pb in zip(a, b):
        if pa.get_text() == pb.get_text(): continue
        images = []
        for page in [pa, pb]:
            pix = page.get_pixmap(matrix=pymupdf.Matrix(160 / page.rect.width, 200 / page.rect.height), alpha=False)
            images.append(Image.frombytes('RGB', [pix.width, pix.height], pix.samples).resize((160, 200)))
        error = sum(ImageStat.Stat(ImageChops.difference(*images)).mean) / 3
        max_error = max(error, max_error)
        raster_pages += 1
        assert error < 12, f'{source}, page {pa.number + 1}: visual difference {error}'
    results.append({'source': source, 'copy': copy, 'pages': len(a), 'rasterPages': raster_pages,
                    'maxThumbnailDifference': round(max_error, 3),
                    'sourceSha256': hashlib.sha256(source_path.read_bytes()).hexdigest(),
                    'copySha256': hashlib.sha256(copy_path.read_bytes()).hexdigest()})
    print(source, 'OK', len(a), 'pages; max visual difference', round(max_error, 3), flush=True)
(ROOT / 'docs' / 'pdf-source-checks.json').write_text(json.dumps(results, indent=2) + '\n')
