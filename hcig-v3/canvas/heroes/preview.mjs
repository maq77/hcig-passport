// Local render check for the hero boards: each .dc.html becomes a plain page with local assets.
// B1 and B2 are written twice, dark and light. Run: node hcig-v3/canvas/heroes/preview.mjs,
// serve hcig-v3/ and open /canvas/heroes/preview/HeroA.html
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "preview");
mkdirSync(OUT, { recursive: true });
const B = JSON.parse(readFileSync(join(HERE, "blobs.json"), "utf8"));
const files = readdirSync(join(HERE, "..", "..", "material", "hero-assets"));
const local = {};
for (const [name, url] of Object.entries(B)) local[url] = "/material/hero-assets/" + files.find((f) => f.replace(/\.[^.]+$/, "") === name);

const jobs = [];
for (const f of readdirSync(join(HERE, "project")).filter((f) => /^Hero([A-Z]|B\d)\.dc\.html$/.test(f))) {
  if (/B\d/.test(f)) jobs.push([f, "dark", f.replace(".dc", "")], [f, "light", f.replace(".dc.html", "Light.html")]);
  else jobs.push([f, "", f.replace(".dc", "")]);
}
for (const [f, theme, outName] of jobs) {
  let s = readFileSync(join(HERE, "project", f), "utf8");
  const shade = /"shade":\{[^}]*"default":([\d.]+)/.exec(s)[1];
  const helmet = /<helmet>([\s\S]*?)<\/helmet>/.exec(s)[1];
  s = s.replace(/<helmet>[\s\S]*?<\/helmet>/, "").replace('<script src="./support.js"></script>', helmet);
  s = s.replace(/<script type="text\/x-dc"[\s\S]*?<\/script>/, "").replace(/<\/?x-dc>/g, "");
  s = s.replace(/<sc-if value="\{\{[^}]*\}\}" hint-placeholder-val="\{\{ (true|false) \}\}">([\s\S]*?)<\/sc-if>/g, (m, v, inner) => (v === "true" ? inner : ""));
  s = s.replace(/ onClick="\{\{[^}]*\}\}"/g, "").replace(/\{\{shade\}\}/g, shade).replace(/\{\{themeCls\}\}/g, theme).replace(/\{\{[^}]*\}\}/g, "");
  s = s.replace(/\/_blob\/[0-9a-f]{32}/g, (m) => local[m] || m);
  writeFileSync(join(OUT, outName), s);
  console.log(outName, "unresolved:", (s.match(/\{\{|<sc-if|\/_blob\//g) || []).length);
}
