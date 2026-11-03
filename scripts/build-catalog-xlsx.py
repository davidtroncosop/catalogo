"""Build the storefront catalogue from the cycle spreadsheet.

The spreadsheet (inputs/c<cycle>/*.xlsx) is the source for names, prices,
promotions, stock and descriptions. The cycle PDFs (tmp/catalog-audit/evidence.json,
from scripts/audit-catalog.py) provide shade names and confirm each code is
printed on the pages listed. Official photos come from official.json by SKU.

Usage: python3 scripts/build-catalog-xlsx.py
"""
import html
import json
import re
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
CYCLE = 17
WORK = ROOT / 'tmp' / 'catalog-audit'
XLSX = next((ROOT / 'inputs' / f'c{CYCLE}').glob('*.xlsx'))
evidence = json.loads((WORK / 'evidence.json').read_text())
official = json.loads((WORK / 'official.json').read_text())
image_checks = json.loads((WORK / 'image-checks.json').read_text())
verified_images = {c['key']: c['url'] for c in image_checks if c.get('status') == 200}

SLUGS = {'Natura': 'natura', 'Avon': 'avon', 'Casa & Estilo Outlet': 'casa-estilo'}
BRANDS = {'natura': 'Natura', 'avon': 'Avon', 'casa-estilo': 'Casa & Estilo'}
TITLES = {'natura': f'Revista Natura C{CYCLE}', 'avon': f'Revista Avon C{CYCLE}',
          'casa-estilo': f'Outlet Casa y Estilo C{CYCLE}'}
# Spreadsheet categories -> storefront categories.
CATEGORIES = {
    'Maquillaje': 'Maquillaje', 'Perfumería': 'Perfumería', 'Cabello': 'Cabello',
    'Rostro': 'Cuidado Facial', 'Protección Solar': 'Cuidado Facial',
    'Cuerpo': 'Cuerpo & Baño', 'Desodorante': 'Cuerpo & Baño', 'Jabones': 'Cuerpo & Baño',
    'Aceite': 'Cuerpo & Baño', 'Tododia': 'Cuerpo & Baño', 'Barba': 'Cuerpo & Baño',
    'Cuidados Para El Hombre': 'Cuerpo & Baño', 'Niñez': 'Cuerpo & Baño',
    'Casa': 'Hogar & Cocina', 'Niñez Hogar': 'Hogar & Cocina', 'Niñez Moda': 'Hogar & Cocina',
    'Bienestar': 'Hogar & Cocina', 'Accesorios': 'Hogar & Cocina', 'Otros': 'Hogar & Cocina',
    'Regalos': 'Kits & Ofertas',
}


def clean(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', ' ', str(s or '')))).strip()


def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if not unicodedata.combining(c))


def money(n):
    return f'{n:,}'.replace(',', '.')


def category(excel_category, name):
    if re.search(r'^kit\b|\bkit de\b', norm(name)): return 'Kits & Ofertas'
    if excel_category not in CATEGORIES: raise SystemExit(f'Unmapped category: {excel_category}')
    return CATEGORIES[excel_category]


def tone_for(slug, code, pages):
    """Shade printed right above the code in the PDF, e.g. 'rojo 2m\\n(140032)'."""
    for number in pages:
        text = evidence[slug]['pages'][number - 1]['text']
        # Shade on the same line ('Rosa Verano (184840)') or on the line above.
        same_line = re.search(r'([^\n(]*?)\s*\(\s*' + code + r'\s*\)', text)
        above = re.search(r'([^\n]+)\n\s*\(\s*' + code + r'\s*\)', text)
        tone = clean(same_line[1]) if same_line and len(clean(same_line[1])) > 2 else clean(above[1]) if above else ''
        if tone and len(tone) < 30 and not re.search(r'\$|\d+\s*%|^\(?\d+\)?$', tone):
            return tone[0].upper() + tone[1:]
    return ''


def page_for(slug, code, pages, price):
    """Prefer the last listed page that prints both the code and this price.

    Early pages are often covers or teasers; the product's section page comes later.
    """
    printed = [n for n in pages if money(price) in evidence[slug]['pages'][n - 1]['text']]
    return (printed or pages)[-1]


wb = openpyxl.load_workbook(XLSX, read_only=True)
header, *rows = list(wb['Todos'].iter_rows(values_only=True))
col = {name: i for i, name in enumerate(header)}
# Reviewed corrections and PDF-only codes, each with the page that justifies it.
overrides_file = ROOT / 'scripts' / f'catalog-overrides-c{CYCLE}.json'
overrides = json.loads(overrides_file.read_text()) if overrides_file.exists() else {}
corrected = set()
for i, r in enumerate(rows):
    key = f'{SLUGS[r[col["Revista"]]]}-{str(r[col["Código"]]).strip()}'
    if key in overrides.get('corrections', {}):
        r = list(r)
        for field, value in overrides['corrections'][key].items():
            if not field.startswith('_'): r[col[field]] = value
        rows[i] = tuple(r)
        corrected.add(key)
missing_corrections = set(overrides.get('corrections', {})) - corrected
assert not missing_corrections, f'Corrections for codes not in spreadsheet: {missing_corrections}'
for extra in overrides.get('additions', []):
    rows.append(tuple(extra.get(name) for name in header))
added = {f'{SLUGS[a["Revista"]]}-{a["Código"]}' for a in overrides.get('additions', [])}
names_count = {}
for r in rows:
    key = (r[col['Revista']], clean(r[col['Producto']]))
    names_count[key] = names_count.get(key, 0) + 1

