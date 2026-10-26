// Home sections (batch 1: insurers, About, Our Premises and Facilities). Words from src/content/home.mjs only.
import { bind, esc, icon } from "./_bind.mjs";
import { INSURERS, ABOUT, GROUP, UI } from "../content/home.mjs";

const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- 100% Trusted by Global Insurance & Assistance Networks ----------
export const insurersCss = `
.ins-grid { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: clamp(28px, 4vw, 64px); align-items: center; }
.ins-copy { display: grid; gap: 12px; }
.ins-stat { margin: 0; font: 600 clamp(56px, 3rem + 3vw, 104px)/.9 var(--font-display); font-synthesis: weight; letter-spacing: -.03em; color: var(--acc-text); }
.ins-tag { margin: 4px 0 0; display: flex; flex-wrap: wrap; gap: 6px 18px; font: 500 14px/1.5 var(--font-sans); color: var(--ink); }
.ins-tag span { display: inline-flex; align-items: center; gap: 8px; }
.ins-tag span::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
@container page (max-width: 900px) {
  .ins-grid { grid-template-columns: minmax(0, 1fr); }
  .ins-logos { margin-inline: calc(var(--gutter) * -1); }
}
`;

export function insurers(ctx) {
  const b = bind(ctx);
  const tile = (name, hidden) => `<span class="logo-tile"${hidden ? ' aria-hidden="true"' : ""}><img src="${b.asset("ins-" + slug(name))}" alt="${hidden ? "" : esc(name)}" loading="lazy"></span>`;
  const row = (names) => names.map((n) => tile(n, false)).join("") + names.map((n) => tile(n, true)).join("");
  const a = INSURERS.logos.slice(0, 12), c = INSURERS.logos.slice(12);
  const tag = INSURERS.tagline.split(". ").map((t, i, all) => `<span>${esc(i < all.length - 1 ? t + "." : t)}</span>`).join("");
  return `<section class="sec ins" aria-labelledby="ins-h">
<div class="wrap">
<div class="sec-head" data-reveal><h2 class="h2" id="ins-h">${esc(INSURERS.title)}</h2><p class="lead">${esc(INSURERS.text)}</p></div>
<div class="ins-grid">
<div class="ins-copy" data-reveal><p class="ins-stat">${esc(INSURERS.stat)}</p><p class="ins-tag">${tag}</p></div>
<div class="ins-logos" data-reveal style="--rd:120ms"><div class="marquee" style="--dur:64s"><div class="marquee-track">${row(a)}</div></div><div class="marquee rev" style="--dur:72s"><div class="marquee-track">${row(c)}</div></div></div>
</div>
</div>
</section>`;
}

