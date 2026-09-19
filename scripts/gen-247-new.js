/* 24/7 Clinic, new site (T-014). Generates src/247new/index.html.

   Direction, set by him 2026-09-19: a new and creative design on the 24/7 brand
   guideline (Poppins, Classic Red #C00000, the logo's orbit swoosh, two-tone
   headlines, the red-to-black rule), content word for word from their brief
   (docs/247clinic-website-brief.md). Their live site is a reference only.

   Every visible string in COPY is checked against the brief when this runs.
   The few UI labels that are ours, not theirs, are listed in OURS and nowhere
   else. Facts outside the brief (20 years, 28 clinics, the three named hotel
   clinics, their published reviews) come from their own site and database and
   are recorded in hcig memory, tasks/clinic247-website.md.

   Run: node scripts/gen-247-new.js   then   node build.js */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src', '247new');
const BRIEF = fs.readFileSync(path.join(ROOT, 'docs', '247clinic-website-brief.md'), 'utf8');

/* ---- contact, pending Irina ------------------------------------------------ *
   +20 122 222 8247 is the number in every one of their films, on their poster
   and in their Instagram bio, and the landing pages already use it. Their
   website shows +20 122 112 2246. One word from Irina settles it. */
const PHONE = '+20 122 222 8247';
const WA = '201222228247';
const wa = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

/* ---- links: our pages once built, their live page until then -------------- */
const LIVE = 'https://www.247clinic.net';
const LINK = {
  home: '/247clinic/new',
  services: `${LIVE}/services`,
  insurance: `${LIVE}/insurance`,
  clinics: '#clinics',
  partners: `${LIVE}/contact-us`,
  about: `${LIVE}/about-us`,
  contact: `${LIVE}/contact-us`,
  accreditation: '#accreditation',
  beauty: `${LIVE}/beauty-wellness`,
  blog: `${LIVE}/blog`,
  faq: `${LIVE}/faqs`,
};

/* ---- the brief, word for word --------------------------------------------- */
const COPY = {
  nav: [
    ['Home', LINK.home],
    ['Medical Services', LINK.services],
    ['Insurance & Cashless Care', LINK.insurance],
    ['Find a Clinic', LINK.clinics],
    ['For Hotels & Partners', LINK.partners],
    ['About Us', LINK.about],
    ['Contact', LINK.contact],
  ],
  footerOnly: [
    ['Beauty & Wellness', LINK.beauty],
    ['Blog', LINK.blog],
    ['FAQ', LINK.faq],
  ],
  headerCta: 'WhatsApp Us 24/7',
  headerCtaMobile: 'Need a Doctor?',
  floating: 'Need a Doctor? Chat on WhatsApp',
  sticky: 'WhatsApp Medical Support 24/7',
  waGeneral: 'Hello, I need medical assistance. I am currently staying at [Hotel Name / Location].',
  waInsurance:
    'Hello, I need medical assistance and would like to check whether my travel insurance can be used for cashless treatment.',

  heroH1a: 'Urgent Medical Care.',
  heroH1b: 'Right Inside Your Hotel.',
  heroText:
    '24/7 Clinic operates a network of on-site urgent care clinics inside hotels and resorts across Egypt’s leading tourist destinations, giving international travelers fast access to medical care without unnecessary hospital visits.',
  heroLine: ['24/7 Medical Care', 'Cashless Insurance', 'Multilingual Support'],
  heroPrimary: 'WhatsApp Us 24/7',
  heroSecondary: 'Find Your Clinic',
  heroTrust: 'Internationally Accredited Urgent Care Network',

  accH: 'Internationally Accredited Urgent Care',
  accText:
    '24/7 Clinic is the first international urgent care network outside the United States to achieve accreditation through the Urgent Care Association and CAUCQ.',
  accPoints: ['International Standards', 'Patient Safety', 'Clinical Quality', 'Operational Excellence'],
  accCta: 'Learn About Our Accreditation',

  aboutH: 'Medical Care Without Leaving Your Resort',
  aboutText: [
    'When you become ill or injured while travelling, visiting a hospital should not always be the first step.',
    '24/7 Clinic brings urgent and primary medical care directly into hotels and resorts, allowing international guests to receive medical consultation, diagnostics and treatment close to their hotel room.',
    'Our medical teams can manage a wide range of conditions on-site and coordinate hospital care only when medically necessary.',
  ],
  aboutLine: 'Hospital care when necessary - not automatically.',
  aboutCta: 'Find a Clinic',

  whyH: 'Why Leave Your Hotel When Medical Care Is Already There?',
  why: [
    ['Inside Your Resort', 'No need to search for an unfamiliar medical facility in another part of the city.', 'resort'],
    ['Fast Access to Medical Care', 'Our hotel-based model gives travelers direct access to medical support where they are staying.', 'fast'],
    ['Treatment On-Site', 'Many common urgent and primary care conditions can be assessed and treated without a hospital visit.', 'steth'],
    ['Hospital Transfer Only When Needed', 'If higher-level care is required, our team coordinates the appropriate hospital, ambulance or next medical step.', 'transfer'],
  ],

  svcH: 'What We Can Treat On-Site',
  svc: [
    ['Urgent Medical Care', 'Assessment and treatment of sudden illness, fever, infections, gastrointestinal conditions, dehydration, respiratory problems and other urgent conditions.', 'pulse'],
    ['Injuries & Minor Procedures', 'Treatment of wounds, burns, sprains, minor trauma, dressings, suturing and other minor procedures where clinically appropriate.', 'bandage'],
    ['Diagnostics & Laboratory Tests', 'Medical assessment with access to laboratory tests and diagnostic services when required.', 'lab'],
    ['IV Therapy & Medication', 'Doctor-prescribed medication, injections and IV therapy when medically indicated.', 'iv'],
    ['Specialist Consultation', 'Access to specialist physicians and coordinated consultations where further medical assessment is required.', 'doctor'],
    ['Hotel Room Doctor Visit', 'When appropriate, a doctor visit can be arranged directly in the guest’s hotel room.', 'door'],
  ],
  svcCta: 'View All Medical Services',

  insH: 'Travelling With Medical Insurance?',
  insSub: 'We Can Coordinate Directly With Your Insurer',
  insText: [
    '24/7 Clinic works with international travel insurers and assistance companies worldwide.',
    'Where insurance approval and policy conditions allow, we can arrange cashless medical treatment, meaning the patient may not need to pay the full medical cost upfront and claim it back later.',
  ],
  insListH: 'Our team can assist with:',
  insList: [
    'Insurance verification',
    'Guarantee of Payment coordination',
    'Direct communication with the insurer',
    'Medical documentation',
    'Billing coordination',
    'Cashless treatment where approved',
  ],
  insPrimary: 'Check Your Insurance on WhatsApp',
  insSecondary: 'Learn About Insurance & Cashless Care',

  howH: 'Getting Medical Help Is Simple',
  how: [
    ['Message Us on WhatsApp', 'Tell us your hotel, location and what happened.'],
    ['We Find the Nearest Medical Option', 'If your hotel has a 24/7 Clinic, we direct you there. If not, our coordination team identifies the most appropriate medical solution.'],
    ['We Check Your Insurance', 'Send us your insurance details and, where applicable, our team can coordinate directly with your insurer.'],
    ['Receive Medical Care', 'Treatment is provided on-site whenever clinically appropriate. If higher-level care is needed, we coordinate the next step.'],
  ],
  howCta: 'Get Medical Help Now',

  findH: 'Find a 24/7 Clinic Near You',
  findText: 'Our clinics are located inside hotels and resorts across Egypt’s major tourism destinations.',
  // Makadi Bay is in the brief's list but has no active clinic in their own
  // map data, and the brief says to list active locations only.
  places: ['Hurghada', 'Sahl Hasheesh', 'Soma Bay', 'Marsa Alam', 'El Quseir', 'North Coast'],
  findCta: 'View All Clinics',

  numLabels: ['Years of Healthcare Experience', 'Hotel & Resort Clinics'],
  revH: 'What Our Patients Say',

  endH: 'Feeling Unwell During Your Holiday?',
  endText: 'Tell us where you are staying and what happened. Our medical coordination team is available 24/7.',
  endPrimary: 'WhatsApp Us Now',
  endSecondary: 'Find Your Nearest Clinic',
};

