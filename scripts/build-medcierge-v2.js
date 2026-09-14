#!/usr/bin/env node
/* Elite Medical Concierge, design 2 (lapis and gold), in English, German and Polish.

     node scripts/build-medcierge-v2.js               preview at /medcierge-v2 on HCIG Work, noindex
     node scripts/build-medcierge-v2.js --production  their hosting: root paths, indexable

   Words: scripts/medcierge/content.js, with scripts/medcierge/i18n/de.js and pl.js
   deep-merged over it. Writes src/medcierge-v2/. build.js copies that folder into
   dist/medcierge-v2 verbatim. Design 1 (build-medcierge.js) is untouched. */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EN = require('./medcierge/content.js');
const OVER = { de: require('./medcierge/i18n/de.js'), pl: require('./medcierge/i18n/pl.js') };

const PROD = process.argv.includes('--production');
const BASE = PROD ? '' : '/medcierge-v2';
const OUT = path.join(__dirname, '..', 'src', 'medcierge-v2');
const ICONS = path.join(__dirname, 'medcierge', 'icons');
const ORIGIN = EN.site.origin;
const SHARE = PROD ? ORIGIN : 'https://hcig-passport.vercel.app' + BASE;
const S = EN.site;
const LANGS = ['en', 'de', 'pl'];
const LOCALE = { en: 'en_GB', de: 'de_DE', pl: 'pl_PL' };

const ROUTES = {
  en: { home: '/', about: '/about', services: '/services', areas: '/service-areas', facilities: '/facilities', partners: '/partners', video: '/video-consultation', hurghada: '/hurghada' },
  de: { home: '/de', about: '/de/ueber-uns', services: '/de/leistungen', areas: '/de/einsatzgebiete', facilities: '/de/einrichtungen', partners: '/de/partner', video: '/de/videosprechstunde', hurghada: '/de/arzt-hurghada' },
  pl: { home: '/pl', about: '/pl/o-nas', services: '/pl/uslugi', areas: '/pl/obszary-dzialania', facilities: '/pl/placowki', partners: '/pl/partnerzy', video: '/pl/wideokonsultacja', hurghada: '/pl/lekarz-hurghada' },
};
const PAGE_KEYS = Object.keys(ROUTES.en);

function merge(base, over) {
  if (over === undefined) return base;
  if (Array.isArray(base) && Array.isArray(over)) {
    const out = base.slice();
    over.forEach((v, i) => { if (v !== undefined) out[i] = merge(base[i], v); });
    return out;
  }
  if (base && typeof base === 'object' && over && typeof over === 'object' && !Array.isArray(over)) {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
    return out;
  }
  return over;
}
const CONTENT = { en: EN, de: merge(EN, OVER.de), pl: merge(EN, OVER.pl) };
const hurghadaFor = (L) => (L === 'en' ? EN.hurghada.en : L === 'de' ? EN.hurghada.de : CONTENT.pl.hurghada.pl);

/* ---------------------------------------------------------------- helpers */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const asset = (p) => BASE + p;

function href(L, key, hash) {
  const p = ROUTES[L][key];
  const base = p === '/' ? BASE : BASE + p;
  if (hash) return p === '/' && !BASE ? `/#${hash}` : `${base}#${hash}`;
  return base || '/';
}
/* a language home is a folder index, so /de and /de/leistungen can live side by side */
const fileFor = (p) => (p === '/' ? 'index.html' : /^\/(de|pl)$/.test(p) ? p.slice(1) + '/index.html' : p.slice(1) + '.html');

