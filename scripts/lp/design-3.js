/**
 * Design 3: Editorial motion.
 *
 * Rebuilt from scratch. The old design 3 opened with a serif headline and four
 * rows of text, and pushed the film below the fold, so next to designs 1 and 2
 * it read like a brochure rather than a clinic you can walk into now.
 *
 * This one is the motion-led option. The page moves as you read it:
 *
 *   the film lies back and stands up as you scroll to it
 *   the map holds still while the walk runs past it
 *   the care cards arrive one after another, not all at once
 *   the insurers drift by and stop when you look at them
 *
 * All of it is the browser's own scroll-driven animation, from MOTION_CSS in
 * data.js. Framer Motion is React and these pages are static HTML, so there is
 * no library here and nothing to download. Every rule sits behind a support
 * query and a reduced-motion query, so a browser that does not do timelines
 * simply shows a still page, correctly.
 *
 * Still the calm one of the three: white ground, one sand alternate, thin rules
 * instead of heavy shadows, Calisto MT headlines per the brand guideline with
 * Georgia standing in where it is not installed.
 */

const D = require('./data');
const { esc, svg } = D;

const NAME = 'Editorial motion';
const NOTE = 'The film stands up as you scroll, the map holds while the walk runs past it, and the insurers drift.';

const CSS = `
:root{
  --red:#C00000; --red-d:#960000; --red-t:#FBF0EF; --red-l:#EBD3D1;
  --ink:#1A1614; --ink2:#57504C; --ink3:#8A817B;
  --bg:#FFFFFF; --sand:#FAF7F3; --sand2:#F2EDE6;
  --line:#E6DFD6; --line2:#CFC5B8;
  --wa:#25D366; --wa-deep:#128C7E;
  --f:"Poppins","Segoe UI",system-ui,-apple-system,Arial,sans-serif;
  --fh:"Calisto MT",Georgia,"Times New Roman",serif;
  --pill:999px; --r:6px;
  --ez:cubic-bezier(.22,.61,.36,1);
  --wrap:1140px;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f);font-size:16.5px;line-height:1.68;
  -webkit-font-smoothing:antialiased;overflow-x:clip}
h1,h2,h3{margin:0;font-family:var(--fh);font-weight:400;line-height:1.14;letter-spacing:-.008em;text-wrap:balance}
p,blockquote,figure{margin:0}
img,video,iframe,svg{max-width:100%;display:block}
a{color:inherit}
button{font:inherit;color:inherit}
a,button,summary{touch-action:manipulation}
:focus-visible{outline:2px solid var(--red);outline-offset:4px}
.ico{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.skip{position:absolute;left:-9999px;top:0;z-index:200;background:var(--red);color:#fff;padding:12px 18px;font-weight:600;text-decoration:none}
.skip:focus{left:0}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 22px}
@media(min-width:820px){.wrap{padding:0 40px}}

.tag{display:block;font-family:var(--fh);font-size:11.5px;letter-spacing:.26em;text-transform:uppercase;color:var(--ink3)}

/* ---------------------------------------------------------------- buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:54px;padding:0 26px;
  border:1px solid var(--ink);border-radius:var(--pill);cursor:pointer;font-weight:500;font-size:16px;text-decoration:none;
  background:transparent;color:var(--ink);transition:.22s var(--ez)}
.btn:hover{background:var(--ink);color:#fff}
.btn--red{background:var(--red);border-color:var(--red);color:#fff}
.btn--red:hover{background:var(--red-d);border-color:var(--red-d);color:#fff}
.btn--wa{background:var(--wa);border-color:var(--wa);color:#fff}
.btn--wa:hover{background:var(--wa-deep);border-color:var(--wa-deep);color:#fff}
.btn--watch{background:#fff;border-color:var(--red-l);color:var(--red)}
.btn--watch:hover{background:var(--red);border-color:var(--red);color:#fff}
.btn--sm{min-height:44px;font-size:14.5px;padding:0 18px}

/* ---------------------------------------------------------------- top bar */
.top{position:sticky;top:0;z-index:900;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);
  border-bottom:1px solid var(--line)}
.top-in{max-width:var(--wrap);margin:0 auto;padding:10px 22px;display:flex;align-items:center;gap:14px}
@media(min-width:820px){.top-in{padding:14px 40px}}
.top .brand img{height:50px;width:auto}
.top .sp{flex:1}
.top .open{display:none;align-items:center;gap:8px;font-size:14px;color:var(--ink2)}
.top .open:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--red)}
@media(min-width:720px){.top .open{display:inline-flex}}

/* ---------------------------------------------------------------- the hero */
.hero{padding:44px 0 8px}
@media(min-width:960px){.hero{padding:62px 0 18px}}
.hero-grid{display:grid;gap:32px;align-items:center}
@media(min-width:960px){.hero-grid{grid-template-columns:.92fr 1.08fr;gap:60px}}
.hero h1{font-size:clamp(38px,7.4vw,68px);margin-top:14px}
.hero .lead{margin-top:20px;font-size:clamp(17px,2.1vw,19.5px);color:var(--ink2);max-width:46ch}
/* Her brief asks for three buttons above the fold: call, WhatsApp, find the
   clinic. Watch video is a fourth and a lesser one, so it shares a row rather
   than running the full width and out-weighing the three that matter.
   Two by two at every width. The hero is a split layout, so the column these
   sit in is never wide enough for four across, whatever the window says. */
.hero-cta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:26px;max-width:520px}
.hero-cta .btn{width:100%;min-width:0;white-space:nowrap;padding:0 16px}
.btn--find{background:#fff;color:var(--ink);border-color:var(--ink)}
.btn--find:hover{background:var(--ink);color:#fff;border-color:var(--ink)}

/* The film sits in a deck that stands up as the page scrolls to it. The
   wrapper carries the perspective so this is real depth, not a squash. */
.deck{border-radius:12px;overflow:hidden;background:var(--sand2)}
.deck .v{border-radius:0}

.status{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;margin-top:38px;
  background:var(--line);border:1px solid var(--line);border-radius:10px;overflow:hidden}
@media(min-width:760px){.status{grid-template-columns:repeat(4,1fr)}}
.status div{background:#fff;padding:18px 18px 16px}
.status b{display:block;font-family:var(--fh);font-size:26px;line-height:1.1;color:var(--ink)}
.status span{display:block;margin-top:4px;font-size:13.5px;color:var(--ink3)}
.status .live b{color:var(--red)}

/* ---------------------------------------------------------------- sections */
.sec{padding:64px 0}
@media(min-width:820px){.sec{padding:88px 0}}
.sec--sand{background:var(--sand);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.sec h2{font-size:clamp(28px,4.4vw,44px);margin-top:10px}
.sec .intro{margin-top:16px;color:var(--ink2);max-width:62ch}
.sec-head{margin-bottom:34px}

/* ------------------------------------------------- the free health check */
.offerband{display:grid;gap:30px;align-items:center}
@media(min-width:900px){.offerband{grid-template-columns:.8fr 1.2fr;gap:52px}}
.offerband img{width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;border-radius:10px}
.free{display:inline-flex;align-items:center;gap:8px;background:var(--red);color:#fff;font-size:12.5px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;padding:7px 14px;border-radius:var(--pill)}
.hc-tiles{display:grid;gap:12px;margin-top:24px}
@media(min-width:560px){.hc-tiles{grid-template-columns:1fr 1fr}}
.hc-tile{display:flex;gap:13px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:10px;padding:16px 18px}
.hc-tile .i{color:var(--red);display:flex}
.hc-tile b{display:block;font-weight:600;font-size:15.5px}
.hc-tile span span{display:block;font-size:13.5px;color:var(--ink3)}
.noappt{display:inline-flex;align-items:center;gap:9px;margin-top:20px;font-size:14.5px;color:var(--ink2)}
.noappt .ico{width:18px;height:18px;color:var(--red)}

/* -------------------------------------------------------- what we look after */
.care{display:grid;gap:14px}
@media(min-width:640px){.care{grid-template-columns:1fr 1fr}}
@media(min-width:1000px){.care{grid-template-columns:repeat(3,1fr)}}
.care-card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:24px 22px}
.care-card .i{display:inline-flex;width:46px;height:46px;border-radius:50%;background:var(--red-t);color:var(--red);
  align-items:center;justify-content:center;margin-bottom:16px}
.care-card h3{font-family:var(--f);font-weight:600;font-size:17.5px;line-height:1.35}
.care-card p{margin-top:8px;color:var(--ink2);font-size:15px;line-height:1.6}

/* ------------------------------------------------------------ the walk */
.walk{display:grid;gap:30px}
@media(min-width:980px){
  .walk{grid-template-columns:1fr 1.06fr;gap:58px;align-items:start}
  /* The map holds still while the steps run past it. */
  .walk-media{position:sticky;top:104px}
}
.steps{position:relative;padding-left:40px}
.steps:before{content:"";position:absolute;left:15px;top:8px;bottom:8px;width:2px;background:var(--line)}
.steps-fill{position:absolute;left:15px;top:8px;bottom:8px;width:2px;background:var(--red);transform-origin:50% 0;transform:scaleY(0)}
@supports (animation-timeline: view()){
  @media (prefers-reduced-motion:no-preference){
    .steps-fill{animation:stepFill linear both;animation-timeline:view();animation-range:entry 40% cover 78%}
    @keyframes stepFill{to{transform:scaleY(1)}}
  }
}
@media (prefers-reduced-motion:reduce){.steps-fill{transform:scaleY(1)}}
.step{position:relative;padding:0 0 30px}
.step:last-child{padding-bottom:0}
.step .n{position:absolute;left:-40px;top:-2px;width:32px;height:32px;border-radius:50%;background:#fff;
  border:2px solid var(--line2);color:var(--ink2);display:grid;place-items:center;font-size:13.5px;font-weight:600;
  font-variant-numeric:tabular-nums}
.step p{color:var(--ink2)}
.mapwrap{margin-top:22px}
.frame{position:relative;aspect-ratio:4/3;border-radius:12px;overflow:hidden;border:1px solid var(--line);
  background:var(--sand2)}
.frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.mapfoot{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:14px;font-size:14.5px;color:var(--ink2)}
.mapfoot span{flex:1}

/* ------------------------------------------------------------- the team */
.team-one{margin:30px auto 0;max-width:330px}

/* -------------------------------------------------------- the insurers */
.mqwrap{margin-top:30px;position:relative}
.mqwrap:before,.mqwrap:after{content:"";position:absolute;top:0;bottom:0;width:70px;z-index:2;pointer-events:none}
.mqwrap:before{left:0;background:linear-gradient(90deg,var(--sand),rgba(250,247,243,0))}
.mqwrap:after{right:0;background:linear-gradient(270deg,var(--sand),rgba(250,247,243,0))}
.mqwrap img{height:44px;width:auto;opacity:.72;filter:grayscale(1);transition:.3s var(--ez)}
.mqwrap:hover img{opacity:1;filter:none}

/* ------------------------------------------------------------------ faq */
.faq{margin-top:26px;border-top:1px solid var(--line)}
.faq details{border-bottom:1px solid var(--line)}
.faq summary{list-style:none;cursor:pointer;padding:20px 40px 20px 0;position:relative;font-weight:500;font-size:17px}
.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:"";position:absolute;right:6px;top:27px;width:10px;height:10px;
  border-right:2px solid var(--ink3);border-bottom:2px solid var(--ink3);transform:rotate(45deg);transition:.25s var(--ez)}
.faq details[open] summary:after{transform:rotate(-135deg);border-color:var(--red)}
.faq .a{padding:0 0 22px;color:var(--ink2);max-width:70ch}

/* --------------------------------------------------------------- footer */
footer{background:#fff;border-top:1px solid var(--line);padding:56px 0 30px;font-size:15px;color:var(--ink2)}
.fgrid{display:grid;gap:34px}
@media(min-width:820px){.fgrid{grid-template-columns:1.3fr 1fr 1fr}}
footer h3{font-family:var(--f);font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3)}
footer h3 + p{margin-top:12px}
footer .flogo{height:62px;width:auto}
footer .big{font-size:21px;font-weight:600;color:var(--ink)}
footer .tel{text-decoration:none}
footer .ins{display:flex;flex-wrap:wrap;gap:14px;margin-top:12px}
footer .ins img{height:34px;width:auto;opacity:.7}
.fbase{margin-top:38px;padding-top:20px;border-top:1px solid var(--line);font-size:13.5px;color:var(--ink3);display:flex;flex-wrap:wrap;gap:8px 22px}
.fbase a{color:var(--ink2)}
${D.CREDIT_CSS}

/* ------------------------------------------------------- floating WhatsApp */
.wa-float{position:fixed;right:20px;bottom:20px;z-index:890;display:flex;align-items:center;gap:10px;
  background:var(--wa);color:#fff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 20px;border-radius:var(--pill);
  box-shadow:0 14px 34px -12px rgba(18,140,126,.6);transition:.25s var(--ez)}
.wa-float:hover{background:var(--wa-deep)}
.wa-float .ico{width:24px;height:24px}

${D.VIDEO_CSS}
${D.CAROUSEL_CSS}
${D.SCRUB_CSS}
${D.OTHERS_CSS}
${D.MOTION_CSS}

@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
`;

