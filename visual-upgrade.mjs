import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function buildUpgrade(c1, c2, c3, sectorColor) {
  const rgb = hexToRgb(sectorColor);

  const css = `
/* ===== VISUAL UPGRADE ===== */
/* 1. Hero gradient */
.hero {
  background: linear-gradient(135deg, ${c1} 0%, ${c2} 45%, ${c3} 100%) !important;
  min-height: 100svh !important;
}

/* 2. Frosted glass cards */
.carousel-card {
  background: rgba(255,255,255,0.72) !important;
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.45) !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04) !important;
}
.carousel-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 16px 40px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05) !important;
  border-color: rgba(255,255,255,0.7) !important;
}

/* 3. Button glow on hover */
.btn--solid:hover {
  box-shadow: 0 8px 28px rgba(0,0,0,0.14), 0 0 22px rgba(${rgb},0.32) !important;
}
.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.12), 0 0 20px rgba(${rgb},0.3) !important;
}
.btn-hdr:hover {
  box-shadow: 0 0 18px rgba(${rgb},0.28) !important;
}
.trust-btn:hover {
  box-shadow: 0 0 26px rgba(${rgb},0.45) !important;
  opacity: 0.88 !important;
  transform: translateY(-2px) !important;
}

/* 4. Button active scale (desktop + touch) */
.btn:active, .btn--solid:active, .btn--ghost:active {
  transform: scale(0.97) translateY(0) !important;
  transition-duration: 80ms !important;
}
.btn-primary:active, .btn-outline:active {
  transform: scale(0.97) !important;
  transition-duration: 80ms !important;
}
.btn-hdr:active, .trust-btn:active {
  transform: scale(0.97) !important;
  transition-duration: 80ms !important;
}

/* 5. Touch devices — card lift on tap */
@media (hover: none) {
  .carousel-card:active {
    transform: translateY(-3px) !important;
    box-shadow: 0 14px 36px rgba(0,0,0,0.1) !important;
    transition: transform 0.1s ease, box-shadow 0.1s ease !important;
  }
}

/* 6. Trust bar photo ambient glow */
@keyframes photoGlow {
  0%, 100% { box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 0 0 0 rgba(${rgb},0.3); }
  50%       { box-shadow: 0 4px 16px rgba(0,0,0,0.07), 0 0 0 10px rgba(${rgb},0); }
}
.trust-wrap img {
  animation: photoGlow 3s ease-in-out infinite !important;
}

/* 7. Method step hover lift */
.method__step {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s !important;
}
.method__step:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.07) !important;
}

/* 8. Mock-up hover depth */
.maps-mock:hover,
.ads-showcase-grid > div:hover {
  box-shadow: 0 10px 36px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05) !important;
  transition: box-shadow 0.2s ease;
}

/* 9. Footer link underline slide (for pages that don't have it yet) */
.footer__links a {
  position: relative;
  display: inline-block;
}
.footer__links a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 1px;
  background: var(--green);
  transition: width 0.25s ease;
}
.footer__links a:hover::after { width: 100%; }

/* 10. Icon color shift */
.method__step:hover .ti,
.bigstats__cell:hover .ti {
  color: var(--green);
  transition: color 0.2s;
}

/* 11. CTA section glow on primary buttons */
.cta-final .btn--solid:hover,
.cta-section .btn-primary:hover {
  box-shadow: 0 0 32px rgba(${rgb},0.4) !important;
}

/* 12. Mobile hero coverage */
@media (max-width: 767px) {
  .hero { min-height: 100svh !important; }
}

/* 13. Prefers-reduced-motion — disable everything */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  [data-anim] { opacity: 1 !important; transform: none !important; }
  .trust-wrap img { animation: none !important; }
  .hero { min-height: auto !important; }
}`;

  const js = `
/* ===== VISUAL UPGRADE JS ===== */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Touch lift for cards — gives tactile feedback on mobile
  function addTouchLift(selector) {
    document.querySelectorAll(selector).forEach(function(el) {
      var resetTimer;
      el.addEventListener('touchstart', function() {
        clearTimeout(resetTimer);
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = '0 14px 36px rgba(0,0,0,0.1)';
        el.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
      }, { passive: true });
      el.addEventListener('touchend', function() {
        resetTimer = setTimeout(function() {
          el.style.transform = '';
          el.style.boxShadow = '';
        }, 200);
      }, { passive: true });
    });
  }

  // Touch scale for buttons
  function addTouchScale(selector) {
    document.querySelectorAll(selector).forEach(function(el) {
      el.addEventListener('touchstart', function() {
        el.style.transform = 'scale(0.97)';
        el.style.transition = 'transform 0.08s ease';
      }, { passive: true });
      el.addEventListener('touchend', function() {
        setTimeout(function() { el.style.transform = ''; }, 150);
      }, { passive: true });
    });
  }

  // Staggered reveal for section children
  var staggerObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var kids = entry.target.querySelectorAll(':scope > *');
      kids.forEach(function(kid, i) {
        kid.style.transitionDelay = (i * 90) + 'ms';
        kid.style.opacity = '0';
        kid.style.transform = 'translateY(20px)';
        kid.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            kid.style.opacity = '';
            kid.style.transform = '';
          });
        });
      });
      staggerObs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.bigstats, .method, .hero__strip').forEach(function(el) {
    staggerObs.observe(el);
  });

  addTouchLift('.carousel-card, .method__step, .maps-mock');
  addTouchScale('.btn, .btn--solid, .btn--ghost, .btn-primary, .btn-outline, .btn-hdr, .trust-btn');
})();`;

  return { css, js };
}

