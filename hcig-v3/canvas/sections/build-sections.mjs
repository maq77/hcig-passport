// healthcareig.com home, every section on its own boards, in the live order (plan 2026-10-22,
// C:\Users\maqmo\.claude\plans\ancient-squishing-raven.md). Words come from src/hcig-live/index.html, kept exactly.
// He has not chosen a hero yet: every hero option stays on this page as its own boards.
// Run after build-heroes.mjs and build-film-boards.mjs:
//   node hcig-v3/canvas/sections/build-sections.mjs <live canvas.json>
// Writes the section components and wrappers next to the heroes (one canvas) and adds the page "Home, every section".
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { about } from "./about.part.mjs";
import { mission } from "./mission.part.mjs";
import { why } from "./why.part.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "heroes", "project");
const B = JSON.parse(readFileSync(join(HERE, "..", "heroes", "blobs.json"), "utf8"));

// shared look: the brand palette exactly (Black, Dim Gray, Turquoise, White and tints), Helma + Inter, the hero's theme timing
const HEAD = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap">
<style>
@font-face{font-family:'Helma';src:url('/_blob/dd74c2cb45ea68cbd798ea38d33c7729') format('woff2');font-weight:400;font-style:normal;font-display:swap}
body{margin:0}`;
const TOKENS = (cls, name) => `.${cls}{--accent:#12C0C6;--ink:#FFFFFF;--ink2:#DDDDDF;--muted:#BBBCBE;--line:#333333;--paper:#000000;--serif:'Helma',Georgia,'Times New Roman',serif;--sans:'Inter',system-ui,-apple-system,'Segoe UI',Arial,sans-serif;--gutter:clamp(20px,5cqi,80px);--ease:cubic-bezier(.16,1,.3,1);--sweep-ease:cubic-bezier(.45,.05,.35,1);
  container-type:inline-size;container-name:${name};background:var(--paper);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;font-synthesis:none;
  transition:background-color 1.3s var(--sweep-ease) .9s,color 1s var(--sweep-ease) 1s}