// ---------- About Us (pattern of the approved TMASI v3 About: title, band, icon columns, panel) ----------
export const aboutCss = `
.about .sec-head { margin-bottom: clamp(22px, 2.6vw, 34px); }
.about-lead { color: var(--ink); font-size: var(--fs-sub); line-height: 1.55; max-width: 62ch; }
.about-band { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-height: 380px; border-radius: var(--r-media); overflow: hidden; background: var(--black); color: var(--white); }
.theme-night .about-band { box-shadow: 0 0 0 1px var(--black-80); }
.about-band-copy { display: grid; align-content: center; gap: 28px; padding: clamp(32px, 4.4vw, 64px); }
.about-statement { margin: 0; font: 600 clamp(32px, 1.5rem + 2.4vw, 60px)/1.06 var(--font-display); font-synthesis: weight; letter-spacing: -.015em; text-wrap: balance; }
.about-statement .acc { color: var(--turq); }
.about-band-photo { position: relative; margin: 0; }
.about-band-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 40% 50%; }
/* one clear model: urgent care, hospital, international coordination, joined by a line a pulse runs along */
.about-signal { display: flex; align-items: center; width: min(100%, 380px); }
.about-signal .nd { position: relative; width: 52px; height: 52px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255, 255, 255, .28); color: var(--white); }
.about-signal .nd svg { width: 22px; height: 22px; }
.about-signal .ln { position: relative; flex: 1; height: 1px; margin: 0 8px; background: rgba(255, 255, 255, .28); overflow: hidden; }
.about-signal .ln::after { content: ""; position: absolute; top: -1px; left: -40%; width: 40%; height: 3px; background: linear-gradient(90deg, transparent, var(--turq), transparent); animation: pulseRun 2.8s var(--ease-sweep) infinite; }
.about-signal .ln:nth-of-type(2)::after { animation-delay: 1.4s; }
.about-signal .nd::after { content: ""; position: absolute; inset: -1px; border-radius: 50%; border: 1px solid var(--turq); opacity: 0; animation: ndGlow 2.8s var(--ease-sweep) infinite; }
.about-signal .nd:nth-of-type(2)::after { animation-delay: 1.2s; }
.about-signal .nd:nth-of-type(3)::after { animation-delay: 2.6s; }
@keyframes pulseRun { 0% { left: -40%; } 60%, 100% { left: 100%; } }
@keyframes ndGlow { 0%, 100% { opacity: 0; transform: scale(1); } 20% { opacity: 1; transform: scale(1.08); } 50% { opacity: 0; transform: scale(1.18); } }
.about-text { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(20px, 3vw, 48px); margin-top: clamp(28px, 3.2vw, 44px); }
.about-text p { margin: 0; color: var(--ink-2); line-height: 1.7; }
.about-ensure { margin: clamp(30px, 3.4vw, 48px) 0 0; font: 500 var(--fs-label)/1 var(--font-sans); letter-spacing: var(--track-label); text-transform: uppercase; color: var(--ink-2); text-align: center; }
.about-facts { list-style: none; margin: 18px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.about-facts li { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 8px clamp(18px, 2.4vw, 32px); text-align: center; }
.about-facts li + li { border-left: 1px solid var(--line); }
.about-facts p { margin: 0; color: var(--ink); font-weight: 600; font-size: clamp(16px, 1.2vw, 18px); line-height: 1.5; }
.about-panel { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(24px, 3vw, 48px); align-items: center; margin-top: clamp(30px, 3.4vw, 48px); padding: clamp(24px, 2.6vw, 36px) clamp(24px, 3vw, 44px); border-radius: var(--r-card); background: var(--bg-soft); }
.about-panel p { margin: 0; color: var(--ink-2); font-size: 15.5px; line-height: 1.7; }
.about-stats { margin: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.about-stats .stat { justify-items: center; text-align: center; padding: 4px 12px; }
.about-stats .stat + .stat { border-left: 1px solid var(--line); }
.still .about-signal .ln::after, .still .about-signal .nd::after { animation: none; }
@media (prefers-reduced-motion: reduce) { .about-signal .ln::after, .about-signal .nd::after { animation: none; } }
@container page (max-width: 900px) {
  .about-band { grid-template-columns: minmax(0, 1fr); min-height: 0; }
  .about-band-photo { order: -1; aspect-ratio: 16 / 10; }
  .about-band-copy { padding: 24px 22px 28px; gap: 18px; }
  .about-signal .nd { width: 42px; height: 42px; }
  .about-text { grid-template-columns: minmax(0, 1fr); gap: 14px; }
  .about-facts { grid-template-columns: minmax(0, 1fr); margin-top: 6px; }
  .about-facts li { flex-direction: row; align-items: center; gap: 14px; padding: 14px 0; text-align: left; border-top: 1px solid var(--line); }
  .about-facts li + li { border-left: none; }
  .about-facts p { font-size: 16px; }
  .about-ensure { text-align: left; }
  .about-panel { grid-template-columns: minmax(0, 1fr); padding: 20px 16px; text-align: center; }
  .about-stats .stat { padding: 4px 6px; }
  .about-stats .stat b { font-size: 34px; }
  .about-stats .stat > span { font-size: 12px; }
}
`;

