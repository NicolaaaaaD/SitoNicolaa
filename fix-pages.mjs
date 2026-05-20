import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));

function read(rel) { return readFileSync(resolve(ROOT, rel), 'utf8'); }
function write(rel, html) { writeFileSync(resolve(ROOT, rel), html, 'utf8'); console.log(`OK: ${rel}`); }

// Replace a complete <div ...> block (handles nesting)
function rb(html, openTagStart, newBlock) {
  const tagStart = html.indexOf(openTagStart);
  if (tagStart === -1) { console.warn(`WARN: "${openTagStart}" not found`); return html; }
  const tagEnd = html.indexOf('>', tagStart) + 1;
  let depth = 1, i = tagEnd;
  while (i < html.length && depth > 0) {
    if (html.startsWith('<div', i)) { depth++; i += 4; }
    else if (html.startsWith('</div>', i)) {
      depth--;
      if (depth === 0) { i += 6; break; }
      i += 6;
    } else { i++; }
  }
  return html.slice(0, tagStart) + newBlock + html.slice(i);
}

const LI = `<a href="https://www.linkedin.com/in/nicoladimattia/" target="_blank" rel="noopener">LinkedIn</a>`;

function addLI_IT(html) {
  if (html.includes('linkedin.com/in/nicoladimattia')) return html;
  return html.replace(/(<nav class="footer__links">[\s\S]*?)([\s]*<\/nav>)/, `$1${LI}$2`);
}

function addLI_EN(html) {
  if (html.includes('linkedin.com/in/nicoladimattia')) return html;
  return html.replace(
    '<p>© 2025 Nicola Dimattia. All rights reserved.</p>',
    `<p>${LI}</p>\n    <p>© 2025 Nicola Dimattia. All rights reserved.</p>`
  );
}

function fixPiva(html) {
  return html
    .replace('P.IVA in corso di registrazione', 'P.IVA 09099240724')
    .replace('P.IVA 00000000000', 'P.IVA 09099240724');
}

const MOBILE_CSS = `
<!-- MOBILE FIXES --><style>
@media (max-width: 430px) {
  .hero__ctas { flex-direction: column; }
  .hero__ctas .btn, .hero__ctas .btn--solid, .hero__ctas .btn--ghost { width: 100%; justify-content: center; min-height: 50px; }
  .hero-ctas { flex-direction: column; align-items: center; }
  .hero-ctas .btn-primary, .hero-ctas .btn-outline { width: 100%; max-width: 320px; justify-content: center; min-height: 50px; }
  .bigstats { grid-template-columns: 1fr !important; }
  .bigstats__cell { border-right: none !important; padding-right: 0 !important; border-bottom: 1px solid var(--grey-line) !important; }
  .bigstats__cell:last-child { border-bottom: none !important; }
  .hero-stats { gap: 28px !important; flex-direction: column; align-items: center; }
  .footer__links { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .footer__links a { min-height: 44px; display: flex; align-items: center; }
  .footer__inner { gap: 1rem; }
  .cta-final__actions { flex-direction: column; align-items: center; }
  .cta-final__actions .btn { width: 100%; max-width: 320px; justify-content: center; }
  .trust-btn { width: 100% !important; max-width: 320px !important; }
}
@media (max-width: 767px) {
  .footer-inner { gap: 8px; }
  .footer-inner p { font-size: 0.8rem; }
  .hero__strip { gap: 1rem 1.5rem; }
  .hero-stats { gap: 32px; }
}
</style>
<!-- /MOBILE FIXES -->`;

function addMobileCSS(html) {
  if (html.includes('MOBILE FIXES')) return html;
  return html.replace('</head>', MOBILE_CSS + '\n</head>');
}

// ── helpers for building blocks ──────────────────────────────────────────────

const si = (num, suf, lab) =>
  `<div class="hero__strip-item"><div class="num">${num}<em>${suf}</em></div><div class="lab">${lab}</div></div>`;

const sc = (num, suf, lab) =>
  `<div class="bigstats__cell"><div class="bigstats__num">${num}<em>${suf}</em></div><div class="bigstats__lab">${lab}</div></div>`;

function strip3(a, b, c) {
  return `<div class="hero__strip">\n        ${a}\n        ${b}\n        ${c}\n      </div>`;
}
function strip4(a, b, c, d) {
  return `<div class="hero__strip">\n        ${a}\n        ${b}\n        ${c}\n        ${d}\n      </div>`;
}
function bs3(a, b, c) {
  return `<div class="bigstats">\n      ${a}\n      ${b}\n      ${c}\n    </div>`;
}
function bs4(a, b, c, d) {
  return `<div class="bigstats" data-anim data-delay="1">\n      ${a}\n      ${b}\n      ${c}\n      ${d}\n    </div>`;
}

