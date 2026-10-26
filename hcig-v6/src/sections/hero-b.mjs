// Hero B ("Night Network"), approved by the owner; v6 carries it plain: no HC mark, no film loop (his answer 2026-10-26).
// Ported from hcig-v3/canvas/heroes/project/HeroB.dc.html. Changes: tokens instead of local colours, the darker teal
// #0A7F84 replaced by palette colours (owner's palette rule, 2026-10-22), Bodoni fallback dropped.
// Theme classes (theme-day / theme-night) and the switch class (sw) sit on the .page root.
import { bind, esc, icon } from "./_bind.mjs";
import { header } from "./header.mjs";
import { HERO } from "../content/home.mjs";

export const css = ({ asset }) => `
.hero { position: relative; }
.hero .in { position: relative; overflow: hidden; min-height: 900px; display: flex; flex-direction: column; }
.hero .bg { position: absolute; inset: 0; z-index: var(--z-base); overflow: hidden; }
.hero .stage { position: absolute; top: 0; left: 50%; height: 100%; aspect-ratio: 1376 / 768; min-width: 100%; translate: -50% 0; animation: kb 28s ease-out both; }
.hero .stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
@keyframes kb { from { transform: scale(1.14); } to { transform: scale(1); } }

/* The day photo is revealed by a soft terminator travelling from the east (right) to the west */
@property --dawn { syntax: '<percentage>'; inherits: false; initial-value: -12%; }
.hero .bg .th-l {
  --dawn: -12%;
  -webkit-mask-image: linear-gradient(-72deg, #000 calc(var(--dawn) - 10%), transparent calc(var(--dawn) + 10%));
  mask-image: linear-gradient(-72deg, #000 calc(var(--dawn) - 10%), transparent calc(var(--dawn) + 10%));
  transition: --dawn var(--sweep) var(--ease-sweep);
}
.theme-day .hero .bg .th-l { --dawn: 122%; }

/* Light pulses running along the flows on the Earth */
.hero .flow { position: absolute; inset: 0; pointer-events: none; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; transition: opacity 1.2s var(--ease-sweep) .8s; }
.hero .fl-n { -webkit-mask-image: url('${asset("flows-night")}'); mask-image: url('${asset("flows-night")}'); mix-blend-mode: screen; }
.hero .fl-d { -webkit-mask-image: url('${asset("flows-day")}'); mask-image: url('${asset("flows-day")}'); }
.theme-night .hero .fl-d, .theme-day .hero .fl-n { opacity: 0; }
.hero .flow::before, .hero .flow::after { content: ""; position: absolute; inset: 0; background-size: 320% 100%; background-repeat: no-repeat; animation: run 5.2s cubic-bezier(.45, 0, .25, 1) infinite; }
.hero .fl-n::before { background-image: linear-gradient(112deg, transparent 42%, rgba(18, 192, 198, .55) 46%, color-mix(in srgb, var(--turq) 5%, var(--white)) 49.5%, rgba(18, 192, 198, .75) 52%, transparent 57%); }
.hero .fl-n::after { background-image: linear-gradient(118deg, transparent 44%, rgba(18, 192, 198, .4) 48%, color-mix(in srgb, var(--turq) 12%, var(--white)) 50%, transparent 55%); animation-duration: 7.4s; animation-delay: -3.1s; }
.hero .fl-d::before { background-image: linear-gradient(112deg, transparent 42%, rgba(18, 192, 198, .8) 46%, var(--white) 49.5%, rgba(86, 87, 89, .55) 52%, transparent 57%); }
.hero .fl-d::after { background-image: linear-gradient(118deg, transparent 44%, rgba(86, 87, 89, .45) 48%, var(--white) 50%, transparent 55%); animation-duration: 7.4s; animation-delay: -3.1s; }
@keyframes run { 0% { background-position: 100% 0; } 100% { background-position: 0% 0; } }

/* Cairo, where the flows meet */
.hero .hub { position: absolute; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: color-mix(in srgb, var(--turq) 9%, var(--white)); box-shadow: 0 0 14px 4px rgba(18, 192, 198, .9); transition: opacity 1.2s var(--ease-sweep) .8s; }
.hero .hub::after { content: ""; position: absolute; inset: -1px; border-radius: 50%; border: 2px solid var(--turq); animation: ping 2.4s ease-out infinite; }
.theme-night .hero .hub-d, .theme-day .hero .hub-n { opacity: 0; }
.theme-day .hero .hub { background: var(--white); box-shadow: 0 0 12px 3px rgba(18, 192, 198, .9); }
@keyframes ping { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(2.8); opacity: 0; } }

/* Readability shades, night and day */
.hero .shades, .hero .shades > div { position: absolute; inset: 0; pointer-events: none; }
.hero .shades { z-index: var(--z-media); }
.hero .shades .th-d, .hero .shades .th-l { transition: opacity 1.3s var(--ease-sweep) .9s; }
.theme-night .hero .shades .th-l, .theme-day .hero .shades .th-d { opacity: 0; }

/* The light band riding the terminator, and the sun flare (only after the first press: .sw) */
.hero .fx { position: absolute; inset: 0; z-index: var(--z-media); pointer-events: none; overflow: hidden; }
.hero .band { position: absolute; top: -20%; bottom: -20%; left: 0; width: 46%; opacity: 0; transform: translateX(230%) skewX(-18deg); background: linear-gradient(90deg, transparent, rgba(255, 252, 240, 0) 10%, rgba(255, 250, 235, .55) 45%, rgba(160, 240, 242, .35) 60%, transparent); filter: blur(18px); mix-blend-mode: screen; }
.hero .flare { position: absolute; left: var(--fx-x, 66%); top: var(--fx-y, 44%); width: 520px; height: 520px; margin: -260px 0 0 -260px; border-radius: 50%; opacity: 0; transform: scale(.2); background: radial-gradient(closest-side, rgba(255, 255, 250, .95), rgba(255, 244, 214, .55) 22%, rgba(120, 230, 234, .25) 48%, transparent 72%); mix-blend-mode: screen; }
.sw.theme-day .hero .band { animation: dawn var(--sweep) var(--ease-sweep) both; }
.sw.theme-night .hero .band { animation: dusk var(--sweep) var(--ease-sweep) both; background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, .6) 45%, rgba(18, 192, 198, .28) 60%, transparent); mix-blend-mode: normal; }
.sw.theme-day .hero .flare { animation: flare 2.6s var(--ease-sweep) .2s both; }
@keyframes dawn { 0% { opacity: 0; transform: translateX(230%) skewX(-18deg); } 12% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(-120%) skewX(-18deg); } }
@keyframes dusk { 0% { opacity: 0; transform: translateX(-120%) skewX(-18deg); } 12% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(230%) skewX(-18deg); } }
@keyframes flare { 0% { opacity: 0; transform: scale(.2); } 35% { opacity: .9; transform: scale(1); } 100% { opacity: 0; transform: scale(1.6); } }

/* Words */
.hero .body { position: relative; z-index: var(--z-content); flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 40px; padding: 0 var(--gutter) 48px; }
.hero .copy { display: grid; gap: 22px; align-content: start; max-width: 680px; }
.hero .seals-row { padding-top: 24px; border-top: 1px solid var(--line); }

.still .hero .band, .still .hero .flare { display: none; }
.still .hero .bg .th-l { transition: none; }
.still .hero .flow::before, .still .hero .flow::after, .still .hero .hub::after { animation: none; background-position: 50% 0; }
@media (prefers-reduced-motion: reduce) {
  .hero .band, .hero .flare { display: none; }
  .hero .bg .th-l { transition: none; }
  .hero .flow::before, .hero .flow::after { animation: none; background-position: 50% 0; }
}

/* Phone first: the photo becomes a band at the top that melts into the page, the words sit under it */
@container page (max-width: 900px) {
  .hero .in { min-height: 844px; }
  .hero .bg { bottom: auto; height: 400px; }
  .hero .bg::before, .hero .bg::after { content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none; transition: opacity 1.3s var(--ease-sweep) .9s; }
  .hero .bg::after { background: linear-gradient(180deg, rgba(0, 0, 0, .6) 0%, transparent 24%, transparent 48%, #000 97%); }
  .hero .bg::before { background: linear-gradient(180deg, rgba(255, 255, 255, .75) 0%, transparent 24%, transparent 48%, #FFF 97%); opacity: 0; }
  .theme-day .hero .bg::before { opacity: 1; }
  .theme-day .hero .bg::after { opacity: 0; }
  .hero .stage { height: 430px; top: -40px; left: calc(76% - 560px); min-width: 0; translate: none; }
  .hero .hub { width: 10px; height: 10px; margin: -5px 0 0 -5px; }
  .hero .shades { display: none; }
  .hero .body { justify-content: flex-start; padding-top: 244px; padding-bottom: 28px; gap: 26px; }
  .hero .copy { gap: 16px; }
  .hero .h1 { font-size: 34px; line-height: 1.12; }
  .hero .sub { font-size: 17px; }
  .hero .lead { font-size: 16px; }
  .hero .flare { left: 72%; top: 10%; width: 240px; height: 240px; margin: -120px 0 0 -120px; }
  .hero .fx { opacity: .6; }
  .hero .seals-row { padding-top: 20px; }
}
/* Small phones (360 px): a shorter band and a smaller headline keep both buttons on the first screen */
@container page (max-width: 370px) {
  .hero .bg { height: 350px; }
  .hero .body { padding-top: 188px; }
  .hero .h1 { font-size: 31px; }
  .hero .lead { font-size: 15.5px; }
}
`;

