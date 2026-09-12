// Refresh public official product metadata. Never import storefront prices:
// this shop sells the PDF campaign, which can have different prices and offers.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('tmp/catalog-audit');
const evidence = JSON.parse(fs.readFileSync(path.join(dir, 'evidence.json'), 'utf8'));
const output = path.join(dir, 'official.json');
const official = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : {};
const save = () => fs.writeFileSync(output, JSON.stringify(official, null, 2) + '\n');

async function request(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

function findVariant(html, code) {
  const chunks = [...html.matchAll(/self\.__next_f\.push\((\[1,.*?\])\)<\/script>/gs)]
    .flatMap(m => { try { return [JSON.parse(m[1])[1]]; } catch { return []; } }).join('');
  const candidates = [];
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.productId === `NATCHL-${code}` && value.name && (value.image || value.images)) candidates.push(value);
    for (const child of Object.values(value)) visit(child);
  }
  for (const line of chunks.split('\n')) {
    try { visit(JSON.parse(line.slice(line.indexOf(':') + 1))); } catch { /* React stream instructions */ }
  }
  return candidates.find(p => p.image && p.sharedColorDescription) || candidates.find(p => p.image) || candidates[0];
}

for (let page = 1; page <= 10; page++) {
  const { products } = await (await request(`https://www.avon.cl/products.json?limit=250&page=${page}`)).json();
  for (const product of products) {
    for (const variant of product.variants) {
      const code = variant.sku?.trim();
      if (!code) continue;
      const picture = product.images.find(i => i.variant_ids.includes(variant.id)) || product.images[0];
      // The official store has "pronto" placeholders. They are not product photos.
      const image = picture && !/pronto|coming.?soon/i.test(picture.src) ? picture.src : null;
      official[`avon:${code}`] = {
        code, brand: 'Avon', name: product.title,
        variant: variant.title === 'Default Title' ? '' : variant.title,
        description: (product.body_html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        category: product.product_type, image,
        sourceUrl: `https://www.avon.cl/products/${product.handle}`,
      };
    }
  }
  save();
  console.log(`Avon page ${page}: ${products.length} products`);
  if (products.length < 250) break;
}

const codes = Object.keys(evidence.natura.codes);
let index = 0;
let done = 0;
async function worker() {
  while (index < codes.length) {
    const code = codes[index++];
    if (official[`natura:${code}`]) { done++; continue; }
    const url = `https://www.natura.cl/p/produto/NATCHL-${code}`;
    try {
      const html = await (await request(url)).text();
      const match = html.match(/<script id="product-schema.org"[^>]*>(.*?)<\/script>/s);
      if (match) {
        const p = JSON.parse(match[1]);
        const variant = findVariant(html, code);
        if (p.sku !== `NATCHL-${code}` && !variant) throw new Error(`SKU mismatch: ${p.sku}`);
        official[`natura:${code}`] = {
          code, brand: 'Natura', name: variant?.name || p.name, description: p.description,
          variant: variant?.sharedColorDescription || '',
          category: p.category,
          image: variant?.image || variant?.images?.[0] || (typeof p.image === 'string' ? p.image : p.image?.[0]),
          sourceUrl: p.sku === `NATCHL-${code}` ? (p.offers?.url || url) : url,
        };
      } else {
        official[`natura:${code}`] = { code, unavailable: true, sourceUrl: url };
      }
    } catch (error) {
      console.log(`${code}: ${error.message}`);
    }
    done++;
    if (done % 50 === 0) {
      save();
      console.log(`Natura ${done}/${codes.length}`);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
save();
console.log('Verified official product records:', Object.values(official).filter(p => !p.unavailable).length);
