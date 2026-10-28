// What a phone downloads when it opens a page (first screen, no scrolling), by type, plus the biggest files; and the
// key timings (first paint, largest paint). node scripts/page-weight.mjs [path] [width] [height]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const V6 = fileURLToPath(new URL("../", import.meta.url));
const path = process.argv[2] || "/";
const W = Number(process.argv[3] || 390), H = Number(process.argv[4] || 844);
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4", ".jpg": "image/jpeg" };
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
const pg = await b.newPage({ viewport: { width: W, height: H }, isMobile: W < 900, hasTouch: W < 900 });
const got = [];
pg.on("response", async (res) => { try { const body = await res.body(); got.push({ url: res.url(), bytes: body.length, type: res.request().resourceType() }); } catch {} });
await pg.goto(`http://127.0.0.1:${s.address().port}/hcig/v6${path}`, { waitUntil: "networkidle" });
await pg.waitForTimeout(4000);
const lcp = await pg.evaluate(() => new Promise((res) => { new PerformanceObserver((l) => { const e = l.getEntries().at(-1); res(e ? `${Math.round(e.startTime)} ms (${e.element?.tagName.toLowerCase()} ${(e.url || "").split("/").pop()})` : "-"); }).observe({ type: "largest-contentful-paint", buffered: true }); setTimeout(() => res("-"), 1500); }));
const by = {};
for (const g of got) { const k = g.type; by[k] = (by[k] || 0) + g.bytes; }
const kb = (n) => Math.round(n / 1024);
console.log(`${path} at ${W}x${H}: total ${kb(got.reduce((a, g) => a + g.bytes, 0))} KB (uncompressed) | ${Object.entries(by).map(([k, v]) => `${k} ${kb(v)}`).join(", ")} | largest paint ${lcp}`);
console.log("biggest:", got.sort((a, b) => b.bytes - a.bytes).slice(0, 8).map((g) => `${g.url.split("/").pop().split("?")[0]} ${kb(g.bytes)}`).join(" | "));
await b.close();
s.close();
