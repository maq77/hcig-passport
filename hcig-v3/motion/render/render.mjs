// Render the HCIG group film: node render.mjs <mode> <theme> <w> <h> <outDir>
// mode "board": one frame per beat (60 frames); mode "full": 60 fps x 3 subframes (motion blur blended by ffmpeg).
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
const [mode = "board", theme = "dark", w = "1920", h = "1080", out = "frames"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const exe = process.env.LOCALAPPDATA + "/ms-playwright/chromium-1243/chrome-win64/chrome.exe";
const browser = await chromium.launch({ executablePath: exe, args: ["--disable-gpu-vsync", "--force-color-profile=srgb"] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
page.on("console", (m) => { if (m.type() === "error") console.log("page error:", m.text()); });
await page.goto(`http://127.0.0.1:8765/motion/film/film.html?theme=${theme}&w=${w}&h=${h}`);
await page.evaluate(() => window.ready);
const times = [];
if (mode === "board") for (let b = 0; b < 60; b++) times.push(b * 0.5 + 0.25);
else for (let f = 0; f < 1800; f++) for (let s = 0; s < 3; s++) times.push((f + s / 3) / 60);
let i = 0; const t0 = Date.now();
for (const t of times) {
  const data = await page.evaluate((t) => { window.seek(t); return document.getElementById("c").toDataURL("image/png"); }, t);
  writeFileSync(`${out}/${String(i).padStart(5, "0")}.png`, Buffer.from(data.split(",")[1], "base64"));
  i++; if (i % 600 === 0) console.log(i, "frames", Math.round((Date.now() - t0) / 1000), "s");
}
console.log("done", i, "frames in", Math.round((Date.now() - t0) / 1000), "s");
await browser.close();
