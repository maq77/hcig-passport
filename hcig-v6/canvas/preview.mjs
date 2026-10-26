// Local check pages: the v6 sections rendered in SITE mode with the real runtime, day and night.
// Run:   node hcig-v6/canvas/preview.mjs
// Serve: python -m http.server 8798 --bind 127.0.0.1   (from the repo root)
// Open:  http://127.0.0.1:8798/hcig-v6/canvas/preview/home.html   (and home-night.html)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as hero from "../src/sections/hero-b.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const V6 = join(HERE, "..");
const ASSETS = JSON.parse(readFileSync(join(HERE, "assets.json"), "utf8"));
const asset = (key) => {
  if (!ASSETS[key]) throw new Error(`unknown asset key: ${key}`);
  return "/" + ASSETS[key];
};
const ctx = { mode: "site", asset, href: (p) => p };

const css = [
  readFileSync(join(V6, "src/styles/tokens.css"), "utf8"),
  readFileSync(join(V6, "src/styles/base.css"), "utf8"),
  hero.css({ asset }),
].join("\n");

const page = (theme) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HCIG v6 local check: home (${theme})</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<style>
@font-face { font-family: 'Helma'; src: url('${asset("helma")}') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
body { margin: 0; }
${css}
</style>
</head>
<body>
<div class="page theme-${theme}">
${hero.heroB(ctx)}
</div>
<script>
${readFileSync(join(V6, "src/runtime/runtime.mjs"), "utf8").replace(/^export /gm, "")}
try { localStorage.removeItem("hcig-theme"); } catch {}
initRuntime();
</script>
</body>
</html>
`;

const OUT = join(HERE, "preview");
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "home.html"), page("day"));
writeFileSync(join(OUT, "home-night.html"), page("night"));
const html = page("day");
const dashes = (html.match(/[–—]/g) || []).length;
console.log("wrote preview/home.html and preview/home-night.html", { bytes: html.length, dashes });
