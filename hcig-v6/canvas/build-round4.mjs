// Round 4 phone options (owner, 2026-10-27): testimonial stories with arrows on the videos and "Swipe for more", all three
// portrait, full screen in the original shape on tap (MedPark "Patient stories" pattern); Why without a slider;
// Who We Work With in three different movements (no more one slider type everywhere); a minimal Built.
// Run: node hcig-v6/canvas/build-round4.mjs   (writes project/R4*.dc.html, adds the "Phone round 4 (pick)" page)
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
const HAND = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4.3 14a1.5 1.5 0 0 1 2.4-1.8L9 15"/></svg>`;

const BASE = `
@font-face { font-family: 'Helma'; src: url('${B("helma")}') format('woff2'); font-weight: 400; font-display: swap; }
body { margin: 0; }
.ph { --black:#000; --b80:#333; --dim:#565759; --d60:#9A9A9C; --d40:#BBBCBE; --d20:#DDDDDF; --d06:#F6F6F6;
  --t:#12C0C6; --t60:#71D9DD; --t40:#A0E6E8; --t20:#D0F2F4; --t08:#EDFAFA; --w:#FFF; --ease: cubic-bezier(.16,1,.3,1);
  font: 400 16px/1.6 'Inter', system-ui, sans-serif; color: var(--black); background: var(--w); -webkit-font-smoothing: antialiased; box-sizing: border-box; position: relative; }
.ph *, .ph *::before, .ph *::after { box-sizing: border-box; }
.ph img, .ph video { display: block; max-width: 100%; }
.ph p { margin: 0; }
.tag { position: absolute; top: 10px; right: 10px; z-index: 9; padding: 5px 10px; border-radius: 999px; background: var(--black); color: var(--w); font: 600 11px/1 'Inter', sans-serif; letter-spacing: .08em; }
.cap { position: absolute; left: 10px; top: 10px; z-index: 9; padding: 5px 8px; border-radius: 6px; background: rgba(255,255,255,.9); font: 600 10.5px/1 'Inter', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--dim); }
.sec { position: relative; padding: 44px 20px 40px; overflow: hidden; }
.soft { background: var(--d06); }
.hd2 { margin: 0 0 24px; text-align: center; }
.hd2 h2 { margin: 0; font: 400 32px/1.1 'Helma', Georgia, serif; text-wrap: balance; }
.hd2 h2::after { content: ""; display: block; width: 56px; height: 1px; margin: 16px auto 0; background: var(--black); }
.hd2 p { margin-top: 14px; color: var(--dim); font-size: 15px; }
.ico { width: 44px; height: 44px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 13px; background: var(--t20); color: var(--black); }
.note { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; font: 500 13px/1 'Inter', sans-serif; color: var(--dim); }
.note svg { color: var(--t); animation: nudge 1.8s var(--ease) infinite; }
@keyframes nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-8px); } }
`;
const board = (title, css, body, w, h) => `<!doctype html>
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
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`;
const head = (h, sub) => `<div class="hd2"><h2>${esc(h)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>`;
const boards = [];
const T = C.TESTIMONIALS, WHY = C.WHY, WHO = C.WHO, BUILT = C.BUILT;
const SWIPE = "Swipe for more"; // his words, 2026-10-27
const LOOPS = ["testimonial-1-loop", "testimonial-2-loop", "testimonial-3-loop"];

