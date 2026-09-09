/**
 * 24/7 Clinic landing pages: the shared content.
 *
 * Three designs read from this one file, so the words, the numbers, the
 * coordinates and the images can only ever be right or wrong once. A design is
 * a way of showing this content, never a second copy of it.
 *
 * IMAGE RULE, set by him 2026-09-09: never take a still out of the films.
 * Images come from their own library on 247clinic.net, their own posters, or
 * Pexels (see `scripts/pexels.js` and `src/assets/CREDITS.md`). Video is used
 * as video.
 */

const PHONE = '+20 122 222 8247';
const PHONE_HREF = '+201222228247';
const WA_HREF = '201222228247';

/* Their own figures, quoted from their own home page. */
const SINCE = '2001';
const NETWORK = '28';

/* Six ways in, one line each. Phrased as the guest's problem, not as a service
   catalogue. The MedPark "how can we help" pattern. */
const HELP = [
  ['ambulance', 'Emergency', 'A bad fall, chest pain, a diving accident. Call and come straight in.'],
  ['stethoscope', 'I feel unwell', 'Fever, stomach upset, sunburn, an ear infection. Walk in, any hour.'],
  ['tooth', 'Dental', 'Toothache and emergencies, treated here with a dental x-ray.'],
  ['drip', 'IV infusion', 'Given at the clinic, under a doctor.'],
  ['pill', 'Medication and lab', 'Prescribed and dispensed here. Samples taken here.'],
  ['shield', 'Insurance and reports', 'We deal with your insurer and write the report for your claim.'],
];

const FLAG = {
  Germany: 'C7FLAGDE',
  Italy: 'C7FLAGIT',
  Switzerland: 'C7FLAGCH',
  'Czech Republic': 'C7FLAGCZ',
  France: 'C7FLAGFR',
  Poland: 'C7FLAGPL',
  Romania: 'C7FLAGRO',
  Scotland: 'C7FLAGGB',
};

/* Guest reviews published by 24/7 Clinic on their own site, quoted exactly.
   The English line under each is a translation and is labelled as one. */
const REVIEWS = {
  finger: ['Joerg Finger', 'Germany', 'de', 'Sehr freundlicher und kompetenter Arzt. Sehr schnelle Hilfe ich fühlte mich in guten Händen.', 'Very friendly and competent doctor. Very fast help. I felt I was in good hands.'],
  discanno: ['Carla di Scanno', 'Italy', 'it', 'Molto professionale Disponibile e paziente Problema risolto in poche ore', 'Very professional. Helpful and patient. Problem solved in a few hours.'],
  waltert: ['B Waltert', 'Switzerland', 'de', 'Der Arzt war sehr nett und kompetent. Gute Unterstützung durch den Arzt.', 'The doctor was very kind and very competent. Good support from the doctor.'],
  poindexter: ['Katarina Poindexter', 'Germany', 'de', 'Ich bin sehr zufrieden sie haben mir wirklich geholfen. Sehr gutes Team.', 'I am very satisfied. They really helped me. A very good team.'],
  offinger: ['Christa Offinger', 'Germany', 'de', 'Danke für die sachliche und freundliche Behandlung. Es war alles bestens.', 'Thank you for the straightforward and friendly treatment. Everything was excellent.'],
  cg: ['C.G.', 'Czech Republic', 'de', 'Guter medizinischer Service', 'Good medical service.'],
  kraver: ['Nicotr Kraver', 'Switzerland', 'de', 'Dr Mahmoud war ein sehr guter Arzt und konnte mir sehr gut helfen.', 'Dr Mahmoud was a very good doctor and was able to help me a great deal.'],
  henzel: ['Andria Henzel', 'Germany', 'de', 'Freundliche und schnelle Hilfe.', 'Friendly and fast help.'],
  fabien: ['Lavorsire Fabien', 'France', 'fr', 'Très bien, merci', 'Very good, thank you.'],
};

/* What is on at the clinics. The first is their own poster and is shown whole,
   never cropped. The rest are photographs. */