export function about(ctx) {
  const b = bind(ctx);
  const [first, second, third] = ABOUT.paras;
  const st = ABOUT.statement.text.split(". ");
  const statement = `${esc(st[0])}. <span class="acc">${esc(st.slice(1).join(". "))}</span>`;
  const factIcons = ["speed", "ownership", "network"];
  const stats = ABOUT.stats
    .map((s) => `<div class="stat"><b><span data-count="${s.n}">${s.n}</span><em>${esc(s.suffix)}</em></b><span>${esc(s.label)}</span></div>`)
    .join("");
  return `<section class="sec about" aria-labelledby="about-h">
<div class="wrap">
<div class="sec-head" data-reveal><h2 class="h2" id="about-h">${esc(ABOUT.heading)}</h2><p class="lead about-lead">${esc(first)}</p></div>
<div class="about-band" data-reveal>
<div class="about-band-copy"><div class="about-signal" aria-hidden="true"><span class="nd">${icon("cross", 22)}</span><span class="ln"></span><span class="nd">${icon("hospital", 22)}</span><span class="ln"></span><span class="nd">${icon("globe", 22)}</span></div><p class="about-statement">${statement}</p></div>
<figure class="about-band-photo"><img src="${b.asset("about-band")}" alt="A doctor walking with a guest through the medical reception of a Red Sea resort" loading="lazy"></figure>
</div>
<div class="about-text" data-reveal><p>${esc(second)}</p><p>${esc(third)}</p></div>
<p class="about-ensure" data-reveal>${esc(ABOUT.ensureIntro)}</p>
<ul class="about-facts" data-reveal>${ABOUT.ensure.map((e, i) => `<li><span class="ico" aria-hidden="true">${icon(factIcons[i], 24)}</span><p>${esc(e)}</p></li>`).join("")}</ul>
<div class="about-panel" data-reveal><p>${esc(ABOUT.closing)}</p><div class="about-stats">${stats}</div></div>
</div>
</section>`;
}

