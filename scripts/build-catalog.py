"""Build traceable campaign records; uncertain prices require catalogue consultation.

Uses PDF geometry to associate printed amounts and product codes. Official web
metadata is matched by SKU, never by a fuzzy name. Review overrides are explicit.
"""
import html
import json
import re
import unicodedata
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'tmp' / 'catalog-audit'
evidence = json.loads((WORK / 'evidence.json').read_text())
official = json.loads((WORK / 'official.json').read_text())
existing = json.loads((WORK / 'existing.json').read_text())
existing_by_id = {f'{p["catalogSlug"]}-{p["code"]}': p for p in existing}
overrides_file = ROOT / 'scripts' / 'catalog-overrides.json'
overrides = json.loads(overrides_file.read_text()) if overrides_file.exists() else {}
reviewed_rules = runpy.run_path(str(ROOT / 'scripts' / 'catalog-reviewed-rules.py'))['RULES']
consultancy_names = json.loads((ROOT / 'scripts' / 'consultancy-names.json').read_text())
for code, (name, price, original, group) in json.loads((ROOT / 'scripts' / 'avon-reviewed.json').read_text()).items():
    overrides[f'avon-{code}'] = {'name': name, 'price': price, 'originalPrice': original, 'category': group}
BRANDS = {'natura': 'Natura', 'avon': 'Avon', 'casa-estilo': 'Casa & Estilo', 'ciclo-14': 'Mi Consultoría'}
TITLES = {'natura': 'Revista Natura C14', 'avon': 'Revista Avon C14', 'casa-estilo': 'Casa y Estilo C14', 'ciclo-14': 'Mi Consultoría Ciclo 14'}


def clean(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', ' ', s or ''))).strip()


def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if not unicodedata.combining(c))


def category(slug, page, name):
    n = norm(name)
    if slug == 'casa-estilo': return 'Hogar & Cocina'
    if slug == 'ciclo-14' or re.search(r'\bkit\b', n): return 'Kits & Ofertas'
    if re.search(r'shampoo|acondicionador|cabell|capilar|peinar|antiquiebre|anticaspa', n): return 'Cabello'
    if re.search(r'labial|labios|delineador|base |corrector|rubor|maquillaje|unas|esmalte|pestanas|sombra|polvo compacto', n): return 'Maquillaje'
    if re.search(r'facial|rostro|chronos|anew|micelar', n): return 'Cuidado Facial'
    if re.search(r'eau de|\bedp\b|\bedt\b|perfume|colonia|perfumeria|body splash|frescor', n): return 'Perfumería'
    if re.search(r'home spray|difusor|vela|botella|bolsa|mochila|plato|cocina|taza|organizador|huerto|neceser|cuaderno|lonchera|cartuchera', n): return 'Hogar & Cocina'
    if slug == 'natura':
        if 32 <= page <= 60: return 'Perfumería'
        if 63 <= page <= 78: return 'Cuidado Facial'
        if 82 <= page <= 103: return 'Maquillaje'
        if 115 <= page <= 137: return 'Cabello'
        if page >= 173: return 'Hogar & Cocina'
    return 'Cuerpo & Baño'


def anchor_for(page, code):
    return next((line for line in page['lines'] if re.search(r'(?<!\d)' + re.escape(code) + r'(?!\d)', line['text'])), None)


def pdf_name(page, code):
    anchor = anchor_for(page, code)
    if not anchor: return ''
    x, y, _, _ = anchor['bbox']
    lines = [l for l in page['lines'] if abs(l['bbox'][0] - x) < 22 and 0 <= y - l['bbox'][1] < 95]
    lines.sort(key=lambda l: l['bbox'][1], reverse=True)
    result = []
    for line in lines:
        value = line['text']
        if line == anchor: continue
        if re.search(r'\(\s*\d+\s*\)|\$|\d+\s*pts|^de$|^a$|descuento|\d+%', value, re.I):
            if result: break
            continue
        if re.search(r'^stock|^favorito|^natura$|^producto$|^con repuesto$|^intensidad|^nuevo envase', value, re.I): continue
        if len(value) > 70: break
        result.insert(0, value)
        if len(result) >= 5: break
    return clean(' '.join(result))


