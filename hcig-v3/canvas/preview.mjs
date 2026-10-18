// Local render check for the canvas boards: turns each .dc.html into a plain HTML page with local assets,
// so a real browser can measure heights and report errors before Mohamed sees the canvas.
// Run: node hcig-v3/canvas/preview.mjs, then serve hcig-v3/ and open /canvas/preview/<name>.html
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "preview");
mkdirSync(OUT, { recursive: true });
const BLOBS = JSON.parse(readFileSync(join(HERE, "blobs.json"), "utf8"));

for (const name of ["Main", "Noir", "Hybrid"]) {
  let s = readFileSync(join(HERE, "project", `${name}.dc.html`), "utf8");
  const helmet = /<helmet>([\s\S]*?)<\/helmet>/.exec(s)[1];
  s = s.replace(/<helmet>[\s\S]*?<\/helmet>/, "");
  s = s.replace('<script src="./support.js"></script>', helmet);
  s = s.replace(/<script type="text\/x-dc"[\s\S]*?<\/script>/, "");
  s = s.replace(/<\/?x-dc>/g, "");
  // default state: keep a branch whose placeholder value is true, drop the rest
  s = s.replace(/<sc-if value="\{\{[^}]*\}\}" hint-placeholder-val="\{\{ (true|false) \}\}">([\s\S]*?)<\/sc-if>/g, (m, v, inner) => (v === "true" ? inner : ""));
  s = s.replace(/ on(Click|Submit)="\{\{[^}]*\}\}"/g, "");
  s = s.replace(/\{\{tabAClass\}\}/g, "on").replace(/\{\{svcCls0\}\}/g, "open");
  s = s.replace(/\{\{[^}]*\}\}/g, "");
  s = s.replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => (BLOBS[id] ? `/material/canvas-assets/${BLOBS[id]}` : m));
  writeFileSync(join(OUT, `${name}.html`), s);
  const left = (s.match(/\{\{|<sc-if|\/_blob\//g) || []).length;
  console.log(`${name}.html written, unresolved tokens: ${left}`);
}