/* ---- facts from their own site and database, not the brief ---------------- */
// Their counters (data-count on their homepage): 20 years, 28 clinics.
const NUMBERS = [['20', COPY.numLabels[0]], ['28', COPY.numLabels[1]]];
// The three hotel clinics confirmed in their database and on the landing pages.
const HOTELS = {
  'Sahl Hasheesh': 'Premier Le Rêve Hotel & Spa',
  'Soma Bay': 'Steigenberger Resort Ras Soma',
  'Abu Soma': 'Amwaj Beach Club',
};
// Published reviews from their own homepage, their words, spacing tidied only.
const REVIEWS = [
  ['Der Arzt war sehr nett und kompetent. Gute Unterstützung durch den Arzt. Vielen lieben Dank.', 'B Waltert', 'Switzerland', 'ch'],
  ['Sehr freundlicher und kompetenter Arzt. Sehr schnelle Hilfe ich fühlte mich in guten Händen.', 'Joerg Finger', 'Germany', 'de'],
  ['Molto professionale Disponibile e paziente Problema risolto in poche ore', 'Carla di Scanno', 'Italy', 'it'],
  ['Danke für die sachliche und freundliche Behandlung. Es war alles bestens.', 'Christa Offinger', 'Germany', 'de'],
  ['Guter medizinischer Service', 'C.G.', 'Czech Republic', 'cz'],
  ['Freundliche und schnelle Hilfe.', 'Andria Henzel', 'Germany', 'de'],
];

// Pexels photos for the six service cards, credited in src/assets/CREDITS.md.
const SVC_IMG = {
  pulse: ['c7n-urgent.webp', 'A doctor examining a patient'],
  bandage: ['c7n-injury.webp', 'A clinician treating a hand injury'],
  lab: ['c7n-lab.webp', 'Blood samples in a laboratory'],
  iv: ['c7n-iv.webp', 'A patient receiving IV therapy'],
  doctor: ['c7n-specialist.webp', 'A doctor in consultation with a patient'],
  door: ['c7n-roomvisit.webp', 'A medical team arriving at a guest room'],
};

/* ---- UI labels that are ours ---------------------------------------------- */
const OURS = {
  skip: 'Skip to content',
  menu: 'Menu',
  close: 'Close',
  sound: 'Sound',
  accredited: 'Accredited through',
  partner: 'Healthcare International Group is an Official Partner of',
  hotelClinic: 'Hotel clinic',
  call: 'Call',
  insurers: 'Insurers',
};

/* ---- check the brief copy is the brief's ----------------------------------- */
const norm = (s) => s.replace(/\s+/g, ' ').replace(/[’]/g, "'").trim();
const B = norm(BRIEF);
const strings = [];
(function walk(v) {
  if (typeof v === 'string') strings.push(v);
  else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === 'object') Object.values(v).forEach(walk);
})(COPY);
const notInBrief = strings.filter((s) => !s.startsWith('/') && !s.startsWith('http') && !s.startsWith('#') && !B.includes(norm(s)));
// Icon keys are not copy.
const ICONS = new Set(['resort', 'fast', 'steth', 'transfer', 'pulse', 'bandage', 'lab', 'iv', 'doctor', 'door']);
const real = notInBrief.filter((s) => !ICONS.has(s));
if (real.length) {
  console.error('Not word for word from the brief:\n  ' + real.join('\n  '));
  process.exit(1);
}
const dash = strings.concat(Object.values(OURS)).find((s) => /[–—]/.test(s));
if (dash) {
  console.error('Em or en dash in copy: ' + dash);
  process.exit(1);
}

