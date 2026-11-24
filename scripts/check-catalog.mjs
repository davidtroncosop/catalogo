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
  // Every code printed in the cycle PDF is sold, and nothing else.
  assert.equal(selected.length, entry.pdfCodes);
  assert.deepEqual(entry.missingCodes, [], `PDF codes missing from catalogue: ${slug}`);
  assert.deepEqual(selected.map(p => p.id).sort(), audit.rows.filter(r => r.id.startsWith(`${slug}-`)).map(r => r.id).sort());
}
for (const p of products.filter(p => !p.inStock)) assert.equal(p.badge, 'Sin stock', `Out of stock without badge: ${p.id}`);
// Independent examples read on the C18 pages: refills next to the full product
// (173602, 118996), 2x1 offers priced per unit (135580), a gift priced on the
// previous page (270016), shade grids (191617, 135425) and odd printed amounts.
const expected = {
  'natura-173602': [15290, 102], 'natura-191617': [21990, 102],
  'natura-118996': [15990, 80], 'natura-73572': [23490, 80],
  'natura-270016': [36290, 41], 'natura-204118': [530, 49],
  'avon-135580': [6990, 51], 'avon-135425': [4990, 54],
  'avon-135146': [5290, 129], 'avon-224050': [3990, 103],
  'avon-261992': [13509, 44],
  'casa-estilo-158449': [7990, 9], 'casa-estilo-172906': [4790, 16],
};
for (const [id, sample] of Object.entries(expected)) {
  const p = products.find(p => p.id === id);
  assert.deepEqual([p?.price, p?.page], sample, `PDF regression: ${id}`);
}
const files = {'c18/Natura c18.pdf':'natura-c18.pdf', 'c18/Avon c18.pdf':'avon-c18.pdf', 'c18/Outlet Casa y Estilo c18.pdf':'casa-estilo-c18.pdf'};
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
