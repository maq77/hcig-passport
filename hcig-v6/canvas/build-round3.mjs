// Round 3 option boards (owner, 2026-10-26): phone sliders for Why and Built (different styles, two rows, auto slide),
// a show-it-all phone design for Our Healthcare, a better About band (desktop and phone), and other phone upgrades.
// Words come from src/content/home.mjs; images are the canvas uploads in blobs.json.
// Run: node hcig-v6/canvas/build-round3.mjs   (writes project/R3*.dc.html and adds a "Phone round 3" page to canvas.json)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const V6 = join(HERE, "..");
const C = await import(pathToFileURL(join(V6, "src/content/home.mjs")).href);
const BLOBS = JSON.parse(readFileSync(join(HERE, "blobs.json"), "utf8"));
const B = (k) => { const v = BLOBS[k]; if (!v) throw new Error("no blob " + k); return v.startsWith("/_blob/") ? v : "/_blob/" + v; };
const iconsSrc = readFileSync(join(V6, "src/lib/icons.ts"), "utf8");
const ICONS = Object.fromEntries([...iconsSrc.matchAll(/^\s+(\w+): '(.+)',$/gm)].map((m) => [m[1], m[2]]));
const ic = (n, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const BASE = `
@font-face { font-family: 'Helma'; src: url('${B("helma")}') format('woff2'); font-weight: 400; font-display: swap; }
body { margin: 0; }
.ph { --black:#000; --b80:#333; --b60:#666; --dim:#565759; --d80:#78797B; --d60:#9A9A9C; --d40:#BBBCBE; --d20:#DDDDDF; --d06:#F6F6F6;
  --t:#12C0C6; --t80:#42CDD1; --t60:#71D9DD; --t40:#A0E6E8; --t20:#D0F2F4; --t08:#EDFAFA; --w:#FFF;
  --ease: cubic-bezier(.16,1,.3,1); font: 400 16px/1.6 'Inter', system-ui, sans-serif; color: var(--black); background: var(--w);
  -webkit-font-smoothing: antialiased; box-sizing: border-box; }
.ph *, .ph *::before, .ph *::after { box-sizing: border-box; }
.ph img { display: block; max-width: 100%; }
.ph p { margin: 0; }
.tag { position: absolute; top: 10px; right: 10px; z-index: 9; padding: 5px 10px; border-radius: 999px; background: var(--black); color: var(--w); font: 600 11px/1 'Inter', sans-serif; letter-spacing: .08em; }
.sec { position: relative; padding: 44px 20px 40px; overflow: hidden; }
.soft { background: var(--d06); }
.hd2 { margin: 0 0 26px; text-align: center; }
.hd2 h2 { margin: 0; font: 400 32px/1.1 'Helma', Georgia, serif; letter-spacing: -.005em; text-wrap: balance; }
.hd2 h2::after { content: ""; display: block; width: 56px; height: 1px; margin: 16px auto 0; background: var(--black); }
.hd2 p { margin-top: 14px; color: var(--dim); font-size: 15px; line-height: 1.6; }
.acc { color: var(--t); }
.s .acc { white-space: nowrap; }
.ico { width: 44px; height: 44px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 13px; background: var(--t20); color: var(--black); }
.nav { display: flex; align-items: center; gap: 12px; margin-top: 18px; }
.nav .ar { width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid var(--d20); background: var(--w); color: var(--black); }
.nav .ar.l svg { transform: scaleX(-1); }
.nav .grow { flex: 1; }
`;

const board = (title, css, body, h) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap">
<style>${BASE}${css}</style>
</helmet>
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${h.w},"height":${h.h}}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`;

const WHY = C.WHY, BUILT = C.BUILT, CARE = C.HEALTHCARE, ABOUT = C.ABOUT, MISSION = C.MISSION, SYSTEM = C.SYSTEM, IMPACT = C.IMPACT, MAR = C.MARITIME;
const head = (h, sub) => `<div class="hd2"><h2>${esc(h)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>`;
const arrows = (extra = "") => `<div class="nav">${extra}<span class="grow"></span><span class="ar l">${ic("arrow", 18)}</span><span class="ar">${ic("arrow", 18)}</span></div>`;
// a column-by-column auto slide: hold, move one column, hold ... then back to the start
const steps = (n, step, name) => {
  const seg = 100 / n; let k = "";
  for (let i = 0; i < n; i++) { k += `${(i * seg).toFixed(2)}%, ${(i * seg + seg * 0.78).toFixed(2)}% { transform: translateX(${-i * step}px); } `; }
  return `@keyframes ${name} { ${k} 100% { transform: translateX(0); } }`;
};
const boards = [];

// ===================== WHY: three phone sliders, two rows, auto slide =====================
{ // W1 Two-row deck with a peek
  const cols = Math.ceil(WHY.items.length / 2), step = 262 + 12;
  const cards = WHY.items.map((x, i) => `<article class="w1c"><span class="ico">${ic(x.icon, 22)}</span><div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div></article>`).join("");
  const css = `.w1 { overflow: hidden; margin: 0 -20px; padding: 0 20px; }
.w1t { display: grid; grid-template-rows: repeat(2, 1fr); grid-auto-flow: column; grid-auto-columns: 262px; gap: 12px; animation: w1 ${cols * 3.4}s var(--ease) infinite; }
.w1c { display: flex; gap: 12px; align-items: flex-start; padding: 16px; border-radius: 16px; background: var(--w); box-shadow: 0 0 0 1px var(--d20), 0 14px 30px -26px rgba(0,0,0,.4); }
.w1c h3 { margin: 0 0 6px; font: 600 15px/1.3 'Inter', sans-serif; }
.w1c p { font-size: 13.5px; line-height: 1.5; color: var(--dim); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.seg { display: flex; gap: 6px; } .seg i { width: 22px; height: 3px; border-radius: 3px; background: var(--d20); } .seg i.on { background: var(--black); width: 34px; }
${steps(cols, step, "w1")}`;
  boards.push({ id: "R3Why1", title: "Why, option W1: two-row deck with a peek (auto slides one column)", w: 390, h: 760, x: 0, y: 0,
    html: board("Why W1", css, `<div class="ph"><section class="sec soft"><span class="tag">W1</span>${head(WHY.heading, WHY.sub)}<div class="w1"><div class="w1t">${cards}</div></div>${arrows(`<span class="seg"><i class="on"></i><i></i><i></i><i></i></span>`)}</section></div>`, { w: 390, h: 760 }) });
}
{ // W2 Dim Gray band, two rows gliding in opposite directions
  const card = (x) => `<article class="w2c"><span class="w2i">${ic(x.icon, 20)}</span><h3>${esc(x.title)}</h3></article>`;
  const a = WHY.items.slice(0, 4), b = WHY.items.slice(4);
  const row = (xs) => xs.map(card).join("") + xs.map(card).join("");
  const css = `.w2 { background: radial-gradient(90% 60% at 100% 0%, rgba(18,192,198,.22), transparent 60%), linear-gradient(160deg, var(--b80), var(--dim)); color: var(--w); }
.w2 .hd2 h2::after { background: rgba(255,255,255,.5); } .w2 .hd2 p { color: var(--d20); }
.w2r { overflow: hidden; margin: 0 -20px; -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.w2r + .w2r { margin-top: 12px; }
.w2t { display: flex; gap: 12px; width: max-content; animation: w2 26s linear infinite; }
.w2r.rev .w2t { animation-direction: reverse; animation-duration: 30s; }
@keyframes w2 { to { transform: translateX(-50%); } }
.w2c { width: 210px; min-height: 132px; padding: 16px; display: grid; align-content: space-between; gap: 18px; border-radius: 18px; background: rgba(255,255,255,.07); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
.w2i { width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--t); color: var(--black); }
.w2c h3 { margin: 0; font: 400 19px/1.2 'Helma', serif; }
.w2open { margin-top: 18px; padding: 16px; border-radius: 16px; background: var(--w); color: var(--black); }
.w2open b { display: block; font: 600 15px/1.3 'Inter', sans-serif; margin-bottom: 6px; } .w2open p { font-size: 14px; color: var(--dim); }
.w2hint { margin-top: 12px; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--d40); text-align: center; }`;
  boards.push({ id: "R3Why2", title: "Why, option W2: Dim Gray band, two rows gliding opposite ways; tap a card to read it", w: 390, h: 760, x: 430, y: 0,
    html: board("Why W2", css, `<div class="ph"><section class="sec w2"><span class="tag">W2</span>${head(WHY.heading, WHY.sub)}<div class="w2r"><div class="w2t">${row(a)}</div></div><div class="w2r rev"><div class="w2t">${row(b)}</div></div><div class="w2open"><b>${esc(WHY.items[0].title)}</b><p>${esc(WHY.items[0].text)}</p></div><p class="w2hint">Tap a card to read it</p></section></div>`, { w: 390, h: 760 }) });
}
{ // W3 Index cards with a story-style progress
  const cols = Math.ceil(WHY.items.length / 2), step = 170 + 10;
  const cards = WHY.items.map((x, i) => `<article class="w3c"><span class="w3n">${String(i + 1).padStart(2, "0")}</span><span class="w3i">${ic(x.icon, 20)}</span><h3>${esc(x.title)}</h3></article>`).join("");
  const css = `.w3 { overflow: hidden; margin: 0 -20px; padding: 0 20px; }
.w3t { display: grid; grid-template-rows: repeat(2, 1fr); grid-auto-flow: column; grid-auto-columns: 170px; gap: 10px; animation: w3 ${cols * 3}s var(--ease) infinite; }
.w3c { position: relative; min-height: 150px; padding: 16px 14px; display: grid; align-content: end; gap: 10px; border-radius: 4px 18px 4px 18px; background: var(--w); border-top: 2px solid var(--t); box-shadow: 0 12px 26px -22px rgba(0,0,0,.4); }
.w3n { position: absolute; top: 12px; left: 14px; font: 400 28px/1 'Helma', serif; color: var(--d40); }
.w3i { position: absolute; top: 14px; right: 14px; color: var(--t); }
.w3c h3 { margin: 0; font: 600 14.5px/1.3 'Inter', sans-serif; }
.story { display: flex; gap: 4px; flex: 1; } .story i { flex: 1; height: 2px; background: var(--d20); border-radius: 2px; overflow: hidden; position: relative; }
.story i.on::after { content: ""; position: absolute; inset: 0; background: var(--black); transform-origin: left; animation: fill 3s linear infinite; }
@keyframes fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.w3open { margin-top: 14px; font-size: 14px; color: var(--dim); }
${steps(cols, step, "w3")}`;
  boards.push({ id: "R3Why3", title: "Why, option W3: numbered index cards, story progress bar, tap opens the text below", w: 390, h: 760, x: 860, y: 0,
    html: board("Why W3", css, `<div class="ph"><section class="sec soft"><span class="tag">W3</span>${head(WHY.heading, WHY.sub)}<div class="w3"><div class="w3t">${cards}</div></div><p class="w3open">${esc(WHY.items[0].text)}</p><div class="nav"><span class="story"><i class="on"></i><i></i><i></i><i></i></span><span class="ar l">${ic("arrow", 18)}</span><span class="ar">${ic("arrow", 18)}</span></div></section></div>`, { w: 390, h: 760 }) });
}

// ===================== BUILT: three phone sliders, different from Why =====================
const BUILT_IMG = ["traveller-centre", "maritime-hero", "coordination-desk", "about-hub", "about-band", "onboard-clinic"];
{ // B1 Image tiles (answers: images on Built?)
  const cols = 3, step = 160 + 12;
  const cards = BUILT.items.map((x, i) => `<article class="b1c"><figure><img src="${B(BUILT_IMG[i])}" alt=""><span class="b1i">${ic(x.icon, 18)}</span></figure><h3>${esc(x.title)}</h3></article>`).join("");
  const css = `.b1 { overflow: hidden; margin: 0 -20px; padding: 0 20px; }
.b1t { display: grid; grid-template-rows: repeat(2, 1fr); grid-auto-flow: column; grid-auto-columns: 160px; gap: 12px; animation: b1 10s var(--ease) infinite; }
.b1c figure { position: relative; margin: 0; height: 120px; border-radius: 16px; overflow: hidden; }
.b1c img { width: 100%; height: 100%; object-fit: cover; }
.b1i { position: absolute; left: 10px; bottom: 10px; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255,255,255,.92); color: var(--black); }
.b1c h3 { margin: 10px 2px 0; font: 600 14px/1.3 'Inter', sans-serif; }
.close { margin-top: 26px; text-align: center; font: 400 24px/1.2 'Helma', serif; }
.note { margin-top: 10px; text-align: center; font-size: 11px; color: var(--d60); letter-spacing: .06em; }
${steps(cols, step, "b1")}`;
  const [c1, c2] = BUILT.closing.split(". ");
  boards.push({ id: "R3Built1", title: "Built, option B1: image tiles in two rows (tap opens the text); images shown are stand-ins", w: 390, h: 820, x: 0, y: 840,
    html: board("Built B1", css, `<div class="ph"><section class="sec"><span class="tag">B1</span>${head(BUILT.heading, BUILT.sub)}<div class="b1"><div class="b1t">${cards}</div></div>${arrows()}<p class="close">${esc(c1)}. <span class="acc">${esc(c2)}</span></p><p class="note">Stand-in images; new ones are generated for this section if you pick B1</p></section></div>`, { w: 390, h: 820 }) });
}
{ // B2 Black hairline spec sheet, paged two by two
  const css = `.b2 { overflow: hidden; }
.b2t { display: flex; width: max-content; animation: b2 12s var(--ease) infinite; }
.b2p { width: 350px; display: grid; grid-template-rows: repeat(2, 1fr); gap: 0; border-top: 1px solid var(--black); }
.b2c { position: relative; padding: 18px 4px 18px 64px; border-bottom: 1px solid var(--black); }
.b2n { position: absolute; left: 0; top: 14px; font: 400 40px/1 'Helma', serif; }
.b2c h3 { margin: 0 0 6px; font: 600 16px/1.3 'Inter', sans-serif; display: flex; justify-content: space-between; gap: 10px; }
.b2c h3 svg { flex: none; color: var(--t); }
.b2c p { font-size: 14px; color: var(--dim); line-height: 1.55; }
.dots { display: flex; gap: 6px; } .dots i { width: 7px; height: 7px; border-radius: 50%; border: 1px solid var(--black); } .dots i.on { background: var(--black); }
${steps(3, 350, "b2")}`;
  const pages = [0, 2, 4].map((s) => `<div class="b2p">${BUILT.items.slice(s, s + 2).map((x, k) => `<article class="b2c"><span class="b2n">${String(s + k + 1).padStart(2, "0")}</span><h3>${esc(x.title)}${ic(x.icon, 20)}</h3><p>${esc(x.text)}</p></article>`).join("")}</div>`).join("");
  boards.push({ id: "R3Built2", title: "Built, option B2: editorial spec sheet, the guideline's black hairlines, two per page, auto pages", w: 390, h: 820, x: 430, y: 840,
    html: board("Built B2", css, `<div class="ph"><section class="sec"><span class="tag">B2</span>${head(BUILT.heading, BUILT.sub)}<div class="b2"><div class="b2t">${pages}</div></div>${arrows(`<span class="dots"><i class="on"></i><i></i><i></i></span>`)}</section></div>`, { w: 390, h: 820 }) });
}
{ // B3 Turquoise wash, square tiles 2 x 2 per page with the icon large
  const css = `.b3sec { background: linear-gradient(180deg, var(--t08), var(--w)); }
.b3 { overflow: hidden; }
.b3t { display: flex; gap: 12px; width: max-content; animation: b3 12s var(--ease) infinite; }
.b3p { width: 350px; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(2, 1fr); gap: 10px; }
.b3c { aspect-ratio: 1; padding: 14px; display: grid; align-content: space-between; border-radius: 20px; background: var(--w); box-shadow: 0 0 0 1px var(--t40); }
.b3c.dark { background: var(--b80); color: var(--w); box-shadow: none; }
.b3c .big { color: var(--t); }
.b3c h3 { margin: 0; font: 400 18px/1.15 'Helma', serif; }
.b3open { margin-top: 14px; padding: 14px 16px; border-left: 2px solid var(--t); font-size: 14px; color: var(--dim); background: var(--w); border-radius: 0 12px 12px 0; }
${steps(2, 362, "b3")}`;
  const items = [...BUILT.items, ...BUILT.items.slice(0, 2)];
  const pages = [0, 4].map((s) => `<div class="b3p">${items.slice(s, s + 4).map((x, k) => `<article class="b3c${(s + k) % 3 === 0 ? " dark" : ""}"><span class="big">${ic(x.icon, 34)}</span><h3>${esc(x.title)}</h3></article>`).join("")}</div>`).join("");
  boards.push({ id: "R3Built3", title: "Built, option B3: square tiles, 2 x 2 per page on a turquoise wash, tap opens the text", w: 390, h: 820, x: 860, y: 840,
    html: board("Built B3", css, `<div class="ph"><section class="sec b3sec"><span class="tag">B3</span>${head(BUILT.heading, BUILT.sub)}<div class="b3"><div class="b3t">${pages}</div></div><p class="b3open">${esc(BUILT.items[0].text)}</p>${arrows()}</section></div>`, { w: 390, h: 820 }) });
}

// ===================== OUR HEALTHCARE: show all seven on a phone =====================
{ // H1 Bento
  const sizes = ["big", "", "", "tall", "", "", "wide"];
  const tiles = CARE.items.map((x, i) => `<a class="h1t ${sizes[i]}"><img src="${B(x.img)}" alt=""><span class="h1g"></span><h3>${esc(x.title)}</h3><span class="h1a">${ic("up", 16)}</span></a>`).join("");
  const css = `.h1 { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 132px; gap: 10px; grid-auto-flow: dense; }
.h1t { position: relative; border-radius: 18px; overflow: hidden; color: var(--w); display: block; }
.h1t.big { grid-column: 1 / -1; grid-row: span 2; } .h1t.tall { grid-row: span 2; } .h1t.wide { grid-column: 1 / -1; }
.h1t img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.h1g { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 35%, rgba(0,0,0,.72)); }
.h1t h3 { position: absolute; left: 12px; right: 40px; bottom: 11px; margin: 0; font: 600 13.5px/1.25 'Inter', sans-serif; }
.h1t.big h3 { font: 400 24px/1.15 'Helma', serif; right: 56px; bottom: 14px; }
.h1a { position: absolute; right: 10px; bottom: 10px; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--t); color: var(--black); }`;
  boards.push({ id: "R3Care1", title: "Our Healthcare, option H1: bento, all seven at once, tap a tile for its page", w: 390, h: 1180, x: 0, y: 1700,
    html: board("Care H1", css, `<div class="ph"><section class="sec"><span class="tag">H1</span>${head(CARE.heading, CARE.sub)}<div class="h1">${tiles}</div></section></div>`, { w: 390, h: 1180 }) });
}
{ // H2 Image accordion
  const rows = CARE.items.map((x, i) => `<article class="h2r${i === 1 ? " open" : ""}"><img src="${B(x.img)}" alt=""><span class="h2g"></span><div class="h2b"><span class="h2n">${String(i + 1).padStart(2, "0")}</span><h3>${esc(x.title)}</h3>${i === 1 ? `<p>${esc(x.text)}</p><span class="h2go">${ic("arrow", 16)}</span>` : `<span class="h2p">${ic("chevron", 18)}</span>`}</div></article>`).join("");
  const css = `.h2l { display: grid; gap: 8px; }
