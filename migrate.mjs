import { readFileSync, writeFileSync, mkdirSync, copyFileSync, renameSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const r = (rel) => resolve(ROOT, rel);

// 1. Back up current marketing homepage
mkdirSync(r('marketing'), { recursive: true });
copyFileSync(r('index.html'), r('marketing/index.html'));
console.log('OK: marketing/index.html');

// Longer paths first so e.g. dentist-en is replaced before dentist
const RENAMES = [
  ['dentist-en',    'dentist-en-ads'],
  ['hotel-en',      'hotel-en-ads'],
  ['physiotherapy', 'physiotherapy-ads'],
  ['real-estate',   'real-estate-ads'],
  ['fisioterapia',  'fisioterapia-ads'],
  ['immobiliare',   'immobiliare-ads'],
  ['ristorante',    'ristorante-ads'],
  ['restaurant',    'restaurant-ads'],
  ['avvocati',      'avvocati-ads'],
  ['idraulico',     'idraulico-ads'],
  ['palestra',      'palestra-ads'],
  ['estetica',      'estetica-ads'],
  ['plumber',       'plumber-ads'],
  ['lawyers',       'lawyers-ads'],
  ['beauty',        'beauty-ads'],
  ['dentist',       'dentist-ads'],
  ['hotel',         'hotel-ads'],
  ['gym',           'gym-ads'],
];

function updateLinks(html) {
  for (const [old, neu] of RENAMES) {
    html = html.split(`/${old}"`).join(`/${neu}"`);
    html = html.split(`/${old}'`).join(`/${neu}'`);
  }
  return html;
}

// 2. Update cross-links before renaming
for (const [old] of RENAMES) {
  const path = r(`${old}/index.html`);
  const updated = updateLinks(readFileSync(path, 'utf8'));
  writeFileSync(path, updated, 'utf8');
  console.log(`Updated links: ${old}/index.html`);
}

// 3. Rename folders
for (const [old, neu] of RENAMES) {
  renameSync(r(old), r(neu));
  console.log(`Renamed: ${old}/ → ${neu}/`);
}

// 4. vercel.json with 301 redirects
const vercel = {
  cleanUrls: true,
  trailingSlash: false,
  redirects: RENAMES.map(([old]) => ({
    source: `/${old}`,
    destination: `/${old}-ads`,
    permanent: true,
  })),
};
writeFileSync(r('vercel.json'), JSON.stringify(vercel, null, 2), 'utf8');
console.log('OK: vercel.json');

// 5. Create it/ directory for Italian homepage
mkdirSync(r('it'), { recursive: true });
console.log('OK: it/ created');

console.log('\nMigration complete.');
