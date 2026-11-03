import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const products = JSON.parse(fs.readFileSync('src/data/catalog.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('docs/catalog-audit.json', 'utf8'));
const imageSources = JSON.parse(fs.readFileSync('docs/product-image-sources.json', 'utf8'));
const imageByKey = new Map(imageSources.map(i => [i.key, i]));
assert.equal(new Set(products.map(p => p.id)).size, products.length, 'Duplicate product IDs');
const categories = new Set(['Perfumería', 'Cuidado Facial', 'Cuerpo & Baño', 'Maquillaje', 'Cabello', 'Hogar & Cocina', 'Kits & Ofertas']);
for (const p of products) {
  assert(categories.has(p.category), `Invalid category: ${p.id}`);
  assert(p.name.length > 3 && !/Producto Catálogo|^\d+[.\d]*$/.test(p.name), `Missing product name: ${p.id}`);
  assert(p.catalogPages.includes(p.page), `Wrong source page: ${p.id}`);
  assert(fs.existsSync(`public${p.imageFallback}`), `Missing catalogue image: ${p.id}`);
  assert(Number.isInteger(p.price) && p.price >= 0 && p.originalPrice >= p.price, `Invalid price: ${p.id}`);
  if (p.priceStatus === 'consult') assert.equal(p.price, 0);
  else assert(p.price > 0, `Free product: ${p.id}`);
  if (p.imageSource === 'official') {
    const url = new URL(p.image);
    assert.equal(url.protocol, 'https:');
    assert(['production.na01.natura.com', 'cdn.shopify.com'].includes(url.hostname));
    const source = imageByKey.get(`${p.catalogSlug}:${p.code}`);
    assert.equal(source?.url, p.image, `Unverified public photo: ${p.id}`);
    assert.equal(source.status, 200);
    assert(source.type.startsWith('image/') && source.bytes > 1000);
  } else {
    assert.equal(p.image, p.imageFallback);
  }
}
for (const [slug, entry] of Object.entries(audit.catalogs)) {
  const selected = products.filter(p => p.catalogSlug === slug);
  assert.equal(selected.length, entry.spreadsheetCodes);
  // Every code printed in the PDF must be sold; codes only in the spreadsheet are reported.
  assert.deepEqual(entry.pdfOnlyCodes, [], `PDF codes missing from catalogue: ${slug}`);
  assert.deepEqual(entry.priceNotOnPage, [], `Price not printed on source page: ${slug}`);
  assert.deepEqual(selected.map(p => p.id).sort(), audit.rows.filter(r => r.id.startsWith(`${slug}-`)).map(r => r.id).sort());
}
for (const p of products.filter(p => !p.inStock)) assert.equal(p.badge, 'Sin stock', `Out of stock without badge: ${p.id}`);
// Independent, visually checked examples against the C17 PDFs: spreadsheet errors
// (avon-161762 copied a kit price), PDF-only codes, hidden PDF layers (172907).
const expected = {
  'natura-200641': [9790, 133], 'natura-200645': [7890, 133],
  'natura-280353': [27890, 173], 'avon-184840': [3390, 44],
  'avon-245293': [6290, 36], 'avon-161762': [9990, 27],
  'avon-279655': [8290, 21], 'avon-199158': [5990, 14],
  'casa-estilo-170669': [12990, 13], 'casa-estilo-172907': [2990, 12],
  'casa-estilo-171045': [10990, 5],
};
for (const [id, sample] of Object.entries(expected)) {
  const p = products.find(p => p.id === id);
  assert.deepEqual([p?.price, p?.page], sample, `PDF regression: ${id}`);
}
const files = {'c17/Natura c17.pdf':'natura-c17.pdf', 'c17/Avon c17.pdf':'avon-c17.pdf', 'c17/Outlet Casa y Estilo c17.pdf':'casa-estilo-c17.pdf'};
const pdfChecks = JSON.parse(fs.readFileSync('docs/pdf-source-checks.json', 'utf8'));
for (const [input, published] of Object.entries(files)) {
  if (fs.existsSync(`inputs/${input}`)) {
    const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    const check = pdfChecks.find(c => c.source === input && c.copy === published);
    assert.equal(hash(`inputs/${input}`), check?.sourceSha256, `Source PDF changed: ${input}`);
    assert.equal(hash(`public/pdf/${published}`), check?.copySha256, `PDF copy changed: ${input}`);
  }
}
console.log(`OK: ${products.length} products, complete catalogue coverage, ${imageSources.length} verified public images, ${Object.keys(expected).length} PDF examples.`);
