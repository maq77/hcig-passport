// Phone menu: is "Talk to our team" visible without scrolling? Heights are what phone browsers really show once their
// toolbars take their share (an iPhone 14 in Safari shows about 660 to 750 px of its 844).
//   node scripts/menu-fit.mjs [lang]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const V6 = fileURLToPath(new URL("../", import.meta.url));
const lang = process.argv[2] && process.argv[2] !== "en" ? process.argv[2] + "/" : "";
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4" };
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
let bad = 0;
for (const [w, h] of [[360, 560], [375, 553], [375, 635], [390, 664], [390, 750], [412, 780], [430, 830], [768, 960]]) {
  const pg = await b.newPage({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
  await pg.goto(`http://127.0.0.1:${s.address().port}/hcig/v6/${lang}`, { waitUntil: "networkidle" });
  await pg.waitForTimeout(800);
  await pg.click(".menu-btn");
  await pg.waitForTimeout(1600);
  const r = await pg.evaluate(() => {
    const m = document.querySelector(".menu"), c = document.querySelector(".menu-cta");
    const cr = c.getBoundingClientRect();
    return { cta: Math.round(cr.bottom), scroll: m.scrollHeight - m.clientHeight, navScroll: (() => { const n = document.querySelector(".menu-nav"); return n ? n.scrollHeight - n.clientHeight : 0; })(), links: Math.round(document.querySelector(".menu-links").getBoundingClientRect().height) };
  });
  const ok = r.cta <= h && r.scroll <= 0 && r.navScroll <= 1;
  if (!ok) bad++;
  console.log(`${ok ? "OK " : "BAD"} ${w}x${h}  button ends ${r.cta} (screen ${h})  menu needs scrolling ${Math.max(0, r.scroll)} px, links list ${Math.max(0, r.navScroll)} px  links ${r.links}`);
  if (process.env.SHOTS) await pg.screenshot({ path: join(process.env.SHOTS, `menu-${w}x${h}.png`) });
  await pg.close();
}
console.log(bad ? `${bad} sizes hide the button` : "all sizes show the button");
await b.close();
s.close();
