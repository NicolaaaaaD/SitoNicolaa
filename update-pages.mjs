import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));

const colorMap = {
  '#1a73e8': { dark: '#1557b0', soft: '#e8f0fe' },
  '#e8471a': { dark: '#c33d16', soft: '#fde8e0' },
  '#1a237e': { dark: '#121966', soft: '#e8eaf6' },
  '#2e7d32': { dark: '#1b5e20', soft: '#e8f5e9' },
  '#7b1fa2': { dark: '#6a1b9a', soft: '#f3e5f5' },
  '#c2185b': { dark: '#ad1457', soft: '#fce4ec' },
  '#00796b': { dark: '#00695c', soft: '#e0f2f1' },
  '#f57f17': { dark: '#e65100', soft: '#fff8e1' },
  '#5d4037': { dark: '#4e342e', soft: '#efebe9' },
};

function stars(r) { return r >= 4.8 ? '★★★★★' : '★★★★☆'; }

function buildSection(c) {
  const adBadge   = c.lang === 'it' ? 'Ann.' : 'Ad';
  const btnDir    = c.lang === 'it' ? 'Indicazioni' : 'Directions';
  const btnCall   = c.lang === 'it' ? 'Chiama' : 'Call';
  const btnWeb    = c.lang === 'it' ? 'Sito web' : 'Website';
  const sponsored = c.lang === 'it' ? 'Sponsorizzato' : 'Sponsored';

  const mapSVG = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;display:block"><rect width="100%" height="100%" fill="#f2ede8"/><rect x="0" y="28%" width="100%" height="7%" fill="#fff" opacity="0.92"/><rect x="0" y="56%" width="100%" height="5%" fill="#fff" opacity="0.92"/><rect x="32%" y="0" width="6%" height="100%" fill="#fff" opacity="0.92"/><rect x="64%" y="0" width="5%" height="100%" fill="#fff" opacity="0.92"/><rect x="0" y="15%" width="100%" height="2%" fill="#fff" opacity="0.55"/><rect x="0" y="43%" width="100%" height="2%" fill="#fff" opacity="0.55"/><rect x="0" y="75%" width="100%" height="2%" fill="#fff" opacity="0.55"/><rect x="12%" y="0" width="2%" height="100%" fill="#fff" opacity="0.55"/><rect x="50%" y="0" width="2%" height="100%" fill="#fff" opacity="0.55"/><rect x="77%" y="0" width="2%" height="100%" fill="#fff" opacity="0.55"/><rect x="2%" y="2%" width="28%" height="11%" fill="#e0d8cc" rx="1"/><rect x="2%" y="17%" width="28%" height="9%" fill="#e0d8cc" rx="1"/><rect x="2%" y="30%" width="28%" height="24%" fill="#e8e0d4" rx="1"/><rect x="2%" y="58%" width="28%" height="15%" fill="#e0d8cc" rx="1"/><rect x="2%" y="77%" width="28%" height="10%" fill="#e0d8cc" rx="1"/><rect x="2%" y="90%" width="28%" height="8%" fill="#e0d8cc" rx="1"/><rect x="38%" y="2%" width="24%" height="25%" fill="#e0d8cc" rx="1"/><rect x="38%" y="31%" width="24%" height="23%" fill="#e0d8cc" rx="1"/><rect x="38%" y="60%" width="24%" height="13%" fill="#e0d8cc" rx="1"/><rect x="38%" y="78%" width="24%" height="20%" fill="#e0d8cc" rx="1"/><rect x="70%" y="2%" width="28%" height="25%" fill="#e0d8cc" rx="1"/><rect x="70%" y="31%" width="28%" height="23%" fill="#e0d8cc" rx="1"/><rect x="70%" y="60%" width="28%" height="13%" fill="#e0d8cc" rx="1"/><rect x="70%" y="78%" width="28%" height="10%" fill="#e0d8cc" rx="1"/><rect x="38%" y="2%" width="10%" height="10%" fill="#c5ddb5" rx="2"/><rect x="70%" y="90%" width="16%" height="8%" fill="#b3d4f5" rx="2"/></svg>`;

  const mapsCard = `<div class="maps-mock" style="background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.09),0 1px 4px rgba(0,0,0,0.05);overflow:hidden;border:1px solid rgba(0,0,0,0.06)">
        <div class="maps-inner">
          <div class="maps-panel" style="width:236px;flex-shrink:0;display:flex;flex-direction:column;background:#fff">
            <div style="padding:9px 10px;background:#f8f9fa;border-bottom:1px solid #e8eaed;display:flex;align-items:center;gap:7px">
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none"><path d="M9 1C5.134 1 2 4.134 2 8c0 5.25 7 9 7 9s7-3.75 7-9c0-3.866-3.134-7-7-7z" fill="#EA4335"/><circle cx="9" cy="8" r="3" fill="white"/></svg>
              <div style="flex:1;background:#fff;border:1px solid #dadce0;border-radius:18px;padding:5px 10px;font-family:Arial,sans-serif;font-size:11.5px;color:#202124;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${c.searchQuery}</div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#5f6368"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            </div>
            <div style="padding:8px 11px 4px">
              <span style="font-size:9px;font-family:Arial,sans-serif;color:#70757a;border:1px solid #dadce0;border-radius:2px;padding:1px 5px;font-weight:500">${sponsored}</span>
            </div>
            <div style="padding:4px 11px 12px;flex:1">
              <div style="font-size:13px;font-family:Arial,sans-serif;font-weight:700;color:#202124;margin-bottom:2px;line-height:1.3">${c.mapBizName}</div>
              <div style="font-size:10.5px;font-family:Arial,sans-serif;color:#5f6368;margin-bottom:5px">${c.mapCategory}</div>
              <div style="display:flex;align-items:center;gap:3px;margin-bottom:4px">
                <span style="font-size:11.5px;font-family:Arial,sans-serif;font-weight:600;color:#202124">${c.ratingDisplay}</span>
                <span style="color:#f5a623;font-size:11px;letter-spacing:-0.5px">${stars(c.rating)}</span>
                <span style="font-size:9.5px;font-family:Arial,sans-serif;color:#70757a">${c.mapReviewLabel}</span>
              </div>
              <div style="display:flex;align-items:flex-start;gap:4px;margin-bottom:9px">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#70757a" style="margin-top:2px;flex-shrink:0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span style="font-size:10px;font-family:Arial,sans-serif;color:#70757a;line-height:1.4">${c.mapAddr}</span>
              </div>
              <div style="display:flex;gap:5px">
                <button style="flex:1;background:${c.btnBg};color:${c.sectorColor};border:none;border-radius:13px;padding:7px 3px;font-size:9.5px;font-family:Arial,sans-serif;font-weight:600;cursor:pointer;min-height:32px">${btnCall}</button>
                <button style="flex:1;background:${c.btnBg};color:${c.sectorColor};border:none;border-radius:13px;padding:7px 3px;font-size:9.5px;font-family:Arial,sans-serif;font-weight:600;cursor:pointer;min-height:32px">${btnDir}</button>
                <button style="flex:1;background:#f1f3f4;color:#5f6368;border:none;border-radius:13px;padding:7px 3px;font-size:9.5px;font-family:Arial,sans-serif;font-weight:600;cursor:pointer;min-height:32px">${btnWeb}</button>
              </div>
            </div>
          </div>
          <div class="maps-canvas" style="flex:1;position:relative;min-height:280px;overflow:hidden">
            ${mapSVG}
            <div style="position:absolute;left:35%;top:31%;transform:translate(-50%,-100%)"><svg width="28" height="38" viewBox="0 0 28 38" fill="none"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="${c.sectorColor}"/><circle cx="14" cy="14" r="6.5" fill="white"/></svg></div>
            <div style="position:absolute;bottom:8px;right:8px;background:rgba(255,255,255,0.9);border-radius:3px;padding:3px 7px;box-shadow:0 1px 3px rgba(0,0,0,0.18)"><span style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#4285F4">Google</span><span style="font-family:Arial,sans-serif;font-size:10px;color:#5f6368"> Maps</span></div>
            <div style="position:absolute;top:8px;right:8px;background:#fff;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,0.18);overflow:hidden"><div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:17px;color:#5f6368;border-bottom:1px solid #e0e0e0;font-family:Arial;cursor:pointer">+</div><div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:17px;color:#5f6368;font-family:Arial;cursor:pointer">−</div></div>
          </div>
        </div>
      </div>`;

  const css = `.ads-showcase-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:40px;align-items:start}.maps-inner{display:flex}.maps-panel{border-right:1px solid #e8eaed}@media(max-width:767px){.ads-showcase-grid{grid-template-columns:1fr}.maps-inner{flex-direction:column}.maps-panel{width:100%!important;border-right:none!important;border-bottom:1px solid #e8eaed}.maps-canvas{min-height:200px!important}}@media(max-width:480px){.ads-section-wrap{padding-left:16px!important;padding-right:16px!important}}`;

  return `
<!-- ADS SHOWCASE -->
<style>${css}</style>
<section style="background:${c.bgColor};padding:clamp(56px,8vw,88px) 0;position:relative">
  <div class="ads-section-wrap" style="max-width:1320px;margin:0 auto;padding:0 24px">
    <div style="text-align:center;margin-bottom:52px">
      <div style="display:inline-flex;align-items:center;gap:8px;background:${c.badgeBg};border:1px solid ${c.sectorColor}44;border-radius:100px;padding:6px 16px;margin-bottom:18px">
        <div style="width:7px;height:7px;border-radius:50%;background:${c.sectorColor}"></div>
        <span style="font-family:'Poppins',sans-serif;font-size:0.72rem;font-weight:600;color:${c.sectorColor};letter-spacing:0.09em;text-transform:uppercase">${c.badgeLabel}</span>
      </div>
      <h2 style="font-family:'Archivo Black',sans-serif;font-size:clamp(1.5rem,3.5vw,2.5rem);color:#0A0A0A;margin:0 0 16px;line-height:1.18">${c.hookLine1}<br>${c.hookLine2} <em style="font-style:normal;color:${c.sectorColor}">"${c.hookEm}"</em></h2>
      <p style="font-family:'Poppins',sans-serif;font-size:clamp(0.85rem,1.2vw,0.97rem);color:rgba(10,10,10,0.62);max-width:520px;margin:0 auto;line-height:1.7">${c.hookSub}</p>
    </div>
    <div class="ads-showcase-grid">
      <div style="background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.09),0 1px 4px rgba(0,0,0,0.05);overflow:hidden;border:1px solid rgba(0,0,0,0.06)">
        <div style="padding:11px 14px;background:#fff;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:9px">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          <div style="flex:1;background:#f1f3f4;border-radius:22px;padding:6px 14px;font-family:Arial,sans-serif;font-size:13px;color:#202124;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${c.searchQuery}</div>
        </div>
        <div style="padding:13px 14px 0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="font-size:10px;font-family:Arial,sans-serif;color:#0d652d;border:1px solid #0d652d;border-radius:3px;padding:1px 4px;font-weight:500">${adBadge}</span>
            <span style="font-size:11.5px;font-family:Arial,sans-serif;color:#4d5156">${c.bizUrl}</span>
          </div>
          <div style="font-size:17px;font-family:Arial,sans-serif;color:#1a0dab;margin-bottom:3px;line-height:1.3">${c.headline}</div>
          <div style="display:flex;align-items:center;gap:3px;margin-bottom:4px">
            <span style="color:#f5a623;font-size:12px;letter-spacing:-0.5px">${stars(c.rating)}</span>
            <span style="font-size:11.5px;font-family:Arial,sans-serif;color:#4d5156">${c.ratingDisplay} · ${c.reviewCount}</span>
          </div>
          <div style="font-size:12.5px;font-family:Arial,sans-serif;color:#4d5156;line-height:1.58">${c.desc}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;padding-bottom:13px">${c.sitelinks.map(s => `<span style="font-size:11.5px;font-family:Arial,sans-serif;color:#1a0dab;border:1px solid #dadce0;border-radius:4px;padding:3px 9px">${s}</span>`).join('')}</div>
        </div>
        <div style="padding:0 14px 12px;border-top:1px solid #f0f0f0">
          <div style="opacity:0.32;margin-top:10px"><div style="font-size:11px;font-family:Arial,sans-serif;color:#4d5156;margin-bottom:2px">${c.org1url}</div><div style="font-size:15px;font-family:Arial,sans-serif;color:#1a0dab;margin-bottom:2px">${c.org1title}</div><div style="font-size:12px;font-family:Arial,sans-serif;color:#4d5156">${c.org1desc}</div></div>
          <div style="opacity:0.14;margin-top:7px"><div style="font-size:11px;font-family:Arial,sans-serif;color:#4d5156;margin-bottom:2px">${c.org2url}</div><div style="font-size:15px;font-family:Arial,sans-serif;color:#1a0dab;margin-bottom:2px">${c.org2title}</div><div style="font-size:12px;font-family:Arial,sans-serif;color:#4d5156">${c.org2desc}</div></div>
        </div>
      </div>
      ${mapsCard}
    </div>
    <div style="text-align:center;background:#fff;border-radius:20px;padding:clamp(24px,4vw,36px);border:1px solid rgba(0,0,0,0.07);box-shadow:0 2px 12px rgba(0,0,0,0.05)">
      <p style="font-family:'Archivo Black',sans-serif;font-size:clamp(1rem,1.5vw,1.22rem);color:#0A0A0A;margin:0 0 8px">${c.closingH}</p>
      <p style="font-family:'Poppins',sans-serif;font-size:clamp(0.82rem,1vw,0.92rem);color:rgba(10,10,10,0.62);margin:0 0 22px">${c.closingP}</p>
      <a href="https://calendly.com/nicoladimattia8/30min" onclick="Calendly.initPopupWidget({url:'https://calendly.com/nicoladimattia8/30min?month=2026-05'});return false;" style="display:inline-flex;align-items:center;gap:8px;background:${c.sectorColor};color:#fff;border-radius:100px;padding:14px 30px;font-family:'Poppins',sans-serif;font-weight:600;font-size:clamp(0.82rem,1vw,0.88rem);text-decoration:none;min-height:44px" onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'">${c.ctaText}</a>
    </div>
  </div>
</section>
`;
}

