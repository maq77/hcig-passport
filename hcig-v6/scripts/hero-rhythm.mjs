// The hero's vertical rhythm: each block's font size and line height, and the gap from one block to the next.
//   node scripts/hero-rhythm.mjs [lang]       SHOTS=<dir> also saves a screenshot of each size
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const V6 = fileURLToPath(new URL("../", import.meta.url));
const lang = process.argv[2] && process.argv[2] !== "en" ? process.argv[2] + "/" : "";
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
const b = await chromium.launch({ executablePath: join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe") });
for (const [w, h] of [[375, 667], [390, 844], [430, 932], [768, 1024], [1280, 720], [1440, 900], [1920, 1080]]) {
  const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900 });
  await pg.goto(`http://127.0.0.1:${s.address().port}/hcig/v6/${lang}`, { waitUntil: "networkidle" });
  await pg.waitForTimeout(2600);
  const r = await pg.evaluate(() => {
    const blocks = [[".hero .cred .plates", "seals"], [".hero .cred p", "partner"], [".hero h1", "h1"], [".hero .sub", "sub"], [".hero .lead", "lead"], [".hero .ctas", "buttons"]];
    let prev = null;
    return blocks.map(([sel, name]) => {
      const e = document.querySelector(sel); if (!e) return `${name}: -`;
      const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      const fs = parseFloat(cs.fontSize), lh = cs.lineHeight === "normal" ? "normal" : (parseFloat(cs.lineHeight) / fs).toFixed(2);
      const gap = prev === null ? "" : ` +${Math.round(r.top - prev)}`;
      prev = r.bottom;
      const lines = name === "seals" || name === "buttons" ? "" : ` ${Math.round(r.height / parseFloat(cs.lineHeight || fs * 1.2))}l`;
      return `${gap} ${name}${name === "seals" || name === "buttons" ? "" : ` ${fs}px/${lh}${lines} w${Math.round(r.width)}`}`;
    }).join("");
  });
  console.log(`${w}x${h}:${r}`);
  if (process.env.SHOTS) await pg.screenshot({ path: join(process.env.SHOTS, `rhythm-${w}x${h}.png`) });
  await pg.close();
}
await b.close();
s.close();
