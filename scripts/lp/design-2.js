/**
 * Design 2: Bold and cinematic.
 *
 * The film runs full bleed behind the headline, the type is much larger, the
 * icons draw themselves on scroll, and the sections alternate as big
 * image-and-text blocks instead of a card grid. The page ground is still white,
 * per the brand guideline; the hero is a photograph, not a coloured background.
 *
 * Motion is CSS and the Web Animations API, never a framework. These pages have
 * to drop into an ASP.NET site as plain HTML, and shipping React to move a few
 * elements would cost more than it buys. Every animation is behind
 * `prefers-reduced-motion` and behind a `js` class, with a timeout failsafe, so
 * nothing can stay invisible if a script fails.
 */

const D = require('./data');
const { esc, svg } = D;

const NAME = 'Bold and cinematic';
const NOTE = 'Full-bleed film, big type, icons that draw themselves, alternating blocks.';

const CSS = `
:root{
  --red:#C00000; --red-d:#960000; --red-t:#FCEDED; --red-l:#F1CFCF;
  --ink:#0E0C0B; --ink2:#4A4441; --ink3:#7A736E;
  --bg:#FFFFFF; --bg2:#F6F3F0;
  --line:#E7E2DD; --line2:#D2CBC4;
  --wa:#25D366; --wa-deep:#128C7E;
  --f:"Poppins","Segoe UI",system-ui,-apple-system,Arial,sans-serif;
  --pill:999px; --r:20px;
  --ez:cubic-bezier(.22,.61,.36,1);
  --wrap:1180px;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f);font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3{margin:0;line-height:1.05;letter-spacing:-.04em;text-wrap:balance}
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
@media(min-width:820px){.wrap{padding:0 36px}}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:58px;padding:0 26px;
  border-radius:var(--pill);border:0;cursor:pointer;font-weight:600;font-size:17px;letter-spacing:-.01em;text-decoration:none;
  transition:background-color .2s var(--ez),transform .12s var(--ez),box-shadow .2s var(--ez)}
.btn:active{transform:scale(.98)}
.btn--red{background:var(--red);color:#fff;box-shadow:0 14px 34px -12px rgba(192,0,0,.65)}
.btn--red:hover{background:var(--red-d)}
.btn--wa{background:var(--wa);color:#fff}
.btn--wa:hover{background:var(--wa-deep)}
.btn--glass{background:var(--wa);color:#fff}
.btn--glass:hover{background:var(--wa-deep)}
.btn--watch{background:#fff;color:var(--red);border:1.5px solid var(--red-l)}
.btn--watch:hover{background:var(--red);color:#fff;border-color:var(--red)}
.team-one{margin:30px auto 0;max-width:330px}
.btn--sm{min-height:44px;font-size:15px;padding:0 18px}
.btn .num{font-weight:500;opacity:.9;font-size:15px}

/* header sits inside the hero, like MedPark v2 */
.top{position:absolute;top:0;left:0;right:0;z-index:60}
.top-in{max-width:var(--wrap);margin:0 auto;padding:14px 20px;display:flex;align-items:center;gap:14px}
@media(min-width:820px){.top-in{padding:18px 36px}}
.top .brand img{height:56px;width:auto}
@media(min-width:820px){.top .brand img{height:62px}}
.top .sp{flex:1}
.top .chip{display:none;align-items:center;gap:8px;font-size:13.5px;font-weight:600;color:var(--ink);
  background:rgba(255,255,255,.92);border:1px solid var(--line);padding:8px 14px;border-radius:var(--pill);backdrop-filter:blur(8px)}
.top .chip .ico{width:16px;height:16px}
@media(min-width:760px){.top .chip{display:inline-flex}}

/* ---------- hero, full bleed film ---------- */
.hero{position:relative;min-height:min(92vh,780px);display:flex;align-items:flex-end;overflow:hidden;background:#EFEBE7}
.hero video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero .scrim{display:none}
.hero-in{position:relative;z-index:2;width:100%;max-width:var(--wrap);margin:0 auto;padding:0 20px 32px}
@media(min-width:820px){.hero-in{padding:0 36px 52px}}
/* ---------- the hero gradient scrim ----------
   A scrim is the translucent layer over a photograph or film that keeps text
   legible. This one is white rather than black, and it is a gradient: opaque
   where the words sit, clear where the film should show.

   Lightened 2026-09-09 at his request, a little only. The previous values are
   kept here so going back is one edit:

     mobile   .90 0%, .55 26%, 0 52%
     desktop  .97 0%, .93 36%, .55 56%, 0 74%

   Ink on white at .84 over a bright film still measures well past 4.5:1, so
   the headline stays readable at the lighter setting. */
.hero-card{max-width:620px;padding:26px 0 4px}
.hero:before{content:"";position:absolute;inset:0;z-index:1;background:
  linear-gradient(180deg,rgba(255,255,255,.84) 0%,rgba(255,255,255,.46) 26%,rgba(255,255,255,0) 50%)}
@media(min-width:900px){
  .hero:before{background:linear-gradient(100deg,rgba(255,255,255,.93) 0%,rgba(255,255,255,.86) 34%,rgba(255,255,255,.42) 54%,rgba(255,255,255,0) 72%)}
  .hero-card{padding:36px 0 8px}
}
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:12.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--red)}
.eyebrow .dot{width:9px;height:9px;border-radius:50%;background:var(--red);box-shadow:0 0 0 5px rgba(192,0,0,.28)}
@media (prefers-reduced-motion:no-preference){.eyebrow .dot{animation:beat 2.2s ease-in-out infinite}}
@keyframes beat{0%,100%{box-shadow:0 0 0 5px rgba(192,0,0,.28)}50%{box-shadow:0 0 0 12px rgba(192,0,0,0)}}
.hero h1{font-size:clamp(34px,6.4vw,64px);font-weight:700;margin-top:14px;max-width:15ch}
.hero .lead{margin-top:14px;font-size:clamp(16.5px,2vw,19px);color:var(--ink2);max-width:38ch}
/* Her brief asks for three buttons above the fold: call, WhatsApp, find the
   clinic. Watch video is a fourth and a lesser one, so it shares a row rather
   than running the full width and out-weighing the three that matter.
   Two by two at every width. The hero is a split layout, so the column these
   sit in is never wide enough for four across, whatever the window says. */
.hero-cta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:26px;max-width:520px}
.hero-cta .btn{width:100%;min-width:0;white-space:nowrap;padding:0 16px}
.btn--find{background:#fff;color:var(--ink);border-color:var(--ink)}
.btn--find:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
.hero .ctrl{position:absolute;right:20px;bottom:24px;display:flex;gap:10px;z-index:4}
@media(min-width:820px){.hero .ctrl{right:36px}}
.hero .ctrl button{width:46px;height:46px;border-radius:50%;border:1px solid var(--line);cursor:pointer;
  background:rgba(255,255,255,.92);color:var(--ink);display:grid;place-items:center;backdrop-filter:blur(8px);transition:.2s var(--ez)}
.hero .ctrl button:hover{background:#fff;color:var(--red)}

/* ---------- ticker ---------- */
.ticker{background:var(--red);color:#fff;overflow:hidden;border-block:0}
.ticker-in{display:flex;gap:0;white-space:nowrap;padding:13px 0;font-size:14.5px;font-weight:600;letter-spacing:.02em}
.ticker span{padding:0 26px;display:inline-flex;align-items:center;gap:10px}
.ticker span:after{content:"";width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.6);margin-left:26px}
@media (prefers-reduced-motion:no-preference){
  .ticker-in{animation:slide 34s linear infinite}
  @keyframes slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}
}

/* ---------- sections ---------- */
.sec{padding:60px 0;scroll-margin-top:20px}
@media(min-width:820px){.sec{padding:96px 0}}
.sec--tint{background:var(--bg2)}
.kick{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--red)}
h2{font-size:clamp(30px,5.4vw,52px);font-weight:700;margin-top:14px}
.sub{margin-top:16px;color:var(--ink2);font-size:18px;max-width:46ch}

/* ---------- alternating blocks ---------- */
.block{display:grid;gap:30px;align-items:center}
@media(min-width:900px){.block{grid-template-columns:1fr 1fr;gap:64px}}
.block + .block{margin-top:60px}
@media(min-width:900px){.block + .block{margin-top:96px}
  .block--flip > *:first-child{order:2}}
.block figure{border-radius:var(--r);overflow:hidden;background:var(--bg2)}
.block img,.block video{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover}
.block--tall img,.block--tall video{aspect-ratio:3/4;height:auto}
@media(min-width:900px){.block--tall img,.block--tall video{aspect-ratio:4/5}}
/* A 9:16 film in a half-page column runs to 940px. Cap it. */
.block--tall .v{max-width:400px;margin-inline:auto}

/* ---------- steps ---------- */
ol.steps{list-style:none;margin:26px 0 0;padding:0;counter-reset:s;display:grid;gap:22px}
ol.steps li{counter-increment:s;position:relative;padding-left:62px;font-size:18px;line-height:1.5}
ol.steps li:before{content:counter(s);position:absolute;left:0;top:-6px;width:44px;height:44px;border-radius:50%;
  background:var(--red);color:#fff;font-size:18px;font-weight:700;display:grid;place-items:center;
  box-shadow:0 10px 24px -10px rgba(192,0,0,.7)}

/* ---------- animated icon list ---------- */
.ways{display:grid;gap:2px;margin-top:34px;background:var(--line);border-radius:var(--r);overflow:hidden;border:1px solid var(--line)}
@media(min-width:700px){.ways{grid-template-columns:1fr 1fr}}
.way{background:#fff;padding:26px 24px;display:flex;gap:18px;align-items:flex-start;transition:background-color .2s var(--ez)}
.way:hover{background:var(--red-t)}
.way .i{width:52px;height:52px;flex:none;border-radius:14px;background:var(--red-t);color:var(--red);display:grid;place-items:center}
.way:hover .i{background:#fff}
.way .i .ico{width:27px;height:27px;stroke-width:1.7}
.way h3{font-size:19px;font-weight:600;letter-spacing:-.02em}
.way p{margin-top:6px;font-size:15.5px;color:var(--ink2);line-height:1.55}


${D.VIDEO_CSS}
.v{border-radius:var(--r)}

/* ---------- free health check ---------- */
.hc{background:var(--bg2);border-block:1px solid var(--line);overflow:hidden}
.hc-in{max-width:var(--wrap);margin:0 auto;padding:56px 20px;display:grid;gap:34px;align-items:center}
@media(min-width:900px){.hc-in{grid-template-columns:.72fr 1.28fr;gap:60px;padding:88px 36px}}
.hc img{width:100%;height:auto;border-radius:var(--r);box-shadow:0 24px 56px -26px rgba(20,18,16,.42)}
.hc .free{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;background:var(--red);color:#fff;padding:7px 15px;border-radius:6px}
.hc h2{margin-top:20px}
.hc .sub{margin-top:16px;color:var(--ink2)}
.hc-tiles{display:grid;gap:14px;margin-top:30px}
@media(min-width:560px){.hc-tiles{grid-template-columns:1fr 1fr}}
.hc-tile{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:22px;display:flex;gap:16px;align-items:center}
.hc-tile .i{width:52px;height:52px;flex:none;border-radius:14px;background:var(--red);color:#fff;display:grid;place-items:center}
.hc-tile .i .ico{width:28px;height:28px;stroke-width:1.7}
.hc-tile b{display:block;font-size:18px;font-weight:600}
.hc-tile span{display:block;font-size:14.5px;color:var(--ink3);margin-top:3px}
.hc .row{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-top:30px}
.hc .noappt{display:inline-flex;align-items:center;gap:10px;font-size:16px;color:var(--ink2)}
.hc .noappt .ico{width:20px;height:20px;stroke-width:2.6;color:var(--red)}
@media (prefers-reduced-motion:no-preference){
  .hc-tile .i .ico{animation:hcPulse 3.2s var(--ez) infinite}
  .hc-tile:nth-child(2) .i .ico{animation-delay:1.1s}
  @keyframes hcPulse{0%,70%,100%{transform:scale(1)}12%{transform:scale(1.14)}24%{transform:scale(1)}36%{transform:scale(1.1)}}
}

/* ---------- film grids ---------- */
.films{display:grid;gap:20px;margin-top:38px}
@media(min-width:760px){.films--3{grid-template-columns:repeat(3,1fr)}}
@media(min-width:960px){.films--4{grid-template-columns:repeat(4,1fr)}}
.film figcaption{margin-top:14px}
.film b{display:block;font-size:18px;font-weight:600;letter-spacing:-.02em}
.film span{display:block;margin-top:5px;font-size:15px;color:var(--ink2);line-height:1.5}
${D.CAROUSEL_CSS}
${D.OTHERS_CSS}
.sec--tint .sec-head{margin-bottom:30px}
${D.MOTION_CSS}

/* ---------- offer cards. Light, per the no-dark rule. ---------- */
.offer{background:#fff;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;
  display:flex;flex-direction:column;transition:transform .25s var(--ez),box-shadow .25s var(--ez)}
.offer:hover{transform:translateY(-4px);box-shadow:0 20px 44px -22px rgba(20,18,16,.34)}
.offer .ph{position:relative;background:var(--bg2)}
.offer img{width:100%;aspect-ratio:4/3;height:auto;object-fit:cover}
.offer--poster .ph{background:#fff}
.offer--poster img{object-fit:contain}
.offer .flag{position:absolute;top:14px;left:14px;font-size:11.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;background:var(--red);color:#fff;padding:6px 12px;border-radius:6px}
.offer .m{padding:22px 20px 24px}
.offer h3{font-size:20px;font-weight:700;letter-spacing:-.025em}
.offer p{margin-top:8px;font-size:15px;color:var(--ink2);line-height:1.5}

/* ---------- offers rail ---------- */

/* ---------- big quote ---------- */
.quotes{display:grid;gap:22px;margin-top:38px}
@media(min-width:900px){.quotes{grid-template-columns:repeat(3,1fr);gap:26px}}
.quote{position:relative;padding-top:34px}
.quote:before{content:"\\201C";position:absolute;top:-14px;left:-4px;font-size:86px;line-height:1;color:var(--red);opacity:.28;font-family:Georgia,serif}
.quote .q{font-size:20px;line-height:1.42;letter-spacing:-.02em;font-weight:500}
.quote .en{margin-top:12px;font-size:15px;color:var(--ink2);line-height:1.55}
.quote .who{margin-top:18px;display:flex;align-items:center;gap:11px}
.quote .who img{width:28px;height:auto;border-radius:3px;box-shadow:0 0 0 1px var(--line)}
.quote .nm{display:block;font-size:15px;font-weight:600;line-height:1.25}
.quote .cn{display:block;font-size:13px;color:var(--ink3);line-height:1.25}

/* ---------- map ---------- */
.mapwrap{margin-top:26px;border-radius:var(--r);overflow:hidden;border:1px solid var(--line)}
.mapwrap .frame{background:var(--sand2,#F2EDE6)}
.mapwrap iframe{width:100%;height:320px;border:0;display:block}

/* ---------- closing CTA ---------- */
.close{background:var(--red-t);border-block:1px solid var(--red-l);padding:64px 0}
@media(min-width:820px){.close{padding:92px 0}}
.close h2{max-width:16ch}
.close p{margin-top:16px;color:var(--ink2);font-size:18px;max-width:44ch}
.close .row{display:flex;flex-wrap:wrap;gap:14px;margin-top:32px}
.close .row .btn{min-width:220px}

/* ---------- faq ---------- */
.faq{margin-top:34px;max-width:900px}
.faq details{border-bottom:1px solid var(--line)}
.faq details:first-child{border-top:1px solid var(--line)}
.faq summary{cursor:pointer;list-style:none;padding:22px 44px 22px 0;font-weight:600;font-size:18.5px;position:relative;letter-spacing:-.02em}
.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:"";position:absolute;right:10px;top:29px;width:11px;height:11px;border-right:2.2px solid var(--red);border-bottom:2.2px solid var(--red);transform:rotate(45deg);transition:transform .22s var(--ez)}
.faq details[open] summary:after{transform:rotate(-135deg);top:33px}
.faq .a{padding:0 0 24px;color:var(--ink2);font-size:16.5px;max-width:66ch}

/* ---------- footer ---------- */
footer{background:var(--bg2);padding:48px 0 116px;border-top:1px solid var(--line)}
@media(min-width:820px){footer{padding-bottom:56px}}
.fgrid{display:grid;gap:30px}
@media(min-width:760px){.fgrid{grid-template-columns:1.1fr 1fr 1fr}}
footer img.flogo{height:62px;width:auto}
footer h3{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ink3);margin-bottom:14px}
footer p{font-size:15px;color:var(--ink2);line-height:1.65}
footer .big{font-size:23px;font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
footer a.tel{text-decoration:none;color:var(--red)}
.ins{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.ins img{height:42px;width:auto;border-radius:8px;background:#fff;padding:6px 10px;border:1px solid var(--line)}
.fbase{margin-top:34px;padding-top:20px;border-top:1px solid var(--line);font-size:13.5px;color:var(--ink3);display:flex;flex-wrap:wrap;gap:8px 22px}
.fbase a{color:var(--ink2)}
${D.CREDIT_CSS}

.wa-float{position:fixed;right:20px;bottom:20px;z-index:890;display:flex;align-items:center;gap:10px;
  background:var(--wa);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 20px;border-radius:var(--pill);
  box-shadow:0 8px 25px -4px rgba(0,0,0,.32);transition:transform .2s var(--ez),box-shadow .2s var(--ez),background-color .2s var(--ez);
  padding-bottom:calc(14px + env(safe-area-inset-bottom,0))}
.wa-float .ico{width:22px;height:22px;stroke-width:2}
.wa-float:hover,.wa-float:focus-visible{background:var(--wa-deep);color:#fff;transform:translateY(-2px)}
@media(min-width:768px){.wa-float{right:26px;bottom:26px}}


/* scroll reveal */
${D.REVEAL_CSS}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
`;

