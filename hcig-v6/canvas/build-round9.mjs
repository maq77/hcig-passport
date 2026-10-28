// Round 9 (Irina via the owner, 2026-10-28): the GHA and DMWV partnership line is very important and was lost at the
// bottom of the hero. On the live site it opened the hero, in bold. Three ways to put it first, desktop and phone.
// The sentence is the live one, word for word. Run: node hcig-v6/canvas/build-round9.mjs
import { B, C, board, esc, ic, publishBoards } from "./board-kit.mjs";

const H = C.HERO;
const words = H.h1.text.split(" ");
const h1 = words.map((w, i) => (i >= H.h1.accentFrom ? `<span class="acc">${esc(w)}</span>` : esc(w))).join(" ");
const P = esc(H.partner.text);
// the sentence with its key words in bold (same words)
const Pbold = P.replace("Official Partner", "<b>Official Partner</b>").replace("Global Healthcare Accreditation™ (GHA)", "<b>Global Healthcare Accreditation™ (GHA)</b>").replace("German Medical Wellness Association (DMWV)", "<b>German Medical Wellness Association (DMWV)</b>").replace("in Egypt", "<b>in Egypt</b>");
const plates = (s) => `<span class="pl" style="width:${s}px;height:${s}px"><img src="${B("dmwv")}" alt="German Medical Wellness Association (DMWV)"></span><span class="pl pl-w" style="width:${Math.round(s * 1.35)}px;height:${s}px"><img src="${B("gha")}" alt="Global Healthcare Accreditation (GHA)"></span>`;

const CSS = `
.hero { position: relative; overflow: hidden; background: #fff; }
.hero-bg { position: absolute; inset: 0; background: url('${B("earth-day")}') 75% 35% / cover; }
.hero-bg::after { content: ""; position: absolute; inset: 0; background: radial-gradient(75% 95% at 18% 50%, rgba(255,255,255,.95), rgba(255,255,255,.55) 55%, rgba(255,255,255,.05) 85%), linear-gradient(0deg, #fff, transparent 22%); }
.m .hero-bg { background-position: 60% 0; background-size: 260% auto; background-repeat: no-repeat; }
.m .hero-bg::after { background: linear-gradient(180deg, rgba(255,255,255,.1) 0, rgba(255,255,255,.75) 260px, #fff 380px); }
.hdr { position: relative; z-index: 3; display: flex; align-items: center; gap: 26px; padding: 22px 64px; }
.hdr img.lg { height: 52px; width: auto; }
.hdr nav { display: flex; gap: 24px; margin-left: auto; font: 500 14px/1 'Inter', sans-serif; }
.m .hdr { margin: 12px; padding: 10px 10px 10px 16px; border-radius: 22px; background: rgba(255,255,255,.8); box-shadow: 0 10px 30px -18px rgba(0,0,0,.35); }
.m .hdr img.lg { height: 38px; }
.m .hdr .burger { margin-left: auto; width: 44px; height: 44px; border-radius: 14px; background: #000; color: #fff; display: grid; place-items: center; }
.body { position: relative; z-index: 2; padding: 26px 64px 56px; max-width: 760px; display: grid; gap: 18px; justify-items: start; }
.m .body { padding: 20px 20px 36px; }
h1 { margin: 0; font: 400 60px/1.04 'Helma', Georgia, serif; letter-spacing: -.005em; }
.m h1 { font-size: 38px; }
h1 .acc { color: var(--t); }
.sub { font: 600 18px/1.45 'Inter', sans-serif; max-width: 560px; }
.m .sub { font-size: 17px; }
.lead { color: var(--dim); font-size: 16px; max-width: 560px; }
.ctas { display: flex; gap: 12px; flex-wrap: wrap; }
.m .ctas { display: grid; width: 100%; } .m .ctas > * { justify-content: center; }
.btn2 { display: inline-flex; align-items: center; min-height: 48px; padding: 0 22px; border-radius: 999px; border: 1px solid var(--d20); background: rgba(255,255,255,.7); font: 500 14px/1 'Inter', sans-serif; }
.pl { display: grid; place-items: center; border-radius: 14px; background: #fff; box-shadow: 0 10px 24px -14px rgba(0,0,0,.35), inset 0 0 0 1px var(--d20); padding: 7px; flex: none; }
.pl img { max-width: 100%; max-height: 100%; object-fit: contain; }

/* K1: a glass credential capsule that opens the hero, the sentence in bold weight */
.k1 { display: flex; align-items: center; gap: 14px; padding: 10px 22px 10px 10px; border-radius: 22px; background: rgba(255,255,255,.82); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); box-shadow: 0 20px 44px -26px rgba(0,0,0,.45), inset 0 0 0 1px rgba(18,192,198,.35); max-width: 700px; }
.k1 .pls { display: flex; gap: 8px; }
.k1 p { font: 600 14.5px/1.45 'Inter', sans-serif; color: #000; }
.m .k1 { flex-direction: column; align-items: flex-start; padding: 14px 16px; gap: 12px; }
.m .k1 p { font-size: 14px; }

/* K2: the seals large and first, the sentence as a bold line with its key words heavier, a turquoise rule under it */
.k2 { display: grid; gap: 14px; padding-bottom: 18px; position: relative; max-width: 680px; }
.k2::after { content: ""; position: absolute; left: 0; bottom: 0; width: 72px; height: 2px; background: var(--t); }
.k2 .pls { display: flex; gap: 10px; align-items: center; }
.k2 .pls small { margin-left: 8px; font: 600 11px/1.3 'Inter', sans-serif; letter-spacing: .2em; text-transform: uppercase; color: var(--dim); }
.k2 p { font: 500 17px/1.5 'Inter', sans-serif; color: #333; }
.k2 p b { font-weight: 700; color: #000; }
.m .k2 p { font-size: 15.5px; }

/* K3: a full-width ribbon under the header, Dim Gray glass, the seals and the bold sentence in white */
.k3 { position: relative; z-index: 3; display: flex; align-items: center; justify-content: center; gap: 16px; padding: 12px 64px; background: linear-gradient(90deg, rgba(51,51,51,.92), rgba(86,87,89,.88)); color: #fff; }
.k3 .pls { display: flex; gap: 8px; }
.k3 .pl { box-shadow: none; }
.k3 p { font: 600 14.5px/1.45 'Inter', sans-serif; max-width: 980px; }
.k3 p b { color: var(--t60); font-weight: 700; }
.m .k3 { margin: 0 12px; border-radius: 18px; padding: 12px 14px; justify-content: flex-start; align-items: flex-start; }
.m .k3 p { font-size: 13.5px; }
.seal-old { display: none; }
`;
const NAV = C.NAV.map((n, i) => `<span${i === 0 ? ' style="box-shadow:inset 0 -1px 0 #12C0C6;padding-bottom:6px"' : ""}>${esc(n.label)}</span>`).join("");
const hdrD = `<div class="hdr"><img class="lg" src="${B("logo-h-black")}" alt="Healthcare International Group"><nav>${NAV}</nav><span class="btn">${esc(H.ctaPrimary.text)}${ic("arrow", 16)}</span></div>`;
const hdrM = `<div class="hdr"><img class="lg" src="${B("logo-h-black")}" alt="Healthcare International Group"><span class="burger">${ic("menu", 20)}</span></div>`;
const rest = `<h1>${h1}</h1><p class="sub">${esc(H.sub.text)}</p><p class="lead">${esc(H.lead.text)}</p><div class="ctas"><span class="btn">${esc(H.ctaPrimary.text)}${ic("arrow", 16)}</span><span class="btn2">${esc(H.ctaSecondary.text)}</span></div>`;