function render(c, designNo) {
  const L = D.links(c);

  const care = D.HELP.map(
    ([icon, title, note]) =>
      `<div class="care-card m-lift"><span class="i">${svg(icon)}</span><h3>${esc(title)}</h3><p>${esc(note)}</p></div>`
  ).join('');

  const steps = c.steps
    .map((t, i) => `<div class="step"><span class="n">${i + 1}</span><p>${esc(t)}</p></div>`)
    .join('');

  const faqs = D.faqFor(c)
    .map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a">${esc(a)}</div></details>`)
    .join('');

  /* Doubled, because a marquee has to hand off to its own copy to loop. */
  const insurerRow = D.INSURERS.map(
    ([tok, name]) => `<img src="%%${tok}%%" alt="${esc(name)}" loading="lazy" width="120" height="44">`
  ).join('');
  const insurers = insurerRow + insurerRow;

  /* Only Premier Le Reve has a film of the actual walk. The other two get the
     written steps until someone films theirs. */
  const walkBlock = c.walkLoop
    ? D.scrubWalk(c, 'VWALKSCRUB')
    : `<div class="walk">
        <div class="steps">
          <span class="steps-fill" aria-hidden="true"></span>
          ${steps}
        </div>
        <div class="walk-media">${D.video({ token: 'VINTRO', shape: 'landscape', tag: 'Inside the clinic' })}</div>
      </div>`;
  const stories = D.stories();
  const team = D.video({ token: c.teamFilm, shape: 'portrait', label: 'Meet the team' });

  return `${D.head(c)}
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap">
<style>${CSS}</style>

<a class="skip" href="#main">Skip to content</a>
<div class="m-bar" aria-hidden="true"></div>

<header class="top">
  <div class="top-in">
    <a class="brand" href="https://www.247clinic.net" rel="noopener"><img src="%%C7LOGO%%" alt="24/7 Clinic" width="200" height="193"></a>
    <span class="sp"></span>
    <span class="open">Open 24 hours</span>
    <a class="btn btn--red btn--sm m-press" href="${L.tel}" data-ev="phone_click">${svg('phone')}Call</a>
  </div>
</header>

<main id="main">
  <section class="hero">
    <div class="wrap">
      <div class="hero-grid">
        <div class="m-rise">
          <span class="tag">${esc(c.area)} &middot; ${esc(c.region)}</span>
          <h1>${esc(c.h1)}</h1>
          <p class="lead">${esc(c.lead)} English speaking doctors, and someone at the desk at any hour.</p>
          <div class="hero-cta">
            <a class="btn btn--red m-press" href="${L.tel}" data-ev="phone_click">${svg('phone')}Call now</a>
            <a class="btn btn--wa m-press" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">${svg('wa')}WhatsApp</a>
            <a class="btn btn--find m-press" href="#find" data-ev="clinic_directions_click">${svg('pin')}Find the clinic</a>
            <button class="btn btn--watch m-press" type="button" data-herowatch>${svg('play')}Watch video</button>
          </div>
        </div>
        <div class="m-deck">
          <div class="deck">
            ${D.video({ token: 'VCOMMERCIAL', shape: 'landscape', tag: 'The clinic film', cls: 'hero-film' })}
          </div>
        </div>
      </div>

      <div class="status m-stagger">
        <div class="live"><b>Open now</b><span>Every hour, every day</span></div>
        <div><b>In the grounds</b><span>${esc(c.hotelShort)}</span></div>
        <div><b>Since ${D.SINCE}</b><span>Caring for visitors</span></div>
        <div><b>${D.NETWORK} clinics</b><span>Across Egypt</span></div>
      </div>
    </div>
  </section>

  <section class="sec sec--sand">
    <div class="wrap">
      <div class="offerband">
        <img class="m-drift" src="%%POSTERHEALTH%%" alt="Free health check poster: free blood pressure and blood sugar check for hotel guests" loading="lazy" width="1080" height="1440">
        <div class="m-rise">
          <span class="free">Free for hotel guests</span>
          <h2 style="margin-top:16px">A health check, on the house</h2>
          <p class="intro">Checked by a nurse while you wait. Nothing to pay, nothing to book.</p>
          <div class="hc-tiles">
            <div class="hc-tile"><span class="i">${svg('heart')}</span><span><b>Blood pressure</b><span>Checked in a minute</span></span></div>
            <div class="hc-tile"><span class="i">${svg('gauge')}</span><span><b>Blood sugar</b><span>One drop, one reading</span></span></div>
          </div>
          <span class="noappt">${svg('check')}No appointment needed</span>
          <div style="margin-top:26px"><a class="btn btn--red m-press" href="${L.tel}" data-ev="phone_click">${svg('phone')}Call the clinic</a></div>
        </div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head m-rise">
        <span class="tag">Care</span>
        <h2>What we look after</h2>
      </div>
      <div class="care m-stagger">${care}</div>
    </div>
  </section>

  <section class="sec sec--sand" id="find">
    <div class="wrap">
      ${c.walkLoop ? '' : `<div class="sec-head m-rise">
        <span class="tag">Finding us</span>
        <h2>The walk from your hotel</h2>
      </div>`}
      ${walkBlock}
      <figure class="mapwrap">
        <div class="frame">
          <iframe src="${L.embed}" title="Map of the 24/7 Clinic at ${esc(c.hotel)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <figcaption class="mapfoot">
          <span>${esc(c.hotel)}, ${esc(c.area)}</span>
          <a class="btn btn--sm m-press" href="${L.maps}" target="_blank" rel="noopener" data-ev="clinic_directions_click">${svg('pin')}Directions</a>
        </figcaption>
      </figure>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head m-rise">
        <span class="tag">Guests</span>
        <h2>In their own words</h2>
      </div>
      ${D.carousel({ items: stories, label: 'Guest stories' })}
    </div>
  </section>

  <section class="sec sec--sand">
    <div class="wrap">
      <div class="sec-head m-rise">
        <span class="tag">The team</span>
        <h2>The people who will see you</h2>
      </div>
      <div class="team-one m-rise">${team}</div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head m-rise">
        <span class="tag">Filmed here</span>
        <h2>What we do at this clinic</h2>
      </div>
      ${D.carousel({ items: D.serviceFilms(), label: 'What we do at this clinic', size: 'sm' })}
    </div>
  </section>

  <section class="sec sec--sand">
    <div class="wrap">
      <div class="sec-head m-rise">
        <span class="tag">Insurance</span>
        <h2>We deal with your insurer</h2>
        <p class="intro">Bring your policy details or your insurance card. We handle the paperwork and write the medical report your claim needs, in English, before you fly home.</p>
      </div>
      <div class="mqwrap m-mq">
        <div class="m-mq-track">${insurers}</div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head m-rise">
        <span class="tag">Questions</span>
        <h2>What guests ask us</h2>
      </div>
      <div class="faq">${faqs}</div>
    </div>
  </section>

  <section class="sec sec--sand">
    <div class="wrap">
      <div class="sec-head m-rise">
        <span class="tag">The network</span>
        <h2>Other 24/7 clinics on this coast</h2>
        <p class="intro">Staying somewhere else on the Red Sea? We run urgent care clinics inside these resorts too, open the same 24 hours.</p>
      </div>
      ${D.otherClinics(c, designNo)}
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div class="fgrid">
      <div>
        <img class="flogo" src="%%C7LOGO%%" alt="24/7 Clinic" width="200" height="193">
        <p style="margin-top:16px">24/7 Urgent Care Clinic. Travel medical services for international guests in Egypt, part of Healthcare International Group.</p>
      </div>
      <div>
        <h3>The clinic</h3>
        <p class="big"><a class="tel" href="${L.tel}" data-ev="phone_click">${D.PHONE}</a></p>
        <p style="margin-top:10px">${esc(c.hotel)}<br>${esc(c.area)}, ${esc(c.region)}<br>Open 24 hours, every day</p>
      </div>
      <div>
        <h3>24/7 Clinic</h3>
        <p><a href="https://www.247clinic.net/our-clinics" target="_blank" rel="noopener">All clinics</a><br>
        <a href="https://www.247clinic.net/insurance" target="_blank" rel="noopener">Insurance</a><br>
        <a href="https://www.247clinic.net/contact-us" target="_blank" rel="noopener">Contact</a></p>
      </div>
    </div>
    <div class="fbase"><span>24/7 Clinic &middot; ${esc(c.area)} &middot; Since ${D.SINCE}</span><span>${D.NETWORK} clinics across Egypt</span>${D.credit()}</div>
  </div>
</footer>

<a class="wa-float" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_medical_click" aria-label="Message 24/7 Clinic on WhatsApp">${svg('wa')}WhatsApp</a>

${D.viewer()}

<script type="application/ld+json">${JSON.stringify(D.schemaFor(c))}</script>
<script type="application/ld+json">${JSON.stringify(D.otherClinicsSchema(c))}</script>
${D.tracking(c)}
<script>${D.VIDEO_JS}${D.CAROUSEL_JS}${D.SCRUB_JS}</script>
<script>
(function () {
  /* The hero Watch button opens the hero film in the lightbox. The old design 3
     looked for an attribute the film never carried, so this button did nothing
     at all. It targets the film's own class now. */
  var b = document.querySelector('[data-herowatch]');
  var film = document.querySelector('.hero-film [data-vwatch]');
  if (!b || !film) return;
  b.addEventListener('click', function () { film.click(); });
})();
</script>
`;
}

module.exports = { NAME, NOTE, render };
