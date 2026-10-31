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
  assert.equal(selected.length, entry.pdfCodes);
  assert.deepEqual(entry.missingCodes, []);
  assert.deepEqual(selected.map(p => p.id).sort(), audit.rows.filter(r => r.id.startsWith(`${slug}-`)).map(r => r.id).sort());
}
// Independent, manually read examples protect against wrong shade pricing,
// conditional multi-buy prices (natura-2179 is a 3x2 offer) and teaser pages.
const expected = {
  'natura-69825': [17990, 149], 'natura-189406': [8390, 169],
  'natura-148176': [7990, 125], 'natura-74852': [10990, 161],
  'natura-148411': [6390, 114], 'natura-2179': [0, 172],
  'avon-152799': [13490, 55], 'avon-127151': [1990, 112],
  'avon-245294': [4690, 5], 'avon-135619': [4590, 27],
  'casa-estilo-158449': [10990, 15], 'casa-estilo-171043': [5990, 6],
  'casa-estilo-187322': [9190, 3],
};
for (const [id, sample] of Object.entries(expected)) {
  const p = products.find(p => p.id === id);
  assert.deepEqual([p?.price, p?.page], sample, `PDF regression: ${id}`);
}
const files = {'Natura c16.pdf':'natura-c16.pdf', 'Avon c16.pdf':'avon-c16.pdf', 'Casa y Estilo c16.pdf':'casa-estilo-c16.pdf'};
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
