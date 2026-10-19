// HCIG v3 hero canvas: twelve hero options, each a desktop board (1440 x 900) and a phone board (390 x 844).
// Every hero carries only the live hero's own words and marks: the DMWV and GHA seals with the partner line,
// the headline, the second line, the lead and "Talk to our team". Variety comes from image, layout and motion.
// Run: node hcig-v3/canvas/heroes/build-heroes.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "project");
mkdirSync(OUT, { recursive: true });
const B = JSON.parse(readFileSync(join(HERE, "blobs.json"), "utf8")); // name -> /_blob/<id>
const u = (n) => { if (!B[n]) throw new Error("missing asset " + n); return B[n]; };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------- words (live home hero and header, exact) ----------
const W = {
  credential: "Healthcare International Group (HCIG) is the Official Partner of Global Healthcare Accreditation™ (GHA) and the German Medical Wellness Association (DMWV) in Egypt",
  tagline: "Integrated Healthcare Ecosystem for International Patients and Travel Industry",
  sub: "Structured Healthcare Solutions for International Patients and Global Partners",
  lead: "Healthcare International Group (HCIG) is built to manage the full patient journey from first medical contact to advanced treatment and international coordination.",
  talk: "Talk to our team",
  nav: ["Home", "About Us", "Services", "For Partners", "Contact", "Blog"],
  langs: ["English", "Deutsch", "Polski", "Français", "Italiano", "Español", "Čeština"],
};

// ---------- icons (hairline) ----------
const P = {
  arrow: '<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>', menu: '<path d="M4 9h16M4 15h16"/>', close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  chevron: '<path d="M7 10l5 5 5-5"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9M12 3c-2.6 2.6-3.8 5.6-3.8 9s1.2 6.4 3.8 9"/>',
  fb: '<path d="M14.5 3.5h-2a4 4 0 0 0-4 4v3h-2.5v3.5H8.5v6.5H12v-6.5h2.6l.6-3.5H12V8a1 1 0 0 1 1-1h2.5z"/>',
  li: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M8 10.5v6M8 7.6v.1M11.5 16.5v-6M11.5 13c0-1.6 1-2.6 2.4-2.6s2.1 1 2.1 2.6v3.5"/>',
  ig: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7v.1"/>',
};
const ic = (n, s = 24) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const SOCIAL = [["fb", "Facebook"], ["li", "LinkedIn"], ["ig", "Instagram"]];

// headline as a vertical cut word reveal; `acc` lists the word indexes drawn in the accent colour
function h1(acc = [], cls = "") {
  const ws = W.tagline.split(" ");
  return `<h1 class="h1 ${cls}" aria-label="${esc(W.tagline)}">${ws.map((w, i) => `<span class="w${acc.includes(i) ? " acc" : ""}" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(" ")}</h1>`;
}
const sub = (cls = "") => `<p class="sub f ${cls}" style="--d:850ms">${esc(W.sub)}</p>`;
const lead = (cls = "") => `<p class="lead f ${cls}" style="--d:1000ms">${esc(W.lead)}</p>`;
const cta = (cls = "") => `<div class="f ${cls}" style="--d:1150ms"><a href="#" class="btn">${esc(W.talk)}${ic("arrow", 18)}</a></div>`;
const copy = (acc, cls = "") => `${h1(acc, cls)}${sub()}${lead()}${cta()}`;

// the live partner banner, redesigned: two white plates plus the partner line
const plates = () => `<span class="plate"><img src="${u("dmwv")}" alt="German Medical Wellness Association (DMWV)"></span><span class="plate plate-w"><img src="${u("gha")}" alt="Global Healthcare Accreditation (GHA)"></span>`;
const seals = (cls = "", d = 200) => `<div class="seals f ${cls}" style="--d:${d}ms"><div class="plates">${plates()}</div><p>${esc(W.credential)}</p></div>`;

function header(theme) {
  const logo = theme === "dark" ? u("logo-h-white") : u("logo-h-black");
  const mark = theme === "dark" ? u("mark-white") : u("mark-black");
  return `<header class="hd"><a href="#" class="hd-logo" aria-label="Healthcare International Group, home"><img class="hd-full" src="${logo}" alt="Healthcare International Group"><img class="hd-mark" src="${mark}" alt="Healthcare International Group"></a>
<nav class="hd-nav" aria-label="Main"><ul>${W.nav.map((t, i) => `<li><a href="#"${i === 0 ? ' aria-current="page"' : ""}>${esc(t)}</a></li>`).join("")}</ul></nav>
<div class="hd-tools"><div class="soc">${SOCIAL.map(([k, l]) => `<a href="#" aria-label="${l}">${ic(k, 18)}</a>`).join("")}</div>
<div class="lang"><button type="button" class="lang-btn" onClick="{{toggleLang}}" aria-haspopup="true" aria-expanded="{{langExp}}">${ic("globe", 17)}<span>EN</span>${ic("chevron", 15)}</button><sc-if value="{{langOpen}}" hint-placeholder-val="{{ false }}"><ul class="lang-menu">${W.langs.map((l) => `<li><a href="#">${esc(l)}</a></li>`).join("")}</ul></sc-if></div>
<a href="#" class="btn btn-sm">${esc(W.talk)}</a>
<button type="button" class="menu-btn" onClick="{{toggleMenu}}" aria-label="Menu" aria-expanded="{{menuExp}}"><sc-if value="{{menuOpen}}" hint-placeholder-val="{{ false }}">${ic("close")}</sc-if><sc-if value="{{menuShut}}" hint-placeholder-val="{{ true }}">${ic("menu")}</sc-if></button></div>
<sc-if value="{{menuOpen}}" hint-placeholder-val="{{ false }}"><div class="drawer"><ul>${W.nav.map((t) => `<li><a href="#" onClick="{{closeMenu}}">${esc(t)}${ic("arrow", 20)}</a></li>`).join("")}</ul><div class="drawer-langs">${W.langs.map((l) => `<a href="#">${esc(l)}</a>`).join("")}</div><div class="drawer-soc">${SOCIAL.map(([k, l]) => `<a href="#" aria-label="${l}">${ic(k, 20)}</a>`).join("")}</div><a href="#" class="btn" onClick="{{closeMenu}}">${esc(W.talk)}</a></div></sc-if></header>`;
}
const cue = () => `<a href="#" class="cue" aria-label="Scroll down"><span class="cue-line"></span></a>`;

// ---------- base CSS ----------
const BASE = `
.hero{--accent:#12C0C6;--ink:#0B0B0C;--ink2:#3F4042;--muted:#565759;--paper:#FFFFFF;--line:#D6D7D8;--acc-text:#087276;--serif:'Helma','Bodoni Moda',Didot,Georgia,serif;--sans:'Inter',system-ui,-apple-system,'Segoe UI',Arial,sans-serif;--gutter:clamp(20px,5cqi,80px);--ease:cubic-bezier(.16,1,.3,1);
  container-type:inline-size;container-name:hero;font-family:var(--sans);line-height:1.65;-webkit-font-smoothing:antialiased;font-synthesis:none;background:var(--paper);color:var(--ink)}
