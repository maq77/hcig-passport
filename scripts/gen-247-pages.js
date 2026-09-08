#!/usr/bin/env node
/**
 * 24/7 Clinic: in-hotel landing pages.
 *
 *   node scripts/gen-247-pages.js     ->  src/247-lp-<slug>.html
 *
 * This is the approach Irina approved: ONE template, plus a content table, so a
 * new clinic page is a data entry and never a new file of markup. Twenty eight
 * clinics can become twenty eight landing pages without the quality drifting,
 * because the schema, the canonical, the tracking and the layout are written
 * once, here.
 *
 * Two rules this file enforces so nothing untrue reaches a page:
 *
 *   1. Anything not verified is wrapped in `tbc()`. It renders with a dotted
 *      underline on the page and is listed again in the review panel at the
 *      bottom, so a reviewer sees exactly what still needs an answer.
 *   2. Photographs carry the truth in their alt text. Only the Premier Le Reve
 *      page uses photographs of its own clinic. The other two say so.
 *
 * Verified sources are named in `SOURCES` below. Nothing here was invented.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

/* ------------------------------------------------------------------ facts */

const SOURCES = {
  film: '247 material/Le reve 247.mp4, the clinic’s own film, shot at Premier Le Rêve',
  route: '247 material/WhatsApp Video 2026-09-07 at 00.00.40.mp4, the clinic’s own "how to find us" film',
  dental: '247 material/WhatsApp Video 2026-09-06 at 23.59.18.mp4 and 23.59.53.mp4',
  health: '247 material/free healthcheck 247.jpg, the clinic’s own poster',
  site: 'www.247clinic.net, read 2026-09-08',
  insta: 'instagram.com/247clinics, read 2026-09-08',
};

/** The number the clinic puts on its own films and in its Instagram bio.
 *  The website footer carries a different one. Both are real; which one a
 *  guest should press is a question for Irina, so it is marked. */
const PHONE = '+20 122 222 8247';
const PHONE_HREF = '+201222228247';
const WA_HREF = '201222228247';

const SERVICES = [
  ['consult', 'Doctor consultation', 'A doctor sees you at the clinic.'],
  ['observe', 'Examination and observation', 'Beds, oxygen and monitoring on site if you need to stay a while.'],
  ['minor', 'Minor illness and injury', 'The everyday problems that interrupt a holiday.'],
  ['drip', 'IV infusion', 'Given at the clinic.'],
  ['meds', 'Medication', 'Prescribed and dispensed before you leave.'],
  ['lab', 'Laboratory', 'Samples taken here, results coordinated for you.'],
  ['dental', 'Dental care', 'Emergency and routine dental treatment.'],
  ['transfer', 'Ambulance and hospital referral', 'If you need a hospital, we arrange the transfer.'],
  ['insurance', 'Insurance assistance', 'We handle the paperwork with your insurer.'],
  ['report', 'Medical report', 'Written for your claim, before you fly home.'],
];

/* ---------------------------------------------------------------- clinics */

