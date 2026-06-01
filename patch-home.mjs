import { readFileSync, writeFileSync } from 'fs';

function patch(file, fn) {
  const h = fn(readFileSync(file, 'utf8'));
  writeFileSync(file, h, 'utf8');
  console.log('OK:', file);
}

/* ── EN: index.html ── */
patch('index.html', h => {
  // meta description
  h = h.replace(
    'A professional showcase website — design, hosting, maintenance, SEO and Google Business Profile. All included for $299/month. No big upfront cost.',
    'A professional website for your business — design, SEO and Google Business Profile. A complete, ready-to-use site for €299.'
  );
  // hero lead
  h = h.replace(
    'Design, hosting, maintenance, SEO and your Google profile. <strong>All included, one simple monthly price.</strong>',
    'Design, SEO and your Google profile. <strong>Your complete professional website, yours to keep.</strong>'
  );
  // hero pill
  h = h.replace(
    '<div class="hero__pill">Professional Websites · Done For You</div>',
    '<div class="hero__pill">Professional Websites · €299 One-Time</div>'
  );
  // hero strip — price
  h = h.replace(
    '<div class="num">$299<em>/mo</em></div><div class="lab">All-inclusive monthly price</div>',
    '<div class="num">€299<em></em></div><div class="lab">One-time price</div>'
  );
  // hero strip — features
  h = h.replace(
    '<div class="num">6<em>+</em></div><div class="lab">Features in every plan</div>',
    '<div class="num">4<em></em></div><div class="lab">Features included</div>'
  );
  // marquee — first half
  h = h.replace(
    '    <span class="marquee__item">Hosting Included<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Basic SEO<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Google Business<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Maintenance<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Reviews<span class="marquee__sep"></span></span>\n    <span class="marquee__item">$299/month<span class="marquee__sep"></span></span>',
    '    <span class="marquee__item">Basic SEO<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Google Business<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Reviews<span class="marquee__sep"></span></span>\n    <span class="marquee__item">€299 One-Time<span class="marquee__sep"></span></span>'
  );
  // marquee — second half (duplicate for infinite scroll)
  h = h.replace(
    '    <span class="marquee__item">Hosting Included<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Basic SEO<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Google Business<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Maintenance<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Reviews<span class="marquee__sep"></span></span>\n    <span class="marquee__item">$299/month<span class="marquee__sep"></span></span>',
    '    <span class="marquee__item">Basic SEO<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Google Business<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Reviews<span class="marquee__sep"></span></span>\n    <span class="marquee__item">€299 One-Time<span class="marquee__sep"></span></span>'
  );
  // feat-grid CSS: 2-col on wide screens (4 items)
  h = h.replace(
    '@media (min-width: 880px) { .feat-grid { grid-template-columns: repeat(3,1fr); } }',
    '@media (min-width: 880px) { .feat-grid { grid-template-columns: repeat(2,1fr); } }'
  );
  // included h2
  h = h.replace(
    '<h2 class="h2" style="margin-bottom:3rem">Everything<br>in one place.</h2>',
    '<h2 class="h2" style="margin-bottom:3rem">What\'s<br>included.</h2>'
  );
  // remove hosting + maintenance feat steps
  h = h.replace(
    '      <div class="method__step"><div class="feat-icon"><i class="ti ti-server"></i></div><div class="method__title">Hosting included</div><p class="method__desc">Fast, secure hosting handled for you. Nothing to manage.</p></div>\n      <div class="method__step"><div class="feat-icon"><i class="ti ti-tools"></i></div><div class="method__title">Maintenance &amp; updates</div><p class="method__desc">We keep it updated, secure and online.</p></div>\n      ',
    '      '
  );
  // manifesto quote
  h = h.replace(
    '<div class="manifesto__quote">One price.<br><em>Everything included.</em></div>',
    '<div class="manifesto__quote">One price.<br><em>Done for you.</em></div>'
  );
  // manifesto body
  h = h.replace(
    '<p><strong>$299/month.</strong> No surprise costs, no huge upfront fee. Your website, hosting, SEO and Google Business are all handled by one team — us.</p>\n        <p>We build fast, so you start getting customers sooner. Most sites are live within days of your first call.</p>',
    '<p><strong>€299, once.</strong> No monthly fees, no surprises. We design and build your complete website — design, SEO and Google Business — then it\'s yours.</p>\n        <p>We build fast. Most sites go live within days of your first call.</p>'
  );
  // remove entire examples section
  h = h.replace(
    /\n<!-- EXAMPLES — horizontal scroll gallery -->[\s\S]*?<\/section>\n\n<!-- PRICE RECAP/,
    '\n\n<!-- PRICE RECAP'
  );
  // price big
  h = h.replace(
    '<div class="price-big">$299<span class="price-period">/month</span></div>',
    '<div class="price-big">€299<span class="price-period"> one-time</span></div>'
  );
  // price note
  h = h.replace(
    '<p class="price-note">Everything included — no hidden extras.</p>',
    '<p class="price-note">A complete professional website — yours to keep. Hosting from €5–20/yr.</p>'
  );
  // incl-list: remove Hosting + Maintenance
  h = h.replace('        <li class="incl-item">Hosting</li>\n', '');
  h = h.replace('        <li class="incl-item">Maintenance</li>\n', '');
  // FAQ: "do I own"
  h = h.replace(
    'Yes — it\'s built for your business and yours to use. Hosting and maintenance are included in your plan.',
    'Yes — it\'s built for your business and yours to keep. You pay once and it\'s yours.'
  );
  // FAQ: swap "setup fee" for hosting FAQ
  h = h.replace(
    '<details><summary>Is there a setup fee?</summary><p>No large upfront cost. You start with the simple monthly plan.</p></details>',
    '<details><summary>Is hosting included?</summary><p>Hosting is separate and depends on your domain — typically €5–20 per year.</p></details>'
  );
  // CTA sub
  h = h.replace(
    '<p class="cta-final__sub">Book a free 15-minute call. We\'ll build your site fast.</p>',
    '<p class="cta-final__sub">Book a free 15-minute call. Your site online in days.</p>'
  );
  // footer: remove Ads link
  h = h.replace('\n        <a href="/marketing">Ads</a>', '');
  return h;
});