const OPTS = [
  { id: "K1", name: "glass credential capsule: the two seals and the full sentence in bold, opening the hero above the title", top: (m) => `<div class="k1"><span class="pls">${plates(m ? 44 : 52)}</span><p>${P}</p></div>`, ribbon: () => "" },
  { id: "K2", name: "seals first, large, then the sentence with its key words in heavy bold and a turquoise rule; the title follows", top: (m) => `<div class="k2"><span class="pls">${plates(m ? 54 : 64)}</span><p>${Pbold}</p></div>`, ribbon: () => "" },
  { id: "K3", name: "a full-width ribbon right under the header: the seals and the bold sentence in white on Dim Gray glass, seen first on every visit", top: () => "", ribbon: () => `<div class="k3"><span class="pls">${plates(40)}</span><p>${Pbold}</p></div>` },
];

const boards = [];
OPTS.forEach((o, k) => {
  const desk = `<div class="ph hero" style="width:1440px;height:860px"><span class="tag">${o.id}</span><div class="hero-bg"></div>${hdrD}${o.ribbon()}<div class="body">${o.top(false)}${rest}</div></div>`;
  boards.push({ id: `R9Cred${k + 1}`, title: `Hero ${o.id} desktop: ${o.name}`, w: 1440, h: 860, x: 0, y: k * 940, html: board(`Hero ${o.id}`, CSS, desk, 1440, 860) });
  const ph = `<div class="ph hero m" style="width:390px;height:1000px"><span class="tag">${o.id}</span><div class="hero-bg"></div>${hdrM}${o.ribbon()}<div style="height:150px"></div><div class="body">${o.top(true)}${rest}</div></div>`;
  boards.push({ id: `R9Cred${k + 1}m`, title: `Hero ${o.id} phone`, w: 390, h: 1000, x: 1520, y: k * 1080, html: board(`Hero ${o.id} phone`, CSS, ph, 390, 1000) });
});
publishBoards(boards, "r9", "Round 9: GHA and DMWV first in the hero (pick)");

