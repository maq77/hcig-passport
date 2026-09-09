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
.btn--glass{background:rgba(255,255,255,.14);color:#fff;border:1.5px solid rgba(255,255,255,.5);backdrop-filter:blur(8px)}
.btn--glass:hover{background:rgba(255,255,255,.26)}
.btn--sm{min-height:44px;font-size:15px;padding:0 18px}
.btn .num{font-weight:500;opacity:.9;font-size:15px}

/* header sits inside the hero, like MedPark v2 */
.top{position:absolute;top:0;left:0;right:0;z-index:60}
.top-in{max-width:var(--wrap);margin:0 auto;padding:14px 20px;display:flex;align-items:center;gap:14px}
@media(min-width:820px){.top-in{padding:18px 36px}}
.top .brand img{height:52px;width:auto;filter:drop-shadow(0 2px 10px rgba(0,0,0,.5))}
@media(min-width:820px){.top .brand img{height:62px}}
.top .sp{flex:1}
.top .chip{display:none;align-items:center;gap:8px;font-size:13.5px;font-weight:600;color:#fff;
  background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.34);padding:8px 14px;border-radius:var(--pill);backdrop-filter:blur(8px)}
.top .chip .ico{width:16px;height:16px}
@media(min-width:760px){.top .chip{display:inline-flex}}