const OFFERS = [
  ['POSTERHEALTH', 'Free health check', 'Blood pressure and blood sugar, free for hotel guests. No appointment.', 'Free', true],
  ['PXFAMILY', 'A doctor for the family', 'Children seen the same day, by doctors used to seeing families.', '', false],
  ['PXROOM', 'We can come to your room', 'Too unwell to walk down? A doctor comes to you.', '', false],
  ['PXLAB', 'Laboratory and imaging', 'Samples taken here, results coordinated for you.', '', false],
  ['PXAMBULANCE', 'Ambulance and hospital', 'If you need a hospital, we arrange the transfer.', '', false],
];

/* The clinic's own films, as they were shot. Nothing re-encoded, no frame ever
   cut out of one. `portrait` is 720x1280, `landscape` is 1276x720. */
const STORIES = [
  ['VROMFAMILY', 'landscape', 'Romania', 'A family staying at Premier Le Rêve. Their son needed a tooth taken out.'],
  ['VSCOTLAND', 'portrait', 'Scotland', 'Debbie on how she was looked after at the clinic.'],
  ['VROMIV', 'portrait', 'Romania', 'Arrived feeling very unwell. Treated with an IV infusion.'],
  ['VSCOOTER', 'portrait', '', 'A scooter accident in Egypt, and the recovery that followed.'],
  ['VITALY', 'portrait', 'Italy', 'Staying at Almaza Bay, and grateful for the care.'],
  ['VPOLAND', 'landscape', 'Poland', 'Smiles know no borders.'],
  /* More guest films are coming. Add a line here, register the token in
     build.js, and every design picks it up. */
];

/* One team film per clinic. Each landing page shows its own, never a set. */

/* Filmed at this clinic, except the aesthetic one, which was filmed at Long
   Beach Resort. It is worded as a network service for that reason. */
const SERVICE_FILMS = [
  ['VDENTAL', 'Dental', 'Toothache and emergencies, treated at the clinic.'],
  ['VEMERGENCY', 'Emergency', 'Urgent care, day or night.'],
  ['VTOOTH', 'Tooth jewellery', 'Fitted at the clinic.'],
  ['VAESTHETIC', 'Aesthetic procedures', 'Offered across the 24/7 Clinic network.'],
];

function serviceFilms() {
  return SERVICE_FILMS.map(([token, title, note]) => `<figure class="car-item film">
        ${video({ token, shape: 'portrait', label: 'Watch' })}
        <figcaption><b>${esc(title)}</b><span>${esc(note)}</span></figcaption>
      </figure>`).join('');
}

const INSURERS = [
  ['C7INSADAC', 'ADAC'],
  ['C7INSSOS', 'International SOS'],
  ['C7INSMONDIAL', 'Mondial'],
  ['C7INSCONNECX', 'Connecx 24/7'],
];