const CLINICS = [
  {
    slug: 'le-reve',
    url: '/sahl-hasheesh/premier-le-reve-clinic',
    hotel: 'Premier Le Rêve Hotel & Spa',
    hotelShort: 'Premier Le Rêve',
    area: 'Sahl Hasheesh',
    region: 'Red Sea, Egypt',
    h1: 'Need a Doctor at Premier Le Rêve?',
    title: 'Doctor at Premier Le Rêve | 24/7 Clinic Sahl Hasheesh',
    desc:
      'Need a doctor at Premier Le Rêve, Sahl Hasheesh? 24/7 Clinic is in the hotel grounds. ' +
      'English speaking doctors, open 24 hours. Call or WhatsApp now.',
    standfirst:
      '24/7 Clinic is in the grounds of Premier Le Rêve Hotel & Spa, a short walk from the main entrance.',
    /* Every photograph on this page is of this clinic. */
    ownPhotos: true,
    hero: 'C7CLINIC',
    heroAlt:
      'The 24/7 Clinic Medical Center entrance in the grounds of Premier Le Rêve Hotel & Spa, Sahl Hasheesh',
    /* Verified, word for word, from the clinic’s own directions film. */
    route: [
      'Arrive at Premier Le Rêve Hotel.',
      'Face the main entrance, then walk to the left along the outside of the building.',
      'Keep going until you reach the glass doors marked 24/7 Clinic. The pharmacy is next door.',
    ],
    routeSource: SOURCES.route,
    dentalList: [
      'General dentistry',
      'Emergency dental care',
      'Dental implants',
      'Orthodontics',
      'Cosmetic dentistry',
      'Preventive care',
    ],
    gallery: [
      ['C7SIGN', 'The Premier Le Rêve Hotel & Spa entrance sign in Sahl Hasheesh', 'The hotel entrance'],
      ['C7RECEPTION', 'The 24/7 Clinic reception desk at Premier Le Rêve, Sahl Hasheesh', 'Reception'],
      ['C7WARD', 'An observation bed with oxygen at the 24/7 Clinic in Sahl Hasheesh', 'Observation room'],
      ['C7DENTAL', 'The dental treatment room at the 24/7 Clinic in Sahl Hasheesh', 'Dental room'],
      ['C7XRAY', 'A 24/7 Clinic dentist reviewing a dental x-ray with a guest in Sahl Hasheesh', 'Dental x-ray on site'],
      ['C7TEAM', 'Doctors at the 24/7 Clinic reception in Sahl Hasheesh', 'The doctors here'],
    ],
    faqExtra: [
      [
        'Can you treat a dental emergency?',
        'Yes. This clinic has its own dental room and dental x-ray, and treats emergencies as well as routine work.',
        true,
      ],
    ],
  },

  {
    slug: 'steigenberger',
    url: '/soma-bay/steigenberger-clinic',
    hotel: 'Steigenberger Resort Ras Soma',
    hotelShort: 'Steigenberger Ras Soma',
    area: 'Soma Bay',
    region: 'Red Sea, Egypt',
    h1: 'Need a Doctor at Steigenberger Ras Soma?',
    title: 'Doctor at Steigenberger Ras Soma | 24/7 Clinic Soma Bay',
    desc:
      'Need a doctor at Steigenberger Ras Soma? 24/7 Clinic serves the resort with English ' +
      'speaking doctors, open 24 hours. Call or WhatsApp now.',
    standfirst: '24/7 Clinic serves guests of Steigenberger Resort Ras Soma, Soma Bay.',
    ownPhotos: false,
    hero: 'C7CONSULT',
    heroAlt: 'A 24/7 Clinic doctor examining a guest with a stethoscope',
    route: null,
    dentalList: null,
    gallery: [
      ['C7RECEPTION', 'A 24/7 Clinic reception desk', 'Reception'],
      ['C7DOCTOR', 'A 24/7 Clinic doctor at the consulting desk', 'Consultation'],
      ['C7WARD', 'A 24/7 Clinic observation bed with oxygen', 'Observation room'],
      ['C7RESPONSE', 'A 24/7 Clinic doctor and nurse leaving to see a guest', 'On the way to a guest'],
      ['C7MEDS', 'Medication being dispensed into a 24/7 Clinic envelope', 'Medication dispensed here'],
      ['C7REPORT', 'A 24/7 Clinic doctor writing a medical report', 'Your medical report'],
    ],
    faqExtra: [],
  },

  {
    slug: 'amwaj',
    url: '/abu-soma/amwaj-beach-club-clinic',
    hotel: 'Amwaj Beach Club Abu Soma',
    hotelShort: 'Amwaj Beach Club',
    area: 'Abu Soma',
    region: 'Red Sea, Egypt',
    h1: 'Need a Doctor at Amwaj Beach Club?',
    title: 'Doctor at Amwaj Beach Club | 24/7 Clinic Abu Soma',
    desc:
      'Need a doctor at Amwaj Beach Club, Abu Soma? 24/7 Clinic with English speaking doctors, ' +
      'open around the clock. Call or WhatsApp now.',
    standfirst: '24/7 Clinic serves guests of Amwaj Beach Club, Abu Soma.',
    ownPhotos: false,
    hero: 'C7OBS',
    heroAlt: 'A 24/7 Clinic nurse caring for a guest on an observation bed',
    route: null,
    dentalList: null,
    gallery: [
      ['C7WELCOME', 'A guest being received at a 24/7 Clinic reception', 'Walking in'],
      ['C7CONSULT', 'A 24/7 Clinic doctor examining a guest with a stethoscope', 'Examination'],
      ['C7WARD', 'A 24/7 Clinic observation bed with oxygen', 'Observation room'],
      ['C7RESPONSE', 'A 24/7 Clinic doctor and nurse leaving to see a guest', 'On the way to a guest'],
      ['C7MEDS', 'Medication being dispensed into a 24/7 Clinic envelope', 'Medication dispensed here'],
      ['C7TEAM', 'Doctors at a 24/7 Clinic reception', 'The doctors'],
    ],
    faqExtra: [],
  },
];

/* ------------------------------------------------------------------ marks */

/* Everything still waiting on an answer, collected as the page is built so the
   review panel can never fall out of step with the page above it. */
let OPEN = [];