// Italian-structure carousel card
function cc(platform, name, loc, num, suf, desc, time) {
  return `<div class="carousel-card">
          <div class="carousel-card__top"><div class="carousel-card__platform">${platform}</div><div class="carousel-card__name">${name}</div><div class="carousel-card__loc">${loc}</div></div>
          <div class="carousel-card__bottom"><div class="carousel-card__num">${num}<em>${suf}</em></div><p class="carousel-card__desc">${desc}</p><div class="carousel-card__time"><i class="ti ti-clock"></i> ${time}</div></div>
        </div>`;
}
function carouselIT(cards) {
  return `<div class="carousel-track" id="carousel-track">\n        ${cards.join('\n        ')}\n      </div>`;
}

// English lawyers-style card
function ccEN(badge, metric, name, loc) {
  return `<div class="carousel-card">
        <div class="card-badge"><i class="ti ti-trending-up"></i> ${badge}</div>
        <div class="card-metric">${metric}</div>
        <div class="card-name">${name}</div>
        <div class="card-location">${loc}</div>
      </div>`;
}
function carouselEN(cards) {
  return `<div class="carousel-track" id="carousel-track">\n      ${cards.join('\n      ')}\n    </div>`;
}

// English lawyers-style hero stats
function heroStats(n1, l1, n2, l2, n3, l3) {
  return `<div class="hero-stats" data-anim data-delay="4">
      <div class="stat-item">
        <div class="stat-num">${n1}</div>
        <div class="stat-label">${l1}</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">${n2}</div>
        <div class="stat-label">${l2}</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">${n3}</div>
        <div class="stat-label">${l3}</div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// HOMEPAGE — index.html
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('index.html');

  // Hero strip (4 items)
  h = rb(h, '<div class="hero__strip">',
    strip4(
      si('+165', '%', 'Nuovi clienti in più in media'),
      si('4.2', '×', 'ROI medio sulle campagne'),
      si('12', '+', 'Settori serviti in tutta Italia'),
      si('-38', '%', 'Costo per lead ridotto in media')
    )
  );

  // Bigstats (4 cells)
  h = rb(h, '<div class="bigstats" data-anim data-delay="1">',
    bs4(
      sc('+165', '%', 'Nuovi clienti in più rispetto a prima'),
      sc('4.2', '×', 'ROI medio sulle campagne gestite'),
      sc('12', '+', 'Settori serviti in tutta Italia'),
      sc('-38', '%', 'Costo per lead ridotto in media')
    )
  );

  // Reviews — remove "5.0 · Valutazione media" line
  h = h.replace('<strong>5.0</strong> · Valutazione media dei clienti', '');

  // Reviews grid — replace all 6 cards
  const reviews = `<div class="reviews-grid">
      <div class="review" data-anim data-delay="1">
        <div class="review__stars">★★★★★</div>
        <p class="review__text">"Nicola ha ottimizzato le campagne Google in modo chirurgico. In 6 settimane i nuovi pazienti erano già cresciuti del 127%. Numeri veri, zero fumo."</p>
        <div class="review__author">
          <div class="review__avatar">RE</div>
          <div>
            <div class="review__name">Dott. Riccardo Esposito</div>
            <div class="review__role">Studio Dentistico Esposito · Bari</div>
          </div>
        </div>
      </div>
      <div class="review" data-anim data-delay="2">
        <div class="review__stars">★★★★★</div>
        <p class="review__text">"Le prenotazioni dirette sono salite del 94% in 90 giorni. Le commissioni alle OTA quasi dimezzate. La landing page che ha costruito converte meglio del nostro sito da 10 anni."</p>
        <div class="review__author">
          <div class="review__avatar">LC</div>
          <div>
            <div class="review__name">Luca Conforti</div>
            <div class="review__role">Hotel Villa Luce · Rimini</div>
          </div>
        </div>
      </div>
      <div class="review" data-anim data-delay="3">
        <div class="review__stars">★★★★★</div>
        <p class="review__text">"In 45 giorni avevamo recuperato l'investimento. Il costo per lead sceso del 44% e i clienti arrivano qualificati — non perdo più tempo con contatti inutili."</p>
        <div class="review__author">
          <div class="review__avatar">MF</div>
          <div>
            <div class="review__name">Marco Ferretti</div>
            <div class="review__role">Studio Legale Ferretti · Roma</div>
          </div>
        </div>
      </div>
      <div class="review" data-anim data-delay="1">
        <div class="review__stars">★★★★★</div>
        <p class="review__text">"Gli iscritti sono cresciuti dell'83% nel primo mese. Costo per acquisizione quasi dimezzato. La pagina che Nicola ha progettato porta nuovi iscritti da sola."</p>
        <div class="review__author">
          <div class="review__avatar">AS</div>
          <div>
            <div class="review__name">Alessandro Sorrentino</div>
            <div class="review__role">SportLife Gym · Napoli</div>
          </div>
        </div>
      </div>
      <div class="review" data-anim data-delay="2">
        <div class="review__stars">★★★★★</div>
        <p class="review__text">"Ogni mese ho un report preciso: quante richieste di valutazione (+68%), quanto mi è costata ciascuna, quanto ho guadagnato. Zero fumisterie, solo numeri."</p>
        <div class="review__author">
          <div class="review__avatar">EC</div>
          <div>
            <div class="review__name">Elena Caruso</div>
            <div class="review__role">Caruso Immobiliare · Torino</div>
          </div>
        </div>
      </div>
      <div class="review" data-anim data-delay="3">
        <div class="review__stars">★★★★★</div>
        <p class="review__text">"Prima convertivo pochissimo. Con la landing page di Nicola +91% di nuovi appuntamenti in 6 settimane. Il ROI supera abbondantemente il 4×."</p>
        <div class="review__author">
          <div class="review__avatar">VM</div>
          <div>
            <div class="review__name">Valentina Marini</div>
            <div class="review__role">Centro Estetico Marini · Firenze</div>
          </div>
        </div>
      </div>
    </div>`;
  h = rb(h, '<div class="reviews-grid">', reviews);

  h = addLI_IT(h);
  h = fixPiva(h);
  h = addMobileCSS(h);
  write('index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// DENTIST (IT)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('dentist/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+127', '%', 'Nuovi pazienti in 6 settimane'),
      si('3.8', '×', 'ROI medio sulle campagne'),
      si('6.8', '%', 'CTR medio — record di settore')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+127', '%', 'Nuovi pazienti nei nostri studi partner'),
      sc('3.8', '×', 'ROI medio sulle campagne'),
      sc('6.8', '%', 'CTR medio — record di settore')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Dott.ssa Marta Ricci', 'Studio Dentistico · Bari', '+127', '%', 'nuovi pazienti in 6 settimane', '6 settimane dal lancio'),
      cc('Meta + Google Ads', 'Dott. Luca Ferrara', 'Clinica Dentale · Catania', '3.8', '×', 'ROI — ogni euro investito ne ha reso quasi quattro', '2 mesi dalla partenza'),
      cc('Google Ads locale', 'Dott. Andrea Russo', 'Studio Dentistico · Milano', '-38', '%', 'costo per paziente acquisito', 'Dopo 3 mesi'),
      cc('Meta Ads', 'Dott.ssa Elena Conti', 'Studio Odontoiatrico · Venezia', '+€5.200', '', 'fatturato aggiuntivo mensile', '6 settimane dal lancio'),
      cc('Google Ads', 'Dott. Paolo Marini', 'Clinica del Sorriso · Roma', '6.8', '%', 'CTR medio — il triplo della media di settore', '60 giorni dalla partenza'),
      cc('Meta + Google Ads', 'Dott.ssa Sofia Gallo', 'Studio Dentale · Torino', '+€4.800', '', 'fatturato aggiuntivo', 'Dopo 8 settimane')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('dentist/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// DENTIST-EN (EN, Italian-structure template)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('dentist-en/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+127', '%', 'New patients in 6 weeks'),
      si('3.8', '×', 'Average ROI on campaigns'),
      si('6.8', '%', 'Avg CTR — sector record')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+127', '%', 'New patients in our partner practices'),
      sc('3.8', '×', 'Average ROI on campaigns'),
      sc('6.8', '%', 'Avg CTR — sector record')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Dr. Emma Walsh', 'Dental Clinic · Dublin', '+127', '%', 'new patients in 6 weeks', '6 weeks from launch'),
      cc('Meta + Google Ads', 'Dr. James Patel', 'Dental Practice · London', '3.8', '×', 'ROI — every pound generated nearly four', '2 months'),
      cc('Google Ads local', 'Dr. Amira Khalil', 'Smile Dental · Dubai', '-38', '%', 'cost per new patient', '3 months'),
      cc('Meta Ads', 'Dr. Sophie Laurent', 'Dental Studio · Amsterdam', '+€5.200', '', 'additional monthly revenue', '6 weeks from launch'),
      cc('Google Ads', 'Dr. Connor Murphy', 'City Dental · Dublin', '6.8', '%', 'avg CTR — triple the sector average', '60 days'),
      cc('Meta + Google Ads', 'Dr. Layla Ahmed', 'Premium Dental · London', '+€4.800', '', 'additional revenue', '8 weeks')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('dentist-en/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// RISTORANTE (IT)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('ristorante/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+112', '%', 'Prenotazioni online in 45 giorni'),
      si('3.6', '×', 'ROI medio sulle campagne'),
      si('-33', '%', 'Costo per prenotazione ridotto')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+112', '%', 'Prenotazioni online in 45 giorni'),
      sc('3.6', '×', 'ROI medio sulle campagne'),
      sc('-33', '%', 'Costo per prenotazione ridotto')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Chef Marco Pellegrino', 'Ristorante La Pergola · Napoli', '+112', '%', 'prenotazioni online in 45 giorni', '45 giorni dal lancio'),
      cc('Meta + Google Ads', 'Lucia Fontana', 'Trattoria Da Lucia · Roma', '3.6', '×', 'ROI — ogni euro investito ne ha generati 3.6', '2 mesi'),
      cc('Google Ads locale', 'Giovanni Esposito', 'Osteria del Porto · Bari', '-33', '%', 'costo per prenotazione rispetto a prima', 'Dopo 3 mesi'),
      cc('Meta Ads', 'Valentina Costa', 'Ristorante Mare Vivo · Palermo', '+€3.400', '', 'fatturato aggiuntivo mensile', '6 settimane dal lancio'),
      cc('Google Ads', 'Francesco Rizzo', 'Pizzeria Rizzo · Milano', '5.4', '%', 'CTR medio — il doppio della media di settore', '60 giorni'),
      cc('Meta + Google Ads', 'Elena Romano', 'Bistrot Romano · Firenze', '+€2.900', '', 'fatturato aggiuntivo', 'Dopo 8 settimane')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('ristorante/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// RESTAURANT (EN, Italian-structure template)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('restaurant/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+112', '%', 'Online reservations in 45 days'),
      si('3.6', '×', 'Average ROI on campaigns'),
      si('-33', '%', 'Cost per reservation reduced')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+112', '%', 'Online reservations in 45 days'),
      sc('3.6', '×', 'Average ROI on campaigns'),
      sc('-33', '%', 'Cost per reservation reduced')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Marco Pellegrino', 'La Pergola Restaurant · London', '+112', '%', 'reservations in 45 days', '45 days from launch'),
      cc('Meta + Google Ads', 'Sarah O\'Brien', 'O\'Brien\'s Bistro · Dublin', '3.6', '×', 'ROI — every euro generated 3.6', '2 months'),
      cc('Google Ads local', 'Omar Khalil', 'Al Bahar Restaurant · Dubai', '-33', '%', 'cost per reservation', '3 months'),
      cc('Meta Ads', 'Julie Martin', 'La Table de Julie · Amsterdam', '+€3.400', '', 'additional monthly revenue', '6 weeks'),
      cc('Google Ads', 'Liam Murphy', "Murphy's Gastropub · Dublin", '5.4', '%', 'avg CTR — double the industry average', '60 days'),
      cc('Meta + Google Ads', 'Nina Fischer', "Fischer's Kitchen · London", '+€2.900', '', 'additional revenue', '8 weeks')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('restaurant/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// AVVOCATI (IT)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('avvocati/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+142', '%', 'Consulenze in 90 giorni'),
      si('4.4', '×', 'ROI medio sulle campagne'),
      si('-44', '%', 'Costo per lead ridotto')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+142', '%', 'Consulenze nei nostri studi partner'),
      sc('4.4', '×', 'ROI medio sulle campagne'),
      sc('-44', '%', 'Costo per lead ridotto')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Marco Ferretti', 'Studio Legale · Bari', '-44', '%', 'costo per lead rispetto a prima', '60 giorni dal lancio'),
      cc('Meta + Google Ads', 'Giulia Russo', 'Studio Penalista · Roma', '4.4', '×', 'ROI — ogni euro investito ne ha generati oltre quattro', '2 mesi'),
      cc('Google Ads locale', 'Antonio Bianchi', 'Studio Legale · Napoli', '+142', '%', 'consulenze nel primo trimestre', 'Dopo 3 mesi'),
      cc('Meta Ads', 'Francesca Marino', 'Studio Civile · Torino', '+€12.500', '', 'fatturato aggiuntivo mensile', '6 settimane dal lancio'),
      cc('Google Ads', 'Luca Conti', 'Studio Penale · Bologna', '7.2', '%', 'CTR medio — triplo della media settore', '60 giorni'),
      cc('Meta + Google Ads', 'Sara De Ferrari', 'Studio Familiare · Firenze', '+€9.800', '', 'fatturato aggiuntivo — ROI 4.1×', 'Dopo 8 settimane')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('avvocati/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// LAWYERS (EN, lawyers-structure)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('lawyers/index.html');

  h = rb(h, '<div class="hero-stats"',
    heroStats(
      '<span>+</span>142<span>%</span>', 'Leads generated in 90 days',
      '4.4<span>×</span>', 'Average ROI',
      '-44<span>%</span>', 'Cost per lead reduced'
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselEN([
      ccEN('Clients', '<span>+</span>142<span>%</span>', 'James O\'Brien', 'Law Firm · Dublin'),
      ccEN('ROI', '4.4<span>×</span>', 'Emma Thompson', 'Legal Practice · London'),
      ccEN('Revenue', '<span>+£</span>12k', 'Abdullah Al-Rashid', 'Law Firm · Dubai'),
      ccEN('Clients', '<span>-</span>44<span>%</span>', 'Fiona Brennan', 'Family Law · Dublin'),
      ccEN('CTR', '7.2<span>%</span>', 'Thomas Vane', 'Criminal Defence · Amsterdam'),
      ccEN('Revenue', '<span>+£</span>9.8k', 'Sarah Hayes', 'Corporate Law · London')
    ])
  );
  h = addLI_EN(h);
  h = fixPiva(h);
  h = addMobileCSS(h);
  write('lawyers/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// IDRAULICO (IT)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('idraulico/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+144', '%', 'Chiamate in entrata in 30 giorni'),
      si('4.1', '×', 'ROI medio sulle campagne'),
      si('-38', '%', 'Costo per chiamata ridotto')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+144', '%', 'Chiamate nei nostri partner idraulici'),
      sc('4.1', '×', 'ROI medio sulle campagne'),
      sc('-38', '%', 'Costo per chiamata ridotto')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Carlo Ferretti', 'Idraulico · Bari', '+144', '%', 'chiamate in entrata in 30 giorni', '30 giorni dal lancio'),
      cc('Meta + Google Ads', 'Roberto Russo', 'Termoidraulico · Roma', '4.1', '×', 'ROI — ogni euro investito ne ha generati oltre quattro', '2 mesi'),
      cc('Google Ads locale', 'Antonio De Luca', 'Idraulico · Napoli', '-38', '%', 'costo per chiamata rispetto a prima', 'Dopo 3 mesi'),
      cc('Meta Ads', 'Mario Esposito', 'Pronto Intervento · Palermo', '+€2.800', '', 'fatturato aggiuntivo mensile', '6 settimane dal lancio'),
      cc('Google Ads', 'Stefano Marini', 'Idraulico d\'Urgenza · Milano', '5.2', '%', 'CTR medio — doppio della media di settore', '60 giorni'),
      cc('Meta + Google Ads', 'Luigi Bianchi', 'Termoidraulico · Torino', '+€2.100', '', 'fatturato aggiuntivo', 'Dopo 8 settimane')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('idraulico/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// PLUMBER (EN, Italian-structure template)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('plumber/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+144', '%', 'Inbound calls in 30 days'),
      si('4.1', '×', 'Average ROI on campaigns'),
      si('-38', '%', 'Cost per call reduced')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+144', '%', 'Inbound calls across partner businesses'),
      sc('4.1', '×', 'Average ROI on campaigns'),
      sc('-38', '%', 'Cost per call reduced')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Tom Brady', 'Emergency Plumber · Dublin', '+144', '%', 'inbound calls in 30 days', '30 days from launch'),
      cc('Meta + Google Ads', 'Kevin O\'Neill', 'Plumbing & Heating · London', '4.1', '×', 'ROI — every pound generated over four', '2 months'),
      cc('Google Ads local', 'Ahmed Hassan', 'City Plumbing · Dubai', '-38', '%', 'cost per call', '3 months'),
      cc('Meta Ads', 'Jan van Berg', 'Fast Plumber · Amsterdam', '+€2.800', '', 'additional monthly revenue', '6 weeks'),
      cc('Google Ads', 'Patrick Duffy', 'Plumbing Experts · Dublin', '5.2', '%', 'avg CTR — double the industry average', '60 days'),
      cc('Meta + Google Ads', 'Steve Williams', 'Williams Plumbing · London', '+€2.100', '', 'additional revenue', '8 weeks')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('plumber/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// PALESTRA (IT)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('palestra/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+83', '%', 'Nuove iscrizioni nel primo mese'),
      si('3.9', '×', 'ROI medio sulle campagne'),
      si('5.9', '%', 'CTR medio — record nel settore')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+83', '%', 'Nuove iscrizioni nelle nostre palestre partner'),
      sc('3.9', '×', 'ROI medio sulle campagne'),
      sc('5.9', '%', 'CTR medio — record nel settore')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Alessandro Sorrentino', 'SportLife Gym · Napoli', '+83', '%', 'nuove iscrizioni nel primo mese', 'Primo mese'),
      cc('Meta + Google Ads', 'Valentina Greco', 'FitZone · Roma', '3.9', '×', 'ROI — ogni euro investito ne ha generati quasi quattro', '2 mesi'),
      cc('Google Ads locale', 'Marco Ferrara', 'Palestra Power · Milano', '-31', '%', 'costo per iscrizione rispetto a prima', 'Dopo 3 mesi'),
      cc('Meta Ads', 'Giulia Conti', 'CrossFit Box · Torino', '+€4.100', '', 'fatturato aggiuntivo mensile', '6 settimane'),
      cc('Google Ads', 'Davide Russo', 'Gym Pro · Bologna', '5.9', '%', 'CTR medio — il doppio della media settore', '60 giorni'),
      cc('Meta + Google Ads', 'Sara Bianchi', 'Wellness Studio · Firenze', '+€3.200', '', 'fatturato aggiuntivo', 'Dopo 8 settimane')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('palestra/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// GYM (EN, lawyers-structure)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('gym/index.html');

  h = rb(h, '<div class="hero-stats"',
    heroStats(
      '<span>+</span>83<span>%</span>', 'New memberships in first month',
      '3.9<span>×</span>', 'Average ROI',
      '5.9<span>%</span>', 'Avg CTR — sector record'
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselEN([
      ccEN('Members', '<span>+</span>83<span>%</span>', 'Thomas Kelly', 'FitLife Gym · Dublin'),
      ccEN('ROI', '3.9<span>×</span>', 'Emma Clarke', 'CrossFit Box · London'),
      ccEN('Cost', '-31<span>%</span>', 'Rania Al-Hassan', 'Fitness Studio · Dubai'),
      ccEN('Revenue', '<span>+€</span>4.1k', 'Lars van Dam', 'SportPlus · Amsterdam'),
      ccEN('CTR', '5.9<span>%</span>', 'Sean Murphy', 'Iron Gym · Dublin'),
      ccEN('Revenue', '<span>+£</span>3.2k', 'Charlotte Smith', 'Pure Gym · London')
    ])
  );
  h = addLI_EN(h);
  h = fixPiva(h);
  h = addMobileCSS(h);
  write('gym/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// ESTETICA (IT)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('estetica/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+91', '%', 'Nuovi appuntamenti in 6 settimane'),
      si('4.3', '×', 'ROI medio sulle campagne'),
      si('-29', '%', 'Costo per click ridotto')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+91', '%', 'Nuovi appuntamenti nei centri partner'),
      sc('4.3', '×', 'ROI medio sulle campagne'),
      sc('-29', '%', 'Costo per click ridotto')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Valentina Marini', 'Centro Estetico Marini · Firenze', '+91', '%', 'nuovi appuntamenti in 6 settimane', '6 settimane dal lancio'),
      cc('Meta + Google Ads', 'Claudia Esposito', 'Beauty Lab · Napoli', '4.3', '×', 'ROI — ogni euro ha generato oltre quattro', '2 mesi'),
      cc('Google Ads locale', 'Elena Costa', 'Centro Bellezza · Roma', '-29', '%', 'costo per click rispetto a prima', 'Dopo 3 mesi'),
      cc('Meta Ads', 'Sofia Ricci', 'Spa & Benessere · Milano', '+€3.600', '', 'fatturato aggiuntivo mensile', '6 settimane'),
      cc('Google Ads', 'Laura Russo', 'Estetica Russo · Torino', '6.1', '%', 'CTR medio — il doppio della media settore', '60 giorni'),
      cc('Meta + Google Ads', 'Alessia Bianchi', 'Centro Estetico · Bologna', '+€2.700', '', 'fatturato aggiuntivo', 'Dopo 8 settimane')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('estetica/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// BEAUTY (EN, Italian-structure template)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('beauty/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+91', '%', 'New bookings in 6 weeks'),
      si('4.3', '×', 'Average ROI on campaigns'),
      si('-29', '%', 'Cost per click reduced')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+91', '%', 'New bookings across partner beauty centres'),
      sc('4.3', '×', 'Average ROI on campaigns'),
      sc('-29', '%', 'Cost per click reduced')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Emma Walsh', 'Beauty Lab · Dublin', '+91', '%', 'new bookings in 6 weeks', '6 weeks from launch'),
      cc('Meta + Google Ads', 'Amira Khalil', 'Luxury Spa · Dubai', '4.3', '×', 'ROI — every euro generated over four', '2 months'),
      cc('Google Ads local', 'Julie Laurent', 'Belle Beauté · Amsterdam', '-29', '%', 'cost per click', '3 months'),
      cc('Meta Ads', 'Sophie Martin', 'Glow Beauty · London', '+€3.600', '', 'additional monthly revenue', '6 weeks'),
      cc('Google Ads', 'Aoife Murphy', 'City Beauty · Dublin', '6.1', '%', 'avg CTR — double the industry average', '60 days'),
      cc('Meta + Google Ads', 'Hannah Clarke', 'Pure Aesthetics · London', '+€2.700', '', 'additional revenue', '8 weeks')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('beauty/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// FISIOTERAPIA (IT)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('fisioterapia/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+74', '%', 'Nuovi pazienti in 90 giorni'),
      si('3.4', '×', 'ROI medio sulle campagne'),
      si('7.8', '%', 'CTR medio — record nel settore')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+74', '%', 'Nuovi pazienti nei nostri studi partner'),
      sc('3.4', '×', 'ROI medio sulle campagne'),
      sc('7.8', '%', 'CTR medio — record nel settore')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Dott. Federico Conti', 'Studio Fisioterapia · Roma', '+74', '%', 'nuovi pazienti in 90 giorni', '90 giorni dal lancio'),
      cc('Meta + Google Ads', 'Dott.ssa Marta Esposito', 'Centro Riabilitativo · Milano', '3.4', '×', 'ROI — ogni euro ha generato oltre tre', '2 mesi'),
      cc('Google Ads locale', 'Dott. Riccardo Marini', 'Fisioterapia Pro · Napoli', '-28', '%', 'costo per paziente acquisito', 'Dopo 3 mesi'),
      cc('Meta Ads', 'Dott.ssa Chiara Russo', 'Studio Fisio · Torino', '+€2.900', '', 'fatturato aggiuntivo mensile', '6 settimane'),
      cc('Google Ads', 'Dott. Andrea Ferretti', 'Riabilitazione Plus · Bologna', '7.8', '%', 'CTR medio — triplo della media settore', '60 giorni'),
      cc('Meta + Google Ads', 'Dott.ssa Laura Bianchi', 'Centro Salute · Bari', '+€2.200', '', 'fatturato aggiuntivo', 'Dopo 8 settimane')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('fisioterapia/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// PHYSIOTHERAPY (EN, Italian-structure template)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('physiotherapy/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+74', '%', 'New patients in 90 days'),
      si('3.4', '×', 'Average ROI on campaigns'),
      si('7.8', '%', 'Avg CTR — sector record')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+74', '%', 'New patients across partner practices'),
      sc('3.4', '×', 'Average ROI on campaigns'),
      sc('7.8', '%', 'Avg CTR — sector record')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Dr. Cian Murphy', 'PhysioCity · Dublin', '+74', '%', 'new patients in 90 days', '90 days from launch'),
      cc('Meta + Google Ads', 'Dr. Priya Patel', 'Central Physio · London', '3.4', '×', 'ROI — every euro generated over three', '2 months'),
      cc('Google Ads local', 'Dr. Khalid Hassan', 'Elite Physio · Dubai', '-28', '%', 'cost per patient', '3 months'),
      cc('Meta Ads', 'Dr. Anna van Berg', 'SportPhysio · Amsterdam', '+€2.900', '', 'additional monthly revenue', '6 weeks'),
      cc('Google Ads', 'Dr. Siobhan Kelly', 'Dublin Physio · Dublin', '7.8', '%', 'avg CTR — triple the sector average', '60 days'),
      cc('Meta + Google Ads', 'Dr. James Wilson', 'City Physio · London', '+€2.200', '', 'additional revenue', '8 weeks')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('physiotherapy/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// HOTEL (IT)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('hotel/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+94', '%', 'Prenotazioni dirette in 90 giorni'),
      si('4.7', '×', 'ROI medio sulle campagne'),
      si('-31', '%', 'Commissioni OTA ridotte')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+94', '%', 'Prenotazioni dirette nelle strutture partner'),
      sc('4.7', '×', 'ROI medio sulle campagne'),
      sc('-31', '%', 'Commissioni OTA ridotte')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Stefano Conforti', 'Hotel Villa Luce · Rimini', '+94', '%', 'prenotazioni dirette in 90 giorni', '90 giorni dal lancio'),
      cc('Meta + Google Ads', 'Giovanna Esposito', 'Hotel La Palma · Sorrento', '4.7', '×', 'ROI — commissioni OTA quasi azzerate', '2 mesi'),
      cc('Google Ads locale', 'Roberto Marini', 'Lido Tramonto · Gallipoli', '-31', '%', 'commissioni OTA rispetto a prima', 'Dopo 3 mesi'),
      cc('Meta Ads', 'Lucia Ferrari', 'Hotel Belvedere · Amalfi', '+€6.400', '', 'fatturato aggiuntivo mensile', '6 settimane'),
      cc('Google Ads', 'Andrea Greco', 'B&B Panorama · Taormina', '5.2', '%', 'CTR medio — il doppio della media settore', '60 giorni'),
      cc('Meta + Google Ads', 'Elena Costa', 'Hotel La Baia · Positano', '+€5.100', '', 'fatturato aggiuntivo', 'Dopo 8 settimane')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('hotel/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// HOTEL-EN (EN, Italian-structure template)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('hotel-en/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+94', '%', 'Direct bookings in 90 days'),
      si('4.7', '×', 'Average ROI on campaigns'),
      si('-31', '%', 'OTA commission reduced')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+94', '%', 'Direct bookings in our partner hotels'),
      sc('4.7', '×', 'Average ROI on campaigns'),
      sc('-31', '%', 'OTA commission reduced')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Stefan Mueller', 'Boutique Hotel · Amsterdam', '+94', '%', 'direct bookings in 90 days', '90 days from launch'),
      cc('Meta + Google Ads', 'Emma Sinclair', 'The Grand Hotel · London', '4.7', '×', 'ROI — OTA commissions nearly cut', '2 months'),
      cc('Google Ads local', 'Ahmed Al-Rashid', 'Desert Palm Resort · Dubai', '-31', '%', 'OTA commission saved', '3 months'),
      cc('Meta Ads', 'Niamh O\'Brien', 'Cliffs Hotel · Dublin', '+€6.400', '', 'additional monthly revenue', '6 weeks'),
      cc('Google Ads', 'Lars van Berg', 'City Hotel · Amsterdam', '5.2', '%', 'avg CTR — double the industry average', '60 days'),
      cc('Meta + Google Ads', 'Charlotte Hayes', 'Harbour Hotel · London', '+€5.100', '', 'additional revenue', '8 weeks')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('hotel-en/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// IMMOBILIARE (IT)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('immobiliare/index.html');

  h = rb(h, '<div class="hero__strip">',
    strip3(
      si('+68', '%', 'Richieste di valutazione in 90 giorni'),
      si('4.0', '×', 'ROI medio sulle campagne'),
      si('-41', '%', 'Costo per lead ridotto')
    )
  );
  h = rb(h, '<div class="bigstats">',
    bs3(
      sc('+68', '%', 'Richieste nelle nostre agenzie partner'),
      sc('4.0', '×', 'ROI medio sulle campagne'),
      sc('-41', '%', 'Costo per lead ridotto')
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselIT([
      cc('Google Ads', 'Elena Caruso', 'Caruso Immobiliare · Torino', '+68', '%', 'richieste di valutazione in 90 giorni', '90 giorni dal lancio'),
      cc('Meta + Google Ads', 'Francesco Parisi', 'Studio Parisi · Milano', '4.0', '×', 'ROI — ogni euro ha generato quattro', '2 mesi'),
      cc('Google Ads locale', 'Valentina Rossi', 'Immobiliare Rossi · Roma', '-41', '%', 'costo per lead rispetto a prima', 'Dopo 3 mesi'),
      cc('Meta Ads', 'Marco De Luca', 'Agenzia De Luca · Napoli', '+€4.800', '', 'fatturato aggiuntivo mensile', '6 settimane'),
      cc('Google Ads', 'Chiara Esposito', 'Casa Esposito · Bologna', '4.2', '%', 'CTR medio — il doppio della media settore', '60 giorni'),
      cc('Meta + Google Ads', 'Luca Bianchi', 'Bianchi Case · Firenze', '+€3.700', '', 'fatturato aggiuntivo', 'Dopo 8 settimane')
    ])
  );
  h = addLI_IT(h);
  h = addMobileCSS(h);
  write('immobiliare/index.html', h);
})();

// ══════════════════════════════════════════════════════════════════════════════
// REAL-ESTATE (EN, lawyers-structure)
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  let h = read('real-estate/index.html');

  h = rb(h, '<div class="hero-stats"',
    heroStats(
      '<span>+</span>68<span>%</span>', 'Valuation requests in 90 days',
      '4.0<span>×</span>', 'Average ROI',
      '-41<span>%</span>', 'Cost per lead reduced'
    )
  );
  h = rb(h, '<div class="carousel-track" id="carousel-track">',
    carouselEN([
      ccEN('Leads', '<span>+</span>68<span>%</span>', 'Emma Clarke', 'Estate Agency · London'),
      ccEN('ROI', '4.0<span>×</span>', 'Rania Al-Hassan', 'Property Group · Dubai'),
      ccEN('Cost', '-41<span>%</span>', 'Peter van Dam', 'Real Estate · Amsterdam'),
      ccEN('Revenue', '<span>+€</span>4.8k', 'Fiona O\'Brien', 'Property Agency · Dublin'),
      ccEN('CTR', '4.2<span>%</span>', 'David Thompson', 'Premium Properties · London'),
      ccEN('Revenue', '<span>+€</span>3.7k', 'Lars Müller', 'City Estates · Amsterdam')
    ])
  );
  h = addLI_EN(h);
  h = fixPiva(h);
  h = addMobileCSS(h);
  write('real-estate/index.html', h);
})();

console.log('\nAll done.');
