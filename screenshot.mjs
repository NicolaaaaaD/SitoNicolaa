import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, 'temporary screenshots');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const viewportWidth = parseInt(process.argv[4]) || 1440;

const files = existsSync(dir) ? readdirSync(dir).filter(f => /^screenshot-\d+/.test(f)) : [];
const nums = files.map(f => parseInt(f.match(/\d+/)[0])).filter(n => !isNaN(n));
const nextN = nums.length > 0 ? Math.max(...nums) + 1 : 1;
const fname = label ? `screenshot-${nextN}-${label}.png` : `screenshot-${nextN}.png`;
const outPath = join(dir, fname);

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: viewportWidth, height: 900 });
// Skip intro animation so it doesn't cover content in screenshots
await page.evaluateOnNewDocument(() => { sessionStorage.setItem('introSeen', '1'); });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
// Force all scroll-animated elements visible so full-page screenshots show content
await page.evaluate(() => {
  document.querySelectorAll('[data-anim]').forEach(el => el.classList.add('in'));
});
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log('Saved:', outPath);
