import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Slug helpers ───────────────────────────────────────────────
function slugify(text) {
  return String(text)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
function prettyTag(tag) {
  return String(tag).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── Parse frontmatter ──────────────────────────────────────────
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const m = line.match(/^(\w[\w-]*)\s*:\s*(.+)$/);
    if (!m) return;
    let val = m[2].trim().replace(/^"(.*)"$/, '$1');
    if (val.startsWith('[')) {
      val = val.replace(/[\[\]]/g, '').split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'));
    }
    if (val === 'true') val = true;
    if (val === 'false') val = false;
    if (!isNaN(val) && val !== '') val = Number(val);
    meta[m[1]] = val;
  });
  return { meta, content: match[2] };
}

// ── Date formatter ─────────────────────────────────────────────
function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  const opts = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', opts);
}

// ── Reading time ───────────────────────────────────────────────
function calcReadingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── Table of Contents extractor ────────────────────────────────
function buildTOC(html) {
  const headings = [];
  const re = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const level = parseInt(m[1]);
    const text = m[2].replace(/<[^>]+>/g, '');
    const id = 'h-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    headings.push({ level, text, id });
  }
  if (headings.length < 2) return { toc: '', html };
  let toc = '<nav class="toc" aria-label="Table of contents"><p class="toc__title">Contents</p><ol class="toc__list">';
  let processedHtml = html;
  headings.forEach(h => {
    if (h.level === 2) toc += `<li><a href="#${h.id}" class="toc__link">${h.text}</a></li>`;
    processedHtml = processedHtml.replace(
      new RegExp(`<(h${h.level})([^>]*)>` + h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + `</h${h.level}>`, 'm'),
      `<$1 id="${h.id}"$2>${h.text}</$1>`
    );
  });
  toc += '</ol></nav>';
  return { toc, html: processedHtml };
}