.in{position:relative;overflow:hidden;font-size:17px;min-height:900px;display:flex;flex-direction:column}
.hero *{box-sizing:border-box}.hero img{display:block;max-width:100%}.hero a{color:inherit;text-decoration:none}
.hero a:focus-visible,.hero button:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
.dark{--ink:#F4F5F5;--ink2:#DADCDE;--muted:#C2C5C8;--line:rgba(255,255,255,.22);--acc-text:#12C0C6;background:#07080A}
/* header: the horizontal logo at its 120 px minimum height */
.hd{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px var(--gutter)}
.hd-full{height:120px;width:auto}.hero .hd-mark{display:none;height:46px;width:auto}
.hd-nav ul{list-style:none;margin:0;padding:0;display:flex;gap:26px}
.hd-nav a{white-space:nowrap;font-size:15px;font-weight:500;padding-block:8px;border-bottom:1px solid transparent;transition:border-color .25s}
.hd-nav a:hover,.hd-nav a[aria-current]{border-bottom-color:var(--accent)}
.hd-tools{display:flex;align-items:center;gap:10px}
.soc{display:flex;gap:2px}.soc a{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:var(--ink2);transition:color .2s,background .2s}.soc a:hover{color:var(--accent);background:rgba(18,192,198,.1)}
.lang{position:relative}
.lang-btn{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;background:transparent;border:1px solid var(--line);border-radius:999px;color:var(--ink);font:500 14px/1 var(--sans);cursor:pointer}
.lang-menu{position:absolute;right:0;top:52px;min-width:180px;list-style:none;margin:0;padding:8px;background:#fff;color:#0B0B0C;border-radius:14px;box-shadow:0 30px 60px -24px rgba(0,0,0,.4)}
.lang-menu a{display:block;padding:10px 12px;border-radius:8px;font-size:15px}.lang-menu a:hover{background:#F1F2F2}
.menu-btn{display:none;width:48px;height:48px;align-items:center;justify-content:center;background:transparent;border:1px solid var(--line);border-radius:999px;color:var(--ink);cursor:pointer}
.drawer{display:none}
/* button */
.btn{white-space:nowrap;display:inline-flex;align-items:center;gap:12px;min-height:56px;padding:0 30px;border-radius:999px;background:var(--accent);color:#04191A;font:600 15px/1 var(--sans);border:1px solid var(--accent);position:relative;overflow:hidden;cursor:pointer;transition:transform .25s var(--ease),box-shadow .35s}
.btn:after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);transform:translateX(-120%);transition:transform .9s var(--ease)}
.btn:hover{transform:translateY(-1px);box-shadow:0 16px 36px -14px rgba(18,192,198,.8)}.btn:hover:after{transform:translateX(120%)}
.btn-sm{min-height:44px;padding:0 20px;font-size:14px}
/* type */
.h1{font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:62px;line-height:1.06;letter-spacing:-.01em;margin:0;text-wrap:balance}
.h1 .w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.1em;margin-bottom:-.1em}
.h1 .w>span{display:inline-block;transform:translateY(105%);animation:rise 1.1s var(--ease) forwards;animation-delay:calc(var(--i) * 70ms + 250ms)}
.h1 .acc{color:var(--acc-text)}
.sub{margin:0;font-size:20px;line-height:1.45;font-weight:500;color:var(--ink);max-width:40ch}
.lead{margin:0;font-size:17px;line-height:1.65;color:var(--ink2);max-width:58ch}
.f{opacity:0;transform:translateY(18px);animation:fadeup 1s var(--ease) forwards;animation-delay:var(--d,0ms)}
/* partner banner */
.seals{display:flex;align-items:center;gap:18px;max-width:660px}
.plates{display:flex;gap:10px;flex:none}
.plate{width:64px;height:64px;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center;padding:7px;box-shadow:0 12px 26px -16px rgba(0,0,0,.5),inset 0 0 0 1px rgba(0,0,0,.06)}
.plate-w{width:96px}
.plate img{max-width:100%;max-height:100%;object-fit:contain}
.seals p{margin:0;font-size:13.5px;line-height:1.5;color:var(--muted)}
/* glass */
.glass{background:rgba(255,255,255,.09);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);border:1px solid rgba(255,255,255,.22);border-radius:24px;box-shadow:0 40px 80px -40px rgba(0,0,0,.65)}
.glass-light{background:rgba(255,255,255,.78);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.95);border-radius:22px;box-shadow:0 40px 80px -40px rgba(0,0,0,.3)}
/* image layers */
.bg{position:absolute;inset:0;z-index:0;overflow:hidden}
.bg img{width:100%;height:100%;object-fit:cover;animation:kb 28s ease-out both}
.shade{position:absolute;inset:0;z-index:1;pointer-events:none}
.body{position:relative;z-index:2;flex:1;display:flex;flex-direction:column;padding:0 var(--gutter) 48px}
.stack{display:grid;gap:22px;align-content:start}
/* scroll cue */
.cue{position:absolute;left:50%;bottom:24px;z-index:3;width:28px;height:46px;border:1px solid var(--line);border-radius:999px;transform:translateX(-50%)}
.cue-line{position:absolute;left:50%;top:9px;width:2px;height:10px;margin-left:-1px;border-radius:2px;background:var(--accent);animation:cue 2s var(--ease) infinite}
@keyframes rise{to{transform:translateY(0)}}
@keyframes fadeup{to{opacity:1;transform:none}}
@keyframes kb{from{transform:scale(1.14)}to{transform:scale(1)}}
@keyframes cue{0%{transform:translateY(0);opacity:1}70%{transform:translateY(18px);opacity:0}100%{opacity:0}}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes glowp{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.8);opacity:0}}
@keyframes sheen{0%,100%{transform:translateX(-130%)}50%{transform:translateX(130%)}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.still *,.still *:before,.still *:after{animation:none!important;transition:none!important}
.still .h1 .w>span,.still .f,.still .g-t{transform:none;opacity:1}
@media (prefers-reduced-motion:reduce){.hero *,.hero *:before,.hero *:after{animation:none!important}.hero .h1 .w>span,.hero .f,.hero .g-t{transform:none;opacity:1}}
@container hero (max-width:1380px){.soc{display:none}}
@container hero (max-width:1180px){.hd-nav ul{gap:18px}.hd-tools .btn{display:none}}
@container hero (max-width:900px){
  .hd{padding:14px var(--gutter)}.hero .hd-full,.hd-nav,.hd-tools .btn,.hd-tools .lang{display:none}.hero .hd-mark{display:block}
  .dark .bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,8,11,.3) 0%,rgba(5,8,11,.78) 26%,rgba(5,8,11,.92) 60%,rgba(5,8,11,.97) 100%)}.menu-btn{display:inline-flex}
  .drawer{display:block;position:absolute;left:0;right:0;top:100%;padding:8px var(--gutter) 24px;background:#07080A;color:#F4F5F5;z-index:20}
  .drawer ul{list-style:none;margin:0 0 18px;padding:0}.drawer li a{display:flex;justify-content:space-between;align-items:center;min-height:52px;font:400 24px/1.2 var(--serif);border-bottom:1px solid rgba(255,255,255,.14)}
  .drawer-langs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}.drawer-langs a{min-height:40px;display:inline-flex;align-items:center;padding:0 12px;border:1px solid rgba(255,255,255,.22);border-radius:999px;font-size:14px}
  .drawer-soc{display:flex;gap:6px;margin-bottom:18px}.drawer-soc a{width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.22);border-radius:50%}
  .in{min-height:844px;font-size:16px}.h1{font-size:34px;line-height:1.12}.sub{font-size:17px}.lead{font-size:16px}
  .seals{gap:12px;align-items:flex-start}.plates{gap:8px}.plate{width:48px;height:48px;border-radius:11px;padding:5px}.plate-w{width:70px}.seals p{font-size:12px}
  .btn{min-height:52px;width:100%;justify-content:center}.body{padding-bottom:28px}.stack{gap:16px}.cue{display:none}
}`;

// ---------- the twelve heroes ----------
const H = [];
const PH = { B: 900, C: 936, G: 940, I: 944 }; // phone board heights measured at 390 px; the rest fit 844
const shadeDiv = (bg) => `<div class="shade" style="background:${bg};opacity:{{shade}}"></div>`;

// A · Red Sea Panorama: copy on the left, the partner banner as a floating glass card
H.push({ id: "A", file: "HeroA", name: "Red Sea Panorama", theme: "dark", shade: 0.85, body: `
<div class="bg"><img src="${u("g-red-sea-aerial")}" alt=""></div>
${shadeDiv("linear-gradient(90deg,rgba(4,10,14,.95) 0%,rgba(4,10,14,.72) 42%,rgba(4,10,14,.05) 78%)")}
${header("dark")}
<div class="body a-body"><div class="stack a-copy">${copy([4, 5])}</div>
<div class="a-card glass f" style="--d:1350ms"><div class="plates">${plates()}</div><p>${esc(W.credential)}</p></div></div>${cue()}`,
  css: `.a-body{justify-content:center;padding-bottom:80px}.a-copy{max-width:720px}