function buildTrustBar(c) {
  const disponibile  = c.lang === 'it' ? 'Disponibile' : 'Available';
  const prenotaLabel = c.lang === 'it' ? 'Prenota la Call' : 'Book a Call';
  return `
<!-- TRUST BAR -->
<style>@keyframes tpulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.45);opacity:1}55%{box-shadow:0 0 0 7px rgba(34,197,94,0);opacity:0.75}}@media(max-width:767px){.trust-wrap{width:100%;padding:0 24px;box-sizing:border-box}.trust-btn{width:100%!important;justify-content:center!important}}</style>
<div style="background:#fff;padding:clamp(32px,5vw,56px) 0 clamp(24px,4vw,40px);text-align:center">
  <div class="trust-wrap" style="display:inline-flex;flex-direction:column;align-items:center;gap:18px">
    <div style="position:relative;display:inline-block">
      <img src="/Design/profile.png" alt="Nicola" style="width:76px;height:76px;border-radius:50%;object-fit:cover;border:3px solid ${c.sectorColor};display:block;box-shadow:0 4px 16px rgba(0,0,0,0.1)">
      <div style="position:absolute;bottom:-6px;right:-14px;background:#fff;border-radius:999px;padding:4px 9px;display:flex;align-items:center;gap:5px;box-shadow:0 2px 10px rgba(0,0,0,0.14);white-space:nowrap">
        <span style="width:7px;height:7px;border-radius:50%;background:#22c55e;display:inline-block;animation:tpulse 2s ease-in-out infinite;flex-shrink:0"></span>
        <span style="font-family:'Poppins',sans-serif;font-size:0.68rem;font-weight:700;color:#1a1a1a">🟢 ${disponibile}</span>
      </div>
    </div>
    <button class="trust-btn" onclick="Calendly.initPopupWidget({url:'https://calendly.com/nicoladimattia8/30min?month=2026-05'});return false;" style="display:inline-flex;align-items:center;background:${c.sectorColor};color:#fff;border:none;border-radius:999px;padding:14px 40px;font-family:'Poppins',sans-serif;font-size:0.92rem;font-weight:700;cursor:pointer;min-height:48px;box-shadow:0 6px 20px -4px ${c.sectorColor}55;transition:opacity 0.2s,transform 0.2s" onmouseover="this.style.opacity='0.86';this.style.transform='translateY(-2px)'" onmouseout="this.style.opacity='1';this.style.transform='none'">${prenotaLabel}</button>
  </div>
</div>
`;
}

