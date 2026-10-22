// healthcareig.com home v2 (his brief 2026-10-22, copy in COPY.md): the chosen hero and the approved group section,
// then every other section remade. Each section is a part in ./parts/<id>.part.mjs:
//   export default ({ B, kit }) => ({ css, body, vals, extraJs, h, ph })
// css and body use one class prefix; vals returns { rootRef, cls: <kit.CLS>, ... }; h and ph are the board heights at
// 1440 and 390. Missing parts are skipped, so parts can arrive one by one.
// Run after the hero, film and section builders:  node hcig-v3/canvas/home2/build-home2.mjs <live canvas.json>
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as kit from "./kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "heroes", "project");
const B = JSON.parse(readFileSync(join(HERE, "..", "heroes", "blobs.json"), "utf8"));
const PAGE = "home2";

// the order of the page (COPY.md); comp: an existing component, part: a v2 part file
const ORDER = [
  { id: "hero", title: "1 · Hero B with the group film (your pick)", comp: "HeroBFilm", h: 900, ph: 1050 },
  { id: "numbers", title: "2 · The group in numbers", part: "numbers" },
  { id: "who", title: "3 · Who we are", part: "who" },
  { id: "group", title: "4 · Our Premises and Facilities (approved)", comp: "GroupFilm", h: 1225, ph: 1290 },
  { id: "journey", title: "5 · The patient journey", part: "journey" },
  { id: "deliver", title: "6 · What we deliver", part: "deliver" },
  { id: "partners", title: "7 · For partners", part: "partners" },
  { id: "reach", title: "8 · Global reach", part: "reach" },
  { id: "voices", title: "9 · Voices", part: "voices" },
  { id: "cta", title: "10 · Partner with us, and the footer", part: "cta" },
];

const rows = [], parts = [];
for (const r of ORDER) {
  let comp = r.comp, h = r.h, ph = r.ph;
  if (r.part) {
    const f = join(HERE, "parts", `${r.part}.part.mjs`);
    if (!existsSync(f)) continue;
    const mk = (await import(pathToFileURL(f).href)).default;
    const s = mk({ B, kit });
    comp = `V2${r.part[0].toUpperCase()}${r.part.slice(1)}`;
    h = s.h; ph = s.ph;
    writeFileSync(join(OUT, `${comp}.dc.html`), kit.page(`HCIG home v2, ${r.title}`, s.css, s.body, kit.THEME_PROP(h), s.vals, s.extraJs || ""));
    parts.push([`${comp}.dc.html`, h, r.title]);
  }
  const f = `N2${r.id[0].toUpperCase()}${r.id.slice(1)}`;
  for (const [t, th] of [["Night", "dark"], ["Day", "light"]]) {
    kit.wrap(OUT, comp, `${f}${t}.dc.html`, `HCIG home v2, ${r.title}, ${t.toLowerCase()}`, 1440, h, th);
    kit.wrap(OUT, comp, `${f}Phone${t}.dc.html`, `HCIG home v2, ${r.title}, phone, ${t.toLowerCase()}`, 390, ph, th);
  }
  rows.push({ ...r, f, h, ph });
}

// the canvas index: the page "New home (v2)", everything else kept exactly
const c = JSON.parse(readFileSync(process.argv[2] || join(OUT, "canvas.json"), "utf8"));
for (const k of Object.keys(c.boards)) if (c.boards[k].page === PAGE || c.boards[k].page === "parts2") { delete c.boards[k]; c.order = c.order.filter((o) => o !== k); }
for (const k of Object.keys(c.notes)) if (c.notes[k].page === PAGE) delete c.notes[k];
c.pages = c.pages.filter((p) => p.id !== PAGE && p.id !== "parts2");
c.pages.unshift({ id: PAGE, name: "New home (v2)" });
c.pages.push({ id: "parts2", name: "Parts v2 (section components)" });
c.launch = { view: "canvas", page: PAGE };
let y = 0;
rows.forEach((r, i) => {
  const short = r.title.replace(" · ", " ").replace(/ \(.*\)$/, "");
  const add = (file, b) => { c.boards[file] = { ...b, is_interactive: true, page: PAGE }; c.order.push(file); };
  // day is the default theme (his note 2026-10-22): day boards first
  add(`${r.f}Day.dc.html`, { x: 0, y, w: 1440, h: r.h, title: `${short} · day` });
  add(`${r.f}Night.dc.html`, { x: 1520, y, w: 1440, h: r.h, title: `${short} · night` });
  add(`${r.f}PhoneDay.dc.html`, { x: 3040, y, w: 390, h: r.ph, title: `${short} · phone day` });
  add(`${r.f}PhoneNight.dc.html`, { x: 3510, y, w: 390, h: r.ph, title: `${short} · phone night` });
  c.notes[`h2row${i}`] = { x: 0, y: y - 250, text: r.title, kind: "title1", maxW: 3900, page: PAGE };
  y += Math.max(r.h, r.ph) + 120 + 250;
});
const NOTE = [
  "New home (v2)", "",
  "Your brief: less content, more structure, meaning; know us just by looking. Hero B with the film and the group section stay; every other section is remade.", "",
  "The order: hero, the group in numbers, who we are, the group, the patient journey, what we deliver, for partners, global reach, voices, partner with us.", "",
  "Every fact comes from the live site. Copy is shorter and edited. Brand colours and fonts only.",
  "Press Play on a board to see the motion.",
];
c.notes.h2Note = { x: 4040, y: 0, w: 460, maxH: 1100, size: "m", fill: "yellow", page: PAGE, text: NOTE.join(String.fromCharCode(10)) };
let py = 0;
for (const [file, h, title] of parts) { c.boards[file] = { x: 0, y: py, w: 1440, h, title: `${title}, the component`, is_interactive: true, page: "parts2" }; c.order.push(file); py += h + 370; }
writeFileSync(join(OUT, "canvas.json"), JSON.stringify(c, null, 2));
console.log("home v2:", rows.length, "rows,", parts.length, "parts; pages", c.pages.map((p) => p.id).join(","));
