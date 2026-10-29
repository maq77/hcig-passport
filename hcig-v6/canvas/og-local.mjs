// Renders the round 11 share cards locally (real fonts and media) to PNG for a check before the canvas, and later the
// picked card to the final file.   node hcig-v6/canvas/og-local.mjs [out-dir] [card]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { css, cards } from "./og-cards.mjs";

const V6 = join(dirname(fileURLToPath(import.meta.url)), "..");
const M = JSON.parse(readFileSync(join(V6, "public/media/manifest.json"), "utf8"));
const FILES = { helma: "helma.woff2", "og-silk": "og-silk.webp", "og-coast": "og-coast.webp", "og-map": "og-map.webp", "og-scmg": "og-scmg.png", "og-dmwv": "og-dmwv.png", "og-uca": "og-uca.png", "og-uca-us": "og-uca-us.png", "og-uca-seal": "og-uca-seal.png", "brand-mavie": "brand-mavie.png" };
// final file: node canvas/og-local.mjs <dir> s4 --final  writes <dir>/og-hcig.jpg (1200 x 630)
// the share image's own pieces live in canvas/og-assets (not shipped with the site); the rest are site media
const asset = (k) => pathToFileURL(k.startsWith("og-") ? join(V6, "canvas/og-assets", FILES[k]) : join(V6, "public/media", FILES[k] || M[k].file)).href;
const OUT = process.argv[2] || join(V6, "..", ".playwright-mcp");
const only = process.argv[3];
const C = cards(asset);
const b = await chromium.launch({ executablePath: join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe") });
const pg = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
for (const [k, html] of Object.entries(C)) {
  if (only && k !== only) continue;
  const f = join(OUT, `og-${k}.html`);
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"><style>body{margin:0}${css(asset)}</style></head><body>${html}</body></html>`);
  await pg.goto(pathToFileURL(f).href, { waitUntil: "networkidle" });
  await pg.evaluate(() => document.fonts.ready);
  if (process.argv.includes("--final")) {
    await pg.setViewportSize({ width: 1200, height: 630 });
    const b2 = await pg.screenshot({ type: "png" }); writeFileSync(join(OUT, "og-hcig-2x.png"), b2);
  } else await pg.screenshot({ path: join(OUT, `og-${k}.png`) });
  console.log("og", k);
}
await b.close();
