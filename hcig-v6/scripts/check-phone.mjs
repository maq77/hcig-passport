// One-shot local check: serves out/ at /hcig/v6 on a free port, screenshots the given sections at 390 and 1440,
// prints overflow and console errors, then stops. No server is left running.
// Run: node scripts/check-phone.mjs <outDir> .why .built .tst .who
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const [, , outDir, ...sels] = process.argv;
const OUT = fileURLToPath(new URL("../out/", import.meta.url));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain" };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]).replace(/^\/hcig\/v6/, "");
  let f = join(OUT, p);
  try { if ((await stat(f)).isDirectory()) f = join(f, "index.html"); } catch { f = join(OUT, p.replace(/\/$/, "") + ".html"); }
  try { const b = await readFile(f); res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); res.end(b); }
  catch { res.writeHead(404); res.end("nf"); }
}).listen(0);
const port = server.address().port;
const exe = join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe");
const browser = await chromium.launch({ executablePath: exe });
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/hcig/v6/`, { waitUntil: "networkidle" });
  await page.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 450) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } });
  for (const s of sels) {
    await page.evaluate((s) => { const t = document.querySelector(s); if (t) scrollTo(0, t.getBoundingClientRect().top + scrollY - 8); }, s);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(outDir, `ck-${w}-${s.replace(/[^a-z0-9]/gi, "")}.png`) });
  }
  if (process.env.TAP && w === 390) {
    // tap the third story (the landscape one) and look at the full-screen view
    await page.evaluate(() => { const t = document.querySelector(".tst"); scrollTo(0, t.getBoundingClientRect().top + scrollY); });
    await page.waitForTimeout(600);
    await page.click(".tst-vids .t-c .watch", { force: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(outDir, "ck-390-full.png") });
    const box = await page.evaluate(() => { const d = document.querySelector(".lightbox"); const v = d && d.querySelector("video"); return d ? [d.open, Math.round(d.getBoundingClientRect().width), Math.round(d.getBoundingClientRect().height), v ? getComputedStyle(v).objectFit : "-"] : null; });
    console.log("full screen", JSON.stringify(box));
    await page.keyboard.press("Escape");
  }
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(w, "overflow", sw, "errors", errs.length ? errs.slice(0, 3).join(" | ") : "none");
  await page.close();
}
await browser.close();
server.close();