def prices_on(page):
    result = []
    for line in page['lines']:
        text = line['text']
        if re.search(r'\bx\s*\d|\d\s*ml|\d\s*g\b', text, re.I): continue  # unit prices
        for match in re.finditer(r'(?<!\d)(\d{1,3}(?:\.\d{3})+)(?!\d)', text):
            if not ('$' in text or re.fullmatch(r'(?:a\s*)?\d[\d.]*', text)):
                continue
            amount = int(match[1].replace('.', ''))
            if amount < 500 or amount > 200000: continue
            result.append({**line, 'amount': amount, 'original': bool(re.search(r'\bde\s*\$|/\s*\d+\s*pts', text))})
    return result


def price_for(page, code):
    anchor = anchor_for(page, code)
    values = prices_on(page)
    if not anchor or not values: return 0, 0, 'consult', []
    sales = [v for v in values if not v['original']]
    if not sales: return 0, 0, 'consult', []
    x, y, x2, _ = anchor['bbox']
    def distance(v):
        bx, by, bx2, _ = v['bbox']
        gap = max(0, x - bx2, bx - x2)
        return abs(y - by) + gap * 3
    ranked = sorted(sales, key=distance)
    chosen = ranked[0]
    # Codes grouped as color swatches often share a price far above the swatches.
    # Only accept those automatically when the entire page has one sale amount.
    distinct = {p['amount'] for p in sales}
    alternatives = [p for p in ranked[1:] if p['amount'] != chosen['amount']]
    confident = len(distinct) == 1 or (distance(chosen) < 85 and (not alternatives or distance(alternatives[0]) - distance(chosen) > 24))
    originals = [p for p in values if p['original'] and p['amount'] >= chosen['amount']]
    originals.sort(key=lambda v: abs(v['bbox'][1] - chosen['bbox'][1]) + 3 * abs(v['bbox'][0] - chosen['bbox'][0]))
    original = chosen['amount']
    if originals and abs(originals[0]['bbox'][1] - chosen['bbox'][1]) < 65 and abs(originals[0]['bbox'][0] - chosen['bbox'][0]) < 60:
        original = originals[0]['amount']
    return chosen['amount'] if confident else 0, original if confident else 0, 'catalog' if confident else 'consult', [p['amount'] for p in ranked[:4]]


