#!/usr/bin/env node
/* Elite Medical Concierge: generates the rebuilt medcierge.com as static HTML.

     node scripts/build-medcierge.js               preview, served at /medcierge on HCIG Work, noindex
     node scripts/build-medcierge.js --production  their hosting: root paths, indexable, robots + sitemap

   Writes into src/medcierge/. build.js copies that folder into dist/medcierge
   verbatim. Words come from scripts/medcierge/content.js and nowhere else. */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const C = require('./medcierge/content.js');

const PROD = process.argv.includes('--production');
const BASE = PROD ? '' : '/medcierge';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'medcierge');
const ICONS = path.join(__dirname, 'medcierge', 'icons');
const ORIGIN = C.site.origin;
const SHARE_ORIGIN = PROD ? ORIGIN : 'https://hcig-passport.vercel.app' + BASE;
const S = C.site;

/* ---------------------------------------------------------------- helpers */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function u(p) {
  if (/^(https?:|tel:|mailto:|#)/.test(p)) return p;
  if (p === '/') return BASE || '/';
  if (p.startsWith('/#')) return (BASE || '') + (BASE ? p.slice(1) : p);
  return BASE + p;
}

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
    filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"'
  } aria-hidden="true" focusable="false">${iconCache[name]}</svg>`;
}

function photo(name, alt, sizes, cls = '', eager = false) {
  return `<img class="${cls}" src="${u(`/img/${name}.webp`)}" srcset="${u(`/img/${name}-800.webp`)} 800w, ${u(`/img/${name}.webp`)} 1600w" sizes="${sizes}" width="1600" height="900" alt="${esc(alt)}"${
    eager ? ' fetchpriority="high"' : ' loading="lazy"'
  } decoding="async">`;
}

const logoImg = (key, cls = '') =>
  `<img class="${cls}" src="${u(`/img/logos/${key}.png`)}" width="128" height="128" alt="${esc(C.logos[key])}" loading="lazy" decoding="async">`;

const initials = (name) => name.replace(/^The /, '').split(/[\s-]+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const rv = (i = 0) => `data-reveal style="--d:${Math.min(i, 8) * 50}ms"`;

function head2(o) {
  if (o.h2) return `<h2${o.id ? ` id="${o.id}"` : ''}>${esc(o.h2)}</h2>`;
  return `<h2${o.id ? ` id="${o.id}"` : ''}>${esc(o.h2a)} <span class="accent">${esc(o.h2b)}</span></h2>`;
}
function secHead(o, center = false) {
  return `<div class="sec-head${center ? ' sec-head--center' : ''}" data-reveal>
      ${o.eyebrow ? `<p class="eyebrow">${esc(o.eyebrow)}</p>` : ''}
      ${head2(o)}
      ${o.lead ? `<p class="lead">${esc(o.lead)}</p>` : ''}
    </div>`;
}
const checks = (list, cls = '') =>
  `<ul class="checks ${cls}">${list.map((t) => `<li>${icon('check', 'i--sm')}<span>${esc(t)}</span></li>`).join('')}</ul>`;

function who(name, where) {
  const ini = name.split(' ').map((w) => w[0]).join('').replace(/\./g, '');
  return `<div class="who"><span class="who__av" aria-hidden="true">${esc(ini)}</span><div><b>${esc(name)}</b><span>${esc(where)}</span></div></div>`;
}
const stars = `<div class="stars" role="img" aria-label="5/5">${icon('star').repeat(5)}</div>`;

/* ---------------------------------------------------------------- schema */

const ORG_ID = ORIGIN + '/#organization';
const org = {
  '@type': 'MedicalBusiness',
  '@id': ORG_ID,
  name: S.name,
  url: ORIGIN + '/',
  image: ORIGIN + '/img/og-share.jpg',
  logo: ORIGIN + '/favicon.svg',
  description: C.home.meta.description,
  telephone: '+201206788566',
  email: S.emails[0],
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00', closes: '23:59',
  }],
  areaServed: C.areas.map((a) => ({ '@type': 'City', name: a.name, containedInPlace: { '@type': 'Country', name: 'Egypt' } })),
  contactPoint: [
    { '@type': 'ContactPoint', telephone: '+201206788566', contactType: 'emergency', areaServed: 'EG', hoursAvailable: 'Mo-Su 00:00-23:59' },
    { '@type': 'ContactPoint', email: S.emails[1], contactType: 'customer service' },
  ],
};

function crumbsLd(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: ORIGIN + (c.path === '/' ? '/' : c.path) })),
  };
}

/* ---------------------------------------------------------------- shell */

const cssV = crypto.createHash('md5').update(fs.readFileSync(path.join(OUT, 'assets', 'site.css'))).digest('hex').slice(0, 8);
const jsV = crypto.createHash('md5').update(fs.readFileSync(path.join(OUT, 'assets', 'site.js'))).digest('hex').slice(0, 8);

function header(active) {
  const links = C.nav.map((n) => {
    const cur = n.href === active ? ' aria-current="page"' : '';
    return `<li><a href="${u(n.href)}"${cur}>${esc(n.label)}</a></li>`;
  }).join('');
  const mlinks = C.nav.map((n) => {
    const cur = n.href === active ? ' aria-current="page"' : '';
    return `<li><a href="${u(n.href)}"${cur}>${esc(n.label)}${icon('arrow-right', 'i--sm')}</a></li>`;
  }).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="hdr" data-hdr>
  <div class="wrap hdr__in">
    <a class="brand" href="${u('/')}">
      <span class="brand__mark" aria-hidden="true">E</span>
      <span class="brand__txt"><span class="brand__name">Elite Medical</span><span class="brand__sub">Concierge</span></span>
    </a>
    <nav class="nav" aria-label="Main"><ul>${links}</ul></nav>
    <div class="hdr__act">
      <a class="btn btn--urgent btn--sm" href="${S.tel}"><span class="pulse" aria-hidden="true"></span>${esc(C.footer.emergencyLine)}</a>
      <button class="hdr__menu" type="button" data-menu-btn aria-expanded="false" aria-controls="menu" aria-label="Menu">${icon('menu')}</button>
    </div>
  </div>
    </div>
  </div>
</header>
<div class="menu" id="menu" hidden>
  <nav aria-label="Menu"><ul>${mlinks}</ul></nav>
  <div class="menu__foot">
    <a class="btn btn--urgent" href="${S.tel}">${icon('phone', 'i--sm')}${esc(S.phone)}</a>
    <a class="btn btn--ghost" href="${S.portal}">${esc(C.footer.dashboard)}</a>
  </div>
</div>`;
}

