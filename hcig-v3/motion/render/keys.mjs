import { chromium } from "playwright-core";
import { writeFileSync, mkdirSync } from "node:fs";
const [theme = "dark", w = "1920", h = "1080", out = "keys"] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.LOCALAPPDATA + "/ms-playwright/chromium-1243/chrome-win64/chrome.exe" });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.goto(`http://127.0.0.1:8765/motion/film/film.html?theme=${theme}&w=${w}&h=${h}`); await page.evaluate(() => window.ready);
for (const t of [1.6, 4.6, 7.2, 12.4, 17.6, 21.2, 25.2, 28.9]) {
  const d = await page.evaluate((t) => { window.seek(t); return document.getElementById("c").toDataURL("image/png"); }, t);
  writeFileSync(`${out}/${theme}-${w}-${t}.png`, Buffer.from(d.split(",")[1], "base64"));
}
await browser.close(); console.log("ok");