// ── Shared head/nav/footer helpers ────────────────────────────
function sharedHead(lang, title, desc, canonical, ogImage, hreflangLinks) {
  const hreflang = hreflangLinks || (lang === 'en'
    ? `<link rel="alternate" hreflang="en" href="https://nicosdigit.com/blog/">\n  <link rel="alternate" hreflang="it" href="https://nicosdigit.com/it/blog/">`
    : `<link rel="alternate" hreflang="en" href="https://nicosdigit.com/blog/">\n  <link rel="alternate" hreflang="it" href="https://nicosdigit.com/it/blog/">`);
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','wait_for_update':500});</script>
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KCSZKMWQ');</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${canonical}">
  ${hreflang}
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${lang === 'it' ? 'it_IT' : 'en_GB'}">
  <meta property="og:site_name" content="NicosDigit">
  ${ogImage ? `<meta property="og:image" content="https://nicosdigit.com${ogImage}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="https://fonts.gstatic.com/s/archivoblack/v23/HTxqL289NzCGg4MzN6KJ7eW6CYyF_jzx13E.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Archivo+Black&display=swap" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Archivo+Black&display=swap"></noscript>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><polygon points='6,16 26,4 26,28' fill='%2333C494' stroke='%2333C494' stroke-width='5' stroke-linejoin='round'/></svg>">
  <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css"></noscript>
  <script src="https://assets.calendly.com/assets/external/widget.js" async></script>`;
}

function navHTML(lang, activePath) {
  const home = lang === 'en' ? '/' : '/it/';
  const isIT = lang === 'it';
  return `<header class="site-head" id="site-head">
  <div class="container">
    <div class="site-head__inner">
      <a class="logo" href="${home}"><div class="logo__mark"><svg width="28" height="28" viewBox="0 0 32 32" fill="none"><polygon points="4,16 28,4 28,28" fill="#33C494" stroke="#33C494" stroke-width="4" stroke-linejoin="round"/></svg></div><div><div class="logo__text">NicosDigit</div><span class="logo__sub">${isIT ? 'Google Ads · Meta Ads · Landing Page' : 'Google Ads · Meta Ads · Landing Pages'}</span></div></a>
      <nav class="nav" id="nav" aria-label="${isIT ? 'Navigazione principale' : 'Main navigation'}">
        <ul class="nav__list" role="list">
          <li><a href="${home}#services" class="nav__link">${isIT ? 'Servizi' : 'Services'}</a></li>
          <li><a href="${home}#method" class="nav__link">${isIT ? 'Approccio' : 'Approach'}</a></li>
          <li><a href="${isIT ? '/it/case-studies' : '/case-studies'}" class="nav__link">${isIT ? 'Lavori' : 'Work'}</a></li>
          <li><a href="${isIT ? '/it/blog' : '/blog'}" class="nav__link${activePath && activePath.includes('blog') ? ' is-active' : ''}">${isIT ? 'Blog' : 'Blog'}</a></li>
          <li><a href="${home}#faq" class="nav__link">FAQ</a></li>
        </ul>
        <div class="lang-sw">
          <a href="/" class="lang-sw__btn${lang === 'en' ? ' lang-sw__btn--active' : ''}" hreflang="en">EN</a>
          <a href="/it" class="lang-sw__btn${lang === 'it' ? ' lang-sw__btn--active' : ''}" hreflang="it">IT</a>
        </div>
        <button class="nav__cta" onclick="Calendly.initPopupWidget({url:'https://calendly.com/nicoladimattia8/30min?month=2026-05'});return false;">${isIT ? 'Prenota una call' : 'Book a free call'}</button>
      </nav>
      <button class="nav-toggle" id="nav-toggle" aria-label="${isIT ? 'Apri menu' : 'Toggle menu'}" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

function footerHTML(lang) {
  const isIT = lang === 'it';
  const home = isIT ? '/it' : '/';
  return `<footer class="footer">
  <div class="container">
    <div class="footer__inner">
      <div class="footer__brand"><a class="logo" href="${home}"><div class="logo__mark"><svg width="24" height="24" viewBox="0 0 32 32" fill="none"><polygon points="4,16 28,4 28,28" fill="#33C494" stroke="#33C494" stroke-width="4" stroke-linejoin="round"/></svg></div><div><div class="logo__text">NicosDigit</div><span class="logo__sub">${isIT ? 'Google Ads · Meta Ads · Landing Page' : 'Google Ads · Meta Ads · Landing Pages'}</span></div></a></div>
      <p class="footer__copy">© 2025 Nicola Dimattia · P.IVA 09099240724</p>
      <nav class="footer__links" aria-label="Footer">
        <a href="tel:+393514120302">+39 351 412 0302</a>
        <a href="https://wa.me/393514120302" target="_blank" rel="noopener">WhatsApp</a>
        <a href="${isIT ? '/it/case-studies' : '/case-studies'}">${isIT ? 'Case Study' : 'Case Studies'}</a>
        <a href="https://www.linkedin.com/in/nicoladimattia/" target="_blank" rel="noopener">LinkedIn</a>
      </nav>
      <div class="footer__lang">
        <a href="/" ${lang === 'en' ? 'class="is-active"' : ''} hreflang="en">EN</a>
        <a href="/it" ${lang === 'it' ? 'class="is-active"' : ''} hreflang="it">IT</a>
      </div>
    </div>
    <div class="footer__bottom">
      <p class="footer__legal">Nicola Dimattia · P.IVA 09099240724 · <a href="/cookie-policy">Cookie policy</a></p>
      <div class="footer__legal-links"><button class="footer__cookie-btn" id="cookie-reopen">${isIT ? 'Impostazioni cookie' : 'Cookie settings'}</button></div>
    </div>
  </div>
</footer>`;
}

// ── Shared CSS ─────────────────────────────────────────────────
const SHARED_CSS = `
  :root{--green:#33C494;--green-dark:#28A57C;--green-soft:#E6F7F0;--bg:#FFFFFF;--bg-2:#F6F6F4;--ink:#0A0A0A;--ink-2:#1A1A1A;--grey:rgba(10,10,10,0.55);--grey-line:rgba(10,10,10,0.08);--ease:cubic-bezier(0.16,1,0.3,1);--max:1320px;}
  *{margin:0;padding:0;box-sizing:border-box;}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;overflow-x:hidden;}
  body{font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:16px;line-height:1.6;color:var(--ink);background:var(--bg);overflow-x:hidden;-webkit-font-smoothing:antialiased;}
  img,svg{display:block;max-width:100%;}a{color:inherit;text-decoration:none;}button{background:none;border:none;cursor:pointer;font:inherit;color:inherit;padding:0;}ul{list-style:none;}strong{font-weight:700;}::selection{background:var(--green);color:var(--ink);}
  .container{width:100%;max-width:var(--max);margin:0 auto;padding:0 1.5rem;}
  @media(min-width:768px){.container{padding:0 2rem;}}@media(min-width:1100px){.container{padding:0 3rem;}}
  .site-head{position:fixed;top:0;left:0;right:0;z-index:160;padding:1rem 0;background:rgba(255,255,255,0.9);backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);border-bottom:1px solid var(--grey-line);transition:padding 0.3s var(--ease);}
  .site-head.is-scrolled{padding:0.55rem 0;}
  .site-head__inner{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;}
  .logo{display:flex;align-items:center;gap:0.7rem;min-height:44px;}
  .logo__mark{width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .logo__text{font-family:'Archivo Black',sans-serif;font-weight:900;font-size:1.05rem;letter-spacing:-0.03em;color:var(--ink);line-height:1;}
  .logo__sub{font-size:0.65rem;font-weight:500;color:var(--grey);letter-spacing:0.04em;display:block;margin-top:0.1rem;}
  .nav{display:flex;align-items:center;gap:2rem;}
  .nav__list{display:flex;gap:2rem;font-size:0.93rem;font-weight:500;}
  .nav__link{position:relative;padding:0.4rem 0;transition:color 0.2s;min-height:44px;display:flex;align-items:center;}
  .nav__link::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--green);transform:scaleX(0);transform-origin:left;transition:transform 0.35s var(--ease);}
  .nav__link:hover::after{transform:scaleX(1);}
  .nav__link.is-active::after{transform:scaleX(1)!important;}
  .nav__cta{display:inline-flex;align-items:center;gap:0.6rem;background:var(--ink);color:var(--bg);padding:0.7rem 1.3rem;font-size:0.88rem;font-weight:600;border-radius:999px;min-height:44px;transition:background 0.25s,color 0.25s,transform 0.25s var(--ease);}
  .nav__cta:hover{background:var(--green);color:var(--ink);transform:translateY(-2px);}
  .lang-sw{display:flex;align-items:center;flex-shrink:0;border:1.5px solid var(--grey-line);border-radius:999px;overflow:hidden;}
  .lang-sw__btn{padding:0.38rem 0.75rem;font-size:0.75rem;font-weight:700;letter-spacing:0.08em;color:var(--grey);transition:background 0.2s,color 0.2s;min-height:44px;display:flex;align-items:center;}
  .lang-sw__btn--active{background:var(--ink);color:var(--bg);}
  .lang-sw__btn:not(.lang-sw__btn--active):hover{background:var(--green-soft);color:var(--green-dark);}
  .nav-toggle{display:none;width:44px;height:44px;position:relative;z-index:110;align-items:center;justify-content:center;}
  .nav-toggle span{display:block;position:absolute;left:11px;width:22px;height:2px;background:var(--ink);border-radius:2px;transition:transform 0.3s var(--ease),opacity 0.2s;}
  .nav-toggle span:nth-child(1){top:16px;}.nav-toggle span:nth-child(2){top:22px;}.nav-toggle span:nth-child(3){top:28px;}
  .nav-toggle.is-open span:nth-child(1){transform:translateY(6px) rotate(45deg);}.nav-toggle.is-open span:nth-child(2){opacity:0;}.nav-toggle.is-open span:nth-child(3){transform:translateY(-6px) rotate(-45deg);}
  @media(max-width:880px){
    .logo__sub{display:none;}.logo{position:relative;z-index:160;}.nav-toggle{z-index:160!important;}
    .nav__list,.nav__cta,.lang-sw{display:none!important;}.nav-toggle{display:flex!important;}
    .nav{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;z-index:150!important;background:var(--bg);flex-direction:column!important;align-items:stretch!important;padding:80px 1.5rem calc(1.5rem + env(safe-area-inset-bottom,0px)) 1.5rem!important;overflow-y:auto;gap:0!important;pointer-events:none;visibility:hidden;opacity:0;transform:translateX(100%);transition:opacity 0.3s var(--ease),transform 0.3s var(--ease),visibility 0s 0.3s;}
    .nav.is-open{pointer-events:auto!important;visibility:visible!important;opacity:1!important;transform:none!important;transition:opacity 0.3s var(--ease),transform 0.3s var(--ease),visibility 0s;}
    .nav.is-open .nav__list{display:flex!important;flex-direction:column;width:100%;gap:0;}
    .nav.is-open .nav__list li{border-bottom:1px solid var(--grey-line);}
    .nav.is-open .nav__list a{display:flex;align-items:center;padding:1.1rem 0;font-size:1.4rem;font-family:'Archivo Black';letter-spacing:-0.02em;min-height:60px;}
    .nav.is-open .nav__cta{display:inline-flex!important;margin-top:2rem;align-self:stretch;justify-content:center;padding:1.1rem;font-size:1rem;min-height:56px;}
    .nav.is-open .lang-sw{display:flex!important;margin-top:2rem;align-self:flex-start;}
  }
  .btn{display:inline-flex;align-items:center;gap:0.7rem;padding:1rem 1.6rem;font-size:0.95rem;font-weight:600;border-radius:999px;transition:transform 0.25s var(--ease),background 0.25s,color 0.25s;white-space:nowrap;border:none;cursor:pointer;font-family:inherit;min-height:48px;}
  .btn:hover{transform:translateY(-3px);}
  .btn--solid{background:var(--ink);color:var(--bg);box-shadow:0 6px 24px -8px rgba(10,10,10,0.35);}
  .btn--solid:hover{background:var(--green);color:var(--ink);}
  .btn--ghost{background:transparent;color:var(--ink);border:1.5px solid rgba(10,10,10,0.2);}.btn--ghost:hover{background:var(--ink);color:var(--bg);}
  .btn__arrow{width:0;height:0;border-style:solid;border-width:5px 0 5px 7px;border-color:transparent transparent transparent currentColor;}
  .btn:active{transform:scale(0.97) translateY(0)!important;}
  .eyebrow{display:inline-flex;align-items:center;gap:0.7rem;font-size:0.76rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:1.25rem;color:rgba(10,10,10,0.7);}
  .eyebrow::before{content:'';width:0;height:0;border-style:solid;border-width:4px 0 4px 6px;border-color:transparent transparent transparent var(--green);}
  .h2{font-family:'Archivo Black',sans-serif;font-weight:900;font-size:clamp(2.4rem,6vw,5rem);line-height:0.95;letter-spacing:-0.035em;overflow-wrap:break-word;}
  .section{padding:clamp(5rem,10vw,9rem) 0;}
  .section--alt{background:var(--bg-2);}
  .sec-head{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:0;}
  .sec-lead{font-size:1.1rem;line-height:1.7;color:rgba(10,10,10,0.7);max-width:620px;margin-top:1.25rem;}
  [data-anim]{opacity:0;transform:translateY(24px);transition:opacity 0.65s var(--ease),transform 0.65s var(--ease);}
  [data-anim].in{opacity:1;transform:none;}
  [data-anim][data-delay="1"]{transition-delay:0.1s;}[data-anim][data-delay="2"]{transition-delay:0.2s;}[data-anim][data-delay="3"]{transition-delay:0.3s;}
  .footer{background:var(--ink);color:rgba(255,255,255,0.65);padding:3rem 0;}
  .footer__inner{display:flex;flex-direction:column;gap:2rem;}
  @media(min-width:768px){.footer__inner{flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1.5rem;}}
  .footer__brand .logo__text{color:var(--bg);}.footer__brand .logo__sub{color:rgba(255,255,255,0.35);}
  .footer__copy{font-size:0.85rem;}
  .footer__links{display:flex;flex-wrap:wrap;gap:1.2rem;font-size:0.85rem;}
  .footer__links a{color:rgba(255,255,255,0.62);transition:color 0.2s;min-height:44px;display:flex;align-items:center;}.footer__links a:hover{color:var(--green);}
  .footer__lang{display:flex;align-items:center;border:1.5px solid rgba(255,255,255,0.12);border-radius:999px;overflow:hidden;}
  .footer__lang a{font-size:0.75rem;font-weight:700;letter-spacing:0.08em;color:rgba(255,255,255,0.62);padding:0.3rem 0.75rem;min-height:44px;display:flex;align-items:center;transition:background 0.2s,color 0.2s;}
  .footer__lang a.is-active{background:rgba(255,255,255,0.1);color:var(--bg);}
  .footer__bottom{border-top:1px solid rgba(255,255,255,.07);margin-top:1.5rem;padding-top:1.25rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.5rem;}
  .footer__legal{font-size:.76rem;color:rgba(255,255,255,.5);}.footer__legal a{color:rgba(255,255,255,.5);padding:0.5rem 0;display:inline-flex;align-items:center;}.footer__legal a:hover{color:#33C494;}
  .footer__legal-links a,.footer__cookie-btn{color:rgba(255,255,255,.5);transition:color .2s;font-size:.76rem;background:none;border:none;cursor:pointer;font:inherit;min-height:44px;display:inline-flex;align-items:center;}
  .footer__cookie-btn:hover,.footer__legal-links a:hover{color:#33C494;}
  .cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:199;background:#0A0A0A;color:rgba(255,255,255,.9);display:none;border-top:1px solid rgba(255,255,255,.08);}
  .cookie-banner.is-visible{display:block;}
  .cookie-banner__inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;padding:1rem 1.5rem;}
  .cookie-banner__text{font-size:.88rem;line-height:1.5;flex:1;}
  .cookie-banner__link{color:#33C494;text-decoration:underline;}
  .cookie-banner__actions{display:flex;gap:.75rem;}
  .cookie-banner__btn{padding:.65rem 1.25rem;font-size:.88rem;font-weight:600;border-radius:999px;cursor:pointer;border:none;font-family:inherit;min-height:44px;}
  .cookie-banner__btn--accept{background:#33C494;color:#0A0A0A;}
  .cookie-banner__btn--reject{background:transparent;color:rgba(255,255,255,.8);border:1.5px solid rgba(255,255,255,.2);}
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important;}[data-anim]{opacity:1!important;transform:none!important;}}
`;

// ── Blog-specific CSS ──────────────────────────────────────────
const BLOG_CSS = `
  /* Blog index */
  .blog-hero{padding:clamp(6rem,12vw,10rem) 0 clamp(4rem,7vw,6rem);background:var(--bg-2);border-bottom:1px solid var(--grey-line);}
  .blog-hero__inner{max-width:760px;}
  .blog-featured{background:var(--bg);border:1px solid var(--grey-line);border-radius:16px;overflow:hidden;display:grid;grid-template-columns:1fr;transition:border-color 0.25s,transform 0.25s var(--ease),box-shadow 0.25s;}
  @media(min-width:860px){.blog-featured{grid-template-columns:1fr 1fr;}}
  .blog-featured:hover{border-color:var(--green);transform:translateY(-4px);box-shadow:0 20px 48px -12px rgba(51,196,148,0.18);}
  .blog-featured__img{background:var(--bg-2);min-height:240px;display:flex;align-items:center;justify-content:center;border-right:1px solid var(--grey-line);padding:3rem;}
  .blog-featured__body{padding:2.5rem 2.5rem 2rem;}
  .blog-featured__tag{font-size:0.69rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--green-dark);margin-bottom:0.75rem;display:flex;align-items:center;gap:0.6rem;}
  .blog-featured__tag::before{content:'FEATURED';background:var(--green-soft);color:var(--green-dark);padding:0.15rem 0.55rem;border-radius:999px;font-size:0.6rem;}
  .blog-featured__title{font-family:'Archivo Black',sans-serif;font-weight:900;font-size:clamp(1.4rem,3vw,1.9rem);letter-spacing:-0.03em;line-height:1.1;margin-bottom:1rem;color:var(--ink);}
  .blog-featured__excerpt{font-size:0.95rem;line-height:1.7;color:var(--grey);margin-bottom:1.5rem;}
  .blog-featured__meta{font-size:0.82rem;color:var(--grey);display:flex;flex-wrap:wrap;gap:0.5rem 1rem;margin-bottom:1.5rem;align-items:center;}
  .blog-featured__cta{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.88rem;font-weight:600;color:var(--green-dark);transition:gap 0.2s var(--ease);}
  .blog-featured:hover .blog-featured__cta{gap:0.8rem;}
  .blog-grid{display:grid;grid-template-columns:1fr;gap:1.5rem;}
  @media(min-width:640px){.blog-grid{grid-template-columns:repeat(2,1fr);}}
  @media(min-width:1024px){.blog-grid{grid-template-columns:repeat(3,1fr);}}
  .blog-card{background:var(--bg);border:1px solid var(--grey-line);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:border-color 0.25s,transform 0.25s var(--ease),box-shadow 0.25s;}
  .blog-card:hover{border-color:var(--green);transform:translateY(-4px);box-shadow:0 16px 40px -12px rgba(51,196,148,0.18);}
  .blog-card__img{background:var(--bg-2);height:160px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--grey-line);padding:2rem;}
  .blog-card__body{padding:1.5rem;flex:1;display:flex;flex-direction:column;gap:0.5rem;}
  .blog-card__tag{font-size:0.69rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#1A7A5C;}
  .blog-card__title{font-family:'Archivo Black',sans-serif;font-weight:900;font-size:1rem;letter-spacing:-0.02em;line-height:1.25;color:var(--ink);}
  .blog-card__excerpt{font-size:0.85rem;line-height:1.6;color:rgba(10,10,10,0.7);flex:1;}
  .blog-card__meta{font-size:0.78rem;color:rgba(10,10,10,0.7);margin-top:0.5rem;display:flex;gap:0.75rem;flex-wrap:wrap;}
  .blog-card__footer{padding:1rem 1.5rem;border-top:1px solid var(--grey-line);font-size:0.84rem;font-weight:600;color:rgba(10,10,10,0.7);display:flex;align-items:center;justify-content:space-between;transition:color 0.2s,background 0.2s;}
  .blog-card:hover .blog-card__footer{color:var(--green-dark);background:var(--green-soft);}
  .blog-sidebar{display:flex;flex-direction:column;gap:2rem;}
  .blog-sidebar__box{background:var(--bg-2);border-radius:12px;padding:1.5rem;border:1px solid var(--grey-line);}
  .blog-sidebar__title{font-family:'Archivo Black',sans-serif;font-size:1rem;letter-spacing:-0.02em;margin-bottom:1rem;color:var(--ink);}
  .blog-sidebar__cats{display:flex;flex-direction:column;gap:0.25rem;}
  .blog-sidebar__cat{display:flex;align-items:center;justify-content:space-between;padding:0.55rem 0.75rem;border-radius:8px;font-size:0.88rem;font-weight:500;transition:background 0.15s,color 0.15s;text-decoration:none;color:var(--ink);}
  .blog-sidebar__cat:hover{background:var(--green-soft);color:var(--green-dark);}
  .blog-sidebar__cat-count{font-size:0.75rem;color:var(--grey);background:var(--grey-line);padding:0.1rem 0.5rem;border-radius:999px;}
  .blog-newsletter{background:var(--ink);border-radius:12px;padding:1.5rem;color:var(--bg);}
  .blog-newsletter__title{font-family:'Archivo Black',sans-serif;font-size:1.05rem;letter-spacing:-0.02em;margin-bottom:0.5rem;}
  .blog-newsletter__sub{font-size:0.83rem;line-height:1.6;color:rgba(255,255,255,0.6);margin-bottom:1.25rem;}
  .blog-newsletter__form{display:flex;flex-direction:column;gap:0.5rem;}
  .blog-newsletter__input{padding:0.75rem 1rem;border-radius:8px;border:1.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.08);color:var(--bg);font-size:0.88rem;font-family:inherit;transition:border-color 0.2s;}
  .blog-newsletter__input:focus{outline:none;border-color:var(--green);}
  .blog-newsletter__btn{padding:0.75rem 1rem;border-radius:8px;background:var(--green);color:var(--ink);font-weight:600;font-size:0.88rem;border:none;cursor:pointer;font-family:inherit;transition:background 0.2s;}
  .blog-newsletter__btn:hover{background:var(--green-dark);color:var(--bg);}
  /* Article page */
  .reading-progress{position:fixed;top:0;left:0;width:0%;height:3px;background:var(--green);z-index:9999;transition:width 0.1s linear;}
  .article-hero{padding:clamp(6rem,12vw,10rem) 0 clamp(3rem,5vw,5rem);background:var(--bg-2);border-bottom:1px solid var(--grey-line);}
  .article-breadcrumb{display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;color:rgba(10,10,10,0.72);margin-bottom:2rem;flex-wrap:wrap;}
  .article-breadcrumb a{color:rgba(10,10,10,0.72);transition:color 0.2s;display:inline-flex;align-items:center;padding:0.55rem 0.15rem;min-height:44px;}.article-breadcrumb a:hover{color:#1A7A5C;}
  .article-breadcrumb__sep{color:var(--grey-line);}
  .article-hero__tag{font-size:0.69rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#1A7A5C;margin-bottom:0.75rem;display:block;}
  .article-hero__title{font-family:'Archivo Black',sans-serif;font-weight:900;font-size:clamp(2rem,5vw,3.5rem);line-height:1.0;letter-spacing:-0.035em;margin-bottom:1.5rem;color:var(--ink);}
  .article-hero__meta{display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem 1.5rem;font-size:0.85rem;color:rgba(10,10,10,0.72);}
  .article-hero__meta-item{display:flex;align-items:center;gap:0.4rem;}
  .article-layout{display:grid;grid-template-columns:1fr;gap:4rem;padding-top:clamp(3rem,6vw,5rem);}
  @media(min-width:1024px){.article-layout{grid-template-columns:1fr 300px;}}
  .article-body{max-width:680px;}
  .article-body h2{font-family:'Archivo Black',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:-0.025em;margin-top:2.5rem;margin-bottom:0.85rem;color:var(--ink);}
  .article-body h3{font-family:'Archivo Black',sans-serif;font-weight:900;font-size:1.15rem;letter-spacing:-0.02em;margin-top:1.75rem;margin-bottom:0.65rem;color:var(--ink);}
  .article-body p{margin-bottom:1.25rem;line-height:1.8;color:rgba(10,10,10,0.8);}
  .article-body ul,.article-body ol{margin:0 0 1.25rem 1.25rem;display:flex;flex-direction:column;gap:0.5rem;}
  .article-body li{line-height:1.7;color:rgba(10,10,10,0.8);}
  .article-body ul li{list-style:disc;}.article-body ol li{list-style:decimal;}
  .article-body strong{color:var(--ink);}
  .article-body a{color:#1A7A5C;text-decoration:underline;text-underline-offset:3px;}
  .article-body a:hover{color:var(--ink);}
  .article-body hr{border:none;border-top:1px solid var(--grey-line);margin:2.5rem 0;}
  .article-body blockquote{border-left:3px solid var(--green);padding:0.75rem 1.25rem;background:var(--green-soft);border-radius:0 8px 8px 0;margin:1.5rem 0;color:var(--ink);}
  .article-body blockquote p{margin:0;}
  .article-body code{background:var(--bg-2);padding:0.15rem 0.4rem;border-radius:4px;font-size:0.88em;font-family:monospace;}
  .toc{position:sticky;top:6rem;max-height:calc(100vh - 8rem);overflow-y:auto;background:var(--bg-2);border:1px solid var(--grey-line);border-radius:12px;padding:1.25rem;}
  .toc__title{font-family:'Archivo Black',sans-serif;font-size:0.85rem;letter-spacing:0.05em;text-transform:uppercase;color:var(--grey);margin-bottom:0.85rem;}
  .toc__list{display:flex;flex-direction:column;gap:0.25rem;list-style:none;margin:0;padding:0;}
  .toc__link{font-size:0.85rem;color:var(--grey);line-height:1.4;padding:0.35rem 0.5rem;border-radius:6px;display:block;transition:background 0.15s,color 0.15s;text-decoration:none;}
  .toc__link:hover,.toc__link.is-active{background:var(--green-soft);color:var(--green-dark);}
  @media(max-width:1023px){.toc{display:none;}}
  .article-share{margin-top:3rem;padding-top:2rem;border-top:1px solid var(--grey-line);}
  .article-share__title{font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(10,10,10,0.7);margin-bottom:0.85rem;}
  .article-share__btns{display:flex;gap:0.75rem;flex-wrap:wrap;}
  .share-btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.6rem 1rem;border-radius:8px;font-size:0.84rem;font-weight:600;border:1.5px solid var(--grey-line);color:var(--ink);transition:background 0.2s,color 0.2s,border-color 0.2s;cursor:pointer;min-height:44px;}
  .share-btn:hover{background:var(--ink);color:var(--bg);border-color:var(--ink);}
  .author-box{margin-top:3rem;padding:2rem;background:var(--bg-2);border-radius:14px;display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap;}
  .author-box__avatar{width:60px;height:60px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-family:'Archivo Black',sans-serif;font-size:1.3rem;color:var(--ink);flex-shrink:0;}
  .author-box__name{font-family:'Archivo Black',sans-serif;font-size:1rem;letter-spacing:-0.02em;color:var(--ink);}
  .author-box__bio{font-size:0.88rem;line-height:1.65;color:var(--grey);margin-top:0.35rem;}
  .article-nav{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:3rem;}
  @media(max-width:560px){.article-nav{grid-template-columns:1fr;}}
  .article-nav__item{border:1px solid var(--grey-line);border-radius:12px;padding:1.25rem;transition:border-color 0.2s,background 0.2s;text-decoration:none;color:inherit;}
  .article-nav__item:hover{border-color:var(--green);background:var(--green-soft);}
  .article-nav__label{font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(10,10,10,0.7);margin-bottom:0.4rem;}
  .article-nav__title{font-size:0.9rem;font-weight:600;color:var(--ink);line-height:1.35;}
  .article-nav__item--next{text-align:right;}
  .related-grid{display:grid;grid-template-columns:1fr;gap:1rem;margin-top:2rem;}
  @media(min-width:640px){.related-grid{grid-template-columns:repeat(2,1fr);}}
  @media(min-width:900px){.related-grid{grid-template-columns:repeat(3,1fr);}}
  .newsletter-inline{background:var(--ink);border-radius:14px;padding:2.5rem;margin-top:3rem;}
  .newsletter-inline__title{font-family:'Archivo Black',sans-serif;font-size:1.25rem;letter-spacing:-0.025em;color:var(--bg);margin-bottom:0.5rem;}
  .newsletter-inline__sub{font-size:0.9rem;color:rgba(255,255,255,0.6);margin-bottom:1.5rem;line-height:1.65;}
  .newsletter-inline__form{display:flex;gap:0.75rem;flex-wrap:wrap;}
  .newsletter-inline__input{flex:1;min-width:220px;padding:0.85rem 1rem;border-radius:8px;border:1.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:var(--bg);font-size:0.9rem;font-family:inherit;}
  .newsletter-inline__input:focus{outline:none;border-color:var(--green);}
  .newsletter-inline__btn{padding:0.85rem 1.5rem;border-radius:8px;background:var(--green);color:var(--ink);font-weight:600;font-size:0.9rem;border:none;cursor:pointer;font-family:inherit;white-space:nowrap;transition:background 0.2s;}
  .newsletter-inline__btn:hover{background:var(--green-dark);color:var(--bg);}
  /* Category page */
  .cat-hero{padding:clamp(6rem,10vw,9rem) 0 clamp(3rem,5vw,4rem);background:var(--bg-2);border-bottom:1px solid var(--grey-line);}
  /* Search */
  .search-hero{padding:clamp(6rem,10vw,9rem) 0 clamp(3rem,5vw,4rem);background:var(--bg-2);border-bottom:1px solid var(--grey-line);}
  .search-form{display:flex;gap:0.75rem;max-width:600px;margin-top:2rem;}
  .search-input{flex:1;padding:0.9rem 1.2rem;border:1.5px solid var(--grey-line);border-radius:8px;font-size:1rem;font-family:inherit;transition:border-color 0.2s;}
  .search-input:focus{outline:none;border-color:var(--green);}
  .search-btn{padding:0.9rem 1.5rem;background:var(--ink);color:var(--bg);border:none;border-radius:8px;font-weight:600;font-size:0.9rem;cursor:pointer;font-family:inherit;transition:background 0.2s;}
  .search-btn:hover{background:var(--green);color:var(--ink);}
  /* Tags */
  .article-hero__tags{display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1.25rem;}
  .article-tag{font-size:0.7rem;font-weight:600;letter-spacing:0.06em;color:#1A7A5C;background:var(--green-soft);padding:0.6rem 0.9rem;border-radius:999px;transition:background 0.18s,color 0.18s;text-decoration:none;white-space:nowrap;min-height:44px;display:inline-flex;align-items:center;}
  .article-tag:hover{background:var(--green-dark);color:#fff;}
  .blog-card__tag-spans{display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.35rem;}
  .blog-card__tag-span{font-size:0.66rem;font-weight:600;letter-spacing:0.06em;color:rgba(10,10,10,0.7);background:var(--grey-line);padding:0.2rem 0.55rem;border-radius:999px;white-space:nowrap;}
  /* Tag hero (reuse cat-hero) */
  .tag-hero{padding:clamp(6rem,10vw,9rem) 0 clamp(3rem,5vw,4rem);background:var(--bg-2);border-bottom:1px solid var(--grey-line);}
  /* Mobile overrides */
  @media(max-width:860px){
    .blog-featured__body{padding:1.5rem 1.5rem 1.25rem;}
    .blog-featured__img{border-right:none;border-bottom:1px solid var(--grey-line);min-height:180px;padding:2rem;}
    .blog-grid{grid-template-columns:1fr;}
  }
  @media(max-width:640px){
    .newsletter-inline{padding:1.75rem 1.25rem;}
    .newsletter-inline__form{flex-direction:column;}
    .newsletter-inline__input{min-width:0;}
    .article-layout{padding-top:2rem;}
    .article-body h2{font-size:1.3rem;}
    .article-hero__tags{gap:0.35rem;margin-top:0.85rem;}
    .article-nav{grid-template-columns:1fr;}
    .article-nav__item--next{text-align:left;}
    .blog-hero{padding:clamp(5.5rem,10vw,8rem) 0 clamp(3rem,5vw,4.5rem);}
  }
`;

// ── Shared JS ──────────────────────────────────────────────────
const SHARED_JS = `
<script>
  const head=document.getElementById('site-head');
  window.addEventListener('scroll',()=>{head.classList.toggle('is-scrolled',window.scrollY>60);},{passive:true});
  const toggle=document.getElementById('nav-toggle'),nav=document.getElementById('nav');
  toggle.addEventListener('click',()=>{const open=toggle.classList.toggle('is-open');nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',open);document.body.style.overflow=open?'hidden':'';});
  nav.querySelectorAll('a').forEach(el=>{
    el.addEventListener('click',()=>{toggle.classList.remove('is-open');nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');document.body.style.overflow='';});
  });
  const observer=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');observer.unobserve(e.target);}});},{threshold:0.1});
  document.querySelectorAll('[data-anim]').forEach(el=>observer.observe(el));
</script>
<div id="cookie-banner" class="cookie-banner" role="dialog" aria-label="Cookie consent"><div class="cookie-banner__inner"><p class="cookie-banner__text">This site uses cookies to measure visits and campaign performance. <a class="cookie-banner__link" href="/cookie-policy">Cookie policy</a></p><div class="cookie-banner__actions"><button id="cookie-accept" class="cookie-banner__btn cookie-banner__btn--accept">Accept</button><button id="cookie-reject" class="cookie-banner__btn cookie-banner__btn--reject">Reject</button></div></div></div>
<script>(function(){var stored=localStorage.getItem('cookieConsent');var banner=document.getElementById('cookie-banner');function grantConsent(){window.dataLayer=window.dataLayer||[];(function(){function gtag(){window.dataLayer.push(arguments);}gtag('consent','update',{'ad_storage':'granted','ad_user_data':'granted','ad_personalization':'granted','analytics_storage':'granted'});})();}function dismiss(c){localStorage.setItem('cookieConsent',c);if(banner)banner.classList.remove('is-visible');if(c==='granted')grantConsent();}if(stored==='granted')grantConsent();if(!stored&&banner)banner.classList.add('is-visible');var ab=document.getElementById('cookie-accept'),rb=document.getElementById('cookie-reject');if(ab)ab.addEventListener('click',function(){dismiss('granted');});if(rb)rb.addEventListener('click',function(){dismiss('denied');});var reopen=document.getElementById('cookie-reopen');if(reopen)reopen.addEventListener('click',function(e){e.preventDefault();localStorage.removeItem('cookieConsent');if(banner)banner.classList.add('is-visible');});})();</script>`;

// ── Article SVG icon for cards ─────────────────────────────────
function articleIconSVG(category) {
  const icons = {
    'google-ads': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="var(--green)" stroke-width="2"/><path d="M16 24h16M24 16l8 8-8 8" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'tracking': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="6" stroke="var(--green)" stroke-width="2"/><path d="M16 28l8-8 4 4 8-10" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'strategy': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M8 40L24 8l16 32H8z" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="24" y1="24" x2="24" y2="36" stroke="var(--green)" stroke-width="2" stroke-linecap="round"/></svg>`,
  };
  return icons[category] || icons['google-ads'];
}

// ── Build blog index page ──────────────────────────────────────
function buildIndex(articles, lang) {
  const isIT = lang === 'it';
  const basePath = isIT ? '/it/blog' : '/blog';
  const siteBase = 'https://nicosdigit.com';
  const canonical = `${siteBase}${basePath}/`;

  const featured = articles.find(a => a.meta.featured) || articles[0];
  const rest = articles.filter(a => a !== featured);

  // Categories with counts
  const catCounts = {};
  articles.forEach(a => {
    const c = a.meta.category;
    catCounts[c] = (catCounts[c] || { label: a.meta.categoryLabel, count: 0 });
    catCounts[c].count++;
  });

  const title = isIT
    ? 'Blog — NicosDigit | Google Ads, Meta Ads, Tracciamento'
    : 'Blog — NicosDigit | Google Ads, Meta Ads, Tracking';
  const desc = isIT
    ? 'Articoli pratici su Google Ads, Meta Ads, tracciamento e strategia — dalla nostra esperienza reale con i clienti.'
    : 'Practical articles on Google Ads, Meta Ads, tracking and strategy — written from our real client experience.';

  const catLinks = Object.entries(catCounts).map(([slug, {label, count}]) =>
    `<a href="${basePath}/category/${slug}/" class="blog-sidebar__cat">${label}<span class="blog-sidebar__cat-count">${count}</span></a>`
  ).join('');

  const restCards = rest.map((a, i) => {
    const tags = Array.isArray(a.meta.tags) ? a.meta.tags : [];
    return `
    <a href="${basePath}/${a.meta.slug}/" class="blog-card" data-anim data-delay="${(i % 3) + 1}">
      <div class="blog-card__img">${articleIconSVG(a.meta.category)}</div>
      <div class="blog-card__body">
        <div class="blog-card__tag">${a.meta.categoryLabel}</div>
        <div class="blog-card__title">${a.meta.title}</div>
        <p class="blog-card__excerpt">${a.meta.excerpt}</p>
        <div class="blog-card__meta">
          <span>${formatDate(a.meta.date, lang)}</span>
          <span>·</span>
          <span>${a.meta.readingTime} min ${isIT ? 'di lettura' : 'read'}</span>
        </div>
        ${tags.length ? `<div class="blog-card__tag-spans">${tags.slice(0,3).map(t=>`<span class="blog-card__tag-span">${prettyTag(t)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="blog-card__footer">${isIT ? 'Leggi l\'articolo' : 'Read article'} <span>→</span></div>
    </a>`;
  }).join('');

  return `${sharedHead(lang, title, desc, canonical, null)}
  <style>${SHARED_CSS}${BLOG_CSS}</style>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KCSZKMWQ" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
${navHTML(lang, basePath)}

<div style="padding-top:72px;">
  <div class="blog-hero">
    <div class="container">
      <div class="blog-hero__inner" data-anim>
        <div class="eyebrow">${isIT ? 'Il nostro blog' : 'Our blog'}</div>
        <h1 class="h2">${isIT ? 'Approfondimenti per crescere.' : 'Insights for growth.'}</h1>
        <p class="sec-lead">${isIT ? 'Articoli pratici su Google Ads, Meta Ads, tracciamento e strategia — scritti dalla nostra esperienza diretta con i clienti.' : 'Practical articles on Google Ads, Meta Ads, tracking and strategy — written from real client experience, not textbooks.'}</p>
      </div>
    </div>
  </div>

  <section class="section">
    <div class="container">
      <div style="display:grid;grid-template-columns:1fr;gap:4rem;" class="blog-main-grid">
        <div>
          ${featured ? `
          <div style="margin-bottom:4rem;">
            <div class="eyebrow" style="margin-bottom:1.5rem;">${isIT ? 'Articolo in evidenza' : 'Featured article'}</div>
            <a href="${basePath}/${featured.meta.slug}/" class="blog-featured" data-anim style="display:grid;grid-template-columns:1fr;">
              <div class="blog-featured__body">
                <div class="blog-featured__tag">${featured.meta.categoryLabel}</div>
                <div class="blog-featured__title">${featured.meta.title}</div>
                <p class="blog-featured__excerpt">${featured.meta.excerpt}</p>
                <div class="blog-featured__meta">
                  <span>${formatDate(featured.meta.date, lang)}</span>
                  <span>·</span>
                  <span>${featured.meta.readingTime} min ${isIT ? 'di lettura' : 'read'}</span>
                  <span>·</span>
                  <span>${featured.meta.author}</span>
                </div>
                <span class="blog-featured__cta">${isIT ? 'Leggi l\'articolo' : 'Read article'} →</span>
              </div>
            </a>
          </div>` : ''}

          <div class="eyebrow" style="margin-bottom:2rem;">${isIT ? 'Ultimi articoli' : 'Latest articles'}</div>
          <div class="blog-grid">${restCards}</div>
        </div>
      </div>
    </div>
  </section>
</div>

${footerHTML(lang)}
${SHARED_JS}
</body>
</html>`;
}

// ── Build article page ─────────────────────────────────────────
function buildArticle(article, allArticles, lang) {
  const isIT = lang === 'it';
  const basePath = isIT ? '/it/blog' : '/blog';
  const siteBase = 'https://nicosdigit.com';
  const canonical = `${siteBase}${basePath}/${article.meta.slug}/`;
  const hreflangLinks = `<link rel="alternate" hreflang="${lang}" href="${canonical}">\n  <link rel="alternate" hreflang="x-default" href="${canonical}">`;

  const html = marked.parse(article.content);
  const { toc, html: processedHtml } = buildTOC(html);

  const related = allArticles.filter(a => a.meta.slug !== article.meta.slug).slice(0, 3);
  const idx = allArticles.findIndex(a => a.meta.slug === article.meta.slug);
  const prev = idx > 0 ? allArticles[idx - 1] : null;
  const next = idx < allArticles.length - 1 ? allArticles[idx + 1] : null;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': article.meta.title,
    'description': article.meta.excerpt,
    'author': { '@type': 'Person', 'name': article.meta.author, 'url': 'https://nicosdigit.com' },
    'datePublished': article.meta.date,
    'publisher': { '@type': 'Organization', 'name': 'NicosDigit', 'url': 'https://nicosdigit.com' },
    'url': canonical,
    'inLanguage': lang,
    'articleSection': article.meta.categoryLabel,
  });

  const relatedCards = related.map((a, i) => {
    const rtags = Array.isArray(a.meta.tags) ? a.meta.tags : [];
    return `
    <a href="${basePath}/${a.meta.slug}/" class="blog-card" data-anim data-delay="${i + 1}">
      <div class="blog-card__img">${articleIconSVG(a.meta.category)}</div>
      <div class="blog-card__body">
        <div class="blog-card__tag">${a.meta.categoryLabel}</div>
        <div class="blog-card__title">${a.meta.title}</div>
        <p class="blog-card__excerpt">${a.meta.excerpt}</p>
        <div class="blog-card__meta"><span>${formatDate(a.meta.date, lang)}</span> · <span>${a.meta.readingTime} min ${isIT ? 'di lettura' : 'read'}</span></div>
        ${rtags.length ? `<div class="blog-card__tag-spans">${rtags.slice(0,3).map(t=>`<span class="blog-card__tag-span">${prettyTag(t)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="blog-card__footer">${isIT ? 'Leggi' : 'Read'} →</div>
    </a>`;
  }).join('');

  return `${sharedHead(lang, article.meta.title + ' — NicosDigit', article.meta.excerpt, canonical, article.meta.image || null, hreflangLinks)}
  <script type="application/ld+json">${jsonLd}</script>
  <style>${SHARED_CSS}${BLOG_CSS}</style>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KCSZKMWQ" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<div class="reading-progress" id="reading-progress" aria-hidden="true"></div>
${navHTML(lang, basePath)}

<div style="padding-top:72px;">
  <div class="article-hero">
    <div class="container">
      <nav class="article-breadcrumb" aria-label="Breadcrumb">
        <a href="${isIT ? '/it/' : '/'}">${isIT ? 'Home' : 'Home'}</a>
        <span class="article-breadcrumb__sep" aria-hidden="true">›</span>
        <a href="${basePath}/">Blog</a>
        <span class="article-breadcrumb__sep" aria-hidden="true">›</span>
        <a href="${basePath}/category/${article.meta.category}/">${article.meta.categoryLabel}</a>
        <span class="article-breadcrumb__sep" aria-hidden="true">›</span>
        <span aria-current="page">${article.meta.title.substring(0, 40)}${article.meta.title.length > 40 ? '…' : ''}</span>
      </nav>
      <span class="article-hero__tag">${article.meta.categoryLabel}</span>
      <h1 class="article-hero__title">${article.meta.title}</h1>
      <div class="article-hero__meta">
        <span class="article-hero__meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          ${article.meta.author}
        </span>
        <span class="article-hero__meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${formatDate(article.meta.date, lang)}
        </span>
        <span class="article-hero__meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${article.meta.readingTime} min ${isIT ? 'di lettura' : 'read'}
        </span>
      </div>
      ${Array.isArray(article.meta.tags) && article.meta.tags.length ? `<div class="article-hero__tags" aria-label="${isIT ? 'Tag' : 'Tags'}">${article.meta.tags.map(t=>`<a href="${basePath}/tag/${slugify(t)}/" class="article-tag">${prettyTag(t)}</a>`).join('')}</div>` : ''}
    </div>
  </div>

  <div class="container">
    <div class="article-layout" id="article-main">
      <main>
        <article class="article-body" id="article-body">
          ${processedHtml}
        </article>

        <div class="article-share">
          <p class="article-share__title">${isIT ? 'Condividi questo articolo' : 'Share this article'}</p>
          <div class="article-share__btns">
            <button class="share-btn" onclick="navigator.share ? navigator.share({title:document.title,url:location.href}) : navigator.clipboard.writeText(location.href).then(()=>alert('${isIT ? 'Link copiato!' : 'Link copied!'}')).catch(()=>{})" aria-label="${isIT ? 'Condividi' : 'Share'}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              ${isIT ? 'Condividi' : 'Share'}
            </button>
            <a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">LinkedIn</a>
            <a class="share-btn" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(article.meta.title)}" target="_blank" rel="noopener" aria-label="Share on X">X / Twitter</a>
          </div>
        </div>

        <div class="newsletter-inline" data-anim>
          <h3 class="newsletter-inline__title">${isIT ? 'Ricevi i nostri prossimi articoli.' : 'Get our next articles.'}</h3>
          <p class="newsletter-inline__sub">${isIT ? 'Niente spam. Solo articoli pratici su paid advertising, tracciamento e crescita — quando li pubblichiamo.' : 'No spam. Just practical articles on paid advertising, tracking and growth — when we publish them.'}</p>
          <form class="newsletter-inline__form" onsubmit="event.preventDefault();this.innerHTML='<p style=color:var(--green);font-weight:600>${isIT ? 'Grazie! Ti aggiungiamo alla lista.' : 'Thanks! We will add you to the list.'}.</p>'">
            <input class="newsletter-inline__input" type="email" placeholder="${isIT ? 'La tua email' : 'Your email'}" required aria-label="${isIT ? 'Indirizzo email' : 'Email address'}">
            <button class="newsletter-inline__btn" type="submit">${isIT ? 'Iscriviti' : 'Subscribe'}</button>
          </form>
        </div>

        <div class="author-box" data-anim>
          <div class="author-box__avatar" aria-hidden="true">N</div>
          <div>
            <div class="author-box__name">${article.meta.author}</div>
            <p class="author-box__bio">${isIT ? 'Consulente di paid advertising specializzato in Google Ads, Meta Ads e landing page. Lavoro con aziende in tutta Europa per costruire sistemi pubblicitari che generano risultati misurabili.' : 'Paid advertising consultant specialising in Google Ads, Meta Ads and landing pages. I work with businesses across Europe to build advertising systems that produce measurable results.'}</p>
          </div>
        </div>

        ${(prev || next) ? `<nav class="article-nav" aria-label="${isIT ? 'Navigazione articoli' : 'Article navigation'}">
          ${prev ? `<a class="article-nav__item" href="${basePath}/${prev.meta.slug}/">
            <div class="article-nav__label">← ${isIT ? 'Precedente' : 'Previous'}</div>
            <div class="article-nav__title">${prev.meta.title}</div>
          </a>` : '<span></span>'}
          ${next ? `<a class="article-nav__item article-nav__item--next" href="${basePath}/${next.meta.slug}/">
            <div class="article-nav__label">${isIT ? 'Successivo' : 'Next'} →</div>
            <div class="article-nav__title">${next.meta.title}</div>
          </a>` : '<span></span>'}
        </nav>` : ''}

        ${related.length > 0 ? `
        <section style="margin-top:4rem;" aria-labelledby="related-heading">
          <div class="eyebrow">${isIT ? 'Articoli correlati' : 'Related articles'}</div>
          <div class="related-grid">${relatedCards}</div>
        </section>` : ''}
      </main>

      <aside>${toc}</aside>
    </div>
  </div>
</div>

${footerHTML(lang)}
${SHARED_JS}
<script>
  // Reading progress
  const prog=document.getElementById('reading-progress');
  const body=document.getElementById('article-body');
  window.addEventListener('scroll',function(){
    if(!body||!prog)return;
    const top=body.getBoundingClientRect().top+window.scrollY;
    const h=body.offsetHeight;
    const p=Math.min(100,Math.max(0,((window.scrollY-top)/h)*100));
    prog.style.width=p+'%';
  },{passive:true});
  // TOC active link
  const tocLinks=document.querySelectorAll('.toc__link');
  if(tocLinks.length){
    const headings=[...document.querySelectorAll('.article-body h2[id],article-body h3[id]')];
    window.addEventListener('scroll',function(){
      const pos=window.scrollY+120;
      let active=headings[0];
      headings.forEach(h=>{if(h.offsetTop<=pos)active=h;});
      tocLinks.forEach(l=>{l.classList.toggle('is-active',l.getAttribute('href')==='#'+( active&&active.id));});
    },{passive:true});
  }
</script>
</body>
</html>`;
}

// ── Build category page ────────────────────────────────────────
function buildCategory(category, catLabel, articles, lang) {
  const isIT = lang === 'it';
  const basePath = isIT ? '/it/blog' : '/blog';
  const canonical = `https://nicosdigit.com${basePath}/category/${category}/`;
  const title = `${catLabel} — Blog NicosDigit`;
  const desc = isIT
    ? `Tutti gli articoli su ${catLabel}. Leggi le nostre guide pratiche.`
    : `All articles about ${catLabel}. Read our practical guides.`;

  const cards = articles.map((a, i) => `
    <a href="${basePath}/${a.meta.slug}/" class="blog-card" data-anim data-delay="${(i%3)+1}">
      <div class="blog-card__img">${articleIconSVG(a.meta.category)}</div>
      <div class="blog-card__body">
        <div class="blog-card__tag">${a.meta.categoryLabel}</div>
        <div class="blog-card__title">${a.meta.title}</div>
        <p class="blog-card__excerpt">${a.meta.excerpt}</p>
        <div class="blog-card__meta"><span>${formatDate(a.meta.date, lang)}</span> · <span>${a.meta.readingTime} min ${isIT ? 'di lettura' : 'read'}</span></div>
      </div>
      <div class="blog-card__footer">${isIT ? 'Leggi' : 'Read'} →</div>
    </a>`).join('');

  return `${sharedHead(lang, title, desc, canonical, null)}
  <style>${SHARED_CSS}${BLOG_CSS}</style>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KCSZKMWQ" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
${navHTML(lang, basePath)}
<div style="padding-top:72px;">
  <div class="cat-hero">
    <div class="container" data-anim>
      <nav class="article-breadcrumb"><a href="${isIT ? '/it/' : '/'}">${isIT ? 'Home' : 'Home'}</a><span class="article-breadcrumb__sep">›</span><a href="${basePath}/">Blog</a><span class="article-breadcrumb__sep">›</span><span aria-current="page">${catLabel}</span></nav>
      <div class="eyebrow" style="margin-top:1.5rem;">${isIT ? 'Categoria' : 'Category'}</div>
      <h1 class="h2">${catLabel}</h1>
      <p class="sec-lead">${articles.length} ${isIT ? `articol${articles.length !== 1 ? 'i' : 'o'}` : `article${articles.length !== 1 ? 's' : ''}`}</p>
    </div>
  </div>
  <section class="section"><div class="container"><div class="blog-grid">${cards}</div></div></section>
</div>
${footerHTML(lang)}
${SHARED_JS}
</body></html>`;
}

// ── Build tag page ─────────────────────────────────────────────
function buildTag(tagSlug, tagLabel, articles, lang, sharedWithOtherLang) {
  const isIT = lang === 'it';
  const basePath = isIT ? '/it/blog' : '/blog';
  const canonical = `https://nicosdigit.com${basePath}/tag/${tagSlug}/`;
  const title = `${tagLabel} — Blog NicosDigit`;
  const desc = isIT
    ? `Tutti gli articoli con il tag "${tagLabel}". Approfondimenti pratici su Google Ads, Meta Ads e digital marketing.`
    : `All articles tagged "${tagLabel}". Practical insights on Google Ads, Meta Ads and digital marketing.`;

  // hreflang: cross-reference both langs when the slug exists in both
  let hreflangLinks;
  if (sharedWithOtherLang) {
    const enUrl = `https://nicosdigit.com/blog/tag/${tagSlug}/`;
    const itUrl = `https://nicosdigit.com/it/blog/tag/${tagSlug}/`;
    hreflangLinks = `<link rel="alternate" hreflang="en" href="${enUrl}">\n  <link rel="alternate" hreflang="it" href="${itUrl}">\n  <link rel="alternate" hreflang="x-default" href="${enUrl}">`;
  } else {
    hreflangLinks = `<link rel="alternate" hreflang="${lang}" href="${canonical}">\n  <link rel="alternate" hreflang="x-default" href="${canonical}">`;
  }

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': title,
    'description': desc,
    'url': canonical,
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {'@type':'ListItem','position':1,'name':'Home','item': isIT ? 'https://nicosdigit.com/it/' : 'https://nicosdigit.com/'},
        {'@type':'ListItem','position':2,'name':'Blog','item':`https://nicosdigit.com${basePath}/`},
        {'@type':'ListItem','position':3,'name': isIT ? 'Tag' : 'Tag','item':`https://nicosdigit.com${basePath}/tag/`},
        {'@type':'ListItem','position':4,'name':tagLabel,'item':canonical}
      ]
    }
  });

  const cards = articles.map((a, i) => {
    const atags = Array.isArray(a.meta.tags) ? a.meta.tags : [];
    return `
    <a href="${basePath}/${a.meta.slug}/" class="blog-card" data-anim data-delay="${(i%3)+1}">
      <div class="blog-card__img">${articleIconSVG(a.meta.category)}</div>
      <div class="blog-card__body">
        <div class="blog-card__tag">${a.meta.categoryLabel}</div>
        <div class="blog-card__title">${a.meta.title}</div>
        <p class="blog-card__excerpt">${a.meta.excerpt}</p>
        <div class="blog-card__meta"><span>${formatDate(a.meta.date, lang)}</span> · <span>${a.meta.readingTime} min ${isIT ? 'di lettura' : 'read'}</span></div>
        ${atags.length ? `<div class="blog-card__tag-spans">${atags.slice(0,3).map(t=>`<span class="blog-card__tag-span">${prettyTag(t)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="blog-card__footer">${isIT ? 'Leggi' : 'Read'} →</div>
    </a>`;
  }).join('');

  return `${sharedHead(lang, title, desc, canonical, null, hreflangLinks)}
  <script type="application/ld+json">${jsonLd}</script>
  <style>${SHARED_CSS}${BLOG_CSS}</style>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KCSZKMWQ" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
${navHTML(lang, basePath)}
<div style="padding-top:72px;">
  <div class="tag-hero">
    <div class="container" data-anim>
      <nav class="article-breadcrumb" aria-label="${isIT ? 'Percorso' : 'Breadcrumb'}">
        <a href="${isIT ? '/it/' : '/'}">${isIT ? 'Home' : 'Home'}</a>
        <span class="article-breadcrumb__sep" aria-hidden="true">›</span>
        <a href="${basePath}/">Blog</a>
        <span class="article-breadcrumb__sep" aria-hidden="true">›</span>
        <span aria-current="page">${tagLabel}</span>
      </nav>
      <div class="eyebrow" style="margin-top:1.5rem;">${isIT ? 'Tag' : 'Tag'}</div>
      <h1 class="h2">${tagLabel}</h1>
      <p class="sec-lead">${articles.length} ${isIT ? `articol${articles.length !== 1 ? 'i' : 'o'} con questo tag` : `article${articles.length !== 1 ? 's' : ''} with this tag`}</p>
    </div>
  </div>
  <section class="section"><div class="container"><div class="blog-grid">${cards}</div></div></section>
</div>
${footerHTML(lang)}
${SHARED_JS}
</body></html>`;
}

// ── Build search page ──────────────────────────────────────────
function buildSearch(articles, lang) {
  const isIT = lang === 'it';
  const basePath = isIT ? '/it/blog' : '/blog';
  const canonical = `https://nicosdigit.com${basePath}/search/`;
  const title = isIT ? 'Cerca — Blog NicosDigit' : 'Search — NicosDigit Blog';
  const desc = isIT ? 'Cerca nei nostri articoli su Google Ads, Meta Ads e paid advertising.' : 'Search our articles on Google Ads, Meta Ads and paid advertising.';

  const articlesJson = JSON.stringify(articles.map(a => ({
    title: a.meta.title,
    excerpt: a.meta.excerpt,
    category: a.meta.categoryLabel,
    date: a.meta.date,
    slug: `${basePath}/${a.meta.slug}/`,
    readingTime: a.meta.readingTime,
  })));

  return `${sharedHead(lang, title, desc, canonical, null)}
  <style>${SHARED_CSS}${BLOG_CSS}
    .search-results{display:flex;flex-direction:column;gap:1.25rem;margin-top:2rem;}
    .search-result{border:1px solid var(--grey-line);border-radius:12px;padding:1.5rem;transition:border-color 0.2s,transform 0.2s;text-decoration:none;color:inherit;display:block;}
    .search-result:hover{border-color:var(--green);transform:translateX(4px);}
    .search-result__tag{font-size:0.69rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--green-dark);margin-bottom:0.5rem;}
    .search-result__title{font-family:'Archivo Black',sans-serif;font-size:1rem;letter-spacing:-0.02em;color:var(--ink);margin-bottom:0.5rem;}
    .search-result__excerpt{font-size:0.88rem;line-height:1.6;color:var(--grey);}
    .search-result__meta{font-size:0.78rem;color:var(--grey);margin-top:0.5rem;}
    .search-empty{text-align:center;padding:4rem 1rem;color:var(--grey);}
  </style>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KCSZKMWQ" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
${navHTML(lang, basePath)}
<div style="padding-top:72px;">
  <div class="search-hero">
    <div class="container">
      <div class="eyebrow">${isIT ? 'Ricerca' : 'Search'}</div>
      <h1 class="h2">${isIT ? 'Cerca nel blog.' : 'Search the blog.'}</h1>
      <form class="search-form" id="search-form" role="search" aria-label="${isIT ? 'Ricerca articoli' : 'Search articles'}">
        <input class="search-input" type="search" id="search-input" placeholder="${isIT ? 'Cerca articoli…' : 'Search articles…'}" autocomplete="off" aria-label="${isIT ? 'Testo da cercare' : 'Search text'}">
        <button class="search-btn" type="submit">${isIT ? 'Cerca' : 'Search'}</button>
      </form>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div id="search-results" aria-live="polite"></div>
    </div>
  </section>
</div>
${footerHTML(lang)}
${SHARED_JS}
<script>
const ARTICLES=${articlesJson};
const results=document.getElementById('search-results');
const input=document.getElementById('search-input');
function search(q){
  if(!q||q.length<2){results.innerHTML='';return;}
  const lq=q.toLowerCase();
  const found=ARTICLES.filter(a=>a.title.toLowerCase().includes(lq)||a.excerpt.toLowerCase().includes(lq)||a.category.toLowerCase().includes(lq));
  if(!found.length){results.innerHTML='<div class="search-empty"><p>${isIT ? 'Nessun risultato trovato.' : 'No results found.'}</p></div>';return;}
  results.innerHTML='<p style="font-size:0.88rem;color:var(--grey);margin-bottom:1rem;">'+found.length+' ${isIT ? 'risultat' : 'result'}'+( found.length!==1?(isIT?'i':'s'):'')+ ' ${isIT ? 'per' : 'for'} "'+q+'"</p><div class="search-results">'+found.map(a=>'<a href="'+a.slug+'" class="search-result"><div class="search-result__tag">'+a.category+'</div><div class="search-result__title">'+a.title+'</div><p class="search-result__excerpt">'+a.excerpt+'</p><div class="search-result__meta">'+new Date(a.date).toLocaleDateString("${lang === 'it' ? 'it-IT' : 'en-GB'}",{year:"numeric",month:"long",day:"numeric"})+ ' · '+a.readingTime+' min ${isIT ? 'di lettura' : 'read'}</div></a>').join('')+'</div>';
}
document.getElementById('search-form').addEventListener('submit',function(e){e.preventDefault();search(input.value.trim());});
input.addEventListener('input',function(){search(this.value.trim());});
const urlQ=new URLSearchParams(location.search).get('q');
if(urlQ){input.value=urlQ;search(urlQ);}
</script>
</body></html>`;
}

// ── Main build logic ───────────────────────────────────────────
function ensure(dir) { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); }

function loadArticles(dir, lang) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = readFileSync(join(dir, f), 'utf8');
      const { meta, content } = parseFrontmatter(raw);
      if (!meta.readingTime) meta.readingTime = calcReadingTime(content);
      return { meta, content, lang };
    })
    .sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));
}

