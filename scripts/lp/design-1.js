/**
 * Design 1: Clean and clinical.
 *
 * White ground, split hero, card grid, red only where it acts. This is the
 * MedPark v2 language applied to the 24/7 palette, so the two sites in the
 * group feel like one company. The safest of the three, and the closest to
 * what a hotel guest expects a medical page to look like.
 */

const D = require('./data');
const { esc, svg } = D;

const NAME = 'Clean and clinical';
const NOTE = 'White, split hero, card grid. The MedPark language in 24/7 colours.';

const CSS = `
:root{
  --red:#C00000; --red-d:#960000; --red-t:#FCEDED; --red-l:#F1CFCF;
  --ink:#141210; --ink2:#4E4845; --ink3:#7C746F;
  --bg:#FFFFFF; --bg2:#F8F6F4;
  --line:#E7E2DD; --line2:#D2CBC4;
  --wa:#25D366; --wa-deep:#128C7E;
  --f:"Poppins","Segoe UI",system-ui,-apple-system,Arial,sans-serif;
  --r2:18px; --pill:999px;
  --sh2:0 10px 30px -14px rgba(20,18,16,.28);
  --ez:cubic-bezier(.22,.61,.36,1);
  --wrap:1120px;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f);font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3{margin:0;line-height:1.15;letter-spacing:-.025em;text-wrap:balance}
p,blockquote,figure{margin:0}
img,video,iframe,svg{max-width:100%;display:block}
a{color:inherit}
button{font:inherit;color:inherit}
a,button,summary{touch-action:manipulation}
:focus-visible{outline:3px solid var(--red);outline-offset:3px;border-radius:6px}
.ico{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.skip{position:absolute;left:-9999px;top:0;z-index:200;background:var(--red);color:#fff;padding:12px 18px;border-radius:0 0 12px 0;font-weight:600;text-decoration:none}
.skip:focus{left:0}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 20px}
@media(min-width:820px){.wrap{padding:0 32px}}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:54px;padding:0 24px;
  border-radius:var(--pill);border:0;cursor:pointer;font-weight:600;font-size:17px;letter-spacing:-.01em;text-decoration:none;
  transition:background-color .2s var(--ez),transform .12s var(--ez),box-shadow .2s var(--ez)}
.btn:active{transform:scale(.98)}
.btn--red{background:var(--red);color:#fff;box-shadow:var(--sh2)}
.btn--red:hover{background:var(--red-d)}
.btn--wa{background:var(--wa);color:#fff}
.btn--wa:hover{background:var(--wa-deep)}
.btn--line{background:#fff;color:var(--ink);border:1.5px solid var(--line2)}
.btn--line:hover{border-color:var(--red);color:var(--red)}
.btn--sm{min-height:44px;font-size:15px;padding:0 18px}
.btn .num{font-weight:500;opacity:.9;font-size:15px}

.top{position:sticky;top:0;z-index:80;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.top-in{max-width:var(--wrap);margin:0 auto;padding:8px 20px;display:flex;align-items:center;gap:14px}
@media(min-width:820px){.top-in{padding:10px 32px}}
.top .brand{display:flex;align-items:center;text-decoration:none}
.top .brand img{height:46px;width:auto}
@media(min-width:820px){.top .brand img{height:56px}}
.top .sp{flex:1}
.top .hours{display:none;font-size:14px;color:var(--ink2);align-items:center;gap:7px}
.top .hours .ico{width:16px;height:16px;color:var(--red)}
@media(min-width:700px){.top .hours{display:flex}}

.hero{padding:34px 0 10px}
@media(min-width:900px){.hero{padding:56px 0 26px}}
.hero-in{display:grid;gap:28px}
@media(min-width:900px){.hero-in{grid-template-columns:1.05fr .95fr;gap:48px;align-items:center}}
.badge{display:inline-flex;align-items:center;gap:9px;font-size:13px;font-weight:600;color:var(--red);
  background:var(--red-t);border:1px solid var(--red-l);padding:7px 14px;border-radius:var(--pill)}
.badge .dot{width:8px;height:8px;border-radius:50%;background:var(--red);flex:none}
@media (prefers-reduced-motion:no-preference){.badge .dot{animation:pulse 2.4s ease-in-out infinite}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.82)}}
h1{font-size:clamp(32px,6.2vw,54px);font-weight:700;letter-spacing:-.04em;margin-top:18px}
.lead{margin-top:14px;font-size:clamp(17px,2.1vw,20px);color:var(--ink2);max-width:32ch}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
.hero-cta .btn{flex:1 1 auto;min-width:200px}
.hero-note{margin-top:18px;font-size:14.5px;color:var(--ink3);display:flex;flex-wrap:wrap;gap:8px 18px}
.hero-note span{display:inline-flex;align-items:center;gap:7px}
.hero-note .ico{width:16px;height:16px;color:var(--red);stroke-width:2.2}

${D.VIDEO_CSS}
.v{border-radius:var(--r2);box-shadow:var(--sh2)}

/* ---------- free health check, made a block ---------- */
.hc{background:linear-gradient(180deg,var(--red) 0%,#A30000 100%);color:#fff;overflow:hidden}
.hc-in{max-width:var(--wrap);margin:0 auto;padding:38px 20px;display:grid;gap:28px;align-items:center}
@media(min-width:820px){.hc-in{grid-template-columns:.8fr 1.2fr;gap:48px;padding:52px 32px}}
.hc img{width:100%;height:auto;border-radius:14px;box-shadow:0 24px 50px -20px rgba(0,0,0,.6)}
.hc .free{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
  background:#fff;color:var(--red);padding:6px 13px;border-radius:6px}
.hc h2{color:#fff;margin-top:16px;font-size:clamp(26px,4.2vw,38px)}
.hc .note{margin-top:12px;color:rgba(255,255,255,.88);font-size:16.5px;max-width:44ch}
.hc-tiles{display:grid;gap:12px;margin-top:26px}
@media(min-width:560px){.hc-tiles{grid-template-columns:1fr 1fr}}
.hc-tile{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.26);border-radius:14px;
  padding:18px 18px;display:flex;gap:14px;align-items:center;backdrop-filter:blur(6px)}
.hc-tile .i{width:46px;height:46px;flex:none;border-radius:12px;background:#fff;color:var(--red);display:grid;place-items:center}
.hc-tile .i .ico{width:26px;height:26px;stroke-width:1.8}
.hc-tile b{display:block;font-size:16.5px;font-weight:600}
.hc-tile span{display:block;font-size:14px;color:rgba(255,255,255,.82);margin-top:2px}
.hc .row{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:24px}
.hc .btn--white{background:#fff;color:var(--red)}
.hc .btn--white:hover{background:#F3E6E6}
.hc .noappt{display:inline-flex;align-items:center;gap:9px;font-size:15px;color:rgba(255,255,255,.9)}
.hc .noappt .ico{width:19px;height:19px;stroke-width:2.6}
@media (prefers-reduced-motion:no-preference){
  .hc-tile .i .ico{animation:hcPulse 3.2s var(--ez) infinite}
  .hc-tile:nth-child(2) .i .ico{animation-delay:1.1s}
  @keyframes hcPulse{0%,70%,100%{transform:scale(1)}12%{transform:scale(1.14)}24%{transform:scale(1)}36%{transform:scale(1.1)}}
  .hc .noappt .ico{stroke-dasharray:26;stroke-dashoffset:26;animation:hcTick .7s var(--ez) .3s forwards}
  @keyframes hcTick{to{stroke-dashoffset:0}}
}

/* ---------- film rails ---------- */
.films{display:grid;gap:16px;margin-top:30px}
@media(min-width:760px){.films--3{grid-template-columns:repeat(3,1fr)}}
@media(min-width:900px){.films--4{grid-template-columns:repeat(4,1fr)}}
.film figcaption{margin-top:12px}
.film b{display:block;font-size:16.5px;font-weight:600}
.film span{display:block;margin-top:4px;font-size:14.5px;color:var(--ink2);line-height:1.5}
.stories{display:grid;gap:20px;margin-top:30px}
@media(min-width:820px){.stories{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}}

.band{background:var(--red);color:#fff}
.band-in{max-width:var(--wrap);margin:0 auto;padding:18px 20px;display:flex;flex-wrap:wrap;align-items:center;gap:9px 16px}
@media(min-width:820px){.band-in{padding:20px 32px}}
.band b{font-size:18px;font-weight:700;letter-spacing:-.02em}
.band span.t{font-size:15px;color:rgba(255,255,255,.92)}
.band .free{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:#fff;color:var(--red);padding:5px 11px;border-radius:6px}

.sec{padding:48px 0;scroll-margin-top:74px}
@media(min-width:820px){.sec{padding:70px 0}}
.sec--tint{background:var(--bg2);border-block:1px solid var(--line)}
.kick{font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--red)}
h2{font-size:clamp(25px,3.9vw,36px);font-weight:700;margin-top:10px}

.find{display:grid;gap:26px;margin-top:30px;align-items:start}
@media(min-width:900px){.find{grid-template-columns:1.1fr .9fr;gap:38px}}
ol.steps{list-style:none;margin:0;padding:0;counter-reset:s;display:grid;gap:18px}
ol.steps li{counter-increment:s;position:relative;padding-left:50px;font-size:16.5px}
ol.steps li:before{content:counter(s);position:absolute;left:0;top:-2px;width:34px;height:34px;border-radius:50%;
  background:var(--red);color:#fff;font-size:15px;font-weight:700;display:grid;place-items:center}
.findmap{border:1px solid var(--line);border-radius:var(--r2);overflow:hidden;background:var(--bg2);margin-top:26px}
.findmap .frame{background-size:cover;background-position:center}
.findmap iframe{width:100%;height:280px;border:0;display:block}
.findmap figcaption{padding:13px 16px;font-size:14.5px;color:var(--ink3);border-top:1px solid var(--line);
  display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;justify-content:space-between}

.help{display:grid;gap:14px;margin-top:30px}
@media(min-width:600px){.help{grid-template-columns:1fr 1fr}}
@media(min-width:1000px){.help{grid-template-columns:repeat(3,1fr)}}
.help-card{background:#fff;border:1px solid var(--line);border-radius:var(--r2);padding:22px 20px;
  transition:border-color .2s var(--ez),transform .2s var(--ez),box-shadow .2s var(--ez)}
.help-card:hover{border-color:var(--red-l);transform:translateY(-2px);box-shadow:var(--sh2)}
.help-card .i{width:44px;height:44px;border-radius:12px;background:var(--red-t);color:var(--red);display:grid;place-items:center}
.help-card .i .ico{width:23px;height:23px}
.help-card h3{font-size:17.5px;font-weight:600;margin-top:15px}
.help-card p{margin-top:7px;font-size:15px;color:var(--ink2);line-height:1.55}

.rail{margin-top:30px}
.rail-track{display:grid;grid-auto-flow:column;grid-auto-columns:82%;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:4px 0 6px}
.rail-track::-webkit-scrollbar{display:none}
@media(min-width:680px){.rail-track{grid-auto-columns:47%}}
@media(min-width:1020px){.rail-track{grid-auto-columns:32%}}
.offer{scroll-snap-align:start;background:#fff;border:1px solid var(--line);border-radius:var(--r2);overflow:hidden;
  display:flex;flex-direction:column;transition:border-color .2s var(--ez),box-shadow .2s var(--ez)}
.offer:hover{border-color:var(--red-l);box-shadow:var(--sh2)}
.offer .ph{position:relative;background:var(--bg2)}
.offer img{width:100%;aspect-ratio:4/3;height:auto;object-fit:cover}
.offer--poster .ph{background:#fff}
.offer--poster img{object-fit:contain}
.offer .flag{position:absolute;top:12px;left:12px;font-size:11.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  background:var(--red);color:#fff;padding:5px 11px;border-radius:6px}
.offer .m{padding:18px 18px 20px}
.offer h3{font-size:17.5px;font-weight:600}
.offer p{margin-top:7px;font-size:15px;color:var(--ink2);line-height:1.55}
.rail-nav{display:flex;align-items:center;gap:12px;margin-top:18px}
.rail-nav button{width:46px;height:46px;border-radius:50%;border:1px solid var(--line2);background:#fff;display:grid;place-items:center;cursor:pointer;color:var(--ink);transition:.2s var(--ez)}
.rail-nav button:hover:not([disabled]){border-color:var(--red);color:var(--red)}
.rail-nav button[disabled]{opacity:.3;cursor:default}
.rail-bar{height:4px;border-radius:2px;background:var(--line);overflow:hidden;width:100%;max-width:220px}
.rail-bar i{display:block;height:100%;background:var(--red);border-radius:2px;transition:transform .25s var(--ez);transform-origin:left;transform:scaleX(.2)}

.revs{display:grid;gap:16px;margin-top:30px}
@media(min-width:760px){.revs{grid-template-columns:repeat(3,1fr)}}
.rev{background:#fff;border:1px solid var(--line);border-radius:var(--r2);padding:22px 20px;display:flex;flex-direction:column}
.rev .q{font-size:16.5px;line-height:1.5}
.rev .en{margin-top:10px;font-size:14.5px;color:var(--ink2);line-height:1.55}
.rev .who{margin-top:auto;padding-top:18px;display:flex;align-items:center;gap:11px}
.rev .who img{width:26px;height:auto;border-radius:3px;box-shadow:0 0 0 1px var(--line)}
.rev .nm{display:block;font-size:15px;font-weight:600;line-height:1.25}
.rev .cn{display:block;font-size:13px;color:var(--ink3);line-height:1.25}

.faq{margin-top:30px;border-top:1px solid var(--line);max-width:860px}
.faq details{border-bottom:1px solid var(--line)}
.faq summary{cursor:pointer;list-style:none;padding:18px 40px 18px 0;font-weight:600;font-size:17px;position:relative}
.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:"";position:absolute;right:8px;top:25px;width:10px;height:10px;border-right:2px solid var(--ink3);border-bottom:2px solid var(--ink3);transform:rotate(45deg);transition:transform .2s var(--ez)}
.faq details[open] summary:after{transform:rotate(-135deg);top:28px}
.faq .a{padding:0 0 20px;color:var(--ink2);font-size:16px;max-width:64ch}

.ins{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.ins img{height:40px;width:auto;border-radius:6px;background:#fff;padding:5px 9px;border:1px solid var(--line)}

footer{background:var(--bg2);border-top:1px solid var(--line);padding:40px 0 116px}
@media(min-width:820px){footer{padding-bottom:52px}}
.fgrid{display:grid;gap:28px}
@media(min-width:760px){.fgrid{grid-template-columns:1.1fr 1fr 1fr}}
footer img.flogo{height:58px;width:auto}
footer h3{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);margin-bottom:12px}
footer p{font-size:15px;color:var(--ink2);line-height:1.6}
footer .big{font-size:21px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
footer a.tel{text-decoration:none;color:var(--red)}
.fbase{margin-top:32px;padding-top:18px;border-top:1px solid var(--line);font-size:13.5px;color:var(--ink3);display:flex;flex-wrap:wrap;gap:8px 20px}
.fbase a{color:var(--ink2)}

.wa-float{position:fixed;right:20px;bottom:20px;z-index:890;display:flex;align-items:center;gap:10px;
  background:var(--wa);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 20px;border-radius:var(--pill);
  box-shadow:0 8px 25px -4px rgba(0,0,0,.32);transition:transform .2s var(--ez),box-shadow .2s var(--ez),background-color .2s var(--ez);
  padding-bottom:calc(14px + env(safe-area-inset-bottom,0))}
.wa-float .ico{width:22px;height:22px;stroke-width:2}
.wa-float:hover,.wa-float:focus-visible{background:var(--wa-deep);color:#fff;transform:translateY(-2px);box-shadow:0 12px 30px -4px rgba(0,0,0,.38)}
@media(min-width:768px){.wa-float{right:26px;bottom:26px}}


@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
`;

