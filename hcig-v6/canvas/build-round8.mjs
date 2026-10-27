// Round 8 (owner, 2026-10-27): one final silk and one final blog card. Three options each, desktop and phone.
// The three newest posts are portrait photos (3:4 and 4:5), so every card option uses a portrait frame: no cut faces.
// Run: node hcig-v6/canvas/build-round8.mjs
import { B, C, board, esc, ic, publishBoards } from "./board-kit.mjs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const { POSTS } = await import(pathToFileURL(join(HERE, "../src/content/blog.mjs")).href);
const posts = POSTS.slice(0, 3);
const boards = [];

// ---------- wave geometry ----------
const W = 1440;
const at = (w, x) => w.y + w.a * Math.sin((x / W) * Math.PI * 2 * w.f + w.p) + (w.a2 || 0) * Math.sin((x / W) * Math.PI * 2 * (w.f2 || 1) + (w.p2 || 0));
const pts = (w, k = 0, w2 = null) => { const o = []; for (let i = 0; i <= 28; i++) { const x = (i / 28) * (W + 80) - 40; o.push([x, w2 ? at(w, x) * (1 - k) + at(w2, x) * k : at(w, x)]); } return o; };
const smooth = (p, m = "M") => { let d = `${m}${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`; for (let i = 0; i < p.length - 1; i++) { const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c; d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`; } return d; };
const band = (t, b) => `${smooth(pts(t))} ${smooth(pts(b).reverse(), "L")} Z`;
const anim = (a, b, dur, begin = 0) => `<animate attributeName="d" values="${a};${b};${a}" dur="${dur}s" begin="${-begin}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;

// S1: hairline silk, seven fine lines crossing slowly (the Mission & Vision lines, grown up)
function silkHairline(h) {
  const cols = ["#12C0C6", "#42CDD1", "#71D9DD", "#A0E6E8", "#9A9A9C", "#BBBCBE", "#71D9DD"];
  const ws = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ a: { y: h / 2 + (i - 3) * 6, a: h * 0.26, f: 0.9 + i * 0.05, p: i * 0.5, a2: h * 0.06, f2: 2.3, p2: i }, b: { y: h / 2 + (3 - i) * 5, a: h * 0.24, f: 0.95 + i * 0.04, p: i * 0.5 + 1.2, a2: h * 0.07, f2: 2.1, p2: i + 1 } }));
  return `<svg viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" width="100%" height="100%">${ws.map((w, i) => { const a = smooth(pts(w.a)), b = smooth(pts(w.b)); return `<path d="${a}" fill="none" stroke="${cols[i]}" stroke-width="${i === 0 ? 1.6 : 1}" stroke-opacity="${i === 0 ? 0.9 : 0.6}" vector-effect="non-scaling-stroke">${anim(a, b, 18 + i, i * 1.3)}</path>`; }).join("")}</svg>`;
}
// S2: satin ribbon, one folded band of fabric with a sheen gliding along it
function silkSatin(h, id) {
  const t1 = { y: h * 0.38, a: h * 0.2, f: 1, p: 0.3, a2: h * 0.05, f2: 2.4, p2: 1 }, b1 = { y: h * 0.62, a: h * 0.16, f: 0.9, p: 1.3, a2: h * 0.05, f2: 2.2, p2: 0.2 };
  const t2 = { y: h * 0.42, a: h * 0.17, f: 1.05, p: 1.2, a2: h * 0.06, f2: 2.2, p2: 2 }, b2 = { y: h * 0.58, a: h * 0.2, f: 0.95, p: 0.5, a2: h * 0.04, f2: 2.6, p2: 1.4 };
  const f1 = band(t1, b1), f2 = band(t2, b2);
  const u1 = { ...t1, y: h * 0.46, a: h * 0.22, p: 2.1 }, v1 = { ...b1, y: h * 0.7, p: 2.6 };
  const g1 = band(u1, v1), g2 = band({ ...u1, p: 2.8 }, { ...v1, p: 1.9 });
  return `<svg viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" width="100%" height="100%"><defs>
<linearGradient id="${id}a" x1="0" x2="1"><stop offset="0" stop-color="#D0F2F4" stop-opacity="0"/><stop offset=".2" stop-color="#A0E6E8"/><stop offset=".55" stop-color="#42CDD1"/><stop offset=".85" stop-color="#A0E6E8"/><stop offset="1" stop-color="#D0F2F4" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="#DDDDDF" stop-opacity="0"/><stop offset=".3" stop-color="#BBBCBE" stop-opacity=".7"/><stop offset=".7" stop-color="#DDDDDF" stop-opacity=".7"/><stop offset="1" stop-color="#DDDDDF" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset=".54" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/><animate attributeName="x1" values="-1;1" dur="10s" repeatCount="indefinite"/><animate attributeName="x2" values="0;2" dur="10s" repeatCount="indefinite"/></linearGradient></defs>
<path d="${g1}" fill="url(#${id}b)" opacity=".6">${anim(g1, g2, 22)}</path>
<path d="${f1}" fill="url(#${id}a)" opacity=".55">${anim(f1, f2, 16)}</path>
<path d="${f1}" fill="url(#${id}s)" opacity=".7">${anim(f1, f2, 16)}</path></svg>`;
}
// S3: silk and threads, a soft satin band with five hairlines riding its edges
function silkThreads(h, id) {
  const t1 = { y: h * 0.4, a: h * 0.18, f: 1, p: 0.6, a2: h * 0.04, f2: 2.3, p2: 1 }, b1 = { y: h * 0.6, a: h * 0.16, f: 0.95, p: 1.4, a2: h * 0.04, f2: 2.1, p2: 0.4 };
  const t2 = { ...t1, p: 1.5, a: h * 0.15 }, b2 = { ...b1, p: 0.8, a: h * 0.19 };
  const f1 = band(t1, b1), f2 = band(t2, b2);
  const lines = [0, 0.25, 0.5, 0.75, 1].map((k, i) => { const a = smooth(pts(t1, k, b1)), b = smooth(pts(t2, k, b2)); return `<path d="${a}" fill="none" stroke="${i === 2 ? "#12C0C6" : i % 2 ? "#71D9DD" : "#9A9A9C"}" stroke-width="${i === 2 ? 1.4 : 0.9}" stroke-opacity="${i === 2 ? 0.85 : 0.5}" vector-effect="non-scaling-stroke">${anim(a, b, 17, i * 0.4)}</path>`; }).join("");
  return `<svg viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" width="100%" height="100%"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#D0F2F4" stop-opacity="0"/><stop offset=".3" stop-color="#D0F2F4"/><stop offset=".7" stop-color="#D0F2F4"/><stop offset="1" stop-color="#D0F2F4" stop-opacity="0"/></linearGradient></defs><path d="${f1}" fill="url(#${id})" opacity=".55">${anim(f1, f2, 17)}</path>${lines}</svg>`;
}