function footer() {
  const areas = C.areas.map((a) => (a.href ? `<li><a href="${u(a.href)}">${esc(a.name)}</a></li>` : `<li><span>${esc(a.name)}</span></li>`)).join('');
  return `<footer class="ftr">
  <div class="wrap ftr__grid">
    <div>
      <a class="brand" href="${u('/')}">
        <span class="brand__mark" aria-hidden="true">E</span>
        <span class="brand__txt"><span class="brand__name">Elite Medical</span><span class="brand__sub">Concierge</span></span>
      </a>
      <p>${esc(S.tagline)}</p>
      <div class="ftr__contact">
        <a href="${S.tel}">${icon('phone', 'i--sm')}${esc(S.phone)}</a>
        ${S.emails.map((m) => `<a href="mailto:${m}">${icon('mail', 'i--sm')}${m}</a>`).join('')}
      </div>
    </div>
    <nav aria-label="${esc(C.footer.quickLinks)}">
      <h2>${esc(C.footer.quickLinks)}</h2>
      <ul>${C.footer.links.map((l) => `<li><a href="${u(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul>
    </nav>
    <div>
      <h2>${esc(C.footer.areasTitle)}</h2>
      <ul class="ftr__areas">${areas}</ul>
    </div>
  </div>
  <div class="ftr__bar"><div class="wrap"><span>${esc(C.footer.rights)}</span><a href="${S.portal}">${esc(C.footer.dashboard)}</a></div></div>
</footer>
<a class="wa-float" href="${S.wa}" target="_blank" rel="noopener">${icon('whatsapp')}${esc(C.footer.whatsapp)}</a>`;
}

function page({ file, pathname, lang = 'en', meta, body, trail, schema = [], alternates, active }) {
  const canonical = ORIGIN + (pathname === '/' ? '/' : pathname);
  const graph = [org];
  if (pathname === '/') graph.push({ '@type': 'WebSite', '@id': ORIGIN + '/#website', url: ORIGIN + '/', name: S.name, publisher: { '@id': ORG_ID } });
  graph.push({ '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: meta.title, description: meta.description, inLanguage: lang, isPartOf: { '@id': ORIGIN + '/#website' }, about: { '@id': ORG_ID } });
  if (trail) graph.push(crumbsLd(trail));
  graph.push(...schema);
  const alt = alternates
    ? alternates.map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${ORIGIN + a.path}">`).join('\n  ')
    : '';
  const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion')</script>
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}">
  <meta name="robots" content="${PROD ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}">
  <link rel="canonical" href="${canonical}">
  ${alt}
  <meta name="theme-color" content="#FAF7F0">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(S.name)}">
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SHARE_ORIGIN}/img/og-share.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${lang === 'de' ? 'de_DE' : 'en_GB'}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap">
  <link rel="stylesheet" href="${u('/assets/site.css')}?v=${cssV}">
  ${ld({ '@context': 'https://schema.org', '@graph': graph })}
</head>
<body>
${header(active)}
<main id="main">
${body}
</main>
${footer()}
<script src="${u('/assets/site.js')}?v=${jsV}" defer></script>
</body>
</html>
`;
  const dest = path.join(OUT, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
  return { file, bytes: Buffer.byteLength(html) };
}

function crumbsNav(trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail
    .map((c, i) => (i === trail.length - 1 ? `<li><span aria-current="page">${esc(c.name)}</span></li>` : `<li><a href="${u(c.path)}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/* ---------------------------------------------------------------- shared blocks */

/* The coast route: one gold line through every town, drawn as the visitor
   scrolls, each town lighting up when the line reaches it. The order follows
   the map, north coast to Cairo, across Sinai, down the Red Sea, up the Nile. */
const ROUTE = ['Marsa Matrouh', 'Alamein', 'Alexandria', 'Cairo', 'Dahab', 'Sharm El Sheikh', 'El Gouna', 'Hurghada', 'Port Ghalib', 'Marsa Alam', 'Aswan', 'Luxor'];
function routeGeometry() {
  const pts = ROUTE.map((n) => C.areas.find((a) => a.name === n));
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6];
    const c2 = [p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2.x},${p2.y}`;
  }
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  const at = { [pts[0].name]: 0 };
  let acc = 0;
  seg.forEach((s, i) => { acc += s; at[pts[i + 1].name] = +(acc / total).toFixed(3); });
  return { d, at };
}

function mapBlock(start) {
  const d = fs.readFileSync(path.join(__dirname, 'medcierge', 'egypt-path.txt'), 'utf8').trim();
  const route = routeGeometry();
  const data = C.areas.map((a) => ({ name: a.name, region: a.region, hours: a.hours, href: a.href ? u(a.href) : null }));
  const pts = C.areas.map((a) => `<g class="map__pt" data-pt="${esc(a.name)}" data-x="${a.x}" data-y="${a.y}" data-at="${route.at[a.name]}"><circle cx="${a.x}" cy="${a.y}" r="16"></circle><circle cx="${a.x}" cy="${a.y}" r="6"></circle></g>`).join('');
  const btns = C.areas.map((a) => `<li><button class="area-btn" type="button" data-area="${esc(a.name)}" aria-pressed="false"><b>${esc(a.name)}</b><span>${esc(a.region)}</span></button></li>`).join('');
  const first = C.areas.find((a) => a.name === start) || C.areas[0];
  return `<div class="areas" data-areas="${esc(JSON.stringify(data))}" data-start="${esc(first.name)}">
      <div class="map">
        <svg viewBox="0 0 525 478" role="img" aria-label="Egypt">
          <path class="map__land" d="${d}"></path>
          <text class="map__sea" x="150" y="10">Mediterranean Sea</text>
          <text class="map__sea" x="455" y="300" text-anchor="middle">Red Sea</text>
          <path class="map__route-bg" d="${route.d}"></path>
          <path class="map__route" d="${route.d}" pathLength="1" data-route></path>
          ${pts}
          <text class="map__label" data-map-label x="0" y="0"></text>
        </svg>
      </div>
      <div>
        <ul class="area-list">${btns}</ul>
        <div class="area-card" data-area-card aria-live="polite">
          <h3 data-f="name">${esc(first.name)}</h3>
          <dl>
            <dt>${icon('map-pin', 'i--sm')}</dt><dd data-f="region">${esc(first.region)}</dd>
            <dt>${icon('clock', 'i--sm')}</dt><dd data-f="hours">${esc(first.hours)}</dd>
            <dt>${icon('phone', 'i--sm')}</dt><dd><a href="${S.tel}">${esc(S.phone)}</a></dd>
          </dl>
          <div class="area-card__cta">
            <a class="btn btn--urgent btn--sm" href="${S.tel}">${icon('phone', 'i--sm')}${esc(C.serviceAreas.cta.primary)}</a>
            <a class="btn btn--ghost btn--sm" data-f="more" href="${u('/hurghada')}" hidden>${esc(C.hurghada.en.h1a)}</a>
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
      ${o.secondary ? `<a class="btn btn--ghost" href="${secondaryHref}">${esc(o.secondary)}</a>` : ''}
    </div>
  </div>