/* ---- helpers ---------------------------------------------------------------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = (href) => (href.startsWith('http') ? ' target="_blank" rel="noopener"' : '');

const I = {
  wa: '<path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.3z"/><path d="M9 8.6c.3 2.9 2.4 5.2 5.4 5.9l1.2-1.3 2 .9-.4 1.7c-4.3.5-8.8-3.9-8.3-8.3l1.7-.4.9 2z" stroke-width="1.4"/>',
  phone: '<path d="M5 4h3.5l1.6 4.2-2 1.3a11 11 0 0 0 6.4 6.4l1.3-2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  check: '<path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  resort: '<path d="M3 20h18M5 20V9l7-5 7 5v11"/><path d="M10 20v-5h4v5M12 9.5v3M10.5 11h3"/>',
  fast: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.8M10 3h4"/>',
  steth: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2.5a4.5 4.5 0 0 0 9 0V13"/><circle cx="19" cy="11" r="2"/>',
  transfer: '<path d="M3 16V8h10v8M13 11h4l3 3v2h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/><path d="M7 10v4M5 12h4"/>',
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
  bandage: '<rect x="2.8" y="8.5" width="18.4" height="7" rx="3.5" transform="rotate(-40 12 12)"/><path d="M10.6 10.6h.01M13.4 13.4h.01M13.4 10.6h.01M10.6 13.4h.01"/>',
  lab: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
  iv: '<path d="M8 3h8v7a4 4 0 0 1-8 0z"/><path d="M8 7h8M12 14v3a3 3 0 0 0 3 3h3"/>',
  doctor: '<circle cx="12" cy="7" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="M12 14v4M10 16h4"/>',
  door: '<path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M3.5 21h17"/><circle cx="14.5" cy="12" r=".6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  sound: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
};
const icon = (k, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;

const btn = (label, href, kind, ico, extra = '') =>
  `<a class="btn btn--${kind}" href="${esc(href)}"${extra.includes('target=') ? '' : ext(href)}${extra}>${ico ? icon(ico) : ''}<span>${esc(label)}</span></a>`;

// The heading pattern from their brand book: text, then the red-to-black rule.
const head = (h, id, sub) => `<header class="sh">
        <h2 id="${id}">${esc(h)}</h2>
        ${sub ? `<p class="sh-sub">${esc(sub)}</p>` : ''}
      </header>`;

/* The orbit. Their logo is a circular swoosh that thickens from nothing into a
   full stroke, red into black. Here it is a 24-hour ring: 24 ticks, and the
   swoosh drawn once around the film when the page opens. */
const ticks = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  const r1 = 246, r2 = i % 6 === 0 ? 232 : 239;
  const p = (r) => [(260 + r * Math.sin(a)).toFixed(1), (260 - r * Math.cos(a)).toFixed(1)];
  const [x1, y1] = p(r1), [x2, y2] = p(r2);
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
}).join('');

const orbit = `<svg class="orbit" viewBox="0 0 520 520" aria-hidden="true">
        <defs>
          <linearGradient id="sw" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#C00000"/>
            <stop offset=".62" stop-color="#8A0000"/>
            <stop offset="1" stop-color="#000"/>
          </linearGradient>
        </defs>
        <g class="orbit-ticks">${ticks}</g>
        <path class="orbit-sw" d="M 118 402 A 200 200 0 1 1 424 386" pathLength="100"/>
        <path class="orbit-sw2" d="M 132 414 A 206 206 0 0 1 96 170" pathLength="100"/>
      </svg>`;

/* ---- page --------------------------------------------------------------------- */
const navHtml = COPY.nav
  .map(([l, h], i) => `<li><a href="${esc(h)}"${ext(h)}${i === 0 ? ' aria-current="page"' : ''}>${esc(l)}</a></li>`)
  .join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>24/7 Clinic | Urgent Medical Care. Right Inside Your Hotel.</title>
<meta name="description" content="${esc(COPY.heroText)}">
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" href="/assets/c7-logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --red:#C00000;--red-deep:#960000;--red-ink:#8A0000;--red-tint:#FBF0EF;--red-line:#EBD3D1;
  --ink:#141110;--ink2:#4E4743;--ink3:#665E58;
  --canvas:#FFFFFF;--mist:#F5F4F2;--warm:#FAF8F6;--line:#E7E1DA;--line2:#CFC6BB;
  --wa:#25D366;--wa-deep:#128C7E;--wa-ink:#0B6B4F;
  --r:14px;--r-lg:24px;--pill:999px;
  --wrap:1180px;--g:20px;
  --ease:cubic-bezier(.22,.61,.36,1);
  --f:'Poppins','Segoe UI',system-ui,-apple-system,Arial,sans-serif;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:84px}
