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
// conditional multi-buy prices, teaser pages, and cross-catalogue bundle mixing.
const expected = {
  'natura-228525': [20990, 8], 'natura-248629': [20990, 8],
  'natura-108125': [11190, 84], 'natura-110182': [17190, 84],
  'natura-107123': [10790, 87], 'natura-122120': [10990, 87],
  'natura-70389': [5690, 145], 'natura-189401': [8390, 163],
  'natura-204118': [530, 26], 'natura-267136': [11090, 119],
  'avon-201699': [8590, 20], 'avon-268709': [11590, 120],
  'casa-estilo-158307': [11990, 17], 'casa-estilo-172906': [4790, 13],
  'ciclo-14-268709': [0, 23], 'ciclo-14-160310': [540, 28],
};
for (const [id, sample] of Object.entries(expected)) {
  const p = products.find(p => p.id === id);
  assert.deepEqual([p?.price, p?.page], sample, `PDF regression: ${id}`);
}
const files = {'Natura c14.pdf':'natura-c14.pdf', 'Avon c14.pdf':'avon-c14.pdf', 'Casa y Estilo c14.pdf':'casa-estilo-c14.pdf', 'Ciclo_14.pdf':'ciclo-14.pdf'};
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