function tbc(text, question) {
  OPEN.push(question);
  return `<span class="tbc" title="To confirm: ${esc(question)}">${text}</span>`;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* --------------------------------------------------------------- the icons */

/* Every icon is drawn the same way: outline only, `currentColor`, one stroke
   weight. Nothing is knocked out in white, so an icon is legible on a red
   button, a pink tile and a dark background without a second copy. */
const ICON = {
  phone: '<path d="M6.5 3.5h-2A1.5 1.5 0 0 0 3 5c0 8.8 7.2 16 16 16a1.5 1.5 0 0 0 1.5-1.5v-2a1.5 1.5 0 0 0-1.2-1.5l-3.1-.6a1.5 1.5 0 0 0-1.5.6l-.9 1.2a12.6 12.6 0 0 1-5.9-5.9l1.2-.9a1.5 1.5 0 0 0 .6-1.5l-.6-3.1a1.5 1.5 0 0 0-1.6-1.3Z"/>',
  wa: '<path d="M3.6 20.4 4.9 16.1A8.6 8.6 0 1 1 8 19.2Z"/><path d="M9 8.6c.3 0 .5.3.65.65l.45 1.05-.8.8a5.7 5.7 0 0 0 3.3 3.3l.8-.8 1.05.45c.35.15.65.35.65.65v.9c-.3.45-.9.6-1.5.45A8.6 8.6 0 0 1 8.1 10.6c-.15-.6 0-1.2.45-1.5Z"/>',
  pin: '<path d="M12 21.5c4.2-4.4 6.4-7.7 6.4-10.4a6.4 6.4 0 1 0-12.8 0c0 2.7 2.2 6 6.4 10.4Z"/><circle cx="12" cy="11" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2v5.1l3.3 1.9"/>',
  shield: '<path d="M12 3 19 6v6c0 4.3-3 7.5-7 8.8C8 19.5 5 16.3 5 12V6Z"/><path d="m9.2 12.2 2.1 2.1L15 10.6"/>',
  globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 9.6h16.8M3.6 14.4h16.8M12 3.4c2.4 2.6 3.6 5.5 3.6 8.6s-1.2 6-3.6 8.6c-2.4-2.6-3.6-5.5-3.6-8.6s1.2-6 3.6-8.6Z"/>',
  bed: '<path d="M3 7v12M3 12.6h18V19H3"/><path d="M7.5 12.6V10h5a3.5 3.5 0 0 1 3.4 2.6"/>',
  drip: '<path d="M12 3v5.5"/><path d="M9.2 8.5h5.6l-.8 10.2a2 2 0 0 1-2 1.8 2 2 0 0 1-2-1.8Z"/><path d="M9.6 13.6h4.8"/>',
  pill: '<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M12 9v6"/>',
  flask: '<path d="M10 3.4v5.4L5.4 18.4A1.6 1.6 0 0 0 6.8 20.8h10.4a1.6 1.6 0 0 0 1.4-2.4L14 8.8V3.4"/><path d="M8.6 3.4h6.8M7.6 15h8.8"/>',
  tooth: '<path d="M7.2 3.6c1.9 0 2.5 1 4.8 1s2.9-1 4.8-1 2.3 2.2 1.7 5.3c-.6 3.1-1.4 12-3.3 12-1.5 0-1.2-4.6-3.2-4.6s-1.7 4.6-3.2 4.6c-1.9 0-2.7-8.9-3.3-12C4.9 5.8 5.3 3.6 7.2 3.6Z"/>',
  ambulance: '<path d="M2.6 6.6h11v10h-11z"/><path d="M13.6 10h3.6l3.8 3.4v3.2h-7.4"/><circle cx="7" cy="18.4" r="1.9"/><circle cx="17.2" cy="18.4" r="1.9"/><path d="M6.4 11.2h3M7.9 9.7v3"/>',
  doc: '<path d="M6.4 2.8h7.2l4 4v14.4H6.4z"/><path d="M13.6 2.8v4h4"/><path d="M9.2 12h5.6M9.2 15.4h5.6M9.2 18.4h3.4"/>',
  check: '<path d="m4.6 12.4 5 5 9.8-10.8"/>',
  arrow: '<path d="M5 12h13M12.6 6.2 18.4 12l-5.8 5.8"/>',
};

const SERVICE_ICON = {
  consult: 'doc', observe: 'bed', minor: 'shield', drip: 'drip', meds: 'pill',
  lab: 'flask', dental: 'tooth', transfer: 'ambulance', insurance: 'shield', report: 'doc',
};

function svg(name) {
  return `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[name]}</svg>`;
}

/* ------------------------------------------------------------------- style */

const CSS = `
:root{
  --red:#C00000; --red-d:#960000; --red-t:#FCEDED; --red-l:#F0C9C9;
  --wa:#1FA855; --wa-d:#177F41; --wa-t:#E7F6ED;
  --ink:#131110; --ink2:#4C4643; --ink3:#7B736E;
  --pg:#FFFFFF; --pg2:#F8F6F3; --pg3:#F0ECE7;
  --line:#E4DED7; --line2:#CFC6BC;
  --ok:#1C7A47;
  --sh:0 1px 2px rgba(19,17,16,.05),0 12px 28px -18px rgba(19,17,16,.35);
  --f:"Poppins","Segoe UI",system-ui,-apple-system,Arial,sans-serif;
  --ftag:"Calisto MT",Georgia,"Times New Roman",serif;
  --r:14px;
  /* Filled buttons keep one colour in both themes. A button is a solid shape,
     not text on the page ground, and lifting the red to a dark-mode salmon
     dropped white-on-red from 6.5:1 to 2.8:1. */
  --btn:#C00000; --btn-d:#960000; --btn-wa:#1FA855; --btn-wa-d:#177F41;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --red:#FF5A5A; --red-d:#FF7B7B; --red-t:#2C1414; --red-l:#5A2323;
  --wa:#35C46F; --wa-d:#4FD684; --wa-t:#12291D;
  --ink:#F4EFEA; --ink2:#BDB4AC; --ink3:#8E857D;
  --pg:#141210; --pg2:#1C1917; --pg3:#26221F;
  --line:#312B27; --line2:#463E38;
  --ok:#4BC183;
  --sh:0 1px 2px rgba(0,0,0,.5),0 12px 28px -18px rgba(0,0,0,.9);
}}
:root[data-theme="dark"]{
  --red:#FF5A5A; --red-d:#FF7B7B; --red-t:#2C1414; --red-l:#5A2323;
  --wa:#35C46F; --wa-d:#4FD684; --wa-t:#12291D;
  --ink:#F4EFEA; --ink2:#BDB4AC; --ink3:#8E857D;
  --pg:#141210; --pg2:#1C1917; --pg3:#26221F;
  --line:#312B27; --line2:#463E38;
  --ok:#4BC183;
  --sh:0 1px 2px rgba(0,0,0,.5),0 12px 28px -18px rgba(0,0,0,.9);
}

*{box-sizing:border-box}
body{margin:0;background:var(--pg);color:var(--ink);font-family:var(--f);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3{margin:0;line-height:1.14;letter-spacing:-.022em;text-wrap:balance}
p{margin:0}
img{display:block;max-width:100%}
svg{display:block}
a{color:inherit}
:focus-visible{outline:3px solid var(--red);outline-offset:2px;border-radius:4px}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}

/* one icon rule, everywhere */
.ico{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}

.wrap{max-width:1080px;margin:0 auto;padding:0 18px}
@media(min-width:760px){.wrap{padding:0 28px}}

/* ---------- top bar: logo left, one red CALL right, always ---------- */
.top{position:sticky;top:0;z-index:70;background:var(--pg);border-bottom:1px solid var(--line)}
.top-in{max-width:1080px;margin:0 auto;padding:9px 18px;display:flex;align-items:center;gap:12px}
@media(min-width:760px){.top-in{padding:11px 28px}}
.top img{height:34px;width:auto}
@media(min-width:760px){.top img{height:40px}}
.top .tag{font-family:var(--ftag);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);display:none}
@media(min-width:620px){.top .tag{display:block}}
.top .sp{flex:1}
.top .call{display:inline-flex;align-items:center;gap:7px;background:var(--btn);color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:9px 15px;border-radius:999px;white-space:nowrap}
.top .call .ico{width:17px;height:17px}
.top .call:hover{background:var(--btn-d)}

/* ---------- hero: the phone number is above the fold, always ---------- */
.hero{position:relative;background:var(--pg3);overflow:hidden}
.hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,10,9,.5) 0%,rgba(12,10,9,.64) 52%,rgba(12,10,9,.84) 100%)}
.hero-in{position:relative;max-width:1080px;margin:0 auto;padding:26px 18px 30px;color:#fff}
@media(min-width:760px){.hero-in{padding:48px 28px 44px}}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:#fff;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);padding:5px 11px;border-radius:999px}
.eyebrow .ico{width:14px;height:14px}
h1{font-size:clamp(30px,7.4vw,52px);font-weight:700;letter-spacing:-.035em;margin-top:16px;color:#fff}
.stand{margin-top:12px;font-size:clamp(15px,2.1vw,18px);color:rgba(255,255,255,.9);max-width:34ch}

.acts{display:grid;gap:9px;margin-top:22px;max-width:420px}
.act{display:flex;align-items:center;justify-content:center;gap:9px;min-height:56px;border-radius:12px;text-decoration:none;font-weight:600;font-size:17px;letter-spacing:-.01em}
.act .ico{width:21px;height:21px}
.act-call{background:var(--btn);color:#fff}
.act-call:hover{background:var(--btn-d)}
.act-wa{background:var(--btn-wa);color:#fff}
.act-wa:hover{background:var(--btn-wa-d)}
.act-map{background:rgba(255,255,255,.12);color:#fff;border:1.5px solid rgba(255,255,255,.55)}
.act-map:hover{background:rgba(255,255,255,.2)}
.act .num{font-weight:500;opacity:.85;font-size:14px}
@media(min-width:620px){.acts{grid-template-columns:1fr 1fr;max-width:640px}.act-call{grid-column:1/-1}}

.trust{display:flex;flex-wrap:wrap;gap:7px 16px;margin-top:20px;font-size:13.5px;color:rgba(255,255,255,.88)}
.trust span{display:inline-flex;align-items:center;gap:6px}
.trust .ico{width:15px;height:15px;stroke-width:2.4}

/* ---------- the free check band, their own published offer ---------- */
.offer{background:var(--btn);color:#fff}
.offer-in{max-width:1080px;margin:0 auto;padding:16px 18px;display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px}
@media(min-width:760px){.offer-in{padding:18px 28px}}
.offer b{font-size:17px;font-weight:700;letter-spacing:-.02em}
.offer span{font-size:14.5px;color:rgba(255,255,255,.92)}

/* ---------- sections ---------- */
section{padding:38px 0;scroll-margin-top:58px}
@media(min-width:760px){section{padding:54px 0}}
section.alt{background:var(--pg2);border-block:1px solid var(--line)}
.kicker{font-size:11.5px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--red)}
h2{font-size:clamp(23px,4vw,33px);font-weight:700;margin-top:9px}
.note{margin-top:9px;color:var(--ink2);max-width:60ch;font-size:15.5px}

/* ---------- how to find us ---------- */
.find{display:grid;gap:22px;margin-top:24px;align-items:start}
@media(min-width:860px){.find{grid-template-columns:1.05fr .95fr;gap:34px;align-items:start}}
ol.steps{list-style:none;margin:0;padding:0;counter-reset:s}
ol.steps li{counter-increment:s;position:relative;padding:0 0 18px 46px;font-size:16px}
ol.steps li:before{content:counter(s);position:absolute;left:0;top:-1px;width:31px;height:31px;border-radius:50%;background:var(--btn);color:#fff;font-size:14px;font-weight:700;display:grid;place-items:center}
ol.steps li:not(:last-child):after{content:"";position:absolute;left:15px;top:34px;bottom:4px;width:1.5px;background:var(--line2)}
.findshot{margin:0;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);box-shadow:var(--sh)}
.findshot img{width:100%;aspect-ratio:3/2;height:auto;object-fit:cover}
.findshot figcaption{padding:10px 13px;font-size:13px;color:var(--ink3);background:var(--pg)}
.route-svg{width:100%;height:auto;border-radius:var(--r);border:1px solid var(--line);background:var(--pg);font-family:var(--f)}
.route-svg .rs-box{fill:var(--pg3);stroke:var(--line2);stroke-width:1.5}
.route-svg .rs-clinic{fill:var(--red-t);stroke:var(--red);stroke-width:2}
.route-svg .rs-walk{fill:none;stroke:var(--red);stroke-width:3.5;stroke-linecap:round;stroke-dasharray:10 8}
.route-svg .rs-head{fill:var(--red);stroke:none}
.route-svg .rs-dot{fill:var(--ink)}
.route-svg .rs-stub{fill:none;stroke:var(--ink3);stroke-width:2;stroke-dasharray:5 5}
.route-svg text{font-family:var(--f)}
.route-svg .t1{font-size:25px;font-weight:600;fill:var(--ink)}
.route-svg .t2{font-size:19px;fill:var(--ink3)}
.route-svg .t3{font-size:18px;font-weight:600;fill:var(--ink2);letter-spacing:.09em}
.route-svg .tr{font-size:18px;font-weight:600;fill:var(--red)}
.route-svg .tc{font-size:27px;font-weight:700;fill:var(--red)}
.route-svg .tc2{font-size:19px;fill:var(--ink2)}

.mapbtn{display:inline-flex;align-items:center;gap:9px;margin-top:4px;background:var(--ink);color:var(--pg);text-decoration:none;font-weight:600;font-size:15.5px;padding:13px 19px;border-radius:11px}
.mapbtn .ico{width:19px;height:19px}
.mapbtn:hover{opacity:.88}

/* ---------- services ---------- */
.svcs{display:grid;gap:1px;margin-top:26px;background:var(--line);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
@media(min-width:560px){.svcs{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.svcs{grid-template-columns:1fr 1fr 1fr}}
.svc{background:var(--pg);padding:18px 17px}
.svc .i{width:36px;height:36px;border-radius:10px;background:var(--red-t);color:var(--red);display:grid;place-items:center}
.svc h3{font-size:16px;font-weight:600;margin-top:12px}
.svc p{margin-top:5px;font-size:14.5px;color:var(--ink2);line-height:1.5}

/* ---------- dental ---------- */
.dental{display:grid;gap:20px;margin-top:24px;align-items:start}
@media(min-width:800px){.dental{grid-template-columns:1fr 1fr;align-items:center;gap:32px}}
.dental img{width:100%;aspect-ratio:3/2;height:auto;object-fit:cover;border-radius:var(--r);border:1px solid var(--line)}
ul.ticks{list-style:none;margin:0;padding:0;display:grid;gap:9px}
ul.ticks li{display:flex;gap:10px;align-items:flex-start;font-size:15.5px}
ul.ticks .ico{width:18px;height:18px;margin-top:3px;color:var(--red);stroke-width:2.4}

/* ---------- guests ---------- */
.cards{display:grid;gap:14px;margin-top:24px}
@media(min-width:720px){.cards{grid-template-columns:repeat(3,1fr)}}
.card{background:var(--pg);border:1px solid var(--line);border-radius:var(--r);padding:19px 18px}
.card .i{width:36px;height:36px;border-radius:10px;background:var(--red-t);color:var(--red);display:grid;place-items:center}
.card h3{font-size:16.5px;font-weight:600;margin-top:13px}
.card p{margin-top:6px;font-size:14.5px;color:var(--ink2);line-height:1.5}

/* ---------- gallery ---------- */
.gal{display:grid;gap:10px;margin-top:24px;grid-template-columns:1fr 1fr}
@media(min-width:760px){.gal{grid-template-columns:repeat(3,1fr);gap:14px}}
.gal figure{margin:0;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);background:var(--pg)}
.gal img{width:100%;aspect-ratio:4/3;height:auto;object-fit:cover}
.gal figcaption{padding:9px 12px;font-size:12.5px;color:var(--ink3);line-height:1.4}
.galnote{margin-top:14px;font-size:13.5px;color:var(--ink3)}

/* ---------- hours and contact ---------- */
.contact{display:grid;gap:14px;margin-top:24px}
@media(min-width:720px){.contact{grid-template-columns:repeat(3,1fr)}}
.crow{background:var(--pg);border:1px solid var(--line);border-radius:var(--r);padding:18px}
.crow .k{font-size:11.5px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:var(--ink3)}
.crow .v{font-size:19px;font-weight:600;margin-top:7px;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.crow .v a{text-decoration:none;color:var(--red)}
.crow .v a:hover{text-decoration:underline}
.crow small{display:block;margin-top:6px;font-size:13.5px;color:var(--ink2);font-weight:400;letter-spacing:0}

/* ---------- faq ---------- */
.faq{margin-top:24px;border-top:1px solid var(--line)}
.faq details{border-bottom:1px solid var(--line)}
.faq summary{cursor:pointer;list-style:none;padding:16px 34px 16px 0;font-weight:600;font-size:16.5px;position:relative}
.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:"";position:absolute;right:6px;top:23px;width:9px;height:9px;border-right:2px solid var(--ink3);border-bottom:2px solid var(--ink3);transform:rotate(45deg);transition:transform .18s}
.faq details[open] summary:after{transform:rotate(-135deg);top:26px}
.faq .a{padding:0 0 17px;color:var(--ink2);font-size:15.5px;max-width:66ch}

/* ---------- footer ---------- */
footer{background:var(--pg2);border-top:1px solid var(--line);padding:34px 0 96px}
@media(min-width:760px){footer{padding-bottom:40px}}
.fgrid{display:grid;gap:22px}
@media(min-width:720px){.fgrid{grid-template-columns:1.2fr 1fr 1fr}}
footer h3{font-size:11.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3)}
footer ul{list-style:none;margin:11px 0 0;padding:0;display:grid;gap:8px}
footer a{font-size:15px;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--line2);padding-bottom:1px}
footer a:hover{color:var(--red);border-color:var(--red)}
footer img{height:44px;width:auto}
.fnote{margin-top:12px;font-size:13.5px;color:var(--ink3);max-width:38ch}
.fbase{margin-top:26px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--ink3);display:flex;flex-wrap:wrap;gap:6px 18px}

/* ---------- sticky bottom bar, phones only ---------- */
.dock{position:fixed;left:0;right:0;bottom:0;z-index:2147483001;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:9px 12px calc(9px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--pg) 92%,transparent);backdrop-filter:blur(12px);border-top:1px solid var(--line)}
.dock a{display:flex;align-items:center;justify-content:center;gap:8px;min-height:50px;border-radius:11px;text-decoration:none;font-weight:600;font-size:16px;color:#fff}
.dock .ico{width:19px;height:19px}
.dock .d-call{background:var(--btn)}
.dock .d-wa{background:var(--btn-wa)}
@media(min-width:760px){.dock{display:none}}

/* ---------- unconfirmed content ---------- */
.tbc{cursor:help;text-decoration:underline dotted;text-decoration-color:var(--red);text-decoration-thickness:2px;text-underline-offset:4px}
.tbc:after{content:"?";font-size:10px;font-weight:700;color:var(--red);vertical-align:super;margin-left:2px;text-decoration:none;display:inline-block}
.hero .tbc,.offer .tbc{text-decoration-color:rgba(255,255,255,.85)}
.hero .tbc:after,.offer .tbc:after{color:#fff}

/* ---------- the review panel, not part of the page ---------- */
.rev{background:var(--ink);color:#fff;padding:34px 0 40px}
.rev .wrap{max-width:900px}
.rev .lab{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;background:var(--btn);color:#fff;padding:5px 10px;border-radius:5px}
.rev h2{color:#fff;font-size:25px;margin-top:14px}
.rev p{color:rgba(255,255,255,.72);margin-top:9px;font-size:15px;max-width:62ch}
.rev ol{margin:20px 0 0;padding-left:20px;display:grid;gap:9px}
.rev li{color:rgba(255,255,255,.9);font-size:15px}
.rev .src{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.16);font-size:13px;color:rgba(255,255,255,.55)}
.rev .src b{color:rgba(255,255,255,.8);font-weight:600}
`;

/* --------------------------------------------------------------- template */

function routeDiagram(c) {
  /* A drawn plan of the three steps, because a guest holding a phone in the
     sun reads a picture faster than a paragraph. Not a map: the map pin waits
     on verified coordinates. */
  return `<svg class="route-svg" viewBox="0 0 560 226" role="img" aria-label="Walking route from the main entrance of ${esc(c.hotel)} to the 24/7 Clinic">
  <rect class="rs-box" x="20" y="30" width="190" height="130" rx="8"/>
  <text class="t1" x="115" y="88" text-anchor="middle">${esc(c.hotelShort)}</text>
  <text class="t2" x="115" y="114" text-anchor="middle">Hotel</text>
  <path class="rs-stub" d="M115 160v20"/>
  <circle class="rs-dot" cx="115" cy="182" r="6"/>
  <text class="t3" x="115" y="208" text-anchor="middle">MAIN ENTRANCE</text>
  <path class="rs-walk" d="M129 182h251v-16"/>
  <path class="rs-head" d="m372 164 8-14 8 14z"/>
  <text class="tr" x="238" y="166" text-anchor="middle">walk left along the building</text>
  <rect class="rs-clinic" x="296" y="24" width="248" height="126" rx="8"/>
  <text class="tc" x="420" y="62" text-anchor="middle">24/7 CLINIC</text>
  <text class="tc2" x="420" y="88" text-anchor="middle">Glass doors, Medical</text>
  <text class="tc2" x="420" y="110" text-anchor="middle">Center sign</text>
  <text class="t2" x="420" y="136" text-anchor="middle">Pharmacy next door</text>
</svg>`;
}

function build(c, siblings) {
  OPEN = [];

  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.hotel + ', ' + c.area + ', Egypt')}`;
  const wa = `https://wa.me/${WA_HREF}?text=${encodeURIComponent('Hello, I need a doctor at ' + c.hotel + '.')}`;

  const hours = tbc('Open 24 hours', `Confirm ${c.hotelShort} is staffed 24 hours, or give the real hours`);
  const langs = tbc(
    'German, Russian and Polish',
    'Which languages are actually spoken at this clinic, beyond English'
  );
  const cost = tbc(
    'Ask when you call',
    'Consultation price, and whether it differs by hotel'
  );

  const placement = c.route
    ? 'In the hotel grounds'
    : tbc('Serving the resort', `Is the ${c.hotelShort} clinic inside the hotel, or serving it from nearby`);

  /* ------------------------------------------------------------- sections */

  const findBody = c.route
    ? `<ol class="steps">${c.route.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
       <a class="mapbtn" href="${maps}" target="_blank" rel="noopener" data-ev="directions_click">${svg('pin')}Open in Google Maps</a>`
    : `<ol class="steps">
         <li>${tbc('Arrive at ' + esc(c.hotel) + '.', 'The exact walking route to the ' + c.hotelShort + ' clinic')}</li>
         <li>${tbc('Ask reception for the 24/7 Clinic.', 'Where the clinic sits inside ' + c.hotelShort + ', building and floor')}</li>
         <li>${tbc('Look for the 24/7 Clinic sign.', 'Whether this clinic carries the same signage as Sahl Hasheesh')}</li>
       </ol>
       <a class="mapbtn" href="${maps}" target="_blank" rel="noopener" data-ev="directions_click">${svg('pin')}Open in Google Maps</a>`;

  const findVisual = c.route
    ? routeDiagram(c)
    : `<figure class="findshot"><img src="%%${c.hero}%%" alt="${esc(c.heroAlt)}" loading="lazy" width="1200" height="720">
       <figcaption>A 24/7 Clinic treatment room. A photograph of the ${esc(c.hotelShort)} clinic replaces this before launch.</figcaption></figure>`;

  const services = SERVICES.map(([k, name, note]) => {
    const isDental = k === 'dental';
    const body = isDental && !c.dentalList
      ? tbc(esc(note), `Whether the ${c.hotelShort} clinic has its own dental room`)
      : esc(note);
    return `<div class="svc"><div class="i">${svg(SERVICE_ICON[k])}</div><h3>${esc(name)}</h3><p>${body}</p></div>`;
  }).join('');

  const dental = c.dentalList
    ? `<section class="alt"><div class="wrap">
        <div class="kicker">Dental</div>
        <h2>A dental room, in the resort</h2>
        <p class="note">Toothache does not wait for the flight home. This clinic treats emergencies and routine work, and has its own dental x-ray.</p>
        <div class="dental">
          <img src="%%C7DENTAL%%" alt="The dental treatment room at the 24/7 Clinic in ${esc(c.area)}" loading="lazy" width="1200" height="720">
          <ul class="ticks">${c.dentalList.map((d) => `<li>${svg('check')}<span>${esc(d)}</span></li>`).join('')}</ul>
        </div>
      </div></section>`
    : '';

  const gallery = c.gallery
    .map(([tok, alt, cap]) => `<figure><img src="%%${tok}%%" alt="${esc(alt)}" loading="lazy" width="1200" height="720"><figcaption>${esc(cap)}</figcaption></figure>`)
    .join('');

  const galNote = c.ownPhotos
    ? `<p class="galnote">Every photograph on this page was taken at this clinic.</p>`
    : `<p class="galnote">These photographs are of other clinics in the 24/7 Clinic network. Photographs of the ${esc(c.hotelShort)} clinic are needed before this page goes live.</p>`;

  const faqs = [
    [`Is there a doctor at ${c.hotelShort}?`,
     `Yes. 24/7 Clinic ${c.route ? 'is in the hotel grounds' : 'serves guests of the resort'}. You can call, send a WhatsApp message, or walk in.`, true],
    ['Are you open at night?',
     `${hours}. Call the number on this page at any hour.`, false],
    ['Do you speak English?',
     `Yes. Our doctors see international guests every day. ${langs} are spoken across the network.`, false],
    ['Do you take my travel insurance?',
     'We handle the paperwork with your insurer and write the medical report your claim needs. Bring your policy details or your insurance card when you come.', true],
    ['What does a visit cost?',
     `${cost}. There is no charge for the blood pressure and blood sugar check.`, false],
    ['Can I get a medical report for my insurance?',
     'Yes. A written report is prepared at the clinic, in English, before you fly home.', true],
    ['What if I need a hospital?',
     'We arrange the ambulance and the referral. 24/7 Clinic is part of Healthcare International Group, which runs its own hospitals on the Red Sea coast.', true],
    ...c.faqExtra,
  ].map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a">${a}</div></details>`).join('');

  const sibs = siblings
    .map((s) => `<li><a href="/247clinic/hotel-landing-pages/${s.slug}">${esc(s.hotelShort)}, ${esc(s.area)}</a></li>`)
    .join('');

  /* Schema is emitted for real so it can be validated on the demo. Geo is
     deliberately absent: the stored coordinates are not trusted yet. */
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        '@id': `https://www.247clinic.net${c.url}#clinic`,
        name: `24/7 Clinic, ${c.hotel}`,
        url: `https://www.247clinic.net${c.url}`,
        telephone: PHONE,
        parentOrganization: { '@type': 'Organization', name: '24/7 Clinic', url: 'https://www.247clinic.net' },
        address: { '@type': 'PostalAddress', addressLocality: c.area, addressRegion: 'Red Sea Governorate', addressCountry: 'EG' },
        areaServed: [{ '@type': 'Place', name: c.hotel }, { '@type': 'Place', name: c.area }],
        availableLanguage: ['English'],
        openingHoursSpecification: [{
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00', closes: '23:59',
        }],
        availableService: SERVICES.map(([, name]) => ({ '@type': 'MedicalTherapy', name })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Our clinics', item: 'https://www.247clinic.net/our-clinics' },
          { '@type': 'ListItem', position: 2, name: c.area, item: `https://www.247clinic.net/${c.url.split('/')[1]}` },
          { '@type': 'ListItem', position: 3, name: c.hotelShort },
        ],
      },
    ],
  };

  /* ---------------------------------------------------------------- page */

  const openList = [...new Set(OPEN)];
  const closers = openList.length + 2 + (c.ownPhotos ? 0 : 1);

  return `<title>${esc(c.title)} · Demo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
<style>${CSS}</style>

<header class="top">
  <div class="top-in">
    <img src="%%LOGO247%%" alt="24/7 Clinic, Travel Medical Services">
    <span class="tag">Travel Medical Services</span>
    <span class="sp"></span>
    <a class="call" href="tel:${PHONE_HREF}" data-ev="call_click">${svg('phone')}Call</a>
  </div>
</header>

<main>
  <div class="hero">
    <img class="hero-img" src="%%${c.hero}%%" alt="${esc(c.heroAlt)}" width="1200" height="720">
    <div class="hero-scrim"></div>
    <div class="hero-in">
      <span class="eyebrow">${svg('pin')}${esc(c.area)} · ${placement}</span>
      <h1>${esc(c.h1)}</h1>
      <p class="stand">${esc(c.standfirst)} English speaking doctors. ${hours}.</p>
      <div class="acts">
        <a class="act act-call" href="tel:${PHONE_HREF}" data-ev="call_click">${svg('phone')}Call now <span class="num">${PHONE}</span></a>
        <a class="act act-wa" href="${wa}" target="_blank" rel="noopener" data-ev="whatsapp_click">${svg('wa')}WhatsApp</a>
        <a class="act act-map" href="#find" data-ev="directions_click">${svg('pin')}Find the clinic</a>
      </div>
      <div class="trust">
        <span>${svg('check')}${placement}</span>
        <span>${svg('check')}${hours}</span>
        <span>${svg('check')}Insurance assistance</span>
      </div>
    </div>
  </div>

  <div class="offer">
    <div class="offer-in">
      <b>Free health check for hotel guests</b>
      <span>Blood pressure and blood sugar, no appointment needed.</span>
    </div>
  </div>

  <section id="find">
    <div class="wrap">
      <div class="kicker">Where to find us</div>
      <h2>Getting to the clinic</h2>
      <p class="note">${c.route ? 'The walk from the main entrance takes you along the outside of the building.' : 'The exact walking route is confirmed with the hotel before this page goes live.'}</p>
      <div class="find">
        <div>${findBody}</div>
        <div>${findVisual}</div>
      </div>
    </div>
  </section>

  <section class="alt">
    <div class="wrap">
      <div class="kicker">What we treat</div>
      <h2>Urgent care, in the resort</h2>
      <p class="note">You do not need an appointment and you do not need to leave ${esc(c.area)}.</p>
      <div class="svcs">${services}</div>
    </div>
  </section>

  ${dental}

  <section>
    <div class="wrap">
      <div class="kicker">For international guests</div>
      <h2>You are far from home, not far from help</h2>
      <div class="cards">
        <div class="card"><div class="i">${svg('globe')}</div><h3>Your language</h3><p>English is spoken at every clinic. ${langs} are spoken across the network.</p></div>
        <div class="card"><div class="i">${svg('shield')}</div><h3>Your insurer</h3><p>We deal with the paperwork so you do not have to do it on holiday.</p></div>
        <div class="card"><div class="i">${svg('doc')}</div><h3>Your claim</h3><p>A written medical report in English, prepared before you fly home.</p></div>
      </div>
    </div>
  </section>

  <section class="alt">
    <div class="wrap">
      <div class="kicker">The clinic</div>
      <h2>What it looks like when you walk in</h2>
      <div class="gal">${gallery}</div>
      ${galNote}
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="kicker">Hours and contact</div>
      <h2>Reaching us</h2>
      <div class="contact">
        <div class="crow"><div class="k">Open</div><div class="v">${hours}</div><small>Every day of the year.</small></div>
        <div class="crow"><div class="k">Call or WhatsApp</div><div class="v"><a href="tel:${PHONE_HREF}" data-ev="call_click">${PHONE}</a></div><small>${tbc('One number reaches every clinic', 'Whether each clinic has its own number, and the WhatsApp number to publish')}.</small></div>
        <div class="crow"><div class="k">Where</div><div class="v">${esc(c.hotelShort)}</div><small>${esc(c.area)}, ${esc(c.region)}.</small></div>
      </div>
    </div>
  </section>

  <section class="alt">
    <div class="wrap">
      <div class="kicker">Questions</div>
      <h2>What guests ask us</h2>
      <div class="faq">${faqs}</div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div class="fgrid">
      <div>
        <img src="%%LOGO247%%" alt="24/7 Clinic">
        <p class="fnote">Travel medical services for international guests in Egypt. Part of Healthcare International Group.</p>
      </div>
      <div>
        <h3>Other clinics</h3>
        <ul>${sibs}</ul>
      </div>
      <div>
        <h3>24/7 Clinic</h3>
        <ul>
          <li><a href="https://www.247clinic.net/our-clinics" target="_blank" rel="noopener">All clinics</a></li>
          <li><a href="https://www.247clinic.net/insurance" target="_blank" rel="noopener">Insurance</a></li>
          <li><a href="https://www.247clinic.net/contact-us" target="_blank" rel="noopener">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="fbase">
      <span>24/7 Clinic · ${esc(c.hotel)} · ${esc(c.area)}</span>
      <span>Demo page. Not published on 247clinic.net.</span>
    </div>
  </div>
</footer>

<nav class="dock" aria-label="Contact">
  <a class="d-call" href="tel:${PHONE_HREF}" data-ev="call_click">${svg('phone')}Call</a>
  <a class="d-wa" href="${wa}" target="_blank" rel="noopener" data-ev="whatsapp_click">${svg('wa')}WhatsApp</a>
</nav>

<div class="rev">
  <div class="wrap">
    <span class="lab">Not part of the page</span>
    <h2>Before this page goes live</h2>
    <p>Every dotted word above is unconfirmed. It is marked on the page so nobody signs off a claim by accident. ${closers} answers close this page.</p>
    <ol>${openList.map((q) => `<li>${esc(q)}.</li>`).join('')}
      <li>Verified GPS coordinates for the clinic. The stored pin is not trusted, so no map is embedded yet.</li>
      ${c.ownPhotos ? '' : `<li>Photographs of the ${esc(c.hotelShort)} clinic. This page currently borrows photographs from other clinics and says so.</li>`}
      <li>Whether the accreditation wording used elsewhere can appear here. Accreditation lines have to be exact.</li>
    </ol>
    <p style="margin-top:22px"><a href="/247clinic/hotel-landing-pages" style="color:#fff;font-weight:600;text-decoration:underline;text-underline-offset:4px">Back to the project in HCIG Work</a></p>
    <p class="src"><b>Sources used on this page.</b> ${c.route ? esc(SOURCES.route) + '. ' : ''}${c.ownPhotos ? esc(SOURCES.film) + '. ' : ''}${c.dentalList ? esc(SOURCES.dental) + '. ' : ''}${esc(SOURCES.health)}. ${esc(SOURCES.site)}. ${esc(SOURCES.insta)}.</p>
  </div>
</div>

<script type="application/ld+json">${JSON.stringify(schema)}</script>
<script>
/* Every contact tap is an event, with the hotel and area attached, so one GA4
   report compares all clinics side by side. Console only on the demo. */
(function () {
  var HOTEL = ${JSON.stringify(c.hotelShort)}, AREA = ${JSON.stringify(c.area)};
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ev]');
    if (!a) return;
    var payload = { hotel: HOTEL, area: AREA, link: a.getAttribute('href') };
    if (window.gtag) window.gtag('event', a.dataset.ev, payload);
    else console.log('[GA4]', a.dataset.ev, payload);
  });
})();
</script>
`;
}

/* ------------------------------------------------------------------- write */

let n = 0;
for (const c of CLINICS) {
  const siblings = CLINICS.filter((o) => o.slug !== c.slug);
  const out = path.join(SRC, `247-lp-${c.slug}.html`);
  fs.writeFileSync(out, build(c, siblings));
  n += 1;
  console.log(`  src/247-lp-${c.slug}.html   ${c.hotelShort}`);
}
console.log(`\n  ${n} landing pages from one template.\n`);