function render(c) {
  const L = D.links(c);
  const help = D.HELP.map(
    ([icon, title, note]) => `<div class="help-card"><div class="i">${svg(icon)}</div><h3>${esc(title)}</h3><p>${esc(note)}</p></div>`
  ).join('');

  const offers = D.OFFERS.map(
    ([tok, title, note, flag, poster]) => `<article class="offer${poster ? ' offer--poster' : ''}">
            <div class="ph"><img src="%%${tok}%%" alt="${esc(title)} at 24/7 Clinic" loading="lazy" width="1200" height="900">${flag ? `<span class="flag">${esc(flag)}</span>` : ''}</div>
            <div class="m"><h3>${esc(title)}</h3><p>${esc(note)}</p></div>
          </article>`
  ).join('');

  const reviews = c.reviews.map((k) => D.REVIEWS[k]).map(
    ([name, country, lang, quote, english]) => `<figure class="rev">
            <blockquote class="q" lang="${lang}">&ldquo;${esc(quote)}&rdquo;</blockquote>
            <p class="en">${esc(english)}</p>
            <figcaption class="who"><img src="%%${D.FLAG[country]}%%" alt="" width="26" height="18"><span><span class="nm">${esc(name)}</span><span class="cn">${esc(country)}</span></span></figcaption>
          </figure>`
  ).join('');

  const stories = D.STORIES.map(
    ([token, shape, who, what]) => `<figure class="film">
            ${D.video({ token, portrait: shape === 'portrait' })}
            <figcaption><b>${esc(who)}</b><span>${esc(what)}</span></figcaption>
          </figure>`
  ).join('');

  const team = D.TEAM.map(
    ([token, label]) => `<figure class="film">
            ${D.video({ token, portrait: true })}
            <figcaption><b>${esc(label)}</b></figcaption>
          </figure>`
  ).join('');

  const serviceFilms = D.SERVICE_FILMS.map(
    ([token, title, note]) => `<figure class="film">
            ${D.video({ token, portrait: true })}
            <figcaption><b>${esc(title)}</b><span>${esc(note)}</span></figcaption>
          </figure>`
  ).join('');

  const faqs = D.faqFor(c).map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a">${esc(a)}</div></details>`).join('');
  const insurers = D.INSURERS.map(([tok, name]) => `<img src="%%${tok}%%" alt="${esc(name)}" loading="lazy" width="120" height="40">`).join('');

  const walk = c.walkLoop
    ? D.video({ token: 'VHOWTOFIND', portrait: true, tag: 'The walk from the entrance' })
    : D.video({ token: 'VINTRO', portrait: true, tag: 'Where you are in your hotel' });

  return `<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}">
<link rel="canonical" href="https://www.247clinic.net${c.url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
<style>${CSS}</style>

<a class="skip" href="#main">Skip to content</a>

<header class="top">
  <div class="top-in">
    <a class="brand" href="https://www.247clinic.net" rel="noopener"><img src="%%C7LOGO%%" alt="24/7 Clinic" width="200" height="193"></a>
    <span class="sp"></span>
    <span class="hours">${svg('clock')}Open 24 hours</span>
    <a class="btn btn--red btn--sm" href="${L.tel}" data-ev="call_click">${svg('phone')}Call</a>
  </div>
</header>

<main id="main">
  <section class="hero">
    <div class="wrap hero-in">
      <div>
        <span class="badge"><span class="dot"></span>Open now, 24 hours</span>
        <h1>${esc(c.h1)}</h1>
        <p class="lead">${esc(c.lead)}</p>
        <div class="hero-cta">
          <a class="btn btn--red" href="${L.tel}" data-ev="call_click">${svg('phone')}Call now <span class="num">${D.PHONE}</span></a>
          <a class="btn btn--wa" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_click">${svg('wa')}WhatsApp</a>
        </div>
        <div class="hero-note">
          <span>${svg('pin')}${esc(c.area)}</span>
          <span>${svg('globe')}English speaking doctors</span>
          <span>${svg('shield')}Insurance handled</span>
        </div>
      </div>
      ${D.video({ token: 'VCOMMERCIAL', portrait: false, tag: 'The clinic film' })}
    </div>
  </section>

  <section class="hc">
    <div class="hc-in">
      <img src="%%POSTERHEALTH%%" alt="Free health check: free blood pressure and blood sugar check for hotel guests at 24/7 Clinic" loading="lazy" width="1080" height="1440">
      <div>
        <span class="free">Free for hotel guests</span>
        <h2>A health check, on the house</h2>
        <p class="note">Checked by a nurse while you wait. Nothing to pay, nothing to book.</p>
        <div class="hc-tiles">
          <div class="hc-tile"><span class="i">${svg('heart')}</span><span><b>Blood pressure</b><span>Checked in a minute</span></span></div>
          <div class="hc-tile"><span class="i">${svg('gauge')}</span><span><b>Blood sugar</b><span>One drop, one reading</span></span></div>
        </div>
        <div class="row">
          <a class="btn btn--white" href="${L.tel}" data-ev="call_click">${svg('phone')}Call the clinic</a>
          <span class="noappt">${svg('check')}No appointment needed</span>
        </div>
      </div>
    </div>
  </section>

  <section class="sec" id="find">
    <div class="wrap">
      <div class="kick">Where to find us</div>
      <h2>Getting to the clinic</h2>
      <div class="find">
        <div>
          <ol class="steps">${c.steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
          <figure class="findmap">
            <div class="frame" style="background-image:url(%%${c.mapImg}%%)">
              <iframe src="${L.embed}" title="Map of the 24/7 Clinic at ${esc(c.hotel)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <figcaption><span>${esc(c.hotel)}, ${esc(c.area)}</span>
              <a class="btn btn--line btn--sm" href="${L.maps}" target="_blank" rel="noopener" data-ev="directions_click">${svg('pin')}Directions</a></figcaption>
          </figure>
        </div>
        ${walk}
      </div>
    </div>
  </section>

  <section class="sec sec--tint">
    <div class="wrap">
      <div class="kick">How we can help</div>
      <h2>Urgent care, without leaving ${esc(c.area)}</h2>
      <div class="help">${help}</div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="kick">On now</div>
      <h2>What the clinic is offering</h2>
      <div class="rail" data-rail>
        <div class="rail-track" tabindex="0" role="region" aria-label="Offers at 24/7 Clinic">${offers}</div>
        <div class="rail-nav">
          <button type="button" data-prev aria-label="Previous">${svg('left')}</button>
          <button type="button" data-next aria-label="Next">${svg('right')}</button>
          <span class="rail-bar"><i data-bar></i></span>
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec--tint">
    <div class="wrap">
      <div class="kick">Guest stories</div>
      <h2>In their own words</h2>
      <div class="stories">${stories}</div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="kick">The team</div>
      <h2>The people who will see you</h2>
      <div class="films films--3">${team}</div>
    </div>
  </section>

  <section class="sec sec--tint">
    <div class="wrap">
      <div class="kick">At this clinic</div>
      <h2>What we do, filmed here</h2>
      <div class="films films--4">${serviceFilms}</div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="kick">Questions</div>
      <h2>What guests ask us</h2>
      <div class="faq">${faqs}</div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div class="fgrid">
      <div>
        <img class="flogo" src="%%C7LOGO%%" alt="24/7 Clinic" width="200" height="193">
        <p style="margin-top:14px">24/7 Urgent Care Clinic. Travel medical services for international guests in Egypt, part of Healthcare International Group.</p>
      </div>
      <div>
        <h3>The clinic</h3>
        <p class="big"><a class="tel" href="${L.tel}" data-ev="call_click">${D.PHONE}</a></p>
        <p style="margin-top:10px">${esc(c.hotel)}<br>${esc(c.area)}, ${esc(c.region)}<br>Open 24 hours, every day</p>
      </div>
      <div><h3>Insurance accepted</h3><div class="ins">${insurers}</div></div>
    </div>
    <div class="fbase">
      <span>24/7 Clinic &middot; ${esc(c.area)}</span>
      <a href="https://www.247clinic.net/our-clinics" target="_blank" rel="noopener">All clinics</a>
      <a href="https://www.247clinic.net/insurance" target="_blank" rel="noopener">Insurance</a>
      <a href="https://www.247clinic.net/contact-us" target="_blank" rel="noopener">Contact</a>
    </div>
  </div>
</footer>

<a class="wa-float" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_click" aria-label="Message 24/7 Clinic on WhatsApp">${svg('wa')}WhatsApp</a>

<script type="application/ld+json">${JSON.stringify(D.schemaFor(c))}</script>
${D.tracking(c)}
<script>${D.VIDEO_JS}</script>
<script>
(function () {
  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var track = rail.querySelector('.rail-track'), prev = rail.querySelector('[data-prev]'),
        next = rail.querySelector('[data-next]'), bar = rail.querySelector('[data-bar]');
    function step(){ var f = track.children[0]; return f ? f.getBoundingClientRect().width + 16 : 320; }
    function sync(){
      var max = track.scrollWidth - track.clientWidth, p = max > 0 ? track.scrollLeft / max : 1;
      bar.style.transform = 'scaleX(' + (0.2 + p * 0.8) + ')';
      prev.disabled = track.scrollLeft < 4; next.disabled = track.scrollLeft > max - 4;
    }
    prev.addEventListener('click', function(){ track.scrollBy({left:-step(),behavior:'smooth'}); });
    next.addEventListener('click', function(){ track.scrollBy({left:step(),behavior:'smooth'}); });
    track.addEventListener('scroll', function(){ requestAnimationFrame(sync); }, {passive:true});
    window.addEventListener('resize', sync); sync();
  });
})();
</script>
`;
}

module.exports = { NAME, NOTE, render };
