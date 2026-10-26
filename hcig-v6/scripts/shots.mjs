// Screenshots of a page at phone and desktop widths, day and night, with console errors and horizontal overflow.
// Run: node hcig-v6/scripts/shots.mjs [url] [outDir]
//   default url: the local home check page (serve the repo root on 127.0.0.1:8798 first)
// Output: <outDir>/<name>-<width>-<theme>.png (full page) and a short report in the console.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const url = process.argv[2] || "http://127.0.0.1:8798/hcig-v6/canvas/preview/home.html";
const out = process.argv[3] || join(process.env.TEMP || ".", "hcig-v6-shots");
const exe = join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe");
const widths = [{ w: 1440, h: 900 }, { w: 390, h: 844 }, { w: 360, h: 780 }];
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: exe });
for (const { w, h } of widths) {
  for (const theme of ["day", "night"]) {
    if (w === 360 && theme === "night") continue;
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    // the Next site keeps the hero theme in localStorage; the old check pages had a night file
    if (!url.includes("home.html")) await page.addInitScript((t) => { try { localStorage.setItem("hcig-theme", t); } catch {} }, theme);
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(theme === "night" && url.includes("home.html") ? url.replace("home.html", "home-night.html") : url, { waitUntil: "networkidle" });
    // scroll through so reveals and lazy images run, then back to the top
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += Math.round(h * 0.8)) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(140); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1800);
    const overflow = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((el) => { const r = el.getBoundingClientRect(); return r.right > window.innerWidth + 1 && getComputedStyle(el).position !== "fixed" && !el.closest(".marquee"); }).slice(0, 5).map((el) => el.className || el.tagName));
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src")).slice(0, 8));
    const file = join(out, `home-${w}-${theme}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${w} ${theme}: ${file}\n  errors: ${errors.length ? errors.slice(0, 3).join(" | ") : "none"}\n  overflow: ${overflow.length ? overflow.join(", ") : "none"}\n  broken images: ${broken.length ? broken.join(", ") : "none"}`);
    await page.close();
  }
}
await browser.close();
