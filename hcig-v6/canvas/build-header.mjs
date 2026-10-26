// Header round (owner, 2026-10-26): a logo that is not squeezed or too tall, a header that follows the reader down,
// glass where it helps, and a better phone menu with smooth motion in and out. Three desktop and three phone options.
// Run: node hcig-v6/canvas/build-header.mjs   (writes project/HD*.dc.html, adds the "Header (pick)" page)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const V6 = join(HERE, "..");
const C = await import(pathToFileURL(join(V6, "src/content/home.mjs")).href);
const BLOBS = JSON.parse(readFileSync(join(HERE, "blobs.json"), "utf8"));
const B = (k) => { const v = BLOBS[k]; return v.startsWith("/_blob/") ? v : "/_blob/" + v; };
const iconsSrc = readFileSync(join(V6, "src/lib/icons.ts"), "utf8");
const ICONS = Object.fromEntries([...iconsSrc.matchAll(/^\s+(\w+): '(.+)',$/gm)].map((m) => [m[1], m[2]]));
const ic = (n, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const NAV = C.NAV, LANGS = C.LANGS, CTA = C.HERO.ctaPrimary.text;

const BASE = `
@font-face { font-family: 'Helma'; src: url('${B("helma")}') format('woff2'); font-weight: 400; font-display: swap; }
body { margin: 0; }
.x { --black:#000; --b80:#333; --dim:#565759; --d40:#BBBCBE; --d20:#DDDDDF; --d06:#F6F6F6; --t:#12C0C6; --t20:#D0F2F4; --w:#FFF; --ease: cubic-bezier(.16,1,.3,1);
  font: 400 15px/1.5 'Inter', system-ui, sans-serif; color: var(--black); background: #EDEDEE; -webkit-font-smoothing: antialiased; }
.x *, .x *::before, .x *::after { box-sizing: border-box; }
.x img { display: block; }
.tag { position: absolute; top: 10px; right: 12px; z-index: 50; padding: 5px 10px; border-radius: 999px; background: var(--black); color: var(--w); font: 600 11px/1 'Inter', sans-serif; letter-spacing: .08em; }
.cap { position: absolute; left: 14px; top: 8px; z-index: 50; font: 600 11px/1 'Inter', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--dim); background: rgba(255,255,255,.85); padding: 5px 8px; border-radius: 6px; }
.stage { position: relative; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; background: url('${B("earth-day")}') 70% 30% / cover; }
.hero-bg::after { content: ""; position: absolute; inset: 0; background: radial-gradient(70% 90% at 20% 50%, rgba(255,255,255,.92), rgba(255,255,255,.2) 75%); }
.page-bg { position: absolute; inset: 0; background: #fff; }
.page-bg::before { content: "About Us"; position: absolute; left: 50%; top: 150px; transform: translateX(-50%); font: 400 46px/1 'Helma', serif; color: #000; }
.page-bg::after { content: ""; position: absolute; left: 80px; right: 80px; top: 230px; height: 220px; border-radius: 22px; background: url('${B("about-band")}') 50% 50% / cover; }
.nav a { white-space: nowrap; font: 500 14.5px/1 'Inter', sans-serif; color: inherit; text-decoration: none; }
.nav a.cur { box-shadow: inset 0 -1px 0 var(--t); padding-bottom: 6px; }
.btn { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 20px; border-radius: 999px; background: var(--t); color: var(--black); font: 600 14px/1 'Inter', sans-serif; white-space: nowrap; }
.ibtn { width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(0,0,0,.12); color: inherit; flex: none; }
.lang { display: inline-flex; align-items: center; gap: 6px; height: 42px; padding: 0 12px; border-radius: 999px; border: 1px solid rgba(0,0,0,.12); font: 500 13.5px/1 'Inter', sans-serif; }
.glass { background: rgba(255,255,255,.72); -webkit-backdrop-filter: blur(18px) saturate(160%); backdrop-filter: blur(18px) saturate(160%); }
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
const nav = (cur = "/") => NAV.map((n) => `<a href="#"${n.path === cur ? ' class="cur"' : ""}>${esc(n.label)}</a>`).join("");
const LOGO = (h, tone = "black") => `<img src="${B(tone === "black" ? "logo-h-black" : "logo-h-white")}" alt="Healthcare International Group" style="height:${h}px;width:auto;flex:none">`;
const boards = [];

// ---------------- Desktop: three headers, each shown at the top of the page and after scrolling ----------------
const D = [
  { id: "D1", name: "floating glass capsule: clear over the hero, a centred glass pill once you scroll", css: `
.d1top { position: absolute; left: 0; right: 0; top: 0; display: flex; align-items: center; gap: 28px; padding: 22px 64px; }
.d1top .nav { display: flex; gap: 26px; margin-left: auto; }
.d1pill { position: absolute; left: 50%; top: 16px; transform: translateX(-50%); display: flex; align-items: center; gap: 22px; padding: 8px 8px 8px 22px; border-radius: 999px; box-shadow: 0 0 0 1px rgba(255,255,255,.6), 0 20px 40px -20px rgba(0,0,0,.35); }
.d1pill .nav { display: flex; gap: 22px; }`,
    top: () => `<div class="d1top">${LOGO(60)}<nav class="nav">${nav()}</nav><span class="ibtn">${ic("moon", 18)}</span><span class="lang">${ic("globe", 16)}EN</span><span class="btn">${esc(CTA)}</span></div>`,
    scrolled: () => `<div class="d1pill glass">${LOGO(44)}<nav class="nav">${nav()}</nav><span class="lang">${ic("globe", 16)}EN</span><span class="btn">${esc(CTA)}${ic("arrow", 16)}</span></div>` },
  { id: "D2", name: "full-width glass bar: tall and clear at the top, then a slim frosted bar with a hairline", css: `
.d2 { position: absolute; left: 0; right: 0; top: 0; display: flex; align-items: center; gap: 28px; padding: 0 64px; }
.d2.top { height: 96px; }
.d2.sc { height: 70px; box-shadow: 0 1px 0 rgba(0,0,0,.08), 0 18px 30px -24px rgba(0,0,0,.3); }
.d2 .nav { display: flex; gap: 28px; margin: 0 auto; }
.d2 .tools { display: flex; gap: 10px; align-items: center; }`,
    top: () => `<div class="d2 top">${LOGO(60)}<nav class="nav">${nav()}</nav><div class="tools"><span class="ibtn">${ic("moon", 18)}</span><span class="lang">${ic("globe", 16)}EN</span><span class="btn">${esc(CTA)}</span></div></div>`,
    scrolled: () => `<div class="d2 sc glass">${LOGO(44)}<nav class="nav">${nav()}</nav><div class="tools"><span class="lang">${ic("globe", 16)}EN</span><span class="btn">${esc(CTA)}</span></div></div>` },
  { id: "D3", name: "three islands: logo chip, centred glass nav pill, call to action; on scroll the islands tighten", css: `
.d3 { position: absolute; left: 0; right: 0; top: 0; display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; }
.d3 .chip { display: flex; align-items: center; height: 60px; padding: 0 20px; border-radius: 20px; }
.d3 .np { display: flex; gap: 6px; padding: 6px; border-radius: 999px; box-shadow: 0 0 0 1px rgba(255,255,255,.7), 0 16px 30px -22px rgba(0,0,0,.35); }
.d3 .np a { padding: 10px 14px; border-radius: 999px; } .d3 .np a.cur { background: var(--black); color: #fff; box-shadow: none; padding-bottom: 10px; }
.d3 .rt { display: flex; gap: 10px; align-items: center; }
.d3.sc { padding: 12px 40px; } .d3.sc .chip { height: 52px; box-shadow: 0 16px 30px -22px rgba(0,0,0,.35); }`,
    top: () => `<div class="d3"><span class="chip">${LOGO(58)}</span><nav class="nav np glass">${nav()}</nav><div class="rt"><span class="ibtn glass">${ic("moon", 18)}</span><span class="lang glass">${ic("globe", 16)}EN</span><span class="btn">${esc(CTA)}</span></div></div>`,
    scrolled: () => `<div class="d3 sc"><span class="chip glass">${LOGO(44)}</span><nav class="nav np glass">${nav()}</nav><div class="rt"><span class="lang glass">${ic("globe", 16)}EN</span><span class="btn">${esc(CTA)}</span></div></div>` },
];
D.forEach((o, k) => {
  const body = `<div class="x"><span class="tag">${o.id}</span>
<div class="stage" style="height:240px"><div class="hero-bg"></div><span class="cap">At the top, over the hero</span>${o.top()}</div>
<div class="stage" style="height:300px;margin-top:8px"><div class="page-bg"></div><span class="cap">After scrolling: it follows you down</span>${o.scrolled()}</div></div>`;
  boards.push({ id: `HD${o.id}`, title: `Header ${o.id} desktop: ${o.name}`, w: 1440, h: 560, x: 0, y: k * 620, html: board(`Header ${o.id}`, o.css, body, 1440, 560) });
});

// ---------------- Phone: three menus, each shown closed and open ----------------
const linksNum = NAV.map((n, i) => `<li><span class="n">${String(i + 1).padStart(2, "0")}</span><a href="#">${esc(n.label)}</a></li>`).join("");
const NAV_ICONS = ["hotel", "users", "hospital", "ship", "handshake", "mail", "clipboard"];
const M = [
  { id: "M1", name: "full-screen white menu: big Helma links rise one by one, numbered; Talk to our team pinned at the bottom", css: `
.bar { position: absolute; left: 12px; right: 12px; top: 12px; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px 0 16px; border-radius: 20px; box-shadow: 0 0 0 1px rgba(255,255,255,.7), 0 14px 30px -22px rgba(0,0,0,.4); }
.bar .r { display: flex; gap: 8px; }
.burger { width: 44px; height: 44px; border-radius: 14px; background: var(--black); color: #fff; display: inline-flex; align-items: center; justify-content: center; }
.full { position: absolute; inset: 0; background: #fff; display: flex; flex-direction: column; padding: 88px 24px 24px; }
.full ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.full li { display: flex; align-items: baseline; gap: 14px; padding: 8px 0; border-bottom: 1px solid var(--d20); }
.full li .n { font: 400 13px/1 'Helma', serif; color: var(--t); width: 22px; }
.full li a { font: 400 30px/1.15 'Helma', serif; color: #000; text-decoration: none; }
.full li:nth-child(2) a { color: var(--t); }
.langs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 18px; } .langs span { padding: 7px 11px; border-radius: 999px; border: 1px solid var(--d20); font-size: 12.5px; } .langs span.on { background: #000; color: #fff; border-color: #000; }
.full .btn { margin-top: auto; justify-content: center; min-height: 54px; }`,
    closed: () => `<div class="hero-bg"></div><div class="bar glass">${LOGO(40)}<div class="r"><span class="ibtn">${ic("moon", 18)}</span><span class="burger">${ic("menu", 22)}</span></div></div>`,
    open: () => `<div class="full"><ol>${linksNum}</ol><div class="langs">${LANGS.map((l, i) => `<span${i === 0 ? ' class="on"' : ""}>${esc(l.name)}</span>`).join("")}</div><span class="btn">${esc(CTA)}${ic("arrow", 16)}</span></div><div class="bar" style="background:#fff;box-shadow:none">${LOGO(40)}<div class="r"><span class="burger">${ic("close", 22)}</span></div></div>` },
  { id: "M2", name: "bottom sheet in thumb reach: the page dims and blurs, a sheet slides up with a 2 x 4 grid of links, languages and the call", css: `
.bar { position: absolute; left: 0; right: 0; top: 0; height: 66px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px 0 18px; box-shadow: 0 1px 0 rgba(0,0,0,.06); }
.bar .r { display: flex; gap: 8px; }
.burger { height: 42px; padding: 0 14px; border-radius: 999px; background: var(--black); color: #fff; display: inline-flex; align-items: center; gap: 8px; font: 600 13px/1 'Inter', sans-serif; }
.dim { position: absolute; inset: 0; background: rgba(0,0,0,.35); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
.sheet { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 18px 22px; border-radius: 26px 26px 0 0; background: #fff; box-shadow: 0 -20px 50px -20px rgba(0,0,0,.35); }
.grab { width: 44px; height: 5px; margin: 0 auto 16px; border-radius: 5px; background: var(--d20); }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.grid a { display: flex; align-items: center; gap: 10px; min-height: 58px; padding: 0 12px; border-radius: 16px; background: var(--d06); color: #000; text-decoration: none; font: 600 14px/1.2 'Inter', sans-serif; }
.grid a span { width: 34px; height: 34px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; background: #fff; color: var(--t); }
.grid a.on { background: var(--t20); }
.row { display: flex; gap: 6px; margin: 14px 0; overflow: hidden; } .row span { flex: none; padding: 7px 11px; border-radius: 999px; border: 1px solid var(--d20); font-size: 12.5px; } .row span.on { background: #000; color: #fff; border-color: #000; }
.sheet .btn { width: 100%; justify-content: center; min-height: 54px; }`,
    closed: () => `<div class="hero-bg"></div><div class="bar glass">${LOGO(40)}<div class="r"><span class="ibtn">${ic("moon", 18)}</span><span class="burger">${ic("menu", 18)}Menu</span></div></div>`,
    open: () => `<div class="hero-bg"></div><div class="bar glass">${LOGO(40)}<div class="r"><span class="burger">${ic("close", 18)}Close</span></div></div><div class="dim"></div><div class="sheet"><div class="grab"></div><div class="grid">${NAV.map((n, i) => `<a href="#"${i === 0 ? ' class="on"' : ""}><span>${ic(NAV_ICONS[i], 18)}</span>${esc(n.label)}</a>`).join("")}</div><div class="row">${LANGS.map((l, i) => `<span${i === 0 ? ' class="on"' : ""}>${esc(l.name)}</span>`).join("")}</div><span class="btn">${esc(CTA)}${ic("arrow", 16)}</span></div>` },
  { id: "M3", name: "Dim Gray glass panel from the right: white Helma links, quick contact row (WhatsApp, call, email), the page slides a little left behind it", css: `
.bar { position: absolute; left: 0; right: 0; top: 0; height: 66px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px 0 18px; }
.bar .r { display: flex; gap: 8px; }
.burger { width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(0,0,0,.15); display: inline-flex; align-items: center; justify-content: center; }
.behind { position: absolute; inset: 0; transform: translateX(-46px) scale(.94); border-radius: 22px; overflow: hidden; filter: brightness(.7); }
.panel { position: absolute; top: 0; right: 0; bottom: 0; width: 88%; padding: 20px 22px 24px; display: flex; flex-direction: column; color: #fff; background: radial-gradient(90% 50% at 100% 0%, rgba(18,192,198,.25), transparent 60%), linear-gradient(170deg, rgba(51,51,51,.94), rgba(86,87,89,.94)); -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px); border-radius: 26px 0 0 26px; }
.ptop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.x3 { width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(255,255,255,.3); display: inline-flex; align-items: center; justify-content: center; }
.panel ul { list-style: none; margin: 0; padding: 0; }
.panel li a { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; color: #fff; text-decoration: none; font: 400 26px/1.15 'Helma', serif; border-bottom: 1px solid rgba(255,255,255,.12); }
.panel li a svg { color: var(--t); }
.quick { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: auto; }
.quick span { display: grid; justify-items: center; gap: 6px; padding: 12px 0; border-radius: 16px; background: rgba(255,255,255,.08); font: 500 12px/1 'Inter', sans-serif; }
.quick span svg { color: var(--t); }
.panel .btn { margin-top: 10px; justify-content: center; min-height: 52px; }
.pl { display: flex; gap: 6px; margin: 14px 0 6px; } .pl span { padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,.25); font-size: 12px; } .pl span.on { background: #fff; color: #000; }`,
    closed: () => `<div class="hero-bg"></div><div class="bar glass">${LOGO(40)}<div class="r"><span class="ibtn">${ic("moon", 18)}</span><span class="burger">${ic("menu", 22)}</span></div></div>`,
    open: () => `<div class="behind"><div class="hero-bg"></div></div><div class="panel"><div class="ptop">${LOGO(40, "white")}<span class="x3">${ic("close", 20)}</span></div><ul>${NAV.map((n) => `<li><a href="#">${esc(n.label)}${ic("arrow", 18)}</a></li>`).join("")}</ul><div class="pl">${LANGS.slice(0, 4).map((l, i) => `<span${i === 0 ? ' class="on"' : ""}>${l.code.toUpperCase()}</span>`).join("")}<span>+3</span></div><div class="quick"><span>${ic("whatsapp", 20)}${esc(C.UI.whatsapp.text)}</span><span>${ic("phone", 20)}${esc(C.UI.call.text)}</span><span>${ic("mail", 20)}${esc(C.UI.email.text)}</span></div><span class="btn">${esc(CTA)}${ic("arrow", 16)}</span></div>` },
];
M.forEach((o, k) => {
  const body = `<div class="x" style="display:flex;gap:16px;padding:16px;position:relative"><span class="tag">${o.id}</span>
<div class="stage" style="width:390px;height:780px;border-radius:24px"><span class="cap" style="top:auto;bottom:10px">Closed</span>${o.closed()}</div>
<div class="stage" style="width:390px;height:780px;border-radius:24px"><span class="cap" style="top:auto;bottom:10px">Open</span>${o.open()}</div></div>`;
  boards.push({ id: `HD${o.id}`, title: `Phone menu ${o.id}: ${o.name}`, w: 828, h: 812, x: 1520 + k * 880, y: 0, html: board(`Phone menu ${o.id}`, o.css, body, 828, 812) });
});

const P = join(HERE, "project");
const cj = JSON.parse(readFileSync(join(P, "canvas.json"), "utf8"));
if (!cj.pages.some((p) => p.id === "hd")) cj.pages.splice(1, 0, { id: "hd", name: "Header (pick)" });
for (const b of boards) {
  const f = `${b.id}.dc.html`;
  writeFileSync(join(P, f), b.html);
  cj.boards[f] = { x: b.x, y: b.y, w: b.w, h: b.h, title: b.title, page: "hd", is_interactive: true };
  if (!cj.order.includes(f)) cj.order.push(f);
}
writeFileSync(join(P, "canvas.json"), JSON.stringify(cj, null, 2));
console.log("boards:", boards.map((b) => b.id).join(" "));