// ===================== Testimonials: stories =====================
const story = (k, cls = "") => `<article class="st ${cls}"><video src="${B(LOOPS[k])}" muted loop playsinline autoplay></video><span class="sq">${ic("quote", 18)}</span><span class="sp"><span class="pb">${ic("play", 22)}</span><em>${esc(T.watch.text)}</em></span></article>`;
const STORY_CSS = `
.st { position: relative; flex: none; aspect-ratio: 9 / 16; border-radius: 22px; overflow: hidden; background: linear-gradient(160deg, var(--b80), #000); box-shadow: 0 30px 50px -34px rgba(0,0,0,.6); }
.st video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.st::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.15), transparent 30%, transparent 60%, rgba(0,0,0,.45)); }
.sq { position: absolute; left: 14px; top: 14px; z-index: 2; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(0,0,0,.35); color: #fff; }
.sp { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.pb { width: 66px; height: 66px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255,255,255,.94); color: var(--black); box-shadow: 0 0 0 8px rgba(255,255,255,.18); }
.sp em { font: 600 13px/1 'Inter', sans-serif; font-style: normal; color: #fff; padding: 7px 12px; border-radius: 999px; background: rgba(0,0,0,.35); }
.ar { position: absolute; top: 50%; z-index: 4; width: 46px; height: 46px; margin-top: -23px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255,255,255,.94); color: var(--black); box-shadow: 0 12px 24px -12px rgba(0,0,0,.5); }
.ar.l { left: 6px; } .ar.l svg { transform: scaleX(-1); } .ar.r { right: 6px; }
.full { position: relative; height: 760px; background: #000; display: flex; align-items: center; justify-content: center; }
.full video { width: 100%; aspect-ratio: 16 / 9; object-fit: contain; background: #000; }
.full .x { position: absolute; top: 16px; right: 16px; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255,255,255,.4); color: #fff; }
.full .bar { position: absolute; left: 16px; right: 16px; bottom: 40px; height: 3px; border-radius: 3px; background: rgba(255,255,255,.25); } .full .bar i { display: block; width: 34%; height: 100%; background: var(--t); border-radius: 3px; }
.full small { position: absolute; left: 0; right: 0; bottom: 64px; text-align: center; color: rgba(255,255,255,.7); font: 500 12px/1 'Inter', sans-serif; letter-spacing: .14em; text-transform: uppercase; }`;
const fullState = `<div class="full"><span class="cap">Tap: full screen, original shape</span><video src="${B(LOOPS[2])}" muted loop playsinline autoplay></video><span class="x">${ic("close", 20)}</span><small>with sound</small><span class="bar"><i></i></span></div>`;
{ // T1 story rail
  const css = STORY_CSS + `
.rail { position: relative; margin: 0 -20px; }
.track { display: flex; gap: 12px; padding: 0 calc(50% - 132px); overflow: hidden; }
.track .st { width: 264px; }
.track .st.side { opacity: .9; }`;
  const body = `<div class="ph" style="display:flex;gap:16px;background:#e9e9ea;padding:0"><div style="width:390px;background:#fff"><section class="sec soft" style="min-height:760px"><span class="tag">T1</span>${head(T.heading.text)}<div class="rail"><div class="track">${story(0)}${story(1, "side")}${story(2, "side")}</div><span class="ar l">${ic("arrow", 20)}</span><span class="ar r">${ic("arrow", 20)}</span></div><p class="note">${HAND}${esc(SWIPE)}</p></section></div><div style="width:390px">${fullState}</div></div>`;
  boards.push({ id: "R4Tst1", title: "Testimonials T1 (your spec): portrait stories, arrows on the videos, Swipe for more; third video cropped to portrait; tap opens it full screen in its original shape", w: 796, h: 760, x: 0, y: 0, html: board("Testimonials T1", css, body, 796, 760) });
}
{ // T2 coverflow
  const css = STORY_CSS + `
.flow { position: relative; height: 470px; margin: 0 -20px; }
.flow .st { position: absolute; top: 0; left: 50%; width: 250px; }
.flow .c { transform: translateX(-50%); z-index: 3; }
.flow .lft { transform: translateX(-118%) scale(.82); transform-origin: right center; z-index: 2; filter: brightness(.6); }
.flow .rgt { transform: translateX(18%) scale(.82); transform-origin: left center; z-index: 2; filter: brightness(.6); }
.flow .ar { top: 46%; } .flow .ar.l { left: 16px; } .flow .ar.r { right: 16px; }
.dots { display: flex; justify-content: center; gap: 6px; margin-top: 10px; } .dots i { width: 7px; height: 7px; border-radius: 4px; background: var(--d40); } .dots i.on { width: 22px; background: var(--t); }`;
  const body = `<div class="ph" style="display:flex;gap:16px;background:#e9e9ea;padding:0"><div style="width:390px;background:#fff"><section class="sec soft" style="min-height:760px"><span class="tag">T2</span>${head(T.heading.text)}<div class="flow">${story(1, "lft")}${story(0, "c")}${story(2, "rgt")}<span class="ar l">${ic("arrow", 20)}</span><span class="ar r">${ic("arrow", 20)}</span></div><div class="dots"><i></i><i class="on"></i><i></i></div><p class="note">${HAND}${esc(SWIPE)}</p></section></div><div style="width:390px">${fullState}</div></div>`;
  boards.push({ id: "R4Tst2", title: "Testimonials T2: the centre story large, the others smaller and dimmed behind it, arrows on the videos, Swipe for more; tap opens full screen", w: 796, h: 760, x: 860, y: 0, html: board("Testimonials T2", css, body, 796, 760) });
}