function buildLang(lang) {
  const contentDir = join(__dirname, 'content', 'blog', lang);
  const outputDir = lang === 'en' ? join(__dirname, 'blog') : join(__dirname, 'it', 'blog');

  const articles = loadArticles(contentDir, lang);
  if (!articles.length) { console.log(`[${lang}] No articles found.`); return { articles: [], tags: {}, outputDir }; }

  // Blog index
  ensure(outputDir);
  writeFileSync(join(outputDir, 'index.html'), buildIndex(articles, lang));
  console.log(`[${lang}] blog/index.html`);

  // Article pages
  articles.forEach(a => {
    const dir = join(outputDir, a.meta.slug);
    ensure(dir);
    writeFileSync(join(dir, 'index.html'), buildArticle(a, articles, lang));
    console.log(`[${lang}] blog/${a.meta.slug}/index.html`);
  });

  // Category pages
  const cats = {};
  articles.forEach(a => {
    if (!cats[a.meta.category]) cats[a.meta.category] = { label: a.meta.categoryLabel, articles: [] };
    cats[a.meta.category].articles.push(a);
  });
  Object.entries(cats).forEach(([slug, {label, articles: catArticles}]) => {
    const dir = join(outputDir, 'category', slug);
    ensure(dir);
    writeFileSync(join(dir, 'index.html'), buildCategory(slug, label, catArticles, lang));
    console.log(`[${lang}] blog/category/${slug}/index.html`);
  });

  // Search page
  const searchDir = join(outputDir, 'search');
  ensure(searchDir);
  writeFileSync(join(searchDir, 'index.html'), buildSearch(articles, lang));
  console.log(`[${lang}] blog/search/index.html`);

  // Collect tags (normalize slug, use first seen label)
  const tags = {};
  articles.forEach(a => {
    const tagList = Array.isArray(a.meta.tags) ? a.meta.tags : [];
    tagList.forEach(tag => {
      const s = slugify(tag);
      if (!s) return;
      if (!tags[s]) tags[s] = { label: prettyTag(tag), articles: [] };
      tags[s].articles.push(a);
    });
  });

  return { articles, tags, outputDir };
}