products, audit_rows = [], []
for r in rows:
    get = lambda name: r[col[name]]
    slug = SLUGS[get('Revista')]
    code = str(get('Código')).strip()
    pages = sorted({int(p) for p in str(get('Página(s)')).split(',')})
    pdf_pages = evidence[slug]['codes'].get(code, [])
    price, original = int(get('Precio final')), int(get('Precio normal') or get('Precio final'))
    page = page_for(slug, code, pages, price)
    metadata = official.get(f'{slug}:{code}') or {}
    base_name = clean(get('Producto'))
    name = base_name
    if names_count[(get('Revista'), base_name)] > 1:
        # Shades share a product name; tell them apart by the printed shade.
        variant = clean(metadata.get('variant')) or tone_for(slug, code, pages)
        if variant and norm(variant) not in norm(name): name += f' — {variant}'
    description = clean(get('Descripción'))
    official_description = clean(metadata.get('description'))
    if len(description) >= 300:  # the spreadsheet truncates long descriptions
        if len(official_description) > len(description): description = official_description
        else: description = description.rstrip(' .,;') + '…'
    if not description:
        description = official_description or f'{name}. Código {code}. Consulta los detalles en {TITLES[slug]}, página {page}.'
    promotion = clean(get('Promoción'))
    in_stock = clean(get('Sin stock')).lower() not in ('sí', 'si')
    fallback = f'/catalogs/{slug}/{page}.webp'
    image = verified_images.get(f'{slug}:{code}')
    p = {
        'id': f'{slug}-{code}', 'code': code, 'name': name,
        'brand': BRANDS[slug], 'category': category(get('Categoría'), base_name),
        'price': price, 'originalPrice': max(original, price), 'priceStatus': 'catalog',
        'discountPercent': round((1 - price / original) * 100) if original > price else 0,
        'rating': 0, 'reviewsCount': 0, 'image': image or fallback, 'imageFallback': fallback,
        'imageSource': 'official' if image else 'catalog',
        'sourceUrl': metadata.get('sourceUrl') if not metadata.get('unavailable') else None,
        'imageSourceUrl': metadata.get('imageSourceUrl') if image else None,
        'catalogSlug': slug, 'catalogTitle': TITLES[slug], 'page': page, 'catalogPages': pages,
        'description': description,
        'benefits': [f'Código de catálogo: {code}', f'Campaña C{CYCLE} · página {page}'],
        'inStock': in_stock,
    }
    if promotion:
        p['benefits'].append(f'Promoción: {promotion}')
        p['badge'] = 'Promoción'
    if not in_stock:
        p['badge'] = 'Sin stock'
    products.append(p)
    audit_rows.append({'id': p['id'], 'page': page, 'name': name, 'price': price,
                       'priceStatus': 'catalog',
                       'priceProvenance': 'reviewed-pdf' if p['id'] in corrected | added else 'spreadsheet',
                       'priceOnPdfPage': money(price) in evidence[slug]['pages'][page - 1]['text'],
                       'codeOnPdfPages': sorted(set(pages) & set(pdf_pages)) == pages,
                       'imageSource': p['imageSource'], 'inStock': in_stock, 'promotion': promotion or None})

ids = [p['id'] for p in products]
assert len(ids) == len(set(ids)), 'Duplicate codes in spreadsheet'
products.sort(key=lambda p: (list(BRANDS).index(p['catalogSlug']), p['page'], p['name'], p['code']))
(ROOT / 'src' / 'data' / 'catalog.json').write_text(json.dumps(products, ensure_ascii=False, indent=2) + '\n')
(ROOT / 'src' / 'data' / 'products.ts').write_text(
    f"// Generated from inputs/c{CYCLE}/*.xlsx. See scripts/build-catalog-xlsx.py and docs/catalog-audit.json.\n"
    "import type { Product } from '../types';\nimport catalog from './catalog.json';\n\n"
    "export const PRODUCTS = catalog as Product[];\n")
report = {'source': XLSX.name, 'catalogs': {}, 'rows': audit_rows}
for slug, data in evidence.items():
    selected = [p for p in products if p['catalogSlug'] == slug]
    codes = {p['code'] for p in selected}
    rows_slug = [a for a in audit_rows if a['id'].startswith(f'{slug}-')]
    report['catalogs'][slug] = {
        'file': data['filename'], 'pages': len(data['pages']), 'spreadsheetCodes': len(codes),
        'pdfCodes': len(data['codes']),
        'pdfOnlyCodes': sorted(set(data['codes']) - codes),
        'spreadsheetOnlyCodes': sorted(codes - set(data['codes'])),
        'priceNotOnPage': sorted(a['id'] for a in rows_slug if not a['priceOnPdfPage']),
        'officialImages': sum(p['imageSource'] == 'official' for p in selected),
        'catalogImages': sum(p['imageSource'] == 'catalog' for p in selected),
        'outOfStock': sum(not p['inStock'] for p in selected),
        'promotions': sum('badge' in p for p in selected),
    }
(ROOT / 'docs' / 'catalog-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
verified = [c for c in image_checks if c.get('status') == 200]
(ROOT / 'docs' / 'product-image-sources.json').write_text(json.dumps(verified, ensure_ascii=False, indent=2) + '\n')
summary = {s: {k: (len(v) if isinstance(v, list) else v) for k, v in c.items()} for s, c in report['catalogs'].items()}
print(json.dumps(summary, ensure_ascii=False, indent=2))
print('Total products:', len(products))