const pages = [
  { file: 'index.html',              gradients: ['#f5f0eb','#ffffff','#e8eef5'],   color: '#33C494' },
  { file: 'dentist/index.html',      gradients: ['#ddeeff','#eef6ff','#c8dff5'],   color: '#1a73e8' },
  { file: 'dentist-en/index.html',   gradients: ['#ddeeff','#eef6ff','#c8dff5'],   color: '#1a73e8' },
  { file: 'ristorante/index.html',   gradients: ['#fde8d8','#fff3ee','#f5cdb0'],   color: '#e8471a' },
  { file: 'restaurant/index.html',   gradients: ['#fde8d8','#fff3ee','#f5cdb0'],   color: '#e8471a' },
  { file: 'avvocati/index.html',     gradients: ['#dde2f0','#eef0f8','#c8cfea'],   color: '#1a237e' },
  { file: 'lawyers/index.html',      gradients: ['#dde2f0','#eef0f8','#c8cfea'],   color: '#1a237e' },
  { file: 'idraulico/index.html',    gradients: ['#d8eedc','#eef8ef','#c0e0c5'],   color: '#2e7d32' },
  { file: 'plumber/index.html',      gradients: ['#d8eedc','#eef8ef','#c0e0c5'],   color: '#2e7d32' },
  { file: 'palestra/index.html',     gradients: ['#ead8f5','#f5eeff','#d8bfee'],   color: '#7b1fa2' },
  { file: 'gym/index.html',          gradients: ['#ead8f5','#f5eeff','#d8bfee'],   color: '#7b1fa2' },
  { file: 'estetica/index.html',     gradients: ['#fdd8e8','#fff0f5','#f5c0d5'],   color: '#c2185b' },
  { file: 'beauty/index.html',       gradients: ['#fdd8e8','#fff0f5','#f5c0d5'],   color: '#c2185b' },
  { file: 'fisioterapia/index.html', gradients: ['#d8f0ee','#eefaf8','#b8e0dc'],   color: '#00796b' },
  { file: 'physiotherapy/index.html',gradients: ['#d8f0ee','#eefaf8','#b8e0dc'],   color: '#00796b' },
  { file: 'hotel/index.html',        gradients: ['#fdecd8','#fff8ee','#f5d8b0'],   color: '#f57f17' },
  { file: 'hotel-en/index.html',     gradients: ['#fdecd8','#fff8ee','#f5d8b0'],   color: '#f57f17' },
  { file: 'immobiliare/index.html',  gradients: ['#ede0d8','#f8f2ee','#e0cec5'],   color: '#5d4037' },
  { file: 'real-estate/index.html',  gradients: ['#ede0d8','#f8f2ee','#e0cec5'],   color: '#5d4037' },
];

let ok = 0, skipped = 0, err = 0;

for (const page of pages) {
  const filePath = resolve(ROOT, page.file);
  let html;
  try { html = readFileSync(filePath, 'utf8'); }
  catch (e) { console.error(`SKIP (read): ${page.file}`); err++; continue; }

  if (html.includes('<!-- VISUAL UPGRADE -->')) {
    // Already upgraded — re-inject to update (remove old block first)
    const startMarker = '\n<!-- VISUAL UPGRADE -->';
    const endCSSMarker = '\n</style>\n<!-- /VISUAL UPGRADE CSS -->';
    const endJSMarker = '\n<!-- /VISUAL UPGRADE JS -->\n';
    // Simple approach: always remove and re-inject
    html = html
      .replace(/\n<!-- VISUAL UPGRADE -->[\s\S]*?<!-- \/VISUAL UPGRADE CSS -->\n<\/style>/m, '')
      .replace(/\n<!-- VISUAL UPGRADE JS -->[\s\S]*?<!-- \/VISUAL UPGRADE JS -->/m, '');
    if (html.includes('<!-- VISUAL UPGRADE -->')) {
      console.log(`SKIP (partial marker): ${page.file}`);
      skipped++; continue;
    }
  }

  const { css, js } = buildUpgrade(...page.gradients, page.color);

  const cssBlock = `\n<!-- VISUAL UPGRADE --><style>${css}\n</style>\n<!-- /VISUAL UPGRADE CSS -->`;
  const jsBlock  = `\n<!-- VISUAL UPGRADE JS --><script>${js}\n<\/script>\n<!-- /VISUAL UPGRADE JS -->`;

  if (!html.includes('</head>')) { console.error(`SKIP (no </head>): ${page.file}`); err++; continue; }
  if (!html.includes('</body>'))  { console.error(`SKIP (no </body>): ${page.file}`); err++; continue; }

  html = html.replace('</head>', cssBlock + '\n</head>');
  html = html.replace('</body>', jsBlock  + '\n</body>');

  try {
    writeFileSync(filePath, html, 'utf8');
    console.log(`OK: ${page.file}`);
    ok++;
  } catch (e) {
    console.error(`SKIP (write): ${page.file} — ${e.message}`);
    err++;
  }
}

console.log(`\nDone: ${ok} upgraded, ${skipped} skipped, ${err} errors.`);