const SEAM_CSS = `.seam { position: relative; background: linear-gradient(180deg, #fff 0%, #fff 45%, var(--d06) 100%); }
.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; padding: 0 64px; }
.cards i { height: 120px; border-radius: 18px; background: #fff; box-shadow: 0 0 0 1px var(--d20); }
.ph .cards.m { grid-template-columns: 1fr 1fr; padding: 0 20px; gap: 10px; } .cards.m i { height: 90px; }
.btnrow { position: relative; z-index: 2; display: flex; justify-content: center; padding: 26px 0 0; }
.btn2 { display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 26px; border-radius: 999px; border: 1px solid var(--d20); background: #fff; font: 500 15px/1 'Inter', sans-serif; }
.silkbox { position: relative; z-index: 1; }
.mar { padding: 6px 64px 40px; background: var(--d06); } .ph .mar.m { padding: 6px 20px 30px; }
.mar small { display: inline-flex; align-items: center; gap: 10px; font: 500 11px/1 'Inter', sans-serif; letter-spacing: .22em; color: var(--dim); } .mar small::before { content: ""; width: 26px; height: 1px; background: currentColor; }
.mar h2 { margin: 12px 0 0; font: 400 40px/1.08 'Helma', serif; max-width: 16ch; } .mar.m h2 { font-size: 30px; }`;
const SILKS = [
  { id: "S1", name: "hairline silk: seven fine lines crossing slowly, the Mission & Vision lines grown up; the calmest", fn: silkHairline, h: 120, hm: 90 },
  { id: "S2", name: "satin ribbon: one folded band of turquoise fabric over a soft grey fold, a white sheen gliding along it; no threads", fn: silkSatin, h: 130, hm: 100 },
  { id: "S3", name: "silk and threads: a pale satin band with five hairlines riding its edges, the centre one turquoise", fn: silkThreads, h: 120, hm: 90 },
];
SILKS.forEach((o, k) => {
  const desk = `<div class="ph seam" style="width:1440px"><span class="tag">${o.id}</span><div style="height:40px"></div><div class="cards"><i></i><i></i><i></i><i></i></div><div class="btnrow"><span class="btn2">${esc(C.UI.ourServices.text)}${ic("arrow", 16)}</span></div><div class="silkbox" style="height:${o.h}px;margin-top:-34px">${o.fn(o.h, "d" + k)}</div><div class="mar"><small>${esc(C.MARITIME.eyebrow)}</small><h2>${esc(C.MARITIME.heading)}</h2></div></div>`;
  boards.push({ id: `R8Silk${k + 1}`, title: `Silk ${o.id} desktop: ${o.name}`, w: 1440, h: 300, x: 0, y: k * 360, html: board(`Silk ${o.id}`, SEAM_CSS, desk, 1440, 300) });
  const ph = `<div class="ph seam" style="width:390px"><span class="tag">${o.id}</span><div style="height:30px"></div><div class="cards m"><i></i><i></i></div><div class="btnrow" style="padding:20px 20px 0"><span class="btn2" style="width:100%;justify-content:center">${esc(C.UI.ourServices.text)}${ic("arrow", 16)}</span></div><div class="silkbox" style="height:${o.hm}px;margin-top:-26px;overflow:hidden"><div style="width:260%;height:100%;margin-left:-80%">${o.fn(o.hm, "m" + k)}</div></div><div class="mar m"><small>${esc(C.MARITIME.eyebrow)}</small><h2>${esc(C.MARITIME.heading)}</h2></div></div>`;
  boards.push({ id: `R8Silk${k + 1}m`, title: `Silk ${o.id} phone`, w: 390, h: 400, x: 1500, y: k * 460, html: board(`Silk ${o.id} phone`, SEAM_CSS, ph, 390, 420) });
});

