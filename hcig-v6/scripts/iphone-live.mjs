// The live preview on iPhones, in WebKit (the engine of Safari on every iPhone), with Playwright's iPhone profiles:
// the screen area Safari really leaves with its bars shown, touch, the iPhone user agent and pixel density.
// Checks the home hero (both buttons on the first screen), the menu (Talk to our team visible), the film (opens full
// width, closes), the day and night switch, sideways overflow and errors.   node scripts/iphone-live.mjs [lang]
import { webkit, devices } from "playwright-core";
import { join } from "node:path";

const BASE = "https://hcig-passport.vercel.app/hcig/v6/";
const lang = process.argv[2] && process.argv[2] !== "en" ? process.argv[2] + "/" : "";
const OUT = process.env.SHOTS;
const PHONES = ["iPhone SE (3rd gen)", "iPhone 13 mini", "iPhone 14", "iPhone 15", "iPhone 15 Pro Max"];
const b = await webkit.launch();
let bad = 0;
for (const name of PHONES) {
  const d = devices[name];
  if (!d) { console.log(`${name}: no profile`); continue; }
  const ctx = await b.newContext({ ...d });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  await pg.goto(`${BASE}${lang}?r=${Date.now()}`, { waitUntil: "load", timeout: 60000 });
  await pg.waitForTimeout(2600);
  const H = d.viewport.height;
  const hero = await pg.evaluate(() => {
    const btns = [...document.querySelectorAll(".hero .ctas > *")].map((e) => e.getBoundingClientRect());
    const hidden = [...document.querySelectorAll(".hero .copy > *")].filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.95).length;
    return { last: Math.round(Math.max(...btns.map((r) => r.bottom))), first: Math.round(btns[0]?.top ?? 0), hidden, over: document.documentElement.scrollWidth - innerWidth, hero: Math.round(document.querySelector(".hero").getBoundingClientRect().bottom) };
  });
  if (OUT) { await pg.evaluate(() => document.querySelectorAll("video").forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); })); await pg.screenshot({ path: join(OUT, `iphone-${d.viewport.width}x${H}-${lang.replace("/", "") || "en"}.png`) }); }
  // menu
  await pg.tap(".menu-btn"); await pg.waitForTimeout(1500);
  const menu = await pg.evaluate(() => { const c = document.querySelector(".menu-cta").getBoundingClientRect(); return Math.round(c.bottom); });
  await pg.tap(".menu-x"); await pg.waitForTimeout(900);
  // film
  await pg.tap(".hf-chip"); await pg.waitForTimeout(1200);
  const film = await pg.evaluate(() => { const d = document.querySelector(".film-dlg"); const v = d.querySelector("video")?.getBoundingClientRect(); return { open: d.open, w: Math.round(v?.width ?? 0), src: (d.querySelector("video")?.src || "").split("/").pop() }; });
  await pg.tap(".dlg-close"); await pg.waitForTimeout(800);
  const closed = await pg.evaluate(() => !document.querySelector(".film-dlg").open);
  // day and night
  await pg.tap(".theme-btn"); await pg.waitForTimeout(2800);
  const night = await pg.evaluate(() => document.querySelector(".hero").classList.contains("theme-night"));
  const ok = hero.last <= H && hero.hidden === 0 && hero.over <= 0 && menu <= H && film.open && film.w >= d.viewport.width - 2 && closed && night && !errs.length;
  if (!ok) bad++;
  console.log(`${ok ? "OK " : "BAD"} ${name.padEnd(18)} ${d.viewport.width}x${H}  buttons ${hero.first}-${hero.last} (screen ${H})  hero ends ${hero.hero}  hidden ${hero.hidden}  sideways ${hero.over}  | menu button ends ${menu}  | film open ${film.open} width ${film.w} (${film.src}) closes ${closed}  | night ${night}  | errors ${errs.length ? errs.join("; ") : "none"}`);
  await ctx.close();
}
console.log(bad ? `${bad} iPhone(s) with problems` : "all iPhones pass");
await b.close();
