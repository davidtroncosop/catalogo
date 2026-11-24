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
CYCLE = 18
# Manual corrections are tied to one campaign's pages and prices. Files are
# named per cycle so a new campaign never inherits another cycle's prices.
overrides_file = ROOT / 'scripts' / f'catalog-overrides-c{CYCLE}.json'
overrides = json.loads(overrides_file.read_text()) if overrides_file.exists() else {}
rules_file = ROOT / 'scripts' / f'catalog-reviewed-rules-c{CYCLE}.py'
reviewed_rules = runpy.run_path(str(rules_file))['RULES'] if rules_file.exists() else []
consultancy_names = {}
BRANDS = {'natura': 'Natura', 'avon': 'Avon', 'casa-estilo': 'Casa & Estilo'}
TITLES = {'natura': f'Revista Natura C{CYCLE}', 'avon': f'Revista Avon C{CYCLE}', 'casa-estilo': f'Outlet Casa y Estilo C{CYCLE}'}


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
        # Section page ranges of Natura C18.
        if 5 <= page <= 49: return 'Kits & Ofertas'
        if 57 <= page <= 83: return 'Perfumería'
        if 84 <= page <= 97: return 'Cuidado Facial'
        if 98 <= page <= 120: return 'Maquillaje'
        if 121 <= page <= 152: return 'Cabello'
        if page >= 196: return 'Hogar & Cocina'
    if slug == 'avon':
        # Section page ranges of Avon C18.
        if 6 <= page <= 23: return 'Kits & Ofertas'
        if 24 <= page <= 55: return 'Maquillaje'
        if 56 <= page <= 83: return 'Perfumería'
        if 84 <= page <= 107: return 'Cuidado Facial'
        if 128 <= page <= 131: return 'Cabello'
        if 132 <= page <= 145: return 'Hogar & Cocina'
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
        if re.search(r'\(\s*\d+\s*\)|\$|\d+\s*pts|^de$|^a$|descuento|\d+%|^\d{1,3}(?:\.\d{3})+$', value, re.I):
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
        if re.search(r'\bx\s*\d|\d\s*ml|\d\s*g\b|precio\s+x\b|\bx\s*(?:g|ml)\b', text, re.I): continue  # unit prices
        if re.search(r'ahorra', text, re.I): continue  # savings amounts, not prices
        for match in re.finditer(r'(?<!\d)(\d{1,3}(?:\.\d{3})+)(?!\d)', text):
            if not ('$' in text or re.fullmatch(r'(?:a\s*)?\d[\d.]*', text)):
                continue
            amount = int(match[1].replace('.', ''))
            if amount < 500 or amount > 200000: continue
            result.append({**line, 'amount': amount, 'original': bool(re.search(r'\bde\s*\$|/\s*\d+\s*pts|precio\s+regular', text, re.I))})
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
    # Multi-buy offers ("3 unidades a $16.780", "llevando 2", "3x2") print bundle
    # totals or conditional unit prices next to the product. Neither is the
    # single-unit retail price, so those products are sent to the magazine.
    cx, cy = chosen['bbox'][0], chosen['bbox'][1]
    if any(re.search(r'^\s*\d+\s*unidades\s*$|llevando|si llevas|\b\d\s*[x×]\s*\d\b|compra\s+\d', l['text'], re.I)
           and abs(l['bbox'][1] - cy) < 70 and abs(l['bbox'][0] - cx) < 90 for l in page['lines']):
        confident = False
    return chosen['amount'] if confident else 0, original if confident else 0, 'catalog' if confident else 'consult', [p['amount'] for p in ranked[:4]]


STOP = set('de del la las el los y e para con en a al un una sin por x c u cada uno ml g mg pts natura avon precio regular'.split())


def tokens(text):
    return {t for t in re.findall(r'[a-z0-9]+', norm(text)) if t not in STOP and len(t) > 1}


def name_price(page, code, name):
    """Second pass for shade grids: pick the price block whose printed product
    name (the lines above the amount) matches this SKU's official name.

    Only used when the layout pass is not confident. A block is accepted when
    it is the single best match and shares at least two words with the name;
    refills only match refill blocks, and multi-buy amounts are never used."""
    family = tokens(name.split(' — ')[0])
    if len(family) < 2: return None
    refill = 'repuesto' in family
    scored = []
    for v in prices_on(page):
        if v['original']: continue
        x, y = v['bbox'][:2]
        ctx = [l['text'] for l in page['lines'] if abs(l['bbox'][0] - x) < 12 and 0 < y - l['bbox'][1] < 60
               and not re.search(r'\$', l['text'])]
        text = ' '.join(ctx)
        if re.search(r'llevando\s*[2-9]|si llevas|\d+\s*unidades\b(?! de)|\b\d\s*[x×]\s*\d\b|2x1|compra\s+\d', text, re.I): continue
        words = tokens(text)
        if ('repuesto' in words) != refill: continue
        scored.append((len(family & words), v))
    if not scored: return None
    scored.sort(key=lambda t: -t[0])
    best, chosen = scored[0]
    if best < max(2, len(family) / 2) or any(sc == best and v['amount'] != chosen['amount'] for sc, v in scored[1:]): return None
    originals = [v for v in prices_on(page) if v['original'] and v['amount'] >= chosen['amount']
                 and abs(v['bbox'][1] - chosen['bbox'][1]) < 65 and abs(v['bbox'][0] - chosen['bbox'][0]) < 60]
    originals.sort(key=lambda v: abs(v['bbox'][1] - chosen['bbox'][1]) + 3 * abs(v['bbox'][0] - chosen['bbox'][0]))
    return chosen['amount'], originals[0]['amount'] if originals else chosen['amount']


products = []
audit_rows = []
for slug, catalog in evidence.items():
    for code, pages in catalog['codes'].items():
        # Teaser pages ("Imperdibles", indexes) show codes without prices. Use the
        # first page with a reviewed rule, then the first with a confident price.
        candidates_pages = [catalog['pages'][n - 1] for n in pages]
        page = (next((pg for pg in candidates_pages if any(r[0] == slug and r[1] == pg['page'] and re.match(r[2], code) for r in reviewed_rules)), None)
                or next((pg for pg in candidates_pages if price_for(pg, code)[2] == 'catalog'), None)
                or candidates_pages[0])
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
        matched_by_name = False
        if status == 'consult':
            by_name = name_price(page, code, name)
            if by_name:
                price, original = by_name
                status, matched_by_name = 'catalog', True
        for rule_slug, rule_page, pattern, family, sale, list_price in reviewed_rules:
            if rule_slug == slug and page['page'] == rule_page and re.match(pattern, code):
                price, original, status, matched_by_name = sale, list_price, 'catalog', False
                if not metadata.get('name') and not family.startswith('Código'):
                    tone_match = re.search(r'([^\n]+)\n\s*\(\s*' + code + r'\s*\)', page['text'])
                    tone = clean(tone_match[1]) if tone_match else ''
                    name = family + (f' — {tone}' if tone and len(tone) < 30 and '$' not in tone else '')
                break
        # Prices always come from this cycle's PDF. Names from the previous
        # catalogue are reused (same SKU), prices never are.
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
            'benefits': [f'Código de catálogo: {code}', f'Campaña C{CYCLE} · página {page["page"]}'],
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
                           'priceProvenance': 'consultancy-conditions' if p['priceStatus'] == 'consult' else
                            'pdf-name-match' if matched_by_name and 'price' not in override else 'reviewed-pdf' if 'price' in override or any(r[0] == slug and page['page'] == r[1] and re.match(r[2], code) for r in reviewed_rules) else 'pdf-layout'})

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
