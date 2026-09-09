/**
 * Design 3: Concierge.
 *
 * The calm one. It reads like a hotel service card rather than a clinic
 * website: warm white, generous space, thin rules instead of shadows, and the
 * headlines set in Calisto MT, which the 24/7 brand guideline reserves for
 * headlines and the tagline. Georgia stands in where Calisto is not installed,
 * so nothing structural depends on it loading.
 *
 * The guest is greeted rather than triaged: three ways to reach us sit right
 * under the headline, the walk becomes a horizontal timeline, and one large
 * guest quote rotates instead of three small cards.
 */

const D = require('./data');
const { esc, svg } = D;

const NAME = 'Concierge';
const NOTE = 'Calm and premium. Calisto MT headlines, thin rules, a timeline and one rotating quote.';

const CSS = `
:root{
  --red:#C00000; --red-d:#960000; --red-t:#FBF0EF; --red-l:#EBD3D1;
  --ink:#1A1614; --ink2:#57504C; --ink3:#8A817B;
  --bg:#FFFFFF; --sand:#FAF7F3; --sand2:#F2EDE6;
  --line:#E6DFD6; --line2:#CFC5B8;
  --wa:#25D366; --wa-deep:#128C7E;
  --f:"Poppins","Segoe UI",system-ui,-apple-system,Arial,sans-serif;
  --fh:"Calisto MT",Georgia,"Times New Roman",serif;
  --pill:999px; --r:4px;
  --ez:cubic-bezier(.22,.61,.36,1);
  --wrap:1080px;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f);font-size:16.5px;line-height:1.68;-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3{margin:0;font-family:var(--fh);font-weight:400;line-height:1.18;letter-spacing:-.005em;text-wrap:balance}
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

.tag{font-family:var(--fh);font-size:11.5px;letter-spacing:.26em;text-transform:uppercase;color:var(--ink3)}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:54px;padding:0 26px;
  border:1px solid var(--ink);border-radius:var(--r);cursor:pointer;font-weight:500;font-size:16px;text-decoration:none;
  background:transparent;color:var(--ink);transition:.22s var(--ez)}
.btn:hover{background:var(--ink);color:#fff}
.btn--red{background:var(--red);border-color:var(--red);color:#fff}
.btn--red:hover{background:var(--red-d);border-color:var(--red-d);color:#fff}
.btn--wa{background:var(--wa);border-color:var(--wa);color:#fff}
.btn--wa:hover{background:var(--wa-deep);border-color:var(--wa-deep);color:#fff}
.btn--sm{min-height:44px;font-size:14.5px;padding:0 18px}

/* ---------- header ---------- */
.top{border-bottom:1px solid var(--line);background:#fff;position:sticky;top:0;z-index:80}
.top-in{max-width:var(--wrap);margin:0 auto;padding:12px 22px;display:flex;align-items:center;gap:16px}
@media(min-width:820px){.top-in{padding:14px 40px}}
.top .brand img{height:48px;width:auto}
@media(min-width:820px){.top .brand img{height:58px}}
.top .sp{flex:1}
.top .open{display:none;font-family:var(--fh);font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink2)}
@media(min-width:700px){.top .open{display:block}}

/* ---------- hero ---------- */
.hero{padding:52px 0 0}
@media(min-width:900px){.hero{padding:76px 0 0}}
.hero .tag{display:block}
.hero h1{font-size:clamp(36px,6.6vw,62px);margin-top:20px;max-width:17ch}
.hero .lead{margin-top:20px;font-size:clamp(17px,2vw,19.5px);color:var(--ink2);max-width:44ch}
.hero-rule{height:1px;background:var(--line);margin:40px 0 0}

/* three ways to reach us */
.ways3{display:grid;gap:0;border-bottom:1px solid var(--line)}
@media(min-width:760px){.ways3{grid-template-columns:repeat(3,1fr)}}
.way3{padding:28px 0;border-top:1px solid var(--line);display:flex;gap:16px;align-items:flex-start;text-decoration:none;transition:.22s var(--ez)}
@media(min-width:760px){.way3{padding:32px 26px;border-top:0;border-left:1px solid var(--line)}
  .way3:first-child{border-left:0;padding-left:0}}
.way3:hover{background:var(--sand)}
.way3 .i{width:44px;height:44px;flex:none;border:1px solid var(--line2);border-radius:50%;display:grid;place-items:center;color:var(--red);transition:.22s var(--ez)}
.way3:hover .i{border-color:var(--red);background:var(--red-t)}
.way3 h2{display:block;font-family:var(--f);font-size:16.5px;font-weight:600;letter-spacing:-.01em}
.way3 .v{display:block;margin-top:3px;font-size:16px;color:var(--red);font-variant-numeric:tabular-nums;font-weight:500}
.way3 .n{display:block;margin-top:4px;font-size:14px;color:var(--ink3);line-height:1.5}

/* ---------- media band ---------- */
.band{position:relative;background:var(--sand2)}
.band video{width:100%;height:auto;aspect-ratio:21/9;object-fit:cover;display:block}
@media(max-width:760px){.band video{aspect-ratio:4/3}}
.band .ctrl{position:absolute;right:16px;bottom:16px;display:flex;gap:10px}
.band .ctrl button{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.5);cursor:pointer;
  background:rgba(26,22,20,.42);color:#fff;display:grid;place-items:center;backdrop-filter:blur(8px)}
.band .ctrl button:hover{background:rgba(26,22,20,.78)}

${D.VIDEO_CSS}
.v{border:1px solid var(--line)}

/* ---------- film grids ---------- */
.films{display:grid;gap:22px;margin-top:40px}
@media(min-width:760px){.films--3{grid-template-columns:repeat(3,1fr)}}
@media(min-width:960px){.films--4{grid-template-columns:repeat(4,1fr)}}
.film figcaption{margin-top:14px}
.film b{display:block;font-family:var(--fh);font-size:19px;font-weight:400}
.film span{display:block;margin-top:5px;font-size:15px;color:var(--ink2);line-height:1.6}
.stories{display:grid;gap:28px;margin-top:40px}
@media(min-width:860px){.stories{grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}}

/* ---------- health check tiles ---------- */
.hc-tiles{display:grid;gap:16px;margin-top:30px}
@media(min-width:560px){.hc-tiles{grid-template-columns:1fr 1fr}}
.hc-tile{border:1px solid var(--line);padding:22px;display:flex;gap:16px;align-items:center;background:#fff}
.hc-tile .i{width:50px;height:50px;flex:none;border:1px solid var(--red-l);border-radius:50%;background:var(--red-t);color:var(--red);display:grid;place-items:center}
.hc-tile .i .ico{width:26px;height:26px;stroke-width:1.5}
.hc-tile b{display:block;font-family:var(--fh);font-size:18px;font-weight:400}
.hc-tile span{display:block;font-size:14.5px;color:var(--ink3);margin-top:3px}
.noappt{display:inline-flex;align-items:center;gap:10px;font-size:15.5px;color:var(--ink2);margin-top:26px}
.noappt .ico{width:19px;height:19px;stroke-width:2.4;color:var(--red)}
@media (prefers-reduced-motion:no-preference){
  .hc-tile .i .ico{animation:hcPulse 3.4s var(--ez) infinite}
  .hc-tile:nth-child(2) .i .ico{animation-delay:1.2s}
  @keyframes hcPulse{0%,72%,100%{transform:scale(1)}12%{transform:scale(1.12)}24%{transform:scale(1)}36%{transform:scale(1.08)}}
}

/* ---------- sections ---------- */
.sec{padding:62px 0}
@media(min-width:820px){.sec{padding:92px 0}}
.sec--sand{background:var(--sand)}
.sec h2{font-size:clamp(27px,4.2vw,42px)}
.sec .intro{margin-top:16px;color:var(--ink2);max-width:50ch}

/* offer strip, their own poster given room */
.offerband{display:grid;gap:30px;align-items:center;margin-top:34px}
@media(min-width:820px){.offerband{grid-template-columns:.85fr 1.15fr;gap:52px}}
.offerband img{width:100%;height:auto;border:1px solid var(--line)}
.offerband .free{display:inline-block;font-family:var(--fh);font-size:11.5px;letter-spacing:.24em;text-transform:uppercase;
  color:#fff;background:var(--red);padding:6px 14px}
.offerband h2{margin-top:18px}

/* ---------- timeline ---------- */
.tl{margin-top:44px;display:grid;gap:0}
@media(min-width:820px){.tl{grid-template-columns:repeat(3,1fr);gap:0}}
.tl-step{position:relative;padding:0 0 34px 44px}
@media(min-width:820px){.tl-step{padding:52px 28px 0 0}}
.tl-step:before{content:"";position:absolute;left:12px;top:8px;width:11px;height:11px;border-radius:50%;background:var(--red)}
@media(min-width:820px){.tl-step:before{left:0;top:-6px}}
.tl-step:after{content:"";position:absolute;left:17px;top:24px;bottom:0;width:1px;background:var(--line2)}
@media(min-width:820px){.tl-step:after{left:11px;top:0;bottom:auto;right:0;width:auto;height:1px}}
.tl-step:last-child:after{display:none}
@media(min-width:820px){.tl-step:last-child:after{display:block}}
.tl-step .n{font-family:var(--fh);font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink3)}
.tl-step p{margin-top:8px;font-size:17px;line-height:1.55}

.mapwrap{margin-top:40px;border:1px solid var(--line)}
.mapwrap .frame{background-size:cover;background-position:center}
.mapwrap iframe{width:100%;height:340px;border:0;display:block}
.mapfoot{padding:16px 20px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center;justify-content:space-between;font-size:14.5px;color:var(--ink3);background:#fff}

/* ---------- services list ---------- */
.list{margin-top:40px;border-top:1px solid var(--line)}
.list-row{display:grid;gap:6px;padding:26px 0;border-bottom:1px solid var(--line);align-items:baseline}
@media(min-width:760px){.list-row{grid-template-columns:44px 1fr 1.25fr;gap:26px}}
.list-row .i{color:var(--red)}
.list-row .i .ico{width:26px;height:26px}
.list-row h3{font-family:var(--f);font-size:18px;font-weight:600;letter-spacing:-.015em}
.list-row p{color:var(--ink2);font-size:16px}

/* ---------- rotating quote ---------- */
.qbox{margin-top:40px;position:relative;min-height:250px}
.q{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .5s var(--ez)}
.q.on{opacity:1;pointer-events:auto;position:relative}
.q blockquote{font-family:var(--fh);font-size:clamp(22px,3.3vw,32px);line-height:1.4;max-width:22ch}
.q .en{margin-top:18px;color:var(--ink2);font-size:16px;max-width:52ch}
.q .who{margin-top:24px;display:flex;align-items:center;gap:12px}
.q .who img{width:30px;height:auto;border:1px solid var(--line)}
.q .nm{display:block;font-size:15.5px;font-weight:600}
.q .cn{display:block;font-size:13.5px;color:var(--ink3)}
.qnav{display:flex;gap:10px;margin-top:30px}
.qnav button{width:44px;height:44px;border:1px solid var(--line2);border-radius:50%;background:transparent;cursor:pointer;display:grid;place-items:center;transition:.22s var(--ez)}
.qnav button:hover{border-color:var(--red);color:var(--red)}

/* ---------- insurers ---------- */
.ins{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-top:28px}
.ins img{height:44px;width:auto;background:#fff;padding:6px 12px;border:1px solid var(--line)}

/* ---------- faq ---------- */
.faq{margin-top:40px;border-top:1px solid var(--line);max-width:840px}
.faq details{border-bottom:1px solid var(--line)}
.faq summary{cursor:pointer;list-style:none;padding:22px 44px 22px 0;font-size:18px;position:relative;font-family:var(--fh)}
.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:"+";position:absolute;right:6px;top:20px;font-size:24px;color:var(--red);font-family:var(--f);font-weight:300;transition:transform .22s var(--ez)}
.faq details[open] summary:after{transform:rotate(45deg)}
.faq .a{padding:0 0 24px;color:var(--ink2);font-size:16px;max-width:64ch}

/* ---------- footer ---------- */
footer{border-top:1px solid var(--line);padding:52px 0 118px;background:var(--sand)}
@media(min-width:820px){footer{padding-bottom:56px}}
.fgrid{display:grid;gap:32px}
@media(min-width:760px){.fgrid{grid-template-columns:1.2fr 1fr 1fr}}
footer img.flogo{height:60px;width:auto}
footer h3{font-family:var(--fh);font-size:11.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink3);margin-bottom:14px}
footer p{font-size:15.5px;color:var(--ink2);line-height:1.7}
footer .big{font-family:var(--fh);font-size:24px;color:var(--red)}
footer a.tel{text-decoration:none;color:var(--red)}
.fbase{margin-top:38px;padding-top:20px;border-top:1px solid var(--line);font-size:13.5px;color:var(--ink3);display:flex;flex-wrap:wrap;gap:8px 22px}
.fbase a{color:var(--ink2)}

.wa-float{position:fixed;right:20px;bottom:20px;z-index:890;display:flex;align-items:center;gap:10px;
  background:var(--wa);color:#fff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 20px;border-radius:var(--pill);
  box-shadow:0 8px 25px -4px rgba(0,0,0,.28);transition:.2s var(--ez);padding-bottom:calc(14px + env(safe-area-inset-bottom,0))}
.wa-float .ico{width:22px;height:22px;stroke-width:1.9}
.wa-float:hover,.wa-float:focus-visible{background:var(--wa-deep);color:#fff;transform:translateY(-2px)}
@media(min-width:768px){.wa-float{right:26px;bottom:26px}}


@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
`;