/* ---------- hero, full bleed film ---------- */
.hero{position:relative;min-height:min(94vh,820px);display:flex;align-items:flex-end;overflow:hidden;background:#0E0C0B}
.hero video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero .scrim{position:absolute;inset:0;background:
  linear-gradient(180deg,rgba(14,12,11,.62) 0%,rgba(14,12,11,.22) 34%,rgba(14,12,11,.78) 76%,rgba(14,12,11,.94) 100%)}
.hero-in{position:relative;z-index:2;width:100%;max-width:var(--wrap);margin:0 auto;padding:0 20px 44px;color:#fff}
@media(min-width:820px){.hero-in{padding:0 36px 64px}}
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:12.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#fff}
.eyebrow .dot{width:9px;height:9px;border-radius:50%;background:var(--red);box-shadow:0 0 0 5px rgba(192,0,0,.28)}
@media (prefers-reduced-motion:no-preference){.eyebrow .dot{animation:beat 2.2s ease-in-out infinite}}
@keyframes beat{0%,100%{box-shadow:0 0 0 5px rgba(192,0,0,.28)}50%{box-shadow:0 0 0 12px rgba(192,0,0,0)}}
.hero h1{font-size:clamp(38px,8.4vw,86px);font-weight:700;margin-top:16px;max-width:15ch;color:#fff}
.hero .lead{margin-top:18px;font-size:clamp(17px,2.2vw,21px);color:rgba(255,255,255,.86);max-width:38ch}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
.hero-cta .btn{flex:1 1 auto;min-width:210px}
@media(min-width:820px){.hero-cta .btn{flex:0 0 auto}}
.hero .ctrl{position:absolute;right:20px;top:calc(50% - 21px);display:flex;flex-direction:column;gap:10px;z-index:3}
@media(min-width:820px){.hero .ctrl{right:36px}}
.hero .ctrl button{width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.34);cursor:pointer;
  background:rgba(14,12,11,.42);color:#fff;display:grid;place-items:center;backdrop-filter:blur(8px);transition:.2s var(--ez)}
.hero .ctrl button:hover{background:rgba(14,12,11,.75)}

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
.block--tall img,.block--tall video{aspect-ratio:3/4}
@media(min-width:900px){.block--tall img,.block--tall video{aspect-ratio:4/5}}

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
/* Icons draw themselves once, when the row scrolls in. */
@media (prefers-reduced-motion:no-preference){
  .js .way .i .ico path,.js .way .i .ico circle,.js .way .i .ico rect{
    stroke-dasharray:120;stroke-dashoffset:120}
  .way.in .i .ico path,.way.in .i .ico circle,.way.in .i .ico rect{
    animation:draw .9s var(--ez) forwards}
  @keyframes draw{to{stroke-dashoffset:0}}
}

/* ---------- offers rail ---------- */
.rail{margin-top:38px}
.rail-track{display:grid;grid-auto-flow:column;grid-auto-columns:84%;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:6px 0 8px}
.rail-track::-webkit-scrollbar{display:none}
@media(min-width:680px){.rail-track{grid-auto-columns:46%}}
@media(min-width:1020px){.rail-track{grid-auto-columns:33%}}
.offer{scroll-snap-align:start;position:relative;border-radius:var(--r);overflow:hidden;background:#0E0C0B;
  transition:transform .25s var(--ez)}
.offer:hover{transform:translateY(-4px)}
.offer img{width:100%;aspect-ratio:3/4;height:auto;object-fit:cover;opacity:.9}
.offer--poster img{object-fit:contain;background:#fff;opacity:1}
.offer .m{position:absolute;left:0;right:0;bottom:0;padding:24px 22px;color:#fff;
  background:linear-gradient(180deg,rgba(14,12,11,0),rgba(14,12,11,.88) 46%)}
.offer--poster .m{background:linear-gradient(180deg,rgba(14,12,11,0),rgba(14,12,11,.92) 40%)}
.offer h3{font-size:20px;font-weight:700;letter-spacing:-.025em}
.offer p{margin-top:8px;font-size:15px;color:rgba(255,255,255,.84);line-height:1.5}
.offer .flag{position:absolute;top:16px;left:16px;font-size:11.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  background:var(--red);color:#fff;padding:6px 12px;border-radius:6px}
.rail-nav{display:flex;align-items:center;gap:12px;margin-top:22px}
.rail-nav button{width:50px;height:50px;border-radius:50%;border:1.5px solid var(--line2);background:#fff;display:grid;place-items:center;cursor:pointer;transition:.2s var(--ez)}
.rail-nav button:hover:not([disabled]){border-color:var(--red);color:var(--red);transform:scale(1.06)}
.rail-nav button[disabled]{opacity:.3;cursor:default}
.rail-bar{height:4px;border-radius:2px;background:var(--line);overflow:hidden;width:100%;max-width:240px}
.rail-bar i{display:block;height:100%;background:var(--red);border-radius:2px;transition:transform .25s var(--ez);transform-origin:left;transform:scaleX(.2)}

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
.mapwrap .frame{background-size:cover;background-position:center}
.mapwrap iframe{width:100%;height:320px;border:0;display:block}

/* ---------- closing CTA ---------- */
.close{background:var(--ink);color:#fff;padding:64px 0}
@media(min-width:820px){.close{padding:92px 0}}
.close h2{color:#fff;max-width:16ch}
.close p{margin-top:16px;color:rgba(255,255,255,.72);font-size:18px;max-width:44ch}
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

.wa-float{position:fixed;right:20px;bottom:20px;z-index:890;display:flex;align-items:center;gap:10px;
  background:var(--wa);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 20px;border-radius:var(--pill);
  box-shadow:0 8px 25px -4px rgba(0,0,0,.32);transition:transform .2s var(--ez),box-shadow .2s var(--ez),background-color .2s var(--ez);
  padding-bottom:calc(14px + env(safe-area-inset-bottom,0))}
.wa-float .ico{width:22px;height:22px;stroke-width:2}
.wa-float:hover,.wa-float:focus-visible{background:var(--wa-deep);color:#fff;transform:translateY(-2px)}
@media(min-width:768px){.wa-float{right:26px;bottom:26px}}

.lb{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px}
.lb[hidden]{display:none}
.lb__scrim{position:absolute;inset:0;background:rgba(12,10,9,.9)}
.lb__box{position:relative;z-index:1;width:100%;max-width:1000px;aspect-ratio:16/9;background:#000;border-radius:var(--r);overflow:hidden}
.lb__box video{width:100%;height:100%;object-fit:contain;background:#000}
.lb__close{position:absolute;top:10px;right:10px;z-index:2;width:44px;height:44px;border-radius:50%;border:0;cursor:pointer;background:rgba(0,0,0,.6);color:#fff;display:grid;place-items:center}

/* scroll reveal */
@media (prefers-reduced-motion:no-preference){
  .js [data-rise]{opacity:0;transform:translateY(22px)}
  [data-rise].in{opacity:1;transform:none;transition:opacity .6s var(--ez),transform .6s var(--ez)}
}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
`;

function render(c) {
  const L = D.links(c);

  const ways = D.HELP.map(
    ([icon, title, note]) => `<div class="way" data-way><div class="i">${svg(icon)}</div><div><h3>${esc(title)}</h3><p>${esc(note)}</p></div></div>`
  ).join('');

  const offers = D.OFFERS.map(
    ([tok, title, note, flag, poster]) => `<article class="offer${poster ? ' offer--poster' : ''}">
            <img src="%%${tok}%%" alt="${esc(title)} at 24/7 Clinic" loading="lazy" width="1200" height="1600">
            ${flag ? `<span class="flag">${esc(flag)}</span>` : ''}
            <div class="m"><h3>${esc(title)}</h3><p>${esc(note)}</p></div>
          </article>`
  ).join('');

  const quotes = c.reviews.map((k) => D.REVIEWS[k]).map(
    ([name, country, lang, quote, english]) => `<figure class="quote" data-rise>
            <blockquote class="q" lang="${lang}">${esc(quote)}</blockquote>
            <p class="en">${esc(english)}</p>
            <figcaption class="who"><img src="%%${D.FLAG[country]}%%" alt="" width="28" height="19"><span><span class="nm">${esc(name)}</span><span class="cn">${esc(country)}</span></span></figcaption>
          </figure>`
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
    ? `<video autoplay muted loop playsinline preload="metadata" aria-label="The walk from the main entrance of ${esc(c.hotel)} to the 24/7 Clinic"><source src="%%C7LOOPWALK%%" type="video/mp4"></video>`
    : `<video autoplay muted loop playsinline preload="metadata" aria-label="Inside a 24/7 Clinic"><source src="%%C7LOOPCLINIC%%" type="video/mp4"></video>`;

  return `<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}">
<link rel="canonical" href="https://www.247clinic.net${c.url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
<style>${CSS}</style>
<script>document.documentElement.className += ' js';</script>

<a class="skip" href="#main">Skip to content</a>

<main id="main">
  <section class="hero">
    <video autoplay muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1">
      <source src="%%C7LOOPCLINIC%%" type="video/mp4"></video>
    <div class="scrim"></div>

    <header class="top">
      <div class="top-in">
        <a class="brand" href="https://www.247clinic.net" rel="noopener"><img src="%%C7LOGOW%%" alt="24/7 Clinic" width="200" height="193"></a>
        <span class="sp"></span>
        <span class="chip">${svg('clock')}Open 24 hours</span>
      </div>
    </header>

    <div class="ctrl">
      <button type="button" data-sound aria-label="Turn sound on">${svg('mute')}</button>
      <button type="button" data-lightbox aria-label="Watch the full film">${svg('play')}</button>
    </div>

    <div class="hero-in">
      <span class="eyebrow"><span class="dot"></span>${esc(c.area)} &middot; Open now</span>
      <h1>${esc(c.h1)}</h1>
      <p class="lead">${esc(c.lead)}</p>
      <div class="hero-cta">
        <a class="btn btn--red" href="${L.tel}" data-ev="call_click">${svg('phone')}Call now <span class="num">${D.PHONE}</span></a>
        <a class="btn btn--glass" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_click">${svg('wa')}WhatsApp</a>
      </div>
    </div>
  </section>

  <div class="ticker"><div class="ticker-in">${ticker}</div></div>

  <section class="sec" id="find">
    <div class="wrap">
      <div class="block block--tall">
        <div data-rise>
          <div class="kick">Where to find us</div>
          <h2>Three turns from your room</h2>
          <ol class="steps">${c.steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
          <figure class="mapwrap">
            <div class="frame" style="background-image:url(%%${c.mapImg}%%)">
              <iframe src="${L.embed}" title="Map of the 24/7 Clinic at ${esc(c.hotel)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </figure>
          <div style="margin-top:22px"><a class="btn btn--red" href="${L.maps}" target="_blank" rel="noopener" data-ev="directions_click">${svg('pin')}Directions in Google Maps</a></div>
        </div>
        <figure data-rise>${walkMedia}</figure>
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
      <div data-rise>
        <div class="kick">What guests say</div>
        <h2>In their own words</h2>
      </div>
      <div class="quotes">${quotes}</div>
    </div>
  </section>

  <section class="close">
    <div class="wrap">
      <h2 data-rise>A doctor is a phone call away.</h2>
      <p data-rise>Open 24 hours, every day of the year, in ${esc(c.area)}.</p>
      <div class="row" data-rise>
        <a class="btn btn--red" href="${L.tel}" data-ev="call_click">${svg('phone')}Call now <span class="num">${D.PHONE}</span></a>
        <a class="btn btn--wa" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_click">${svg('wa')}WhatsApp</a>
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

<div class="lb" hidden data-lb>
  <div class="lb__scrim" data-lb-close></div>
  <div class="lb__box">
    <button class="lb__close" type="button" data-lb-close aria-label="Close">${svg('close')}</button>
    <video controls playsinline preload="none" aria-label="Film of the 24/7 Clinic"><source src="%%C7FILM%%" type="video/mp4"></video>
  </div>
</div>

<script type="application/ld+json">${JSON.stringify(D.schemaFor(c))}</script>
${D.tracking(c)}
<script>
(function () {
  var MUTED = '<path d="M4 9.4h3.4L12 5.4v13.2l-4.6-4H4z"/><path d="m16.4 9.6 4.2 4.8M20.6 9.6l-4.2 4.8"/>';
  var LOUD = '<path d="M4 9.4h3.4L12 5.4v13.2l-4.6-4H4z"/><path d="M15.6 9.6a3.4 3.4 0 0 1 0 4.8M18 7.2a6.8 6.8 0 0 1 0 9.6"/>';
  var hero = document.querySelector('.hero video');
  document.querySelectorAll('[data-sound]').forEach(function (b) {
    b.addEventListener('click', function () {
      hero.muted = !hero.muted;
      b.setAttribute('aria-label', hero.muted ? 'Turn sound on' : 'Turn sound off');
      b.querySelector('svg').innerHTML = hero.muted ? MUTED : LOUD;
    });
  });

  var lb = document.querySelector('[data-lb]'), lbv = lb && lb.querySelector('video'), opener = null;
  function openLb(){ lb.hidden=false; lbv.play(); lb.querySelector('.lb__close').focus(); document.body.style.overflow='hidden'; }
  function closeLb(){ lbv.pause(); lb.hidden=true; document.body.style.overflow=''; if(opener) opener.focus(); }
  document.querySelectorAll('[data-lightbox]').forEach(function(b){ b.addEventListener('click', function(){ opener=b; openLb(); }); });
  if (lb) {
    lb.querySelectorAll('[data-lb-close]').forEach(function(b){ b.addEventListener('click', closeLb); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !lb.hidden) closeLb(); });
  }

  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var track = rail.querySelector('.rail-track'), prev = rail.querySelector('[data-prev]'),
        next = rail.querySelector('[data-next]'), bar = rail.querySelector('[data-bar]');
    function step(){ var f = track.children[0]; return f ? f.getBoundingClientRect().width + 20 : 340; }
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

  /* Reveal on scroll, with a failsafe so nothing can stay hidden. */
  var targets = document.querySelectorAll('[data-rise], [data-way]');
  function showAll(){ targets.forEach(function(el){ el.classList.add('in'); }); }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        var el = en.target;
        window.setTimeout(function(){ el.classList.add('in'); }, (i % 4) * 70);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
    window.setTimeout(showAll, 2500);
  }
})();
</script>
`;
}

module.exports = { NAME, NOTE, render };