products = []
audit_rows = []
for slug, catalog in evidence.items():
    for code, pages in catalog['codes'].items():
        page = catalog['pages'][pages[0] - 1]
        if slug == 'casa-estilo':
            page = next((catalog['pages'][n-1] for n in pages if prices_on(catalog['pages'][n-1])), page)
        metadata = official.get(f'{slug}:{code}') or {}
        # Consultancy codes identify conditional bundles, not individual retail SKUs.
        previous = existing_by_id.get(f'{slug}-{code}', {})
        name = clean(metadata.get('name') or previous.get('name') or pdf_name(page, code))
        if slug == 'ciclo-14' and code in consultancy_names:
            name = consultancy_names[code]
        if not name or len(name) < 4: name = f'{BRANDS[slug]} · Código {code}'
        variant = clean(metadata.get('variant'))
        if variant and norm(variant) not in norm(name): name += f' — {variant}'
        price, original, status, candidates = price_for(page, code)
        if slug == 'natura':
            for rule_page, pattern, family, sale, list_price in reviewed_rules:
                if page['page'] == rule_page and re.match(pattern, code):
                    price, original, status = sale, list_price, 'catalog'
                    if not metadata.get('name'):
                        tone_match = re.search(r'([^\n]+)\n\s*\(\s*' + code + r'\s*\)', page['text'])
                        tone = clean(tone_match[1]) if tone_match else ''
                        name = family + (f' — {tone}' if tone and len(tone) < 30 and '$' not in tone else '')
                    break
        # Existing Avon retail prices are outside the scope of this import. Keep
        # them unless a manually reviewed PDF override explicitly corrects one.
        if slug == 'avon' and previous:
            price, original, status = previous['price'], previous['originalPrice'], 'catalog'
        if slug == 'ciclo-14': price, original, status = 0, 0, 'consult'
        image = metadata.get('image') or f'/catalogs/{slug}/{page["page"]}.webp'
        fallback = f'/catalogs/{slug}/{page["page"]}.webp'
        p = {
            'id': f'{slug}-{code}', 'code': code, 'name': name,
            'brand': BRANDS[slug], 'category': category(slug, page['page'], name + ' ' + metadata.get('category', '')),
            'price': price, 'originalPrice': original, 'priceStatus': status,
            'discountPercent': round((1-price/original)*100) if original else 0,
            'rating': 0, 'reviewsCount': 0, 'image': image, 'imageFallback': fallback,
            'imageSource': 'official' if metadata.get('image') else 'catalog',
            'sourceUrl': metadata.get('sourceUrl') if not metadata.get('unavailable') else None,
            'imageSourceUrl': metadata.get('imageSourceUrl'),
            'catalogSlug': slug, 'catalogTitle': TITLES[slug], 'page': page['page'], 'catalogPages': pages,
            'description': clean(metadata.get('description')) or f'{name}. Código {code}. Consulta los detalles en {TITLES[slug]}, página {page["page"]}.',
            'benefits': [f'Código de catálogo: {code}', f'Campaña C14 · página {page["page"]}'],
            'inStock': True,
        }
        if slug == 'ciclo-14':
            p['benefits'].append('Promoción para consultoras: revisa requisitos, nivel y pedido mínimo en la revista.')
        override = overrides.get(p['id'], {})
        p.update(override)
        p['imageFallback'] = f'/catalogs/{slug}/{p["page"]}.webp'
        if p['imageSource'] == 'catalog': p['image'] = p['imageFallback']
        if 'price' in override:
            p['originalPrice'] = override.get('originalPrice', p['price'])
            p['priceStatus'] = override.get('priceStatus', 'catalog')
            p['discountPercent'] = round((1 - p['price'] / p['originalPrice']) * 100) if p['originalPrice'] else 0
        if 'name' in override and 'description' not in override and not metadata.get('description'):
            p['description'] = f'{p["name"]}. Código {code}. Consulta los detalles en {TITLES[slug]}, página {p["page"]}.'
        products.append(p)
        audit_rows.append({'id': p['id'], 'page': p['page'], 'name': p['name'], 'price': p['price'],
                           'priceStatus': p['priceStatus'], 'candidates': candidates,
                           'imageSource': p['imageSource'], 'officialName': bool(metadata.get('name')),
                           'priceProvenance': 'retained-existing' if slug == 'avon' and 'price' not in override else
                            'consultancy-conditions' if p['priceStatus'] == 'consult' else
                            'reviewed-pdf' if 'price' in override or (slug == 'natura' and any(page['page'] == r[0] and re.match(r[1], code) for r in reviewed_rules)) else 'pdf-layout'})

# Stable magazine order makes discovery predictable, including variants.
products.sort(key=lambda p: (list(BRANDS).index(p['catalogSlug']), p['page'], p['name'], p['code']))
target = ROOT / 'src' / 'data' / 'products.ts'
(ROOT / 'src' / 'data' / 'catalog.json').write_text(json.dumps(products, ensure_ascii=False, indent=2) + '\n')
target.write_text("// Generated from inputs/*.pdf. See scripts/build-catalog.py and docs/catalog-audit.json.\nimport type { Product } from '../types';\nimport catalog from './catalog.json';\n\nexport const PRODUCTS = catalog as Product[];\n")
report = {'catalogs': {}, 'rows': audit_rows}
for slug, data in evidence.items():
    selected = [p for p in products if p['catalogSlug'] == slug]
    web_codes = {p['code'] for p in selected}
    report['catalogs'][slug] = {
        'file': data['filename'], 'pages': len(data['pages']), 'pdfCodes': len(data['codes']),
        'webCodes': len(web_codes), 'missingCodes': sorted(set(data['codes']) - web_codes),
        'officialImages': sum(p['imageSource'] == 'official' for p in selected),
        'catalogImages': sum(p['imageSource'] == 'catalog' for p in selected),
        'pricesToConsult': sum(p['priceStatus'] == 'consult' for p in selected),
        'removedUnverifiedCodes': data['unverifiedExisting'],
    }
(ROOT / 'docs').mkdir(exist_ok=True)
(ROOT / 'docs' / 'catalog-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
image_checks = WORK / 'image-checks.json'
if image_checks.exists():
    verified = [p for p in json.loads(image_checks.read_text()) if p.get('status') == 200]
    (ROOT / 'docs' / 'product-image-sources.json').write_text(json.dumps(verified, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report['catalogs'], ensure_ascii=False, indent=2))
print('Total products:', len(products))
