import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
const out = process.argv[2];
const browser = await chromium.launch({ executablePath: process.env.LOCALAPPDATA + "/ms-playwright/chromium-1243/chrome-win64/chrome.exe" });
const page = await browser.newPage();
await page.goto("http://127.0.0.1:8765/motion/film/audio.html");
const b64 = await page.evaluate(() => window.renderWav());
writeFileSync(out, Buffer.from(b64, "base64"));
await browser.close(); console.log("audio", out);
