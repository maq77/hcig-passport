import { createServer } from "node:http"; import { readFile, stat } from "node:fs/promises"; import { extname, join } from "node:path"; import { chromium } from "playwright-core";
const V6 = "D:/Healthcare international group/hcig-v6/"; const D = "D:/Healthcare international group/.playwright-mcp/";
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4" };
const s = createServer(async (q, r) => { let p = decodeURIComponent(q.url.split("?")[0]).replace(/^\/hcig\/v6/, ""); let f = join(V6 + "out", p); try { if ((await stat(f)).isDirectory()) f = join(f, "index.html"); } catch {} try { const b = await readFile(f); r.writeHead(200, { "content-type": T[extname(f)] || "application/octet-stream" }); r.end(b); } catch { r.writeHead(404); r.end(); } }).listen(0);
const b = await chromium.launch({ executablePath: join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe") });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; pg.on("pageerror", (e) => errs.push(String(e))); pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
await pg.goto(`http://127.0.0.1:${s.address().port}/hcig/v6/`, { waitUntil: "networkidle" }); await pg.waitForTimeout(2500);
// 1) the hero background no longer moves with scroll
const bgBefore = await pg.evaluate(() => document.querySelector(".hero .bg").getBoundingClientRect().top + scrollY);
await pg.evaluate(() => scrollTo(0, 400)); await pg.waitForTimeout(400);
const bgAfter = await pg.evaluate(() => document.querySelector(".hero .bg").getBoundingClientRect().top + scrollY);
console.log("hero background drift on scroll:", Math.round(bgAfter - bgBefore), "px (0 = still)");
// 2) animations that still run: are they all transform/opacity?
console.log("height animation on:", await pg.evaluate(() => document.getAnimations().filter((a) => (a.effect?.getKeyframes?.() || []).some((f) => "height" in f)).map((a) => { const t = a.effect.target; return `${t.tagName}.${[...t.classList].join(".")} ${a.constructor.name} ${a.transitionProperty || ""}`; })));
const anims = await pg.evaluate(() => document.getAnimations().map((a) => { const k = a.effect?.getKeyframes?.() || []; const props = [...new Set(k.flatMap((f) => Object.keys(f).filter((x) => !["offset", "easing", "composite", "computedOffset"].includes(x))))]; return `${a.animationName || "js"}:${props.join("+")}`; }));
const bad = [...new Set(anims)].filter((a) => !/:(transform|opacity|translate|scale|rotate)(\+(transform|opacity|translate|scale|rotate))*$/.test(a));
console.log("running animations:", [...new Set(anims)].length, "| not on the graphics card:", bad.length ? bad.join(", ") : "none");
// 3) frames while scrolling the whole home (rAF gaps over 34 ms = a visible stutter)
await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(300);
const fr = await pg.evaluate(async () => { const gaps = []; let last = performance.now(), run = true; const tick = (t) => { gaps.push(t - last); last = t; if (run) requestAnimationFrame(tick); }; requestAnimationFrame(tick); const H = document.documentElement.scrollHeight; for (let y = 0; y < Math.min(H, 9000); y += 60) { scrollTo(0, y); await new Promise((r) => requestAnimationFrame(r)); } run = false; const slow = gaps.filter((g) => g > 34).length; return { frames: gaps.length, slow, worst: Math.round(Math.max(...gaps)) }; });
console.log("scrolling the home:", fr.frames, "frames,", fr.slow, "slow (>34 ms), worst", fr.worst, "ms");
// 4) day to night switch: frames during the crossfade
await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(600);
const sw = await pg.evaluate(async () => { const gaps = []; let last = performance.now(), run = true; const tick = (t) => { gaps.push(t - last); last = t; if (run) requestAnimationFrame(tick); }; requestAnimationFrame(tick); document.querySelector(".theme-btn, button[aria-label*='night' i]")?.click(); await new Promise((r) => setTimeout(r, 2600)); run = false; const top = document.documentElement.scrollTop; return { frames: gaps.length, slow: gaps.filter((g) => g > 34).length, worst: Math.round(Math.max(...gaps)), pageMoved: top }; });
console.log("day to night:", sw.frames, "frames,", sw.slow, "slow, worst", sw.worst, "ms, page moved", sw.pageMoved, "px");
await pg.screenshot({ path: D + "m-night.png" });
// 5) the film player: centred on desktop, eased
await pg.click(".hf-thumb"); await pg.waitForTimeout(80);
const early = await pg.evaluate(() => getComputedStyle(document.querySelector(".film-dlg video")).opacity);
await pg.waitForTimeout(800);
const pos = await pg.evaluate(() => { const v = document.querySelector(".film-dlg video").getBoundingClientRect(); return { l: Math.round(v.left), r: Math.round(innerWidth - v.right), t: Math.round(v.top), b: Math.round(innerHeight - v.bottom), w: Math.round(v.width), op: getComputedStyle(document.querySelector(".film-dlg video")).opacity }; });
console.log("film player: opacity at 80 ms", early, "then", pos.op, "| gaps left/right", pos.l, pos.r, "top/bottom", pos.t, pos.b, "width", pos.w);
await pg.evaluate(() => document.querySelectorAll("video").forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); }));
await pg.screenshot({ path: D + "m-player.png" });
await pg.keyboard.press("Escape"); await pg.waitForTimeout(120);
const closing = await pg.evaluate(() => ({ open: document.querySelector(".film-dlg").open }));
await pg.waitForTimeout(600);
console.log("Esc: still open (fading) at 120 ms", closing.open, "| closed after", !(await pg.evaluate(() => document.querySelector(".film-dlg").open)));
// 6) the route dots that now slide
await pg.evaluate(() => { const e = document.querySelector(".route") || document.querySelector(".mj-flow"); if (e) scrollTo(0, e.getBoundingClientRect().top + scrollY - 300); }); await pg.waitForTimeout(1500);
await pg.screenshot({ path: D + "m-route.png" });
console.log("overflow", await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth), "| errors", errs.length ? errs : "none");
await b.close(); s.close();