// ── Build both languages ───────────────────────────────────────
console.log('Building blog...');
const { articles: enArticles, tags: enTags, outputDir: enOutputDir } = buildLang('en');
const { articles: itArticles, tags: itTags, outputDir: itOutputDir } = buildLang('it');

// ── Generate tag pages ─────────────────────────────────────────
const sharedTagSlugs = new Set(Object.keys(enTags).filter(s => itTags[s]));
const enTagEntries = [];
const itTagEntries = [];

Object.entries(enTags).forEach(([slug, {label, articles: tagArts}]) => {
  if (!tagArts.length) return;
  const dir = join(enOutputDir, 'tag', slug);
  ensure(dir);
  writeFileSync(join(dir, 'index.html'), buildTag(slug, label, tagArts, 'en', sharedTagSlugs.has(slug)));
  console.log(`[en] blog/tag/${slug}/index.html`);
  enTagEntries.push({ url: `https://nicosdigit.com/blog/tag/${slug}/`, priority: '0.6', changefreq: 'monthly' });
});

Object.entries(itTags).forEach(([slug, {label, articles: tagArts}]) => {
  if (!tagArts.length) return;
  const dir = join(itOutputDir, 'tag', slug);
  ensure(dir);
  writeFileSync(join(dir, 'index.html'), buildTag(slug, label, tagArts, 'it', sharedTagSlugs.has(slug)));
  console.log(`[it] blog/tag/${slug}/index.html`);
  itTagEntries.push({ url: `https://nicosdigit.com/it/blog/tag/${slug}/`, priority: '0.6', changefreq: 'monthly' });
});

