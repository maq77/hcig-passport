// The group film on the canvas, as NEW boards on their own page (his order 2026-10-20: "dont replace anything and
// dont remove, just i want to see first, and leave other canvas in case i change my mind").
// Run after build-heroes.mjs (which rewrites canvas.json): node hcig-v3/canvas/heroes/build-film-boards.mjs [live canvas.json]
// Pass the canvas.json read from the live canvas so his own edits to the index are kept; it only adds the film page.
//   1. Hero B with the film: a copy of B (HeroBFilm) where the film loops in the picture instead of the watermark.
//      B itself and every B board stay as they are.
//   2. Group section: the full film with a sound button, the eight brands under it.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { groupFilm } from "./film-section.part.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "project");
const B = JSON.parse(readFileSync(join(HERE, "blobs.json"), "utf8"));
const PHONE_DAY = B["film-full-phone-day"] || B["film-full-day"];

// ---------- 1. Hero B with the film ----------
let s = readFileSync(join(OUT, "HeroB.dc.html"), "utf8");
const must = (from, to) => { if (!s.includes(from)) throw new Error("HeroB changed, not found: " + from.slice(0, 60)); s = s.split(from).join(to); };
must("<title>HCIG v3 Hero B, Night Network</title>", "<title>HCIG v3 Hero B with the group film</title>");
must(`"default":"watermark"`, `"default":"none"`);
must("this.props.mark || 'watermark'", "this.props.mark || 'none'");
// the night cut sits on pure black and screens onto the photo, the day cut sits on white and multiplies onto it,
// so the film reads as part of the picture in every browser (no alpha video needed)
const video = (cls, src, poster) => `<div class="bf ${cls}" aria-hidden="true"><video src="${src}" poster="${poster}" muted="" loop="" playsinline="" preload="auto" ref="{{vref}}"></video></div>`;
must('<div class="fx" aria-hidden="true">', `<div class="bf-bk bk-n" aria-hidden="true"></div><div class="bf-bk bk-d" aria-hidden="true"></div>${video("bf-n", B["film-loop-night"], B["film-loop-poster-dark"])}${video("bf-d", B["film-loop-day"], B["film-loop-poster-light"])}<div class="fx" aria-hidden="true">`);
must("</style>\n</helmet>", `/* B with the group film: the film loops in the picture, on the right where the flows meet */
.hero .hub{display:none}
.bf{position:absolute;z-index:1;pointer-events:none;left:48%;top:50%;width:780px;aspect-ratio:16/9;translate:0 -46%;transition:opacity 1.3s var(--sweep-ease) .9s}
.bf video{display:block;width:100%;height:100%;object-fit:cover}
.bf-n{mix-blend-mode:screen}.bf-d{mix-blend-mode:multiply}
.bf-bk{position:absolute;z-index:1;pointer-events:none;inset:0;transition:opacity 1.3s var(--sweep-ease) .9s}
.bk-n{background:radial-gradient(34% 40% at 73% 52%,rgba(0,0,0,.62),rgba(0,0,0,0) 100%)}
.bk-d{background:radial-gradient(34% 40% at 73% 52%,rgba(255,255,255,.66),rgba(255,255,255,0) 100%)}
.hero:not(.light) .bf-d,.hero:not(.light) .bk-d,.hero.light .bf-n,.hero.light .bk-n{opacity:0}
.hero{--pb-pad:312px}
@container hero (max-width:900px){.bf{left:-5%;top:64px;width:110%;translate:none}.bk-n{background:radial-gradient(60% 34% at 50% 22%,rgba(0,0,0,.6),rgba(0,0,0,0) 100%)}.bk-d{background:radial-gradient(60% 34% at 50% 22%,rgba(255,255,255,.66),rgba(255,255,255,0) 100%)}}
</style>
</helmet>`);
// muted autoplay set on the element itself, so it plays wherever the board is shown; still for reduced motion
must("    return {\n      mkNone:", `    const vref = this.vref || (this.vref = (el) => {
      if (!el) return;
      el.muted = true; el.defaultMuted = true; el.loop = true; el.playsInline = true; el.setAttribute('playsinline', '');
      if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
    });
    return {
      vref,
      mkNone:`);