function render(c, designNo) {
  const L = D.links(c);

  const ways = D.HELP.map(
    ([icon, title, note]) => `<div class="way" data-way><div class="i">${svg(icon)}</div><div><h3>${esc(title)}</h3><p>${esc(note)}</p></div></div>`
  ).join('');

  const offers = D.OFFERS.map(
    ([tok, title, note, flag, poster]) => `<article class="car-item offer${poster ? ' offer--poster' : ''}">
            <div class="ph"><img src="%%${tok}%%" alt="${esc(title)} at 24/7 Clinic" loading="lazy" width="1200" height="900">${flag ? `<span class="flag">${esc(flag)}</span>` : ''}</div>
            <div class="m"><h3>${esc(title)}</h3><p>${esc(note)}</p></div>
          </article>`
  ).join('');


  const faqs = D.faqFor(c).map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a">${esc(a)}</div></details>`).join('');
  const insurers = D.INSURERS.map(([tok, name]) => `<img src="%%${tok}%%" alt="${esc(name)}" loading="lazy" width="120" height="42">`).join('');

  const tickerItems = [
    'Open 24 hours, every day',
    'English speaking doctors',
    'Free health check for hotel guests',
    `In ${c.area}`,
    'Insurance paperwork handled',
    'Dental emergencies treated',
  ];
  const ticker = tickerItems.concat(tickerItems).map((t) => `<span>${esc(t)}</span>`).join('');

  const walkMedia = c.walkLoop
    ? D.video({ token: 'VHOWTOFIND', shape: 'portrait', tag: 'The walk from the entrance' })
    : D.video({ token: 'VINTRO', shape: 'portrait', tag: 'Where you are in your hotel' });

  const stories = D.stories();

  const team = D.video({ token: c.teamFilm, shape: 'portrait', label: 'Meet the team' });


  return `${D.head(c)}
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
<style>${CSS}</style>
<script>document.documentElement.className += ' js';</script>

<a class="skip" href="#main">Skip to content</a>
<div class="m-bar" aria-hidden="true"></div>

<main id="main">
  <section class="hero">
    <video autoplay muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1"
           src="%%VCOMMERCIAL%%"></video>
    <div hidden data-herofilm data-shape="landscape" data-src="%%VCOMMERCIAL%%"><button type="button" data-vwatch></button></div>
    <div class="scrim"></div>

    <header class="top">
      <div class="top-in">
        <a class="brand" href="https://www.247clinic.net" rel="noopener"><img src="%%C7LOGO%%" alt="24/7 Clinic" width="200" height="193"></a>
        <span class="sp"></span>
        <span class="chip">${svg('clock')}Open 24 hours</span>
      </div>
    </header>

    <div class="ctrl">
      <button type="button" data-sound aria-label="Turn sound on">${svg('mute')}</button>
      <button type="button" data-lightbox aria-label="Watch the full film">${svg('play')}</button>
    </div>

    <div class="hero-in">
      <div class="hero-card">
      <span class="eyebrow"><span class="dot"></span>${esc(c.area)} &middot; Open now</span>
      <h1>${esc(c.h1)}</h1>
      <p class="lead">${esc(c.lead)}</p>
      <div class="hero-cta">
        <a class="btn btn--red m-press" href="${L.tel}" data-ev="phone_click">${svg('phone')}Call now</a>
        <a class="btn btn--glass m-press" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">${svg('wa')}WhatsApp</a>
        <a class="btn btn--find m-press" href="#find" data-ev="clinic_directions_click">${svg('pin')}Find the clinic</a>
        <button class="btn btn--watch m-press" type="button" data-herowatch>${svg('play')}Watch video</button>
      </div>
      </div>
    </div>
  </section>

  <div class="ticker"><div class="ticker-in">${ticker}</div></div>

  <section class="hc">
    <div class="hc-in">
      <img src="%%POSTERHEALTH%%" alt="Free health check: free blood pressure and blood sugar check for hotel guests at 24/7 Clinic" loading="lazy" width="1080" height="1440">
      <div>
        <span class="free">Free for hotel guests</span>
        <h2>A health check, on the house</h2>
        <p class="sub">Checked by a nurse while you wait. Nothing to pay, nothing to book.</p>
        <div class="hc-tiles">
          <div class="hc-tile"><span class="i">${svg('heart')}</span><span><b>Blood pressure</b><span>Checked in a minute</span></span></div>
          <div class="hc-tile"><span class="i">${svg('gauge')}</span><span><b>Blood sugar</b><span>One drop, one reading</span></span></div>
        </div>
        <div class="row">
          <a class="btn btn--red m-press" href="${L.tel}" data-ev="phone_click">${svg('phone')}Call the clinic</a>
          <span class="noappt">${svg('check')}No appointment needed</span>
        </div>
      </div>
    </div>
  </section>

  <section class="sec" id="find">
    <div class="wrap">
      <div class="block block--tall">
        <div data-rise>
          <div class="kick">Where to find us</div>
          <h2>Three turns from your room</h2>
          <ol class="steps">${c.steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
          <figure class="mapwrap">
            <div class="frame">
              <iframe src="${L.embed}" title="Map of the 24/7 Clinic at ${esc(c.hotel)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </figure>
          <div style="margin-top:22px"><a class="btn btn--red m-press" href="${L.maps}" target="_blank" rel="noopener" data-ev="clinic_directions_click">${svg('pin')}Directions in Google Maps</a></div>
        </div>
        <div data-rise>${walkMedia}</div>
      </div>
    </div>
  </section>

  <section class="sec sec--tint">
    <div class="wrap">
      <div data-rise>
        <div class="kick">How we can help</div>
        <h2>Whatever went wrong, start here</h2>
      </div>
      <div class="ways">${ways}</div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div data-rise>
        <div class="kick">On now</div>
        <h2>What the clinic is offering</h2>
      </div>
      ${D.carousel({ items: offers, label: "Offers at 24/7 Clinic" })}
    </div>
  </section>

  <section class="sec sec--tint">
    <div class="wrap">
      <div data-rise><div class="kick">Guest stories</div><h2>In their own words</h2></div>
      ${D.carousel({ items: stories, label: "Guest stories" })}
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div data-rise><div class="kick">The team</div><h2>The people who will see you</h2></div>
      <div class="team-one" data-rise>${team}</div>
    </div>
  </section>

  <section class="sec sec--tint">
    <div class="wrap">
      <div data-rise><div class="kick">At this clinic</div><h2>What we do, filmed here</h2></div>
      ${D.carousel({ items: D.serviceFilms(), label: "What we do at this clinic", size: "sm" })}
    </div>
  </section>

  <section class="close">
    <div class="wrap">
      <h2 data-rise>A doctor is a phone call away.</h2>
      <p data-rise>Open 24 hours, every day of the year, in ${esc(c.area)}.</p>
      <div class="row" data-rise>
        <a class="btn btn--red m-press" href="${L.tel}" data-ev="phone_click">${svg('phone')}Call now</a>
        <a class="btn btn--wa m-press" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">${svg('wa')}WhatsApp</a>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div data-rise>
        <div class="kick">Questions</div>
        <h2>What guests ask us</h2>
      </div>
      <div class="faq">${faqs}</div>
    </div>
  </section>

  <section class="sec sec--tint">
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
      <div><h3>Insurance accepted</h3><div class="ins">${insurers}</div></div>
    </div>
    <div class="fbase">
      <span>24/7 Clinic &middot; ${esc(c.area)}</span>
      <a href="https://www.247clinic.net/our-clinics" target="_blank" rel="noopener">All clinics</a>
      <a href="https://www.247clinic.net/insurance" target="_blank" rel="noopener">Insurance</a>
      <a href="https://www.247clinic.net/contact-us" target="_blank" rel="noopener">Contact</a>
      ${D.credit()}
    </div>
  </div>
</footer>

<a class="wa-float" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_medical_click" aria-label="Message 24/7 Clinic on WhatsApp">${svg('wa')}WhatsApp</a>

${D.viewer()}

<script type="application/ld+json">${JSON.stringify(D.schemaFor(c))}</script>
<script type="application/ld+json">${JSON.stringify(D.otherClinicsSchema(c))}</script>
${D.tracking(c)}
<script>${D.VIDEO_JS}${D.CAROUSEL_JS}${D.REVEAL_JS}</script>
<script>
(function () {
  var b = document.querySelector('[data-herowatch]');
  if (!b) return;
  b.addEventListener('click', function () {
    var hero = document.querySelector('[data-herofilm]');
    if (hero) hero.querySelector('[data-vwatch]').click();
  });
})();
</script>
`;
}

module.exports = { NAME, NOTE, render };
