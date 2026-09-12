import fs from 'node:fs';
import crypto from 'node:crypto';

const dir = 'tmp/catalog-audit';
const evidence = JSON.parse(fs.readFileSync(`${dir}/evidence.json`, 'utf8'));
const official = JSON.parse(fs.readFileSync(`${dir}/official.json`, 'utf8'));
const checks = [];
const jobs = Object.entries(evidence).flatMap(([slug, catalog]) => Object.keys(catalog.codes).map(code => ({ slug, code })));
const base = 'https://production.na01.natura.com/on/demandware.static/-/Sites-';
let index = 0;
let completed = 0;
async function worker() {
  while (index < jobs.length) {
    const { slug, code } = jobs[index++];
    const key = `${slug}:${code}`;
    const previous = official[key] || {};
    const candidates = previous.image ? [previous.image] :
      (slug === 'natura' ? ['natura-cl-storefront-catalog/default/produtos/NATCHL-'] :
        slug === 'ciclo-14' ? ['natura-cl-storefront-catalog/default/produtos/NATCHL-', 'avon-br-storefront-catalog/default/produtos/AVNBRA-'] :
          ['avon-br-storefront-catalog/default/produtos/AVNBRA-'])
        .map(prefix => `${base}${prefix}${code}_1.jpg`);
    let success = false;
    for (const url of candidates) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
        if (!r.ok || !r.headers.get('content-type')?.startsWith('image/')) continue;
        const bytes = Buffer.from(await r.arrayBuffer());
        if (bytes.length < 1000) continue;
        // These are actual public image responses for the exact SKU, not guessed
        // URLs left untested in the application. Hashes expose shared placeholders.
        checks.push({ key, url, status: r.status, type: r.headers.get('content-type'),
          bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
        official[key] = { ...previous, code, image: url,
          imageSourceUrl: previous.sourceUrl || url,
          imageVerified: true };
        success = true;
        break;
      } catch (error) {
        checks.push({ key, url, error: error.message });
      }
    }
    if (!success) {
      checks.push({ key, unavailable: true });
      if (previous.image) official[key] = { ...previous, image: null };
    }
    if (++completed % 100 === 0) console.log(`Images ${completed}/${jobs.length}`);
  }
}
await Promise.all(Array.from({ length: 10 }, worker));
fs.writeFileSync(`${dir}/official.json`, JSON.stringify(official, null, 2) + '\n');
fs.writeFileSync(`${dir}/image-checks.json`, JSON.stringify(checks, null, 2) + '\n');
const groups = Map.groupBy(checks.filter(c => c.sha256), c => c.sha256);
console.log('Repeated image hashes:', [...groups.values()].filter(g => g.length > 3).map(g => g.map(x => x.key)));
console.log('Verified images:', checks.filter(c => c.status === 200).length);
