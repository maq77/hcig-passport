/**
 * Design 4: To the brief.
 *
 * A strict reading of Irina's landing page task and nothing else. Designs 1 to
 * 3 each add things she did not ask for. This one adds none of them.
 *
 * What is here is only what she listed:
 *
 *   the hero exactly as she wrote it, headline, line, three buttons;
 *   where the clinic is, the map, directions, hours, phone, WhatsApp;
 *   her ten services, in her words and her order;
 *   an emergency call to action;
 *   the FAQ;
 *   internal links, which her SEO list asks for, as a link row rather than a
 *   section with pictures.
 *
 * What is deliberately absent, because she did not ask for it: the campaign
 * posters, the guest story films, the team film, the service films, the free
 * health check, and the accreditation band. Her words are "a very simple
 * emergency/medical conversion page", "do not overdesign", and "not a corporate
 * presentation".
 *
 * One film, at his request: the clinic's own commercial at the top of the hero,
 * muted, looping, playing itself. It is the closest thing there is to the
 * "clinic photographs" her list asks for and which do not exist.
 *
 * It is not free. That film is 8.9 MB against a page that was 31 KB, on a page
 * whose whole argument was that it loads instantly. It does not block the call
 * buttons, which come first in the source and sit above it on a phone, and it
 * only fetches when it scrolls into view. Even so, it is the one thing on this
 * page that costs anything.
 *
 * Steigenberger and Amwaj have no film of their own yet, so the same frame
 * holds the Red Sea stand-in from Pexels rather than a gap. Filling those is
 * one token in each clinic's row of data.js.
 */

const D = require('./data');
const { esc, svg } = D;

const NAME = 'To the brief';
const NOTE = 'Only what Irina asked for, in her words. One hero film, no extra sections.';

