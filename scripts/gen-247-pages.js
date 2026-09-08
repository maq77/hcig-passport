#!/usr/bin/env node
/**
 * 24/7 Clinic: in-hotel landing pages.
 *
 *   node scripts/gen-247-pages.js     ->  src/247-lp-<slug>.html
 *
 * ONE template plus a content table, so a new clinic page is a data entry and
 * never a new file of markup. Twenty eight clinics can become twenty eight
 * landing pages without the quality drifting, because the schema, the
 * canonical, the tracking and the layout are written once, here.
 *
 * These pages read exactly as they will read on 247clinic.net. There are no
 * review markers, no editor's notes and no placeholders in the output.
 * Everything still open is tracked in `docs/247clinic-open-items.md`.
 *
 * What the pages are built from, all of it theirs:
 *   - their vector logo and their own title language, from 247clinic.net
 *   - their own films, cut for the web (`c7-film.mp4`, `c7-walk.mp4`)
 *   - their own campaign posters, from those films and their health check poster
 *   - their own published guest reviews, quoted exactly
 *   - clinic positions checked against OpenStreetMap on 2026-09-08
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

/* ------------------------------------------------------------------ facts */

/* The number the clinic puts on its own films, its Instagram bio and its
   company listings. */
const PHONE = '+20 122 222 8247';
const PHONE_HREF = '+201222228247';
const WA_HREF = '201222228247';

/* Both figures are theirs, quoted from their own home page. */
const SINCE = '2001';
const NETWORK = '28';

const SERVICES = [
  ['consult', 'Doctor consultation', 'A doctor sees you at the clinic, day or night.'],
  ['observe', 'Examination and observation', 'Beds, oxygen and monitoring on site if you need to stay a while.'],
  ['minor', 'Minor illness and injury', 'The everyday problems that interrupt a holiday.'],
  ['drip', 'IV infusion', 'Given at the clinic, under a doctor.'],
  ['meds', 'Medication', 'Prescribed and dispensed before you leave.'],
  ['lab', 'Laboratory', 'Samples taken here, results coordinated for you.'],
  ['dental', 'Dental care', 'Emergency and routine dental treatment.'],
  ['transfer', 'Ambulance and hospital referral', 'If you need a hospital, we arrange the transfer.'],
  ['insurance', 'Insurance assistance', 'We handle the paperwork with your insurer.'],
  ['report', 'Medical report', 'Written for your claim, before you fly home.'],
];

/* Guest reviews published by 24/7 Clinic on their own site, quoted exactly as
   written there. The English line under each is a translation and says so.
   Split across the three pages so no two pages carry the same words. */
const REVIEWS = {
  waltert: ['B Waltert', 'Switzerland', 'de', 'Der Arzt war sehr nett und kompetent. Gute Unterstützung durch den Arzt.', 'The doctor was very kind and very competent. Good support from the doctor.'],
  henzel: ['Andria Henzel', 'Germany', 'de', 'Freundliche und schnelle Hilfe.', 'Friendly and fast help.'],
  offinger: ['Christa Offinger', 'Germany', 'de', 'Danke für die sachliche und freundliche Behandlung. Es war alles bestens.', 'Thank you for the straightforward and friendly treatment. Everything was excellent.'],
  finger: ['Joerg Finger', 'Germany', 'de', 'Sehr freundlicher und kompetenter Arzt. Sehr schnelle Hilfe ich fühlte mich in guten Händen.', 'Very friendly and competent doctor. Very fast help. I felt I was in good hands.'],
  possienke: ['Bernd Possienke', 'Germany', 'de', 'Der Arzt ist sehr kompetent, erklärt sehr genau ich bin sehr zufrieden.', 'The doctor is very competent and explains things very precisely. I am very satisfied.'],
  cg: ['C.G.', 'Czech Republic', 'de', 'Guter medizinischer Service', 'Good medical service.'],
  wekeck: ['Wanessa Wekeck', 'Germany', 'de', 'Sehr nette und kompetente Behandlung, sehr hilfsbereit und freundlich.', 'Very kind and competent treatment. Very helpful and friendly.'],
  poindexter: ['Katarina Poindexter', 'Germany', 'de', 'Ich bin sehr zufrieden sie haben mir wirklich geholfen. Sehr gutes Team.', 'I am very satisfied. They really helped me. A very good team.'],
  discanno: ['Carla di Scanno', 'Italy', 'it', 'Molto professionale Disponibile e paziente Problema risolto in poche ore', 'Very professional. Helpful and patient. Problem solved in a few hours.'],
  fabien: ['Lavorsire Fabien', 'France', 'fr', 'Très bien, merci', 'Very good, thank you.'],
  kraver: ['Nicotr Kraver', 'Switzerland', 'de', 'Dr Mahmoud war ein sehr guter Arzt und konnte mir sehr gut helfen.', 'Dr Mahmoud was a very good doctor and was able to help me a great deal.'],
};

/* Guest stories the clinic films and publishes itself. Both guests speak on
   camera in their own words, with the clinic's own subtitles. */
const STORIES = [
  ['C7STORYDENTAL', 'C7STORYDENTALP', 'A family from Romania', 'Their son needed a tooth taken out. Filmed at the clinic.', false],
  ['C7STORYIV', 'C7STORYIVP', 'A guest from Romania', 'Arrived feeling very unwell and was treated with an IV infusion.', true],
];

/* The hotels 24/7 Clinic already serves, grouped the way a guest searches, from
   the clinic list published on 247clinic.net. Naming the neighbours is honest,
   useful to a guest at the hotel next door, and it is how an area page earns
   its area. */
const NETWORK_AREAS = {
  'Sahl Hasheesh': ['Premier Le Rêve', 'Baron Palace', 'Pyramisa Beach Resort', 'Old Palace Resort'],
  'Soma Bay and Abu Soma': ['Steigenberger Ras Soma', 'Amwaj Beach Club', 'Palm Royale Resort', 'Caribbean World Resort'],
  Hurghada: ['Hilton Hurghada Plaza', 'Long Beach Resort', 'Jaz Crystal Resort', 'Jaz Samaya Resort', 'Jaz Dar El Madina'],
  'Marsa Alam and El Quseir': ['Radisson Blu El Quseir', 'Steigenberger Coraya Beach', 'Jaz Lamaya Resort', 'Iberotel Costa Mares', 'Reef Oasis Resort'],
  'North Coast': ['Jaz Almaza Beach', 'Jaz Oriental Resort', 'Jaz Tamerina', 'Jaz Almazino'],
};