body{margin:0;background:var(--canvas);color:var(--ink);font:400 16.5px/1.62 var(--f);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
img,svg,video{display:block;max-width:100%}
a{color:inherit}
h1,h2,h3{margin:0;font-weight:700;letter-spacing:-.02em;line-height:1.12;text-wrap:balance}
p{margin:0}
.wrap{width:100%;max-width:var(--wrap);margin:0 auto;padding:0 var(--g)}
@media(min-width:760px){:root{--g:32px}}
.skip{position:absolute;left:12px;top:-60px;z-index:100;background:var(--red);color:#fff;padding:10px 16px;border-radius:10px;font-weight:600;text-decoration:none}
.skip:focus{top:12px}
:focus-visible{outline:2px solid var(--red);outline-offset:3px;border-radius:6px}
.i{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:54px;padding:0 24px;border-radius:var(--pill);font:600 16px/1.2 var(--f);text-align:center;text-decoration:none;border:1.5px solid transparent;transition:background .2s var(--ease),color .2s var(--ease),border-color .2s var(--ease),transform .15s var(--ease);touch-action:manipulation}
.btn:active{transform:scale(.98)}
.btn span{min-width:0}
@media(min-width:560px){.btn{white-space:nowrap}}
.btn--wa{background:var(--wa);color:#fff;border-color:var(--wa)}
.btn--wa:hover{background:var(--wa-deep);border-color:var(--wa-deep)}
.btn--red{background:var(--red);color:#fff;border-color:var(--red)}
.btn--red:hover{background:var(--red-deep);border-color:var(--red-deep)}
.btn--line{background:transparent;color:var(--ink);border-color:var(--ink)}
.btn--line:hover{background:var(--ink);color:#fff}
.btn--white{background:#fff;color:var(--ink);border-color:#fff}
.btn--white .i{color:var(--wa-deep)}
.btn--white:hover{background:var(--warm)}
.btn--ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.75)}
.btn--ghost:hover{background:#fff;color:var(--red)}
.btn--sm{min-height:44px;padding:0 18px;font-size:15px}
.link{display:inline-flex;align-items:center;gap:8px;font-weight:600;color:var(--red);text-decoration:none;min-height:44px}
.link .i{transition:transform .2s var(--ease)}
.link:hover .i{transform:translateX(4px)}

/* top bar */
.top{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.94);backdrop-filter:saturate(1.4) blur(10px);-webkit-backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid var(--line)}
.top-in{display:flex;align-items:center;gap:18px;height:72px}
.logo{display:block;flex:none}
.logo img{height:50px;width:auto}
.nav{display:none;margin-left:auto}
.nav ul{display:flex;gap:2px;list-style:none;margin:0;padding:0}
.nav a{display:flex;align-items:center;min-height:44px;padding:0 10px;border-radius:10px;font-size:14px;white-space:nowrap;font-weight:500;color:var(--ink2);text-decoration:none;transition:color .2s,background .2s}
.nav a:hover{color:var(--ink);background:var(--mist)}
.nav a[aria-current]{color:var(--red)}
.top-cta{margin-left:auto;display:flex;align-items:center;gap:8px}
.top-cta .full{display:none}
.burger{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:12px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer}
@media(min-width:1280px){
  .nav{display:block}
  .top-cta{margin-left:10px}
  .top-cta .full{display:inline-flex}
  .top-cta .short,.burger{display:none}
}
.drawer{position:fixed;inset:0;z-index:60;background:rgba(255,255,255,.98);display:flex;flex-direction:column;padding:16px var(--g) 28px;transform:translateY(-8px);opacity:0;visibility:hidden;transition:opacity .2s var(--ease),transform .2s var(--ease),visibility 0s .2s}
.drawer.open{opacity:1;transform:none;visibility:visible;transition:opacity .2s var(--ease),transform .2s var(--ease)}
.drawer-top{display:flex;justify-content:space-between;align-items:center;height:56px}
.drawer ul{list-style:none;margin:18px 0 24px;padding:0}
.drawer li a{display:flex;align-items:center;min-height:56px;font-size:22px;font-weight:600;text-decoration:none;border-bottom:1px solid var(--line)}
.drawer .btn{width:100%}

/* hero */
.hero{position:relative;overflow:hidden;background:var(--mist)}
.hero:after{content:"";position:absolute;right:-18%;bottom:-2px;width:88%;height:150px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 150' preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1'%3E%3Cstop offset='0' stop-color='%23C00000'/%3E%3Cstop offset='.7' stop-color='%23A00000'/%3E%3Cstop offset='1' stop-color='%23300000'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M0 150 C 260 140 560 90 800 0 L800 30 C 580 110 300 150 0 150Z' fill='url(%23g)'/%3E%3C/svg%3E") no-repeat right bottom/100% 100%;pointer-events:none;opacity:.95}
.hero-in{position:relative;z-index:1;display:grid;gap:36px;padding-top:40px;padding-bottom:120px}
@media(min-width:960px){.hero-in{grid-template-columns:1.25fr .75fr;align-items:center;gap:40px;padding-top:72px;padding-bottom:150px}}
.chips{display:flex;flex-wrap:wrap;gap:8px;list-style:none;margin:0 0 22px;padding:0}
.chips li{display:inline-flex;align-items:center;gap:8px;padding:7px 14px 7px 10px;border-radius:var(--pill);background:#fff;border:1px solid var(--line);font-size:13.5px;font-weight:500;color:var(--ink2)}
.chips li:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--red)}
.hero h1{font-size:clamp(40px,6.2vw,66px);line-height:1.03;letter-spacing:-.035em}
.hero h1 span{display:block}
.hero h1 .r{color:var(--red)}
.hero-text{margin-top:22px;max-width:36em;font-size:clamp(16.5px,1.6vw,18.5px);color:var(--ink2)}
.hero-ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
.hero-ctas .btn{flex:1 1 220px}
@media(min-width:560px){.hero-ctas .btn{flex:0 0 auto}}
.trust{display:flex;align-items:center;gap:12px;margin-top:26px;font-size:14.5px;font-weight:600;color:var(--ink)}
.trust img{width:46px;height:46px;object-fit:contain;flex:none}
.trust-rule{flex:1;max-width:120px;height:2px;background:linear-gradient(90deg,var(--red),#000);border-radius:2px}

.stage{position:relative;justify-self:center;width:min(100%,460px);aspect-ratio:1}
.orbit{position:absolute;inset:-6%;width:112%;height:112%;overflow:visible}
.orbit-ticks line{stroke:var(--line2);stroke-width:2;stroke-linecap:round}
.orbit-sw{fill:none;stroke:url(#sw);stroke-width:14;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:0}
.orbit-sw2{fill:none;stroke:var(--red);stroke-width:3;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:0;opacity:.55}
.js .orbit-sw,.js .orbit-sw2{stroke-dashoffset:100}
.js .ready .orbit-sw{animation:draw 1.6s var(--ease) .15s forwards}
.js .ready .orbit-sw2{animation:draw 1.2s var(--ease) .75s forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.film{position:absolute;left:50%;top:50%;width:44%;aspect-ratio:9/16;transform:translate(-50%,-50%);border-radius:28px;overflow:hidden;background:#E9E4DE;box-shadow:0 30px 60px -28px rgba(60,10,10,.45),0 0 0 6px #fff}
.film video{width:100%;height:100%;object-fit:cover}
.sound{position:absolute;right:10px;bottom:10px;display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border:0;border-radius:var(--pill);background:rgba(255,255,255,.92);color:var(--ink);font:600 13px var(--f);cursor:pointer}
.sound[aria-pressed="true"]{background:var(--red);color:#fff}

/* sections */
.sec{padding:84px 0}
@media(min-width:960px){.sec{padding:112px 0}}
.sec--mist{background:var(--mist)}
.sec--warm{background:var(--warm)}
.sh{margin-bottom:40px;max-width:760px}
.sh h2{font-size:clamp(30px,4.4vw,48px)}
.sh h2:after{content:"";display:block;width:132px;height:3px;margin-top:18px;border-radius:3px;background:linear-gradient(90deg,var(--red),#000)}
.sh-sub{margin-top:16px;font-size:19px;font-weight:600;color:var(--red)}
.lead{font-size:18px;color:var(--ink2);max-width:40em}
.stack>*+*{margin-top:14px}

/* accreditation */
.acc{display:grid;gap:40px}
@media(min-width:960px){.acc{grid-template-columns:1.1fr .9fr;align-items:start;gap:64px}}
.ticks{list-style:none;padding:0;margin:26px 0 30px;display:grid;gap:10px}
@media(min-width:560px){.ticks{grid-template-columns:1fr 1fr}}
.ticks li{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--line);border-radius:var(--r);font-weight:600;background:#fff}
.ticks .i{color:var(--red);stroke-width:2.4}
.marks{display:grid;gap:18px}
.mark-g{border:1px solid var(--line);border-radius:var(--r-lg);padding:22px;background:#fff}
.mark-g p{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}
.mark-row{display:flex;flex-wrap:wrap;align-items:center;gap:22px 28px;margin-top:16px}
.mark-row img{height:74px;width:auto;object-fit:contain}
.mark-row .wide{height:56px}

/* about */
.about{display:grid;gap:40px}
@media(min-width:960px){.about{grid-template-columns:1.2fr .8fr;gap:72px;align-items:center}}
.quote{position:relative;margin:30px 0;padding:6px 0 6px 22px;font-size:clamp(21px,2.4vw,26px);font-weight:600;line-height:1.3;letter-spacing:-.01em}
.quote:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:4px;background:linear-gradient(var(--red),#000)}
.nums{display:grid;gap:14px}
.num{position:relative;overflow:hidden;padding:28px;border-radius:var(--r-lg);background:#fff;border:1px solid var(--line)}
.num b{display:block;font-size:clamp(64px,8vw,96px);font-weight:700;line-height:.95;letter-spacing:-.05em;color:var(--red)}
.num span{display:block;margin-top:10px;font-weight:600;font-size:17px}
.num b,.num span{position:relative;z-index:1}
.num:after{z-index:0}
.num:after{content:"";position:absolute;right:-50px;top:-50px;width:150px;height:150px;border-radius:50%;border:10px solid var(--red-tint)}

/* cards */
.grid{display:grid;gap:14px}
@media(min-width:640px){.grid--2{grid-template-columns:1fr 1fr}}
@media(min-width:960px){.grid--4{grid-template-columns:repeat(4,1fr)}.grid--3{grid-template-columns:repeat(3,1fr)}}
@media(min-width:640px) and (max-width:959px){.grid--4,.grid--3{grid-template-columns:1fr 1fr}}
.card{position:relative;padding:28px 24px;border-radius:var(--r-lg);background:#fff;border:1px solid var(--line);transition:border-color .25s var(--ease),transform .25s var(--ease)}
.card:hover{border-color:var(--red-line);transform:translateY(-3px)}
.card h3{font-size:19px;letter-spacing:-.01em;line-height:1.25}
.card p{margin-top:10px;color:var(--ink2);font-size:15.5px}
.badge{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;margin-bottom:22px;border-radius:16px;background:var(--red-tint);color:var(--red)}
.badge .i{width:26px;height:26px}
.card--svc{padding:0;overflow:hidden}
.card--svc .ph{aspect-ratio:3/2;overflow:hidden;background:var(--mist)}
.card--svc .ph img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease)}
.card--svc:hover .ph img{transform:scale(1.04)}
.card-b{position:relative;padding:0 24px 28px}
.card--svc .badge{position:relative;margin-top:-26px;background:var(--red);color:#fff;box-shadow:0 0 0 5px #fff}
.reel{aspect-ratio:16/9;border-radius:var(--r-lg);overflow:hidden;background:#E9E4DE}
.reel video{width:100%;height:100%;object-fit:cover}
@media(min-width:960px){.nums{grid-template-columns:1fr 1fr}.reel{grid-column:1/-1}}
.more{margin-top:30px}

/* insurance */
.ins{display:grid;gap:36px;padding:28px;border-radius:32px;background:#fff;border:1px solid var(--line)}
@media(min-width:960px){.ins{grid-template-columns:1.05fr .95fr;gap:56px;padding:56px}}
.ins>*{min-width:0}
.ins .sh{margin-bottom:22px}
@media(max-width:559px){.ins-ctas .btn,.end-ctas .btn,.more .btn,.about .btn{width:100%}}
.ins-list{align-self:start;border-radius:var(--r-lg);background:var(--warm);padding:26px}
.ins-list h3{font-size:17px;margin-bottom:14px}
.ins-list ul{list-style:none;margin:0;padding:0}
.ins-list li{display:flex;align-items:center;gap:12px;min-height:52px;border-top:1px solid var(--line);font-weight:500}
.ins-list li:first-child{border-top:0}
.ins-list .i{color:var(--red);stroke-width:2.4}
.ins-ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.insurers{display:flex;flex-wrap:wrap;align-items:center;gap:14px 26px;margin-top:30px;padding-top:24px;border-top:1px solid var(--line)}
.insurers img{height:34px;width:auto;object-fit:contain;filter:grayscale(1);opacity:.8;transition:filter .2s,opacity .2s}
.insurers img:hover{filter:none;opacity:1}

/* how it works */
.steps{list-style:none;margin:0;padding:0;display:grid;gap:14px;counter-reset:s}
@media(min-width:960px){.steps{grid-template-columns:repeat(4,1fr);gap:18px}}
.step{position:relative;overflow:hidden;padding:26px 24px 28px;border-radius:var(--r-lg);background:#fff;border:1px solid var(--line);counter-increment:s}
.step:before{content:"0" counter(s);display:block;font-size:84px;font-weight:700;line-height:.8;letter-spacing:-.06em;color:var(--red-tint);-webkit-text-stroke:1.5px var(--red-line);margin-bottom:18px}
.step h3{font-size:19px;line-height:1.25}
.step p{margin-top:10px;color:var(--ink2);font-size:15.5px}
.step:first-child{background:var(--red);border-color:var(--red);color:#fff}
.step:first-child:before{color:rgba(255,255,255,.14);-webkit-text-stroke:1.5px rgba(255,255,255,.45)}
.step:first-child p{color:rgba(255,255,255,.9)}

/* find a clinic */
.find{display:grid;gap:40px}
@media(min-width:960px){.find{grid-template-columns:.8fr 1.2fr;gap:64px;align-items:start}}
.places{list-style:none;margin:0;padding:0;display:grid;gap:10px}
@media(min-width:560px){.places{grid-template-columns:1fr 1fr}}
.place{display:flex;gap:14px;align-items:flex-start;padding:18px;border-radius:var(--r);background:#fff;border:1px solid var(--line);transition:border-color .2s}
.place:hover{border-color:var(--red-line)}
.place .i{color:var(--red);margin-top:2px}
.place b{display:block;font-size:17px}
.place small{display:block;margin-top:4px;font-size:13.5px;color:var(--ink3)}
.place--hotel{background:var(--red-tint);border-color:var(--red-line)}

/* reviews */
.revs{display:grid;gap:14px}
@media(min-width:640px){.revs{grid-template-columns:1fr 1fr}}
@media(min-width:960px){.revs{grid-template-columns:repeat(3,1fr)}}
.rev{margin:0;display:flex;flex-direction:column;justify-content:space-between;gap:22px;padding:26px;border-radius:var(--r-lg);background:#fff;border:1px solid var(--line)}
.rev blockquote{margin:0;font-size:17px;line-height:1.5;font-weight:500}
.rev blockquote:before{content:"\\201C";display:block;height:34px;font-size:64px;line-height:1;color:var(--red);font-weight:700}
.rev figcaption{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--ink3)}
.rev figcaption img{width:28px;height:20px;border-radius:3px;object-fit:cover;box-shadow:0 0 0 1px var(--line)}
.rev figcaption b{display:block;color:var(--ink);font-size:15px}

/* final */
.end{position:relative;overflow:hidden;background:var(--red);color:#fff}
.end:before{content:"";position:absolute;left:-10%;right:-10%;bottom:-2px;height:140px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 150' preserveAspectRatio='none'%3E%3Cpath d='M0 150 C 260 140 560 90 800 0 L800 40 C 580 120 300 150 0 150Z' fill='%23000' fill-opacity='.22'/%3E%3C/svg%3E") no-repeat right bottom/100% 100%;pointer-events:none}
.end-in{position:relative;padding-top:88px;padding-bottom:120px}
.end h2{font-size:clamp(32px,5vw,56px);max-width:14em}
.end p{margin-top:18px;max-width:34em;font-size:18.5px;color:rgba(255,255,255,.92)}
.end-ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}

/* footer */
.foot{background:var(--mist);padding:64px 0 120px;font-size:15px}
@media(min-width:760px){.foot{padding-bottom:48px}}
.foot-in{display:grid;gap:34px}
@media(min-width:860px){.foot-in{grid-template-columns:1.3fr 1fr 1fr 1fr}}
.foot img{height:64px;width:auto}
.foot h3{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);margin-bottom:12px}
.foot ul{list-style:none;margin:0;padding:0}
.foot li a{display:inline-flex;align-items:center;min-height:40px;text-decoration:none;color:var(--ink2)}
.foot li a:hover{color:var(--red)}
.foot-base{margin-top:40px;padding-top:22px;border-top:1px solid var(--line);color:var(--ink3);font-size:13.5px}

/* WhatsApp, floating on desktop, sticky bar on mobile */
.float{position:fixed;right:22px;bottom:22px;z-index:50;display:none;box-shadow:0 14px 30px -12px rgba(18,140,126,.6)}
@media(min-width:760px){.float{display:inline-flex}}
.sticky{position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid var(--line)}
.sticky .btn--wa{flex:1;min-width:0;padding:0 12px;font-size:14px;letter-spacing:-.01em;white-space:nowrap}
.sticky .btn--line{flex:none;width:54px;padding:0}
@media(min-width:760px){.sticky{display:none}}

/* reveal */
.js .rv{opacity:0;transform:translateY(18px);transition:opacity .6s var(--ease),transform .6s var(--ease)}
.js .rv.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){
  *,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
  .js .rv{opacity:1;transform:none}
  .js .orbit-sw,.js .orbit-sw2{stroke-dashoffset:0}
}
</style>
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
<a class="skip" href="#main">${OURS.skip}</a>

<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="${LINK.home}"><img src="/assets/c7-logo.svg" alt="24/7 Clinic, Travel Medical Services" width="98" height="50"></a>
    <nav class="nav" aria-label="Main"><ul>${navHtml}</ul></nav>
    <div class="top-cta">
      ${btn(COPY.headerCta, wa(COPY.waGeneral), 'wa btn--sm full', 'wa')}
      ${btn(COPY.headerCtaMobile, wa(COPY.waGeneral), 'wa btn--sm short', 'wa')}
      <button class="burger" type="button" aria-expanded="false" aria-controls="drawer" aria-label="${OURS.menu}">${icon('menu')}</button>
    </div>
  </div>
</header>

<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="${OURS.menu}">
  <div class="drawer-top">
    <img src="/assets/c7-logo.svg" alt="" width="84" height="43" style="height:43px;width:auto">
    <button class="burger" type="button" data-close aria-label="${OURS.close}">${icon('x')}</button>
  </div>
  <ul>${navHtml}</ul>
  ${btn(COPY.headerCta, wa(COPY.waGeneral), 'wa', 'wa')}
</div>

<main id="main">

  <section class="hero" aria-labelledby="h1">
    <div class="wrap hero-in">
      <div>
        <ul class="chips">${COPY.heroLine.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <h1 id="h1"><span>${esc(COPY.heroH1a)}</span><span class="r">${esc(COPY.heroH1b)}</span></h1>
        <p class="hero-text">${esc(COPY.heroText)}</p>
        <div class="hero-ctas">
          ${btn(COPY.heroPrimary, wa(COPY.waGeneral), 'wa', 'wa')}
          ${btn(COPY.heroSecondary, LINK.clinics, 'line', 'pin')}
        </div>
        <p class="trust"><img src="/assets/c7acc-uca.png" alt="Urgent Care Association" width="46" height="46"><span>${esc(COPY.heroTrust)}</span><i class="trust-rule" aria-hidden="true"></i></p>
      </div>
      <div class="stage">
        ${orbit}
        <div class="film">
          <video src="/assets/v-intro.mp4" autoplay muted loop playsinline preload="auto" aria-label="24/7 Clinic inside a resort"></video>
          <button class="sound" type="button" aria-pressed="false">${icon('sound')}<span>${OURS.sound}</span></button>
        </div>
      </div>
    </div>
  </section>

  <section class="sec" id="accreditation" aria-labelledby="acc-h">
    <div class="wrap acc">
      <div class="rv">
        ${head(COPY.accH, 'acc-h')}
        <p class="lead">${esc(COPY.accText)}</p>
        <ul class="ticks">${COPY.accPoints.map((t) => `<li>${icon('check')}${esc(t)}</li>`).join('')}</ul>
        <a class="link" href="${LINK.accreditation}">${esc(COPY.accCta)}${icon('arrow')}</a>
      </div>
      <div class="marks rv">
        <div class="mark-g">
          <p>${OURS.accredited}</p>
          <div class="mark-row"><img src="/assets/c7acc-uca.png" alt="Urgent Care Association" width="74" height="74" loading="lazy"></div>
        </div>
        <div class="mark-g">
          <p>${OURS.partner}</p>
          <div class="mark-row">
            <img class="wide" src="/assets/c7acc-gha.png" alt="Global Healthcare Accreditation (GHA)" width="160" height="56" loading="lazy">
            <img src="/assets/c7acc-gmwa.png" alt="German Medical Wellness Association (DMWV)" width="74" height="74" loading="lazy">
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec--mist" aria-labelledby="about-h">
    <div class="wrap about">
      <div class="rv">
        ${head(COPY.aboutH, 'about-h')}
        <div class="stack lead">${COPY.aboutText.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
        <p class="quote">${esc(COPY.aboutLine)}</p>
        ${btn(COPY.aboutCta, LINK.clinics, 'red', 'pin')}
      </div>
      <div class="nums rv">
        <div class="reel"><video data-src="/assets/v-commercial.mp4" muted loop playsinline preload="none" aria-label="24/7 Clinic at Premier Le Rêve"></video></div>
        ${NUMBERS.map(([n, l]) => `<div class="num"><b>${n}</b><span>${esc(l)}</span></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="sec" aria-labelledby="why-h">
    <div class="wrap">
      ${head(COPY.whyH, 'why-h')}
      <div class="grid grid--4">
        ${COPY.why.map(([h, p, ic]) => `<article class="card rv"><span class="badge">${icon(ic)}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="sec sec--warm" aria-labelledby="svc-h">
    <div class="wrap">
      ${head(COPY.svcH, 'svc-h')}
      <div class="grid grid--3">
        ${COPY.svc.map(([h, p, ic]) => `<article class="card card--svc rv"><div class="ph"><img src="/assets/${SVC_IMG[ic][0]}" alt="${esc(SVC_IMG[ic][1])}" width="1600" height="1067" loading="lazy"></div><div class="card-b"><span class="badge">${icon(ic)}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></div></article>`).join('\n        ')}
      </div>
      <p class="more"><a class="link" href="${LINK.services}"${ext(LINK.services)}>${esc(COPY.svcCta)}${icon('arrow')}</a></p>
    </div>
  </section>

  <section class="sec" aria-labelledby="ins-h">
    <div class="wrap">
      <div class="ins rv">
        <div>
          ${head(COPY.insH, 'ins-h', COPY.insSub)}
          <div class="stack lead">${COPY.insText.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
          <div class="ins-ctas">
            ${btn(COPY.insPrimary, wa(COPY.waInsurance), 'wa', 'wa')}
            ${btn(COPY.insSecondary, LINK.insurance, 'line')}
          </div>
        </div>
        <div class="ins-list">
          <h3>${esc(COPY.insListH)}</h3>
          <ul>${COPY.insList.map((t) => `<li>${icon('shield')}${esc(t)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec--mist" aria-labelledby="how-h">
    <div class="wrap">
      ${head(COPY.howH, 'how-h')}
      <ol class="steps">
        ${COPY.how.map(([h, p]) => `<li class="step rv"><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('\n        ')}
      </ol>
      <p class="more">${btn(COPY.howCta, wa(COPY.waGeneral), 'wa', 'wa')}</p>
    </div>
  </section>

  <section class="sec" id="clinics" aria-labelledby="find-h">
    <div class="wrap find">
      <div class="rv">
        ${head(COPY.findH, 'find-h')}
        <p class="lead">${esc(COPY.findText)}</p>
        <p class="more">${btn(COPY.findCta, `${LIVE}/our-clinics`, 'red', 'pin', ' target="_blank" rel="noopener"')}</p>
      </div>
      <ul class="places rv">
        ${Object.entries(HOTELS).map(([place, hotel]) => `<li class="place place--hotel">${icon('pin')}<div><b>${esc(place)}</b><small>${OURS.hotelClinic}: ${esc(hotel)}</small></div></li>`).join('\n        ')}
        ${COPY.places.filter((p) => !HOTELS[p]).map((p) => `<li class="place">${icon('pin')}<div><b>${esc(p)}</b></div></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="sec sec--warm" aria-labelledby="rev-h">
    <div class="wrap">
      ${head(COPY.revH, 'rev-h')}
      <div class="revs">
        ${REVIEWS.map(([q, n, c, f]) => `<figure class="rev rv"><blockquote lang="${{ ch: 'de', de: 'de', it: 'it', cz: 'de' }[f]}">${esc(q)}</blockquote><figcaption><img src="/assets/c7flag-${f}.svg" alt="" width="28" height="20" loading="lazy"><span><b>${esc(n)}</b>${esc(c)}</span></figcaption></figure>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="end" aria-labelledby="end-h">
    <div class="wrap end-in">
      <h2 id="end-h">${esc(COPY.endH)}</h2>
      <p>${esc(COPY.endText)}</p>
      <div class="end-ctas">
        ${btn(COPY.endPrimary, wa(COPY.waGeneral), 'white', 'wa')}
        ${btn(COPY.endSecondary, LINK.clinics, 'ghost', 'pin')}
      </div>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot-in">
      <div><img src="/assets/c7-logo.svg" alt="24/7 Clinic, Travel Medical Services" width="125" height="64" loading="lazy"></div>
      <div><h3>24/7 Clinic</h3><ul>${COPY.nav.map(([l, h]) => `<li><a href="${esc(h)}"${ext(h)}>${esc(l)}</a></li>`).join('')}</ul></div>
      <div><h3>More</h3><ul>${COPY.footerOnly.map(([l, h]) => `<li><a href="${esc(h)}"${ext(h)}>${esc(l)}</a></li>`).join('')}</ul></div>
      <div><h3>${OURS.call}</h3><ul><li><a href="tel:${PHONE.replace(/\s/g, '')}">${PHONE}</a></li><li><a href="${esc(wa(COPY.waGeneral))}" target="_blank" rel="noopener">WhatsApp</a></li></ul></div>
    </div>
    <p class="foot-base">© ${new Date().getFullYear()} 24/7 Clinic. Healthcare International Group.</p>
  </div>
</footer>

${btn(COPY.floating, wa(COPY.waGeneral), 'wa float', 'wa', ' target="_blank" rel="noopener"')}
<div class="sticky">
  ${btn(COPY.sticky, wa(COPY.waGeneral), 'wa', 'wa', ' target="_blank" rel="noopener"')}
  <a class="btn btn--line" href="tel:${PHONE.replace(/\s/g, '')}" aria-label="${OURS.call} ${PHONE}">${icon('phone')}</a>
</div>

<script>
(function(){
  var hero=document.querySelector('.hero');
  requestAnimationFrame(function(){hero.classList.add('ready')});
  var v=document.querySelector('.film video'),s=document.querySelector('.sound');
  s.addEventListener('click',function(){v.muted=!v.muted;s.setAttribute('aria-pressed',String(!v.muted));if(!v.muted)v.play()});
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){v.removeAttribute('autoplay');v.pause()}
  var d=document.getElementById('drawer'),b=document.querySelector('.top .burger');
  function set(o){d.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o));document.body.style.overflow=o?'hidden':'';if(o)d.querySelector('[data-close]').focus();else b.focus()}
  b.addEventListener('click',function(){set(true)});
  d.querySelector('[data-close]').addEventListener('click',function(){set(false)});
  d.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});
  addEventListener('keydown',function(e){
    if(!d.classList.contains('open'))return;
    if(e.key==='Escape'){set(false);return}
    if(e.key!=='Tab')return;
    var f=d.querySelectorAll('a,button'),first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  var reel=document.querySelector('.reel video');
  if(reel&&'IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){reel.src=reel.dataset.src;reel.play().catch(function(){});o.disconnect()}})},{rootMargin:'200px'}).observe(reel);
  }
  var els=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e,i){e.style.transitionDelay=(i%4)*60+'ms';io.observe(e)});
})();
</script>
</body>
</html>
`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log(`src/247new/index.html  ${(html.length / 1024).toFixed(1)} KB, ${strings.length} brief strings checked`);