/* ── IT: it/index.html ── */
patch('it/index.html', h => {
  // meta description
  h = h.replace(
    'Il sito professionale della tua attività — design, hosting, manutenzione, SEO e profilo Google. Tutto incluso a €299/mese + IVA. Nessun grande costo iniziale.',
    'Il sito professionale della tua attività — design, SEO e profilo Google. Un sito completo e pronto, tuo per sempre, a €299.'
  );
  // hero pill
  h = h.replace(
    '<div class="hero__pill">Siti Web Professionali · Pensati per te</div>',
    '<div class="hero__pill">Siti Web Professionali · €299 Una Tantum</div>'
  );
  // hero lead
  h = h.replace(
    'Design, hosting, manutenzione, SEO e il tuo profilo Google. <strong>Tutto incluso, un unico prezzo mensile.</strong>',
    'Design, SEO e il tuo profilo Google. <strong>Il tuo sito professionale completo, tuo per sempre.</strong>'
  );
  // hero strip — price
  h = h.replace(
    '<div class="num">€299<em>/mese</em></div><div class="lab">Prezzo mensile tutto incluso</div>',
    '<div class="num">€299<em></em></div><div class="lab">Prezzo unico una tantum</div>'
  );
  // hero strip — features
  h = h.replace(
    '<div class="num">6<em>+</em></div><div class="lab">Funzionalità in ogni piano</div>',
    '<div class="num">4<em></em></div><div class="lab">Funzionalità incluse</div>'
  );
  // marquee — first half
  h = h.replace(
    '    <span class="marquee__item">Hosting Incluso<span class="marquee__sep"></span></span>\n    <span class="marquee__item">SEO di Base<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Google Business<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Manutenzione<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Recensioni<span class="marquee__sep"></span></span>\n    <span class="marquee__item">€299 al Mese<span class="marquee__sep"></span></span>',
    '    <span class="marquee__item">SEO di Base<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Google Business<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Recensioni<span class="marquee__sep"></span></span>\n    <span class="marquee__item">€299 Una Tantum<span class="marquee__sep"></span></span>'
  );
  // marquee — second half
  h = h.replace(
    '    <span class="marquee__item">Hosting Incluso<span class="marquee__sep"></span></span>\n    <span class="marquee__item">SEO di Base<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Google Business<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Manutenzione<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Recensioni<span class="marquee__sep"></span></span>\n    <span class="marquee__item">€299 al Mese<span class="marquee__sep"></span></span>',
    '    <span class="marquee__item">SEO di Base<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Google Business<span class="marquee__sep"></span></span>\n    <span class="marquee__item">Recensioni<span class="marquee__sep"></span></span>\n    <span class="marquee__item">€299 Una Tantum<span class="marquee__sep"></span></span>'
  );
  // feat-grid CSS
  h = h.replace(
    '@media (min-width: 880px) { .feat-grid { grid-template-columns: repeat(3,1fr); } }',
    '@media (min-width: 880px) { .feat-grid { grid-template-columns: repeat(2,1fr); } }'
  );
  // included h2
  h = h.replace(
    '<h2 class="h2" style="margin-bottom:3rem">Tutto in<br>un unico posto.</h2>',
    '<h2 class="h2" style="margin-bottom:3rem">Cosa è<br>incluso.</h2>'
  );
  // remove hosting + maintenance feat steps
  h = h.replace(
    '      <div class="method__step"><div class="feat-icon"><i class="ti ti-server"></i></div><div class="method__title">Hosting incluso</div><p class="method__desc">Hosting veloce e sicuro gestito da noi. Niente da gestire.</p></div>\n      <div class="method__step"><div class="feat-icon"><i class="ti ti-tools"></i></div><div class="method__title">Manutenzione e aggiornamenti</div><p class="method__desc">Lo teniamo aggiornato, sicuro e sempre online.</p></div>\n      ',
    '      '
  );
  // manifesto quote
  h = h.replace(
    '<div class="manifesto__quote">Un prezzo.<br><em>Tutto incluso.</em></div>',
    '<div class="manifesto__quote">Un prezzo.<br><em>Fatto per te.</em></div>'
  );
  // manifesto body
  h = h.replace(
    '<p><strong>€299 al mese + IVA.</strong> Nessun costo nascosto, nessun grande anticipo. Sito, hosting, SEO e Google, gestiti da un unico team — noi.</p>\n        <p>Costruiamo veloce, così inizi prima a ricevere clienti. La maggior parte dei siti va online in pochi giorni dalla prima call.</p>',
    '<p><strong>€299, una volta.</strong> Niente canone mensile, niente sorprese. Realizziamo il tuo sito completo — design, SEO e Google Business — e poi è tuo.</p>\n        <p>Costruiamo veloce. La maggior parte dei siti va online in pochi giorni dalla prima call.</p>'
  );
  // remove examples section
  h = h.replace(
    /\n<section class="section section--alt">\n  <div class="container">\n    <div class="eyebrow" data-anim>Esempi<\/div>[\s\S]*?<\/section>\n\n<section class="section" id="prezzo"/,
    '\n\n<section class="section" id="prezzo"'
  );
  // price big
  h = h.replace(
    '<div class="price-big">€299<span class="price-period">/mese + IVA</span></div>',
    '<div class="price-big">€299<span class="price-period"> una tantum</span></div>'
  );
  // price note
  h = h.replace(
    '<p class="price-note">Tutto incluso — nessun costo nascosto.</p>',
    '<p class="price-note">Il tuo sito professionale completo — tuo per sempre. Hosting da €5–20 all\'anno.</p>'
  );
  // incl-list: remove Hosting + Manutenzione (they sit between Sito vetrina and SEO)
  h = h.replace(
    '        <li class="incl-item">Sito vetrina</li>\n        <li class="incl-item">Hosting</li>\n        <li class="incl-item">Manutenzione</li>\n        <li class="incl-item">SEO di base</li>',
    '        <li class="incl-item">Sito vetrina</li>\n        <li class="incl-item">SEO di base</li>'
  );
  // FAQ: "do I own"
  h = h.replace(
    'Sì — è realizzato per la tua attività ed è tuo da usare. Hosting e manutenzione sono inclusi nel piano.',
    'Sì — è realizzato per la tua attività ed è tuo per sempre. Paghi una volta e il sito è tuo.'
  );
  // FAQ: swap "costo attivazione" for hosting
  h = h.replace(
    '<details><summary>C\'è un costo di attivazione?</summary><p>Nessun grande costo iniziale. Parti con il semplice canone mensile.</p></details>',
    '<details><summary>L\'hosting è incluso?</summary><p>L\'hosting è a parte e dipende dal dominio, di solito €5–20 all\'anno.</p></details>'
  );
  // footer: remove Ads link
  h = h.replace('\n        <a href="/marketing">Ads</a>', '');
  return h;
});

console.log('All patches applied.');