const CLINICS = [
  {
    slug: 'le-reve',
    url: '/sahl-hasheesh/premier-le-reve-clinic',
    hotel: 'Premier Le Rêve Hotel & Spa',
    hotelShort: 'Premier Le Rêve',
    area: 'Sahl Hasheesh',
    region: 'Red Sea, Egypt',
    h1: 'Need a Doctor at Premier Le Rêve?',
    title: 'Doctor in Sahl Hasheesh | 24/7 Clinic at Premier Le Rêve',
    desc:
      'Need a doctor, a dentist or emergency care in Sahl Hasheesh? 24/7 Urgent Care Clinic ' +
      'in the grounds of Premier Le Rêve. Open 24 hours. Call or WhatsApp now.',
    lead: '24/7 Urgent Care Clinic, in the grounds of the hotel.',
    /* Checked against OpenStreetMap 2026-09-08. Their own database serves
       Long Beach Resort's coordinates for this clinic, 7.0 km north. */
    geo: [27.024343, 33.887027],
    mapImg: 'C7MAPLEREVE',
    /* Word for word from the clinic's own directions film. */
    steps: [
      'Arrive at Premier Le Rêve Hotel.',
      'Face the main entrance, then walk left along the outside of the building.',
      'Glass doors marked 24/7 Clinic. The pharmacy is next door.',
    ],
    teamFilm: 'VSTAFF1',
    walkLoop: true,
    reviews: ['finger', 'discanno', 'waltert'],
  },

  {
    slug: 'steigenberger',
    url: '/soma-bay/steigenberger-clinic',
    hotel: 'Steigenberger Resort Ras Soma',
    hotelShort: 'Steigenberger Ras Soma',
    area: 'Soma Bay',
    region: 'Red Sea, Egypt',
    h1: 'Need a Doctor at Steigenberger Ras Soma?',
    title: 'Doctor in Soma Bay | 24/7 Clinic at Steigenberger Ras Soma',
    desc:
      'Need a doctor or emergency care in Soma Bay? 24/7 Urgent Care Clinic serves guests of ' +
      'Steigenberger Resort Ras Soma. Open 24 hours. Call or WhatsApp now.',
    lead: '24/7 Urgent Care Clinic, serving the resort in Soma Bay.',
    geo: [26.863468, 33.961233],
    mapImg: 'C7MAPSTEIG',
    steps: [
      'Call or send a WhatsApp message with your room number.',
      'Or ask reception for the 24/7 Clinic.',
      'No appointment. A doctor sees you when you arrive.',
    ],
    teamFilm: 'VSTAFF2',
    walkLoop: false,
    reviews: ['offinger', 'cg', 'kraver'],
  },

  {
    slug: 'amwaj',
    url: '/abu-soma/amwaj-beach-club-clinic',
    hotel: 'Amwaj Beach Club Abu Soma',
    hotelShort: 'Amwaj Beach Club',
    area: 'Abu Soma',
    region: 'Red Sea, Egypt',
    h1: 'Need a Doctor at Amwaj Beach Club?',
    title: 'Doctor in Abu Soma | 24/7 Clinic at Amwaj Beach Club',
    desc:
      'Need a doctor or emergency care in Abu Soma? 24/7 Urgent Care Clinic serves guests of ' +
      'Amwaj Beach Club. Open 24 hours. Call or WhatsApp now.',
    lead: '24/7 Urgent Care Clinic, serving the resort in Abu Soma.',
    geo: [26.813385, 33.945688],
    mapImg: 'C7MAPAMWAJ',
    steps: [
      'Call or send a WhatsApp message with your room number.',
      'Or ask reception for the 24/7 Clinic.',
      'No appointment. A doctor sees you when you arrive.',
    ],
    teamFilm: 'VSTAFF3',
    walkLoop: false,
    reviews: ['henzel', 'fabien', 'poindexter'],
  },
];

/* ------------------------------------------------------------------ utils */

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Outline only, `currentColor`, one stroke weight, so the same file is legible
   on a red button, a pink tile and a dark background. */
