// Builds the HCIG v6 Claude Design canvas from the same section templates the site uses (canvas mode).
// Run:  node hcig-v6/canvas/build-canvas.mjs
// Then publish with the Artifact tool: root hcig-v6/canvas, file_path project/canvas.json, files project/*.dc.html.
// Before any republish, read the live canvas first: the owner edits boards by hand (pull-canvas step).
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as hero from "../src/sections/hero-b.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const V6 = join(HERE, "..");
const PROJECT = join(HERE, "project");
const BLOBS = JSON.parse(readFileSync(join(HERE, "blobs.json"), "utf8"));
const asset = (key) => {
  if (!BLOBS[key]) throw new Error(`no canvas upload for asset key: ${key} (upload it, then add it to blobs.json)`);
  return BLOBS[key];
};
const ctx = { mode: "canvas", asset, href: () => "#" };

const css = [
  readFileSync(join(V6, "src/styles/tokens.css"), "utf8"),
  readFileSync(join(V6, "src/styles/base.css"), "utf8"),
  hero.css({ asset }),
].join("\n");

const LOGIC = `class Component extends DCLogic {
  renderVals() {
    const s = this.state || {};
    const set = (o) => this.setState(o);
    const theme = s.theme || this.props.theme || 'day';
    const motion = this.props.motion ?? true;
    return {
      themeCls: theme === 'night' ? 'theme-night' : 'theme-day',
      swCls: s.theme ? 'sw' : '',
      stillCls: motion ? '' : 'still',
      themeLabel: theme === 'night' ? 'Switch to day' : 'Switch to night',
      themePressed: theme === 'night' ? 'false' : 'true',
      toggleTheme: () => set({ theme: theme === 'night' ? 'day' : 'night', menu: false, lang: false }),
      shade: this.props.shade ?? 0.6,
      menuOpen: !!s.menu, menuShut: !s.menu, menuExp: s.menu ? 'true' : 'false',
      toggleMenu: () => set({ menu: !s.menu, lang: false }),
      closeMenu: () => set({ menu: false }),
      langOpen: !!s.lang, langExp: s.lang ? 'true' : 'false',
      toggleLang: () => set({ lang: !s.lang }),
      openSheet: () => set({ menu: false, lang: false })
    };
  }
}`;

const PROPS = {
  theme: { editor: "enum", options: ["day", "night"], default: "day", section: "Theme" },
  shade: { editor: "range", min: 0, max: 1, step: 0.05, default: 0.6, section: "Hero" },
  motion: { editor: "boolean", default: true, section: "Motion" },
  $preview: { width: 1440, height: 900 },
};

const board = ({ title, body, props, logic }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap">
<style>
@font-face { font-family: 'Helma'; src: url('${asset("helma")}') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
body { margin: 0; }
${css}
</style>
</helmet>
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${JSON.stringify(props)}'>
${logic}
</script>
</body>
</html>
`;

const wrap = (importName, title, width, height, attrs = "", vals = "{}") => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet><style>body{margin:0}</style></helmet>
<div style="width:${width}px;min-height:${width < 600 ? 844 : 900}px;background:#FFFFFF;font-family:'Inter',system-ui,sans-serif;color:#000000">
<dc-import name="${importName}"${attrs} hint-size="${width}px,${width < 600 ? 844 : 900}px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${width},"height":${height}}}'>
class Component extends DCLogic {
  renderVals() { return ${vals}; }
}
</script>
</body>
</html>
`;

// Boards. Home grows section by section; the phone board imports it at 390 px.
const BOARDS = {
  // The real page lives in Home.dc.html. Top-level boards freeze entrance animations at their start in the static
  // canvas view, so the boards he looks at import it (as v3 did with its Night/Day wrappers).
  "Home.dc.html": {
    file: board({
      title: "HCIG v6, Home (source board)",
      body: `<div class="page {{themeCls}} {{swCls}} {{stillCls}}">
${hero.heroB(ctx)}
</div>`,
      props: PROPS,
      logic: LOGIC,
    }),
    entry: { x: 0, y: 0, w: 1440, h: 900, title: "Home source (edit here)", page: "parts", is_interactive: true },
  },
  "Main.dc.html": {
    file: wrap("Home", "HCIG v6, Home, desktop", 1440, 900, ' motion="{{motionOff}}"', "{ motionOff: false }"), // static frame on the canvas; motion plays in Play and on the site
    entry: { x: 0, y: 0, w: 1440, h: 900, title: "Home, desktop (day; press the moon for night)", page: "home", is_interactive: true },
  },
  "HomePhone.dc.html": {
    file: wrap("Home", "HCIG v6, Home, phone", 390, 1000),
    entry: { x: 1520, y: 0, w: 390, h: 1000, title: "Home, phone 390", page: "home", is_interactive: true },
  },
};

mkdirSync(PROJECT, { recursive: true });
const indexPath = join(PROJECT, "canvas.json");
const index = existsSync(indexPath)
  ? JSON.parse(readFileSync(indexPath, "utf8"))
  : { v: 3, createdOnFiles: { v: 1, at: new Date().toISOString() }, title: "HCIG v6", launch: { view: "canvas", page: "home" }, pages: [], boards: {}, order: [], notes: {}, designSystems: [] };
const pages = [{ id: "home", name: "Home" }, { id: "parts", name: "Source boards" }];
for (const p of pages) if (!index.pages.find((x) => x.id === p.id)) index.pages.push(p);
for (const [name, b] of Object.entries(BOARDS)) {
  writeFileSync(join(PROJECT, name), b.file);
  index.boards[name] = { ...(index.boards[name] || {}), ...b.entry };
  if (!index.order.includes(name)) index.order.push(name);
}
writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");
const main = BOARDS["Home.dc.html"].file;
console.log("boards:", Object.keys(BOARDS).join(", "));
console.log("Home.dc.html", main.length, "bytes; unresolved local paths:", (main.match(/\/hcig-v3\//g) || []).length, "; dashes:", (main.match(/[–—]/g) || []).length);