const CSS = `
:root{
  --red:#C00000; --red-d:#960000; --red-t:#FBF0EF; --red-l:#EBD3D1;
  --ink:#15120F; --ink2:#544C46; --ink3:#867C74;
  --bg:#FFFFFF; --tint:#FAF8F6;
  --line:#E7E1DA; --line2:#CFC6BB;
  --wa:#25D366; --wa-deep:#128C7E;
  --f:"Poppins","Segoe UI",system-ui,-apple-system,Arial,sans-serif;
  --r:12px; --pill:999px;
  --ez:cubic-bezier(.22,.61,.36,1);
  --wrap:940px;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f);font-size:16.5px;line-height:1.62;
  -webkit-font-smoothing:antialiased;overflow-x:clip}
h1,h2,h3{margin:0;font-weight:600;line-height:1.2;letter-spacing:-.015em;text-wrap:balance}
p,figure,ul,ol{margin:0}
img,iframe,svg{max-width:100%;display:block}
a{color:inherit}
button{font:inherit;color:inherit}
a,button,summary{touch-action:manipulation}
:focus-visible{outline:2px solid var(--red);outline-offset:3px}
.ico{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.skip{position:absolute;left:-9999px;top:0;z-index:200;background:var(--red);color:#fff;padding:12px 18px;font-weight:600;text-decoration:none}
.skip:focus{left:0}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 20px}
@media(min-width:760px){.wrap{padding:0 28px}}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:54px;padding:0 18px;
  border:1.5px solid var(--ink);border-radius:var(--pill);cursor:pointer;font-weight:600;font-size:16px;
  text-decoration:none;background:#fff;color:var(--ink);transition:.2s var(--ez);white-space:nowrap}
.btn:active{transform:scale(.98)}
.btn--red{background:var(--red);border-color:var(--red);color:#fff}
.btn--red:hover{background:var(--red-d);border-color:var(--red-d)}
.btn--wa{background:var(--wa);border-color:var(--wa);color:#fff}
.btn--wa:hover{background:var(--wa-deep);border-color:var(--wa-deep)}
.btn--find:hover{background:var(--ink);color:#fff}
.btn--sm{min-height:44px;font-size:15px;padding:0 16px}

/* ------------------------------------------------------------------ top */
.top{border-bottom:1px solid var(--line)}
.top-in{max-width:var(--wrap);margin:0 auto;padding:10px 20px;display:flex;align-items:center;gap:12px}
@media(min-width:760px){.top-in{padding:12px 28px}}
.top .brand img{height:46px;width:auto}
.top .sp{flex:1}
.top .hours{display:none;align-items:center;gap:7px;font-size:14px;font-weight:500;color:var(--ink2)}
.top .hours .ico{width:17px;height:17px;color:var(--red)}
@media(min-width:620px){.top .hours{display:inline-flex}}

/* ----------------------------------------------------------------- hero */
.hero{padding:30px 0 26px}
@media(min-width:760px){.hero{padding:44px 0 40px}}
.hero-in{display:grid;gap:26px;align-items:center}
@media(min-width:900px){.hero-in{grid-template-columns:1fr 1fr;gap:44px}}

/* The clinic's own film where one exists. Where it does not, the same frame
   holds a Red Sea photograph from Pexels so the page is never a gap. Swapping
   in a real film is one token in the clinic's row of data.js. */
.hero-media{position:relative;border-radius:var(--r);overflow:hidden;background:var(--tint);border:1px solid var(--line);
  aspect-ratio:16/10}
.hero-media img,.hero-media video{width:100%;height:100%;object-fit:cover;display:block}
.hero-media .v{position:absolute;inset:0;border-radius:0;border:0}
.area{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;letter-spacing:.08em;
  text-transform:uppercase;color:var(--red)}
.area .ico{width:16px;height:16px}
.hero h1{margin-top:12px;font-size:clamp(31px,6.6vw,50px)}
.hero .lead{margin-top:14px;font-size:clamp(17px,2.2vw,20px);color:var(--ink2);max-width:34ch}

/* Her three buttons, and nothing beside them. Call and WhatsApp are the two
   she names first, so they take the full-width row on a phone. */
.cta{display:grid;gap:10px;margin-top:26px;max-width:430px}
@media(min-width:520px){.cta{grid-template-columns:1fr 1fr}.cta .btn--find{grid-column:1/-1}}
.cta .btn{width:100%}

.facts{display:flex;flex-wrap:wrap;gap:10px 24px;margin-top:22px;font-size:15px;color:var(--ink2)}
.facts span{display:inline-flex;align-items:center;gap:8px}
.facts .ico{width:17px;height:17px;color:var(--red)}
.facts a{color:var(--ink);font-weight:600;text-decoration:none}
.facts a:hover{color:var(--red)}

/* -------------------------------------------------------------- section */
.sec{padding:38px 0}
@media(min-width:760px){.sec{padding:52px 0}}
.sec--tint{background:var(--tint);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.sec h2{font-size:clamp(22px,3.4vw,30px)}
.sec .sub{margin-top:10px;color:var(--ink2);max-width:60ch}

/* --------------------------------------------------- where the clinic is */
.where{display:grid;gap:22px;margin-top:22px}
@media(min-width:820px){.where{grid-template-columns:1fr 1fr;gap:32px;align-items:start}}
.steps{list-style:none;display:grid;gap:10px;padding:0}
.steps li{display:flex;gap:12px;align-items:flex-start;background:#fff;border:1px solid var(--line);
  border-radius:var(--r);padding:14px 16px}
.steps b{flex:none;width:26px;height:26px;border-radius:50%;background:var(--red-t);color:var(--red);
  display:grid;place-items:center;font-size:13px;font-variant-numeric:tabular-nums}
.steps p{color:var(--ink2);font-size:15.5px}
.map{position:relative;aspect-ratio:4/3;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);background:var(--tint)}
.map iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.map-foot{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:12px;font-size:14.5px;color:var(--ink2)}
.map-foot span{flex:1;min-width:160px}

/* A photograph of the clinic goes here. Nothing renders while there is none. */
.shots{display:grid;gap:12px;margin-top:22px}
@media(min-width:620px){.shots{grid-template-columns:1fr 1fr}}
.shots img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:var(--r);border:1px solid var(--line)}

/* ------------------------------------------------------------- services */
.svc{list-style:none;padding:0;display:grid;gap:10px;margin-top:22px}
@media(min-width:560px){.svc{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.svc{grid-template-columns:1fr 1fr 1fr}}
.svc li{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);
  border-radius:var(--r);padding:15px 16px;font-weight:500;font-size:15.5px;line-height:1.4}
.svc .i{flex:none;width:38px;height:38px;border-radius:50%;background:var(--red-t);color:var(--red);
  display:grid;place-items:center}

/* ---------------------------------------------------------- emergency cta */
.now{background:var(--red);color:#fff;border-radius:var(--r);padding:26px 22px;margin-top:6px}
@media(min-width:760px){.now{padding:34px 32px;display:flex;align-items:center;gap:30px}}
.now h2{color:#fff;font-size:clamp(21px,3vw,28px)}
.now p{margin-top:8px;color:rgba(255,255,255,.9);max-width:44ch}
.now .grow{flex:1}
.now-cta{display:grid;gap:10px;margin-top:20px;min-width:250px}
@media(min-width:760px){.now-cta{margin-top:0}}
.now .btn{background:#fff;border-color:#fff;color:var(--red)}
.now .btn:hover{background:rgba(255,255,255,.9)}
.now .btn--wa{background:var(--wa);border-color:var(--wa);color:#fff}

/* ------------------------------------------------------------------ faq */
.faq{margin-top:20px;border-top:1px solid var(--line)}
.faq details{border-bottom:1px solid var(--line)}
.faq summary{list-style:none;cursor:pointer;padding:16px 40px 16px 0;position:relative;font-weight:600;font-size:16.5px}
.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:"";position:absolute;right:6px;top:23px;width:9px;height:9px;
  border-right:2px solid var(--ink3);border-bottom:2px solid var(--ink3);transform:rotate(45deg);transition:.2s var(--ez)}
.faq details[open] summary:after{transform:rotate(-135deg);border-color:var(--red)}
.faq .a{padding:0 0 18px;color:var(--ink2);max-width:68ch}

/* --------------------------------------------------------------- footer */
footer{border-top:1px solid var(--line);padding:30px 0 96px;font-size:14.5px;color:var(--ink2)}
@media(min-width:760px){footer{padding-bottom:34px}}
footer .flogo{height:48px;width:auto}
.fnav{display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:16px}
.fnav a{color:var(--ink);font-weight:500;text-decoration:none}
.fnav a:hover{color:var(--red)}
.fbase{margin-top:20px;padding-top:16px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;gap:8px 20px;
  font-size:13px;color:var(--ink3)}
${D.CREDIT_CSS}
${D.VIDEO_CSS}
.hero-media .v{aspect-ratio:auto}

/* Her line: the Call and WhatsApp buttons must be visible immediately on a
   phone. This keeps them on screen for the whole page. */
.bar{position:fixed;left:0;right:0;bottom:0;z-index:900;display:grid;grid-template-columns:1fr 1fr;gap:8px;
  padding:8px 10px calc(8px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);
  backdrop-filter:blur(12px);border-top:1px solid var(--line)}
.bar .btn{min-height:50px;font-size:15.5px}
@media(min-width:760px){.bar{display:none}}

@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
`;

