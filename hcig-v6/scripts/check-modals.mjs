// One-shot check of the section modals and the round-5 phone sections: serves out/ at /hcig/v6, opens each modal at
// 1440 and 390, screenshots, checks focus, Escape and overflow, then stops. No server is left running.
// Run: node scripts/check-modals.mjs <outDir>
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const outDir = process.argv[2];
const OUT = fileURLToPath(new URL("../out/", import.meta.url));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".woff2": "font/woff2", ".txt": "text/plain" };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]).replace(/^\/hcig\/v6/, "");
  let f = join(OUT, p);
  try { if ((await stat(f)).isDirectory()) f = join(f, "index.html"); } catch { f = join(OUT, p.replace(/\/$/, "") + ".html"); }
  try { const b = await readFile(f); res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); res.end(b); } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ executablePath: join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe") });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error" && !/404/.test(m.text())) errs.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/hcig/v6/`, { waitUntil: "networkidle" });
  await page.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 450) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } });
  for (const s of [".why", ".built", ".eco", ".care", ".mar"]) {
    await page.evaluate((s) => { const t = document.querySelector(s); scrollTo(0, t.getBoundingClientRect().top + scrollY - 8); }, s);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: join(outDir, `m5-${w}-${s.slice(1)}.png`) });
  }
  for (const [sel, name] of [[".why-grid > :nth-child(2)", "why"], [".built-grid > :nth-child(5)", "built"], [".care-grid > :nth-child(3)", "care"]]) {
    await page.evaluate((sel) => { const t = document.querySelector(sel); scrollTo(0, t.getBoundingClientRect().top + scrollY - 200); }, sel);
    await page.waitForTimeout(500);
    await page.click(sel, { position: { x: 30, y: 30 } });
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(outDir, `m5-${w}-modal-${name}.png`) });
    const st = await page.evaluate(() => ({ open: !!document.querySelector(".dm-card"), focus: document.activeElement && document.activeElement.className, locked: document.documentElement.classList.contains("modal-open") }));
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    const next = await page.evaluate(() => (document.querySelector(".dm-nav b") || {}).textContent);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    const closed = await page.evaluate(() => !document.querySelector(".dm-card") && !document.documentElement.classList.contains("modal-open"));
    console.log(w, name, JSON.stringify(st), "next", next, "closed", closed);
  }
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(w, "overflow", sw, "errors", errs.length ? errs.slice(0, 3).join(" | ") : "none");
  await page.close();
}
await browser.close();
server.close();
