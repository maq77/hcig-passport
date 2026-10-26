// Home sections, batch 2: ecosystem + How Our System Works, Mission and Vision, Why partners, Built for Global,
// Our Healthcare. Words from src/content/home.mjs only.
import { bind, esc, icon } from "./_bind.mjs";
import { ECOSYSTEM, SYSTEM, MISSION, WHY, BUILT, HEALTHCARE, UI } from "../content/home.mjs";

const moreBtn = (b) =>
  `<button type="button" class="more-btn" ${b.on("toggleMore")} aria-expanded="false"><span class="moreLabel">${esc(UI.readMore.text)}</span><span class="less">${esc(UI.readLess.text)}</span>${icon("chevron", 16)}</button>`;

// ---------- The traveller at the centre + How Our System Works ----------
export const ecoCss = `
.eco-grid { display: grid; grid-template-columns: minmax(0, 6fr) minmax(0, 5fr); gap: clamp(32px, 4vw, 80px); align-items: center; }
.ring { position: relative; width: min(100%, 600px); aspect-ratio: 1; margin: 0 auto; --r: 250px; }
.ring-orbit { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.ring-orbit .orb { fill: none; stroke: var(--line); stroke-width: 1; }
.ring-orbit .orb-inner { fill: none; stroke: var(--line); stroke-width: 1; stroke-dasharray: 2 6; }
.ring-orbit .orb-run { fill: none; stroke: var(--accent); stroke-width: 1.6; stroke-linecap: round; stroke-dasharray: 90 1480; animation: orbit 14s linear infinite; filter: drop-shadow(0 0 6px rgba(18, 192, 198, .7)); }
@keyframes orbit { to { stroke-dashoffset: -1570; } }
.ring-centre { position: absolute; left: 50%; top: 50%; width: 46%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; display: grid; place-content: center; justify-items: center; gap: 8px; text-align: center; padding: 18px; background: radial-gradient(circle at 50% 35%, var(--accent-soft), var(--surface) 72%); box-shadow: 0 0 0 1px var(--line), 0 30px 80px -40px rgba(18, 192, 198, .55); }
.ring-centre .tv { width: 64px; height: 64px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--accent); color: var(--black); }
.ring-centre .tv svg { width: 34px; height: 34px; }
.ring-centre strong { font: 600 clamp(17px, 1rem + .5vw, 22px)/1.2 var(--font-display); font-synthesis: weight; color: var(--ink); max-width: 14ch; text-wrap: balance; }
.ring-centre small { font: 500 11px/1.4 var(--font-sans); letter-spacing: .18em; text-transform: uppercase; color: var(--ink-2); }
.ring-nodes { list-style: none; margin: 0; padding: 0; position: absolute; inset: 0; }
.ring-nodes li { position: absolute; left: 50%; top: 50%; width: 118px; margin: -27px 0 0 -59px; display: grid; justify-items: center; gap: 8px; text-align: center;
  transform: rotate(var(--a)) translateY(calc(var(--r) * -1)) rotate(calc(var(--a) * -1)); }
.node-ico { width: 54px; height: 54px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--surface); color: var(--accent); box-shadow: 0 0 0 1px var(--line), 0 12px 24px -16px rgba(0, 0, 0, .4); transition: transform .45s var(--ease), box-shadow .45s var(--ease); }
.theme-night .node-ico { background: var(--black); }
.ring-nodes li:hover .node-ico { transform: scale(1.08); box-shadow: 0 0 0 1px var(--accent), 0 12px 30px -12px rgba(18, 192, 198, .6); }
.node-label { font: 500 12.5px/1.3 var(--font-sans); color: var(--ink); }
.js .ring-nodes li { opacity: 0; transition: opacity .7s var(--ease); transition-delay: calc(var(--i) * 70ms + 200ms); }
.js .eco-visual.in .ring-nodes li { opacity: 1; }
.eco-tagline { margin: 22px auto 0; text-align: center; font: 600 clamp(18px, 1rem + .6vw, 24px)/1.35 var(--font-display); font-synthesis: weight; color: var(--ink); max-width: 30ch; }
.steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; counter-reset: none; }
.steps li { position: relative; display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 16px; padding: 16px 0; border-top: 1px solid var(--line); }
.steps li:last-child { border-bottom: 1px solid var(--line); }
.step-n { font: 600 26px/1 var(--font-display); font-synthesis: weight; color: var(--acc-text); padding-top: 2px; }
.steps h3 { margin: 0 0 6px; font: 600 17px/1.3 var(--font-sans); color: var(--ink); }
.steps p { margin: 0; font-size: 15px; line-height: 1.6; color: var(--ink-2); }
.still .ring-orbit .orb-run { animation: none; }
@media (prefers-reduced-motion: reduce) { .ring-orbit .orb-run { animation: none; } }
@container page (max-width: 1100px) { .ring { --r: 215px; } .ring-nodes li { width: 104px; margin-left: -52px; } }
@container page (max-width: 900px) {
  .eco-grid { grid-template-columns: minmax(0, 1fr); }
  .ring { aspect-ratio: auto; width: 100%; display: grid; gap: 18px; }
  .ring-orbit { display: none; }
  .ring-centre { position: static; transform: none; width: 220px; margin: 0 auto; }
  .ring-nodes { position: static; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .ring-nodes li { position: static; transform: none; margin: 0; width: auto; grid-template-columns: 40px minmax(0, 1fr); justify-items: start; align-items: center; text-align: left; padding: 10px 12px; border: 1px solid var(--line); border-radius: 14px; }
  .node-ico { width: 40px; height: 40px; box-shadow: none; background: var(--accent-soft); }
  .node-ico svg { width: 20px; height: 20px; }
}
`;