const ICON = {
  phone: '<path d="M6.5 3.5h-2A1.5 1.5 0 0 0 3 5c0 8.8 7.2 16 16 16a1.5 1.5 0 0 0 1.5-1.5v-2a1.5 1.5 0 0 0-1.2-1.5l-3.1-.6a1.5 1.5 0 0 0-1.5.6l-.9 1.2a12.6 12.6 0 0 1-5.9-5.9l1.2-.9a1.5 1.5 0 0 0 .6-1.5l-.6-3.1a1.5 1.5 0 0 0-1.6-1.3Z"/>',
  wa: '<path d="M3.6 20.4 4.9 16.1A8.6 8.6 0 1 1 8 19.2Z"/><path d="M9 8.6c.3 0 .5.3.65.65l.45 1.05-.8.8a5.7 5.7 0 0 0 3.3 3.3l.8-.8 1.05.45c.35.15.65.35.65.65v.9c-.3.45-.9.6-1.5.45A8.6 8.6 0 0 1 8.1 10.6c-.15-.6 0-1.2.45-1.5Z"/>',
  pin: '<path d="M12 21.5c4.2-4.4 6.4-7.7 6.4-10.4a6.4 6.4 0 1 0-12.8 0c0 2.7 2.2 6 6.4 10.4Z"/><circle cx="12" cy="11" r="2.4"/>',
  stethoscope: '<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M4.6 3h2.8M12.6 3h2.8"/><path d="M10 15.6v1.2a3.6 3.6 0 0 0 7.2 0V14"/><circle cx="17.2" cy="12" r="2.2"/>',
  tooth: '<path d="M7.2 3.6c1.9 0 2.5 1 4.8 1s2.9-1 4.8-1 2.3 2.2 1.7 5.3c-.6 3.1-1.4 12-3.3 12-1.5 0-1.2-4.6-3.2-4.6s-1.7 4.6-3.2 4.6c-1.9 0-2.7-8.9-3.3-12C4.9 5.8 5.3 3.6 7.2 3.6Z"/>',
  drip: '<path d="M12 3v5.5"/><path d="M9.2 8.5h5.6l-.8 10.2a2 2 0 0 1-2 1.8 2 2 0 0 1-2-1.8Z"/><path d="M9.6 13.6h4.8"/>',
  pill: '<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M12 9v6"/>',
  shield: '<path d="M12 3 19 6v6c0 4.3-3 7.5-7 8.8C8 19.5 5 16.3 5 12V6Z"/><path d="m9.2 12.2 2.1 2.1L15 10.6"/>',
  ambulance: '<path d="M2.6 6.6h11v10h-11z"/><path d="M13.6 10h3.6l3.8 3.4v3.2h-7.4"/><circle cx="7" cy="18.4" r="1.9"/><circle cx="17.2" cy="18.4" r="1.9"/><path d="M6.4 11.2h3M7.9 9.7v3"/>',
  clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2v5.1l3.3 1.9"/>',
  globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 9.6h16.8M3.6 14.4h16.8M12 3.4c2.4 2.6 3.6 5.5 3.6 8.6s-1.2 6-3.6 8.6c-2.4-2.6-3.6-5.5-3.6-8.6s1.2-6 3.6-8.6Z"/>',
  play: '<circle cx="12" cy="12" r="9.2"/><path d="M10 8.4 16 12l-6 3.6z"/>',
  left: '<path d="M15 5.5 8.5 12l6.5 6.5"/>',
  right: '<path d="M9 5.5 15.5 12 9 18.5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  mute: '<path d="M4 9.4h3.4L12 5.4v13.2l-4.6-4H4z"/><path d="m16.4 9.6 4.2 4.8M20.6 9.6l-4.2 4.8"/>',
  check: '<path d="m4.6 12.4 5 5 9.8-10.8"/>',
  arrow: '<path d="M5 12h13M12.6 6.2 18.4 12l-5.8 5.8"/>',
  expand: '<path d="M9 3.6H3.6V9M15 3.6h5.4V9M9 20.4H3.6V15M15 20.4h5.4V15"/>',
  heart: '<path d="M12 20.4S3.8 15.2 3.8 9.6A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 8.2 2.2c0 5.6-8.2 10.8-8.2 10.8Z"/>',
  gauge: '<path d="M4.4 17.4a8.6 8.6 0 1 1 15.2 0"/><path d="m12 13.6 3.4-3.6"/><circle cx="12" cy="17.4" r="1.6"/>',
};

function svg(name, cls) {
  return `<svg class="${cls || 'ico'}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[name]}</svg>`;
}

/* Shared, because a wrong FAQ answer in one design and a right one in another
   is exactly the drift this file exists to prevent. */
function faqFor(c) {
  return [
    [`Is there a doctor at ${c.hotelShort}?`, 'Yes, and you do not need an appointment. Call, send a WhatsApp message, or walk in.'],
    ['Are you open at night?', 'Yes. The clinic is open 24 hours, every day of the year.'],
    ['Do you speak English?', 'Yes. Guests have also been treated and answered in German, Italian and French.'],
    ['Do you take my travel insurance?', 'We deal with your insurer and write the medical report your claim needs. Bring your policy details or your insurance card.'],
    [`Is there a hospital near ${c.area}?`, 'If you need a hospital we arrange the ambulance and the referral. 24/7 Clinic is part of Healthcare International Group, which runs its own hospitals on the Red Sea coast.'],
  ];
}

