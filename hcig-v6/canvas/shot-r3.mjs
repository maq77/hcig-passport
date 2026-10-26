// Local check of the round-3 option boards: one screenshot per board at its own size, after 2 s of motion.
import { chromium } from "playwright-core";
import { readdirSync } from "node:fs";
import { join } from "node:path";
const exe = join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe");
const out = process.argv[2];
const browser = await chromium.launch({ executablePath: exe });
for (const f of readdirSync(new URL("./preview/r3/", import.meta.url)).filter((x) => x.endsWith(".html"))) {
  const w = /About\dd/.test(f) ? 1280 : 390;
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("requestfailed", (r) => errs.push("failed " + r.url().slice(-50)));
  await page.goto(`http://127.0.0.1:8798/hcig-v6/canvas/preview/r3/${f}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.screenshot({ path: join(out, f.replace(".html", ".png")), fullPage: true });
  console.log(f, "scrollWidth", sw, errs.length ? errs.join(" | ") : "ok");
  await page.close();
}
await browser.close();
