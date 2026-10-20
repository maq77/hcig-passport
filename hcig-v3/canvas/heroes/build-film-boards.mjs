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
.bk-n{background:radial-gradient(34% 40% at 73% 52%,rgba(3,6,10,.62),rgba(3,6,10,0) 100%)}
.bk-d{background:radial-gradient(34% 40% at 73% 52%,rgba(255,255,255,.66),rgba(255,255,255,0) 100%)}
.hero:not(.light) .bf-d,.hero:not(.light) .bk-d,.hero.light .bf-n,.hero.light .bk-n{opacity:0}
.hero{--pb-pad:312px}
@container hero (max-width:900px){.bf{left:-5%;top:64px;width:110%;translate:none}.bk-n{background:radial-gradient(60% 34% at 50% 22%,rgba(3,6,10,.6),rgba(3,6,10,0) 100%)}.bk-d{background:radial-gradient(60% 34% at 50% 22%,rgba(255,255,255,.66),rgba(255,255,255,0) 100%)}}
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
writeFileSync(join(OUT, "HeroBFilm.dc.html"), s);

// ---------- 2. Group section: the full film, with sound ----------
const brands = [["24/7 Clinic"], ["MedPark"], ["MedOne"], ["TMASI"], ["One Medical Center"], ["One Medical Spa"], ["SCMG"], ["UCA MENA"]];
const icon = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const SPK = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>';
writeFileSync(join(OUT, "GroupFilm.dc.html"), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>HCIG v3 Group film section</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Bodoni+Moda:opsz,wght@6..96,400&amp;display=swap">
<style>
@font-face{font-family:'Helma';src:url('/_blob/dd74c2cb45ea68cbd798ea38d33c7729') format('woff2');font-weight:400;font-style:normal;font-display:swap}
body{margin:0}
.gf{--accent:#12C0C6;--ink:#F4F5F5;--ink2:#B9BDBF;--line:rgba(255,255,255,.14);--paper:#07080A;--acc-text:#12C0C6;--serif:'Helma','Bodoni Moda',Didot,Georgia,serif;--sans:'Inter',system-ui,-apple-system,'Segoe UI',Arial,sans-serif;--gutter:clamp(20px,5cqi,80px);--ease:cubic-bezier(.16,1,.3,1);
  container-type:inline-size;container-name:gf;background:var(--paper);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;font-synthesis:none}
.gf.light{--ink:#0B0B0C;--ink2:#3F4042;--line:#D6D7D8;--paper:#FFFFFF;--acc-text:#087276}
.gf-in{display:flex;flex-direction:column;gap:36px;padding:112px var(--gutter) 104px;max-width:1440px;margin:0 auto;box-sizing:border-box}
.gf-head{display:flex;flex-direction:column;gap:14px;align-items:center;text-align:center}
.gf-eye{margin:0;font:600 13px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--acc-text)}
.gf-h{margin:0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:54px;line-height:1.08;letter-spacing:-.01em;text-wrap:balance;max-width:20ch}
.gf-film{position:relative;width:100%;max-width:1280px;margin:0 auto}
.gf-film video{display:block;width:100%;height:auto;background:var(--paper)}
.gf-film .gf-tall{display:none}
.gf-sound{position:absolute;right:16px;bottom:16px;display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 18px;border-radius:999px;border:1px solid var(--line);background:color-mix(in srgb,var(--paper) 72%,transparent);color:var(--ink);font:500 14px/1 var(--sans);cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:border-color .3s,background .3s}
.gf-sound:hover{border-color:var(--accent)}
.gf-sound:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.gf-brands{list-style:none;margin:0;padding:24px 0 0;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;justify-content:center;gap:10px 36px}
.gf-brands a{display:inline-flex;align-items:center;min-height:44px;color:var(--ink2);text-decoration:none;font:500 15px/1 var(--sans);transition:color .25s}
.gf-brands a:hover{color:var(--acc-text)}
.gf-brands a:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:4px}
/* phone first: the tall cut fills the width, the words above, the brands as two columns */
@container gf (max-width:700px){
  .gf-in{padding:72px var(--gutter) 64px;gap:28px}
  .gf-h{font-size:34px;line-height:1.12}
  .gf-film .gf-wide{display:none}.gf-film .gf-tall{display:block}
  .gf-film{margin:0 calc(var(--gutter) * -1);width:auto}
  .gf-sound{right:var(--gutter);bottom:20px}
  .gf-brands{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 16px;padding-top:12px}
  .gf-brands a{min-height:48px;border-bottom:1px solid var(--line);width:100%}
}
@media (prefers-reduced-motion:reduce){.gf-sound{transition:none}}
</style>
</helmet>
<section class="gf {{themeCls}}" aria-labelledby="gf-h"><div class="gf-in">
<div class="gf-head"><p class="gf-eye">Healthcare International Group</p><h2 class="gf-h" id="gf-h">Integrated healthcare group all over the world</h2></div>
<div class="gf-film">
<sc-if value="{{isDark}}" hint-placeholder-val="{{ true }}"><video class="gf-wide" src="${B["film-full-night"]}" poster="${B["film-poster-dark-1920x1080"]}" muted="" loop="" playsinline="" preload="auto" ref="{{vref}}" aria-label="The HCIG group film: the HC mark opens into the eight group brands"></video><video class="gf-tall" src="${B["film-full-phone-night"]}" poster="${B["film-poster-dark-1080x1920"]}" muted="" loop="" playsinline="" preload="auto" ref="{{vref}}" aria-label="The HCIG group film: the HC mark opens into the eight group brands"></video></sc-if>
<sc-if value="{{isLight}}" hint-placeholder-val="{{ false }}"><video class="gf-wide" src="${B["film-full-day"]}" poster="${B["film-poster-light-1920x1080"]}" muted="" loop="" playsinline="" preload="auto" ref="{{vref}}" aria-label="The HCIG group film: the HC mark opens into the eight group brands"></video><video class="gf-tall" src="${PHONE_DAY}" poster="${B["film-poster-light-1080x1920"]}" muted="" loop="" playsinline="" preload="auto" ref="{{vref}}" aria-label="The HCIG group film: the HC mark opens into the eight group brands"></video></sc-if>
<button type="button" class="gf-sound" onClick="{{toggleSound}}" aria-pressed="{{soundPressed}}"><sc-if value="{{soundOn}}" hint-placeholder-val="{{ false }}">${icon(SPK + '<path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>')}<span>Sound off</span></sc-if><sc-if value="{{soundOff}}" hint-placeholder-val="{{ true }}">${icon(SPK + '<path d="M16 9.5l5 5M21 9.5l-5 5"/>')}<span>Play with sound</span></sc-if></button>
</div>
<ul class="gf-brands" aria-label="The group brands">${brands.map(([n]) => `<li><a href="#">${n}</a></li>`).join("")}</ul>
</div></section>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"theme":{"editor":"enum","options":["dark","light"],"default":"dark","section":"Section"},"$preview":{"width":1440,"height":1210}}'>
class Component extends DCLogic {
  renderVals() {
    const s = this.state || {};
    const theme = this.props.theme || 'dark';
    this.vids = this.vids || new Set();
    const vref = this.vref || (this.vref = (el) => {
      if (!el) return;
      this.vids.add(el);
      el.muted = !(this.state && this.state.sound); el.loop = true; el.playsInline = true; el.setAttribute('playsinline', '');
      if (el.offsetParent !== null && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
    });
    return {
      vref,
      themeCls: theme === 'light' ? 'light' : 'dark',
      isDark: theme !== 'light', isLight: theme === 'light',
      soundOn: !!s.sound, soundOff: !s.sound, soundPressed: s.sound ? 'true' : 'false',
      toggleSound: () => {
        const on = !s.sound;
        for (const v of this.vids) {
          if (!v.isConnected || v.offsetParent === null) continue;
          v.muted = !on;
          if (on) v.currentTime = 0;
          const p = v.play(); if (p && p.catch) p.catch(() => {});
        }
        this.setState({ sound: on });
      },
    };
  }
}
</script>
</body>
</html>
`);

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
<div style="width:${w}px;min-height:${h}px;background:${theme === "light" ? "#FFFFFF" : "#07080A"};font-family:'Inter',system-ui,sans-serif;color:${theme === "light" ? "#0B0B0C" : "#F4F5F5"}">
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
const PH_HERO = 1070, GF_H = 1210, GF_PH = 1330;
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
writeFileSync(join(OUT, "canvas.json"), JSON.stringify(c, null, 2));
console.log("film boards written; canvas boards", Object.keys(c.boards).length, "pages", c.pages.map((p) => p.id).join(","));