// ---------- blog cards ----------
const img = (p) => B(`post-${p.n}`);
const head = `<div class="nh"><span></span><h2>${esc(C.NEWS.heading.text)}</h2><span></span></div>`;
const NEWS_CSS = `.news { padding: 40px 64px 44px; background: var(--d06); } .ph .news.m { padding: 34px 20px 30px; }
.nh { display: flex; align-items: center; gap: 28px; margin-bottom: 30px; } .nh span { flex: 1; height: 1px; background: #000; } .nh h2 { margin: 0; font: 400 40px/1 'Helma', serif; white-space: nowrap; }
.m .nh { display: block; text-align: center; } .m .nh span { display: none; } .m .nh h2 { font-size: 30px; } .m .nh h2::after { content: ""; display: block; width: 56px; height: 1px; margin: 14px auto 0; background: #000; }
.place { display: inline-flex; align-items: center; gap: 6px; font: 500 11px/1.3 'Inter', sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--dim); } .place svg { color: var(--t); }
.more { display: flex; justify-content: center; margin-top: 26px; } .more span { display: inline-flex; align-items: center; gap: 10px; min-height: 46px; padding: 0 24px; border-radius: 999px; border: 1px solid var(--d20); background: #fff; font: 500 14.5px/1 'Inter', sans-serif; }
.dots { display: flex; gap: 6px; justify-content: center; margin-top: 16px; } .dots i { width: 7px; height: 7px; border-radius: 4px; background: var(--d40); } .dots i.on { width: 22px; background: var(--t); }
.track { display: flex; gap: 12px; overflow: hidden; margin: 0 -20px; padding: 0 20px; } .track > * { flex: 0 0 80%; }`;
const CARDS = [
  { id: "C1", name: "portrait editorial: an open 4:5 photo with rounded corners (the newest posts are portrait, nothing is cut), the dateline and a Helma title under it, no box", css: `
.c1 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
.c1 a { display: grid; gap: 14px; } .c1 figure { margin: 0; aspect-ratio: 4 / 5; border-radius: 22px; overflow: hidden; box-shadow: 0 30px 60px -40px rgba(0,0,0,.5); } .c1 img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.c1 h3 { margin: 0; font: 400 21px/1.3 'Helma', serif; } .c1 .rd { display: inline-flex; align-items: center; gap: 8px; font: 600 13px/1 'Inter', sans-serif; border-bottom: 1px solid var(--t); padding-bottom: 4px; justify-self: start; }`,
    card: (p) => `<a><figure><img src="${img(p)}" alt=""></figure><span class="place">${ic("pin", 13)}${esc(p.dateline)}</span><h3>${esc(p.title)}</h3><span class="rd">Read${ic("arrow", 14)}</span></a>`, grid: "c1" },
  { id: "C2", name: "story cover: the 4:5 photo fills the card, the title sits on a soft dark fade at the bottom, the place as a glass chip on top", css: `
.c2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.c2 a { position: relative; aspect-ratio: 4 / 5; border-radius: 24px; overflow: hidden; color: #fff; box-shadow: 0 30px 60px -40px rgba(0,0,0,.55); } .c2 img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.c2 a::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(0,0,0,.8)); }
.c2 .chip { position: absolute; left: 14px; top: 14px; z-index: 2; display: inline-flex; gap: 6px; align-items: center; padding: 7px 11px; border-radius: 999px; background: rgba(255,255,255,.85); color: #000; font: 600 10.5px/1 'Inter', sans-serif; letter-spacing: .1em; text-transform: uppercase; } .c2 .chip svg { color: var(--t); }
.c2 h3 { position: absolute; left: 18px; right: 60px; bottom: 18px; z-index: 2; margin: 0; font: 400 21px/1.25 'Helma', serif; } .c2 .go { position: absolute; right: 16px; bottom: 18px; z-index: 2; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--t); color: #000; }`,
    card: (p) => `<a><img src="${img(p)}" alt=""><span class="chip">${ic("pin", 12)}${esc(p.dateline)}</span><h3>${esc(p.title)}</h3><span class="go">${ic("arrow", 16)}</span></a>`, grid: "c2" },
  { id: "C3", name: "news desk: the newest post as a tall 4:5 cover on the left, the next two as rows with a small portrait photo, the place and the title, divided by hairlines", css: `
.c3 { display: grid; grid-template-columns: 5fr 7fr; gap: 34px; align-items: start; }
.c3 .lead { position: relative; aspect-ratio: 4 / 5; border-radius: 24px; overflow: hidden; color: #fff; } .c3 .lead img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.c3 .lead::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,.82)); } .c3 .lead .tx { position: absolute; left: 22px; right: 22px; bottom: 22px; z-index: 2; display: grid; gap: 10px; } .c3 .lead .place { color: rgba(255,255,255,.85); }
.c3 .lead h3 { margin: 0; font: 400 26px/1.2 'Helma', serif; }
.c3 .list { border-top: 1px solid #000; } .c3 .row { display: grid; grid-template-columns: 120px 1fr 36px; gap: 20px; align-items: center; padding: 22px 0; border-bottom: 1px solid var(--d20); }
.c3 .row figure { margin: 0; aspect-ratio: 4 / 5; border-radius: 14px; overflow: hidden; } .c3 .row img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.c3 .row h3 { margin: 8px 0 0; font: 400 22px/1.25 'Helma', serif; } .c3 .row p { margin: 8px 0 0; font-size: 14px; color: var(--dim); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.c3 .go { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 0 0 1px var(--d20); }
.m .c3 { grid-template-columns: 1fr; gap: 16px; } .m .c3 .lead h3 { font-size: 22px; } .m .c3 .row { grid-template-columns: 88px 1fr 32px; gap: 14px; padding: 14px 0; } .m .c3 .row h3 { font-size: 17px; } .m .c3 .row p { display: none; }`,
    desk: () => `<div class="c3"><a class="lead"><img src="${img(posts[0])}" alt=""><div class="tx"><span class="place">${ic("pin", 13)}${esc(posts[0].dateline)}</span><h3>${esc(posts[0].title)}</h3></div></a><div class="list">${posts.slice(1).map((p) => `<a class="row"><figure><img src="${img(p)}" alt=""></figure><div><span class="place">${ic("pin", 13)}${esc(p.dateline)}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div><span class="go">${ic("arrow", 16)}</span></a>`).join("")}</div></div>` },
];
CARDS.forEach((o, k) => {
  const deskBody = o.desk ? o.desk() : `<div class="${o.grid}">${posts.map(o.card).join("")}</div>`;
  boards.push({ id: `R8Card${k + 1}`, title: `Blog card ${o.id} desktop: ${o.name}`, w: 1440, h: o.id === "C3" ? 860 : 780, x: 0, y: 1500 + k * 920, html: board(`Card ${o.id}`, NEWS_CSS + o.css, `<div class="ph" style="width:1440px"><span class="tag">${o.id}</span><section class="news">${head}${deskBody}<div class="more"><span>${esc(C.UI.allNews.text)}${ic("arrow", 15)}</span></div></section></div>`, 1440, o.id === "C3" ? 860 : 780) });
  const phBody = o.desk ? `<div class="c3">${o.desk().replace(/^<div class="c3">|<\/div>$/g, "")}</div>` : `<div class="track ${o.grid}" style="display:flex">${posts.map(o.card).join("")}</div><div class="dots"><i class="on"></i><i></i><i></i></div>`;
  boards.push({ id: `R8Card${k + 1}m`, title: `Blog card ${o.id} phone${o.desk ? "" : " (slides on its own)"}`, w: 390, h: 820, x: 1500, y: 1500 + k * 920, html: board(`Card ${o.id} phone`, NEWS_CSS + o.css, `<div class="ph m" style="width:390px"><span class="tag">${o.id}</span><section class="news m">${head}${phBody}<div class="more"><span>${esc(C.UI.allNews.text)}${ic("arrow", 15)}</span></div></section></div>`, 390, 820) });
});

publishBoards(boards, "r8", "Round 8: final silk and blog card (pick)");
void readFileSync;