/* Their own campaign creatives, from the films they publish and from their
   health check poster. */
const POSTERS = [
  ['C7POSHEALTH', 'Free health check poster: free blood pressure and blood sugar check for hotel guests', 'Free health check', 'Blood pressure and blood sugar, free for hotel guests'],
  ['C7POSFIND', 'How to find the 24/7 Clinic in Sahl Hasheesh', 'How to find us', 'The walk from the hotel entrance, filmed'],
  ['C7POSSMILE', 'Brighten Your Smile: the 24/7 Clinic dental service list', 'Brighten your smile', 'Orthodontics, implants, cosmetic and emergency dental care'],
  ['C7POSDENTALSAHL', 'Dental care at the 24/7 Clinic in Sahl Hasheesh', 'Dental in Sahl Hasheesh', 'A dental room inside the resort'],
  ['C7POSTEAM', 'Meet the team at 24/7 Clinic', 'Meet the team', 'The doctors and nurses who will see you'],
  ['C7POSDENTALHUR', 'Dental care at the 24/7 Clinic in Hurghada', 'Dental in Hurghada', 'Emergency fixes and routine check-ups'],
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
    placement: 'In the hotel grounds',
    h1: 'Need a Doctor at Premier Le Rêve?',
    title: 'Doctor in Sahl Hasheesh | 24/7 Clinic at Premier Le Rêve',
    desc:
      'Need a doctor, a dentist or emergency care in Sahl Hasheesh? 24/7 Urgent Care Clinic ' +
      'in the grounds of Premier Le Rêve. Open 24 hours, English speaking doctors, hospital ' +
      'referral. Call or WhatsApp now.',
    standfirst:
      '24/7 Urgent Care Clinic is in the grounds of the hotel, a short walk from the main entrance. ' +
      'Emergency care, a dentist and hospital referral, day and night.',
    hero: 'C7CLINIC',
    heroAlt:
      'The 24/7 Clinic Medical Center entrance in the grounds of Premier Le Rêve Hotel & Spa, Sahl Hasheesh',
    /* Word for word from the clinic's own directions film. */
    route: [
      ['Arrive at Premier Le Rêve Hotel.', 'Reception will point you the right way if you are not sure.'],
      ['Face the main entrance, then walk left along the outside of the building.', 'It is a short, flat walk.'],
      ['Keep going to the glass doors marked 24/7 Clinic.', 'The pharmacy is next door.'],
    ],
    walkVideo: true,
    geo: [27.024343, 33.887027],
    mapImg: 'C7MAPLEREVE',
    dentalList: [
      'General dentistry',
      'Emergency dental care',
      'Dental implants',
      'Orthodontics',
      'Cosmetic dentistry',
      'Preventive care',
    ],
    reviews: ['finger', 'discanno', 'waltert', 'poindexter'],
    posterOrder: [1, 0, 3, 2, 4, 5],
    faqExtra: [
      [
        'Can you treat a dental emergency?',
        'Yes. This clinic has its own dental room and dental x-ray, and treats emergencies as well as routine work.',
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
    placement: 'Serving the resort',
    h1: 'Need a Doctor at Steigenberger Ras Soma?',
    title: 'Doctor in Soma Bay | 24/7 Clinic at Steigenberger Ras Soma',
    desc:
      'Need a doctor or emergency care in Soma Bay? 24/7 Urgent Care Clinic serves guests of ' +
      'Steigenberger Resort Ras Soma. Open 24 hours, English speaking doctors, hospital ' +
      'referral. Call or WhatsApp now.',
    standfirst:
      '24/7 Urgent Care Clinic serves guests of the resort in Soma Bay. ' +
      'Emergency care, medication and hospital referral, day and night.',
    hero: 'C7CONSULT',
    heroAlt: 'A 24/7 Clinic doctor examining a guest with a stethoscope',
    route: null,
    walkVideo: false,
    geo: [26.863468, 33.961233],
    mapImg: 'C7MAPSTEIG',
    dentalList: null,
    reviews: ['offinger', 'possienke', 'cg', 'kraver'],
    posterOrder: [0, 4, 2, 5, 1, 3],
    faqExtra: [],
  },

  {
    slug: 'amwaj',
    url: '/abu-soma/amwaj-beach-club-clinic',
    hotel: 'Amwaj Beach Club Abu Soma',
    hotelShort: 'Amwaj Beach Club',
    area: 'Abu Soma',
    region: 'Red Sea, Egypt',
    placement: 'Serving the resort',
    h1: 'Need a Doctor at Amwaj Beach Club?',
    title: 'Doctor in Abu Soma | 24/7 Clinic at Amwaj Beach Club',
    desc:
      'Need a doctor or emergency care in Abu Soma? 24/7 Urgent Care Clinic serves guests of ' +
      'Amwaj Beach Club. Open 24 hours, English speaking doctors, hospital referral. ' +
      'Call or WhatsApp now.',
    standfirst:
      '24/7 Urgent Care Clinic serves guests of the resort in Abu Soma. ' +
      'Emergency care, medication and hospital referral, day and night.',
    hero: 'C7OBS',
    heroAlt: 'A 24/7 Clinic nurse caring for a guest on an observation bed',
    route: null,
    walkVideo: false,
    geo: [26.813385, 33.945688],
    mapImg: 'C7MAPAMWAJ',
    dentalList: null,
    reviews: ['henzel', 'wekeck', 'fabien'],
    posterOrder: [0, 2, 4, 5, 1, 3],
    faqExtra: [],
  },
];

/* ------------------------------------------------------------------ utils */

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* --------------------------------------------------------------- the icons */

/* Outline only, `currentColor`, one stroke weight, so the same file is legible
   on a red button, a pink tile and a dark background. */
const ICON = {
  phone: '<path d="M6.5 3.5h-2A1.5 1.5 0 0 0 3 5c0 8.8 7.2 16 16 16a1.5 1.5 0 0 0 1.5-1.5v-2a1.5 1.5 0 0 0-1.2-1.5l-3.1-.6a1.5 1.5 0 0 0-1.5.6l-.9 1.2a12.6 12.6 0 0 1-5.9-5.9l1.2-.9a1.5 1.5 0 0 0 .6-1.5l-.6-3.1a1.5 1.5 0 0 0-1.6-1.3Z"/>',
  wa: '<path d="M3.6 20.4 4.9 16.1A8.6 8.6 0 1 1 8 19.2Z"/><path d="M9 8.6c.3 0 .5.3.65.65l.45 1.05-.8.8a5.7 5.7 0 0 0 3.3 3.3l.8-.8 1.05.45c.35.15.65.35.65.65v.9c-.3.45-.9.6-1.5.45A8.6 8.6 0 0 1 8.1 10.6c-.15-.6 0-1.2.45-1.5Z"/>',
  pin: '<path d="M12 21.5c4.2-4.4 6.4-7.7 6.4-10.4a6.4 6.4 0 1 0-12.8 0c0 2.7 2.2 6 6.4 10.4Z"/><circle cx="12" cy="11" r="2.4"/>',
  shield: '<path d="M12 3 19 6v6c0 4.3-3 7.5-7 8.8C8 19.5 5 16.3 5 12V6Z"/><path d="m9.2 12.2 2.1 2.1L15 10.6"/>',
  globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 9.6h16.8M3.6 14.4h16.8M12 3.4c2.4 2.6 3.6 5.5 3.6 8.6s-1.2 6-3.6 8.6c-2.4-2.6-3.6-5.5-3.6-8.6s1.2-6 3.6-8.6Z"/>',
  bed: '<path d="M3 7v12M3 12.6h18V19H3"/><path d="M7.5 12.6V10h5a3.5 3.5 0 0 1 3.4 2.6"/>',
  drip: '<path d="M12 3v5.5"/><path d="M9.2 8.5h5.6l-.8 10.2a2 2 0 0 1-2 1.8 2 2 0 0 1-2-1.8Z"/><path d="M9.6 13.6h4.8"/>',
  pill: '<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M12 9v6"/>',
  flask: '<path d="M10 3.4v5.4L5.4 18.4A1.6 1.6 0 0 0 6.8 20.8h10.4a1.6 1.6 0 0 0 1.4-2.4L14 8.8V3.4"/><path d="M8.6 3.4h6.8M7.6 15h8.8"/>',
  tooth: '<path d="M7.2 3.6c1.9 0 2.5 1 4.8 1s2.9-1 4.8-1 2.3 2.2 1.7 5.3c-.6 3.1-1.4 12-3.3 12-1.5 0-1.2-4.6-3.2-4.6s-1.7 4.6-3.2 4.6c-1.9 0-2.7-8.9-3.3-12C4.9 5.8 5.3 3.6 7.2 3.6Z"/>',
  ambulance: '<path d="M2.6 6.6h11v10h-11z"/><path d="M13.6 10h3.6l3.8 3.4v3.2h-7.4"/><circle cx="7" cy="18.4" r="1.9"/><circle cx="17.2" cy="18.4" r="1.9"/><path d="M6.4 11.2h3M7.9 9.7v3"/>',
  doc: '<path d="M6.4 2.8h7.2l4 4v14.4H6.4z"/><path d="M13.6 2.8v4h4"/><path d="M9.2 12h5.6M9.2 15.4h5.6M9.2 18.4h3.4"/>',
  hospital: '<path d="M3.4 20.6V8.4l8.6-4.8 8.6 4.8v12.2z"/><path d="M9.6 12.2h4.8M12 9.8v4.8"/><path d="M9.4 20.6v-4.2h5.2v4.2"/>',
  check: '<path d="m4.6 12.4 5 5 9.8-10.8"/>',
  play: '<circle cx="12" cy="12" r="9.2"/><path d="M10 8.4 16 12l-6 3.6z"/>',
  left: '<path d="M15 5.5 8.5 12l6.5 6.5"/>',
  right: '<path d="M9 5.5 15.5 12 9 18.5"/>',
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
  --ink:#131110; --ink2:#4C4643; --ink3:#7B736E;
  --pg:#FFFFFF; --pg2:#F8F6F3; --pg3:#F0ECE7;
  --line:#E4DED7; --line2:#CFC6BC;
  --sh:0 1px 2px rgba(19,17,16,.05),0 12px 28px -18px rgba(19,17,16,.35);
  --f:"Poppins","Segoe UI",system-ui,-apple-system,Arial,sans-serif;
  --r:14px;
  /* Filled buttons keep one colour in both themes. A button is a solid shape,
     not text on the page ground, and lifting the red for dark mode dropped
     white on red from 6.5:1 to 2.8:1. */
  --btn:#C00000; --btn-d:#960000; --btn-wa:#1FA855; --btn-wa-d:#177F41;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --red:#FF5A5A; --red-d:#FF7B7B; --red-t:#2C1414; --red-l:#5A2323;
  --ink:#F4EFEA; --ink2:#BDB4AC; --ink3:#8E857D;
  --pg:#141210; --pg2:#1C1917; --pg3:#26221F;
  --line:#312B27; --line2:#463E38;
  --sh:0 1px 2px rgba(0,0,0,.5),0 12px 28px -18px rgba(0,0,0,.9);
}}
:root[data-theme="dark"]{
  --red:#FF5A5A; --red-d:#FF7B7B; --red-t:#2C1414; --red-l:#5A2323;
  --ink:#F4EFEA; --ink2:#BDB4AC; --ink3:#8E857D;
  --pg:#141210; --pg2:#1C1917; --pg3:#26221F;
  --line:#312B27; --line2:#463E38;
  --sh:0 1px 2px rgba(0,0,0,.5),0 12px 28px -18px rgba(0,0,0,.9);
}