// ===================== Why: no slider, better structure =====================
const W = WHY.items;
{ // Y1 numbered index, one open
  const rows = W.map((x, i) => `<li class="${i === 0 ? "open" : ""}"><span class="n">${String(i + 1).padStart(2, "0")}</span><span class="t">${esc(x.title)}</span><span class="i">${ic(i === 0 ? "close" : "chevron", 18)}</span>${i === 0 ? `<p>${esc(x.text)}</p>` : ""}</li>`).join("");
  const css = `.y1 { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--black); }
.y1 li { display: grid; grid-template-columns: 38px 1fr 24px; align-items: center; gap: 4px 10px; padding: 16px 2px; border-bottom: 1px solid var(--d20); }
.y1 .n { font: 400 22px/1 'Helma', serif; color: var(--d40); }
.y1 .t { font: 600 15.5px/1.3 'Inter', sans-serif; }
.y1 .i { color: var(--dim); }
.y1 li.open { background: linear-gradient(90deg, var(--t08), transparent); border-radius: 0; }
.y1 li.open .n { color: var(--t); }
.y1 li p { grid-column: 2 / -1; font-size: 14.5px; color: var(--dim); margin-top: 4px; }`;
  boards.push({ id: "R4Why1", title: "Why Y1: a numbered index on the guideline's hairlines; all seven titles at a glance, tap one to read it", w: 390, h: 800, x: 0, y: 840,
    html: board("Why Y1", css, `<div class="ph"><section class="sec soft"><span class="tag">Y1</span>${head(WHY.heading, WHY.sub)}<ol class="y1">${rows}</ol></section></div>`, 390, 800) });
}
{ // Y2 bento: one dark lead card, then a 2-column grid, the last card wide
  const cards = W.map((x, i) => i === 0
    ? `<article class="c lead"><span class="n">01</span><span class="ii">${ic(x.icon, 24)}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`
    : `<article class="c"><span class="n">${String(i + 1).padStart(2, "0")}</span><span class="ii">${ic(x.icon, 20)}</span><h3>${esc(x.title)}</h3></article>`).join("");
  const css = `.y2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.y2 .c { position: relative; min-height: 138px; padding: 16px 14px; display: grid; align-content: end; gap: 8px; border-radius: 18px; background: var(--w); box-shadow: 0 0 0 1px var(--d20); }
.y2 .c .n { position: absolute; top: 14px; left: 14px; font: 400 20px/1 'Helma', serif; color: var(--d40); }
.y2 .c .ii { position: absolute; top: 14px; right: 14px; color: var(--t); }
.y2 .c h3 { margin: 0; font: 600 14px/1.3 'Inter', sans-serif; }
.y2 .lead { grid-column: 1 / -1; min-height: 0; padding: 22px 20px; gap: 10px; color: #fff; background: radial-gradient(90% 90% at 100% 0%, rgba(18,192,198,.25), transparent 60%), linear-gradient(150deg, var(--b80), var(--dim)); box-shadow: none; }
.y2 .lead .n { position: static; color: var(--t60); font-size: 28px; } .y2 .lead .ii { color: var(--t); }
.y2 .lead h3 { font: 400 26px/1.15 'Helma', serif; } .y2 .lead p { font-size: 14.5px; color: var(--d20); }
.y2 .wide { grid-column: 1 / -1; min-height: 96px; }
.y2hint { margin-top: 12px; text-align: center; font-size: 12.5px; color: var(--d60); }`;
  boards.push({ id: "R4Why2", title: "Why Y2: bento; the first reason as a dark lead card with its text, the six others in a clean 2 x 3 grid, tap any for its text", w: 390, h: 900, x: 430, y: 840,
    html: board("Why Y2", css, `<div class="ph"><section class="sec soft"><span class="tag">Y2</span>${head(WHY.heading, WHY.sub)}<div class="y2">${cards}</div></section></div>`, 390, 900) });
}
{ // Y3 timeline of cards on a turquoise spine, full text, no tapping
  const rows = W.map((x, i) => `<li><span class="dot">${ic(x.icon, 18)}</span><div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div></li>`).join("");
  const css = `.y3 { list-style: none; margin: 0; padding: 0 0 0 4px; position: relative; display: grid; gap: 14px; }
.y3::before { content: ""; position: absolute; left: 23px; top: 10px; bottom: 10px; width: 1px; background: linear-gradient(var(--t), var(--t40)); }
.y3 li { position: relative; display: grid; grid-template-columns: 40px 1fr; gap: 14px; }
.y3 .dot { position: relative; z-index: 1; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--w); color: var(--t); box-shadow: 0 0 0 1px var(--t40); }
.y3 h3 { margin: 8px 0 4px; font: 600 15.5px/1.3 'Inter', sans-serif; }
.y3 p { font-size: 14px; color: var(--dim); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }`;
  boards.push({ id: "R4Why3", title: "Why Y3: a vertical spine with icons, title and a two-line reason each; reads straight down, nothing hidden behind taps", w: 390, h: 1100, x: 860, y: 840,
    html: board("Why Y3", css, `<div class="ph"><section class="sec soft"><span class="tag">Y3</span>${head(WHY.heading, WHY.sub)}<ol class="y3">${rows}</ol></section></div>`, 390, 1100) });
}