export function eco(ctx) {
  const b = bind(ctx);
  const n = ECOSYSTEM.nodes.length;
  const nodes = ECOSYSTEM.nodes
    .map((x, i) => `<li style="--a:${(360 / n) * i}deg;--i:${i}"><span class="node-ico" aria-hidden="true">${icon(x.icon, 24)}</span><span class="node-label">${esc(x.label)}</span></li>`)
    .join("");
  const steps = SYSTEM.steps
    .map((s) => `<li data-reveal><span class="step-n" aria-hidden="true">${esc(s.n)}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`)
    .join("");
  return `<section class="sec eco band-soft" aria-labelledby="eco-h">
<div class="wrap"><div class="sec-head" data-reveal><h2 class="h2" id="eco-h">${esc(SYSTEM.heading)}</h2></div></div>
<div class="wrap eco-grid">
<div class="eco-visual" data-reveal>
<div class="ring"><svg class="ring-orbit" viewBox="0 0 600 600" aria-hidden="true"><circle class="orb" cx="300" cy="300" r="250"/><circle class="orb-run" cx="300" cy="300" r="250"/><circle class="orb-inner" cx="300" cy="300" r="160"/></svg>
<div class="ring-centre"><span class="tv" aria-hidden="true">${icon("traveller", 34)}</span><strong>${esc(ECOSYSTEM.centre.text)}</strong><small>${esc(ECOSYSTEM.centreSub.text)}</small></div>
<ul class="ring-nodes">${nodes}</ul></div>
<p class="eco-tagline">${esc(ECOSYSTEM.tagline.text)}</p>
</div>
<div class="eco-steps"><ol class="steps">${steps}</ol></div>
</div>
</section>`;
}

// ---------- Our mission / Our vision ----------
export const mvCss = `
.mv-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(16px, 2vw, 28px); }
.mv-card { display: grid; align-content: start; gap: 18px; padding: clamp(26px, 3vw, 44px); border-radius: var(--r-media); background: var(--surface); box-shadow: 0 0 0 1px var(--line); position: relative; overflow: hidden; }
.mv-card { background: var(--bg-soft); box-shadow: none; }
.theme-night .mv-card { background: color-mix(in srgb, var(--white) 4%, var(--black)); }
.mv-card .sec-head { margin-bottom: 4px; }
.mv-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.mv-list li { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 10px; color: var(--ink-2); line-height: 1.65; }
.mv-list li::before { content: ""; width: 18px; height: 1px; margin-top: 13px; background: var(--accent); }
.mv-cta { display: flex; justify-content: center; margin-top: clamp(24px, 3vw, 40px); }
@container page (max-width: 800px) { .mv-grid { grid-template-columns: minmax(0, 1fr); } }
`;

export function missionVision(ctx) {
  const b = bind(ctx);
  const card = (x, i, id) => `<article class="mv-card" data-reveal style="--rd:${i * 120}ms" aria-labelledby="${id}"><div class="sec-head"><h2 class="h2" id="${id}">${esc(x.heading)}</h2></div><ul class="mv-list">${x.paras.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></article>`;
  return `<section class="sec mv">
<div class="wrap mv-grid">${card(MISSION.mission, 0, "mission-h")}${card(MISSION.vision, 1, "vision-h")}</div>
<div class="wrap mv-cta" data-reveal><a href="${b.href("/contacts/")}" class="btn" ${b.on("openSheet")}>${esc(MISSION.cta)}${icon("arrow")}</a></div>
</section>`;
}

// ---------- Why partners choose HCIG ----------
export const whyCss = `
.why-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; }
.why-grid .card { grid-column: span 3; }
.why-grid .card:nth-child(n + 5) { grid-column: span 4; }
@container page (max-width: 1100px) { .why-grid .card, .why-grid .card:nth-child(n + 5) { grid-column: span 6; } .why-grid .card:last-child { grid-column: 4 / span 6; } }
@container page (max-width: 640px) { .why-grid .card, .why-grid .card:nth-child(n + 5), .why-grid .card:last-child { grid-column: 1 / -1; } }
`;

