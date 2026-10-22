// Local render check for the hero boards: each .dc.html becomes a plain page with local assets.
// Heroes with night and day are written twice: HeroX.html (night) and HeroXLight.html (day). Run: node hcig-v3/canvas/heroes/preview.mjs,
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
for (const f of readdirSync(join(HERE, "project")).filter((f) => /^(Hero([A-Z]|B\d|BFilm)|GroupFilm|Sec\d+\w+)\.dc\.html$/.test(f))) {
  if (/\{\{themeCls\}\}|\{\{cls\}\}/.test(readFileSync(join(HERE, "project", f), "utf8"))) jobs.push([f, "dark", f.replace(".dc", "")], [f, "light", f.replace(".dc.html", "Light.html")]);
  else jobs.push([f, "", f.replace(".dc", "")]);
}
// Brand-in-the-picture options of B and D: A, B, C as named in the hero's mark tweak.
const MK = { "HeroB.dc.html": { A: "beacon", B: "network", C: "watermark" }, "HeroD.dc.html": { A: "glass-logo", B: "glass-mark", C: "watermark" } };
for (const f of Object.keys(MK)) for (const mk of ["A", "B", "C"]) jobs.push([f, "dark", f.replace(".dc.html", "-" + mk + ".html"), mk], [f, "light", f.replace(".dc.html", "-" + mk + "Light.html"), mk]);
for (const [f, theme, outName, mk] of jobs) {
  let s = readFileSync(join(HERE, "project", f), "utf8");
  // the film boards: the night or day video by theme, and autoplay where the canvas starts it from code
  s = s.replace(/<sc-if value="\{\{is(Dark|Light)\}\}" hint-placeholder-val="\{\{ (?:true|false) \}\}">([\s\S]*?)<\/sc-if>/g, (m, k, inner) => ((k === "Light") === (theme === "light") ? inner : "")).replace(/ muted=""/g, ' muted="" autoplay=""');
  if (mk) s = s.replace(/<sc-if value="\{\{mk(\w+)\}\}" hint-placeholder-val="\{\{ (?:true|false) \}\}">([\s\S]*?)<\/sc-if>/g, (m, k, inner) => (k === mk || (k === "Plain" && mk === "C") ? inner : "")).replace(/\{\{mkCls\}\}/g, "mk-" + MK[f][mk]);
  const shade = (/"shade":\{[^}]*"default":([\d.]+)/.exec(s) || [0, "1"])[1];
  const helmet = /<helmet>([\s\S]*?)<\/helmet>/.exec(s)[1];
  s = s.replace(/<helmet>[\s\S]*?<\/helmet>/, "").replace('<script src="./support.js"></script>', helmet);
  s = s.replace(/<script type="text\/x-dc"[\s\S]*?<\/script>/, "").replace(/<\/?x-dc>/g, "");
  s = s.replace(/<sc-if value="\{\{[^}]*\}\}" hint-placeholder-val="\{\{ (true|false) \}\}">([\s\S]*?)<\/sc-if>/g, (m, v, inner) => (v === "true" ? inner : ""));
  s = s.replace(/ onClick="\{\{[^}]*\}\}"/g, "").replace(/\{\{shade\}\}/g, shade).replace(/\{\{themeCls\}\}/g, theme).replace(/\{\{cls\}\}/g, theme).replace(/\{\{n1\}\}/g, "40").replace(/\{\{n2\}\}/g, "600K").replace(/\{\{n3\}\}/g, "350").replace(/\{\{modeCls\}\}/g, "mode-section").replace(/\{\{[^}]*\}\}/g, "");
  s = s.replace(/\/_blob\/[0-9a-f]{32}/g, (m) => local[m] || m);
  writeFileSync(join(OUT, outName), s);
  console.log(outName, "unresolved:", (s.match(/\{\{|<sc-if|\/_blob\//g) || []).length);
}
