import puppeteer from 'puppeteer';

const url = process.argv[2] || 'http://localhost:3000';
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 812 });
await page.evaluateOnNewDocument(() => { sessionStorage.setItem('introSeen', '1'); });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
await page.evaluate(() => { document.querySelectorAll('[data-anim]').forEach(el => el.classList.add('in')); });
await new Promise(r => setTimeout(r, 600));

const s1 = await page.$('#challenges');
const b1 = await s1.boundingBox();
await page.screenshot({ path: 'temporary screenshots/screenshot-81-mob-problems.png', fullPage: false, clip: { x: 0, y: b1.y, width: 375, height: b1.height } });

const s2 = await page.$('#case-studies-preview');
const b2 = await s2.boundingBox();
await page.screenshot({ path: 'temporary screenshots/screenshot-82-mob-cs.png', fullPage: false, clip: { x: 0, y: b2.y, width: 375, height: b2.height } });

await browser.close();
console.log('Done');