// ===================== Who We Work With: three different movements =====================
const WI = WHO.items;
{ // Wh1 path list
  const rows = WI.map((x, i) => `<li class="${i === 0 ? "open" : ""}"><span class="ii">${ic(x.icon, 20)}</span><span class="t">${esc(x.title)}</span><span class="go">${ic("arrow", 18)}</span>${i === 0 ? `<p>${esc(x.text)}</p>` : ""}</li>`).join("");
  const css = `.p1 { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.p1 li { display: grid; grid-template-columns: 44px 1fr 36px; align-items: center; gap: 4px 12px; padding: 12px; border-radius: 18px; background: var(--w); box-shadow: 0 0 0 1px var(--d20); }
.p1 .ii { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 13px; background: var(--t20); }
.p1 .t { font: 600 15px/1.3 'Inter', sans-serif; }
.p1 .go { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 0 0 1px var(--d20); }
.p1 li.open { box-shadow: 0 0 0 1px var(--t); } .p1 li.open .go { background: var(--t); box-shadow: none; }
.p1 li p { grid-column: 2 / -1; font-size: 14px; color: var(--dim); }`;
  boards.push({ id: "R4Who1", title: "Who W1: choose your path; six rows like a menu, tap one to see its line and go to its page (no sliding)", w: 390, h: 760, x: 0, y: 2000,
    html: board("Who W1", css, `<div class="ph"><section class="sec"><span class="tag">W1</span>${head(WHO.heading, WHO.sub)}<ul class="p1">${rows}</ul></section></div>`, 390, 760) });
}
{ // Wh2 stacked deck
  const x = WI[0];
  const css = `.deck { position: relative; height: 330px; margin-top: 8px; }
.dk { position: absolute; left: 0; right: 0; top: 0; height: 290px; padding: 22px; border-radius: 22px; background: var(--w); box-shadow: 0 0 0 1px var(--d20), 0 24px 40px -30px rgba(0,0,0,.45); display: grid; align-content: space-between; }
.dk.b2 { transform: translateY(28px) scale(.9); background: var(--d06); } .dk.b1 { transform: translateY(14px) scale(.95); background: #fbfbfb; }
.dk.top { animation: swipe 4s var(--ease) infinite; z-index: 3; }
@keyframes swipe { 0%, 60% { transform: none; opacity: 1; } 80% { transform: translateX(-120%) rotate(-8deg); opacity: 0; } 81% { transform: translateY(14px) scale(.95); opacity: 0; } 100% { transform: none; opacity: 1; } }
.dk h3 { margin: 0 0 8px; font: 400 26px/1.15 'Helma', serif; } .dk p { font-size: 14.5px; color: var(--dim); }
.dk .ft { display: flex; justify-content: space-between; align-items: center; } .dk .ft b { font: 500 13px/1 'Inter', sans-serif; color: var(--d60); letter-spacing: .08em; }
.dk .go { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--t); }`;
  const card = (cls) => `<article class="dk ${cls}"><span class="ico">${ic(x.icon, 22)}</span><div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div><div class="ft"><b>01 / 06</b><span class="go">${ic("arrow", 18)}</span></div></article>`;
  boards.push({ id: "R4Who2", title: "Who W2: a stacked deck; swipe the top card away to reveal the next (the motion is shown looping)", w: 390, h: 760, x: 430, y: 2000,
    html: board("Who W2", css, `<div class="ph"><section class="sec"><span class="tag">W2</span>${head(WHO.heading, WHO.sub)}<div class="deck"><article class="dk b2"></article><article class="dk b1"></article>${card("top")}</div><p class="note">${HAND}${esc(SWIPE)}</p></section></div>`, 390, 760) });
}
{ // Wh3 chips + panel
  const x = WI[2];
  const css = `.chips { display: flex; gap: 8px; overflow: hidden; margin: 0 -20px 16px; padding: 0 20px; }
.chips span { flex: none; display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 14px; border-radius: 999px; box-shadow: inset 0 0 0 1px var(--d20); font: 500 13.5px/1 'Inter', sans-serif; white-space: nowrap; }
.chips span.on { background: var(--black); color: #fff; box-shadow: none; } .chips span svg { color: var(--t); }
.panel { position: relative; overflow: hidden; padding: 24px 20px; border-radius: 22px; color: #fff; background: radial-gradient(90% 80% at 100% 0%, rgba(18,192,198,.28), transparent 60%), linear-gradient(150deg, var(--b80), var(--dim)); }
.panel .ico { background: rgba(255,255,255,.1); color: var(--t); }
.panel h3 { margin: 18px 0 10px; font: 400 28px/1.15 'Helma', serif; } .panel p { font-size: 15px; color: var(--d20); }
.panel .go { display: inline-flex; align-items: center; gap: 8px; margin-top: 18px; min-height: 44px; padding: 0 18px; border-radius: 999px; background: var(--t); color: var(--black); font: 600 14px/1 'Inter', sans-serif; }`;
  boards.push({ id: "R4Who3", title: "Who W3: a row of partner chips like tabs; tapping one swaps the dark panel under it", w: 390, h: 760, x: 860, y: 2000,
    html: board("Who W3", css, `<div class="ph"><section class="sec"><span class="tag">W3</span>${head(WHO.heading, WHO.sub)}<div class="chips">${WI.map((y, i) => `<span${i === 2 ? ' class="on"' : ""}>${ic(y.icon, 16)}${esc(y.title)}</span>`).join("")}</div><div class="panel"><span class="ico">${ic(x.icon, 22)}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><span class="go">${ic("arrow", 16)}</span></div></section></div>`, 390, 760) });
}

