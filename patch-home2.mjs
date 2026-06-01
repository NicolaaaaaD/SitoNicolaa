import { readFileSync, writeFileSync } from 'fs';

function patch(file, fn) {
  const h = fn(readFileSync(file, 'utf8'));
  writeFileSync(file, h, 'utf8');
  console.log('OK:', file);
}

const PRICE_CSS = `
    /* Hero price — large single featured stat */
    .hero__price { padding-top: 2.5rem; border-top: 1px solid var(--grey-line); max-width: 400px; }
    .hero__price-num { font-family: 'Archivo Black', sans-serif; font-size: clamp(3.5rem, 7vw, 5.5rem); line-height: 0.88; letter-spacing: -0.045em; color: var(--coral); margin-bottom: 0.5rem; }
    .hero__price-lab { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--grey); }
    /* Tap targets */
    .btn-hdr { min-height: 44px; }
    .lang-switch { min-height: 44px; }
    /* Prevent horizontal overflow */
    html { overflow-x: hidden; }
    /* Extra small screens */
    @media (max-width: 390px) { .hero__h1 { font-size: 2.2rem !important; } }`;

/* ─── EN: index.html ─── */
patch('index.html', h => {
  // Fix <title>
  h = h.replace(
    '<title>Professional Website for Your Business — $299/month | Nicos Digital</title>',
    '<title>Professional Website for Your Business — €299 One-Time | Nicos Digital</title>'
  );

  // Add OG + Twitter + x-default after existing hreflang tags
  h = h.replace(
    '  <link rel="alternate" hreflang="it" href="https://nicosdigit.com/it">',
    `  <link rel="alternate" hreflang="it" href="https://nicosdigit.com/it">
  <link rel="alternate" hreflang="x-default" href="https://nicosdigit.com/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Professional Website for Your Business — €299 One-Time | Nicos Digital">
  <meta property="og:description" content="A complete professional website — design, SEO and Google Business Profile. Ready to use, yours to keep, for €299.">
  <meta property="og:url" content="https://nicosdigit.com/">
  <meta property="og:site_name" content="Nicos Digital">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Professional Website for Your Business — €299 One-Time | Nicos Digital">
  <meta name="twitter:description" content="A complete professional website — design, SEO and Google Business Profile. Ready to use, yours to keep, for €299.">`
  );

  // Inject new CSS before closing </style> of main block (after 767px rule)
  h = h.replace(
    '    @media (max-width: 767px) { .footer-inner { gap: 8px; } .hero__strip { gap: 1rem 1.5rem; } }',
    '    @media (max-width: 767px) { .footer-inner { gap: 8px; } }' + PRICE_CSS
  );

  // Remove hero pill
  h = h.replace('      <div class="hero__pill">Professional Websites · €299 One-Time</div>\n', '');

  // Replace hero__strip with hero__price
  h = h.replace(
    `      <div class="hero__strip">
        <div class="hero__strip-item"><div class="num">€299<em></em></div><div class="lab">One-time price</div></div>
        <div class="hero__strip-item"><div class="num">4<em></em></div><div class="lab">Features included</div></div>
        <div class="hero__strip-item"><div class="num">Days<em></em></div><div class="lab">From call to live online</div></div>
      </div>`,
    `      <div class="hero__price">
        <div class="hero__price-num">€299</div>
        <div class="hero__price-lab">One-time price, yours forever</div>
      </div>`
  );

  return h;
});

/* ─── IT: it/index.html ─── */
patch('it/index.html', h => {
  // Fix <title>
  h = h.replace(
    '<title>Sito Web Professionale per la Tua Attività — €299/mese | Nicos Digital</title>',
    '<title>Sito Web Professionale per la Tua Attività — €299 Una Tantum | Nicos Digital</title>'
  );

  // Add OG + Twitter + x-default
  h = h.replace(
    '  <link rel="alternate" hreflang="en" href="https://nicosdigit.com/">',
    `  <link rel="alternate" hreflang="en" href="https://nicosdigit.com/">
  <link rel="alternate" hreflang="x-default" href="https://nicosdigit.com/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Sito Web Professionale per la Tua Attività — €299 Una Tantum | Nicos Digital">
  <meta property="og:description" content="Il tuo sito professionale completo — design, SEO e profilo Google. Pronto all'uso, tuo per sempre, a €299.">
  <meta property="og:url" content="https://nicosdigit.com/it">
  <meta property="og:site_name" content="Nicos Digital">
  <meta property="og:locale" content="it_IT">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Sito Web Professionale per la Tua Attività — €299 Una Tantum | Nicos Digital">
  <meta name="twitter:description" content="Il tuo sito professionale completo — design, SEO e profilo Google. Pronto all'uso, tuo per sempre, a €299.">`
  );

  // Inject new CSS
  h = h.replace(
    '    @media (max-width: 767px) { .hero__strip { gap: 1rem 1.5rem; } }',
    '    @media (max-width: 767px) { .footer-inner { gap: 8px; } }' + PRICE_CSS
  );

  // Remove hero pill
  h = h.replace('      <div class="hero__pill">Siti Web Professionali · €299 Una Tantum</div>\n', '');

  // Replace hero__strip with hero__price
  h = h.replace(
    `      <div class="hero__strip">
        <div class="hero__strip-item"><div class="num">€299<em></em></div><div class="lab">Prezzo unico una tantum</div></div>
        <div class="hero__strip-item"><div class="num">4<em></em></div><div class="lab">Funzionalità incluse</div></div>
        <div class="hero__strip-item"><div class="num">Giorni<em></em></div><div class="lab">Dalla call al lancio online</div></div>
      </div>`,
    `      <div class="hero__price">
        <div class="hero__price-num">€299</div>
        <div class="hero__price-lab">Prezzo unico, tuo per sempre</div>
      </div>`
  );

  return h;
});

console.log('Done.');