.a-card{position:absolute;right:var(--gutter);bottom:90px;width:330px;padding:24px;display:grid;gap:16px;animation:fadeup 1s var(--ease) forwards,floaty 7s ease-in-out 2.4s infinite}
.a-card p{margin:0;font-size:13.5px;line-height:1.55;color:#DADCDE}
@container hero (max-width:900px){.a-body{justify-content:flex-start;padding-top:12px}.a-card{position:static;width:auto;margin-top:26px;padding:18px}.a-card .plate{width:52px;height:52px}.a-card .plate-w{width:76px}}` });

// B · Night Network: Earth at night, routes draw into the Red Sea
const routes = [["M300 250 Q 640 120 1010 470", 0], ["M180 330 Q 600 230 1010 470", 200], ["M420 180 Q 760 160 1010 470", 400], ["M520 300 Q 800 300 1010 470", 600], ["M250 420 Q 640 360 1010 470", 800], ["M1010 470 Q 1160 300 1330 320", 1000]];
H.push({ id: "B", file: "HeroB", name: "Night Network", theme: "dark", shade: 0.6, body: `
<div class="bg"><img src="${u("g-earth-network")}" alt=""></div>
${shadeDiv("radial-gradient(70% 85% at 22% 50%,rgba(3,6,10,.94),rgba(3,6,10,.15) 72%)")}
<svg class="b-routes" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${routes.map(([d, t]) => `<path d="${d}" style="animation-delay:${t + 600}ms"/>`).join("")}<circle cx="1010" cy="470" r="6" class="b-hub"/><circle cx="1010" cy="470" r="6" class="b-ping"/></svg>
${header("dark")}
<div class="body b-body"><div class="stack b-copy">${copy([4, 5, 6, 7, 8])}</div>${seals("b-seals", 1400)}</div>`,
  css: `.b-routes{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}
.b-routes path{fill:none;stroke:#12C0C6;stroke-width:1.6;stroke-linecap:round;stroke-dasharray:900;stroke-dashoffset:900;filter:drop-shadow(0 0 6px rgba(18,192,198,.9));animation:draw 3.2s var(--ease) forwards}
.b-hub{fill:#12C0C6;filter:drop-shadow(0 0 10px #12C0C6)}.b-ping{fill:none;stroke:#12C0C6;stroke-width:2;transform-origin:1010px 470px;animation:ping 2.4s ease-out infinite}
.b-body{justify-content:center;gap:40px}.b-copy{max-width:680px}.b-seals{padding-top:24px;border-top:1px solid var(--line)}
@container hero (max-width:900px){.b-body{justify-content:flex-start;padding-top:16px;gap:26px}}` });

// C · Private Lounge: light, arch-framed photo, the seals float on the arch
H.push({ id: "C", file: "HeroC", name: "Private Lounge", theme: "light", shade: 0, body: `
${header("light")}
<div class="body c-body"><div class="stack">${copy([2])}${seals("", 1300)}</div>
<div class="c-art f" style="--d:400ms"><div class="c-arch"><img src="${u("g-patient-lounge")}" alt="A private patient lounge overlooking the Red Sea"></div>
<div class="c-chip glass-light c-chip1"><span class="plate"><img src="${u("dmwv")}" alt="German Medical Wellness Association (DMWV)"></span></div>
<div class="c-chip glass-light c-chip2"><span class="plate plate-w"><img src="${u("gha")}" alt="Global Healthcare Accreditation (GHA)"></span></div></div></div>`,
  css: `.c-body{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:56px;align-items:center}
.c-body:before{content:"";position:absolute;right:-8%;top:-30%;width:64%;height:130%;background:radial-gradient(closest-side,rgba(18,192,198,.13),transparent);z-index:-1}
.c-art{position:relative;height:600px}
.c-arch{position:absolute;inset:0 30px 0 50px;border-radius:300px 300px 24px 24px;overflow:hidden;box-shadow:0 60px 100px -50px rgba(0,0,0,.45)}
.c-arch img{width:100%;height:100%;object-fit:cover;animation:kb 28s ease-out both}
.c-chip{position:absolute;padding:10px;animation:floaty 6s ease-in-out infinite}.c-chip .plate{box-shadow:none}
.c-chip1{left:0;top:130px}.c-chip2{right:0;bottom:110px;animation-delay:1.6s}
.c-body .seals .plates{display:none}
@container hero (max-width:900px){.c-body{grid-template-columns:minmax(0,1fr);gap:24px}.c-art{order:-1;height:300px}.c-arch{inset:0 26px}.c-chip{padding:7px}.c-chip1{top:40px}.c-chip2{bottom:30px}}` });

// D · Boardroom: the partner banner as a full-width plaque at the foot of the hero
H.push({ id: "D", file: "HeroD", name: "Boardroom", theme: "dark", shade: 0.85, body: `
<div class="bg"><img src="${u("g-boardroom-sea")}" alt="" style="object-position:72% 50%"></div>
${shadeDiv("linear-gradient(90deg,rgba(5,7,9,.96) 0%,rgba(5,7,9,.72) 45%,rgba(5,7,9,.1) 82%)")}
${header("dark")}
<div class="body d-body"><div class="stack d-copy">${copy([0, 1, 2])}</div>
<div class="d-plaque glass f" style="--d:1400ms"><div class="plates">${plates()}</div><span class="d-rule"></span><p>${esc(W.credential)}</p></div></div>`,
  css: `.d-body{justify-content:space-between;gap:28px;padding-top:0;padding-bottom:36px}.d-copy .stack,.d-copy{gap:18px}.d-copy{max-width:700px;margin-top:auto}
.d-plaque{display:flex;align-items:center;gap:24px;padding:18px 26px;border-radius:20px;position:relative;overflow:hidden}
.d-plaque:after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 35%,rgba(255,255,255,.12) 50%,transparent 65%);animation:sheen 9s ease-in-out 2.5s infinite}
.d-rule{width:1px;align-self:stretch;background:rgba(255,255,255,.25)}.d-plaque p{margin:0;font-size:15px;line-height:1.5;color:#DADCDE;max-width:820px}
@container hero (max-width:900px){.d-copy{margin-top:8px}.d-plaque{flex-direction:column;align-items:flex-start;gap:14px;padding:16px}.d-rule{display:none}.d-plaque p{font-size:12.5px}}` });

// E · Medical Jet: the live order, partner banner first, headline below, bottom-anchored
H.push({ id: "E", file: "HeroE", name: "Medical Jet", theme: "dark", shade: 0.75, inCls: "e-in", body: `
<div class="bg"><img src="${u("g-medical-jet")}" alt="" style="object-position:62% 60%"></div>
${shadeDiv("linear-gradient(180deg,rgba(6,9,12,.8) 0%,rgba(6,9,12,.2) 40%,rgba(6,9,12,.94) 100%)")}
${header("dark")}
<div class="body e-body">${seals("e-seals", 200)}<div class="e-grid"><div>${h1([7, 8], "e-h1")}</div><div class="stack">${sub()}${lead()}${cta()}</div></div></div>`,
  css: `.e-body{justify-content:space-between;padding-top:6px}
.e-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,.75fr);gap:56px;align-items:end}.e-h1{font-size:66px}
@container hero (max-width:900px){.e-in .bg:after{background:linear-gradient(180deg,rgba(5,8,11,.6) 0%,rgba(5,8,11,.15) 30%,rgba(5,8,11,.88) 52%,rgba(5,8,11,.97) 100%)}.e-body{justify-content:flex-start;gap:24px}.e-grid{grid-template-columns:minmax(0,1fr);gap:18px;margin-top:auto}.e-h1{font-size:36px}}` });

// F · Infinity Pool: centred, partner banner above the headline as on the live site
H.push({ id: "F", file: "HeroF", name: "Infinity Pool", theme: "dark", shade: 0.6, body: `
<div class="bg"><img src="${u("g-resort-pool")}" alt=""></div>
${shadeDiv("linear-gradient(180deg,rgba(4,8,14,.78) 0%,rgba(4,8,14,.35) 50%,rgba(4,8,14,.88) 100%)")}
${header("dark")}
<div class="body f-body">${seals("f-seals", 200)}${h1([2], "f-h1")}${sub("f-c")}${lead("f-c")}${cta("f-cta")}</div>${cue()}`,
  css: `.f-body{align-items:center;justify-content:center;text-align:center;gap:20px;padding-bottom:76px}