.${cls}.light{--ink:#000000;--ink2:#565759;--muted:#565759;--line:#DDDDDF;--paper:#FFFFFF}
.${cls} *{box-sizing:border-box}`;
// reveal on scroll from a visible resting state: nothing hides until the script arms it, so the board is complete at rest
const REVEAL = (cls) => `.${cls}.arm .rv{opacity:0;transform:translateY(22px)}
.${cls}.in .rv{opacity:1;transform:none;transition:opacity .9s var(--ease) calc(var(--d,0) * 1ms),transform 1.1s var(--ease) calc(var(--d,0) * 1ms)}
@media (prefers-reduced-motion:reduce){.${cls} .rv{opacity:1!important;transform:none!important;transition:none!important}}`;
// shared logic: arm the reveal when the section is out of view, play it once when it comes in
const REVEAL_JS = `  componentDidMount() {
    const el = this.root;
    if (!el || !('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    this.setState({ arm: true, p: 0 });
    this.io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      this.io.disconnect();
      this.setState({ inv: true });
      this.t = setTimeout(() => this.count(), 450);
    }, { threshold: 0.18 });
    this.io.observe(el);
  }
  count() {
    const t0 = performance.now(), D = 1700;
    const step = (t) => { const k = Math.min(1, (t - t0) / D); this.setState({ p: 1 - Math.pow(1 - k, 3) }); if (k < 1) this.raf = requestAnimationFrame(step); };
    this.raf = requestAnimationFrame(step);
  }
  componentWillUnmount() { if (this.io) this.io.disconnect(); clearTimeout(this.t); cancelAnimationFrame(this.raf); }`;

const page = (title, css, body, props, vals, js = REVEAL_JS) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
${HEAD}
${css}
</style>
</helmet>
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${JSON.stringify(props)}'>
class Component extends DCLogic {
${js}
  renderVals() {
    const s = this.state || {};
    const theme = this.props.theme === 'light' ? 'light' : 'dark';
    const rootRef = this.rootRef || (this.rootRef = (el) => { this.root = el; });
${vals}
  }
}
</script>
</body>
</html>
`;

// rows of the page, in the live order; heights measured at 1440 and 390 (see the work log)
const H = { hero: 900, heroPh: { B: 1000, D: 1050, J: 860, O: 990, BFilm: 1050 }, about: 1610, aboutPh: 1750, group: 1225, groupPh: 1290, mission: 1300, missionPh: 1380, why: 1970, whyPh: 2640 };

// ---------- 3 · About (about.part.mjs) ----------
const AB = about({ B, TOKENS, REVEAL });
const MV = mission({ B, TOKENS, REVEAL });
const WY = why({ B, TOKENS, REVEAL });
writeFileSync(join(OUT, "Sec06Why.dc.html"), page("HCIG home, 6 Why partners choose HCIG", WY.css, WY.body,
  { theme: { editor: "enum", options: ["dark", "light"], default: "dark", section: "Section" }, $preview: { width: 1440, height: H.why } }, WY.vals));
writeFileSync(join(OUT, "Sec05Mission.dc.html"), page("HCIG home, 5 Mission and vision", MV.css, MV.body,
  { theme: { editor: "enum", options: ["dark", "light"], default: "dark", section: "Section" }, $preview: { width: 1440, height: H.mission } }, MV.vals));
writeFileSync(join(OUT, "Sec03About.dc.html"), page("HCIG home, 3 About", AB.css, AB.body,
  { theme: { editor: "enum", options: ["dark", "light"], default: "dark", section: "Section" }, $preview: { width: 1440, height: H.about } }, AB.vals));

// ---------- wrappers ----------
const wrap = (comp, file, title, w, h, theme, extra = "") => writeFileSync(join(OUT, file), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet><style>body{margin:0}</style></helmet>
<div style="width:${w}px;min-height:${h}px;background:${theme === "light" ? "#FFFFFF" : "#000000"};font-family:'Inter',system-ui,sans-serif;color:${theme === "light" ? "#000000" : "#FFFFFF"}">
<dc-import name="${comp}" theme="${theme}"${extra} hint-size="${w}px,${h}px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`);

// rows of the page, in the live order; heights measured at 1440 and 390 (see the work log)
const rows = [];
const HEROES = [["B", "HeroB", "Hero B · Night Network"], ["D", "HeroD", "Hero D · Boardroom"], ["J", "HeroJ", "Hero J · Marble Noir"], ["O", "HeroO", "Hero O · the original, polished"], ["BFilm", "HeroBFilm", "Hero B with the group film"]];
for (const [id, comp, label] of HEROES) {
  const f = `Home2${id}`;
  wrap(comp, `${f}Night.dc.html`, `HCIG home, ${label}, night`, 1440, H.hero, "dark");
  wrap(comp, `${f}Day.dc.html`, `HCIG home, ${label}, day`, 1440, H.hero, "light");
  wrap(comp, `${f}PhoneNight.dc.html`, `HCIG home, ${label}, phone, night`, 390, H.heroPh[id], "dark");
  wrap(comp, `${f}PhoneDay.dc.html`, `HCIG home, ${label}, phone, day`, 390, H.heroPh[id], "light");
  rows.push({ title: id === "BFilm" ? `2 · ${label} (his pick)` : `2 · ${label} (other option, kept)`, short: `2 ${label.replace("Hero ", "Hero ")}`, f, h: H.hero, ph: H.heroPh[id] });
}
wrap("Sec03About", "Home3AboutNight.dc.html", "HCIG home, 3 About, night", 1440, H.about, "dark");
wrap("Sec03About", "Home3AboutDay.dc.html", "HCIG home, 3 About, day", 1440, H.about, "light");
wrap("Sec03About", "Home3AboutPhoneNight.dc.html", "HCIG home, 3 About, phone, night", 390, H.aboutPh, "dark");
wrap("Sec03About", "Home3AboutPhoneDay.dc.html", "HCIG home, 3 About, phone, day", 390, H.aboutPh, "light");
rows.push({ title: "3 · About: Healthcare International Group", short: "3 About", f: "Home3About", h: H.about, ph: H.aboutPh });
wrap("GroupFilm", "Home4GroupNight.dc.html", "HCIG home, 4 group, night", 1440, H.group, "dark");
wrap("GroupFilm", "Home4GroupDay.dc.html", "HCIG home, 4 group, day", 1440, H.group, "light");
wrap("GroupFilm", "Home4GroupPhoneNight.dc.html", "HCIG home, 4 group, phone, night", 390, H.groupPh, "dark");
wrap("GroupFilm", "Home4GroupPhoneDay.dc.html", "HCIG home, 4 group, phone, day", 390, H.groupPh, "light");
rows.push({ title: "4 · Our Premises and Facilities (approved; hover a company to see its logo)", short: "4 Our Premises and Facilities", f: "Home4Group", h: H.group, ph: H.groupPh });
wrap("Sec05Mission", "Home5MissionNight.dc.html", "HCIG home, 5 Mission and vision, night", 1440, H.mission, "dark");
wrap("Sec05Mission", "Home5MissionDay.dc.html", "HCIG home, 5 Mission and vision, day", 1440, H.mission, "light");
wrap("Sec05Mission", "Home5MissionPhoneNight.dc.html", "HCIG home, 5 Mission and vision, phone, night", 390, H.missionPh, "dark");
wrap("Sec05Mission", "Home5MissionPhoneDay.dc.html", "HCIG home, 5 Mission and vision, phone, day", 390, H.missionPh, "light");
rows.push({ title: "5 · Our mission and our vision", short: "5 Mission and vision", f: "Home5Mission", h: H.mission, ph: H.missionPh });
for (const [t, th] of [["Night", "dark"], ["Day", "light"]]) { wrap("Sec06Why", `Home6Why${t}.dc.html`, `HCIG home, 6 Why partners choose HCIG, ${t.toLowerCase()}`, 1440, H.why, th); wrap("Sec06Why", `Home6WhyPhone${t}.dc.html`, `HCIG home, 6 Why partners choose HCIG, phone, ${t.toLowerCase()}`, 390, H.whyPh, th); }
rows.push({ title: "6 · Why partners choose HCIG", short: "6 Why partners", f: "Home6Why", h: H.why, ph: H.whyPh });

// ---------- the canvas index: the page "Home, every section", everything else kept exactly ----------
const src = process.argv[2] || join(OUT, "canvas.json");
const c = JSON.parse(readFileSync(src, "utf8"));
const PAGE = "home";
for (const k of Object.keys(c.boards)) if (c.boards[k].page === PAGE) { delete c.boards[k]; c.order = c.order.filter((o) => o !== k); }
for (const k of Object.keys(c.notes)) if (c.notes[k].page === PAGE) delete c.notes[k];
c.pages = c.pages.filter((p) => p.id !== PAGE); c.pages.unshift({ id: PAGE, name: "Home, every section" });
c.launch = { view: "canvas", page: PAGE };
let y = 0;
rows.forEach((r, i) => {
  const add = (file, b) => { c.boards[file] = { ...b, is_interactive: true, page: PAGE }; c.order.push(file); };
  add(`${r.f}Night.dc.html`, { x: 0, y, w: 1440, h: r.h, title: `${r.short} · night` });
  add(`${r.f}Day.dc.html`, { x: 1520, y, w: 1440, h: r.h, title: `${r.short} · day` });
  add(`${r.f}PhoneNight.dc.html`, { x: 3040, y, w: 390, h: r.ph, title: `${r.short} · phone night` });
  add(`${r.f}PhoneDay.dc.html`, { x: 3510, y, w: 390, h: r.ph, title: `${r.short} · phone day` });
  c.notes[`home${i}`] = { x: 0, y: y - 250, text: r.title, kind: "title1", maxW: 3900, page: PAGE };
  y += Math.max(r.h, r.ph) + 120 + 250;
});
c.notes.homeNote = { x: 4040, y: 0, w: 460, maxH: 1300, size: "m", fill: "yellow", page: PAGE, text: "Home, every section\n\nThe home in the live order, one row per section: night, day, phone night, phone day. Every word is the live text.\n\n2 Hero: your pick is B with the group film. The other four stay as kept options.\n3 About: redesigned for reading: the record, the three numbers early, the photo beside the model, the three points as tiles, the statement to close.\n4 Our Premises and Facilities: approved. Hover a company to see its logo; on phones each name carries its logo.\n5 Our mission and our vision: new.\n6 Why partners choose HCIG: new, our own icons that draw in, Gemini images.\n\nWhen every section is done they merge into the final website.\nPress Play on a board to see the motion." };
c.notes.homeOpen = { x: 4040, y: 1400, w: 460, maxH: 700, size: "m", fill: "orange", page: PAGE, text: "Open items from the live site\n\n1. The About heading is blank on the live site (a script breaks). Your pick: Healthcare International Group.\n2. The two closing buttons, Become a Partner and Request a Consultation, point nowhere.\n3. The insurer band shows 100% with an empty second line.\n4. The live footer reads 2026 Healthcare International Group. All Rights Reserved. without a ©." };
// the section components themselves: every .dc.html shows on the canvas, so they get their own page (edit there, every board follows)
c.pages = c.pages.filter((p) => p.id !== "parts"); c.pages.push({ id: "parts", name: "Parts (section components)" });
const PARTS = [["Sec03About.dc.html", 1440, H.about, "3 · About, the component"], ["Sec05Mission.dc.html", 1440, H.mission, "5 · Mission and vision, the component"], ["Sec06Why.dc.html", 1440, H.why, "6 · Why partners choose HCIG, the component"]];
let py = 0; PARTS.forEach(([file, w, h, title]) => { c.boards[file] = { x: 0, y: py, w, h, title, is_interactive: true, page: "parts" }; if (!c.order.includes(file)) c.order.push(file); py += h + 370; });
writeFileSync(join(OUT, "canvas.json"), JSON.stringify(c, null, 2));
console.log("home page:", rows.length, "rows,", Object.values(c.boards).filter((b) => b.page === PAGE).length, "boards; pages", c.pages.map((p) => p.id).join(","));