*{box-sizing:border-box}
body{margin:0;background:var(--pg);color:var(--ink);font-family:var(--f);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3{margin:0;line-height:1.14;letter-spacing:-.022em;text-wrap:balance}
p,blockquote,figure{margin:0}
img{display:block;max-width:100%}
svg{display:block}
a{color:inherit}
button{font:inherit;color:inherit}
:focus-visible{outline:3px solid var(--red);outline-offset:2px;border-radius:4px}
html{scroll-behavior:smooth}
a,button,summary{touch-action:manipulation}
.ico{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.skip{position:absolute;left:-9999px;top:0;z-index:200;background:var(--btn);color:#fff;padding:11px 16px;border-radius:0 0 10px 0;font-weight:600;text-decoration:none}
.skip:focus{left:0}

.wrap{max-width:1080px;margin:0 auto;padding:0 18px}
@media(min-width:760px){.wrap{padding:0 28px}}

/* ---------- top bar ---------- */
.top{position:sticky;top:0;z-index:70;background:var(--pg);border-bottom:1px solid var(--line)}
.top-in{max-width:1080px;margin:0 auto;padding:8px 18px;display:flex;align-items:center;gap:12px}
@media(min-width:760px){.top-in{padding:10px 28px}}
.top .brand{display:flex;align-items:center;text-decoration:none}
.top .brand img{height:44px;width:auto}
@media(min-width:760px){.top .brand img{height:54px}}
.top .sp{flex:1}
.top .call{display:inline-flex;align-items:center;gap:7px;background:var(--btn);color:#fff;text-decoration:none;font-weight:600;font-size:14.5px;padding:10px 16px;border-radius:999px;white-space:nowrap}
.top .call .ico{width:17px;height:17px}
.top .call:hover{background:var(--btn-d)}

/* ---------- hero ---------- */
.hero{position:relative;background:var(--pg3);overflow:hidden}
.hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,10,9,.5) 0%,rgba(12,10,9,.64) 52%,rgba(12,10,9,.84) 100%)}
.hero-in{position:relative;max-width:1080px;margin:0 auto;padding:26px 18px 30px;color:#fff}
@media(min-width:760px){.hero-in{padding:48px 28px 44px}}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:#fff;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);padding:5px 11px;border-radius:999px}
.eyebrow .ico{width:14px;height:14px}
h1{font-size:clamp(30px,7.4vw,52px);font-weight:700;letter-spacing:-.035em;margin-top:16px;color:#fff}
.stand{margin-top:12px;font-size:clamp(15px,2.1vw,18px);color:rgba(255,255,255,.9);max-width:40ch}

.acts{display:grid;gap:9px;margin-top:22px;max-width:420px}
.act{display:flex;align-items:center;justify-content:center;gap:9px;min-height:56px;border-radius:12px;text-decoration:none;font-weight:600;font-size:17px;letter-spacing:-.01em;border:0;cursor:pointer;transition:background .18s ease-out,transform .12s ease-out}
.act:active{transform:scale(.985)}
.act .ico{width:21px;height:21px}
.act-call{background:var(--btn);color:#fff}
.act-call:hover{background:var(--btn-d)}
.act-wa{background:var(--btn-wa);color:#fff}
.act-wa:hover{background:var(--btn-wa-d)}
.act-map{background:rgba(255,255,255,.12);color:#fff;border:1.5px solid rgba(255,255,255,.55)}
.act-map:hover{background:rgba(255,255,255,.22)}
.act .num{font-weight:500;opacity:.85;font-size:14px}
@media(min-width:620px){.acts{grid-template-columns:1fr 1fr;max-width:640px}.act-call{grid-column:1/-1}}

.trust{display:flex;flex-wrap:wrap;gap:7px 16px;margin-top:20px;font-size:13.5px;color:rgba(255,255,255,.88)}
.trust span{display:inline-flex;align-items:center;gap:6px}
.trust .ico{width:15px;height:15px;stroke-width:2.4}

/* ---------- offer band ---------- */
.offer{background:var(--btn);color:#fff}
.offer-in{max-width:1080px;margin:0 auto;padding:16px 18px;display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px}
@media(min-width:760px){.offer-in{padding:18px 28px}}
.offer b{font-size:17px;font-weight:700;letter-spacing:-.02em}
.offer span{font-size:14.5px;color:rgba(255,255,255,.92)}

/* ---------- proof strip ---------- */
.proof{background:var(--pg2);border-bottom:1px solid var(--line)}
.proof-in{max-width:1080px;margin:0 auto;padding:14px 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
@media(min-width:760px){.proof-in{padding:16px 28px;gap:20px}}
.proof div{text-align:center}
.proof .n{font-size:19px;font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
@media(min-width:760px){.proof .n{font-size:23px}}
.proof .l{font-size:11.5px;color:var(--ink3);margin-top:2px;line-height:1.35}

/* ---------- sections ---------- */
section{padding:38px 0;scroll-margin-top:60px}
@media(min-width:760px){section{padding:54px 0}}
main>section:nth-of-type(even){background:var(--pg2);border-block:1px solid var(--line)}
.kicker{font-size:11.5px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--red)}
h2{font-size:clamp(23px,4vw,33px);font-weight:700;margin-top:9px}
.note{margin-top:9px;color:var(--ink2);max-width:60ch;font-size:15.5px}

/* ---------- how to find us ---------- */
.find{display:grid;gap:22px;margin-top:24px;align-items:start}
@media(min-width:900px){.find{grid-template-columns:1fr 1fr;gap:32px}}
ol.steps{list-style:none;margin:0 0 20px;padding:0;counter-reset:s}
ol.steps li{counter-increment:s;position:relative;padding:0 0 20px 48px;font-size:16px}
ol.steps li:before{content:counter(s);position:absolute;left:0;top:-1px;width:32px;height:32px;border-radius:50%;background:var(--btn);color:#fff;font-size:14px;font-weight:700;display:grid;place-items:center}
ol.steps li:not(:last-child):after{content:"";position:absolute;left:15.5px;top:36px;bottom:4px;width:1.5px;background:var(--line2)}
ol.steps b{display:block;font-weight:600}
ol.steps em{display:block;font-style:normal;margin-top:2px;font-size:14.5px;color:var(--ink2)}
@media (prefers-reduced-motion:no-preference){
  .js ol.steps li{opacity:0;transform:translateY(8px)}
  ol.steps.in li{opacity:1;transform:none;transition:opacity .32s ease-out,transform .32s ease-out}
  ol.steps.in li:nth-child(2){transition-delay:.09s}
  ol.steps.in li:nth-child(3){transition-delay:.18s}
}

.mapbtn{display:inline-flex;align-items:center;gap:9px;background:var(--ink);color:var(--pg);text-decoration:none;font-weight:600;font-size:15.5px;padding:14px 20px;border-radius:11px}
.mapbtn .ico{width:19px;height:19px}
.mapbtn:hover{opacity:.88}

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
/* The walk draws itself once, when it scrolls into view. */
@media (prefers-reduced-motion:no-preference){
  .js .route-svg .rs-walk{stroke-dasharray:340;stroke-dashoffset:340}
  .js .route-svg .rs-head,.js .route-svg .tr{opacity:0}
  .route-svg.in .rs-walk{animation:draw 1.1s ease-out forwards}
  .route-svg.in .rs-head{animation:pop .3s ease-out .95s forwards}
  .route-svg.in .tr{animation:pop .3s ease-out .6s forwards}
  @keyframes draw{from{stroke-dasharray:340;stroke-dashoffset:340}to{stroke-dasharray:10 8;stroke-dashoffset:0}}
  @keyframes pop{to{opacity:1}}
}

.mapbox{margin-top:16px;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:var(--pg2)}
.mapbox .frame{position:relative;background-size:cover;background-position:center}
.mapbox iframe{display:block;width:100%;height:280px;border:0}
@media(min-width:900px){.mapbox iframe{height:320px}}
.mapbox img{width:100%;aspect-ratio:3/2;height:auto;object-fit:cover}
.mapbox figcaption{padding:10px 14px;font-size:13px;color:var(--ink3);border-top:1px solid var(--line)}

/* ---------- video ---------- */
.vid{margin-top:16px;position:relative;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);background:#0b0a09}
.vid video{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;background:#0b0a09}
.vid.portrait video{aspect-ratio:3/4;object-fit:cover}
.vid .play{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(180deg,rgba(10,9,8,.12),rgba(10,9,8,.5));border:0;width:100%;cursor:pointer;color:#fff}
.vid .play .disc{width:74px;height:74px;border-radius:50%;background:var(--btn);display:grid;place-items:center;box-shadow:0 10px 30px -8px rgba(0,0,0,.7);transition:transform .18s ease-out}
.vid .play:hover .disc{transform:scale(1.06)}
.vid .play .disc svg{width:30px;height:30px;fill:none;stroke:#fff;stroke-width:1.7;stroke-linejoin:round}
.vid .play .lbl{position:absolute;left:0;right:0;bottom:16px;text-align:center;font-weight:600;font-size:15px;text-shadow:0 2px 10px rgba(0,0,0,.75);padding:0 16px}
.vid.playing .play{display:none}

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

/* ---------- poster carousel ---------- */
.car{margin-top:24px}
.car-track{display:grid;grid-auto-flow:column;grid-auto-columns:78%;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:4px}
.car-track::-webkit-scrollbar{display:none}
@media(min-width:620px){.car-track{grid-auto-columns:44%}}
@media(min-width:960px){.car-track{grid-auto-columns:29%}}
.car figure{scroll-snap-align:center;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);background:var(--pg)}
.car img{width:100%;aspect-ratio:3/4;height:auto;object-fit:cover}
.car figcaption{padding:12px 14px}
.car figcaption b{display:block;font-size:15px;font-weight:600}
.car figcaption span{display:block;margin-top:3px;font-size:13.5px;color:var(--ink3);line-height:1.4}
.car-nav{display:flex;align-items:center;gap:10px;margin-top:14px}
.car-nav button{width:44px;height:44px;border-radius:50%;border:1px solid var(--line2);background:var(--pg);display:grid;place-items:center;cursor:pointer;color:var(--ink)}
.car-nav button:hover{border-color:var(--red);color:var(--red)}
.car-nav button[disabled]{opacity:.35;cursor:default}
.car-nav button[disabled]:hover{border-color:var(--line2);color:var(--ink)}
.car-dots{display:flex;gap:6px;margin-left:4px}
.car-dots i{width:7px;height:7px;border-radius:50%;background:var(--line2);transition:background .2s,width .2s}
.car-dots i.on{background:var(--red);width:20px;border-radius:4px}

/* ---------- guest stories ---------- */
.stories{display:grid;gap:18px;margin-top:26px}
@media(min-width:820px){.stories{grid-template-columns:1.35fr 1fr;align-items:start}}
.story .vid{margin-top:0}
.story .cap{margin-top:11px}
.story .cap b{display:block;font-size:16px;font-weight:600}
.story .cap span{display:block;margin-top:3px;font-size:14px;color:var(--ink2);line-height:1.5}

/* ---------- verified chip ---------- */
.vchip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--red);background:var(--red-t);border:1px solid var(--red-l);padding:5px 10px;border-radius:999px}
.vchip .ico{width:13px;height:13px;stroke-width:2.6}

/* ---------- network of hotels ---------- */
.areas{display:grid;gap:14px;margin-top:26px}
@media(min-width:720px){.areas{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1000px){.areas{grid-template-columns:repeat(3,1fr)}}
.area{background:var(--pg);border:1px solid var(--line);border-radius:var(--r);padding:18px}
.area.here{border-color:var(--red);box-shadow:0 0 0 1px var(--red)}
.area h3{font-size:15.5px;font-weight:600;display:flex;align-items:center;gap:8px}
.area h3 .here-tag{font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:var(--btn);padding:3px 7px;border-radius:5px}
.area ul{list-style:none;margin:11px 0 0;padding:0;display:grid;gap:6px}
.area li{font-size:14.5px;color:var(--ink2);display:flex;gap:8px;align-items:flex-start}
.area li:before{content:"";width:5px;height:5px;border-radius:50%;background:var(--line2);margin-top:9px;flex:none}
.area li.self{color:var(--ink);font-weight:600}
.area li.self:before{background:var(--red)}

/* ---------- guests ---------- */
.cards{display:grid;gap:14px;margin-top:24px}
@media(min-width:720px){.cards{grid-template-columns:repeat(3,1fr)}}
.card{background:var(--pg);border:1px solid var(--line);border-radius:var(--r);padding:19px 18px}
.card .i{width:36px;height:36px;border-radius:10px;background:var(--red-t);color:var(--red);display:grid;place-items:center}
.card h3{font-size:16.5px;font-weight:600;margin-top:13px}
.card p{margin-top:6px;font-size:14.5px;color:var(--ink2);line-height:1.5}

/* ---------- reviews ---------- */
.revs{display:grid;gap:14px;margin-top:26px}
@media(min-width:720px){.revs{grid-template-columns:repeat(2,1fr)}}
.rev-card{background:var(--pg);border:1px solid var(--line);border-radius:var(--r);padding:19px 18px;display:flex;flex-direction:column}
.rev-card .q{font-size:17px;line-height:1.45;letter-spacing:-.012em}
.rev-card .t{margin-top:9px;font-size:14px;color:var(--ink2);line-height:1.5}
.rev-card .t b{font-weight:500;color:var(--ink3);font-size:11px;letter-spacing:.11em;text-transform:uppercase;display:block;margin-bottom:2px}
.rev-card .who{margin-top:auto;padding-top:15px;display:flex;align-items:center;gap:11px}
.rev-card .av{width:38px;height:38px;border-radius:50%;background:var(--red-t);color:var(--red);display:grid;place-items:center;font-weight:700;font-size:14px;flex:none}
.rev-card .nm{display:block;font-size:14.5px;font-weight:600;line-height:1.3}
.rev-card .cn{display:block;font-size:12.5px;color:var(--ink3);line-height:1.3}

/* ---------- hospital block ---------- */
.hosp{display:grid;gap:16px;margin-top:26px;padding-top:26px;border-top:1px solid var(--line);align-items:start}
@media(min-width:820px){.hosp{grid-template-columns:auto 1fr;gap:22px;align-items:center}}
.hosp .i{width:58px;height:58px;border-radius:15px;background:var(--red-t);color:var(--red);display:grid;place-items:center}
.hosp .i .ico{width:30px;height:30px}

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
footer img{height:60px;width:auto}
.fnote{margin-top:12px;font-size:13.5px;color:var(--ink3);max-width:38ch}
.fbase{margin-top:26px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--ink3);display:flex;flex-wrap:wrap;gap:6px 18px}

/* ---------- sticky dock ---------- */
.dock{position:fixed;left:0;right:0;bottom:0;z-index:2147483001;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:9px 12px calc(9px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--pg) 92%,transparent);backdrop-filter:blur(12px);border-top:1px solid var(--line)}
.dock a{display:flex;align-items:center;justify-content:center;gap:8px;min-height:50px;border-radius:11px;text-decoration:none;font-weight:600;font-size:16px;color:#fff}
.dock .ico{width:19px;height:19px}
.dock .d-call{background:var(--btn)}
.dock .d-wa{background:var(--btn-wa)}
@media(min-width:760px){.dock{display:none}}

@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
`;

/* --------------------------------------------------------------- template */

function routeDiagram(c) {
  /* A drawn plan of the walk, because a guest holding a phone in the sun reads
     a picture faster than a paragraph. */
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

function videoBlock({ src, poster, label, alt, portrait }) {
  return `<div class="vid${portrait ? ' portrait' : ''}" data-video>
        <video preload="none" playsinline poster="%%${poster}%%" aria-label="${esc(alt)}">
          <source src="%%${src}%%" type="video/mp4">
        </video>
        <button class="play" type="button" aria-label="Play: ${esc(alt)}">
          <span class="disc">${svg('play')}</span>
          <span class="lbl">${esc(label)}</span>
        </button>
      </div>`;
}

function build(c, siblings) {
  const [lat, lon] = c.geo;
  const maps = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  const embed = `https://maps.google.com/maps?q=${lat},${lon}&z=16&hl=en&output=embed`;
  const wa = `https://wa.me/${WA_HREF}?text=${encodeURIComponent('Hello, I need a doctor at ' + c.hotel + '.')}`;

  /* ------------------------------------------------------------- sections */

  const steps = c.route || [
    ['Call or send us a WhatsApp message.', 'Tell us your room number and what is wrong.'],
    ['Or come to the clinic yourself.', `Reception at ${c.hotelShort} will point you to 24/7 Clinic.`],
    ['No appointment, any hour.', 'A doctor sees you when you arrive.'],
  ];

  const stepList = `<ol class="steps">${steps
    .map(([t, n]) => `<li><b>${esc(t)}</b><em>${esc(n)}</em></li>`)
    .join('')}</ol>`;

  const findVisual = c.route
    ? routeDiagram(c)
    : `<figure class="mapbox" style="margin-top:0">
            <img src="%%${c.hero}%%" alt="${esc(c.heroAlt)}" loading="lazy" width="1200" height="720">
            <figcaption>Inside the clinic that serves ${esc(c.hotelShort)}.</figcaption>
          </figure>`;

  const walk = c.walkVideo
    ? videoBlock({
        src: 'C7WALK',
        poster: 'C7WALKPOSTER',
        label: 'Watch the walk from the hotel entrance',
        alt: `Film showing the walk from the main entrance of ${c.hotel} to the 24/7 Clinic`,
        portrait: true,
      })
    : '';

  const services = SERVICES.map(
    ([k, name, note]) =>
      `<div class="svc"><div class="i">${svg(SERVICE_ICON[k])}</div><h3>${esc(name)}</h3><p>${esc(note)}</p></div>`
  ).join('');

  const dental = c.dentalList
    ? `<section>
    <div class="wrap">
      <div class="kicker">Dental</div>
      <h2>A dental room, in the resort</h2>
      <p class="note">Toothache does not wait for the flight home. This clinic treats emergencies and routine work, and has its own dental x-ray.</p>
      <div class="dental">
        <img src="%%C7DENTAL%%" alt="The dental treatment room at the 24/7 Clinic in ${esc(c.area)}" loading="lazy" width="1200" height="720">
        <ul class="ticks">${c.dentalList.map((d) => `<li>${svg('check')}<span>${esc(d)}</span></li>`).join('')}</ul>
      </div>
    </div>
  </section>`
    : '';

  const posters = c.posterOrder
    .map((i) => POSTERS[i])
    .map(
      ([tok, alt, title, note]) =>
        `<figure><img src="%%${tok}%%" alt="${esc(alt)}" loading="lazy" width="720" height="960"><figcaption><b>${esc(title)}</b><span>${esc(note)}</span></figcaption></figure>`
    )
    .join('');

  const stories = STORIES.map(
    ([src, poster, who, what, portrait]) => `<div class="story">
          ${videoBlock({ src, poster, label: 'Watch their story', alt: who + ' talking about their treatment at 24/7 Clinic', portrait })}
          <div class="cap"><b>${esc(who)}</b><span>${esc(what)}</span></div>
        </div>`
  ).join('');

  const areaKey = Object.keys(NETWORK_AREAS).find((k) => NETWORK_AREAS[k].includes(c.hotelShort));
  const areas = Object.entries(NETWORK_AREAS)
    .map(
      ([name, hotels]) => `<div class="area${name === areaKey ? ' here' : ''}">
          <h3>${esc(name)}${name === areaKey ? '<span class="here-tag">You are here</span>' : ''}</h3>
          <ul>${hotels.map((h) => `<li${h === c.hotelShort ? ' class="self"' : ''}>${esc(h)}</li>`).join('')}</ul>
        </div>`
    )
    .join('');

  const initials = (n) => n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const reviews = c.reviews
    .map((k) => REVIEWS[k])
    .map(
      ([name, country, lang, quote, english]) => `<figure class="rev-card">
          <blockquote class="q" lang="${lang}">&ldquo;${esc(quote)}&rdquo;</blockquote>
          <p class="t"><b>In English</b>${esc(english)}</p>
          <figcaption class="who"><span class="av" aria-hidden="true">${esc(initials(name))}</span><span><span class="nm">${esc(name)}</span><span class="cn">${esc(country)}</span></span></figcaption>
        </figure>`
    )
    .join('');

  const faqSource = [
    [
      `Is there a doctor at ${c.hotelShort}?`,
      `Yes. 24/7 Clinic ${c.route ? 'is in the hotel grounds' : 'serves guests of the resort'}. Call, send a WhatsApp message, or walk in.`,
    ],
    ['Are you open at night?', 'Yes. The clinic is open 24 hours, every day of the year. Call the number on this page at any hour.'],
    [
      'Do you speak English?',
      'Yes. Our doctors see international guests every day, and guests have been treated and answered in German, Italian and French as well.',
    ],
    [
      'Do you take my travel insurance?',
      'We handle the paperwork with your insurer and write the medical report your claim needs. Bring your policy details or your insurance card when you come.',
    ],
    [
      'What does a visit cost?',
      'The blood pressure and blood sugar check is free for hotel guests. For anything else, call and we will tell you the cost before you come.',
    ],
    ['Can I get a medical report for my insurance?', 'Yes. A written report is prepared at the clinic, in English, before you fly home.'],
    [
      `Is there a hospital near ${c.area}?`,
      'Yes. If you need a hospital we arrange the ambulance and the referral. 24/7 Clinic is part of Healthcare International Group, which runs its own hospitals on the Red Sea coast.',
    ],
    ...c.faqExtra,
  ];

  const faqs = faqSource
    .map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a">${esc(a)}</div></details>`)
    .join('');

  const sibs = siblings
    .map((s) => `<li><a href="/247clinic/hotel-landing-pages/${s.slug}">${esc(s.hotelShort)}, ${esc(s.area)}</a></li>`)
    .join('');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        '@id': `https://www.247clinic.net${c.url}#clinic`,
        name: `24/7 Clinic, ${c.hotel}`,
        url: `https://www.247clinic.net${c.url}`,
        telephone: PHONE,
        image: 'https://www.247clinic.net/assets/images/logos/clinic-logo.svg',
        parentOrganization: { '@type': 'Organization', name: '24/7 Clinic', url: 'https://www.247clinic.net' },
        address: {
          '@type': 'PostalAddress',
          addressLocality: c.area,
          addressRegion: 'Red Sea Governorate',
          addressCountry: 'EG',
        },
        geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lon },
        areaServed: [
          { '@type': 'Place', name: c.hotel },
          { '@type': 'Place', name: c.area },
        ],
        availableLanguage: ['English', 'German', 'Italian', 'French'],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59',
          },
        ],
        availableService: SERVICES.map(([, name]) => ({ '@type': 'MedicalTherapy', name })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqSource.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
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

  return `<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}">
<link rel="canonical" href="https://www.247clinic.net${c.url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
<style>${CSS}</style>

<script>document.documentElement.className += ' js';</script>

<a class="skip" href="#find">Skip to the clinic details</a>

<header class="top">
  <div class="top-in">
    <a class="brand" href="https://www.247clinic.net" rel="noopener"><img src="%%C7LOGO%%" alt="24/7 Clinic" width="200" height="193"></a>
    <span class="sp"></span>
    <a class="call" href="tel:${PHONE_HREF}" data-ev="call_click">${svg('phone')}Call</a>
  </div>
</header>

<main>
  <div class="hero">
    <img class="hero-img" src="%%${c.hero}%%" alt="${esc(c.heroAlt)}" width="1200" height="720" fetchpriority="high" decoding="async">
    <div class="hero-scrim"></div>
    <div class="hero-in">
      <span class="eyebrow">${svg('pin')}${esc(c.area)} · ${esc(c.placement)}</span>
      <h1>${esc(c.h1)}</h1>
      <p class="stand">${esc(c.standfirst)}</p>
      <div class="acts">
        <a class="act act-call" href="tel:${PHONE_HREF}" data-ev="call_click">${svg('phone')}Call now <span class="num">${PHONE}</span></a>
        <a class="act act-wa" href="${wa}" target="_blank" rel="noopener" data-ev="whatsapp_click">${svg('wa')}WhatsApp</a>
        <a class="act act-map" href="#find" data-ev="directions_click">${svg('pin')}Find the clinic</a>
      </div>
      <div class="trust">
        <span>${svg('check')}${esc(c.placement)}</span>
        <span>${svg('check')}Open 24 hours</span>
        <span>${svg('check')}Insurance handled</span>
      </div>
    </div>
  </div>

  <div class="offer">
    <div class="offer-in">
      <b>Free health check for hotel guests</b>
      <span>Blood pressure and blood sugar, no appointment needed.</span>
    </div>
  </div>

  <div class="proof">
    <div class="proof-in">
      <div><div class="n">Since ${SINCE}</div><div class="l">Caring for guests in Egypt</div></div>
      <div><div class="n">${NETWORK} clinics</div><div class="l">Across Egypt's resort coasts</div></div>
      <div><div class="n">Insurance</div><div class="l">Paperwork handled for you</div></div>
    </div>
  </div>

  <section id="find">
    <div class="wrap">
      <div class="kicker">Where to find us</div>
      <h2>Getting to the clinic</h2>
      <p class="note">${c.route ? 'The walk from the main entrance takes you along the outside of the building. It is short and flat.' : `The clinic serves guests of ${esc(c.hotelShort)} around the clock. Call first and we will meet you.`}</p>
      <div class="find">
        <div>
          ${stepList}
          <a class="mapbtn" href="${maps}" target="_blank" rel="noopener" data-ev="directions_click">${svg('pin')}Directions in Google Maps</a>
          ${walk}
        </div>
        <div>
          ${findVisual}
          <figure class="mapbox">
            <div class="frame" style="background-image:url(%%${c.mapImg}%%)">
              <iframe src="${embed}" title="Google map of the 24/7 Clinic at ${esc(c.hotel)}, ${esc(c.area)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <figcaption>24/7 Clinic, ${esc(c.hotel)}, ${esc(c.area)}, ${esc(c.region)}.</figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="kicker">Inside the clinic</div>
      <h2>See it before you come</h2>
      <p class="note">The reception, the treatment rooms, the observation beds and the doctors who will see you.</p>
      ${videoBlock({
        src: 'C7FILM',
        poster: 'C7FILMPOSTER',
        label: 'Watch the clinic film',
        alt: 'Film of the 24/7 Clinic: reception, consultation, observation room and dental room',
        portrait: false,
      })}
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="kicker">Guest stories</div>
      <h2>Guests who came in, and what happened next</h2>
      <p class="note">Filmed at the clinic, in their own words.</p>
      <div class="stories">${stories}</div>
    </div>
  </section>

  <section>
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
      <div class="kicker">Now at 24/7 Clinic</div>
      <h2>What is running this season</h2>
      <p class="note">Swipe through what the clinics are offering.</p>
      <div class="car" data-carousel>
        <div class="car-track" tabindex="0" role="region" aria-label="24/7 Clinic offers and services">${posters}</div>
        <div class="car-nav">
          <button type="button" data-prev aria-label="Previous">${svg('left')}</button>
          <button type="button" data-next aria-label="Next">${svg('right')}</button>
          <span class="car-dots" data-dots aria-hidden="true"></span>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="kicker">What guests say</div>
      <h2>In their own words</h2>
      <p class="note">Guests write to us in German, Italian and French, and are answered in them. <span class="vchip">${svg('check')}Published guest reviews</span></p>
      <div class="revs">${reviews}</div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="kicker">For international guests</div>
      <h2>You are far from home, not far from help</h2>
      <div class="cards">
        <div class="card"><div class="i">${svg('globe')}</div><h3>Your language</h3><p>English is spoken at every clinic. Guests have been treated and answered in German, Italian and French.</p></div>
        <div class="card"><div class="i">${svg('shield')}</div><h3>Your insurer</h3><p>We deal with the paperwork so you do not have to do it on holiday.</p></div>
        <div class="card"><div class="i">${svg('doc')}</div><h3>Your claim</h3><p>A written medical report in English, prepared before you fly home.</p></div>
      </div>
      <div class="hosp">
        <div class="i">${svg('hospital')}</div>
        <div>
          <h3>If you need a hospital</h3>
          <p class="note">We arrange the ambulance and the referral. 24/7 Clinic is part of Healthcare International Group, which runs its own hospitals on the Red Sea coast, so the handover happens inside one group rather than between strangers.</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="kicker">Across the Red Sea</div>
      <h2>Clinics in ${NETWORK} hotels and resorts</h2>
      <p class="note">If you move hotel, or a friend is staying somewhere else on the coast, there is very likely a 24/7 Clinic there too.</p>
      <div class="areas">${areas}</div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="kicker">Hours and contact</div>
      <h2>Reaching us</h2>
      <div class="contact">
        <div class="crow"><div class="k">Open</div><div class="v">24 hours</div><small>Every day of the year.</small></div>
        <div class="crow"><div class="k">Call or WhatsApp</div><div class="v"><a href="tel:${PHONE_HREF}" data-ev="call_click">${PHONE}</a></div><small>Answered around the clock.</small></div>
        <div class="crow"><div class="k">Where</div><div class="v">${esc(c.hotelShort)}</div><small>${esc(c.area)}, ${esc(c.region)}.</small></div>
      </div>
    </div>
  </section>

  <section>
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
        <img src="%%C7LOGO%%" alt="24/7 Clinic" width="200" height="193">
        <p class="fnote">24/7 Urgent Care Clinic. Travel medical services for international guests in Egypt, part of Healthcare International Group.</p>
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
      <span>Open 24 hours · ${PHONE}</span>
    </div>
  </div>
</footer>

<nav class="dock" aria-label="Contact">
  <a class="d-call" href="tel:${PHONE_HREF}" data-ev="call_click">${svg('phone')}Call</a>
  <a class="d-wa" href="${wa}" target="_blank" rel="noopener" data-ev="whatsapp_click">${svg('wa')}WhatsApp</a>
</nav>

<script type="application/ld+json">${JSON.stringify(schema)}</script>
<script>
(function () {
  var HOTEL = ${JSON.stringify(c.hotelShort)}, AREA = ${JSON.stringify(c.area)};

  /* Every contact tap is an event carrying the hotel and the area, so one
     report compares all the clinics side by side. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ev]');
    if (!a) return;
    if (window.gtag) window.gtag('event', a.dataset.ev, { hotel: HOTEL, area: AREA, link: a.getAttribute('href') });
  });

  /* Video stays at zero bytes until someone asks for it. */
  document.querySelectorAll('[data-video]').forEach(function (box) {
    var v = box.querySelector('video');
    box.querySelector('.play').addEventListener('click', function () {
      box.classList.add('playing');
      v.controls = true;
      v.play();
      v.focus();
    });
    v.addEventListener('pause', function () {
      if (v.currentTime === 0) box.classList.remove('playing');
    });
  });

  /* Posters: snap scrolling, with arrows and dots for anyone not swiping. */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.car-track');
    var prev = car.querySelector('[data-prev]');
    var next = car.querySelector('[data-next]');
    var dots = car.querySelector('[data-dots]');
    var items = track.children;
    for (var i = 0; i < items.length; i++) dots.appendChild(document.createElement('i'));
    function step() { return items[0] ? items[0].getBoundingClientRect().width + 12 : 300; }
    function sync() {
      var i = Math.round(track.scrollLeft / step());
      for (var k = 0; k < dots.children.length; k++) dots.children[k].classList.toggle('on', k === i);
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 4;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* The route draws itself and the steps arrive once, when they scroll in. */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.route-svg, ol.steps').forEach(function (el) { io.observe(el); });
    /* Failsafe: nothing stays invisible because an observer never fired. */
    window.setTimeout(function () {
      document.querySelectorAll('.route-svg:not(.in), ol.steps:not(.in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add('in');
      });
    }, 1500);
  } else {
    document.querySelectorAll('.route-svg, ol.steps').forEach(function (el) { el.classList.add('in'); });
  }
})();
</script>
`;
}

/* ------------------------------------------------------------------- write */

let n = 0;
for (const c of CLINICS) {
  const siblings = CLINICS.filter((o) => o.slug !== c.slug);
  fs.writeFileSync(path.join(SRC, `247-lp-${c.slug}.html`), build(c, siblings));
  n += 1;
  console.log(`  src/247-lp-${c.slug}.html   ${c.hotelShort}`);
}
console.log(`\n  ${n} landing pages from one template.\n`);