</section>`;
}

function statsRow(list) {
  return `<div class="stats">${list.map((s) => `<div class="stat"><b class="num">${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>`;
}

function whyUs(id = 'why-us', ground = 'sec--white') {
  const W = C.home.whyUs;
  return `<section class="sec ${ground}" id="${id}">
  <div class="wrap">
    ${secHead(W, true)}
    <div class="grid grid--3">
      ${W.items.map((it, i) => `<article class="card card--mrow" ${rv(i)}><span class="chip-i">${icon(it.icon)}</span><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></article>`).join('')}
    </div>
    <div class="panel" style="margin-top:28px" data-reveal>${statsRow(W.stats)}</div>
  </div>
</section>`;
}

function facilityCard(f, i, detailed) {
  return `<article class="card fac" ${rv(i)}>
        <div class="fac__img">${photo(f.img, f.title, '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw')}<div class="tags">${f.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>
        <div class="fac__body">
          <h3>${esc(f.title)}</h3>
          <p>${esc(f.text)}</p>
          ${detailed ? checks(f.list) : ''}
          ${detailed ? `<a class="btn btn--ghost btn--sm" href="${u('/services')}#book">${esc(C.facilitiesPage.book)}</a>` : ''}
        </div>
      </article>`;
}

function waForm({ id, title, fieldsHtml, submit, note, cls = '' }) {
  return `<form class="form ${cls}" id="${id}" data-wa="${S.wa}" data-title="${esc(title)}" novalidate>
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
  const req = required ? ' required aria-required="true"' : '';
  const ph = placeholder ? ` placeholder="${esc(placeholder)}"` : '';
  const ac = autocomplete ? ` autocomplete="${autocomplete}"` : '';
  let control;
  if (type === 'textarea') control = `<textarea id="${id}" name="${id}"${ph}${req}></textarea>`;
  else if (type === 'select') control = `<select id="${id}" name="${id}"${req}><option value="">${esc(options.placeholder)}</option>${options.list.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  else control = `<input id="${id}" name="${id}" type="${type}"${ac}${ph}${req}>`;
  return `<div class="field${span ? ' span-2' : ''}"><label for="${id}">${esc(label)}${required ? ' <em aria-hidden="true">*</em>' : ''}</label>${control}</div>`;
}

/* ---------------------------------------------------------------- pages */

const results = [];
const H = C.home;

/* home */
const countable = (v) => /^[\d,]+[+%]?$/.test(v);
function countStats(list) {
  return `<div class="stats">${list.map((s) => {
    const c = countable(s.value) ? ` data-count="${s.value.replace(/[+%]/g, '')}" data-suffix="${s.value.replace(/[\d,]/g, '')}"` : '';
    return `<div class="stat"><b class="num"${c}>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`;
  }).join('')}</div>`;
}

/* A marquee loops by moving its track -50%, so each half must be wider than the
   widest screen. Short lists are repeated; only the first pass carries alt text. */
function marqueeRow(keys, label, reverse, dur) {
  let set = [...keys];
  while (set.length * 116 < 2100) set = set.concat(keys);
  const items = (copy) => set.map((k, i) => {
    let img = logoImg(k).replace(' loading="lazy"', '');
    if (copy || i >= keys.length) img = img.replace(/alt="[^"]*"/, 'alt=""');
    return `<li class="logo">${img}</li>`;
  }).join('');
  return `<div class="marquee${reverse ? ' marquee--rev' : ''}" style="--dur:${dur}s" role="group" aria-label="${esc(label)}">
      <div class="marquee__track">
        <ul class="marquee__set">${items(false)}</ul>
        <ul class="marquee__set" aria-hidden="true">${items(true)}</ul>
      </div>
    </div>`;
}

const heroPlane = (name, cls, depth) =>
  `<figure class="h3d__plane ${cls}" data-depth="${depth}" aria-hidden="true">${photo(name, '', '(min-width: 1024px) 24vw, 50vw', '', true)}</figure>`;

const G = H.trust.groups;
results.push(page({
  file: 'index.html', pathname: '/', meta: H.meta, active: '/',
  body: `
<section class="hero hero--3d" aria-labelledby="hero-h">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="badge" data-rise style="--i:0"><span class="dot">${icon('award', 'i--sm')}</span>${esc(H.hero.badge)}</p>
      <h1 id="hero-h"><span class="line"><span data-rise style="--i:1">${esc(H.hero.h1a)}</span></span><span class="line accent"><span data-rise style="--i:2">${esc(H.hero.h1b)}</span></span></h1>
      <p class="lead hero__lead" data-rise style="--i:3">${esc(H.hero.lead)} <strong>${esc(H.hero.leadAccent)}</strong></p>
      <div class="hero__cta" data-rise style="--i:4">
        <a class="btn btn--gold" href="#contact">${icon('stethoscope', 'i--sm')}${esc(H.hero.primary)}</a>
        <a class="btn btn--ghost" href="#services">${esc(H.hero.secondary)}${icon('arrow-right', 'i--sm')}</a>
      </div>
    </div>
    <div class="h3d" data-h3d>
      <div class="h3d__stage" data-h3d-stage>
        ${heroPlane('urgent-care-room', 'h3d__plane--a', 1)}
        ${heroPlane('ground-ambulance', 'h3d__plane--b', 0.65)}
        <figure class="h3d__plane h3d__plane--main" data-depth="0.25">${photo('hero-bg', S.name, '(min-width: 1024px) 44vw, 100vw', '', true)}</figure>
        <div class="h3d__chip" data-depth="-0.45"><span class="chip-i">${icon('clock', 'i--sm')}</span><div><b>${esc(H.hero.features[0].title)}</b><span>${esc(H.hero.features[0].text)}</span></div></div>
        <figure class="quote-card h3d__quote" data-depth="-0.85">
          ${stars}
          <blockquote>&ldquo;${esc(H.hero.quote.text)}&rdquo;</blockquote>
          <figcaption>${who(H.hero.quote.name, H.hero.quote.where)}</figcaption>
        </figure>
      </div>
    </div>
  </div>
</section>

<section class="facts" aria-label="${esc(H.hero.stats.map((s) => s.label).join(', '))}">
  <div class="wrap">
    ${countStats(H.hero.stats)}
    <ul class="features">
      ${H.hero.features.map((f, i) => `<li class="feature" ${rv(i)}><span class="chip-i">${icon(f.icon, 'i--sm')}</span><div><b>${esc(f.title)}</b><span>${esc(f.text)}</span></div></li>`).join('')}
    </ul>
  </div>
</section>

<section class="sec sec--white trust" aria-labelledby="trust-h" data-trust>
  <div class="wrap">
    <div class="sec-head sec-head--center" data-reveal>
      <p class="eyebrow">${esc(H.trust.eyebrow)}</p>
      <h2 id="trust-h">${esc(H.trust.h2)}</h2>
    </div>
  </div>
  <div class="marquees">
    <p class="wrap marquee__label">${esc(G[0].label)} · ${esc(G[1].label)}</p>
    ${marqueeRow([...G[0].logos, ...G[1].logos], `${G[0].label}, ${G[1].label}`, false, 70)}
    ${marqueeRow(G[2].logos, G[2].label, true, 52)}
    <p class="wrap marquee__label">${esc(G[2].label)}</p>
  </div>
  <div class="wrap trust__foot">
    <p class="trust__note">${esc(H.trust.note)}</p>
    <button class="marquee-toggle" type="button" data-marquee-toggle aria-pressed="false" aria-label="Pause">${icon('pause', 'i--sm')}${icon('play', 'i--sm')}</button>
  </div>
</section>

<section class="sec sec--cream" id="services">
  <div class="wrap svc-split">
    <div class="svc-split__head" data-reveal>
      <p class="eyebrow">${esc(H.services.eyebrow)}</p>
      <h2>${esc(H.services.h2)}</h2>
      <p class="lead">${esc(H.services.lead)}</p>
      <figure class="svc-split__img">${photo('portable-diagnostics', C.facilities[3].title, '(min-width: 1024px) 34vw, 100vw')}</figure>
      <a class="link-arrow" href="${u('/services')}">${esc(C.services.hero.h1)}${icon('arrow-right', 'i--sm')}</a>
    </div>
    <ol class="svc-list">
      ${H.services.items.map((s, i) => `<li class="svc-item" ${rv(i)}><span class="chip-i">${icon(s.icon)}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`).join('')}
    </ol>
  </div>
</section>

<section class="pan" id="facilities" aria-labelledby="fac-h" data-pan>
  <div class="pan__sticky">
    <div class="pan__rail" data-pan-rail>
      <div class="pan__intro">
        <h2 id="fac-h">${esc(H.facilities.h2)}</h2>
        <p class="lead">${esc(H.facilities.lead)}</p>
        <a class="link-arrow" href="${u('/facilities')}">${esc(C.facilitiesPage.listTitle)}${icon('arrow-right', 'i--sm')}</a>
      </div>
      ${C.facilities.map((f, i) => facilityCard(f, i, false).replace('class="card fac"', 'class="card fac pan__card"').replace(/ data-reveal style="[^"]*"/, '')).join('')}
      <ul class="pan__outro">
        ${H.facilities.features.map((f) => `<li class="feature"><span class="chip-i">${icon(f.icon, 'i--sm')}</span><div><b>${esc(f.title)}</b><span>${esc(f.text)}</span></div></li>`).join('')}
      </ul>
    </div>
  </div>
</section>

<section class="sec sec--cream" id="why-us">
  <div class="wrap why">
    <figure class="why__media" data-reveal>${photo('elite-medical-team', C.facilities[2].title, '(min-width: 1024px) 40vw, 100vw')}</figure>
    <div class="why__body">
      <div data-reveal>${head2(H.whyUs)}<p class="lead" style="margin-top:16px">${esc(H.whyUs.lead)}</p></div>
      <ul class="why__list">
        ${H.whyUs.items.map((it, i) => `<li class="why__item" ${rv(i)}><span class="chip-i">${icon(it.icon)}</span><div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div></li>`).join('')}
      </ul>
    </div>
  </div>
  <div class="wrap"><div class="panel why__stats" data-reveal>${countStats(H.whyUs.stats)}</div></div>
</section>

<section class="sec sec--white" id="how-it-works" data-steps>
  <div class="wrap">
    <div class="sec-head" data-reveal>${head2(H.steps)}</div>
    <div class="steps-track">
      <div class="steps-line" aria-hidden="true"><span></span></div>
      <ol class="steps">
        ${H.steps.items.map((s, i) => `<li class="step" data-step><div class="step__n"><span class="num">0${i + 1}</span><span class="chip-i">${icon(s.icon)}</span></div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}
      </ol>
    </div>
  </div>
</section>

<section class="sec sec--sand" id="accreditations">
  <div class="wrap">
    <div class="split">
      <div data-reveal>
        <p class="eyebrow">${esc(H.accreditations.eyebrow)}</p>
        ${head2(H.accreditations)}
        <p class="lead" style="margin-top:16px">${esc(H.accreditations.lead)}</p>
        <div style="margin-top:26px">${checks(H.accreditations.checks)}</div>
      </div>
      <div class="grid">
        ${H.accreditations.cards.map((c, i) => `<article class="card acc" ${rv(i)}>${logoImg(c.logo, 'acc__logo')}<div><h3>${esc(c.title)}${c.badge ? ` <span class="tag tag--gold">${esc(c.badge)}</span>` : ''}</h3><p style="margin-top:6px">${esc(c.text)}</p></div></article>`).join('')}
      </div>
    </div>
    <p class="pullquote" data-reveal>${esc(H.accreditations.quote)}</p>
  </div>
</section>

<section class="sec sec--white" id="partners">
  <div class="wrap">
    ${secHead({ ...H.partners, eyebrow: null }, true)}
    <div class="block">
      <div class="block__head"><span class="chip-i">${icon('hotel')}</span><h3>${esc(H.partners.hotelsTitle)}</h3></div>
      <ul class="ptiles">
        ${H.partners.hotels.map((h) => `<li class="ptile">${h.logo ? logoImg(h.logo) : `<span class="mono" aria-hidden="true">${esc(initials(h.name))}</span>`}<div><b>${esc(h.name)}</b><span>${esc(H.partners.hotelsSuffix)}</span></div></li>`).join('')}
      </ul>
    </div>
    <div class="block">
      <div class="block__head"><span class="chip-i">${icon('shield-check')}</span><h3>${esc(H.partners.insuranceTitle)}</h3></div>
      <ul class="ptiles">
        ${H.partners.insurers.map((h) => `<li class="ptile">${logoImg(h.logo)}<div><b>${esc(h.name)}</b><span>${esc(H.partners.insuranceSuffix)}</span></div></li>`).join('')}
      </ul>
    </div>
    <div class="center-note">
      <p>${esc(H.partners.note)}</p>
      <span class="tag tag--gold">${esc(H.partners.pill)}</span>
    </div>
  </div>
</section>

<section class="sec sec--cream" id="service-areas">
  <div class="wrap">
    <div class="sec-head" data-reveal>${head2(H.areas)}<p class="lead">${esc(H.areas.lead)}</p></div>
  </div>
  <div class="route-pin" data-route-pin>
    <div class="route-sticky"><div class="wrap">${mapBlock('Hurghada')}</div></div>
  </div>
</section>

<section class="sec sec--white" id="contact">
  <div class="wrap contact">
    <div data-reveal>
      <p class="eyebrow">${esc(H.contact.eyebrow)}</p>
      ${head2(H.contact)}
      <p class="lead" style="margin-top:16px">${esc(H.contact.lead)}</p>
      <ul class="cinfo">
        ${H.contact.items.map((c) => `<li><span class="chip-i">${icon(c.icon)}</span><div><small>${esc(c.label)}</small><b>${
          c.href ? `<a href="${c.href}">${esc(c.value)}</a>` : c.icon === 'mail' ? S.emails.map((m) => `<a href="mailto:${m}">${m}</a>`).join('') : esc(c.value)
        }</b><span>${esc(c.sub)}</span></div></li>`).join('')}
      </ul>
    </div>
    <div data-reveal>
      ${waForm({
        id: 'callback', title: H.contact.form.title,
        fieldsHtml: `<div class="fields">${H.contact.form.fields.map((f) => field(f)).join('')}</div>`,
        submit: H.contact.form.submit, note: H.contact.form.note,
      })}
    </div>
  </div>
</section>`,
}));

/* about */
const A = C.about;
results.push(page({
  file: 'about.html', pathname: '/about', meta: A.meta, active: '/about',
  trail: [{ name: 'Home', path: '/' }, { name: 'About Us', path: '/about' }],
  body: `
<section class="phero">
  <div class="wrap">
    ${crumbsNav([{ name: 'Home', path: '/' }, { name: 'About Us', path: '/about' }])}
    <p class="eyebrow">${esc(A.hero.eyebrow)}</p>
    <h1>${esc(A.hero.h1)}</h1>
    <p class="lead">${esc(A.hero.lead)}</p>
  </div>
</section>

<section class="sec sec--white">
  <div class="wrap grid grid--2">
    ${[A.mission, A.vision].map((m, i) => `<article class="card" ${rv(i)}><span class="chip-i">${icon(i ? 'globe' : 'heart-handshake')}</span><h2 class="h2" style="font-size:clamp(26px,2.8vw,34px)">${esc(m.title)}</h2><p style="font-size:17px">${esc(m.text)}</p></article>`).join('')}
  </div>
</section>

${whyUs('why-us', 'sec--cream')}

<section class="sec sec--white">
  <div class="wrap">
    ${secHead(A.values, true)}
    <div class="grid grid--4">
      ${A.values.items.map((v, i) => `<article class="card card--mrow" ${rv(i)}><span class="chip-i">${icon(v.icon)}</span><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></article>`).join('')}
    </div>
  </div>
</section>

<section class="sec sec--cream" aria-labelledby="tst-h">
  <div class="wrap">
    <div class="sec-head" data-reveal><p class="eyebrow">${esc(A.testimonials.eyebrow)}</p><h2 id="tst-h">${esc(A.testimonials.h2)}</h2></div>
    <div class="tcar" data-tcar>
      <ul class="tcar__track">
        ${A.testimonials.items.map((t) => `<li class="tcard card">${stars}<blockquote>&ldquo;${esc(t.text)}&rdquo;</blockquote>${who(t.name, t.where)}</li>`).join('')}
      </ul>
      <div class="tcar__nav">
        <button class="tcar__btn" type="button" data-prev aria-label="Previous">${icon('chevron-left')}</button>
        <button class="tcar__btn" type="button" data-next aria-label="Next">${icon('chevron-right')}</button>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--sand">
  <div class="wrap">
    ${secHead(A.credentials, true)}
    <div class="grid grid--3">
      ${A.credentials.items.map((c, i) => `<article class="card" ${rv(i)}>${logoImg(c.logo, 'acc__logo')}<h3>${esc(c.title)} <span class="muted">${esc(c.abbr)}</span></h3>${c.badge ? `<span class="tag tag--gold" style="align-self:flex-start">${esc(c.badge)}</span>` : ''}<p>${esc(c.text)}</p>${checks(c.list)}</article>`).join('')}
    </div>
    <div class="panel" style="margin-top:28px" data-reveal>${statsRow(A.stats)}</div>
  </div>
</section>

${ctaBand(A.cta, u('/#contact'), null, 'btn--gold')}`,
}));

/* services */
const SV = C.services;
const bookMap = ['General Consultation', 'Emergency Response', 'Specialist Consultation', 'Mobile Radiology', 'Laboratory Services', '', 'Pharmacy & Medications', '', ''];
results.push(page({
  file: 'services.html', pathname: '/services', meta: SV.meta, active: '/services',
  trail: [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }],
  schema: [{
    '@type': 'ItemList', name: SV.hero.h1,
    itemListElement: SV.items.map((s, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Service', name: s.title, description: s.text, provider: { '@id': ORG_ID }, areaServed: 'EG' } })),
  }],
  body: `
<section class="phero">
  <div class="wrap">
    ${crumbsNav([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }])}
    <p class="eyebrow">${esc(SV.hero.eyebrow)}</p>
    <h1>${esc(SV.hero.h1)}</h1>
    <p class="lead">${esc(SV.hero.lead)}</p>
    <div class="phero__cta">
      <a class="btn btn--gold" href="#book">${icon('calendar-check', 'i--sm')}${esc(SV.booking.eyebrow)}</a>
      <a class="btn btn--urgent" href="${S.tel}">${icon('phone', 'i--sm')}${esc(SV.cta.primary)}</a>
    </div>
  </div>
</section>

<section class="sec sec--white" aria-label="${esc(SV.hero.eyebrow)}">
  <div class="wrap grid grid--3">
    ${SV.items.map((s, i) => `<article class="card svc" ${rv(i)}>
      <div class="svc__top"><span class="chip-i">${icon(s.icon)}</span>${s.popular ? `<span class="tag tag--gold">${esc(SV.popular)}</span>` : ''}</div>
      <h2 class="h3" style="font-family:var(--sans);font-size:clamp(18px,1.6vw,20px);font-weight:600;letter-spacing:-.01em">${esc(s.title)}</h2>
      <p>${esc(s.text)}</p>
      ${checks(s.list)}
      <a class="btn btn--ghost btn--sm" href="#book"${bookMap[i] ? ` data-book="${esc(bookMap[i])}"` : ''}>${esc(SV.book)}</a>
    </article>`).join('')}
  </div>
</section>

<section class="sec sec--cream">
  <div class="wrap">
    ${secHead(SV.process, true)}
    <ol class="steps" style="list-style:none;margin:0;padding:0">
      ${SV.process.items.map((s, i) => `<li class="step" ${rv(i)}><div class="step__n"><span class="num">0${i + 1}</span></div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}
    </ol>
  </div>
</section>

<section class="sec sec--white" id="book">
  <div class="wrap contact">
    <div data-reveal>
      <p class="eyebrow">${esc(SV.booking.eyebrow)}</p>
      <h2>${esc(SV.booking.h2)}</h2>
      <p class="lead" style="margin-top:16px">${esc(SV.booking.lead)}</p>
      <ul class="cinfo">
        <li><span class="chip-i">${icon('phone')}</span><div><small>${esc(H.contact.items[0].label)}</small><b><a href="${S.tel}">${esc(S.phone)}</a></b><span>${esc(H.contact.items[0].sub)}</span></div></li>
        <li><span class="chip-i">${icon('mail')}</span><div><small>${esc(H.contact.items[1].label)}</small><b>${S.emails.map((m) => `<a href="mailto:${m}">${m}</a>`).join('')}</b><span>${esc(H.contact.items[1].sub)}</span></div></li>
      </ul>
    </div>
    <div data-reveal>
      ${waForm({
        id: 'booking', title: SV.booking.h2,
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
        submit: SV.booking.submit, note: SV.booking.note,
      })}
    </div>
  </div>
</section>

<section class="sec sec--cream">
  <div class="wrap">
    ${secHead(SV.matter, true)}
    <div class="grid grid--3">
      ${SV.matter.items.map((m, i) => `<article class="card card--row" ${rv(i)}><span class="chip-i">${icon(m.icon)}</span><div><h3>${esc(m.title)}</h3><p style="margin-top:6px">${esc(m.text)}</p></div></article>`).join('')}
    </div>
  </div>
</section>

${ctaBand(SV.cta, S.tel, u('/#contact'))}`,
}));

/* service areas */
const SA = C.serviceAreas;
results.push(page({
  file: 'service-areas.html', pathname: '/service-areas', meta: SA.meta, active: '/service-areas',
  trail: [{ name: 'Home', path: '/' }, { name: 'Service Areas', path: '/service-areas' }],
  body: `
<section class="phero">
  <div class="wrap">
    ${crumbsNav([{ name: 'Home', path: '/' }, { name: 'Service Areas', path: '/service-areas' }])}
    <p class="eyebrow">${esc(SA.hero.eyebrow)}</p>
    <h1>${esc(SA.hero.h1)}</h1>
    <p class="lead">${esc(SA.hero.lead)}</p>
  </div>
</section>

<section class="sec sec--white">
  <div class="wrap">
    <div class="sec-head" data-reveal><h2>${esc(SA.listTitle)}</h2><p class="lead">${esc(SA.listLead)}</p></div>
    ${mapBlock('Cairo')}
  </div>
</section>

<section class="sec sec--cream" aria-labelledby="hours-h">
  <div class="wrap">
    <h2 id="hours-h" class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">${esc(SA.listTitle)}</h2>
    <ul class="ptiles">
      ${C.areas.map((a, i) => `<li class="ptile" ${rv(i)}><span class="mono" aria-hidden="true">${icon('map-pin', 'i--sm')}</span><div><b>${a.href ? `<a href="${u(a.href)}">${esc(a.name)}</a>` : esc(a.name)}</b><span>${esc(a.region)}</span></div><span class="tag">${esc(a.hours)}</span></li>`).join('')}
    </ul>
  </div>
</section>

${ctaBand(SA.cta, S.tel, u('/#contact'))}`,
}));

/* facilities */
const F = C.facilitiesPage;
results.push(page({
  file: 'facilities.html', pathname: '/facilities', meta: F.meta, active: '/facilities',
  trail: [{ name: 'Home', path: '/' }, { name: 'Facilities', path: '/facilities' }],
  body: `
<section class="phero phero--split">
  <div class="wrap phero__grid">
    <div>
      ${crumbsNav([{ name: 'Home', path: '/' }, { name: 'Facilities', path: '/facilities' }])}
      <p class="eyebrow">${esc(F.hero.eyebrow)}</p>
      <h1>${esc(F.hero.h1)}</h1>
      <p class="lead">${esc(F.hero.lead)}</p>
      <div class="phero__cta">
        <a class="btn btn--gold" href="${u('/#contact')}">${icon('calendar-check', 'i--sm')}${esc(F.hero.primary)}</a>
        <a class="btn btn--urgent" href="${S.tel}">${icon('phone', 'i--sm')}${esc(F.hero.secondary)}</a>
      </div>
    </div>
    ${photo('elite-clinic-interior', C.facilities[0].title, '(min-width: 1024px) 50vw, 100vw', 'phero__img', true)}
  </div>
</section>

<section class="sec sec--white">
  <div class="wrap">
    <div class="panel" data-reveal>${statsRow(F.stats)}</div>
    <div class="sec-head" style="margin-top:clamp(56px,7vw,88px)" data-reveal><h2>${esc(F.listTitle)}</h2><p class="lead">${esc(F.listLead)}</p></div>
    <div class="grid grid--3">
      ${C.facilities.map((f, i) => facilityCard(f, i, true)).join('')}
    </div>
  </div>
</section>

<section class="sec sec--cream">
  <div class="wrap grid grid--3">
    ${F.assurances.map((a, i) => `<article class="card card--row" ${rv(i)}><span class="chip-i">${icon(a.icon)}</span><div><h2 class="h3" style="font-family:var(--sans);font-size:clamp(18px,1.6vw,20px);font-weight:600">${esc(a.title)}</h2><p style="margin-top:6px">${esc(a.text)}</p></div></article>`).join('')}
  </div>
</section>

${ctaBand(F.cta, u('/services') + '#book', u('/#contact'), 'btn--gold')}`,
}));

/* partners */
const P = C.partnersPage;
results.push(page({
  file: 'partners.html', pathname: '/partners', meta: P.meta, active: '/partners',
  trail: [{ name: 'Home', path: '/' }, { name: 'Partners', path: '/partners' }],
  body: `
<section class="phero">
  <div class="wrap">
    ${crumbsNav([{ name: 'Home', path: '/' }, { name: 'Partners', path: '/partners' }])}
    <p class="eyebrow">${esc(P.hero.eyebrow)}</p>
    <h1>${esc(P.hero.h1)}</h1>
    <p class="lead">${esc(P.hero.lead)}</p>
  </div>
</section>

<section class="sec sec--white">
  <div class="wrap">
    <div class="block" data-reveal>
      <div class="block__head"><span class="chip-i">${icon('hotel')}</span><div><h2>${esc(P.hotels.title)}</h2><p>${esc(P.hotels.lead)}</p></div></div>
      <ul class="ptiles">${P.hotels.items.map((h) => `<li class="ptile">${h.logo ? logoImg(h.logo) : `<span class="mono" aria-hidden="true">${esc(initials(h.name))}</span>`}<div><b>${esc(h.name)}</b><span>${esc(h.where)}</span></div></li>`).join('')}</ul>
    </div>
    <div class="block" data-reveal>
      <div class="block__head"><span class="chip-i">${icon('plane')}</span><div><h2>${esc(P.operators.title)}</h2><p>${esc(P.operators.lead)}</p></div></div>
      <ul class="ptiles">${P.operators.items.map((h) => `<li class="ptile">${h.logo ? logoImg(h.logo) : `<span class="mono" aria-hidden="true">${esc(initials(h.name))}</span>`}<div><b>${esc(h.name)}</b><span>${esc(h.where)} · ${esc(h.tag)}</span></div></li>`).join('')}</ul>
    </div>
    <div class="block" data-reveal>
      <div class="block__head"><span class="chip-i">${icon('globe')}</span><div><h2>${esc(P.agents.title)}</h2><p>${esc(P.agents.lead)}</p></div></div>
      <ul class="ptiles">${P.agents.items.map((h) => `<li class="ptile"><span class="mono" aria-hidden="true">${esc(initials(h.name))}</span><div><b>${esc(h.name)}</b><span>${esc(h.tag)}</span></div></li>`).join('')}</ul>
    </div>
  </div>
</section>

<section class="sec sec--cream">
  <div class="wrap">
    <div class="block__head" data-reveal><span class="chip-i">${icon('shield-check')}</span><div><h2>${esc(P.insurers.title)}</h2><p>${esc(P.insurers.lead)}</p></div></div>
    <div class="grid grid--4">
      ${P.insurers.items.map((h, i) => `<article class="card" ${rv(i)}>${h.logo ? logoImg(h.logo, 'acc__logo') : `<span class="mono" aria-hidden="true" style="width:64px;height:64px">${esc(initials(h.name))}</span>`}<h3>${esc(h.name)}</h3><span class="tag tag--gold" style="align-self:flex-start">${esc(P.insurers.tag)}</span><p>${esc(h.text)}</p><p class="muted" style="font-size:14.5px;display:flex;gap:8px">${icon('check', 'i--sm')}${esc(h.benefit)}</p></article>`).join('')}
    </div>
  </div>
</section>

<section class="sec sec--sand">
  <div class="wrap">
    <div class="block__head" data-reveal><span class="chip-i">${icon('award')}</span><div><h2>${esc(P.bodies.title)}</h2><p>${esc(P.bodies.lead)}</p></div></div>
    <div class="grid grid--3">
      ${P.bodies.items.map((b, i) => `<article class="card" ${rv(i)}>${logoImg(b.logo, 'acc__logo')}<h3>${esc(b.title)} <span class="muted">${esc(b.abbr)}</span></h3>${b.badge ? `<span class="tag tag--gold" style="align-self:flex-start">${esc(b.badge)}</span>` : ''}<p>${esc(b.text)}</p>${checks(b.list)}<a class="link-arrow" href="https://${b.site}" target="_blank" rel="noopener">${esc(b.site)}${icon('arrow-right', 'i--sm')}</a></article>`).join('')}
    </div>
  </div>
</section>

${ctaBand(P.cta, u('/#contact'), null, 'btn--gold')}`,
}));

/* video consultation */
const V = C.video;
results.push(page({
  file: 'video-consultation.html', pathname: '/video-consultation', meta: V.meta, active: '/video-consultation',
  trail: [{ name: 'Home', path: '/' }, { name: 'Video Consultation', path: '/video-consultation' }],
  body: `
<section class="phero phero--center">
  <div class="wrap">
    ${crumbsNav([{ name: 'Home', path: '/' }, { name: 'Video Consultation', path: '/video-consultation' }])}
    <div class="vhero__icon">${icon('video', 'i--lg')}</div>
    <p class="eyebrow">${esc(V.eyebrow)}</p>
    <h1>${esc(V.h1)}</h1>
    <p class="lead">${esc(V.lead)}</p>
  </div>
</section>
<section class="sec sec--white">
  <div class="wrap">
    <div class="grid grid--3">
      ${V.items.map((it, i) => `<article class="card card--row" ${rv(i)}><span class="chip-i">${icon(it.icon)}</span><div><h2 class="h3" style="font-family:var(--sans);font-size:clamp(18px,1.6vw,20px);font-weight:600">${esc(it.title)}</h2><p style="margin-top:4px">${esc(it.text)}</p></div></article>`).join('')}
    </div>
    <div class="vjoin" data-reveal>
      <a class="btn btn--gold" href="${S.login}">${icon('video', 'i--sm')}${esc(V.button)}</a>
      <p class="muted">${esc(V.note)}</p>
    </div>
  </div>
</section>`,
}));

/* Hurghada, English and German */
const alts = [
  { lang: 'en', path: C.hurghada.en.path },
  { lang: 'de', path: C.hurghada.de.path },
  { lang: 'x-default', path: C.hurghada.en.path },
];
for (const L of [C.hurghada.en, C.hurghada.de]) {
  const other = L.lang === 'en' ? C.hurghada.de : C.hurghada.en;
  const description = L.meta.description || L.lead.split(/(?<=[.?!])\s/).slice(0, 2).join(' ');
  const trail = L.lang === 'en'
    ? [{ name: 'Home', path: '/' }, { name: 'Service Areas', path: '/service-areas' }, { name: 'Hurghada', path: L.path }]
    : [{ name: 'Home', path: '/' }, { name: 'Hurghada', path: L.path }];
  results.push(page({
    file: L.path.slice(1) + '.html', pathname: L.path, lang: L.lang, active: null,
    meta: { title: L.meta.title, description }, alternates: alts, trail,
    schema: [{
      '@type': 'MedicalBusiness',
      '@id': ORIGIN + L.path + '#local',
      name: `${S.name} · Hurghada`,
      parentOrganization: { '@id': ORG_ID },
      url: ORIGIN + L.path,
      telephone: '+201206788566',
      openingHours: 'Mo-Su 00:00-23:59',
      address: { '@type': 'PostalAddress', addressLocality: 'Hurghada', addressRegion: 'Red Sea', addressCountry: 'EG' },
      areaServed: L.areas.map((a) => ({ '@type': 'Place', name: a })),
      availableLanguage: ['English', 'German', 'Russian', 'Arabic'],
      inLanguage: L.lang,
    }],
    body: `
<section class="phero">
  <div class="wrap">
    ${crumbsNav(trail)}
    <p class="eyebrow">${esc(L.eyebrow)}</p>
    <h1>${esc(L.h1a)} <span class="accent">${esc(L.h1b)}</span></h1>
    <p class="lead">${esc(L.lead)}</p>
    <div class="phero__cta">
      <a class="btn btn--urgent" href="${S.tel}">${icon('phone', 'i--sm')}${esc(L.call)}<span class="num">${esc(S.phone)}</span></a>
      <a class="btn btn--wa" href="${S.wa}" target="_blank" rel="noopener">${icon('whatsapp', 'i--sm')}${esc(L.wa)}</a>
    </div>
    <a class="lswitch" href="${u(other.path)}" hreflang="${other.lang}" lang="${other.lang}">${icon('languages', 'i--sm')}${esc(L.switchLabel)}</a>
  </div>
</section>

<section class="sec sec--white">
  <div class="wrap">
    <div class="sec-head" data-reveal><h2>${esc(L.treatTitle)}</h2></div>
    <div class="grid grid--4">
      ${L.treat.map((t, i) => `<article class="card card--mrow" ${rv(i)}><span class="chip-i">${icon(t.icon)}</span><h3>${t.href ? `<a href="${u(t.href)}">${esc(t.title)}</a>` : esc(t.title)}</h3><p>${esc(t.text)}</p></article>`).join('')}
    </div>
  </div>
</section>

<section class="sec sec--cream">
  <div class="wrap grid grid--2">
    <article class="card" data-reveal>
      <span class="chip-i">${icon('hotel')}</span>
      <h2 class="h2" style="font-size:clamp(24px,2.6vw,32px)">${esc(L.hotelsTitle)}</h2>
      <p>${esc(L.hotelsLead)}</p>
      <ul class="chips">${L.hotels.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
    </article>
    <article class="card" data-reveal>
      <span class="chip-i">${icon('map-pin')}</span>
      <h2 class="h2" style="font-size:clamp(24px,2.6vw,32px)">${esc(L.areasTitle)}</h2>
      <p>${esc(L.areasLead)}</p>
      <ul class="chips">${L.areas.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
    </article>
  </div>
</section>

<section class="cta">
  <div class="wrap cta__in" data-reveal>
    <div><h2>${esc(L.ctaTitle)}</h2><p>${esc(L.ctaText)}</p></div>
    <div class="cta__btns">
      <a class="btn btn--urgent" href="${S.tel}">${icon('phone', 'i--sm')}<span class="num">${esc(S.phone)}</span></a>
      <a class="btn btn--wa" href="${S.wa}" target="_blank" rel="noopener">${icon('whatsapp', 'i--sm')}WhatsApp</a>
    </div>
  </div>
</section>`,
  }));
}

/* ---------------------------------------------------------------- files for crawlers */

const urls = ['/', '/about', '/services', '/service-areas', '/facilities', '/partners', '/video-consultation', '/hurghada', '/de/arzt-hurghada'];
const hl = (p) => (p === '/hurghada' || p === '/de/arzt-hurghada'
  ? alts.map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${ORIGIN + a.path}"/>`).join('')
  : '');
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((p) => `  <url>\n    <loc>${ORIGIN + p}</loc>${hl(p)}\n  </url>`).join('\n')}
</urlset>
`);

const bots = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Claude-User', 'Google-Extended', 'Applebot-Extended'];
fs.writeFileSync(path.join(OUT, 'robots.txt'),
  PROD
    ? `${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n')}\nUser-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /portal\nDisallow: /auth\n\nSitemap: ${ORIGIN}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n');

const metas = {
  '/': H.meta, '/about': A.meta, '/services': SV.meta, '/service-areas': SA.meta, '/facilities': F.meta,
  '/partners': P.meta, '/video-consultation': V.meta,
};
fs.writeFileSync(path.join(OUT, 'llms.txt'), `# ${S.name}

> ${S.tagline}

Phone (24/7): ${S.phone}
WhatsApp: ${S.wa}
Email: ${S.emails.join(', ')}

## Pages

${Object.entries(metas).map(([p, m]) => `- [${m.title}](${ORIGIN + p}): ${m.description}`).join('\n')}
- [${C.hurghada.en.meta.title}](${ORIGIN}/hurghada): ${C.hurghada.en.lead.split(/(?<=[.?!])\s/).slice(0, 2).join(' ')}
- [${C.hurghada.de.meta.title}](${ORIGIN}/de/arzt-hurghada): ${C.hurghada.de.lead.split(/(?<=[.?!])\s/).slice(0, 2).join(' ')}

## Service areas

${C.areas.map((a) => `- ${a.name} (${a.region}): ${a.hours}`).join('\n')}
`);

fs.writeFileSync(path.join(OUT, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#C9A24A"/><text x="32" y="43" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="32" font-weight="600" fill="#0F1B33">E</text></svg>`);

/* ---------------------------------------------------------------- guard rails */

let bad = 0;
for (const r of results) {
  const html = fs.readFileSync(path.join(OUT, r.file), 'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '');
  if (/[\u2013\u2014]/.test(html)) { console.error(`  ${r.file}: contains an em or en dash`); bad++; }
  if (/undefined|NaN|\[object Object\]/.test(text)) { console.error(`  ${r.file}: leaked undefined/NaN`); bad++; }
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) { console.error(`  ${r.file}: expected exactly one h1`); bad++; }
}
console.log(`\n  medcierge ${PROD ? 'production' : 'preview'} build: ${results.length} pages into src/medcierge`);
results.forEach((r) => console.log(`    ${r.file.padEnd(28)} ${(r.bytes / 1024).toFixed(1)} KB`));
if (bad) { console.error(`\n  ${bad} problem(s)`); process.exit(1); }
console.log('');