export function heroB(ctx) {
  const b = bind(ctx);
  const words = HERO.h1.text.split(" ");
  const h1 = words
    .map((w, i) => `<span class="w${i >= HERO.h1.accentFrom ? " acc" : ""}" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`)
    .join(" ");
  const shade = b.hole("shade", "0.6");
  return `<section class="hero"><div class="in">
<div class="bg"><div class="stage"><img class="th-d" src="${b.asset("earth-night")}" alt="" width="1376" height="768" fetchpriority="high"><img class="th-l" src="${b.asset("earth-day")}" alt="" width="2048" height="1143"><div class="flow fl-n"></div><div class="flow fl-d"></div><span class="hub hub-n" style="left:73.8%;top:61.2%"></span><span class="hub hub-d" style="left:75.4%;top:59.9%"></span></div></div>
<div class="shades"><div class="th-d"><div style="position:absolute;inset:0;background:radial-gradient(70% 85% at 22% 50%,rgba(0,0,0,.94),rgba(0,0,0,.15) 72%);opacity:${shade}"></div></div><div class="th-l"><div style="position:absolute;inset:0;background:radial-gradient(70% 85% at 22% 50%,rgba(255,255,255,.95),rgba(255,255,255,.2) 72%);opacity:${shade}"></div></div></div>
<div class="fx" aria-hidden="true"><div class="band"></div><div class="flare"></div></div>
${header(ctx, { current: "/" })}
<div class="body"><div class="copy"><h1 class="h1 rise" aria-label="${esc(HERO.h1.text)}">${h1}</h1><p class="sub f" style="--d:850ms">${esc(HERO.sub.text)}</p><p class="lead f" style="--d:1000ms">${esc(HERO.lead.text)}</p><div class="f" style="--d:1150ms"><div class="ctas"><a href="${b.href("/contacts/")}" class="btn" ${b.on("openSheet")}>${esc(HERO.ctaPrimary.text)}${icon("arrow")}</a><a href="${b.href("/partner/")}" class="btn2">${esc(HERO.ctaSecondary.text)}</a></div></div></div>
<div class="seals seals-row f" style="--d:1400ms"><div class="plates"><span class="plate"><img src="${b.asset("dmwv")}" alt="German Medical Wellness Association (DMWV)" width="310" height="281"></span><span class="plate plate-w"><img src="${b.asset("gha")}" alt="Global Healthcare Accreditation (GHA)" width="391" height="235"></span></div><p>${esc(HERO.partner.text)}</p></div></div>
</div></section>`;
}