const pages = [
  // ── ITALIAN ─────────────────────────────────────────────────────────────
  {
    file: 'dentist/index.html',
    insertBefore: '<section class="section" id="metodo">',
    lang: 'it', sectorColor: '#1a73e8', bgColor: '#f0f4ff', badgeBg: '#e8eeff',
    btnBg: '#e8f0fe',
    badgeLabel: 'Google Ads · Anteprima Reale',
    hookLine1: 'Questo è ciò che vede il tuo potenziale paziente',
    hookLine2: 'quando cerca su Google', hookEm: 'dentista Roma',
    hookSub: 'I tuoi concorrenti hanno già il loro annuncio lì. Il tuo studio potrebbe apparire in prima posizione già da domani.',
    searchQuery: 'dentista Roma Prati',
    bizUrl: 'www.studioferretti.it',
    headline: 'Studio Dentistico Ferretti – Sorridi con Fiducia',
    rating: 4.9, ratingDisplay: '4,9', reviewCount: '127 recensioni',
    desc: 'Visite, pulizie e sbiancamento a Roma Prati. Prima visita gratuita — prenota online in 60 secondi.',
    sitelinks: ['Prima Visita Gratuita', 'Implantologia', 'Sbiancamento', 'Prenota Online'],
    org1url: 'www.dentista-roma.it', org1title: 'Dentista Roma – Studio Associato', org1desc: 'Dentisti a Roma. Preventivi gratuiti online...',
    org2url: 'www.dentistaprati.com', org2title: 'Dentista Prati Roma – Prenota Ora', org2desc: 'Studio dentistico nel quartiere Prati...',
    mapBizName: 'Studio Dentistico Ferretti', mapCategory: 'Dentista · <span style="color:#188038">Aperto</span> · Chiude alle 19:00',
    mapReviewLabel: '(127 recensioni)', mapAddr: 'Via Cola di Rienzo 45, Roma',
    closingH: 'Il tuo studio potrebbe apparire qui.',
    closingP: 'Configuriamo tutto noi — tu aspetta i pazienti.',
    ctaText: 'Prenota una call gratuita →',
  },
  {
    file: 'ristorante/index.html',
    insertBefore: '<section class="section" id="metodo">',
    lang: 'it', sectorColor: '#e8471a', bgColor: '#fff4f0', badgeBg: '#fde8e0',
    btnBg: '#fde8e0',
    badgeLabel: 'Google Ads · Anteprima Reale',
    hookLine1: 'Questo è ciò che vede il tuo potenziale cliente',
    hookLine2: 'quando cerca su Google', hookEm: 'ristorante Milano',
    hookSub: 'I tuoi concorrenti stanno già investendo in Google Ads. Il tuo locale potrebbe apparire qui già da domani sera.',
    searchQuery: 'ristorante Milano Navigli',
    bizUrl: 'www.trattoriadasergio.it',
    headline: 'Trattoria da Sergio – Cucina Milanese dal 1987',
    rating: 4.7, ratingDisplay: '4,7', reviewCount: '204 recensioni',
    desc: 'Ristorante tipico ai Navigli di Milano. Prenota il tuo tavolo online — menu degustazione disponibile ogni sera.',
    sitelinks: ['Prenota Tavolo', 'Menu del Giorno', 'Sala Privata', 'Come Raggiungerci'],
    org1url: 'www.ristoranti-navigli.it', org1title: 'Ristoranti Navigli Milano – I Migliori', org1desc: 'Scopri i migliori ristoranti ai Navigli...',
    org2url: 'www.migliorinavigli.com', org2title: 'Navigli Milano – Cucina Tradizionale', org2desc: 'Ristoranti tipici milanesi. Prenota ora...',
    mapBizName: 'Trattoria da Sergio', mapCategory: 'Ristorante · <span style="color:#188038">Aperto</span> · Chiude alle 23:00',
    mapReviewLabel: '(204 recensioni)', mapAddr: 'Via dei Navigli 18, Milano',
    closingH: 'Il tuo ristorante potrebbe apparire qui.',
    closingP: 'Configuriamo tutto noi — tu prepara i tavoli.',
    ctaText: 'Prenota una call gratuita →',
  },
  {
    file: 'avvocati/index.html',
    insertBefore: '<section class="section" id="metodo">',
    lang: 'it', sectorColor: '#1a237e', bgColor: '#f0f1ff', badgeBg: '#e8eaff',
    btnBg: '#e8eaff',
    badgeLabel: 'Google Ads · Anteprima Reale',
    hookLine1: 'Questo è ciò che vede il tuo potenziale cliente',
    hookLine2: 'quando cerca su Google', hookEm: 'avvocato Torino',
    hookSub: 'I tuoi concorrenti hanno già il loro annuncio lì. Il tuo studio legale potrebbe apparire in prima posizione già da domani.',
    searchQuery: 'avvocato divorzio Torino',
    bizUrl: 'www.studiolegale-marchetti.it',
    headline: 'Avv. Marchetti – Diritto di Famiglia Torino',
    rating: 4.8, ratingDisplay: '4,8', reviewCount: '89 recensioni',
    desc: 'Separazione, divorzio e affido minori a Torino. Consulenza gratuita di 30 minuti — avvocati specializzati dal 2001.',
    sitelinks: ['Consulenza Gratuita', 'Separazione', 'Affido Minori', 'Contattaci'],
    org1url: 'www.avvocato-torino.it', org1title: 'Avvocati Torino – Studio Legale', org1desc: 'Avvocati specializzati a Torino...',
    org2url: 'www.legale-torino.com', org2title: 'Studio Legale Torino – Diritto Civile', org2desc: 'Consulenza legale professionale...',
    mapBizName: 'Studio Legale Marchetti', mapCategory: 'Studio Legale · <span style="color:#188038">Aperto</span> · Chiude alle 18:30',
    mapReviewLabel: '(89 recensioni)', mapAddr: 'Corso Vittorio Emanuele II 112, Torino',
    closingH: 'Il tuo studio legale potrebbe apparire qui.',
    closingP: 'Configuriamo tutto noi — tu pensa ai tuoi clienti.',
    ctaText: 'Prenota una call gratuita →',
  },
  {
    file: 'idraulico/index.html',
    insertBefore: '<section class="section" id="metodo">',
    lang: 'it', sectorColor: '#2e7d32', bgColor: '#f0f7f0', badgeBg: '#e8f5e9',
    btnBg: '#e8f5e9',
    badgeLabel: 'Google Ads · Anteprima Reale',
    hookLine1: 'Questo è ciò che vede il tuo potenziale cliente',
    hookLine2: 'quando cerca su Google', hookEm: 'idraulico Bologna',
    hookSub: 'I tuoi concorrenti stanno già ricevendo chiamate dai tuoi clienti. Il tuo nome potrebbe apparire al primo posto già domani.',
    searchQuery: 'idraulico emergenza Bologna',
    bizUrl: 'www.idraulicopronto-bo.it',
    headline: 'Idraulico Pronto Bologna – Intervento in 30 Min',
    rating: 4.9, ratingDisplay: '4,9', reviewCount: '156 recensioni',
    desc: 'Perdite, intasamenti e caldaie a Bologna. Disponibile 24/7 — preventivo gratuito immediato, senza sorprese.',
    sitelinks: ['Chiama Ora', 'Emergenze 24/7', 'Preventivo Gratis', 'Area Servizio'],
    org1url: 'www.idraulici-bologna.it', org1title: 'Idraulici Bologna – Pronto Intervento', org1desc: 'Idraulici a Bologna disponibili H24...',
    org2url: 'www.pronto-idraulico.com', org2title: 'Idraulico Bologna – Interventi Rapidi', org2desc: 'Riparazioni impianti idraulici...',
    mapBizName: 'Idraulico Pronto Bologna', mapCategory: 'Idraulico · <span style="color:#188038">Aperto</span> · Disponibile 24/7',
    mapReviewLabel: '(156 recensioni)', mapAddr: 'Via Zamboni 22, Bologna',
    closingH: 'La tua attività potrebbe apparire qui.',
    closingP: 'Configuriamo tutto noi — tu pensa alle riparazioni.',
    ctaText: 'Prenota una call gratuita →',
  },
  {
    file: 'palestra/index.html',
    insertBefore: '<section class="section" id="metodo">',
    lang: 'it', sectorColor: '#7b1fa2', bgColor: '#f9f0ff', badgeBg: '#f3e5ff',
    btnBg: '#f3e5ff',
    badgeLabel: 'Google Ads · Anteprima Reale',
    hookLine1: 'Questo è ciò che vede il tuo potenziale cliente',
    hookLine2: 'quando cerca su Google', hookEm: 'palestra Firenze',
    hookSub: 'I tuoi concorrenti stanno già acquisendo nuovi iscritti. La tua palestra potrebbe apparire al primo posto già da domani.',
    searchQuery: 'palestra Firenze centro',
    bizUrl: 'www.fitcenter-firenze.it',
    headline: 'FitCenter Firenze – Allenati nel Centro Storico',
    rating: 4.6, ratingDisplay: '4,6', reviewCount: '312 recensioni',
    desc: 'Palestra attrezzata a Firenze Centro. Prova gratuita 7 giorni — personal trainer incluso nel primo mese.',
    sitelinks: ['Prova 7 Giorni Gratis', 'Corsi Fitness', 'Personal Trainer', 'Abbonamenti'],
    org1url: 'www.palestre-firenze.it', org1title: 'Palestre Firenze – Abbonamenti e Corsi', org1desc: 'Le migliori palestre di Firenze...',
    org2url: 'www.fitness-firenze.com', org2title: 'Fitness Center Firenze – Prenota Ora', org2desc: 'Centro fitness nel cuore di Firenze...',
    mapBizName: 'FitCenter Firenze', mapCategory: 'Palestra · <span style="color:#188038">Aperto</span> · Chiude alle 22:00',
    mapReviewLabel: '(312 recensioni)', mapAddr: 'Via dei Servi 42, Firenze',
    closingH: 'La tua palestra potrebbe apparire qui.',
    closingP: 'Configuriamo tutto noi — tu allena i tuoi clienti.',
    ctaText: 'Prenota una call gratuita →',
  },
  {
    file: 'estetica/index.html',
    insertBefore: '<section class="section" id="metodo">',
    lang: 'it', sectorColor: '#c2185b', bgColor: '#fff0f5', badgeBg: '#ffe8f1',
    btnBg: '#ffe8f1',
    badgeLabel: 'Google Ads · Anteprima Reale',
    hookLine1: 'Questo è ciò che vede la tua potenziale cliente',
    hookLine2: 'quando cerca su Google', hookEm: 'centro estetico Napoli',
    hookSub: 'I tuoi concorrenti hanno già il loro annuncio attivo. Il tuo centro estetico potrebbe apparire al primo posto già domani.',
    searchQuery: 'centro estetico Napoli Chiaia',
    bizUrl: 'www.beautylabchiaia.it',
    headline: 'Beauty Lab Chiaia – Trattamenti Viso e Corpo',
    rating: 4.8, ratingDisplay: '4,8', reviewCount: '178 recensioni',
    desc: 'Centro estetico a Napoli Chiaia. Trattamenti viso, laser e massaggi — prenota online in 2 minuti.',
    sitelinks: ['Prenota Ora', 'Laser Depilazione', 'Trattamenti Viso', 'Lista Prezzi'],
    org1url: 'www.estetica-napoli.it', org1title: 'Centri Estetici Napoli – I Migliori', org1desc: 'Centri estetici a Napoli con recensioni...',
    org2url: 'www.chiaia-beauty.com', org2title: 'Beauty Center Chiaia – Trattamenti', org2desc: 'Trattamenti estetici nel cuore di Napoli...',
    mapBizName: 'Beauty Lab Chiaia', mapCategory: 'Centro Estetico · <span style="color:#188038">Aperto</span> · Chiude alle 20:00',
    mapReviewLabel: '(178 recensioni)', mapAddr: 'Via Chiaia 88, Napoli',
    closingH: 'Il tuo centro estetico potrebbe apparire qui.',
    closingP: 'Configuriamo tutto noi — tu cura le tue clienti.',
    ctaText: 'Prenota una call gratuita →',
  },
  {
    file: 'fisioterapia/index.html',
    insertBefore: '<section class="section" id="metodo">',
    lang: 'it', sectorColor: '#00796b', bgColor: '#f0faf8', badgeBg: '#e0f5f3',
    btnBg: '#e0f5f3',
    badgeLabel: 'Google Ads · Anteprima Reale',
    hookLine1: 'Questo è ciò che vede il tuo potenziale paziente',
    hookLine2: 'quando cerca su Google', hookEm: 'fisioterapista Milano',
    hookSub: 'I tuoi concorrenti stanno già ricevendo nuove prenotazioni. Il tuo studio potrebbe apparire in prima posizione già da domani.',
    searchQuery: 'fisioterapista Milano Brera',
    bizUrl: 'www.studiofisiobrera.it',
    headline: 'Studio Fisio Brera – Fisioterapia e Osteopatia',
    rating: 4.9, ratingDisplay: '4,9', reviewCount: '94 recensioni',
    desc: 'Fisioterapia, osteopatia e riabilitazione a Milano Brera. Prima seduta scontata — prenota online oggi stesso.',
    sitelinks: ['Prima Seduta Scontata', 'Osteopatia', 'Riabilitazione', 'Prenota Online'],
    org1url: 'www.fisioterapia-milano.it', org1title: 'Fisioterapia Milano – Studio Specializzato', org1desc: 'Fisioterapisti a Milano con prenotazione...',
    org2url: 'www.brera-fisio.com', org2title: 'Osteopatia Milano Brera – Centro Salute', org2desc: 'Fisioterapia e osteopatia nel centro...',
    mapBizName: 'Studio Fisio Brera', mapCategory: 'Fisioterapista · <span style="color:#188038">Aperto</span> · Chiude alle 19:00',
    mapReviewLabel: '(94 recensioni)', mapAddr: 'Corso Garibaldi 78, Milano',
    closingH: 'Il tuo studio potrebbe apparire qui.',
    closingP: 'Configuriamo tutto noi — tu pensa ai tuoi pazienti.',
    ctaText: 'Prenota una call gratuita →',
  },
  {
    file: 'hotel/index.html',
    insertBefore: '<section class="section" id="metodo">',
    lang: 'it', sectorColor: '#f57f17', bgColor: '#fff8e1', badgeBg: '#fff3d1',
    btnBg: '#fff3e0',
    badgeLabel: 'Google Ads · Anteprima Reale',
    hookLine1: 'Questo è ciò che vede il tuo potenziale ospite',
    hookLine2: 'quando cerca su Google', hookEm: 'hotel Roma',
    hookSub: 'I tuoi concorrenti stanno già ricevendo prenotazioni dirette. Il tuo hotel potrebbe apparire al primo posto già da domani.',
    searchQuery: 'hotel Roma centro storico',
    bizUrl: 'www.hotelforiimperiali.it',
    headline: 'Hotel Fori Imperiali – Nel Cuore di Roma',
    rating: 4.7, ratingDisplay: '4,7', reviewCount: '521 recensioni',
    desc: 'Hotel 4 stelle a Roma Centro Storico. Colazione inclusa, WiFi gratuito — prenota diretto e risparmi il 20%.',
    sitelinks: ['Prenota Diretto', 'Offerte Speciali', 'Camere e Tariffe', 'Dove Siamo'],
    org1url: 'www.hotel-roma-centro.it', org1title: 'Hotel Roma Centro – Migliori Offerte', org1desc: 'I migliori hotel nel centro di Roma...',
    org2url: 'www.romahotel24.com', org2title: 'Hotel Roma – Prenota al Miglior Prezzo', org2desc: 'Alberghi a Roma con colazione inclusa...',
    mapBizName: 'Hotel Fori Imperiali', mapCategory: 'Hotel ★★★★ · <span style="color:#188038">Aperto</span> · Reception 24 ore',
    mapReviewLabel: '(521 recensioni)', mapAddr: 'Via dei Fori Imperiali 15, Roma',
    closingH: 'Il tuo hotel potrebbe apparire qui.',
    closingP: "Configuriamo tutto noi — tu prepara l'accoglienza.",
    ctaText: 'Prenota una call gratuita →',
  },
  {
    file: 'immobiliare/index.html',
    insertBefore: '<section class="section" id="metodo">',
    lang: 'it', sectorColor: '#5d4037', bgColor: '#f5f0ee', badgeBg: '#ede8e4',
    btnBg: '#ede8e4',
    badgeLabel: 'Google Ads · Anteprima Reale',
    hookLine1: 'Questo è ciò che vede il tuo potenziale cliente',
    hookLine2: 'quando cerca su Google', hookEm: 'agenzia immobiliare Venezia',
    hookSub: 'I tuoi concorrenti stanno già raccogliendo lead qualificati. La tua agenzia potrebbe apparire al primo posto già da domani.',
    searchQuery: 'agenzia immobiliare Venezia',
    bizUrl: 'www.immobilvenezia.it',
    headline: 'ImmobilVenezia – Appartamenti e Ville a Venezia',
    rating: 4.8, ratingDisplay: '4,8', reviewCount: '67 recensioni',
    desc: 'Agenzia immobiliare a Venezia dal 1998. Acquisto, vendita e affitto — valutazione gratuita del tuo immobile.',
    sitelinks: ['Valutazione Gratuita', 'Appartamenti', 'Ville e Lusso', 'Chi Siamo'],
    org1url: 'www.case-venezia.it', org1title: 'Case Venezia – Compra e Affitto', org1desc: 'Immobili a Venezia. Tutte le proposte...',
    org2url: 'www.venezia-homes.com', org2title: 'Venezia Homes – Agenzia Immobiliare', org2desc: 'Appartamenti e ville a Venezia e Mestre...',
    mapBizName: 'ImmobilVenezia Realty', mapCategory: 'Agenzia Immobiliare · <span style="color:#188038">Aperto</span> · Chiude alle 18:00',
    mapReviewLabel: '(67 recensioni)', mapAddr: 'Campo San Luca 4516, Venezia',
    closingH: 'La tua agenzia potrebbe apparire qui.',
    closingP: 'Configuriamo tutto noi — tu pensa ai tuoi immobili.',
    ctaText: 'Prenota una call gratuita →',
  },

  // ── ENGLISH ──────────────────────────────────────────────────────────────
  {
    file: 'dentist-en/index.html',
    insertBefore: '<section class="section" id="method">',
    lang: 'en', sectorColor: '#1a73e8', bgColor: '#f0f4ff', badgeBg: '#e8eeff',
    btnBg: '#e8f0fe',
    badgeLabel: 'Google Ads · Live Preview',
    hookLine1: 'This is what your potential patient sees',
    hookLine2: 'when they search on Google for', hookEm: 'dentist Rome',
    hookSub: 'Your competitors already have their ad running. Your practice could appear in the top position starting tomorrow.',
    searchQuery: 'dentist near me Rome',
    bizUrl: 'www.ferrettidental.it',
    headline: 'Ferretti Dental Studio – Award-Winning Dentistry',
    rating: 4.9, ratingDisplay: '4.9', reviewCount: '127 reviews',
    desc: 'Professional dental care in Rome Prati. Free first consultation — book online in under 60 seconds.',
    sitelinks: ['Free Consultation', 'Implants', 'Teeth Whitening', 'Book Online'],
    org1url: 'www.dentist-rome.it', org1title: 'Dentist Rome – Dental Associates', org1desc: 'Dental care in Rome. Free online quotes...',
    org2url: 'www.romadental.com', org2title: 'Rome Dental Clinic – Book Now', org2desc: 'Dental studio in the Prati area of Rome...',
    mapBizName: 'Ferretti Dental Studio', mapCategory: 'Dentist · <span style="color:#188038">Open</span> · Closes at 7:00 PM',
    mapReviewLabel: '(127 reviews)', mapAddr: 'Via Cola di Rienzo 45, Rome',
    closingH: 'Your dental practice could appear here.',
    closingP: 'We set everything up — you focus on your patients.',
    ctaText: 'Book a free call →',
  },
  {
    file: 'restaurant/index.html',
    insertBefore: '<section class="section" id="metodo"><div class="container">',
    lang: 'en', sectorColor: '#e8471a', bgColor: '#fff4f0', badgeBg: '#fde8e0',
    btnBg: '#fde8e0',
    badgeLabel: 'Google Ads · Live Preview',
    hookLine1: 'This is what your potential customer sees',
    hookLine2: 'when they search on Google for', hookEm: 'restaurant Milan',
    hookSub: 'Your competitors are already taking bookings from your potential customers. Your restaurant could appear here starting tomorrow.',
    searchQuery: 'restaurant Milan Navigli',
    bizUrl: 'www.sergiostrattoria.it',
    headline: "Sergio's Trattoria – Authentic Milanese Cuisine",
    rating: 4.7, ratingDisplay: '4.7', reviewCount: '204 reviews',
    desc: "Traditional Italian restaurant in Milan's Navigli district. Book your table online — tasting menu available every evening.",
    sitelinks: ['Book a Table', "Today's Menu", 'Private Room', 'Find Us'],
    org1url: 'www.navigli-restaurants.it', org1title: 'Navigli Restaurants Milan – Top Picks', org1desc: 'Discover the best restaurants in Navigli...',
    org2url: 'www.milanfood.com', org2title: 'Milan Dining – Traditional Cuisine', org2desc: 'Top Milanese restaurants. Book now...',
    mapBizName: "Sergio's Trattoria", mapCategory: 'Restaurant · <span style="color:#188038">Open</span> · Closes at 11:00 PM',
    mapReviewLabel: '(204 reviews)', mapAddr: 'Via dei Navigli 18, Milan',
    closingH: 'Your restaurant could appear here.',
    closingP: 'We set everything up — you focus on the tables.',
    ctaText: 'Book a free call →',
  },
  {
    file: 'lawyers/index.html',
    insertBefore: '<section class="section method" id="method">',
    lang: 'en', sectorColor: '#1a237e', bgColor: '#f0f1ff', badgeBg: '#e8eaff',
    btnBg: '#e8eaff',
    badgeLabel: 'Google Ads · Live Preview',
    hookLine1: 'This is what your potential client sees',
    hookLine2: 'when they search on Google for', hookEm: 'lawyer Turin',
    hookSub: 'Your competitors are already receiving enquiries from your potential clients. Your firm could appear at the top starting tomorrow.',
    searchQuery: 'divorce lawyer Turin',
    bizUrl: 'www.marchettilaw.it',
    headline: 'Marchetti Law – Family Law Specialists Turin',
    rating: 4.8, ratingDisplay: '4.8', reviewCount: '89 reviews',
    desc: 'Divorce, separation and child custody in Turin. Free 30-min consultation — family law specialists since 2001.',
    sitelinks: ['Free Consultation', 'Divorce', 'Child Custody', 'Contact Us'],
    org1url: 'www.lawyer-turin.it', org1title: 'Lawyers Turin – Legal Associates', org1desc: 'Law firms in Turin. Online consultations...',
    org2url: 'www.legal-turin.com', org2title: 'Turin Legal Studio – Civil Law', org2desc: 'Professional legal advice in Turin...',
    mapBizName: 'Marchetti Law Firm', mapCategory: 'Law Firm · <span style="color:#188038">Open</span> · Closes at 6:30 PM',
    mapReviewLabel: '(89 reviews)', mapAddr: 'Corso Vittorio Emanuele II 112, Turin',
    closingH: 'Your law firm could appear here.',
    closingP: 'We set everything up — you focus on your clients.',
    ctaText: 'Book a free call →',
  },
  {
    file: 'gym/index.html',
    insertBefore: '<section class="section method" id="method">',
    lang: 'en', sectorColor: '#7b1fa2', bgColor: '#f9f0ff', badgeBg: '#f3e5ff',
    btnBg: '#f3e5ff',
    badgeLabel: 'Google Ads · Live Preview',
    hookLine1: 'This is what your potential member sees',
    hookLine2: 'when they search on Google for', hookEm: 'gym Florence',
    hookSub: 'Your competitors are already signing up new members. Your gym could appear in the top position starting tomorrow.',
    searchQuery: 'gym Florence city centre',
    bizUrl: 'www.fitcenter-florence.it',
    headline: 'FitCenter Florence – Train in the Historic Centre',
    rating: 4.6, ratingDisplay: '4.6', reviewCount: '312 reviews',
    desc: 'Fully equipped gym in Florence City Centre. 7-day free trial — personal trainer included in your first month.',
    sitelinks: ['7-Day Free Trial', 'Group Classes', 'Personal Trainer', 'Memberships'],
    org1url: 'www.gym-florence.it', org1title: 'Gyms Florence – Classes & Memberships', org1desc: 'Top gyms in Florence city centre...',
    org2url: 'www.flofit.com', org2title: 'FloFit Florence – Fitness Centre', org2desc: 'Premium fitness club in the heart of Florence...',
    mapBizName: 'FitCenter Florence', mapCategory: 'Gym · <span style="color:#188038">Open</span> · Closes at 10:00 PM',
    mapReviewLabel: '(312 reviews)', mapAddr: 'Via dei Servi 42, Florence',
    closingH: 'Your gym could appear here.',
    closingP: 'We set everything up — you focus on your members.',
    ctaText: 'Book a free call →',
  },
  {
    file: 'beauty/index.html',
    insertBefore: '<section class="section" id="metodo">',
    lang: 'en', sectorColor: '#c2185b', bgColor: '#fff0f5', badgeBg: '#ffe8f1',
    btnBg: '#ffe8f1',
    badgeLabel: 'Google Ads · Live Preview',
    hookLine1: 'This is what your potential client sees',
    hookLine2: 'when they search on Google for', hookEm: 'beauty salon Naples',
    hookSub: 'Your competitors already have their ad running. Your beauty centre could appear at the top starting tomorrow.',
    searchQuery: 'beauty salon Naples Chiaia',
    bizUrl: 'www.beautylabchiaia.it',
    headline: 'Beauty Lab Chiaia – Facial & Body Treatments',
    rating: 4.8, ratingDisplay: '4.8', reviewCount: '178 reviews',
    desc: 'Beauty centre in Naples Chiaia. Facials, laser hair removal and massages — book online in just 2 minutes.',
    sitelinks: ['Book Now', 'Laser Hair Removal', 'Facial Treatments', 'Price List'],
    org1url: 'www.beauty-naples.it', org1title: 'Beauty Salons Naples – Top Rated', org1desc: 'Best beauty centres in Naples with reviews...',
    org2url: 'www.chiaia-beauty.com', org2title: 'Beauty Center Chiaia – Treatments', org2desc: 'Aesthetic treatments in the heart of Naples...',
    mapBizName: 'Beauty Lab Chiaia', mapCategory: 'Beauty Salon · <span style="color:#188038">Open</span> · Closes at 8:00 PM',
    mapReviewLabel: '(178 reviews)', mapAddr: 'Via Chiaia 88, Naples',
    closingH: 'Your beauty centre could appear here.',
    closingP: 'We set everything up — you focus on your clients.',
    ctaText: 'Book a free call →',
  },
  {
    file: 'physiotherapy/index.html',
    insertBefore: '<section class="section" id="metodo"><div class="container">',
    lang: 'en', sectorColor: '#00796b', bgColor: '#f0faf8', badgeBg: '#e0f5f3',
    btnBg: '#e0f5f3',
    badgeLabel: 'Google Ads · Live Preview',
    hookLine1: 'This is what your potential patient sees',
    hookLine2: 'when they search on Google for', hookEm: 'physiotherapist Milan',
    hookSub: 'Your competitors are already receiving new bookings. Your practice could appear in the top position starting tomorrow.',
    searchQuery: 'physiotherapist Milan Brera',
    bizUrl: 'www.fisiobrera.it',
    headline: 'Fisio Brera – Physiotherapy & Osteopathy Milan',
    rating: 4.9, ratingDisplay: '4.9', reviewCount: '94 reviews',
    desc: 'Physiotherapy, osteopathy and rehabilitation in Milan Brera. First session discounted — book online today.',
    sitelinks: ['Discounted First Session', 'Osteopathy', 'Rehabilitation', 'Book Online'],
    org1url: 'www.physio-milan.it', org1title: 'Physiotherapy Milan – Specialist Studio', org1desc: 'Physiotherapists in Milan with online booking...',
    org2url: 'www.brera-health.com', org2title: 'Brera Health – Osteopathy Milan', org2desc: 'Physiotherapy and osteopathy in the city...',
    mapBizName: 'Fisio Brera Studio', mapCategory: 'Physiotherapist · <span style="color:#188038">Open</span> · Closes at 7:00 PM',
    mapReviewLabel: '(94 reviews)', mapAddr: 'Corso Garibaldi 78, Milan',
    closingH: 'Your practice could appear here.',
    closingP: 'We set everything up — you focus on your patients.',
    ctaText: 'Book a free call →',
  },
  {
    file: 'real-estate/index.html',
    insertBefore: '<section class="section method" id="method">',
    lang: 'en', sectorColor: '#5d4037', bgColor: '#f5f0ee', badgeBg: '#ede8e4',
    btnBg: '#ede8e4',
    badgeLabel: 'Google Ads · Live Preview',
    hookLine1: 'This is what your potential client sees',
    hookLine2: 'when they search on Google for', hookEm: 'real estate Venice',
    hookSub: 'Your competitors are already collecting qualified leads. Your agency could appear at the top starting tomorrow.',
    searchQuery: 'real estate agency Venice',
    bizUrl: 'www.immobilvenezia.it',
    headline: 'ImmobilVenezia – Apartments & Villas in Venice',
    rating: 4.8, ratingDisplay: '4.8', reviewCount: '67 reviews',
    desc: 'Real estate agency in Venice since 1998. Buying, selling and renting — free property valuation included.',
    sitelinks: ['Free Valuation', 'Apartments', 'Luxury Villas', 'About Us'],
    org1url: 'www.venice-property.it', org1title: 'Venice Property – Buy & Rent', org1desc: 'Real estate listings in Venice...',
    org2url: 'www.venetohomes.com', org2title: 'Veneto Homes – Real Estate', org2desc: 'Apartments and villas in Venice and Mestre...',
    mapBizName: 'ImmobilVenezia Realty', mapCategory: 'Real Estate Agency · <span style="color:#188038">Open</span> · Closes at 6:00 PM',
    mapReviewLabel: '(67 reviews)', mapAddr: 'Campo San Luca 4516, Venice',
    closingH: 'Your agency could appear here.',
    closingP: 'We set everything up — you focus on your listings.',
    ctaText: 'Book a free call →',
  },
  {
    file: 'hotel-en/index.html',
    insertBefore: '<section class="section" id="method">',
    lang: 'en', sectorColor: '#f57f17', bgColor: '#fff8e1', badgeBg: '#fff3d1',
    btnBg: '#fff3e0',
    badgeLabel: 'Google Ads · Live Preview',
    hookLine1: 'This is what your potential guest sees',
    hookLine2: 'when they search on Google for', hookEm: 'hotel Rome',
    hookSub: 'Your competitors are already receiving direct bookings. Your hotel could appear at the top starting tomorrow.',
    searchQuery: 'hotel Rome city centre',
    bizUrl: 'www.foriimperialihotel.it',
    headline: 'Fori Imperiali Hotel – In the Heart of Rome',
    rating: 4.7, ratingDisplay: '4.7', reviewCount: '521 reviews',
    desc: '4-star hotel in Rome City Centre. Breakfast included, free WiFi — book directly and save 20% on your stay.',
    sitelinks: ['Book Direct', 'Special Offers', 'Rooms & Rates', 'Find Us'],
    org1url: 'www.hotel-rome-centre.it', org1title: 'Hotels Rome Centre – Best Rates', org1desc: 'Top hotels in central Rome. Best price guarantee...',
    org2url: 'www.romeaccommodation.com', org2title: 'Rome Hotels – Book with Confidence', org2desc: 'Hotels in Rome with breakfast included...',
    mapBizName: 'Fori Imperiali Hotel', mapCategory: 'Hotel ★★★★ · <span style="color:#188038">Open</span> · 24-hour Reception',
    mapReviewLabel: '(521 reviews)', mapAddr: 'Via dei Fori Imperiali 15, Rome',
    closingH: 'Your hotel could appear here.',
    closingP: 'We set everything up — you focus on hospitality.',
    ctaText: 'Book a free call →',
  },
  {
    file: 'plumber/index.html',
    insertBefore: '<section class="section" id="metodo"><div class="container">',
    lang: 'en', sectorColor: '#2e7d32', bgColor: '#f0f7f0', badgeBg: '#e8f5e9',
    btnBg: '#e8f5e9',
    badgeLabel: 'Google Ads · Live Preview',
    hookLine1: 'This is what your potential client sees',
    hookLine2: 'when they search on Google for', hookEm: 'plumber Bologna',
    hookSub: 'Your competitors are already receiving calls from your potential customers. Your business could appear at the top starting tomorrow.',
    searchQuery: 'emergency plumber Bologna',
    bizUrl: 'www.bolognaplumbing.it',
    headline: 'Bologna Plumbing Pro – 30-Min Emergency Response',
    rating: 4.9, ratingDisplay: '4.9', reviewCount: '156 reviews',
    desc: 'Leaks, blockages and boilers in Bologna. Available 24/7 — free instant quote, no hidden charges.',
    sitelinks: ['Call Now', '24/7 Emergencies', 'Free Quote', 'Service Area'],
    org1url: 'www.plumber-bologna.it', org1title: 'Plumbers Bologna – Emergency Service', org1desc: 'Plumbers in Bologna available 24 hours...',
    org2url: 'www.bologna-pipework.com', org2title: 'Bologna Pipework – Fast Response', org2desc: 'Plumbing repairs and installations...',
    mapBizName: 'Bologna Plumbing Pro', mapCategory: 'Plumber · <span style="color:#188038">Open</span> · Available 24/7',
    mapReviewLabel: '(156 reviews)', mapAddr: 'Via Zamboni 22, Bologna',
    closingH: 'Your business could appear here.',
    closingP: 'We set everything up — you focus on the work.',
    ctaText: 'Book a free call →',
  },
];

