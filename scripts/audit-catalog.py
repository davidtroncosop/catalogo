"""Extract campaign evidence by printed product code (requires PyMuPDF)."""
import json
import re
import subprocess
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp' / 'catalog-audit'
OUT.mkdir(parents=True, exist_ok=True)
CATALOGS = {
    'natura': 'Natura c14.pdf',
    'avon': 'Avon c14.pdf',
    'casa-estilo': 'Casa y Estilo c14.pdf',
    'ciclo-14': 'Ciclo_14.pdf',
}

catalog_json = ROOT / 'src' / 'data' / 'catalog.json'
existing = json.loads(catalog_json.read_text()) if catalog_json.exists() else json.loads(subprocess.check_output([
    'node', '--experimental-strip-types', '--input-type=module', '-e',
    "import {PRODUCTS} from './src/data/products.ts'; console.log(JSON.stringify(PRODUCTS))",
], cwd=ROOT, text=True))
# Keep the original comparison baseline across successive audit/build iterations.
if not (OUT / 'existing.json').exists():
    (OUT / 'existing.json').write_text(json.dumps(existing, ensure_ascii=False, indent=2))
evidence = {}
for slug, filename in CATALOGS.items():
    doc = pymupdf.open(ROOT / 'inputs' / filename)
    pages = []
    codes = {}
    for number, page in enumerate(doc, 1):
        text = page.get_text()
        lines = []
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines', []):
                value = ''.join(span['text'] for span in line['spans']).strip()
                if value:
                    lines.append({'text': value, 'bbox': list(line['bbox']),
                                  'size': max(s['size'] for s in line['spans'])})
        found = set(re.findall(r'\(\s*(\d{2,7})\s*\)', text))
        # The consultancy guide also prints order codes without parentheses.
        if slug == 'ciclo-14':
            found.update(re.findall(r'(?m)^\s*(\d{5,6})\s*$', text))
            found.update(re.findall(r'(\d{5,6})\s*-\s*\d+\s*pts', text))
        for code in sorted(found):
            codes.setdefault(code, []).append(number)
        pages.append({'page': number, 'width': page.rect.width, 'height': page.rect.height,
                      'text': text, 'lines': lines, 'codes': sorted(found)})
    current = {p['code'] for p in existing if p['catalogSlug'] == slug}
    evidence[slug] = {'filename': filename, 'pages': pages, 'codes': codes,
                      'missing': sorted(set(codes) - current),
                      'unverifiedExisting': sorted(current - set(codes))}
    print(slug, json.dumps({'pages': len(pages), 'pdfCodes': len(codes),
                            'existing': len(current), 'missing': len(set(codes) - current),
                            'unverifiedExisting': len(current - set(codes))}))
(OUT / 'evidence.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=2))