function schemaFor(c) {
  const [lat, lon] = c.geo;
  return {
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
        address: { '@type': 'PostalAddress', addressLocality: c.area, addressRegion: 'Red Sea Governorate', addressCountry: 'EG' },
        geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lon },
        areaServed: [{ '@type': 'Place', name: c.hotel }, { '@type': 'Place', name: c.area }],
        availableLanguage: ['English', 'German', 'Italian', 'French'],
        openingHoursSpecification: [{
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00', closes: '23:59',
        }],
        availableService: HELP.map(([, name]) => ({ '@type': 'MedicalTherapy', name })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqFor(c).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
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
}

function links(c) {
  const [lat, lon] = c.geo;
  return {
    maps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
    embed: `https://maps.google.com/maps?q=${lat},${lon}&z=16&hl=en&output=embed`,
    wa: `https://wa.me/${WA_HREF}?text=${encodeURIComponent('Hello, I need a doctor at ' + c.hotel + '.')}`,
    tel: `tel:${PHONE_HREF}`,
  };
}

/**
 * One video component for all three designs.
 *
 * Nothing downloads until the film scrolls into view: the `src` lives in
 * `data-src` and the player only gets it when the observer fires. Then it plays
 * muted and loops, which browsers allow, and pauses again when it scrolls away.
 * Sound and full screen are opt in.
 *
 * These are the clinic's own files at their own resolution, so a page with a
 * dozen of them would be 60 MB if they all loaded. This is why they do not.
 */
function stories() {
  return STORIES.map(([token, shape, country, cap]) => `<figure class="car-item story">
        ${video({ token, shape, card: 'portrait', label: 'Watch story' })}
        <figcaption>
          ${country ? `<span class="cc"><img src="%%${FLAG[country]}%%" alt="" width="20" height="14">${esc(country)}</span>` : ''}
          <span class="cap">${esc(cap)}</span>
        </figcaption>
      </figure>`).join('');
}

/**
 * One video component for all three designs.
 *
 * `shape` is the film's real aspect and it stays on the element, so the viewer
 * can open the film in its own shape. `card` is the shape the card is drawn in,
 * which may differ: the story rail draws every card portrait for a tidy row and
 * fills a landscape film to it. Nothing is lost, because Watch opens it whole.
 */
function video({ token, shape = 'portrait', card, tag, label = 'Watch video', autoplay = true, cls = '' }) {
  const c = card || shape;
  return `<div class="v v--${c === 'portrait' ? 'p' : 'l'} ${cls}" data-v data-shape="${shape}" data-src="%%${token}%%">
        <video muted loop playsinline preload="none"${autoplay ? ' data-auto' : ''} data-src="%%${token}%%"${tag ? ` aria-label="${esc(tag)}"` : ''}></video>
        ${tag ? `<span class="v-tag">${esc(tag)}</span>` : ''}
        <button type="button" class="v-watch" data-vwatch>${svg('play')}${esc(label)}</button>
        <button type="button" class="v-mute" data-vsound aria-label="Turn sound on">${svg('mute')}</button>
      </div>`;
}

/**
 * One carousel, used by the guest stories, the service films and the offers.
 *
 * Mobile first: one card and a peek of the next on a phone, so a thumb knows
 * there is more. Arrows sit on the rail edges at every width because a guest on
 * a laptop does not think to drag. It advances on its own and stops the moment
 * anyone touches it, hovers it, focuses inside it, or unmutes a film in it.
 */
function carousel({ items, label, size = 'md', auto = true, cls = '' }) {
  return `<div class="car car--${size} ${cls}" data-car${auto ? ' data-car-auto' : ''}>
        <div class="car-track" tabindex="0" role="region" aria-label="${esc(label)}">${items}</div>
        <button class="car-arrow car-arrow--prev" type="button" data-car-prev aria-label="Previous">${svg('left')}</button>
        <button class="car-arrow car-arrow--next" type="button" data-car-next aria-label="Next">${svg('right')}</button>
        <div class="car-foot">
          <span class="car-dots" data-car-dots aria-hidden="true"></span>
          <span class="car-count" data-car-count></span>
        </div>
      </div>`;
}

/**
 * Reveal on scroll, built so it CANNOT hide content.
 *
 * The earlier version put `opacity:0` behind a `js` class and relied on a
 * separate observer to put it back. When that observer was refactored away,
 * every heading, every icon and three whole sections of design 2 stayed
 * invisible and the page looked broken.
 *
 * Now the hiding is behind `reveal-on`, which this script adds to <html>
 * itself. No script, no hiding. There is also a two second failsafe that
 * reveals everything regardless.
 */
const REVEAL_CSS = `
@media (prefers-reduced-motion:no-preference){
  .reveal-on [data-rise]{opacity:0;transform:translateY(20px)}
  [data-rise].in{opacity:1;transform:none;transition:opacity .55s var(--ez,ease),transform .55s var(--ez,ease)}
  .reveal-on [data-way] .ico path,.reveal-on [data-way] .ico circle,.reveal-on [data-way] .ico rect{
    stroke-dasharray:120;stroke-dashoffset:120}
  [data-way].in .ico path,[data-way].in .ico circle,[data-way].in .ico rect{animation:drawIcon .9s var(--ez,ease) forwards}
  @keyframes drawIcon{to{stroke-dashoffset:0}}
}
`;

const REVEAL_JS = `
(function () {
  var targets = document.querySelectorAll('[data-rise], [data-way]');
  if (!targets.length) return;
  function showAll() { targets.forEach(function (el) { el.classList.add('in'); }); }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    showAll();
    return;
  }
  document.documentElement.classList.add('reveal-on');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e, i) {
      if (!e.isIntersecting) return;
      var el = e.target;
      window.setTimeout(function () { el.classList.add('in'); }, (i % 4) * 70);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(function (el) { io.observe(el); });

  /* Failsafe. Nothing stays invisible because an observer misfired. */
  window.setTimeout(showAll, 2000);
})();
`;

const CAROUSEL_CSS = `
.car{position:relative}
.story figcaption,.film figcaption{margin-top:14px}
.story .cc{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink3)}
.story .cc img{width:20px;height:auto;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.12)}
.story .cap{display:block;margin-top:6px;font-size:15.5px;line-height:1.5;color:var(--ink2)}
.film b{display:block;font-size:17px;font-weight:600}
.film span{display:block;margin-top:4px;font-size:14.5px;color:var(--ink2);line-height:1.5}
.car-track{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;
  padding:4px 0 10px;scroll-padding-left:0}
.car-track::-webkit-scrollbar{display:none}
.car-item{flex:0 0 78%;scroll-snap-align:start;min-width:0}
@media(min-width:640px){.car-item{flex-basis:46%}}
@media(min-width:1040px){.car--md .car-item{flex-basis:30.5%}
  .car--sm .car-item{flex-basis:23%}}
.car-arrow{position:absolute;top:calc(50% - 46px);z-index:3;width:48px;height:48px;border-radius:50%;
  border:1px solid var(--line);background:rgba(255,255,255,.94);color:var(--ink);cursor:pointer;
  display:grid;place-items:center;backdrop-filter:blur(8px);
  box-shadow:0 8px 24px -10px rgba(20,18,16,.4);transition:.2s var(--ez,ease)}
.car-arrow:hover:not([disabled]){background:var(--red);color:#fff;border-color:var(--red)}
.car-arrow[disabled]{opacity:0;pointer-events:none}
.car-arrow--prev{left:-6px}
.car-arrow--next{right:-6px}
@media(min-width:1040px){.car-arrow{width:54px;height:54px}.car-arrow--prev{left:-26px}.car-arrow--next{right:-26px}}
.car-foot{display:flex;align-items:center;gap:14px;margin-top:16px}
.car-dots{display:flex;gap:7px}
.car-dots i{width:8px;height:8px;border-radius:50%;background:var(--line2);cursor:pointer;transition:.25s var(--ez,ease)}
.car-dots i.on{background:var(--red);width:26px;border-radius:4px}
.car-count{font-size:14px;color:var(--ink3);font-variant-numeric:tabular-nums;margin-left:auto}
`;

const CAROUSEL_JS = `
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-car]').forEach(function (car) {
    var track = car.querySelector('.car-track');
    var prev = car.querySelector('[data-car-prev]');
    var next = car.querySelector('[data-car-next]');
    var dots = car.querySelector('[data-car-dots]');
    var count = car.querySelector('[data-car-count]');
    var items = track.children;
    var timer = null, stopped = false;

    for (var i = 0; i < items.length; i++) {
      var d = document.createElement('i');
      d.dataset.i = i;
      dots.appendChild(d);
    }

    function nearest() {
      var best = 0, bd = Infinity;
      for (var i = 0; i < items.length; i++) {
        var d = Math.abs(items[i].offsetLeft - track.scrollLeft);
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    }
    function to(i) {
      i = Math.min(items.length - 1, Math.max(0, i));
      track.scrollTo({ left: items[i].offsetLeft, behavior: 'smooth' });
    }
    function sync() {
      var i = nearest(), max = track.scrollWidth - track.clientWidth;
      for (var k = 0; k < dots.children.length; k++) dots.children[k].classList.toggle('on', k === i);
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft > max - 8;
      if (count) count.textContent = (i + 1) + ' / ' + items.length;
    }
    function stop() {
      stopped = true;
      window.clearInterval(timer);
      timer = null;
    }
    function start() {
      if (reduce || stopped || timer || !car.hasAttribute('data-car-auto') || items.length < 2) return;
      timer = window.setInterval(function () {
        var max = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft > max - 8) track.scrollTo({ left: 0, behavior: 'smooth' });
        else to(nearest() + 1);
      }, 5200);
    }

    prev.addEventListener('click', function () { stop(); to(nearest() - 1); });
    next.addEventListener('click', function () { stop(); to(nearest() + 1); });
    dots.addEventListener('click', function (e) {
      if (e.target.dataset.i === undefined) return;
      stop();
      to(Number(e.target.dataset.i));
    });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync);

    /* Anything the visitor does stops it for good. Nothing is more annoying
       than a rail that slides away while you are reading it. */
    ['pointerdown', 'touchstart', 'wheel', 'focusin'].forEach(function (ev) {
      car.addEventListener(ev, stop, { passive: true });
    });
    car.addEventListener('mouseenter', function () { window.clearInterval(timer); timer = null; });
    car.addEventListener('mouseleave', start);

    sync();
    start();
  });
})();
`;

/* Shared CSS for that component. Each design sets its own radius and shadow. */
const VIDEO_CSS = `
.v{position:relative;overflow:hidden;background:#EFEBE7}
.v video{display:block;width:100%;height:100%;object-fit:cover;background:#EFEBE7}
.v--l{aspect-ratio:16/9}
.v--p{aspect-ratio:9/16}
.v-tag{position:absolute;left:12px;top:12px;font-size:12.5px;font-weight:600;color:#141210;
  background:rgba(255,255,255,.92);padding:6px 12px;border-radius:999px;backdrop-filter:blur(6px);pointer-events:none}
.v-watch{position:absolute;left:12px;bottom:12px;display:inline-flex;align-items:center;gap:8px;border:0;cursor:pointer;
  background:#fff;color:#C00000;font-weight:600;font-size:14px;padding:10px 16px;border-radius:999px;
  box-shadow:0 6px 20px -6px rgba(0,0,0,.32);transition:transform .18s,background-color .18s,color .18s}
.v-watch .ico{width:17px;height:17px}
.v-watch:hover{transform:translateY(-2px);background:#C00000;color:#fff}
.v-mute{position:absolute;right:12px;bottom:12px;width:40px;height:40px;border-radius:50%;border:0;cursor:pointer;
  background:rgba(255,255,255,.92);color:#141210;display:grid;place-items:center;backdrop-filter:blur(6px)}
.v-mute:hover{background:#fff}
.v-mute .ico{width:18px;height:18px}
.v-load{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
.v-load:after{content:"";width:26px;height:26px;border-radius:50%;border:2.5px solid rgba(20,18,16,.16);
  border-top-color:#C00000;animation:vspin .8s linear infinite}
.v.ready .v-load{display:none}
@keyframes vspin{to{transform:rotate(360deg)}}

/* The viewer. A frosted white scrim, never a black one, and a box that takes
   the film's own shape, so a portrait film is never pillarboxed. */
.vlb{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:20px}
.vlb[hidden]{display:none}
.vlb__scrim{position:absolute;inset:0;background:rgba(250,248,246,.94);backdrop-filter:blur(14px)}
.vlb__box{position:relative;z-index:1;background:#EFEBE7;border-radius:18px;overflow:hidden;
  box-shadow:0 40px 90px -30px rgba(20,18,16,.45)}
.vlb__box video{display:block;width:100%;height:100%;object-fit:contain;background:#EFEBE7}
.vlb[data-shape="portrait"] .vlb__box{height:min(86vh,860px);aspect-ratio:9/16;width:auto}
.vlb[data-shape="landscape"] .vlb__box{width:min(1100px,94vw);aspect-ratio:16/9;height:auto}
.vlb__close{position:absolute;top:14px;right:14px;z-index:2;width:46px;height:46px;border-radius:50%;border:0;
  cursor:pointer;background:#fff;color:#C00000;display:grid;place-items:center;box-shadow:0 8px 24px -8px rgba(20,18,16,.4)}
.vlb__close:hover{background:#C00000;color:#fff}
`;

/* One script for all three designs. */
const VIDEO_JS = `
(function () {
  var MUTED = '<path d="M4 9.4h3.4L12 5.4v13.2l-4.6-4H4z"/><path d="m16.4 9.6 4.2 4.8M20.6 9.6l-4.2 4.8"/>';
  var LOUD = '<path d="M4 9.4h3.4L12 5.4v13.2l-4.6-4H4z"/><path d="M15.6 9.6a3.4 3.4 0 0 1 0 4.8M18 7.2a6.8 6.8 0 0 1 0 9.6"/>';

  var lb = document.querySelector('[data-vlb]');
  var lbv = lb && lb.querySelector('video');
  var opener = null;

  function openLb(src, shape, from) {
    opener = from;
    lb.setAttribute('data-shape', shape);
    lbv.src = src;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lbv.muted = false;
    lbv.play();
    lb.querySelector('.vlb__close').focus();
  }
  function closeLb() {
    lbv.pause();
    lbv.removeAttribute('src');
    lbv.load();
    lb.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  if (lb) {
    lb.querySelectorAll('[data-vlb-close]').forEach(function (b) { b.addEventListener('click', closeLb); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  }

  document.querySelectorAll('[data-v]').forEach(function (box) {
    var v = box.querySelector('video');
    var load = document.createElement('span');
    load.className = 'v-load';
    box.appendChild(load);

    function attach() {
      if (v.src) return;
      v.src = v.dataset.src;
      v.addEventListener('loadeddata', function () { box.classList.add('ready'); }, { once: true });
    }

    var watch = box.querySelector('[data-vwatch]');
    if (watch && lb) {
      watch.addEventListener('click', function () {
        openLb(box.dataset.src, box.dataset.shape || 'portrait', watch);
      });
    }

    var sound = box.querySelector('[data-vsound]');
    if (sound) {
      sound.addEventListener('click', function () {
        attach();
        v.muted = !v.muted;
        if (!v.muted) v.play();
        this.setAttribute('aria-label', v.muted ? 'Turn sound on' : 'Turn sound off');
        this.querySelector('svg').innerHTML = v.muted ? MUTED : LOUD;
      });
    }

    if (!('IntersectionObserver' in window)) { attach(); v.play(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          attach();
          if (v.hasAttribute('data-auto')) { var pr = v.play(); if (pr) pr.catch(function () {}); }
        } else if (!v.paused && v.muted) {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    io.observe(box);
  });
})();
`;

/* The viewer markup. One per page, shared by every player on it. */
function viewer() {
  return `<div class="vlb" hidden data-vlb data-shape="portrait">
  <div class="vlb__scrim" data-vlb-close></div>
  <div class="vlb__box">
    <button class="vlb__close" type="button" data-vlb-close aria-label="Close">${svg('close')}</button>
    <video controls playsinline preload="none" aria-label="24/7 Clinic film"></video>
  </div>
</div>`;
}


/* Every design ships the same three events with the same parameters, so one
   GA4 report can compare designs as well as clinics. */
function tracking(c) {
  return `<script>
(function () {
  var HOTEL = ${JSON.stringify(c.hotelShort)}, AREA = ${JSON.stringify(c.area)};
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ev]');
    if (a && window.gtag) window.gtag('event', a.dataset.ev, { hotel: HOTEL, area: AREA, link: a.getAttribute('href') });
  });
})();
</script>`;
}

module.exports = {
  PHONE, PHONE_HREF, WA_HREF, SINCE, NETWORK,
  HELP, FLAG, REVIEWS, OFFERS, INSURERS, CLINICS, ICON,
  STORIES, SERVICE_FILMS,
  esc, svg, faqFor, schemaFor, links, tracking,
  video, stories, serviceFilms, viewer, carousel,
  VIDEO_CSS, VIDEO_JS, CAROUSEL_CSS, CAROUSEL_JS, REVEAL_CSS, REVEAL_JS,
};