// ===================== Built: the minimal version (icons, no photos) =====================
{
  const cards = BUILT.items.map((x, i) => `<article class="bt ${i % 3 === 1 ? "dk" : ""}"><span class="big">${ic(x.icon, 30)}</span><h3>${esc(x.title)}</h3></article>`).join("");
  const css = `.bm { overflow: hidden; margin: 0 -20px; padding: 0 20px; }
.bmt { display: grid; grid-template-rows: repeat(2, 1fr); grid-auto-flow: column; grid-auto-columns: 164px; gap: 10px; animation: bm 10s var(--ease) infinite; }
@keyframes bm { 0%, 26% { transform: none; } 33%, 59% { transform: translateX(-174px); } 66%, 92% { transform: translateX(-348px); } 100% { transform: none; } }
.bt { min-height: 150px; padding: 16px; display: grid; align-content: space-between; border-radius: 20px; background: var(--t08); box-shadow: inset 0 0 0 1px var(--t40); }
.bt.dk { background: var(--b80); color: #fff; box-shadow: none; }
.bt .big { color: var(--t); } .bt h3 { margin: 0; font: 400 19px/1.15 'Helma', serif; }
.open { margin-top: 14px; padding: 14px 16px; border-left: 2px solid var(--t); border-radius: 0 14px 14px 0; background: var(--d06); font-size: 14.5px; color: var(--dim); }
.open b { display: block; color: #000; font: 600 15px/1.3 'Inter', sans-serif; margin-bottom: 4px; }`;
  boards.push({ id: "R4Built", title: "Built, minimal: the same two rows that slide on their own, icon tiles instead of photos (light turquoise and dark)", w: 390, h: 760, x: 1700, y: 840,
    html: board("Built minimal", css, `<div class="ph"><section class="sec"><span class="tag">B-MIN</span>${head(BUILT.heading, BUILT.sub)}<div class="bm"><div class="bmt">${cards}</div></div><p class="open"><b>${esc(BUILT.items[0].title)}</b>${esc(BUILT.items[0].text)}</p></section></div>`, 390, 760) });
}

const P = join(HERE, "project");
const cj = JSON.parse(readFileSync(join(P, "canvas.json"), "utf8"));
if (!cj.pages.some((p) => p.id === "r4")) cj.pages.splice(1, 0, { id: "r4", name: "Phone round 4 (pick)" });
for (const b of boards) {
  const f = `${b.id}.dc.html`;
  writeFileSync(join(P, f), b.html);
  cj.boards[f] = { x: b.x, y: b.y, w: b.w, h: b.h, title: b.title, page: "r4", is_interactive: true };
  if (!cj.order.includes(f)) cj.order.push(f);
}
writeFileSync(join(P, "canvas.json"), JSON.stringify(cj, null, 2));
console.log("boards:", boards.map((b) => b.id).join(" "));