.f-seals{flex-direction:column;gap:14px;max-width:640px}.f-h1{max-width:1040px;font-size:68px}.f-c{margin-inline:auto}
@container hero (max-width:900px){.f-body{justify-content:flex-start;padding-top:20px;padding-bottom:30px;gap:16px}.f-h1{font-size:36px}.f-cta{width:100%}}` });

// G · Real Proof Mosaic: a bento of his own photographs
H.push({ id: "G", file: "HeroG", name: "Real Proof Mosaic", theme: "light", shade: 0, body: `
${header("light")}
<div class="body g-body"><div class="stack">${copy([2], "g-h1")}${seals("", 1300)}</div>
<div class="g-grid">
<figure class="g-t g-t1"><img src="${u("r-hub")}" alt="MedPark Health Hub"></figure>
<figure class="g-t g-t2"><img src="${u("r-booth")}" alt="HCIG at an international travel trade event"></figure>
<figure class="g-t g-t3"><img src="${u("r-hospital")}" alt="MedPark Hospital"></figure>
<div class="g-t g-t4 g-seal"><span class="plate"><img src="${u("dmwv")}" alt="German Medical Wellness Association (DMWV)"></span><span class="plate plate-w"><img src="${u("gha")}" alt="Global Healthcare Accreditation (GHA)"></span></div>
<figure class="g-t g-t5"><img src="${u("r-karnak")}" alt="A partner delegation visit in Egypt"></figure></div></div>`,
  css: `.g-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:48px;align-items:center}