.h2r { position: relative; height: 64px; border-radius: 16px; overflow: hidden; color: var(--w); }
.h2r.open { height: 300px; }
.h2r img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.h2g { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.72), rgba(0,0,0,.25)); }
.h2r.open .h2g { background: linear-gradient(180deg, rgba(0,0,0,.05) 20%, rgba(0,0,0,.82)); }
.h2b { position: absolute; inset: 0; display: grid; grid-template-columns: 34px 1fr 28px; align-items: center; gap: 6px; padding: 0 14px; }
.h2r.open .h2b { align-content: end; padding-bottom: 16px; grid-template-rows: auto auto; }
.h2n { font: 400 18px/1 'Helma', serif; color: var(--t60); }
.h2b h3 { margin: 0; font: 600 14.5px/1.25 'Inter', sans-serif; }
.h2r.open h3 { font: 400 22px/1.15 'Helma', serif; }
.h2b p { grid-column: 1 / -1; font-size: 13.5px; line-height: 1.5; color: var(--d20); }
.h2p { color: var(--w); }
.h2go { grid-column: 3; grid-row: 1; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--t); color: var(--black); }`;
  boards.push({ id: "R3Care2", title: "Our Healthcare, option H2: image accordion, all seven titles at once, one opens with its text", w: 390, h: 980, x: 430, y: 1700,
    html: board("Care H2", css, `<div class="ph"><section class="sec"><span class="tag">H2</span>${head(CARE.heading, CARE.sub)}<div class="h2l">${rows}</div></section></div>`, { w: 390, h: 980 }) });
}
{ // H3 Featured card that rotates by itself + seven thumbnails as tabs
  const f = CARE.items[0];
  const thumbs = CARE.items.map((x, i) => `<span class="h3th${i === 0 ? " on" : ""}"><img src="${B(x.img)}" alt=""></span>`).join("");
  const css = `.h3f { position: relative; height: 430px; border-radius: 22px; overflow: hidden; color: var(--w); }
