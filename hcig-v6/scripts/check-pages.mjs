// One-shot check of whole pages: serves out/ at /hcig/v6, opens each path at 390 and 1440, scrolls through so every
// reveal runs, takes a full-page screenshot, reports overflow, console errors and broken images, then stops.
// Run: node scripts/check-pages.mjs <outDir> /about/ /services/ ...
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const [, , outDir, ...paths] = process.argv;
const OUT = fileURLToPath(new URL("../out/", import.meta.url));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".woff2": "font/woff2", ".txt": "text/plain", ".jpg": "image/jpeg" };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]).replace(/^\/hcig\/v6/, "");
  let f = join(OUT, p);
  try { if ((await stat(f)).isDirectory()) f = join(f, "index.html"); } catch { f = join(OUT, p.replace(/\/$/, "") + ".html"); }
  try { const b = await readFile(f); res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); res.end(b); } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ executablePath: join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe") });
for (const path of paths) {
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error" && !/404/.test(m.text())) errs.push(m.text()); });
    page.on("response", (r) => { if (r.status() === 404 && /\/media\//.test(r.url())) errs.push("missing " + r.url().split("/media/")[1]); });
    await page.goto(`http://127.0.0.1:${port}/hcig/v6${path}`, { waitUntil: "networkidle" });
    await page.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h: document.documentElement.scrollHeight,
      h1: [...document.querySelectorAll("h1")].map((x) => x.textContent.trim().slice(0, 60)),
      broken: [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => i.src.split("/").pop()),
    }));
    const name = path.replace(/\//g, "_").replace(/^_|_$/g, "") || "home";
    await page.screenshot({ path: join(outDir, `pg-${name}-${w}.png`), fullPage: true });
    console.log(path, w, "overflow", r.sw, "height", r.h, "h1", JSON.stringify(r.h1), "broken", r.broken.join(",") || "none", "errors", errs.length ? errs.slice(0, 3).join(" | ") : "none");
    await page.close();
  }
}
await browser.close();
server.close();