let ok = 0, err = 0;

for (const page of pages) {
  const filePath = resolve(ROOT, page.file);
  let html;
  try {
    html = readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error(`SKIP (read error): ${page.file} — ${e.message}`);
    err++; continue;
  }

  const { dark, soft } = colorMap[page.sectorColor] || { dark: page.sectorColor, soft: '#f5f5f5' };

  // 1. Replace CSS variables --green, --green-dark, --green-soft
  html = html.replace(
    '--green: #33C494; --green-dark: #28A57C; --green-soft: #E6F7F0;',
    `--green: ${page.sectorColor}; --green-dark: ${dark}; --green-soft: ${soft};`
  );

  // 2. Replace hardcoded brand green in SVG fills/strokes
  html = html.replaceAll('#33C494', page.sectorColor);

  // 3. Replace ads section (from <!-- ADS SHOWCASE --> to just before method marker)
  const adsStart = html.indexOf('\n<!-- ADS SHOWCASE -->');
  if (adsStart !== -1) {
    const methodIdx = html.indexOf(page.insertBefore, adsStart);
    if (methodIdx !== -1) {
      const newSection = buildSection(page);
      html = html.slice(0, adsStart) + newSection + html.slice(methodIdx);
    } else {
      console.error(`WARN (method marker not found after ads): ${page.file}`);
    }
  } else {
    console.log(`WARN (no ads section found): ${page.file}`);
  }

  // 4. Insert trust bar before cta-final (idempotent)
  if (!html.includes('<!-- TRUST BAR -->')) {
    const ctaMarker = '<section class="cta-final"';
    const ctaIdx = html.indexOf(ctaMarker);
    if (ctaIdx !== -1) {
      const trustBar = buildTrustBar(page);
      html = html.slice(0, ctaIdx) + trustBar + '\n' + html.slice(ctaIdx);
    } else {
      console.error(`WARN (cta-final not found): ${page.file}`);
    }
  }

  try {
    writeFileSync(filePath, html, 'utf8');
    console.log(`OK: ${page.file}`);
    ok++;
  } catch (e) {
    console.error(`SKIP (write error): ${page.file} — ${e.message}`);
    err++;
  }
}

console.log(`\nDone: ${ok} updated, ${err} errors.`);
