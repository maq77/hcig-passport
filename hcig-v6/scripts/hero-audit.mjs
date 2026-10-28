// A full look at the home hero: overlaps between its parts, text outside the screen, errors, and screenshots at three
// moments of the entrance and after a short scroll, by day and by night. Videos show their designed cover in shots.
//   node scripts/hero-audit.mjs [lang] [outDir]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const V6 = fileURLToPath(new URL("../", import.meta.url));
const lang = process.argv[2] && process.argv[2] !== "en" ? process.argv[2] + "/" : "";
const OUT = process.argv[3] || join(V6, "..", ".playwright-mcp", "audit");
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4" };
const s = createServer(async (q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]).replace(/^\/hcig\/v6/, "");
  let base = join(V6, "out");
  const m = p.match(/^\/(de|pl|fr|it|es|cs)(\/.*)$/);
  if (m) { base = join(V6, "out-langs", m[1]); p = m[2]; }
  let f = join(base, p);
  try { if ((await stat(f)).isDirectory()) f = join(f, "index.html"); } catch {}
  try { const b = await readFile(f); r.writeHead(200, { "content-type": T[extname(f)] || "application/octet-stream" }); r.end(b); } catch { r.writeHead(404); r.end(); }
}).listen(0);
const { mkdirSync } = await import("node:fs");
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe") });
const covers = (pg) => pg.evaluate(() => document.querySelectorAll("video").forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); }));
for (const night of [false, true]) for (const [w, h] of [[375, 667], [390, 844], [430, 932], [1024, 768], [1280, 720], [1440, 900], [1920, 1080]]) {
  const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900 });
  const errs = []; pg.on("pageerror", (e) => errs.push(String(e).slice(0, 100))); pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 100)); });
  if (night) await pg.addInitScript(() => { try { localStorage.setItem("hcig-theme", "night"); } catch {} });
  await pg.goto(`http://127.0.0.1:${s.address().port}/hcig/v6/${lang}`, { waitUntil: "domcontentloaded" });
  const tag = `${night ? "n" : "d"}-${w}x${h}`;
  for (const t of [400, 1300]) { await pg.waitForTimeout(t === 400 ? 400 : 900); await pg.screenshot({ path: join(OUT, `${tag}-t${t}.png`) }); }
  await pg.waitForTimeout(1800);
  const r = await pg.evaluate(() => {
    const W = innerWidth, H = innerHeight;
    const box = (sel) => { const e = document.querySelector(sel); if (!e || getComputedStyle(e).display === "none") return null; const r = e.getBoundingClientRect(); return r.width ? r : null; };
    const parts = { header: ".hd-in", cred: ".hero .cred", h1: ".hero h1", sub: ".hero .sub", lead: ".hero .lead", ctas: ".hero .ctas", thumb: ".hf-thumb", chip: ".hf-chip" };
    const R = Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, box(v)]).filter(([, v]) => v));
    const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
    const keys = Object.keys(R), clash = [];
    for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) if (hit(R[keys[i]], R[keys[j]])) clash.push(`${keys[i]}x${keys[j]}`);
    const out = Object.entries(R).filter(([, v]) => v.right > W + 1 || v.left < -1 || v.bottom > H + 1).map(([k, v]) => `${k}(${Math.round(v.left)},${Math.round(v.right)},${Math.round(v.bottom)})`);
    // the visible text of each line must not be hidden (opacity 0) after the entrance
    const hidden = [...document.querySelectorAll(".hero .copy > *, .hero h1 .w > span, .hero .ctas > *")].filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.95).length;
    return { clash, out, hidden };
  });
  await covers(pg);
  await pg.screenshot({ path: join(OUT, `${tag}-end.png`) });
  await pg.evaluate(() => scrollTo(0, 180)); await pg.waitForTimeout(700);
  await pg.screenshot({ path: join(OUT, `${tag}-scroll.png`) });
  const sc = await pg.evaluate(() => { const hd = document.querySelector(".hd-in").getBoundingClientRect(); const c = document.querySelector(".hero .cred").getBoundingClientRect(); return hd.bottom > c.top + 2 && c.bottom > 0 && getComputedStyle(document.querySelector(".hd")).visibility !== "hidden" ? "header covers the seals while scrolling" : ""; });
  console.log(`${tag}: ${r.clash.length ? "OVERLAP " + r.clash.join(" ") : "no overlap"} | ${r.out.length ? "OUTSIDE " + r.out.join(" ") : "inside"} | hidden ${r.hidden} | ${sc || "scroll ok"} | errors ${errs.length ? errs.join("; ") : "none"}`);
  await pg.close();
}
await b.close();
s.close();
