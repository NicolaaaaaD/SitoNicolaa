import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.evaluateOnNewDocument(() => { sessionStorage.setItem('introSeen', '1'); });
const targetUrl = process.argv[2] || 'http://localhost:3000';
await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
await page.evaluate(() => { document.querySelectorAll('[data-anim]').forEach(el => el.classList.add('in')); });
await new Promise(r => setTimeout(r, 800));

const s1 = await page.$('#challenges');
const b1 = await s1.boundingBox();
await page.screenshot({ path: 'temporary screenshots/screenshot-77-problems-zoom.png', fullPage: false, clip: { x: 0, y: b1.y, width: 1440, height: b1.height } });

const s2 = await page.$('#case-studies-preview');
const b2 = await s2.boundingBox();
await page.screenshot({ path: 'temporary screenshots/screenshot-78-cs-cards-zoom.png', fullPage: false, clip: { x: 0, y: b2.y, width: 1440, height: b2.height } });

await browser.close();
console.log('Done');