// ---------- Our Premises and Facilities (the approved group section) ----------
export const groupCss = `
.gf-film { position: relative; width: 100%; margin: 0; border-radius: var(--r-media); overflow: hidden; aspect-ratio: 16 / 9; background: var(--bg); transition: background-color 1.3s var(--ease-sweep) .9s; }
.gf-layer { position: absolute; inset: 0; transition: opacity 1.3s var(--ease-sweep) .9s; }
.theme-day .gf-n, .theme-night .gf-d { opacity: 0; pointer-events: none; }
.gf-film video { display: block; width: 100%; height: 100%; object-fit: cover; }
.gf-film .gf-tall { display: none; }
.gf-sound { position: absolute; right: 16px; bottom: 16px; z-index: 2; display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 18px; border-radius: var(--r-pill); border: 1px solid var(--line); background: color-mix(in srgb, var(--bg) 72%, transparent); color: var(--ink); font: 500 14px/1 var(--font-sans); cursor: pointer; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.gf-sound:hover { border-color: var(--accent); }
.gf-sound .s-on, .gf-sound[aria-pressed="true"] .s-off { display: none; }
.gf-sound[aria-pressed="true"] .s-on { display: inline-flex; align-items: center; gap: 10px; }
.gf-sound .s-off { display: inline-flex; align-items: center; gap: 10px; }
.gf-brands { list-style: none; margin: 28px 0 0; padding: 24px 0 0; border-top: 1px solid var(--line); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px 28px; }
.gf-brands li { position: relative; }
.gf-brands a { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; color: var(--ink-2); font: 500 15px/1 var(--font-sans); transition: color .25s; }
.gf-brands a:hover, .gf-brands a:focus-visible { color: var(--ink); }
.gf-chip { display: none; }
/* hover or keyboard focus: the company's own logo rises above its name, on white so every logo keeps its own colours */
.gf-card { position: absolute; left: 50%; bottom: calc(100% + 14px); z-index: 5; width: 260px; padding: 20px 20px 18px; border-radius: 18px; background: var(--white); color: var(--black); box-shadow: 0 0 0 1px var(--dim-20), 0 30px 60px -24px rgba(0, 0, 0, .45); display: grid; gap: 12px; justify-items: center; text-align: center; pointer-events: none; opacity: 0; transform: translate(-50%, 10px) scale(.96); transform-origin: 50% 100%; transition: opacity .25s var(--ease), transform .45s var(--ease); }
.gf-card::after { content: ""; position: absolute; left: 50%; top: 100%; width: 12px; height: 12px; background: var(--white); transform: translate(-50%, -6px) rotate(45deg); box-shadow: 1px 1px 0 var(--dim-20); }
.gf-card img { display: block; height: 64px; width: auto; max-width: 200px; object-fit: contain; }
.gf-card b { font: 600 14px/1.3 var(--font-sans); color: var(--black); }
.gf-card small { font: 400 13px/1.45 var(--font-sans); color: var(--dim); }
.gf-brands li:hover .gf-card, .gf-brands li:focus-within .gf-card { opacity: 1; transform: translate(-50%, 0) scale(1); }
@container page (max-width: 700px) {
  .gf-film { aspect-ratio: 9 / 16; margin: 0 calc(var(--gutter) * -1); width: auto; border-radius: 0; }
  .gf-film .gf-wide { display: none; }
  .gf-film .gf-tall { display: block; }
  .gf-sound { right: var(--gutter); bottom: 20px; }
  .gf-brands { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; padding-top: 8px; }
  .gf-brands a { min-height: 60px; border-bottom: 1px solid var(--line); width: 100%; }
  .gf-chip { display: flex; flex: none; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: var(--white); box-shadow: 0 0 0 1px var(--dim-20); padding: 5px; }
  .gf-chip img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; }
  .gf-card { display: none; }
}
`;

export function group(ctx) {
  const b = bind(ctx);
  const auto = b.canvas ? ' autoplay=""' : "";
  const vid = (cls, th, key) => `<video class="${cls}" data-film data-th="${th}" src="${b.asset(key)}" muted="" loop="" playsinline="" preload="${b.canvas ? "auto" : "none"}"${auto} aria-label="${esc(GROUP.filmLabel.text)}"></video>`;
  const brands = GROUP.brands
    .map((x) => `<li><a href="${x.url}" target="_blank" rel="noopener"><span class="gf-chip" aria-hidden="true"><img src="${b.asset(x.logo)}" alt="" loading="lazy"></span><span>${esc(x.short)}</span></a><span class="gf-card" aria-hidden="true"><img src="${b.asset(x.logo)}" alt="" loading="lazy"><b>${esc(x.name)}</b><small>${esc(x.line)}</small></span></li>`)
    .join("");
  return `<section class="sec gf band-soft" aria-labelledby="gf-h">
<div class="wrap">
<div class="sec-head" data-reveal><h2 class="h2" id="gf-h">${esc(GROUP.heading.text)}</h2><p class="lead">${esc(GROUP.line.text)}</p></div>
<div class="gf-film" data-reveal>
<div class="gf-layer gf-n">${vid("gf-wide", "night", "film-night-wide")}${vid("gf-tall", "night", "film-night-tall")}</div>
<div class="gf-layer gf-d">${vid("gf-wide", "day", "film-day-wide")}${vid("gf-tall", "day", "film-day-tall")}</div>
<button type="button" class="gf-sound" ${b.on("toggleSound")} aria-pressed="false"><span class="s-off">${icon("muted")}<span>${esc(GROUP.soundOn.text)}</span></span><span class="s-on">${icon("speaker")}<span>${esc(GROUP.soundOff.text)}</span></span></button>
</div>
<ul class="gf-brands" aria-label="${esc(GROUP.listLabel.text)}">${brands}</ul>
</div>
</section>`;
}