console.log(`\nTag pages: ${enTagEntries.length} EN, ${itTagEntries.length} IT`);
console.log(`Shared tag slugs: ${[...sharedTagSlugs].join(', ')}`);

// ── Generate sitemap.xml ───────────────────────────────────────
const sitemapEntries = [
  { url: 'https://nicosdigit.com/', priority: '1.0', changefreq: 'weekly' },
  { url: 'https://nicosdigit.com/it/', priority: '1.0', changefreq: 'weekly' },
  { url: 'https://nicosdigit.com/case-studies/', priority: '0.9', changefreq: 'monthly' },
  { url: 'https://nicosdigit.com/it/case-studies/', priority: '0.9', changefreq: 'monthly' },
  { url: 'https://nicosdigit.com/blog/', priority: '0.9', changefreq: 'weekly' },
  { url: 'https://nicosdigit.com/it/blog/', priority: '0.9', changefreq: 'weekly' },
  { url: 'https://nicosdigit.com/blog/search/', priority: '0.5', changefreq: 'monthly' },
  { url: 'https://nicosdigit.com/it/blog/search/', priority: '0.5', changefreq: 'monthly' },
];
enArticles.forEach(a => sitemapEntries.push({ url: `https://nicosdigit.com/blog/${a.meta.slug}/`, priority: '0.8', changefreq: 'monthly', lastmod: a.meta.date }));
itArticles.forEach(a => sitemapEntries.push({ url: `https://nicosdigit.com/it/blog/${a.meta.slug}/`, priority: '0.8', changefreq: 'monthly', lastmod: a.meta.date }));
enTagEntries.forEach(e => sitemapEntries.push(e));
itTagEntries.forEach(e => sitemapEntries.push(e));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.map(e => `  <url>
    <loc>${e.url}</loc>
    ${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
writeFileSync(join(__dirname, 'sitemap.xml'), sitemap);
console.log('sitemap.xml');

// ── Generate robots.txt ────────────────────────────────────────
const robots = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://nicosdigit.com/sitemap.xml`;
writeFileSync(join(__dirname, 'robots.txt'), robots);
console.log('robots.txt');

// ── Generate RSS feed ──────────────────────────────────────────
const rssItems = enArticles.map(a => `  <item>
    <title><![CDATA[${a.meta.title}]]></title>
    <link>https://nicosdigit.com/blog/${a.meta.slug}/</link>
    <guid>https://nicosdigit.com/blog/${a.meta.slug}/</guid>
    <description><![CDATA[${a.meta.excerpt}]]></description>
    <pubDate>${new Date(a.meta.date).toUTCString()}</pubDate>
    <author>nicoladimattia8@gmail.com (${a.meta.author})</author>
    <category>${a.meta.categoryLabel}</category>
  </item>`).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NicosDigit Blog</title>
    <link>https://nicosdigit.com/blog/</link>
    <description>Practical articles on Google Ads, Meta Ads, tracking and strategy.</description>
    <language>en-GB</language>
    <atom:link href="https://nicosdigit.com/rss.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>nicoladimattia8@gmail.com (Nicola Dimattia)</managingEditor>
    <copyright>© 2025 Nicola Dimattia</copyright>
${rssItems}
  </channel>
</rss>`;
writeFileSync(join(__dirname, 'rss.xml'), rss);
console.log('rss.xml');

console.log('Done!');
