// Does the home hero fit the first screen? For each real device size: where the last hero button ends, where the
// hero ends and where About begins, against the screen height. Also: overflow, header overlap with the first line.
//   node scripts/hero-fit.mjs [lang]        (serves out/ and out-langs/ at /hcig/v6, like check-pages.mjs)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const V6 = fileURLToPath(new URL("../", import.meta.url));
const lang = process.argv[2] && process.argv[2] !== "en" ? process.argv[2] + "/" : "";
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".txt": "text/plain" };
const s = createServer(async (q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]).replace(/^\/hcig\/v6/, "");
  let base = join(V6, "out");
  const m = p.match(/^\/(de|pl|fr|it|es|cs)(\/.*)$/);
  if (m) { base = join(V6, "out-langs", m[1]); p = m[2]; }
  let f = join(base, p);
  try { if ((await stat(f)).isDirectory()) f = join(f, "index.html"); } catch {}
  try { const b = await readFile(f); r.writeHead(200, { "content-type": T[extname(f)] || "application/octet-stream" }); r.end(b); } catch { r.writeHead(404); r.end(); }
}).listen(0);
export const DEVICES = [
  ["iPhone SE", 375, 667], ["Galaxy S8", 360, 740], ["small Android", 360, 800], ["iPhone 13 mini", 375, 812],
  ["iPhone 15", 393, 852], ["iPhone 14", 390, 844], ["Pixel 7", 412, 915], ["iPhone 15 Pro Max", 430, 932],
  ["iPad mini", 768, 1024], ["iPad Air", 820, 1180], ["iPad landscape", 1024, 768], ["laptop 1280", 1280, 720],
  ["laptop 1366", 1366, 768], ["laptop 1440", 1440, 900], ["desktop 1536", 1536, 864], ["desktop 1920", 1920, 1080], ["desktop 2560", 2560, 1440],
];
const b = await chromium.launch({ executablePath: join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe") });
const shots = process.env.SHOTS;
for (const [name, w, h] of DEVICES) {
  const pg = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 900, hasTouch: w < 900 });
  // NIGHT=1 measures the night hero (the theme lives in localStorage)
  if (process.env.NIGHT) await pg.addInitScript((k) => { try { localStorage.setItem(k, "night"); } catch {} }, process.env.STORE_KEY);
  await pg.goto(`http://127.0.0.1:${s.address().port}/hcig/v6/${lang}`, { waitUntil: "networkidle" });
  await pg.waitForTimeout(2200);
  const r = await pg.evaluate(() => {
    const q = (sel) => document.querySelector(sel)?.getBoundingClientRect();
    const btns = [...document.querySelectorAll(".hero .ctas > *")].map((e) => e.getBoundingClientRect());
    const hd = document.querySelector(".hd-in")?.getBoundingClientRect();
    const first = document.querySelector(".hero .cred") || document.querySelector(".hero h1");
    const about = document.querySelector("main section");
    return {
      lastBtn: Math.round(Math.max(...btns.map((x) => x.bottom))),
      heroEnd: Math.round(q(".hero").bottom),
      about: Math.round(about.getBoundingClientRect().top),
      first: Math.round(first.getBoundingClientRect().top),
      hdBottom: Math.round(hd?.bottom ?? 0),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: Math.round(q(".hero h1").height),
    };
  });
  // phones: the last button within 140 px of the fold; desktops: inside the screen (the words are centred there)
  const ok = r.lastBtn <= h && (w > 900 || r.lastBtn >= h - 140) && r.heroEnd <= h + 1 && r.first >= r.hdBottom + 8 && !r.overflow;
  console.log(`${ok ? "OK " : "BAD"} ${name.padEnd(18)} ${w}x${h}  buttons end ${r.lastBtn} (gap to fold ${h - r.lastBtn})  hero ends ${r.heroEnd}  About at ${r.about}  first line ${r.first} under header ${r.hdBottom}  h1 ${r.h1}  overflow ${r.overflow}`);
  if (shots) await pg.screenshot({ path: join(shots, `hero-${w}x${h}.png`) });
  await pg.close();
}
await b.close();
s.close();