function render(c, designNo) {
  const L = D.links(c);

  const steps = c.steps.map((t, i) => `<li><b>${i + 1}</b><p>${esc(t)}</p></li>`).join('');

  /* Premier Le Reve has its own clinic film. The other two hold the slot with
     the Red Sea stand-in until their films are shot. */
  const heroMedia = c.heroFilm
    ? D.video({ token: c.heroFilm, shape: 'landscape', tag: 'The clinic', cls: 'hero-film' })
    : `<img src="%%${c.photo}%%" alt="The Red Sea coast at ${esc(c.area)}, where the 24/7 Clinic at ${esc(c.hotelShort)} serves hotel guests" width="1200" height="750">`;

  const services = D.BRIEF_SERVICES.map(
    ([icon, label]) => `<li><span class="i">${svg(icon)}</span>${esc(label)}</li>`
  ).join('');

  const faqs = D.faqFor(c)
    .map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a">${esc(a)}</div></details>`)
    .join('');

  /* Her SEO list asks for internal links. A row of them, not a section. */
  const siblings = D.CLINICS.filter((x) => x.slug !== c.slug)
    .map(
      (x) => `<a href="${D.demoUrl(x, designNo)}">24/7 Clinic at ${esc(x.hotelShort)}, ${esc(x.area)}</a>`
    )
    .join('');

  /* Empty until a photograph of this clinic exists. Renders nothing, never a
     placeholder, so the page always reads as finished. */
  const shots = (c.shots || [])
    .map(
      ([token, alt]) =>
        `<img src="%%${token}%%" alt="${esc(alt)}" loading="lazy" width="800" height="600">`
    )
    .join('');

  return `${D.head(c)}
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap">
<style>${CSS}</style>

<a class="skip" href="#main">Skip to content</a>

<header class="top">
  <div class="top-in">
    <a class="brand" href="https://www.247clinic.net" rel="noopener"><img src="%%C7LOGO%%" alt="24/7 Clinic" width="200" height="193"></a>
    <span class="sp"></span>
    <span class="hours">${svg('clock')}Open 24 hours</span>
    <a class="btn btn--red btn--sm" href="${L.tel}" data-ev="phone_click">${svg('phone')}Call</a>
  </div>
</header>

<main id="main">
  <section class="hero">
    <div class="wrap">
      <div class="hero-in">
        <div>
      <span class="area">${svg('pin')}${esc(c.area)}, ${esc(c.region)}</span>
      <h1>Need a Doctor at ${esc(c.hotelShort)}?</h1>
      <p class="lead">${esc(c.lead)}</p>

      <div class="cta">
        <a class="btn btn--red" href="${L.tel}" data-ev="phone_click">${svg('phone')}Call now</a>
        <a class="btn btn--wa" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">${svg('wa')}WhatsApp</a>
        <a class="btn btn--find" href="#where" data-ev="clinic_directions_click">${svg('pin')}Find the clinic</a>
      </div>

      <div class="facts">
        <span>${svg('phone')}<a href="${L.tel}" data-ev="phone_click">${D.PHONE}</a></span>
        <span>${svg('clock')}Open 24 hours, every day</span>
        <span>${svg('globe')}English, German, Italian, French</span>
      </div>
        </div>
        <div class="hero-media">${heroMedia}</div>
      </div>
    </div>
  </section>

  <section class="sec sec--tint" id="where">
    <div class="wrap">
      <h2>Where the clinic is</h2>
      <p class="sub">${esc(c.hotel)}, ${esc(c.area)}, ${esc(c.region)}. Open 24 hours, every day.</p>
      <div class="where">
        <ol class="steps">${steps}</ol>
        <div>
          <figure class="map">
            <iframe src="${L.embed}" title="Map of the 24/7 Clinic at ${esc(c.hotel)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </figure>
          <div class="map-foot">
            <span>${esc(c.hotel)}</span>
            <a class="btn btn--sm" href="${L.maps}" target="_blank" rel="noopener" data-ev="clinic_directions_click">${svg('pin')}Directions</a>
          </div>
        </div>
      </div>
      ${shots ? `<div class="shots">${shots}</div>` : ''}
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <h2>What the clinic does</h2>
      <ul class="svc">${services}</ul>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="now">
        <div class="grow">
          <h2>Need a doctor now?</h2>
          <p>Tell us your room number and what happened. Someone answers at any hour.</p>
        </div>
        <div class="now-cta">
          <a class="btn" href="${L.tel}" data-ev="phone_click">${svg('phone')}${D.PHONE}</a>
          <a class="btn btn--wa" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">${svg('wa')}WhatsApp us</a>
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec--tint">
    <div class="wrap">
      <h2>Questions guests ask</h2>
      <div class="faq">${faqs}</div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <img class="flogo" src="%%C7LOGO%%" alt="24/7 Clinic" width="200" height="193">
    <nav class="fnav">${siblings}</nav>
    <div class="fbase">
      <span>24/7 Clinic &middot; ${esc(c.hotel)} &middot; ${esc(c.area)}</span>
      <a href="https://www.247clinic.net/our-clinics" target="_blank" rel="noopener">All clinics</a>
      <a href="https://www.247clinic.net/contact-us" target="_blank" rel="noopener">Contact</a>
      ${D.credit()}
    </div>
  </div>
</footer>

<div class="bar">
  <a class="btn btn--red" href="${L.tel}" data-ev="phone_click">${svg('phone')}Call now</a>
  <a class="btn btn--wa" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">${svg('wa')}WhatsApp</a>
</div>

${c.heroFilm ? D.viewer() : ''}

<script type="application/ld+json">${JSON.stringify(D.schemaFor(c))}</script>
<script type="application/ld+json">${JSON.stringify(D.otherClinicsSchema(c))}</script>
${D.tracking(c)}
${c.heroFilm ? `<script>${D.VIDEO_JS}</script>` : ''}
`;
}

module.exports = { NAME, NOTE, render };