function render(c) {
  const L = D.links(c);

  const list = D.HELP.map(
    ([icon, title, note]) => `<div class="list-row"><span class="i">${svg(icon)}</span><h3>${esc(title)}</h3><p>${esc(note)}</p></div>`
  ).join('');

  const quotes = c.reviews.map((k) => D.REVIEWS[k]).map(
    ([name, country, lang, quote, english], i) => `<figure class="q${i === 0 ? ' on' : ''}" data-q>
            <blockquote lang="${lang}">&ldquo;${esc(quote)}&rdquo;</blockquote>
            <p class="en">${esc(english)}</p>
            <figcaption class="who"><img src="%%${D.FLAG[country]}%%" alt="" width="30" height="20"><span><span class="nm">${esc(name)}</span><span class="cn">${esc(country)}</span></span></figcaption>
          </figure>`
  ).join('');

  const faqs = D.faqFor(c).map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a">${esc(a)}</div></details>`).join('');
  const insurers = D.INSURERS.map(([tok, name]) => `<img src="%%${tok}%%" alt="${esc(name)}" loading="lazy" width="120" height="44">`).join('');

  const bandVideo = c.walkLoop ? 'VHOWTOFIND' : 'VINTRO';

  const stories = D.STORIES.map(
    ([token, shape, who, what]) => `<figure class="film">
            ${D.video({ token, portrait: shape === 'portrait' })}
            <figcaption><b>${esc(who)}</b><span>${esc(what)}</span></figcaption>
          </figure>`
  ).join('');

  const team = D.TEAM.map(
    ([token, label]) => `<figure class="film">${D.video({ token, portrait: true })}<figcaption><b>${esc(label)}</b></figcaption></figure>`
  ).join('');

  const serviceFilms = D.SERVICE_FILMS.map(
    ([token, title, note]) => `<figure class="film">${D.video({ token, portrait: true })}<figcaption><b>${esc(title)}</b><span>${esc(note)}</span></figcaption></figure>`
  ).join('');

  return `<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}">
<link rel="canonical" href="https://www.247clinic.net${c.url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap">
<style>${CSS}</style>

<a class="skip" href="#main">Skip to content</a>

<header class="top">
  <div class="top-in">
    <a class="brand" href="https://www.247clinic.net" rel="noopener"><img src="%%C7LOGO%%" alt="24/7 Clinic" width="200" height="193"></a>
    <span class="sp"></span>
    <span class="open">Open 24 hours</span>
    <a class="btn btn--red btn--sm" href="${L.tel}" data-ev="call_click">${svg('phone')}Call</a>
  </div>
</header>

<main id="main">
  <section class="hero">
    <div class="wrap">
      <span class="tag">${esc(c.area)} &middot; ${esc(c.region)}</span>
      <h1>${esc(c.h1)}</h1>
      <p class="lead">${esc(c.lead)} English speaking doctors, and someone at the desk at any hour.</p>
      <div class="hero-rule"></div>
      <div class="ways3">
        <a class="way3" href="${L.tel}" data-ev="call_click">
          <span class="i">${svg('phone')}</span>
          <span><h2>Call the clinic</h2><span class="v">${D.PHONE}</span><span class="n">Answered around the clock.</span></span>
        </a>
        <a class="way3" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_click">
          <span class="i">${svg('wa')}</span>
          <span><h2>Send a WhatsApp</h2><span class="v">Message us</span><span class="n">Tell us your room number.</span></span>
        </a>
        <a class="way3" href="#find" data-ev="directions_click">
          <span class="i">${svg('pin')}</span>
          <span><h2>Walk in</h2><span class="v">No appointment</span><span class="n">${esc(c.hotelShort)}, ${esc(c.area)}.</span></span>
        </a>
      </div>
    </div>
  </section>

  <div class="band">
    ${D.video({ token: 'VCOMMERCIAL', portrait: false, tag: 'The clinic film' })}
  </div>

  <section class="sec sec--sand">
    <div class="wrap">
      <div class="offerband">
        <img src="%%POSTERHEALTH%%" alt="Free health check poster: free blood pressure and blood sugar check for hotel guests" loading="lazy" width="1080" height="1440">
        <div>
          <span class="free">Free for hotel guests</span>
          <h2>A health check, on the house</h2>
          <p class="intro">Checked by a nurse while you wait. Nothing to pay, nothing to book.</p>
          <div class="hc-tiles">
            <div class="hc-tile"><span class="i">${svg('heart')}</span><span><b>Blood pressure</b><span>Checked in a minute</span></span></div>
            <div class="hc-tile"><span class="i">${svg('gauge')}</span><span><b>Blood sugar</b><span>One drop, one reading</span></span></div>
          </div>
          <span class="noappt">${svg('check')}No appointment needed</span>
          <div style="margin-top:26px"><a class="btn btn--red" href="${L.tel}" data-ev="call_click">${svg('phone')}Call the clinic</a></div>
        </div>
      </div>
    </div>
  </section>

  <section class="sec" id="find">
    <div class="wrap">
      <span class="tag">Finding us</span>
      <h2>The walk from your hotel</h2>
      <div class="tl">
        ${c.steps.map((t, i) => `<div class="tl-step"><span class="n">Step ${i + 1}</span><p>${esc(t)}</p></div>`).join('')}
      </div>
      <figure class="mapwrap">
        <div class="frame" style="background-image:url(%%${c.mapImg}%%)">
          <iframe src="${L.embed}" title="Map of the 24/7 Clinic at ${esc(c.hotel)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <figcaption class="mapfoot">
          <span>${esc(c.hotel)}, ${esc(c.area)}</span>
          <a class="btn btn--sm" href="${L.maps}" target="_blank" rel="noopener" data-ev="directions_click">${svg('pin')}Directions</a>
        </figcaption>
      </figure>
    </div>
  </section>

  <section class="sec sec--sand">
    <div class="wrap">
      <span class="tag">Care</span>
      <h2>What we look after</h2>
      <div class="list">${list}</div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <span class="tag">Guests</span>
      <h2>In their own words</h2>
      <div class="stories">${stories}</div>
    </div>
  </section>

  <section class="sec sec--sand">
    <div class="wrap">
      <span class="tag">The team</span>
      <h2>The people who will see you</h2>
      <div class="films films--3">${team}</div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <span class="tag">Filmed here</span>
      <h2>What we do at this clinic</h2>
      <div class="films films--4">${serviceFilms}</div>
    </div>
  </section>

  <section class="sec sec--sand">
    <div class="wrap">
      <span class="tag">Insurance</span>
      <h2>We deal with your insurer</h2>
      <p class="intro">Bring your policy details or your insurance card. We handle the paperwork and write the medical report your claim needs, in English, before you fly home.</p>
      <div class="ins">${insurers}</div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <span class="tag">Questions</span>
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
        <p style="margin-top:16px">24/7 Urgent Care Clinic. Travel medical services for international guests in Egypt, part of Healthcare International Group.</p>
      </div>
      <div>
        <h3>The clinic</h3>
        <p class="big"><a class="tel" href="${L.tel}" data-ev="call_click">${D.PHONE}</a></p>
        <p style="margin-top:10px">${esc(c.hotel)}<br>${esc(c.area)}, ${esc(c.region)}<br>Open 24 hours, every day</p>
      </div>
      <div>
        <h3>24/7 Clinic</h3>
        <p><a href="https://www.247clinic.net/our-clinics" target="_blank" rel="noopener">All clinics</a><br>
        <a href="https://www.247clinic.net/insurance" target="_blank" rel="noopener">Insurance</a><br>
        <a href="https://www.247clinic.net/contact-us" target="_blank" rel="noopener">Contact</a></p>
      </div>
    </div>
    <div class="fbase"><span>24/7 Clinic &middot; ${esc(c.area)} &middot; Since ${D.SINCE}</span><span>${D.NETWORK} clinics across Egypt</span></div>
  </div>
</footer>

<a class="wa-float" href="${L.wa}" target="_blank" rel="noopener" data-ev="whatsapp_click" aria-label="Message 24/7 Clinic on WhatsApp">${svg('wa')}WhatsApp</a>

<script type="application/ld+json">${JSON.stringify(D.schemaFor(c))}</script>
${D.tracking(c)}
<script>${D.VIDEO_JS}</script>
`;
}

module.exports = { NAME, NOTE, render };