const iconCache = {};
function icon(name, cls = '') {
  if (!iconCache[name]) {
    const f = path.join(ICONS, name + '.svg');
    if (!fs.existsSync(f)) throw new Error(`missing icon: ${name}`);
    const raw = fs.readFileSync(f, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    iconCache[name] = raw.slice(raw.indexOf('>', raw.indexOf('<svg')) + 1, raw.lastIndexOf('</svg>')).trim();
  }
  const filled = name === 'whatsapp';
  return `<svg class="i ${cls}" viewBox="0 0 24 24" width="24" height="24" ${
    filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'
  } aria-hidden="true" focusable="false">${iconCache[name]}</svg>`;
}

function photo(name, alt, sizes, cls = '', eager = false) {
  return `<img class="${cls}" src="${asset(`/img/${name}.webp`)}" srcset="${asset(`/img/${name}-800.webp`)} 800w, ${asset(`/img/${name}.webp`)} 1600w" sizes="${sizes}" width="1600" height="900" alt="${esc(alt)}"${
    eager ? ' fetchpriority="high"' : ' loading="lazy"'
  } decoding="async">`;
}
const logoImg = (C, key, cls = '', eager = false) =>
  `<img class="${cls}" src="${asset(`/img/logos/${key}.png`)}" width="128" height="128" alt="${esc(C.logos[key])}"${eager ? '' : ' loading="lazy"'} decoding="async">`;

const initials = (name) => name.replace(/^The /, '').split(/[\s-]+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const rv = (i = 0) => `data-reveal style="--d:${Math.min(i, 8) * 60}ms"`;

const STAR = 'M0-10L2.4-3.1 9.5-3.1 3.8 1.2 5.9 8.1 0 3.9-5.9 8.1-3.8 1.2-9.5-3.1-2.4-3.1Z';
function logoMark(cls = '') {
  /* the cartouche seal: an upright name ring with a star over the E and a tie bar at its base */
  return `<svg class="mark ${cls}" viewBox="0 0 40 56" aria-hidden="true" focusable="false"><rect x="3" y="2" width="34" height="45" rx="17" fill="none" stroke="currentColor" stroke-width="2"/><rect x="6.5" y="5.5" width="27" height="38" rx="13.5" fill="none" stroke="currentColor" stroke-width=".9" opacity=".55"/><path d="${STAR}" transform="translate(20 15.5) scale(.36)" fill="currentColor"/><text x="20" y="36.5" text-anchor="middle" font-size="16" fill="currentColor">E</text><path d="M20 47v5M9 52.5h22" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
}

function head2(o, id) {
  const a = id ? ` id="${id}"` : '';
  if (o.h2) return `<h2${a}>${esc(o.h2)}</h2>`;
  return `<h2${a}>${esc(o.h2a)} <span class="accent">${esc(o.h2b)}</span></h2>`;
}
const checks = (list) => `<ul class="checks">${list.map((t) => `<li>${icon('check', 'i--sm')}<span>${esc(t)}</span></li>`).join('')}</ul>`;
function who(name, where) {
  const ini = name.split(' ').map((w) => w[0]).join('').replace(/\./g, '');
  return `<div class="who"><span class="who__av" aria-hidden="true">${esc(ini)}</span><div><b>${esc(name)}</b><span>${esc(where)}</span></div></div>`;
}
const stars = `<div class="stars" role="img" aria-label="5/5">${icon('star').repeat(5)}</div>`;

/* ---------------------------------------------------------------- schema */

const ORG_ID = ORIGIN + '/#organization';
function org(C) {
  return {
    '@type': 'MedicalBusiness', '@id': ORG_ID, name: S.name, url: ORIGIN + '/',
    image: SHARE + '/img/og-v2.jpg', logo: SHARE + '/favicon.svg', description: C.home.meta.description,
    telephone: '+201206788566', email: S.emails[0],
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }],
    areaServed: C.areas.map((a) => ({ '@type': 'City', name: a.name, containedInPlace: { '@type': 'Country', name: 'Egypt' } })),
    availableLanguage: ['English', 'German', 'Polish'],
    contactPoint: [
      { '@type': 'ContactPoint', telephone: '+201206788566', contactType: 'emergency', areaServed: 'EG', hoursAvailable: 'Mo-Su 00:00-23:59' },
      { '@type': 'ContactPoint', email: S.emails[1], contactType: 'customer service' },
    ],
  };
}
const crumbsLd = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: ORIGIN + (c.path === '/' ? '/' : c.path) })),
});

/* ---------------------------------------------------------------- shell */

const cssV = crypto.createHash('md5').update(fs.readFileSync(path.join(OUT, 'assets', 'v2.css'))).digest('hex').slice(0, 8);
const jsV = crypto.createHash('md5').update(fs.readFileSync(path.join(OUT, 'assets', 'v2.js'))).digest('hex').slice(0, 8);

const NAV_KEYS = ['about', 'services', 'facilities', 'areas', 'partners', 'video', 'contact'];
const navHref = (L, k) => (k === 'contact' ? href(L, 'home', 'contact') : href(L, k));

function langLinks(L, key) {
  return LANGS.map((l) => `<a href="${href(l, key)}" hreflang="${l}" lang="${l}"${l === L ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('');
}

function header(L, key) {
  const C = CONTENT[L];
  const top = NAV_KEYS.slice(0, 5).map((k, i) => `<li><a href="${navHref(L, k)}"${k === key ? ' aria-current="page"' : ''}>${esc(C.nav[i].label)}</a></li>`).join('');
  const all = NAV_KEYS.map((k, i) => `<li><a href="${navHref(L, k)}"${k === key ? ' aria-current="page"' : ''}>${esc(C.nav[i].label)}${icon('arrow-right', 'i--sm')}</a></li>`).join('');
  const themeBtn = (extra = '') => `<button class="icon-btn theme-toggle ${extra}" type="button" data-theme-toggle aria-pressed="false" aria-label="${esc(C.ui.theme)}">${icon('sun', 'i--sm i--sun')}${icon('moon', 'i--sm i--moon')}</button>`;
  return `<a class="skip" href="#main">${esc(C.ui.skip)}</a>
<header class="hdr" data-hdr>
  <div class="wrap hdr__in">
    <a class="brand" href="${href(L, 'home')}">${logoMark()}<span class="brand__txt"><span class="brand__name">Elite Medical</span><span class="brand__sub">Concierge</span></span></a>
    <nav class="nav" aria-label="${esc(C.ui.menu)}"><ul>${top}</ul></nav>
    <div class="hdr__tools">
      <nav class="langs" aria-label="${esc(C.ui.language)}">${langLinks(L, key)}</nav>
      ${themeBtn()}
      <a class="btn btn--urgent btn--sm" href="${S.tel}"><span class="pulse" aria-hidden="true"></span>${esc(C.footer.emergencyLine)}</a>
      <button class="icon-btn hdr__menu" type="button" data-menu-btn aria-expanded="false" aria-controls="menu" aria-label="${esc(C.ui.menu)}">${icon('menu')}</button>
    </div>
  </div>
</header>
<div class="menu" id="menu" hidden>
  <nav aria-label="${esc(C.ui.menu)}"><ul>${all}</ul></nav>
  <div class="menu__tools"><nav class="langs" aria-label="${esc(C.ui.language)}">${langLinks(L, key)}</nav>${themeBtn()}</div>
  <div class="menu__foot">
    <a class="btn btn--urgent" href="${S.tel}">${icon('phone', 'i--sm')}${esc(S.phone)}</a>
    <a class="btn btn--line" href="${S.portal}">${esc(C.footer.dashboard)}</a>
  </div>
</div>`;
}

function footer(L) {
  const C = CONTENT[L];
  const fl = [href(L, 'services'), href(L, 'home', 'why-us'), href(L, 'home', 'accreditations'), href(L, 'partners'), href(L, 'home', 'contact')];
  const areas = C.areas.map((a) => (a.href ? `<li><a href="${href(L, 'hurghada')}">${esc(a.name)}</a></li>` : `<li><span>${esc(a.name)}</span></li>`)).join('');
  return `<footer class="ftr">
  <div class="wrap ftr__grid">
    <div>
      <a class="brand" href="${href(L, 'home')}">${logoMark()}<span class="brand__txt"><span class="brand__name">Elite Medical</span><span class="brand__sub">Concierge</span></span></a>
      <p>${esc(C.site.tagline)}</p>
      <div class="ftr__contact">
        <a href="${S.tel}">${icon('phone', 'i--sm')}${esc(S.phone)}</a>
        ${S.emails.map((m) => `<a href="mailto:${m}">${icon('mail', 'i--sm')}${m}</a>`).join('')}
      </div>
    </div>
    <nav aria-label="${esc(C.footer.quickLinks)}">
      <h2>${esc(C.footer.quickLinks)}</h2>
      <ul>${C.footer.links.map((l, i) => `<li><a href="${fl[i]}">${esc(l.label)}</a></li>`).join('')}<li><a href="${href(L, 'video')}">${esc(C.nav[5].label)}</a></li></ul>
    </nav>
    <div>
      <h2>${esc(C.footer.areasTitle)}</h2>
      <ul class="ftr__areas">${areas}</ul>
    </div>
  </div>
  <div class="ftr__bar"><div class="wrap"><span>${esc(C.footer.rights)}</span><a href="${S.portal}">${esc(C.footer.dashboard)}</a></div></div>
</footer>
<a class="wa-float" href="${S.wa}" target="_blank" rel="noopener">${icon('whatsapp')}${esc(C.footer.whatsapp)}</a>
<nav class="actionbar" aria-label="${esc(C.footer.emergencyLine)}"><a class="actionbar__urgent" href="${S.tel}">${icon('phone', 'i--sm')}${esc(C.footer.emergencyLine)}</a><a class="actionbar__wa" href="${S.wa}" target="_blank" rel="noopener">${icon('whatsapp', 'i--sm')}${esc(C.footer.whatsapp)}</a></nav>`;
}

const results = [];
function page({ L, key, meta, body, trail, schema = [] }) {
  const C = CONTENT[L];
  const p = ROUTES[L][key];
  const canonical = ORIGIN + (p === '/' ? '/' : p);
  const graph = [org(C)];
  if (key === 'home') graph.push({ '@type': 'WebSite', '@id': ORIGIN + '/#website', url: ORIGIN + '/', name: S.name, inLanguage: LANGS, publisher: { '@id': ORG_ID } });
  graph.push({ '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: meta.title, description: meta.description, inLanguage: L, isPartOf: { '@id': ORIGIN + '/#website' }, about: { '@id': ORG_ID } });
  if (trail) graph.push(crumbsLd(trail));
  graph.push(...schema);
  const alts = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${ORIGIN + (ROUTES[l][key] === '/' ? '/' : ROUTES[l][key])}">`).join('\n  ')
    + `\n  <link rel="alternate" hreflang="x-default" href="${ORIGIN + (ROUTES.en[key] === '/' ? '/' : ROUTES.en[key])}">`;
  const html = `<!doctype html>
<html lang="${L}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>(function(){var d=document.documentElement;try{var t=localStorage.getItem('mc-theme');if(t==='light'||t==='dark')d.setAttribute('data-theme',t)}catch(e){}if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('js-motion')})()</script>
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}">
  <meta name="robots" content="${PROD ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}">
  <link rel="canonical" href="${canonical}">
  ${alts}
  <meta name="theme-color" content="#F8FAFC" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0B1220" media="(prefers-color-scheme: dark)">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(S.name)}">
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SHARE}/img/og-v2.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${LOCALE[L]}">
  ${LANGS.filter((l) => l !== L).map((l) => `<meta property="og:locale:alternate" content="${LOCALE[l]}">`).join('\n  ')}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${asset('/favicon.svg')}" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@500;600;700;800&family=Noto+Sans:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="${asset('/assets/v2.css')}?v=${cssV}">
  ${ld({ '@context': 'https://schema.org', '@graph': graph })}
</head>
<body>
${header(L, key)}
<main id="main">
${body}
</main>
${footer(L)}
<script src="${asset('/assets/v2.js')}?v=${jsV}" defer></script>
</body>
</html>
`;
  const dest = path.join(OUT, fileFor(p));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
  results.push({ file: fileFor(p), bytes: Buffer.byteLength(html) });
}

function crumbsNav(trail, L) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail
    .map((c, i) => (i === trail.length - 1 ? `<li><span aria-current="page">${esc(c.name)}</span></li>` : `<li><a href="${c.href}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}
const trailFor = (L, items) => items.map(([name, key]) => ({ name, path: ROUTES[L][key], href: href(L, key) }));

/* ---------------------------------------------------------------- shared blocks */

const countable = (v) => /^[\d,]+[+%]?$/.test(v);
function countStats(list) {
  return `<div class="stats">${list.map((s) => {
    const c = countable(s.value) ? ` data-count="${s.value.replace(/[+%]/g, '')}" data-suffix="${s.value.replace(/[\d,]/g, '')}"` : '';
    return `<div class="stat"><b class="num"${c}>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`;
  }).join('')}</div>`;
}

function marqueeRow(C, keys, label, reverse, dur) {
  let set = [...keys];
  while (set.length * 116 < 2100) set = set.concat(keys);
  const items = (copy) => set.map((k, i) => {
    let img = logoImg(C, k, '', true);
    if (copy || i >= keys.length) img = img.replace(/alt="[^"]*"/, 'alt=""');
    return `<li class="logo">${img}</li>`;
  }).join('');
  return `<div class="marquee${reverse ? ' marquee--rev' : ''}" style="--dur:${dur}s" role="group" aria-label="${esc(label)}">
      <div class="marquee__track"><ul class="marquee__set">${items(false)}</ul><ul class="marquee__set" aria-hidden="true">${items(true)}</ul></div>
    </div>`;
}

const ROUTE = ['Marsa Matrouh', 'Alamein', 'Alexandria', 'Cairo', 'Dahab', 'Sharm El Sheikh', 'El Gouna', 'Hurghada', 'Port Ghalib', 'Marsa Alam', 'Aswan', 'Luxor'];
function routeGeometry() {
  const pts = ROUTE.map((n) => EN.areas.find((a) => a.name === n));
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)},${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)},${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x},${p2.y}`;
  }
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  const at = { [pts[0].name]: 0 };
  let acc = 0;
  seg.forEach((s, i) => { acc += s; at[pts[i + 1].name] = +(acc / total).toFixed(3); });
  return { d, at };
}

function mapBlock(L, start) {
  const C = CONTENT[L];
  const HG = hurghadaFor(L);
  const land = fs.readFileSync(path.join(__dirname, 'medcierge', 'egypt-path.txt'), 'utf8').trim();
  const route = routeGeometry();
  const data = C.areas.map((a) => ({ name: a.name, region: a.region, hours: a.hours, href: a.href ? href(L, 'hurghada') : null }));
  const pts = C.areas.map((a) => `<g class="map__pt" data-pt="${esc(a.name)}" data-x="${a.x}" data-y="${a.y}" data-at="${route.at[a.name]}"><circle class="map__halo" cx="${a.x}" cy="${a.y}" r="18"></circle><path class="map__star" d="${STAR}" transform="translate(${a.x} ${a.y}) scale(.75)"></path><circle class="map__hit" cx="${a.x}" cy="${a.y}" r="15"></circle></g>`).join('');
  const btns = C.areas.map((a) => `<li><button class="area-btn" type="button" data-area="${esc(a.name)}" aria-pressed="false"><b>${esc(a.name)}</b><span>${esc(a.region)}</span></button></li>`).join('');
  const first = C.areas.find((a) => a.name === start) || C.areas[0];
  return `<div class="areas" data-areas="${esc(JSON.stringify(data))}" data-start="${esc(first.name)}">
      <div class="map">
        <svg viewBox="0 0 525 478" role="img" aria-label="Egypt">
          <path class="map__land" d="${land}"></path>
          <text class="map__sea" x="150" y="8">MEDITERRANEAN</text>
          <text class="map__sea" x="462" y="300" text-anchor="middle">RED SEA</text>
          <path class="map__route-bg" d="${route.d}"></path>
          <path class="map__route" d="${route.d}" pathLength="1" data-route></path>
          ${pts}
          <text class="map__label" data-map-label x="0" y="0"></text>
        </svg>
      </div>
      <div>
        <ul class="area-list">${btns}</ul>
        <div class="area-card" data-area-card aria-live="polite">
          <h3 class="cartouche" data-f="name">${esc(first.name)}</h3>
          <dl>
            <dt>${icon('map-pin', 'i--sm')}</dt><dd data-f="region">${esc(first.region)}</dd>
            <dt>${icon('clock', 'i--sm')}</dt><dd data-f="hours">${esc(first.hours)}</dd>
            <dt>${icon('phone', 'i--sm')}</dt><dd><a href="${S.tel}">${esc(S.phone)}</a></dd>
          </dl>
          <div class="area-card__cta">
            <a class="btn btn--urgent btn--sm" href="${S.tel}">${icon('phone', 'i--sm')}${esc(C.serviceAreas.cta.primary)}</a>
            <a class="btn btn--line btn--sm" data-f="more" href="${href(L, 'hurghada')}" hidden>${esc(HG.h1a)}</a>
          </div>
        </div>
      </div>
    </div>`;
}

function ctaBand(o, primaryHref, secondaryHref, primaryCls = 'btn--urgent') {
  return `<section class="cta" aria-labelledby="cta-h">
  <div class="wrap cta__in" data-reveal>
    <div><h2 id="cta-h">${esc(o.h2)}</h2><p>${esc(o.text)}</p></div>
    <div class="cta__btns">
      <a class="btn ${primaryCls}" href="${primaryHref}">${primaryCls === 'btn--urgent' ? icon('phone', 'i--sm') : ''}${esc(o.primary || o.button)}</a>
      ${o.secondary ? `<a class="btn btn--line" href="${secondaryHref}">${esc(o.secondary)}</a>` : ''}
    </div>
  </div>
</section>`;
}

function facilityCard(C, f, i, detailed, L, extraCls = '') {
  return `<article class="fac ${extraCls}" ${extraCls ? '' : rv(i)}>
        <div class="fac__img">${photo(f.img, '', '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw')}<div class="tags">${f.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>
        <div class="fac__body">
          <h3>${esc(f.title)}</h3>
          <p>${esc(f.text)}</p>
          ${detailed ? checks(f.list) : ''}
          ${detailed ? `<a class="btn btn--line btn--sm" href="${href(L, 'services', 'book')}">${esc(C.facilitiesPage.book)}</a>` : ''}
        </div>
      </article>`;
}

function waForm({ id, title, fieldsHtml, submit, note, ui }) {
  return `<form class="form placard" id="${id}" data-wa="${S.wa}" data-title="${esc(title)}" data-required="${esc(ui.required)}" data-sending="${esc(ui.sending)}" data-sent="${esc(ui.sent)}" novalidate>
      <h3>${esc(title)}</h3>
      ${fieldsHtml}
      <div class="form__actions">
        <button class="btn btn--gold btn--block" type="submit">${esc(submit)}</button>
        <p class="form__note">${icon('phone', 'i--sm')}<span>${esc(note)} <a href="${S.tel}">${esc(S.phone)}</a></span></p>
        <p class="form__status" data-status aria-live="polite"></p>
      </div>
    </form>`;
}

function field({ id, label, type = 'text', autocomplete, required, placeholder, options, span }) {
  const req = required ? ` required aria-required="true" aria-describedby="${id}-err"` : '';
  const ph = placeholder ? ` placeholder="${esc(placeholder)}"` : '';
  const ac = autocomplete ? ` autocomplete="${autocomplete}"` : '';
  let control;
  if (type === 'textarea') control = `<textarea id="${id}" name="${id}"${ph}${req}></textarea>`;
  else if (type === 'select') control = `<select id="${id}" name="${id}"${req}><option value="">${esc(options.placeholder)}</option>${options.list.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  else control = `<input id="${id}" name="${id}" type="${type}"${ac}${ph}${req}>`;
  return `<div class="field${span ? ' span-2' : ''}"><label for="${id}">${esc(label)}${required ? ' <em aria-hidden="true">*</em>' : ''}</label>${control}${required ? `<p class="field__error" id="${id}-err" aria-live="polite"></p>` : ''}</div>`;
}

const rowCard = (it, i, extra = '') => `<article class="card card--row" ${rv(i)}><span class="chip-i">${icon(it.icon)}</span><h3>${it.href || ''}${esc(it.title)}</h3><p>${esc(it.text)}</p>${extra}</article>`;

/* ---------------------------------------------------------------- pages */

/* silent background film with a still poster; v2.js plays it only while on screen */
const film = (id, name, poster) => `<video id="${id}" data-bg-video muted loop playsinline preload="none" poster="${asset(`/img/${poster}.webp`)}" aria-hidden="true" tabindex="-1"><source src="${asset(`/video/${name}-m.mp4`)}" type="video/mp4" media="(max-width: 767px)"><source src="${asset(`/video/${name}.mp4`)}" type="video/mp4"></video>`;
const filmToggle = (id, C) => `<button class="icon-btn h-film-toggle" type="button" data-video-toggle="${id}" aria-pressed="false" aria-label="${esc(C.ui.pauseVideo)}" data-label-pause="${esc(C.ui.pauseVideo)}" data-label-play="${esc(C.ui.playVideo)}">${icon('pause', 'i--sm')}${icon('play', 'i--sm')}</button>`;

function buildHome(L) {
  /* Home page, redesigned 2026-09-14 from ui-ux-pro-max: Trust & Authority + Conversion.
     Hero with credibility and one primary action, proof early, solution, process,
     social proof, certification, imagery, coverage, one clear contact path. */
  const C = CONTENT[L];
  const H = C.home;
  const G = H.trust.groups;
  const acc = H.accreditations.cards;
  const proof = acc.filter((c) => c.badge).map((c) => `<li>${logoImg(C, c.logo)}<span><b>${esc(c.badge)}</b>${esc(c.title)}</span></li>`).join('');
  const rating = H.hero.stats.find((s) => /\//.test(s.value) && /\./.test(s.value));
  page({
    L, key: 'home', meta: H.meta,
    body: `
<section class="h-hero" aria-labelledby="hero-h">
  <div class="h-hero__film">
    ${film('hero-film', 'hero', 'v2-suite')}
    ${rating ? `<div class="h-rating">${stars}<div><b class="num">${esc(rating.value)}</b><span>${esc(rating.label)}</span></div></div>` : ''}
    ${filmToggle('hero-film', C)}
  </div>
  <div class="wrap h-hero__grid">
    <div class="h-panel">
      <p class="h-status"><span class="live" aria-hidden="true"></span><span>${esc(H.hero.leadAccent)}</span><span class="h-status__sep" aria-hidden="true"></span><span>${esc(H.hero.features[0].text)}</span></p>
      <h1 id="hero-h">${esc(H.hero.h1a)} <span class="h-accent">${esc(H.hero.h1b)}</span></h1>
      <p class="h-hero__lead">${esc(H.hero.lead)}</p>
      <div class="h-hero__cta">
        <a class="btn btn--gold btn--lg" href="#contact">${icon('stethoscope', 'i--sm')}${esc(H.hero.primary)}</a>
        <a class="btn btn--line btn--lg" href="${S.tel}">${icon('phone', 'i--sm')}<span class="num">${esc(S.phone)}</span></a>
      </div>
      <ul class="h-proof">${proof}</ul>
    </div>
  </div>
</section>

<section class="h-stats" aria-label="${esc(H.hero.stats.map((s) => s.label).join(', '))}">
  <div class="wrap">
    ${countStats(H.hero.stats)}
    <ul class="facts__row">${H.hero.features.map((f) => `<li class="fact">${icon(f.icon)}<span><b>${esc(f.title)}</b> ${esc(f.text)}</span></li>`).join('')}</ul>
  </div>
</section>

<section class="sec sec--surface trust" aria-labelledby="trust-h" data-trust>
  <div class="wrap">
    <div class="sec-head sec-head--center" data-reveal><h2 id="trust-h">${esc(H.trust.h2)}</h2><p class="lead">${esc(H.trust.note)}</p></div>
  </div>
  <div class="marquees">
    <p class="wrap marquee__label">${esc(G[0].label)} · ${esc(G[1].label)}</p>
    ${marqueeRow(C, [...G[0].logos, ...G[1].logos], `${G[0].label}, ${G[1].label}`, false, 70)}
    ${marqueeRow(C, G[2].logos, G[2].label, true, 52)}
    <p class="wrap marquee__label">${esc(G[2].label)}</p>
  </div>
  <div class="wrap trust__foot">
    <a class="link-arrow" href="${href(L, 'partners')}">${esc(H.partners.pill)}${icon('arrow-right', 'i--sm')}</a>
    <button class="icon-btn marquee-toggle" type="button" data-marquee-toggle aria-pressed="false" aria-label="${esc(C.ui.pause)}" data-label-pause="${esc(C.ui.pause)}" data-label-play="${esc(C.ui.play)}">${icon('pause', 'i--sm')}${icon('play', 'i--sm')}</button>
  </div>
</section>

<section class="sec sec--ground" id="services">
  <div class="wrap">
    <div class="h-head" data-reveal>
      <div><h2>${esc(H.services.h2)}</h2><p class="lead">${esc(H.services.lead)}</p></div>
      <a class="link-arrow" href="${href(L, 'services')}">${esc(C.services.hero.h1)}${icon('arrow-right', 'i--sm')}</a>
    </div>
    <ul class="h-services">
      ${H.services.items.map((s) => `<li class="h-svc"><span class="h-svc__icon">${icon(s.icon)}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`).join('')}
    </ul>
  </div>
</section>

<section class="sec sec--surface" id="how-it-works" data-steps>
  <div class="wrap">
    <div class="sec-head sec-head--center" data-reveal>${head2(H.steps)}</div>
    <div class="steps-track">
      <ol class="h-steps">
        ${H.steps.items.map((s, i) => `<li class="h-step" data-step><span class="h-step__n num" aria-hidden="true">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}
      </ol>
    </div>
  </div>
</section>

<section class="sec sec--ground" id="why-us">
  <div class="wrap h-why">
    <figure class="h-why__media">${photo('v2-care', '', '(min-width: 1024px) 42vw, 100vw')}</figure>
    <div>
      <div data-reveal>${head2(H.whyUs)}<p class="lead">${esc(H.whyUs.lead)}</p></div>
      <ul class="h-why__list">
        ${H.whyUs.items.map((it) => `<li>${icon(it.icon)}<div><b>${esc(it.title)}</b><span>${esc(it.text)}</span></div></li>`).join('')}
      </ul>
    </div>
  </div>
  <div class="wrap h-quote-row">
    <figure class="h-quote">${stars}<blockquote>&ldquo;${esc(H.hero.quote.text)}&rdquo;</blockquote><figcaption>${who(H.hero.quote.name, H.hero.quote.where)}</figcaption></figure>
    ${countStats(H.whyUs.stats)}
  </div>
</section>

<section class="sec sec--surface" id="accreditations">
  <div class="wrap">
    <div class="sec-head" data-reveal>${head2(H.accreditations)}<p class="lead">${esc(H.accreditations.lead)}</p></div>
    <div class="h-accred">
      ${acc.map((c) => `<article class="h-badge">${logoImg(C, c.logo)}<h3>${esc(c.title)}</h3>${c.badge ? `<p class="seal-badge">${icon('badge-check', 'i--sm')}${esc(c.badge)}</p>` : ''}<p>${esc(c.text)}</p></article>`).join('')}
    </div>
    <ul class="checks h-checks">${H.accreditations.checks.map((t) => `<li>${icon('check', 'i--sm')}<span>${esc(t)}</span></li>`).join('')}</ul>
  </div>
</section>

<section class="sec sec--ground" id="facilities">
  <div class="wrap">
    <div class="h-head" data-reveal>
      <div><h2>${esc(H.facilities.h2)}</h2><p class="lead">${esc(H.facilities.lead)}</p></div>
      <a class="link-arrow" href="${href(L, 'facilities')}">${esc(C.facilitiesPage.listTitle)}${icon('arrow-right', 'i--sm')}</a>
    </div>
    <ul class="h-gallery">
      ${C.facilities.map((f) => `<li class="h-tile">${photo(f.img, '', '(min-width: 1024px) 33vw, 50vw')}<div class="h-tile__cap"><b>${esc(f.title)}</b><span>${esc(f.tags.join(' · '))}</span></div></li>`).join('')}
    </ul>
  </div>
</section>

<section class="sec sec--surface" id="service-areas">
  <div class="wrap">
    <div class="h-coast">
      ${film('coast-film', 'coast', 'v2-coast')}
      <div class="h-coast__card" data-reveal>${head2(H.areas)}<p class="lead">${esc(H.areas.lead)}</p></div>
      ${filmToggle('coast-film', C)}
    </div>
    <div class="ceiling h-map">${mapBlock(L, 'Hurghada')}</div>
  </div>
</section>

<section class="sec sec--ground" id="contact">
  <div class="wrap contact">
    <div>
      ${head2(H.contact)}
      <p class="lead">${esc(H.contact.lead)}</p>
      <ul class="cinfo">
        ${H.contact.items.map((c) => `<li><span class="chip-i">${icon(c.icon)}</span><div><small>${esc(c.label)}</small><b>${
          c.href ? `<a href="${c.href}">${esc(c.value)}</a>` : c.icon === 'mail' ? S.emails.map((m) => `<a href="mailto:${m}">${m}</a>`).join('') : esc(c.value)
        }</b><span>${esc(c.sub)}</span></div></li>`).join('')}
      </ul>
    </div>
    <div>
      ${waForm({ id: 'callback', title: H.contact.form.title, fieldsHtml: `<div class="fields">${H.contact.form.fields.map((f) => field(f)).join('')}</div>`, submit: H.contact.form.submit, note: H.contact.form.note, ui: C.ui })}
    </div>
  </div>
</section>`,
  });
}

function buildAbout(L) {
  const C = CONTENT[L];
  const A = C.about;
  const trail = trailFor(L, [[C.ui.home, 'home'], [C.nav[0].label, 'about']]);
  page({
    L, key: 'about', meta: A.meta, trail,
    body: `
<section class="phero">
  <div class="wrap">
    ${crumbsNav(trail)}
    <h1>${esc(A.hero.h1)}</h1>
    <p class="lead">${esc(A.hero.lead)}</p>
  </div>
</section>
<section class="sec sec--surface">
  <div class="wrap grid grid--2">
    ${[A.mission, A.vision].map((m, i) => `<article class="card placard" ${rv(i)}><h2 class="h2" style="font-size:clamp(26px,2.8vw,36px)">${esc(m.title)}</h2><p style="font-size:17px">${esc(m.text)}</p></article>`).join('')}
  </div>
</section>
<section class="sec sec--ground">
  <div class="wrap">
    <div class="why__head" data-reveal>${head2(C.home.whyUs)}<p class="lead">${esc(C.home.whyUs.lead)}</p></div>
    <ul class="why__list">${C.home.whyUs.items.map((it, i) => `<li class="why__item" ${rv(i)}><span class="chip-i">${icon(it.icon)}</span><div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div></li>`).join('')}</ul>
  </div>
</section>
<section class="sec sec--surface">
  <div class="wrap">
    <div class="sec-head" data-reveal><h2>${esc(A.values.h2)}</h2></div>
    <div class="grid grid--4">${A.values.items.map((v, i) => rowCard(v, i)).join('')}</div>
  </div>
</section>
<section class="sec sec--ground" aria-labelledby="tst-h">
  <div class="wrap">
    <div class="sec-head" data-reveal><h2 id="tst-h">${esc(A.testimonials.h2)}</h2></div>
    <div class="tcar" data-tcar>
      <ul class="tcar__track">${A.testimonials.items.map((t) => `<li class="tcard card">${stars}<blockquote>&ldquo;${esc(t.text)}&rdquo;</blockquote>${who(t.name, t.where)}</li>`).join('')}</ul>
      <div class="tcar__nav">
        <button class="icon-btn tcar__btn" type="button" data-prev aria-label="${esc(C.ui.prev)}">${icon('chevron-left')}</button>
        <button class="icon-btn tcar__btn" type="button" data-next aria-label="${esc(C.ui.next)}">${icon('chevron-right')}</button>
      </div>
    </div>
  </div>
</section>
<section class="sec sec--stone">
  <div class="wrap">
    <div class="sec-head" data-reveal><h2>${esc(A.credentials.h2)}</h2><p class="lead">${esc(A.credentials.lead)}</p></div>
    <div class="grid grid--3">${A.credentials.items.map((c, i) => `<article class="card placard" ${rv(i)}>${logoImg(C, c.logo, 'plate__logo')}<h3>${esc(c.title)} <span class="muted">${esc(c.abbr)}</span></h3>${c.badge ? `<p class="seal-badge">${icon('badge-check', 'i--sm')}${esc(c.badge)}</p>` : ''}<p>${esc(c.text)}</p>${checks(c.list)}</article>`).join('')}</div>
    <div class="panel" style="margin-top:28px" data-reveal>${countStats(A.stats)}</div>
  </div>
</section>
${ctaBand(A.cta, href(L, 'home', 'contact'), null, 'btn--gold')}`,
  });
}

function buildServices(L) {
  const C = CONTENT[L];
  const SV = C.services;
  const trail = trailFor(L, [[C.ui.home, 'home'], [C.nav[1].label, 'services']]);
  const bookIdx = [0, 2, 1, 3, 4, -1, 5, -1, -1];
  page({
    L, key: 'services', meta: SV.meta, trail,
    schema: [{ '@type': 'ItemList', name: SV.hero.h1, itemListElement: SV.items.map((s, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Service', name: s.title, description: s.text, provider: { '@id': ORG_ID }, areaServed: 'EG' } })) }],
    body: `
<section class="phero">
  <div class="wrap">
    ${crumbsNav(trail)}
    <h1>${esc(SV.hero.h1)}</h1>
    <p class="lead">${esc(SV.hero.lead)}</p>
    <div class="phero__cta">
      <a class="btn btn--gold" href="#book">${icon('calendar-check', 'i--sm')}${esc(SV.booking.eyebrow)}</a>
      <a class="btn btn--urgent" href="${S.tel}">${icon('phone', 'i--sm')}${esc(SV.cta.primary)}</a>
    </div>
  </div>
</section>
<section class="sec sec--surface">
  <div class="wrap grid grid--3">
    ${SV.items.map((s, i) => `<article class="card svc" ${rv(i)}>
      <div class="svc__top"><span class="chip-i">${icon(s.icon)}</span>${s.popular ? `<span class="tag tag--gold">${esc(SV.popular)}</span>` : ''}</div>
      <h2 style="font-family:var(--text);font-size:clamp(17px,1.5vw,19px);font-weight:700">${esc(s.title)}</h2>
      <p>${esc(s.text)}</p>
      ${checks(s.list)}
      <a class="btn btn--line btn--sm" href="#book"${bookIdx[i] >= 0 ? ` data-book="${esc(SV.booking.services[bookIdx[i]])}"` : ''}>${esc(SV.book)}</a>
    </article>`).join('')}
  </div>
</section>
<section class="sec sec--ground" data-steps>
  <div class="wrap">
    <div class="sec-head" data-reveal><h2>${esc(SV.process.h2)}</h2></div>
    <div class="steps-track">
      <div class="steps-line" aria-hidden="true"><span></span><i class="steps-now"></i></div>
      <ol class="stations">${SV.process.items.map((s, i) => `<li class="station" data-step><span class="station__dot" aria-hidden="true"><span class="num">${i + 1}</span></span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
    </div>
  </div>
</section>
<section class="sec sec--surface" id="book">
  <div class="wrap contact">
    <div data-reveal>
      <h2>${esc(SV.booking.h2)}</h2>
      <p class="lead">${esc(SV.booking.lead)}</p>
      <ul class="cinfo">
        <li><span class="chip-i">${icon('phone')}</span><div><small>${esc(C.home.contact.items[0].label)}</small><b><a href="${S.tel}">${esc(S.phone)}</a></b><span>${esc(C.home.contact.items[0].sub)}</span></div></li>
        <li><span class="chip-i">${icon('mail')}</span><div><small>${esc(C.home.contact.items[1].label)}</small><b>${S.emails.map((m) => `<a href="mailto:${m}">${m}</a>`).join('')}</b><span>${esc(C.home.contact.items[1].sub)}</span></div></li>
      </ul>
    </div>
    <div data-reveal>
      ${waForm({ ui: C.ui, 
        id: 'booking', title: SV.booking.h2, submit: SV.booking.submit, note: SV.booking.note,
        fieldsHtml: `<div class="fields fields--2">
          ${field({ id: 'bk-date', label: SV.booking.labels.date, type: 'date', required: true })}
          ${field({ id: 'bk-time', label: SV.booking.labels.time, type: 'select', required: true, options: { placeholder: SV.booking.labels.timeSelect, list: SV.booking.times } })}
          ${field({ id: 'bk-service', label: SV.booking.labels.service, type: 'select', required: true, span: true, options: { placeholder: SV.booking.labels.serviceSelect, list: SV.booking.services } })}
          ${field({ id: 'bk-name', label: SV.booking.labels.name, autocomplete: 'name', required: true, placeholder: SV.booking.placeholders.name })}
          ${field({ id: 'bk-phone', label: SV.booking.labels.phone, type: 'tel', autocomplete: 'tel', required: true, placeholder: SV.booking.placeholders.phone })}
          ${field({ id: 'bk-email', label: SV.booking.labels.email, type: 'email', autocomplete: 'email', placeholder: SV.booking.placeholders.email })}
          ${field({ id: 'bk-hotel', label: SV.booking.labels.hotel, placeholder: SV.booking.placeholders.hotel })}
          ${field({ id: 'bk-room', label: SV.booking.labels.room, placeholder: SV.booking.placeholders.room, span: true })}
          ${field({ id: 'bk-notes', label: SV.booking.labels.notes, type: 'textarea', placeholder: SV.booking.placeholders.notes, span: true })}
        </div>`,
      })}
    </div>
  </div>
</section>
<section class="sec sec--ground">
  <div class="wrap">
    <div class="sec-head" data-reveal><h2>${esc(SV.matter.h2)}</h2><p class="lead">${esc(SV.matter.lead)}</p></div>
    <div class="grid grid--3">${SV.matter.items.map((m, i) => rowCard(m, i)).join('')}</div>
  </div>
</section>
${ctaBand(SV.cta, S.tel, href(L, 'home', 'contact'))}`,
  });
}

function buildAreas(L) {
  const C = CONTENT[L];
  const SA = C.serviceAreas;
  const trail = trailFor(L, [[C.ui.home, 'home'], [C.nav[3].label, 'areas']]);
  page({
    L, key: 'areas', meta: SA.meta, trail,
    body: `
<section class="phero">
  <div class="wrap">
    ${crumbsNav(trail)}
    <h1>${esc(SA.hero.h1)}</h1>
    <p class="lead">${esc(SA.hero.lead)}</p>
  </div>
</section>
<section class="ceiling" aria-labelledby="list-h">
  <div class="wrap">
    <div class="sec-head" data-reveal style="color:var(--on-lapis)"><h2 id="list-h">${esc(SA.listTitle)}</h2><p class="lead" style="color:var(--on-lapis-2)">${esc(SA.listLead)}</p></div>
    ${mapBlock(L, 'Cairo')}
  </div>
</section>
<section class="sec sec--surface">
  <div class="wrap">
    <ul class="ptiles">${C.areas.map((a, i) => `<li class="ptile" ${rv(i)}><span class="mono" aria-hidden="true">${icon('map-pin', 'i--sm')}</span><div><b>${a.href ? `<a href="${href(L, 'hurghada')}">${esc(a.name)}</a>` : esc(a.name)}</b><span>${esc(a.region)}</span></div><span class="tag">${esc(a.hours)}</span></li>`).join('')}</ul>
  </div>
</section>
${ctaBand(SA.cta, S.tel, href(L, 'home', 'contact'))}`,
  });
}

function buildFacilities(L) {
  const C = CONTENT[L];
  const F = C.facilitiesPage;
  const trail = trailFor(L, [[C.ui.home, 'home'], [C.nav[2].label, 'facilities']]);
  page({
    L, key: 'facilities', meta: F.meta, trail,
    body: `
<section class="phero phero--split">
  <div class="wrap phero__grid">
    <div>
      ${crumbsNav(trail)}
      <h1>${esc(F.hero.h1)}</h1>
      <p class="lead">${esc(F.hero.lead)}</p>
      <div class="phero__cta">
        <a class="btn btn--gold" href="${href(L, 'home', 'contact')}">${icon('calendar-check', 'i--sm')}${esc(F.hero.primary)}</a>
        <a class="btn btn--urgent" href="${S.tel}">${icon('phone', 'i--sm')}${esc(F.hero.secondary)}</a>
      </div>
    </div>
    ${photo('elite-clinic-interior', '', '(min-width: 1024px) 50vw, 100vw', 'phero__img', true)}
  </div>
</section>
<section class="sec sec--surface">
  <div class="wrap">
    <div class="panel" data-reveal>${countStats(F.stats)}</div>
    <div class="sec-head" style="margin-top:clamp(56px,7vw,88px)" data-reveal><h2>${esc(F.listTitle)}</h2><p class="lead">${esc(F.listLead)}</p></div>
    <div class="grid grid--3">${C.facilities.map((f, i) => facilityCard(C, f, i, true, L)).join('')}</div>
  </div>
</section>
<section class="sec sec--ground">
  <div class="wrap grid grid--3">${F.assurances.map((a, i) => rowCard(a, i)).join('')}</div>
</section>
${ctaBand(F.cta, href(L, 'services', 'book'), href(L, 'home', 'contact'), 'btn--gold')}`,
  });
}

function buildPartners(L) {
  const C = CONTENT[L];
  const P = C.partnersPage;
  const trail = trailFor(L, [[C.ui.home, 'home'], [C.nav[4].label, 'partners']]);
  const tile = (h, sub) => `<li class="ptile">${h.logo ? logoImg(C, h.logo) : `<span class="mono" aria-hidden="true">${esc(initials(h.name))}</span>`}<div><b>${esc(h.name)}</b><span>${esc(sub)}</span></div></li>`;
  page({
    L, key: 'partners', meta: P.meta, trail,
    body: `
<section class="phero">
  <div class="wrap">
    ${crumbsNav(trail)}
    <h1>${esc(P.hero.h1)}</h1>
    <p class="lead">${esc(P.hero.lead)}</p>
  </div>
</section>
<section class="sec sec--surface">
  <div class="wrap">
    <div class="block" data-reveal><div class="block__head"><span class="chip-i">${icon('hotel')}</span><div><h2>${esc(P.hotels.title)}</h2><p>${esc(P.hotels.lead)}</p></div></div><ul class="ptiles">${P.hotels.items.map((h) => tile(h, h.where)).join('')}</ul></div>
    <div class="block" data-reveal><div class="block__head"><span class="chip-i">${icon('plane')}</span><div><h2>${esc(P.operators.title)}</h2><p>${esc(P.operators.lead)}</p></div></div><ul class="ptiles">${P.operators.items.map((h) => tile(h, `${h.where} · ${h.tag}`)).join('')}</ul></div>
    <div class="block" data-reveal><div class="block__head"><span class="chip-i">${icon('globe')}</span><div><h2>${esc(P.agents.title)}</h2><p>${esc(P.agents.lead)}</p></div></div><ul class="ptiles">${P.agents.items.map((h) => tile(h, h.tag)).join('')}</ul></div>
  </div>
</section>
<section class="sec sec--ground">
  <div class="wrap">
    <div class="block__head" data-reveal><span class="chip-i">${icon('shield-check')}</span><div><h2>${esc(P.insurers.title)}</h2><p>${esc(P.insurers.lead)}</p></div></div>
    <div class="grid grid--4">${P.insurers.items.map((h, i) => `<article class="card" ${rv(i)}>${h.logo ? logoImg(C, h.logo, 'plate__logo') : `<span class="mono" aria-hidden="true" style="width:64px;height:64px">${esc(initials(h.name))}</span>`}<h3>${esc(h.name)}</h3><span class="tag tag--gold" style="align-self:flex-start">${esc(P.insurers.tag)}</span><p>${esc(h.text)}</p><p class="muted" style="font-size:14.5px;display:flex;gap:8px">${icon('check', 'i--sm')}${esc(h.benefit)}</p></article>`).join('')}</div>
  </div>
</section>
<section class="sec sec--stone">
  <div class="wrap">
    <div class="block__head" data-reveal><span class="chip-i">${icon('award')}</span><div><h2>${esc(P.bodies.title)}</h2><p>${esc(P.bodies.lead)}</p></div></div>
    <div class="grid grid--3">${P.bodies.items.map((b, i) => `<article class="card placard" ${rv(i)}>${logoImg(C, b.logo, 'plate__logo')}<h3>${esc(b.title)} <span class="muted">${esc(b.abbr)}</span></h3>${b.badge ? `<p class="seal-badge">${icon('badge-check', 'i--sm')}${esc(b.badge)}</p>` : ''}<p>${esc(b.text)}</p>${checks(b.list)}<a class="link-arrow" href="https://${b.site}" target="_blank" rel="noopener">${esc(b.site)}${icon('arrow-right', 'i--sm')}</a></article>`).join('')}</div>
  </div>
</section>
${ctaBand(P.cta, href(L, 'home', 'contact'), null, 'btn--gold')}`,
  });
}

function buildVideo(L) {
  const C = CONTENT[L];
  const V = C.video;
  const trail = trailFor(L, [[C.ui.home, 'home'], [C.nav[5].label, 'video']]);
  page({
    L, key: 'video', meta: V.meta, trail,
    body: `
<section class="phero phero--center">
  <div class="wrap">
    ${crumbsNav(trail)}
    <span class="chip-i vhero__icon" style="width:64px;height:64px">${icon('video', 'i--lg')}</span>
    <h1>${esc(V.h1)}</h1>
    <p class="lead">${esc(V.lead)}</p>
  </div>
</section>
<section class="sec sec--surface">
  <div class="wrap">
    <div class="grid grid--3">${V.items.map((it, i) => rowCard(it, i)).join('')}</div>
    <div class="vjoin" data-reveal>
      <a class="btn btn--gold" href="${S.login}">${icon('video', 'i--sm')}${esc(V.button)}</a>
      <p class="muted">${esc(V.note)}</p>
    </div>
  </div>
</section>`,
  });
}

function buildHurghada(L) {
  const C = CONTENT[L];
  const HG = hurghadaFor(L);
  const trail = trailFor(L, [[C.ui.home, 'home'], [C.nav[3].label, 'areas'], ['Hurghada', 'hurghada']]);
  const description = HG.meta.description || HG.lead.split(/(?<=[.?!])\s/).slice(0, 2).join(' ');
  page({
    L, key: 'hurghada', meta: { title: HG.meta.title, description }, trail,
    schema: [{
      '@type': 'MedicalBusiness', '@id': ORIGIN + ROUTES[L].hurghada + '#local', name: `${S.name} · Hurghada`, parentOrganization: { '@id': ORG_ID },
      url: ORIGIN + ROUTES[L].hurghada, telephone: '+201206788566', openingHours: 'Mo-Su 00:00-23:59',
      address: { '@type': 'PostalAddress', addressLocality: 'Hurghada', addressRegion: 'Red Sea', addressCountry: 'EG' },
      areaServed: HG.areas.map((a) => ({ '@type': 'Place', name: a })), availableLanguage: ['English', 'German', 'Russian', 'Arabic'], inLanguage: L,
    }],
    body: `
<section class="phero">
  <div class="wrap">
    ${crumbsNav(trail)}
    <h1>${esc(HG.h1a)} <span class="accent">${esc(HG.h1b)}</span></h1>
    <p class="lead">${esc(HG.lead)}</p>
    <div class="phero__cta">
      <a class="btn btn--urgent" href="${S.tel}">${icon('phone', 'i--sm')}${esc(HG.call)}<span class="num">${esc(S.phone)}</span></a>
      <a class="btn btn--wa" href="${S.wa}" target="_blank" rel="noopener">${icon('whatsapp', 'i--sm')}${esc(HG.wa)}</a>
    </div>
  </div>
</section>
<section class="sec sec--surface">
  <div class="wrap">
    <div class="sec-head" data-reveal><h2>${esc(HG.treatTitle)}</h2></div>
    <div class="grid grid--4">${HG.treat.map((t, i) => `<article class="card card--row" ${rv(i)}><span class="chip-i">${icon(t.icon)}</span><h3>${t.href ? `<a href="${href(L, 'video')}">${esc(t.title)}</a>` : esc(t.title)}</h3><p>${esc(t.text)}</p></article>`).join('')}</div>
  </div>
</section>
<section class="sec sec--ground">
  <div class="wrap grid grid--2">
    <article class="card placard" data-reveal><span class="chip-i">${icon('hotel')}</span><h2 class="h2" style="font-size:clamp(24px,2.6vw,32px)">${esc(HG.hotelsTitle)}</h2><p>${esc(HG.hotelsLead)}</p><ul class="chips">${HG.hotels.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></article>
    <article class="card placard" data-reveal><span class="chip-i">${icon('map-pin')}</span><h2 class="h2" style="font-size:clamp(24px,2.6vw,32px)">${esc(HG.areasTitle)}</h2><p>${esc(HG.areasLead)}</p><ul class="chips">${HG.areas.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></article>
  </div>
</section>
<section class="cta">
  <div class="wrap cta__in" data-reveal>
    <div><h2>${esc(HG.ctaTitle)}</h2><p>${esc(HG.ctaText)}</p></div>
    <div class="cta__btns">
      <a class="btn btn--urgent" href="${S.tel}">${icon('phone', 'i--sm')}<span class="num">${esc(S.phone)}</span></a>
      <a class="btn btn--wa" href="${S.wa}" target="_blank" rel="noopener">${icon('whatsapp', 'i--sm')}WhatsApp</a>
    </div>
  </div>
</section>`,
  });
}

for (const L of LANGS) {
  buildHome(L); buildAbout(L); buildServices(L); buildAreas(L);
  buildFacilities(L); buildPartners(L); buildVideo(L); buildHurghada(L);
}

/* ---------------------------------------------------------------- files for crawlers */

const urlOf = (L, k) => ORIGIN + (ROUTES[L][k] === '/' ? '/' : ROUTES[L][k]);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.flatMap((L) => PAGE_KEYS.map((k) => `  <url>\n    <loc>${urlOf(L, k)}</loc>\n${LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlOf(l, k)}"/>`).join('\n')}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${urlOf('en', k)}"/>\n  </url>`)).join('\n')}
</urlset>
`);
const bots = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Claude-User', 'Google-Extended', 'Applebot-Extended'];
fs.writeFileSync(path.join(OUT, 'robots.txt'), PROD
  ? `${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n')}\nUser-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /portal\nDisallow: /auth\n\nSitemap: ${ORIGIN}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(OUT, 'llms.txt'), `# ${S.name}

> ${EN.site.tagline}

Phone (24/7): ${S.phone}
WhatsApp: ${S.wa}
Email: ${S.emails.join(', ')}
Languages: English, Deutsch, Polski

## Pages

${LANGS.map((L) => {
  const C = CONTENT[L];
  const m = { home: C.home.meta, about: C.about.meta, services: C.services.meta, areas: C.serviceAreas.meta, facilities: C.facilitiesPage.meta, partners: C.partnersPage.meta, video: C.video.meta, hurghada: hurghadaFor(L).meta };
  return `### ${L.toUpperCase()}\n\n` + PAGE_KEYS.map((k) => `- [${m[k].title}](${urlOf(L, k)})${m[k].description ? ': ' + m[k].description : ''}`).join('\n');
}).join('\n\n')}

## Service areas

${EN.areas.map((a) => `- ${a.name} (${a.region}): ${a.hours}`).join('\n')}
`);
fs.writeFileSync(path.join(OUT, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1B2E6E"/><rect x="19" y="5" width="26" height="43" rx="13" fill="none" stroke="#D9B65A" stroke-width="3"/><path d="${STAR}" transform="translate(32 16) scale(.42)" fill="#F1D58A"/><text x="32" y="38" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="17" fill="#F1D58A">E</text><path d="M32 48v6M22 55h20" stroke="#D9B65A" stroke-width="3" stroke-linecap="round"/></svg>`);

/* ---------------------------------------------------------------- guard rails */

let bad = 0;
for (const r of results) {
  const html = fs.readFileSync(path.join(OUT, r.file), 'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '');
  if (/[\u2013\u2014]/.test(html)) { console.error(`  ${r.file}: contains an em or en dash`); bad++; }
  if (/undefined|NaN|\[object Object\]/.test(text)) { console.error(`  ${r.file}: leaked undefined/NaN`); bad++; }
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) { console.error(`  ${r.file}: expected exactly one h1`); bad++; }
}
console.log(`\n  medcierge design 2 ${PROD ? 'production' : 'preview'} build: ${results.length} pages into src/medcierge-v2`);
if (bad) { console.error(`\n  ${bad} problem(s)`); process.exit(1); }
console.log('');