.h3f img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: kb 6s ease-out infinite alternate; }
@keyframes kb { from { transform: scale(1.08); } to { transform: scale(1); } }
.h3f::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.1) 30%, rgba(0,0,0,.85)); }
.h3c { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 20px; display: grid; gap: 10px; }
.h3c small { font: 500 11px/1 'Inter', sans-serif; letter-spacing: .2em; color: var(--t60); }
.h3c h3 { margin: 0; font: 400 28px/1.12 'Helma', serif; }
.h3c p { font-size: 14px; line-height: 1.55; color: var(--d20); }
.h3c .go { justify-self: start; display: inline-flex; gap: 8px; align-items: center; min-height: 40px; padding: 0 16px; border-radius: 999px; background: var(--t); color: var(--black); font: 600 13px/1 'Inter', sans-serif; }
.h3bar { position: absolute; top: 14px; left: 14px; right: 14px; z-index: 3; display: flex; gap: 4px; }
.h3bar i { flex: 1; height: 2px; background: rgba(255,255,255,.35); border-radius: 2px; overflow: hidden; position: relative; }
.h3bar i.on::after { content: ""; position: absolute; inset: 0; background: var(--w); transform-origin: left; animation: fill2 5s linear infinite; }
@keyframes fill2 { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.h3ts { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-top: 10px; }
.h3th { aspect-ratio: 1; border-radius: 10px; overflow: hidden; opacity: .55; box-shadow: 0 0 0 1px var(--d20); }
.h3th.on { opacity: 1; box-shadow: 0 0 0 2px var(--t); }
.h3th img { width: 100%; height: 100%; object-fit: cover; }`;
  boards.push({ id: "R3Care3", title: "Our Healthcare, option H3: one featured service rotates on its own (story bars); seven thumbnails jump to any", w: 390, h: 820, x: 860, y: 1700,
    html: board("Care H3", css, `<div class="ph"><section class="sec"><span class="tag">H3</span>${head(CARE.heading, CARE.sub)}<div class="h3f"><img src="${B(f.img)}" alt=""><div class="h3bar">${CARE.items.map((_, i) => `<i${i === 0 ? ' class="on"' : ""}></i>`).join("")}</div><div class="h3c"><small>01 / 07</small><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p><span class="go">${ic("arrow", 16)}</span></div></div><div class="h3ts">${thumbs}</div></section></div>`, { w: 390, h: 820 }) });
}

// ===================== ABOUT band: three new designs, desktop and phone =====================
// The route labels are the live About sentence's own words: urgent care, hospital treatment, international medical coordination.
const ROUTE = [["cross", "urgent care"], ["hospital", "hospital treatment"], ["globe", "international medical coordination"]];
const st = ABOUT.statement.text.split(". ");
const statement = `${esc(st[0])}. <span class="acc">${esc(st.slice(1).join(". "))}</span>`;
const route = (cls) => `<ol class="route ${cls}">${ROUTE.map(([i, t], k) => `<li><span class="rn">${ic(i, 18)}</span><span class="rt">${esc(t)}</span></li>`).join("")}</ol>`;
const ROUTE_CSS = `
.route { list-style: none; margin: 0; padding: 0; position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.route::before { content: ""; position: absolute; left: 22px; right: calc(33.3% - 22px); top: 21px; height: 1px; background: currentColor; opacity: .3; }
.route::after { content: ""; position: absolute; top: 18px; left: 22px; width: 7px; height: 7px; border-radius: 50%; background: var(--t); box-shadow: 0 0 12px 2px rgba(18,192,198,.7); animation: glide 6s var(--ease) infinite; }
@keyframes glide { 0%, 8% { left: 22px; } 42%, 50% { left: calc(33.3% + 22px); } 84%, 100% { left: calc(66.6% + 22px); } }
.route li { position: relative; display: grid; gap: 10px; align-content: start; }
.rn { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--w); color: var(--black); box-shadow: 0 0 0 1px var(--d20); position: relative; z-index: 1; }
.rt { font: 500 12.5px/1.35 'Inter', sans-serif; text-transform: uppercase; letter-spacing: .08em; }
`;
const ABOUT_OPTS = [
  { id: "A1", name: "light editorial: white to turquoise wash, black Helma, the route with one gliding light (no pulsing)", css: `
.a1 { display: grid; grid-template-columns: 1fr 1fr; border-radius: 24px; overflow: hidden; background: linear-gradient(135deg, var(--w) 0%, var(--t08) 55%, var(--t20) 100%); box-shadow: 0 0 0 1px var(--d20), 0 40px 80px -60px rgba(0,0,0,.5); }
.a1 .c { display: grid; align-content: center; gap: 30px; padding: 56px; }
.a1 .s { margin: 0; font: 400 54px/1.06 'Helma', serif; letter-spacing: -.01em; }
.a1 .s .acc { color: var(--t); }
.a1 .route .rt { color: var(--dim); }
.a1 figure { margin: 0; position: relative; } .a1 figure img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.m .a1 { grid-template-columns: 1fr; } .m .a1 figure { order: -1; height: 230px; } .m .a1 .c { padding: 26px 20px 28px; gap: 22px; } .m .a1 .s { font-size: 34px; }
.m .route { grid-template-columns: 1fr; gap: 14px; } .m .route li { grid-template-columns: 44px 1fr; align-items: center; }
.m .route::before { left: 21px; right: auto; top: 22px; bottom: 22px; width: 1px; height: auto; }
.m .route::after { left: 18px; animation: glideY 6s var(--ease) infinite; }
@keyframes glideY { 0%, 8% { top: 18px; } 42%, 50% { top: calc(50% - 4px); } 84%, 100% { top: calc(100% - 26px); } }`,
    html: () => `<div class="a1"><div class="c"><p class="s">${statement}</p>${route("")}</div><figure><img src="${B("about-band")}" alt=""></figure></div>` },
  { id: "A2", name: "image-led: the photo fills the card, the words sit on a frosted glass panel", css: `
.a2 { position: relative; height: 470px; border-radius: 24px; overflow: hidden; }
.a2 > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.a2 .g { position: absolute; left: 28px; bottom: 28px; width: 520px; padding: 32px; display: grid; gap: 24px; border-radius: 20px; background: rgba(255,255,255,.8); -webkit-backdrop-filter: blur(16px) saturate(140%); backdrop-filter: blur(16px) saturate(140%); box-shadow: 0 30px 60px -30px rgba(0,0,0,.45); }
.a2 .s { margin: 0; font: 400 44px/1.06 'Helma', serif; }
.a2 .route .rt { color: var(--dim); }
.m .a2 { height: auto; display: grid; } .m .a2 > img { position: relative; height: 260px; } .m .a2 .g { position: relative; left: auto; bottom: auto; width: auto; margin: -60px 12px 12px; padding: 22px 18px; gap: 18px; background: rgba(255,255,255,.92); }
.m .a2 .s { font-size: 32px; } .m .route { grid-template-columns: 1fr; gap: 12px; } .m .route li { grid-template-columns: 44px 1fr; align-items: center; }
.m .route::before { left: 21px; right: auto; top: 22px; bottom: 22px; width: 1px; height: auto; } .m .route::after { left: 18px; animation: glideY 6s var(--ease) infinite; }
@keyframes glideY { 0%, 8% { top: 18px; } 42%, 50% { top: calc(50% - 4px); } 84%, 100% { top: calc(100% - 26px); } }`,
    html: () => `<div class="a2"><img src="${B("about-band")}" alt=""><div class="g"><p class="s">${statement}</p>${route("")}</div></div>` },
  { id: "A3", name: "deep and calm: Black to Dim Gray with a soft turquoise horizon, numbered route, framed photo", css: `
.a3 { display: grid; grid-template-columns: 1.05fr .95fr; gap: 0; border-radius: 24px; overflow: hidden; color: var(--w); background: radial-gradient(120% 70% at 0% 100%, rgba(18,192,198,.28), transparent 60%), linear-gradient(180deg, var(--black) 0%, var(--b80) 55%, var(--dim) 100%); }
.a3 .c { display: grid; align-content: center; gap: 32px; padding: 56px; }
.a3 .s { margin: 0; font: 400 54px/1.06 'Helma', serif; }
.a3 .route::before { opacity: .35; } .a3 .rn { background: rgba(255,255,255,.08); color: var(--w); box-shadow: inset 0 0 0 1px rgba(255,255,255,.25); }
.a3 .route .rt { color: var(--d20); }
.a3 figure { margin: 18px; border-radius: 18px; overflow: hidden; position: relative; min-height: 380px; } .a3 figure img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.m .a3 { grid-template-columns: 1fr; } .m .a3 figure { order: -1; min-height: 220px; margin: 12px 12px 0; } .m .a3 .c { padding: 24px 20px 30px; gap: 22px; } .m .a3 .s { font-size: 34px; }
.m .route { grid-template-columns: 1fr; gap: 12px; } .m .route li { grid-template-columns: 44px 1fr; align-items: center; }
.m .route::before { left: 21px; right: auto; top: 22px; bottom: 22px; width: 1px; height: auto; } .m .route::after { left: 18px; animation: glideY 6s var(--ease) infinite; }
@keyframes glideY { 0%, 8% { top: 18px; } 42%, 50% { top: calc(50% - 4px); } 84%, 100% { top: calc(100% - 26px); } }`,
    html: () => `<div class="a3"><div class="c"><p class="s">${statement}</p>${route("")}</div><figure><img src="${B("about-band")}" alt=""></figure></div>` },
];
ABOUT_OPTS.forEach((o, k) => {
  boards.push({ id: `R3About${k + 1}d`, title: `About band, option ${o.id} desktop: ${o.name}`, w: 1280, h: 460, x: 1320, y: k * 760,
    html: board(`About ${o.id} desktop`, ROUTE_CSS + o.css, `<div class="ph" style="padding:40px"><span class="tag">${o.id}</span>${o.html()}</div>`, { w: 1280, h: 460 }) });
  boards.push({ id: `R3About${k + 1}m`, title: `About band, option ${o.id} phone`, w: 390, h: 680, x: 2640, y: k * 760,
    html: board(`About ${o.id} phone`, ROUTE_CSS + o.css, `<div class="ph m" style="padding:20px"><span class="tag">${o.id}</span>${o.html()}</div>`, { w: 390, h: 680 }) });
});

// ===================== Other phone upgrades (one board) =====================
{
  const steps6 = SYSTEM.steps.map((s) => `<li><span class="dot"></span><span class="n">${esc(s.n)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("");
  const mv = MISSION.mission.paras.map((p) => `<li><span class="ck">${ic("check", 13)}</span>${esc(p)}</li>`).join("");
  const imp = IMPACT.items.map((x, i) => `<div class="ip${i === 0 ? " d" : ""}"><span>${ic(["hospital", "clock", "handshake", "users"][i], 22)}</span>${x.stat ? `<b>${esc(x.stat)}</b>` : ""}<p>${esc(x.text)}</p></div>`).join("");
  const css = `.up h4 { margin: 0 0 14px; font: 600 11px/1 'Inter', sans-serif; letter-spacing: .2em; color: var(--d60); text-transform: uppercase; }
.blk { padding: 30px 20px; border-bottom: 1px dashed var(--d20); }
.seg2 { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 999px; background: var(--d06); box-shadow: inset 0 0 0 1px var(--d20); margin-bottom: 16px; }
.seg2 span { text-align: center; padding: 10px; border-radius: 999px; font: 600 14px/1 'Inter', sans-serif; color: var(--dim); }
.seg2 span.on { background: var(--black); color: var(--w); }
.mvl { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; } .mvl li { display: grid; grid-template-columns: 24px 1fr; gap: 10px; font-size: 14.5px; color: var(--dim); }
.ck { width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--t); color: var(--black); margin-top: 2px; }
.tl { list-style: none; margin: 0; padding: 0 0 0 28px; position: relative; display: grid; gap: 18px; }
.tl::before { content: ""; position: absolute; left: 7px; top: 6px; bottom: 6px; width: 1px; background: var(--d20); }
.tl::after { content: ""; position: absolute; left: 7px; top: 6px; height: 46%; width: 1px; background: var(--t); }
.tl li { position: relative; } .tl .dot { position: absolute; left: -26px; top: 4px; width: 13px; height: 13px; border-radius: 50%; background: var(--w); box-shadow: 0 0 0 1px var(--d40); }
.tl li:nth-child(-n+3) .dot { background: var(--t); box-shadow: 0 0 0 4px var(--t20); }
.tl .n { font: 400 15px/1 'Helma', serif; color: var(--t); } .tl h3 { margin: 4px 0; font: 600 15px/1.3 'Inter', sans-serif; } .tl p { font-size: 13.5px; color: var(--dim); }
.chips { display: flex; gap: 8px; overflow: hidden; margin: 0 -20px; padding: 0 20px; }
.chips span { flex: none; display: inline-flex; gap: 8px; align-items: center; min-height: 40px; padding: 0 14px; border-radius: 999px; background: var(--w); box-shadow: 0 0 0 1px var(--d20); font: 500 13px/1 'Inter', sans-serif; } .chips svg { color: var(--t); }
.ig { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ip { padding: 16px; border-radius: 18px; background: var(--d06); display: grid; gap: 8px; align-content: start; } .ip.d { background: var(--b80); color: var(--w); }
.ip span { color: var(--t); } .ip b { font: 400 36px/1 'Helma', serif; } .ip p { font: 600 13.5px/1.4 'Inter', sans-serif; }`;
  const body = `<div class="ph up"><span class="tag">UPGRADES</span>
<div class="blk"><h4>Mission &amp; Vision: tabs instead of two long cards</h4><div class="seg2"><span class="on">${esc(MISSION.mission.heading)}</span><span>${esc(MISSION.vision.heading)}</span></div><ul class="mvl">${mv}</ul></div>
<div class="blk"><h4>How Our System Works: a journey line that fills as you scroll</h4><ol class="tl">${steps6}</ol></div>
<div class="blk"><h4>Maritime: service chips in one swipe row</h4><div class="chips">${MAR.chips.map((c, i) => `<span>${ic(["hospital", "doctor", "ship", "anchor", "plane"][i], 16)}${esc(c)}</span>`).join("")}</div></div>
<div class="blk"><h4>Our Impact: 2 x 2 tiles, the first one dark</h4><div class="ig">${imp}</div></div>
</div>`;
  boards.push({ id: "R3Upgrades", title: "Other phone upgrades: Mission & Vision tabs, journey line, maritime chips, impact tiles", w: 390, h: 1700, x: 3080, y: 0,
    html: board("Phone upgrades", css, body, { w: 390, h: 1700 }) });
}

// ---------- write boards and the canvas page ----------
const P = join(HERE, "project");
const cj = JSON.parse(readFileSync(join(P, "canvas.json"), "utf8"));
if (!cj.pages.some((p) => p.id === "r3")) cj.pages.splice(1, 0, { id: "r3", name: "Phone round 3 (pick)" });
for (const b of boards) {
  const f = `${b.id}.dc.html`;
  writeFileSync(join(P, f), b.html);
  cj.boards[f] = { x: b.x, y: b.y, w: b.w, h: b.h, title: b.title, page: "r3", is_interactive: true };
  if (!cj.order.includes(f)) cj.order.push(f);
}
writeFileSync(join(P, "canvas.json"), JSON.stringify(cj, null, 2));
console.log("boards:", boards.map((b) => b.id).join(" "));