export function why(ctx) {
  const b = bind(ctx);
  const cards = WHY.items
    .map((x, i) => {
      const long = x.text.length > 140;
      return `<article class="card${long ? " clampable" : ""}" data-reveal style="--rd:${(i % 4) * 80}ms"><span class="ico" aria-hidden="true">${icon(x.icon, 24)}</span><h3>${esc(x.title)}</h3><p${long ? ' class="clamp"' : ""}>${esc(x.text)}</p>${long ? moreBtn(b) : ""}</article>`;
    })
    .join("");
  return `<section class="sec why band-soft" aria-labelledby="why-h">
<div class="wrap"><div class="sec-head" data-reveal><h2 class="h2" id="why-h">${esc(WHY.heading)}</h2><p class="lead">${esc(WHY.sub)}</p></div>
<div class="why-grid">${cards}</div></div>
</section>`;
}

// ---------- Built for Global Healthcare Delivery (dark band) ----------
export const builtCss = `
.built-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.built-close { margin: clamp(32px, 4vw, 56px) auto 0; text-align: center; font: 600 clamp(28px, 1.4rem + 1.8vw, 52px)/1.12 var(--font-display); font-synthesis: weight; letter-spacing: -.015em; max-width: 22ch; text-wrap: balance; }
@container page (max-width: 900px) { .built-grid { grid-template-columns: minmax(0, 1fr); } }
`;

export function built(ctx) {
  const items = BUILT.items
    .map((x, i) => `<article class="card" data-reveal style="--rd:${(i % 3) * 90}ms"><span class="ico" aria-hidden="true">${icon(x.icon, 24)}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`)
    .join("");
  const [a, c] = BUILT.closing.split(". ");
  return `<section class="sec built" aria-labelledby="built-h">
<div class="wrap"><div class="sec-head" data-reveal><h2 class="h2" id="built-h">${esc(BUILT.heading)}</h2><p class="lead">${esc(BUILT.sub)}</p></div>
<div class="built-grid">${items}</div>
<p class="built-close" data-reveal>${esc(a)}. <span class="acc">${esc(c)}</span></p></div>
</section>`;
}

// ---------- Our Healthcare (7 image cards) ----------
export const careCss = `
.care-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; }
.care-card { grid-column: span 3; display: grid; grid-template-rows: auto 1fr; border-radius: var(--r-card); overflow: hidden; background: var(--surface); box-shadow: 0 0 0 1px var(--line); transition: box-shadow .45s var(--ease), transform .45s var(--ease); }
.care-card:nth-child(n + 5) { grid-column: span 4; }
.care-card:hover { transform: translateY(-3px); box-shadow: 0 0 0 1px var(--accent), 0 28px 50px -36px rgba(0, 0, 0, .45); }
.care-card .media { border-radius: 0; aspect-ratio: 4 / 3; }
.care-card .media img { transition: transform 1.2s var(--ease); }
.care-card:hover .media img { transform: scale(1.04); }
.care-body { display: grid; align-content: start; gap: 10px; padding: 20px 22px 22px; }
.care-body h3 { margin: 0; font: 600 18px/1.3 var(--font-sans); }
.care-body h3 a { display: inline-flex; gap: 8px; align-items: center; }
.care-body h3 a svg { color: var(--accent); transition: transform .3s var(--ease); }
.care-card:hover h3 a svg { transform: translateX(3px); }
.care-body p { margin: 0; color: var(--ink-2); font-size: 15px; line-height: 1.6; }
@container page (max-width: 1100px) { .care-card, .care-card:nth-child(n + 5) { grid-column: span 6; } .care-card:last-child { grid-column: 4 / span 6; } }
@container page (max-width: 640px) {
  .care-card, .care-card:nth-child(n + 5), .care-card:last-child { grid-column: 1 / -1; grid-template-columns: 108px minmax(0, 1fr); grid-template-rows: none; }
  .care-card .media { aspect-ratio: auto; height: 100%; min-height: 120px; }
  .care-body { padding: 14px 16px; gap: 6px; }
  .care-body h3 { font-size: 16px; }
}
`;

export function care(ctx) {
  const b = bind(ctx);
  const cards = HEALTHCARE.items
    .map((x, i) => `<article class="care-card clampable" data-reveal style="--rd:${(i % 4) * 80}ms"><figure class="media" style="margin:0"><img src="${b.asset(x.img)}" alt="" loading="lazy"></figure><div class="care-body"><h3><a href="${b.href(x.path)}">${esc(x.title)}${icon("arrow", 18)}</a></h3><p class="clamp">${esc(x.text)}</p>${moreBtn(b)}</div></article>`)
    .join("");
  return `<section class="sec care" aria-labelledby="care-h">
<div class="wrap"><div class="sec-head" data-reveal><h2 class="h2" id="care-h">${esc(HEALTHCARE.heading)}</h2><p class="lead">${esc(HEALTHCARE.sub)}</p></div>
<div class="care-grid">${cards}</div></div>
</section>`;
}