.g-h1{font-size:56px}.g-body .seals .plates{display:none}
.g-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:190px 190px 190px;gap:12px}
.g-t{margin:0;border-radius:20px;overflow:hidden;opacity:0;transform:translateY(24px) scale(.97);animation:fadeup 1s var(--ease) forwards}
.g-t img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--ease)}.g-t:hover img{transform:scale(1.06)}
.g-t1{grid-column:1/3;grid-row:1/3;animation-delay:300ms}.g-t2{grid-column:3;grid-row:1;animation-delay:450ms}.g-t3{grid-column:3;grid-row:2/4;animation-delay:600ms}
.g-t4{grid-column:1;grid-row:3;animation-delay:750ms}.g-t5{grid-column:2;grid-row:3;animation-delay:900ms}
.g-seal{background:#F1F2F2;display:flex;align-items:center;justify-content:center;gap:10px}.g-seal .plate{box-shadow:none}
@container hero (max-width:900px){.g-body{grid-template-columns:minmax(0,1fr);gap:22px}.g-h1{font-size:34px}.g-grid{order:-1;grid-template-rows:96px 96px 96px;gap:8px}.g-t{border-radius:14px}.g-seal{gap:6px}.g-seal .plate{width:40px;height:40px;padding:4px}.g-seal .plate-w{width:54px}}` });

// H · Coordination Centre: the second line set large in a glass panel
H.push({ id: "H", file: "HeroH", name: "Coordination Centre", theme: "dark", shade: 0.8, body: `
<div class="bg"><img src="${u("g-coordination-centre")}" alt=""></div>
${shadeDiv("linear-gradient(90deg,rgba(3,6,9,.96) 0%,rgba(3,6,9,.7) 50%,rgba(3,6,9,.25) 88%)")}
${header("dark")}
<div class="body h-body"><div class="stack">${h1([1, 2])}${seals("", 1200)}</div>
<div class="h-panel glass f" style="--d:900ms"><span class="h-line"></span><p class="h-sub">${esc(W.sub)}</p><p class="h-lead">${esc(W.lead)}</p><a href="#" class="btn">${esc(W.talk)}${ic("arrow", 18)}</a></div></div>`,
  css: `.h-body{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:56px;align-items:center}
.h-panel{padding:34px;display:grid;gap:20px;justify-items:start;animation:fadeup 1s var(--ease) forwards,floaty 8s ease-in-out 2.4s infinite}
.h-line{width:56px;height:2px;background:#12C0C6;transform-origin:left;animation:grow 1.4s var(--ease) 1.4s both}
.h-sub{margin:0;font-family:var(--serif);font-size:32px;line-height:1.2;color:#F4F5F5}.h-lead{margin:0;font-size:16px;line-height:1.65;color:#DADCDE}
@container hero (max-width:900px){.h-body{grid-template-columns:minmax(0,1fr);gap:22px}.h-panel{padding:20px;gap:14px}.h-sub{font-size:22px}}` });

// I · Clinic Suite: light split, photo in a tall card, seals pinned to it
H.push({ id: "I", file: "HeroI", name: "Clinic Suite", theme: "light", shade: 0, body: `
${header("light")}
<div class="body i-body"><div class="i-img f" style="--d:300ms"><img src="${u("g-hotel-clinic")}" alt="A private clinic suite in a Red Sea resort"><div class="i-badge glass-light"><div class="plates">${plates()}</div></div></div>
<div class="stack">${copy([4, 5])}<p class="i-cred f" style="--d:1300ms">${esc(W.credential)}</p></div></div>`,
  css: `.i-body{display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);gap:64px;align-items:center}
.i-img{position:relative;height:640px;border-radius:28px;overflow:hidden;box-shadow:0 60px 100px -60px rgba(0,0,0,.45)}.i-img img{width:100%;height:100%;object-fit:cover;animation:kb 28s ease-out both}
.i-badge{position:absolute;left:22px;bottom:22px;padding:12px}.i-badge .plate{box-shadow:none}
.i-cred{margin:0;padding-top:20px;border-top:1px solid var(--line);font-size:13.5px;line-height:1.55;color:var(--muted);max-width:60ch}
@container hero (max-width:900px){.i-body{grid-template-columns:minmax(0,1fr);gap:22px}.i-img{height:290px;border-radius:20px}.i-badge{left:12px;bottom:12px;padding:8px}.i-cred{font-size:12px}}` });

// J · Marble Noir: black marble, the HC mark breathing in turquoise light
H.push({ id: "J", file: "HeroJ", name: "Marble Noir", theme: "dark", shade: 0.8, body: `
<div class="bg"><img src="${u("g-marble-light")}" alt=""></div>
${shadeDiv("radial-gradient(60% 70% at 50% 45%,rgba(4,5,6,.45),rgba(4,5,6,.96))")}
${header("dark")}
<div class="body j-body"><div class="j-mark f" style="--d:100ms"><img src="${u("mark-white")}" alt=""></div>${h1([2], "j-h1")}${sub("j-c")}${lead("j-c")}${cta()}${seals("j-seals", 1300)}</div>`,
  css: `.j-body{align-items:center;justify-content:center;text-align:center;gap:16px;padding-bottom:36px}
.j-mark{position:relative;width:76px}.j-mark:before{content:"";position:absolute;inset:-46px;border-radius:50%;background:radial-gradient(closest-side,rgba(18,192,198,.5),transparent);animation:glowp 5s ease-in-out infinite}.j-mark img{position:relative}
.j-h1{max-width:980px}.j-c{margin-inline:auto}.j-seals{text-align:left;margin-top:14px}
@container hero (max-width:900px){.j-body{justify-content:flex-start;padding-top:20px;gap:16px}.j-mark{width:60px}.j-seals{margin-top:6px}}` });

// K · Blue Hour: centred over the coast at dusk, glass partner bar at the foot
H.push({ id: "K", file: "HeroK", name: "Blue Hour", theme: "dark", shade: 0.85, body: `
<div class="bg"><img src="${u("g-red-sea-panorama")}" alt="" style="object-position:50% 70%"></div>
${shadeDiv("linear-gradient(180deg,rgba(3,8,16,.85) 0%,rgba(3,8,16,.66) 52%,rgba(3,8,16,.9) 100%)")}
${header("dark")}
<div class="body k-body">${h1([], "k-h1")}${sub("k-c")}${lead("k-c")}${cta()}<div class="k-bar glass f" style="--d:1400ms">${seals("k-seals", 1400)}</div></div>`,
  css: `.k-body{align-items:center;text-align:center;gap:20px;padding-top:30px}.k-h1{max-width:1080px;font-size:66px}.k-c{margin-inline:auto}
.k-bar{margin-top:auto;padding:16px 24px;text-align:left}.k-seals{opacity:1;transform:none;animation:none}
@container hero (max-width:900px){.k-body{padding-top:16px;gap:16px}.k-h1{font-size:36px}.k-bar{padding:14px}}` });

// L · Two Worlds: resort and hospital meet on a turquoise diagonal
H.push({ id: "L", file: "HeroL", name: "Two Worlds", theme: "dark", shade: 0.8, body: `
<div class="bg l-bg"><div class="l-a"><img src="${u("g-resort-pool")}" alt=""></div><div class="l-b"><img src="${u("r-hospital")}" alt="MedPark Hospital"></div></div>
${shadeDiv("linear-gradient(180deg,rgba(4,6,8,.6),rgba(4,6,8,.25) 38%,rgba(4,6,8,.94))")}
${header("dark")}
<div class="body l-body">${seals("", 1300)}<div class="stack l-copy">${copy([7, 8])}</div></div>`,
  css: `.l-bg{display:block}.l-a,.l-b{position:absolute;inset:0;overflow:hidden}.l-a img,.l-b img{width:100%;height:100%;object-fit:cover;animation:kb 28s ease-out both}
.l-b{clip-path:polygon(60% 0,100% 0,100% 100%,44% 100%);animation:wipe 1.6s var(--ease) .3s both}
.l-bg:after{content:"";position:absolute;inset:0;background:linear-gradient(101deg,transparent 51.6%,#12C0C6 51.7%,transparent 51.95%);opacity:.9}
.l-body{justify-content:flex-end;gap:28px;padding-bottom:56px}.l-body>.seals{order:2}.l-copy{max-width:900px}
@keyframes wipe{from{clip-path:polygon(100% 0,100% 0,100% 100%,100% 100%)}to{clip-path:polygon(60% 0,100% 0,100% 100%,44% 100%)}}
@container hero (max-width:900px){.l-b{clip-path:polygon(0 30%,100% 22%,100% 52%,0 60%);animation:none}.l-bg:after{background:linear-gradient(180deg,rgba(5,8,11,.3) 0%,rgba(5,8,11,.78) 26%,rgba(5,8,11,.92) 60%,rgba(5,8,11,.97) 100%);opacity:1}.l-body{gap:20px;padding-bottom:28px}}` });

// ---------- logic ----------
const logic = (shadeDefault, themed, themeDefault = "dark") => `class Component extends DCLogic {
  renderVals() {
    const s = this.state || {};
    const set = (o) => this.setState(o);
    const motion = this.props.motion ?? true;${themed ? `
    const theme = s.theme || this.props.theme || '${themeDefault}';` : ""}
    return {${themed ? `
      themeCls: theme === 'light' ? 'light' : 'dark',
      swCls: s.theme ? 'sw' : '',
      themeLabel: theme === 'light' ? 'Switch to night' : 'Switch to day',
      themePressed: theme === 'light' ? 'true' : 'false',
      toggleTheme: () => set({ theme: theme === 'light' ? 'dark' : 'light', menu: false, lang: false }),` : ""}
      shade: this.props.shade ?? ${shadeDefault},
      stillCls: motion ? '' : 'still',
      menuOpen: !!s.menu, menuShut: !s.menu, menuExp: s.menu ? 'true' : 'false',
      toggleMenu: () => set({ menu: !s.menu, lang: false }), closeMenu: () => set({ menu: false }),
      langOpen: !!s.lang, langExp: s.lang ? 'true' : 'false', toggleLang: () => set({ lang: !s.lang })
    };
  }
}`;

function write(h) {
  const props = { ...(h.themed ? { theme: { editor: "enum", options: ["dark", "light"], default: h.themeDefault || "dark", section: "Hero" } } : {}), shade: { editor: "range", min: 0, max: 1, step: 0.05, default: h.shade, section: "Hero" }, motion: { editor: "boolean", default: true, section: "Hero" }, $preview: { width: 1440, height: 900 } };
  const ink = h.theme === "dark" ? "#F4F5F5" : "#0B0B0C";
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>HCIG v3 Hero ${h.id}, ${esc(h.name)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Bodoni+Moda:opsz,wght@6..96,400&amp;display=swap">
<style>
@font-face{font-family:'Helma';src:url('${u("helma")}') format('woff2');font-weight:400;font-style:normal;font-display:swap}
body{margin:0}
${BASE}
${h.css}
</style>
</helmet>
<section class="hero ${h.themed ? "{{themeCls}} {{swCls}}" : h.theme === "dark" ? "dark" : ""} {{stillCls}}" style="font-family:'Inter',system-ui,sans-serif;color:${h.themed ? "var(--ink)" : ink}"><div class="in ${h.inCls || ""}">
${h.body}
</div></section>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${JSON.stringify(props)}'>
${logic(h.shade, h.themed, h.themeDefault)}
</script>
</body>
</html>
`;
  writeFileSync(join(OUT, `${h.file}.dc.html`), html);
  const phone = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>HCIG v3 Hero ${h.id}, phone</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet><style>body{margin:0}</style></helmet>
<div style="width:390px;min-height:844px;background:${h.theme === "dark" ? "#07080A" : "#FFFFFF"};font-family:'Inter',system-ui,sans-serif;color:${ink}">
<dc-import name="${h.file}" hint-size="390px,844px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":390,"height":${PH[h.id] || 844}}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`;
  writeFileSync(join(OUT, `${h.file}Phone.dc.html`), phone);
}

// ---------- The four heroes he chose (2026-10-19): B, D, J and the original, each with night and day ----------
// B: "work on original B, lets make light version of it, and make like smooth transisiontioning from night to light".
// Then: "lets work and do same things on D and J ,,, and on original healthcareig.com design but enhance to be as our".
// And: "have our design guidelines on all" (Helma at the weight the live site shows it, Inter, turquoise #12C0C6),
// "on B, i dont like added flows, they dont fit, maybe enhance the flows to be exactly on earth": the drawn routes
// are gone; light now runs along the photo's own flows (masks cut from each photo, flows-night.png, flows-day.png).
// Day photos: made in his Gemini account from each night photo, so the views match.
P.sun = '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>';
P.moon = '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>';
P.lock = '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>';

const pair = (night, day, attrs = "") => `<img class="th-d" src="${u(night)}" alt=""${attrs}><img class="th-l" src="${u(day)}" alt=""${attrs}>`;
const swap = (cls, night, day, alt) => `<span class="lg ${cls}"><img class="th-d" src="${u(night)}" alt="${alt}"><img class="th-l" src="${u(day)}" alt="" aria-hidden="true"></span>`;

function themedHeader() {
  const logos = `<span class="lg hd-full-box"><img class="hd-full th-d" src="${u("logo-h-white")}" alt="Healthcare International Group"><img class="hd-full th-l" src="${u("logo-h-black")}" alt="" aria-hidden="true"></span><span class="lg hd-mark-box"><img class="hd-mark th-d" src="${u("mark-white")}" alt="Healthcare International Group"><img class="hd-mark th-l" src="${u("mark-black")}" alt="" aria-hidden="true"></span>`;
  return header("dark")
    .replace(/<img class="hd-full"[^>]*><img class="hd-mark"[^>]*>/, logos)
    .replace('<div class="lang">', `<button type="button" class="theme-btn" onClick="{{toggleTheme}}" aria-label="{{themeLabel}}" aria-pressed="{{themePressed}}"><span class="ti ti-sun">${ic("sun", 19)}</span><span class="ti ti-moon">${ic("moon", 18)}</span></button><div class="lang">`);
}
const ctaPair = `<div class="ctas"><a href="#" class="btn">${esc(W.talk)}${ic("arrow", 18)}</a><a href="#" class="btn2">Become a Partner</a></div>`;
const shadesFx = (dark, light) => `<div class="shades"><div class="th-d"><div style="position:absolute;inset:0;background:${dark};opacity:{{shade}}"></div></div><div class="th-l"><div style="position:absolute;inset:0;background:${light};opacity:{{shade}}"></div></div></div><div class="fx" aria-hidden="true"><div class="band"></div><div class="flare"></div></div>`;

// Night and day, shared by the four. The sweep 2.4 s; words and logo change at its middle.
const THEME_CSS = `
.hero{--sweep:2.4s;--sweep-ease:cubic-bezier(.45,.05,.35,1);transition:background-color 1.3s var(--sweep-ease) .9s}
.hero.light{--ink:#0B0B0C;--ink2:#3F4042;--muted:#565759;--line:rgba(11,11,12,.16);--acc-text:#087276;background:#FFFFFF}
.h1,.sub,.lead,.seals p,.hd-nav a,.btn2,.lang-btn,.theme-btn,.menu-btn,.soc a,.o-cred,.o-tag,.o-kicker{transition:color 1s var(--sweep-ease) 1s,border-color 1s var(--sweep-ease) 1s,background-color .3s}
.h1 .acc{transition:color 1s var(--sweep-ease) 1s}
/* the day photo is revealed by a soft terminator travelling from the east (right) to the west */
@property --dawn{syntax:'<percentage>';inherits:false;initial-value:-12%}
.bg .th-l{position:absolute;inset:0;--dawn:-12%;-webkit-mask-image:linear-gradient(-72deg,#000 calc(var(--dawn) - 10%),transparent calc(var(--dawn) + 10%));mask-image:linear-gradient(-72deg,#000 calc(var(--dawn) - 10%),transparent calc(var(--dawn) + 10%));transition:--dawn var(--sweep) var(--sweep-ease)}
.hero.light .bg .th-l{--dawn:122%}
.shades .th-d,.shades .th-l{transition:opacity 1.3s var(--sweep-ease) .9s}
.hero:not(.light) .shades .th-l,.hero.light .shades .th-d{opacity:0}
/* logo, mark and watermark crossfade in place */
.lg{position:relative;display:block}.lg .th-l{position:absolute;left:0;top:0;width:100%}
.lg img{transition:opacity .9s var(--sweep-ease) 1s}
.hero:not(.light) .lg .th-l,.hero.light .lg .th-d{opacity:0}
.hero .hd-mark-box{display:none}
.hero.light .glass{background:rgba(255,255,255,.6);border-color:rgba(255,255,255,.95);box-shadow:0 40px 80px -40px rgba(0,0,0,.25)}
/* the light band riding the terminator, and the sun flare */
.fx{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.band{position:absolute;top:-20%;bottom:-20%;left:0;width:46%;opacity:0;transform:translateX(230%) skewX(-18deg);background:linear-gradient(90deg,transparent,rgba(255,252,240,0) 10%,rgba(255,250,235,.55) 45%,rgba(160,240,242,.35) 60%,transparent);filter:blur(18px);mix-blend-mode:screen}
.flare{position:absolute;left:var(--fx-x,66%);top:var(--fx-y,44%);width:520px;height:520px;margin:-260px 0 0 -260px;border-radius:50%;opacity:0;transform:scale(.2);background:radial-gradient(closest-side,rgba(255,255,250,.95),rgba(255,244,214,.55) 22%,rgba(120,230,234,.25) 48%,transparent 72%);mix-blend-mode:screen}
.sw.light .band{animation:dawn var(--sweep) var(--sweep-ease) both}
.sw.dark .band{animation:dusk var(--sweep) var(--sweep-ease) both;background:linear-gradient(90deg,transparent,rgba(10,40,70,0) 10%,rgba(6,22,40,.6) 45%,rgba(18,192,198,.28) 60%,transparent);mix-blend-mode:normal}
.sw.light .flare{animation:flare 2.6s var(--sweep-ease) .2s both}
@keyframes dawn{0%{opacity:0;transform:translateX(230%) skewX(-18deg)}12%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateX(-120%) skewX(-18deg)}}
@keyframes dusk{0%{opacity:0;transform:translateX(-120%) skewX(-18deg)}12%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateX(230%) skewX(-18deg)}}
@keyframes flare{0%{opacity:0;transform:scale(.2)}35%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.6)}}
/* the switch: the sun sets and the moon rises inside the button */
.theme-btn{position:relative;width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;overflow:hidden}
.theme-btn:hover{border-color:var(--accent);background:rgba(18,192,198,.1)}
.ti{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transition:transform .9s var(--sweep-ease),opacity .6s}
.hero:not(.light) .ti-moon{transform:translateY(120%) rotate(-60deg);opacity:0}
.hero.light .ti-sun{transform:translateY(-120%) rotate(90deg);opacity:0}
.ti-sun svg{transition:transform 1.2s var(--sweep-ease)}.theme-btn:hover .ti-sun svg{transform:rotate(45deg)}
.shades,.shades>div{position:absolute;inset:0;pointer-events:none}.shades{z-index:1}
.ctas{display:flex;flex-wrap:wrap;gap:12px}
.btn2{white-space:nowrap;display:inline-flex;align-items:center;min-height:56px;padding:0 28px;border-radius:999px;border:1px solid var(--line);color:var(--ink);font:500 15px/1 var(--sans);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.btn2:hover{border-color:var(--accent);background:rgba(18,192,198,.1)}
.still .band,.still .flare{display:none}
.still .bg .th-l{transition:none}
@media (prefers-reduced-motion:reduce){.hero .band,.hero .flare{display:none}.hero .bg .th-l{transition:none}}
@container hero (max-width:900px){
  .hero .hd-full-box{display:none}.hero .hd-mark-box{display:block}.hd-tools{gap:8px}
  .hero.light .bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.3) 0%,rgba(255,255,255,.8) 26%,rgba(255,255,255,.93) 60%,rgba(255,255,255,.97) 100%)}
  .flare{left:80%;top:30%;width:340px;height:340px;margin:-170px 0 0 -170px}
  .ctas{flex-direction:column}.ctas .btn,.btn2{width:100%;justify-content:center;min-height:52px}
}`;

// Turn a hero into its night and day version. The photo, shade, layout and words stay as they are.
function themify(id, o) {
  const h = H.find((x) => x.id === id);
  const was = h.body;
  h.themed = true;
  h.themeDefault = o.themeDefault || "dark";
  if (o.bg) h.body = h.body.replace(/<div class="bg">[\s\S]*?<\/div>\n/, o.bg + "\n");
  else h.body = h.body.replace(/<div class="bg"><img src="([^"]*)" alt=""( style="[^"]*")?><\/div>/, (m, src, st) => `<div class="bg"><img class="th-d" src="${src}" alt=""${st || ""}><img class="th-l" src="${u(o.day)}" alt=""${st || ""}></div>`);
  h.body = h.body
    .replace(/<div class="shade" style="background:(.*?);opacity:\{\{shade\}\}"><\/div>/, (m, dark) => shadesFx(dark, o.lightShade))
    .replace(header("dark"), themedHeader())
    .replace(`<a href="#" class="btn">${esc(W.talk)}${ic("arrow", 18)}</a></div>`, `${ctaPair}</div>`);
  if (o.edit) h.body = o.edit(h.body);
  for (const k of ["theme-btn", "btn2", "class=\"shades\"", "class=\"fx\"", "th-l"]) if (!h.body.includes(k)) throw new Error(`hero ${id}: missed ${k}`);
  if (h.body === was) throw new Error(`hero ${id} unchanged`);
  h.css += THEME_CSS + (o.css || "");
}

// B · Night Network: the original photo, its own flows carry the light. Cairo sits at 73.8% 61.2% of the night photo
// and 75.4% 59.9% of the day photo; the stage keeps the photo's own shape (1376 x 768) so the masks and hubs line up.
themify("B", {
  bg: `<div class="bg"><div class="stage">${pair("g-earth-network", "g-earth-day2")}<div class="flow fl-n"></div><div class="flow fl-d"></div><span class="hub hub-n" style="left:73.8%;top:61.2%"></span><span class="hub hub-d" style="left:75.4%;top:59.9%"></span></div></div>`,
  lightShade: "radial-gradient(70% 85% at 22% 50%,rgba(255,255,255,.95),rgba(255,255,255,.2) 72%)",
  edit: (b) => b.replace(/<svg class="b-routes"[\s\S]*?<\/svg>\n?/, ""),
  css: `
.stage{position:absolute;top:0;left:50%;height:100%;aspect-ratio:1376/768;min-width:100%;translate:-50% 0;animation:kb 28s ease-out both}
.stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:none}
.flow{position:absolute;inset:0;pointer-events:none;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;transition:opacity 1.2s var(--sweep-ease) .8s}
.fl-n{-webkit-mask-image:url('${u("flows-night")}');mask-image:url('${u("flows-night")}');mix-blend-mode:screen}
.fl-d{-webkit-mask-image:url('${u("flows-day")}');mask-image:url('${u("flows-day")}')}
.hero:not(.light) .fl-d,.hero.light .fl-n{opacity:0}
.flow:before,.flow:after{content:"";position:absolute;inset:0;background-size:320% 100%;background-repeat:no-repeat;animation:run 5.2s cubic-bezier(.45,0,.25,1) infinite}
.fl-n:before{background-image:linear-gradient(112deg,transparent 42%,rgba(18,192,198,.55) 46%,#F2FFFF 49.5%,rgba(18,192,198,.75) 52%,transparent 57%)}
.fl-n:after{background-image:linear-gradient(118deg,transparent 44%,rgba(18,192,198,.4) 48%,#DFFFFF 50%,transparent 55%);animation-duration:7.4s;animation-delay:-3.1s}
.fl-d:before{background-image:linear-gradient(112deg,transparent 42%,rgba(18,192,198,.7) 46%,#FFFFFF 49.5%,rgba(10,127,132,.85) 52%,transparent 57%)}
.fl-d:after{background-image:linear-gradient(118deg,transparent 44%,rgba(10,127,132,.6) 48%,#FFFFFF 50%,transparent 55%);animation-duration:7.4s;animation-delay:-3.1s}
@keyframes run{0%{background-position:100% 0}100%{background-position:0% 0}}
.hub{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#E9FFFF;box-shadow:0 0 14px 4px rgba(18,192,198,.9);transition:opacity 1.2s var(--sweep-ease) .8s}
.hub:after{content:"";position:absolute;inset:-1px;border-radius:50%;border:2px solid #12C0C6;animation:ping 2.4s ease-out infinite}
.hero:not(.light) .hub-d,.hero.light .hub-n{opacity:0}
.hero.light .hub{background:#FFFFFF;box-shadow:0 0 12px 3px rgba(10,127,132,.75)}
.still .flow:before,.still .flow:after,.still .hub:after{animation:none;background-position:50% 0}
@media (prefers-reduced-motion:reduce){.hero .flow:before,.hero .flow:after{animation:none;background-position:50% 0}}`,
});

// D · Boardroom: the boardroom by day, the sea turning turquoise.
themify("D", {
  day: "g-boardroom-day",
  lightShade: "linear-gradient(90deg,rgba(255,255,255,.95) 0%,rgba(255,255,255,.78) 45%,rgba(255,255,255,.08) 82%)",
  css: `.d-plaque p{transition:color 1s var(--sweep-ease) 1s}.hero.light .d-plaque p{color:var(--ink2)}.hero.light .d-rule{background:rgba(11,11,12,.16)}.hero{--fx-x:72%;--fx-y:30%}`,
});

// J · Marble Noir: white marble by day, the HC mark turns from white to black.
themify("J", {
  day: "g-marble-white",
  lightShade: "radial-gradient(60% 70% at 50% 45%,rgba(255,255,255,.5),rgba(255,255,255,.94))",
  edit: (b) => b.replace(`<img src="${u("mark-white")}" alt="">`, swap("", "mark-white", "mark-black", "")),
  css: `.hero{--fx-x:78%;--fx-y:40%}@container hero (max-width:900px){.j-body>.f{width:100%}}`,
});

// O · The original, polished: the live hero kept as it is built (the partner banner on top, the cover photo of the
// doctors, the turquoise second line, the lead as the Helma headline, Talk to our team), raised to our standard:
// the real logo and mark (crisp, not baked into the photo), plates for the seals, the word reveal, night and day.
const leadH1 = (cls) => { const ws = W.lead.split(" "); return `<h1 class="h1 ${cls}" aria-label="${esc(W.lead)}">${ws.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(" ")}</h1>`; };
H.push({ id: "O", file: "HeroO", name: "Original, polished", theme: "light", shade: 0.9, body: `
<div class="bg"><img src="${u("o-cover-night")}" alt="" style="object-position:78% 30%"></div>
${shadeDiv("linear-gradient(90deg,rgba(5,8,10,.96) 0%,rgba(5,8,10,.78) 40%,rgba(5,8,10,0) 68%)")}
<div class="o-wm" aria-hidden="true"><img src="${u("mark-white")}" alt=""></div>
${header("dark")}
<div class="body o-body"><div class="o-banner f" style="--d:150ms"><div class="plates">${plates()}</div><div><p class="o-cred">${esc(W.credential)}</p><p class="o-tag">${esc(W.tagline)}</p></div></div>
<div class="stack o-copy"><p class="o-kicker f" style="--d:350ms">${esc(W.sub)}</p>${leadH1("o-h1")}<div class="f o-act" style="--d:1500ms"><a href="#" class="btn">${esc(W.talk)}${ic("arrow", 18)}</a></div><p class="o-safe f" style="--d:1700ms">${ic("lock", 15)}<span title="Secure &amp; confidential communication">Secure &amp; confidential communication</span></p></div></div>`,
  css: `.o-body{gap:0;padding-top:4px}
.o-banner{display:flex;align-items:center;gap:22px;padding:18px 0 24px;border-bottom:1px solid var(--line);max-width:980px}
.o-cred{margin:0;font-size:16px;line-height:1.5;font-weight:600;color:var(--ink)}.o-tag{margin:4px 0 0;font-size:14px;color:var(--muted)}
.o-copy{margin:auto 0;max-width:720px;gap:20px;padding:40px 0}
.o-kicker{margin:0;font-size:22px;line-height:1.45;font-weight:500;color:var(--accent);max-width:34ch}
.hero.light .o-kicker{color:#0A7F84}
.o-h1{font-size:46px;line-height:1.16}
.o-h1 .w>span{animation-delay:calc(var(--i) * 45ms + 500ms)}
.o-safe{display:flex;align-items:center;gap:8px;margin:0;font-size:13px;color:var(--muted)}.o-safe svg{color:var(--accent)}
.o-wm{position:absolute;z-index:1;left:2%;top:34%;width:380px;opacity:.07;pointer-events:none;animation:wm 2.4s var(--ease) .3s both}
.o-wm .lg img{width:100%}
@keyframes wm{from{opacity:0;transform:translateY(24px) scale(.96)}to{opacity:.07;transform:none}}
.hero{--fx-x:70%;--fx-y:28%}
@container hero (max-width:900px){.o-banner{gap:12px;padding:12px 0 16px}.o-cred{font-size:13px}.o-tag{font-size:12px}.o-copy{padding:26px 0 0;gap:16px}.o-kicker{font-size:17px}.o-h1{font-size:28px;line-height:1.2}.o-wm{width:200px;top:40%;left:-6%}}` });
PH.O = 900;
themify("O", {
  day: "o-cover-day",
  themeDefault: "light",
  lightShade: "linear-gradient(90deg,rgba(255,255,255,.97) 0%,rgba(255,255,255,.82) 40%,rgba(255,255,255,0) 68%)",
  edit: (b) => b
    .replace(`<div class="o-wm" aria-hidden="true"><img src="${u("mark-white")}" alt=""></div>`, `<div class="o-wm" aria-hidden="true">${swap("", "mark-white", "mark-black", "")}</div>`),
});

H.forEach(write);

// Night and day boards for the four: each mounts the hero with its starting theme.
const wrap = (hero, file, title, w, h, theme) => writeFileSync(join(OUT, file), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet><style>body{margin:0}</style></helmet>
<div style="width:${w}px;min-height:${h}px;background:${theme === "light" ? "#FFFFFF" : "#07080A"};font-family:'Inter',system-ui,sans-serif;color:${theme === "light" ? "#0B0B0C" : "#F4F5F5"}">
<dc-import name="${hero}" theme="${theme}" hint-size="${w}px,${h}px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`);
const FOUR = [["B", "Night Network"], ["D", "Boardroom"], ["J", "Marble Noir"], ["O", "The original, polished"]];
const PHT = { B: 900, D: 900, J: 900, O: 900 }; // phone board heights, measured at 390 px
for (const [id] of FOUR) {
  wrap(`Hero${id}`, `Hero${id}Night.dc.html`, `HCIG v3 Hero ${id}, night`, 1440, 900, "dark");
  wrap(`Hero${id}`, `Hero${id}Day.dc.html`, `HCIG v3 Hero ${id}, day`, 1440, 900, "light");
  wrap(`Hero${id}`, `Hero${id}PhoneNight.dc.html`, `HCIG v3 Hero ${id}, phone, night`, 390, PHT[id], "dark");
  wrap(`Hero${id}`, `Hero${id}PhoneDay.dc.html`, `HCIG v3 Hero ${id}, phone, day`, 390, PHT[id], "light");
}

// ---------- canvas index: page 1 the four heroes, night and day; page 2 all twelve as first shown ----------
const boards = {}, order = [], notes = {};
FOUR.forEach(([id, name], i) => {
  const y = i * 1500, f = `Hero${id}`, ph = PHT[id];
  boards[`${f}Night.dc.html`] = { x: 0, y, w: 1440, h: 900, title: `${id} · night (press the sun)`, is_interactive: true, page: "four" };
  boards[`${f}Day.dc.html`] = { x: 1520, y, w: 1440, h: 900, title: `${id} · day (press the moon)`, is_interactive: true, page: "four" };
  boards[`${f}PhoneNight.dc.html`] = { x: 3040, y, w: 390, h: ph, title: `${id} · phone night`, is_interactive: true, page: "four" };
  boards[`${f}PhoneDay.dc.html`] = { x: 3510, y, w: 390, h: ph, title: `${id} · phone day`, is_interactive: true, page: "four" };
  notes["four" + id] = { x: 0, y: y - 250, text: `${id} · ${name}`, kind: "title1", maxW: 3900, page: "four" };
  order.push(`${f}Night.dc.html`, `${f}Day.dc.html`, `${f}PhoneNight.dc.html`, `${f}PhoneDay.dc.html`);
});
notes.fourNote = { x: 4040, y: 0, w: 460, maxH: 900, size: "m", fill: "yellow", page: "four", text: "Four heroes, night and day\n\n1. Press the sun or the moon in the header of any board (best in Play). Day comes in from the east with a soft light line and a sun flare; words and logo change halfway.\n2. B: the drawn routes are gone. Light now runs along the flows that are in the photo itself, toward Egypt.\n3. D and J: the same photos by day (made in your Gemini). J's HC mark turns from white to black.\n4. O is today's healthcareig.com hero, polished: the same order (partner banner, the doctors, the turquoise line, the lead as the headline, Talk to our team), with the real logo and mark, seals on plates, motion, night and day. Day is its starting look, as on the live site.\n5. Fonts: Helma at the weight the live site shows it, Inter for text. Turquoise #12C0C6.\n6. Become a Partner sits beside Talk to our team on all four." };
const pitchY = 1300, colX = [0, 2240];
H.forEach((h, i) => {
  if (h.id === "O") {
    boards["HeroO.dc.html"] = { x: 0, y: 6 * pitchY, w: 1440, h: 900, title: "Hero O · the original, polished", is_interactive: true, page: "twelve" };
    boards["HeroOPhone.dc.html"] = { x: 1520, y: 6 * pitchY, w: 390, h: PH.O, title: "Hero O · phone", is_interactive: true, page: "twelve" };
    notes.rowO = { x: 0, y: 6 * pitchY - 250, text: "O · The original, polished", kind: "title1", maxW: 1910, page: "twelve" };
    order.push("HeroO.dc.html", "HeroOPhone.dc.html");
    return;
  }
  const col = i < 6 ? 0 : 1, row = i % 6;
  const x = colX[col], y = row * pitchY;
  boards[`${h.file}.dc.html`] = { x, y, w: 1440, h: 900, title: `Hero ${h.id} · ${h.name}`, is_interactive: true, page: "twelve" };
  boards[`${h.file}Phone.dc.html`] = { x: x + 1520, y, w: 390, h: h.themed ? PHT[h.id] : PH[h.id] || 844, title: `Hero ${h.id} · phone`, is_interactive: true, page: "twelve" };
  notes["row" + h.id] = { x, y: y - 250, text: `${h.id} · ${h.name}`, kind: "title1", maxW: 1910, page: "twelve" };
  order.push(`${h.file}.dc.html`, `${h.file}Phone.dc.html`);
});
notes.open = { x: 4400, y: 0, w: 440, maxH: 760, size: "m", fill: "yellow", page: "twelve", text: "The twelve heroes as first shown, kept for reference. His pick: B, D, J and the original, on the first page with night and day." };
writeFileSync(join(OUT, "canvas.json"), JSON.stringify({ v: 3, createdOnFiles: { v: 1, at: "2026-10-19T11:00:00Z" }, title: "HCIG v3 Hero", launch: { view: "canvas", page: "four" }, pages: [{ id: "four", name: "Four heroes, night and day" }, { id: "twelve", name: "All twelve heroes" }], boards, order, notes, designSystems: [] }, null, 2));
console.log(`wrote ${H.length} heroes, night and day boards for ${FOUR.length}, canvas.json`);