// ---------- the image review (Irina: every photo must mean its place) ----------
const SWAPS = [
  ["About Us band (home) and About page", "about-band", "about-band-v2", "Same scene, no logo on the coat (Irina: no need any logo)"],
  ["Maritime: page hero, home block and the Maritime card", "mar-deck", "mar-deck-v2", "One doctor and one nurse, as on a real ship (Irina)"],
  ["Maritime 02: Medical Recruitment & Staffing", "mar-consult", "mar-recruit", "An HR manager interviewing a doctor for an onboard post (Irina: recruit doctors)"],
  ["Maritime 05: Insurance, Medical Evacuation & Repatriation", "maritime-hero", "mar-medevac", "A medical helicopter at a cruise ship helipad, paramedics ready (Irina's example)"],
  ["Maritime 03: Onboard Medical Operations & Fleet Management", "coordination-desk", "fleet-ops", "A bright fleet medical desk: a ship medical officer, the fleet on screen, a cruise ship in port"],
  ["Services page hero", "coordination-desk", "coord-bright", "The dark room replaced by a bright coordination centre (Irina: too dark)"],
  ["Who We Work With: Embassies & Government Institutions", "coordination-desk", "embassy-meeting", "A coordinator presenting a medical support plan to two diplomats"],
  ["Maritime 06: Yachting, Superyachts & Marina Healthcare", "yacht-marina", "yacht-medical", "A doctor with a medical bag boarding a superyacht at the marina"],
  ["Built: Operational Control & Scalability", "built-operations", "built-operations-v2", "The same idea in daylight, to match the set"],
  ["Built: Global Presence & Network, and the For Partners hero", "built-global", "built-global-v2", "Partners around a light world map, in daylight, to match the set"],
];
const RCSS = `.rv { padding: 48px 56px 56px; background: #fff; }
.rv h2 { margin: 0 0 6px; font: 400 40px/1.1 'Helma', serif; } .rv > p { margin: 0 0 30px; color: var(--dim); max-width: 70ch; }
.row { display: grid; grid-template-columns: 300px 1fr 1fr; gap: 22px; align-items: center; padding: 22px 0; border-top: 1px solid var(--d20); }
.row b { display: block; font: 600 15px/1.35 'Inter', sans-serif; } .row small { display: block; margin-top: 8px; color: var(--dim); font-size: 13.5px; line-height: 1.5; }
.row figure { margin: 0; position: relative; aspect-ratio: 3 / 2; border-radius: 16px; overflow: hidden; } .row img { width: 100%; height: 100%; object-fit: cover; }
.row figcaption { position: absolute; left: 10px; top: 10px; padding: 5px 10px; border-radius: 999px; background: rgba(0,0,0,.65); color: #fff; font: 600 11px/1 'Inter', sans-serif; letter-spacing: .1em; text-transform: uppercase; }
.row .new figcaption { background: var(--t); color: #000; }
.m .row { grid-template-columns: 1fr 1fr; gap: 10px; } .m .row > div { grid-column: 1 / -1; } .m.rv { padding: 28px 18px; } .m.rv h2 { font-size: 28px; }`;
const rows = SWAPS.map(([slot, cur, nw, why], i) => `<div class="row"><div><b>${String(i + 1).padStart(2, "0")}. ${esc(slot)}</b><small>${esc(why)}</small></div><figure><img src="${B(cur)}" alt=""><figcaption>Now</figcaption></figure><figure class="new"><img src="${B(nw)}" alt=""><figcaption>New</figcaption></figure></div>`).join("");
const intro = `<h2>New photos, each one meaning its place</h2><p>Irina's notes, 2026-10-28. Ten slots change; every other photo already fits its section and stays. Generated photos are mood images, never shown as named staff or patients; no invented logos.</p>`;
const rboards = [
  { id: "R9Images", title: "Images: now and new, ten slots (Irina's notes)", w: 1440, h: 4000, x: 2100, y: 0, html: board("Images now and new", RCSS, `<div class="ph rv" style="width:1440px">${intro}${rows}</div>`, 1440, 4000) },
  { id: "R9Imagesm", title: "Images: now and new, phone view", w: 390, h: 5200, x: 3620, y: 0, html: board("Images now and new phone", RCSS, `<div class="ph rv m" style="width:390px">${intro}${rows}</div>`, 390, 5200) },
];
publishBoards(rboards, "r9", "Round 9: GHA and DMWV first in the hero (pick)");