must("toggleTheme: () => set({ theme: theme === 'light' ? 'dark' : 'light', menu: false, lang: false }),", "toggleTheme: () => { const next = theme === 'light' ? 'dark' : 'light'; set({ theme: next, menu: false, lang: false }); if (typeof this.props.onTheme === 'function') this.props.onTheme(next); },");
must('"motion":{"editor":"boolean","default":true,"section":"Hero"},"$preview"', '"motion":{"editor":"boolean","default":true,"section":"Hero"},"onTheme":{"editor":null},"$preview"');
writeFileSync(join(OUT, "HeroBFilm.dc.html"), s);

// ---------- 2. Group section: the full film, with sound (film-section.part.mjs) ----------
writeFileSync(join(OUT, "GroupFilm.dc.html"), groupFilm(B, PHONE_DAY));

// ---------- wrappers: day, phone night, phone day ----------
const wrap = (comp, file, title, w, h, theme) => writeFileSync(join(OUT, file), `<!doctype html>
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
<dc-import name="${comp}" theme="${theme}" hint-size="${w}px,${h}px"></dc-import>
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
const PH_HERO = 1050, GF_H = 1225, GF_PH = 1240;
wrap("HeroBFilm", "HeroBFilmDay.dc.html", "HCIG v3 Hero B with the film, day", 1440, 900, "light");
wrap("HeroBFilm", "HeroBFilmPhoneNight.dc.html", "HCIG v3 Hero B with the film, phone, night", 390, PH_HERO, "dark");
wrap("HeroBFilm", "HeroBFilmPhoneDay.dc.html", "HCIG v3 Hero B with the film, phone, day", 390, PH_HERO, "light");
wrap("GroupFilm", "GroupFilmDay.dc.html", "HCIG v3 Group film section, day", 1440, GF_H, "light");
wrap("GroupFilm", "GroupFilmPhoneNight.dc.html", "HCIG v3 Group film section, phone, night", 390, GF_PH, "dark");
wrap("GroupFilm", "GroupFilmPhoneDay.dc.html", "HCIG v3 Group film section, phone, day", 390, GF_PH, "light");

// ---------- the canvas index: the film page added, everything else kept exactly ----------
const src = process.argv[2] || join(OUT, "canvas.json");
const c = JSON.parse(readFileSync(src, "utf8"));
if (!c.pages.some((p) => p.id === "film")) c.pages.unshift({ id: "film", name: "Group film (new)" });
const add = (file, b) => { c.boards[file] = { ...b, is_interactive: true, page: "film" }; if (!c.order.includes(file)) c.order.push(file); };
add("HeroBFilm.dc.html", { x: 0, y: 0, w: 1440, h: 900, title: "B with the film · night (press the sun)" });
add("HeroBFilmDay.dc.html", { x: 1520, y: 0, w: 1440, h: 900, title: "B with the film · day (press the moon)" });
add("HeroBFilmPhoneNight.dc.html", { x: 3040, y: 0, w: 390, h: PH_HERO, title: "B with the film · phone night" });
add("HeroBFilmPhoneDay.dc.html", { x: 3510, y: 0, w: 390, h: PH_HERO, title: "B with the film · phone day" });
const gy = PH_HERO + 120 + 250;
add("GroupFilm.dc.html", { x: 0, y: gy, w: 1440, h: GF_H, title: "Group section · night" });
add("GroupFilmDay.dc.html", { x: 1520, y: gy, w: 1440, h: GF_H, title: "Group section · day" });
add("GroupFilmPhoneNight.dc.html", { x: 3040, y: gy, w: 390, h: GF_PH, title: "Group section · phone night" });
add("GroupFilmPhoneDay.dc.html", { x: 3510, y: gy, w: 390, h: GF_PH, title: "Group section · phone day" });
c.notes.filmHero = { x: 0, y: -250, text: "Hero B with the group film, looping in the picture", kind: "title1", maxW: 3900, page: "film" };
c.notes.filmGroup = { x: 0, y: gy - 250, text: "Group section: the full film, with sound", kind: "title1", maxW: 3900, page: "film" };
c.notes.filmNote = { x: 4040, y: 0, w: 460, maxH: 900, size: "m", fill: "yellow", page: "film", text: "The group film, new boards\n\n1. Hero B with the film: a copy of B where the 30 second film loops in the picture, on the right where the flows meet. B and its watermark stay on the other pages as they were.\n2. Group section: the full film, with a sound button, and the eight brands under it. On phones the tall cut fills the width.\n\nPress Play on a board to see the film move. Nothing on the other pages was changed." };
// ---------- 3. The final page: hero B with the film over the group section, one night/day switch for both ----------
// His ask 2026-10-22: "make a new page with final designs for heroes and group section, pick best designs and group film".
const FIN_PH = PH_HERO + GF_PH, FIN_H = 900 + GF_H;
const final = (file, title, w, h, theme) => writeFileSync(join(OUT, file), `<!doctype html>
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
<dc-import name="HeroBFilm" theme="{{theme}}" on-theme="{{setTheme}}" hint-size="${w}px,${w > 500 ? 900 : PH_HERO}px"></dc-import>
<dc-import name="GroupFilm" theme="{{theme}}" hint-size="${w}px,${w > 500 ? GF_H : GF_PH}px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"theme":{"editor":"enum","options":["dark","light"],"default":"${theme}","section":"Page"},"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
  renderVals() {
    const s = this.state || {};
    return {
      theme: s.theme || this.props.theme || '${theme}',
      setTheme: this.setThemeFn || (this.setThemeFn = (t) => this.setState({ theme: t })),
    };
  }
}
</script>
</body>
</html>
`);
final("FinalNight.dc.html", "HCIG home, final: hero and group film, night", 1440, FIN_H, "dark");
final("FinalDay.dc.html", "HCIG home, final: hero and group film, day", 1440, FIN_H, "light");
final("FinalPhoneNight.dc.html", "HCIG home, final, phone, night", 390, FIN_PH, "dark");
final("FinalPhoneDay.dc.html", "HCIG home, final, phone, day", 390, FIN_PH, "light");
c.pages = c.pages.filter((p) => p.id !== "final"); c.pages.unshift({ id: "final", name: "Final: hero and group film" });
c.launch = { view: "canvas", page: "final" };
const fin = (file, b) => { c.boards[file] = { ...b, is_interactive: true, page: "final" }; if (!c.order.includes(file)) c.order.push(file); };
fin("FinalNight.dc.html", { x: 0, y: 0, w: 1440, h: FIN_H, title: "Final · night (press the sun: the whole page turns to day)" });
fin("FinalDay.dc.html", { x: 1520, y: 0, w: 1440, h: FIN_H, title: "Final · day (press the moon)" });
fin("FinalPhoneNight.dc.html", { x: 3040, y: 0, w: 390, h: FIN_PH, title: "Final · phone night" });
fin("FinalPhoneDay.dc.html", { x: 3510, y: 0, w: 390, h: FIN_PH, title: "Final · phone day" });
c.notes.finalTitle = { x: 0, y: -250, text: "Final: hero B with the group film, then the group section", kind: "title1", maxW: 3900, page: "final" };
c.notes.finalNote = { x: 4040, y: 0, w: 460, maxH: 1100, size: "m", fill: "yellow", page: "final", text: "The final page, my picks\n\n1. Hero: B, the Earth at night with the light flows. The group film plays in the picture where the flows meet, so HCIG and its eight brands are in the image itself.\n2. Below it: the group section, the full 30 second film with a sound button and the eight brands.\n3. One switch: the sun or the moon in the header turns the whole page, hero and section together.\n4. Brand colours only: Black, Dim Gray, Turquoise, White. At night the accent words are Turquoise; by day they are Black with a Turquoise line.\n5. Phones first: the photo strip melts into the page with no seam when you switch.\n\nThe four heroes, the film boards and the twelve stay on their pages." };
writeFileSync(join(OUT, "canvas.json"), JSON.stringify(c, null, 2));
console.log("film boards written; canvas boards", Object.keys(c.boards).length, "pages", c.pages.map((p) => p.id).join(","));
