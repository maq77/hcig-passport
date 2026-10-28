// The whole home at every device size: sideways overflow (what causes it), broken images, console errors, and any
// text that spills out of its card. node scripts/home-scan.mjs [lang] [path]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const V6 = fileURLToPath(new URL("../", import.meta.url));
const lang = process.argv[2] && process.argv[2] !== "en" ? process.argv[2] + "/" : "";
const path = process.argv[3] || "";
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".txt": "text/plain" };
const s = createServer(async (q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]).replace(/^\/hcig\/v6/, "");
  let base = join(V6, "out");
  const m = p.match(/^\/(de|pl|fr|it|es|cs)(\/.*)$/);
  if (m) { base = join(V6, "out-langs", m[1]); p = m[2]; }
  let f = join(base, p);
  try { if ((await stat(f)).isDirectory()) f = join(f, "index.html"); } catch {}
  try { const b = await readFile(f); r.writeHead(200, { "content-type": T[extname(f)] || "application/octet-stream" }); r.end(b); } catch { r.writeHead(404); r.end(); }
}).listen(0);
const SIZES = [[375, 667], [360, 740], [375, 812], [390, 844], [412, 915], [430, 932], [768, 1024], [820, 1180], [1024, 768], [1280, 720], [1366, 768], [1440, 900], [1536, 864], [1920, 1080], [2560, 1440]];
const b = await chromium.launch({ executablePath: join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe") });
let bad = 0;
for (const [w, h] of SIZES) {
  const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900 });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  pg.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 120)); });
  await pg.goto(`http://127.0.0.1:${s.address().port}/hcig/v6/${lang}${path}`, { waitUntil: "load", timeout: 60000 });
  await pg.waitForTimeout(1200);
  await pg.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
  await pg.waitForTimeout(700);
  const r = await pg.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const clippedBy = (e) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (/hidden|clip|auto|scroll/.test(cs.overflowX) && p.getBoundingClientRect().right <= W + 0.5) return true; } return false; };
    const wide = [];
    for (const e of document.querySelectorAll("main *, footer *")) { const rr = e.getBoundingClientRect(); if (rr.width && rr.right > W + 0.5 && !clippedBy(e) && getComputedStyle(e).position !== "fixed") wide.push(`${e.tagName.toLowerCase()}.${[...e.classList].slice(0, 2).join(".")} "${(e.textContent || "").trim().slice(0, 30)}"`); }
    const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.getAttribute("src").split("/").pop());
    // text that runs out of its card (scroll width larger than the box)
    const spill = [...document.querySelectorAll("main h2, main h3, main p, main .btn, main .btn2")].filter((e) => e.clientWidth > 2 && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== "visible").map((e) => `${e.tagName.toLowerCase()} "${e.textContent.trim().slice(0, 30)}"`);
    return { overflow: document.documentElement.scrollWidth - W, wide: [...new Set(wide)].slice(0, 4), broken, spill: spill.slice(0, 4) };
  });
  const ok = !r.overflow && !r.broken.length && !errs.length && !r.spill.length;
  if (!ok) bad++;
  console.log(`${ok ? "OK " : "BAD"} ${w}x${h} overflow ${r.overflow}${r.wide.length ? " " + r.wide.join(" | ") : ""}${r.broken.length ? " broken " + r.broken.join(",") : ""}${r.spill.length ? " spill " + r.spill.join(" | ") : ""}${errs.length ? " errors " + errs.join(" | ") : ""}`);
  await pg.close();
}
console.log(`${SIZES.length - bad}/${SIZES.length} clean`);
await b.close();
s.close();
