// healthcareig.com home, every section on its own boards, in the live order (plan 2026-10-22,
// C:\Users\maqmo\.claude\plans\ancient-squishing-raven.md). Words come from src/hcig-live/index.html, kept exactly.
// He has not chosen a hero yet: every hero option stays on this page as its own boards.
// Run after build-heroes.mjs and build-film-boards.mjs:
//   node hcig-v3/canvas/sections/build-sections.mjs <live canvas.json>
// Writes the section components and wrappers next to the heroes (one canvas) and adds the page "Home, every section".
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

// ---------- 3 · About: "the record, then the proof" ----------
const tick = () => `<span class="ab-tick" aria-hidden="true">✔</span>`;
const aboutCss = `${TOKENS("ab", "ab")}
.ab-in{max-width:1440px;margin:0 auto;padding:136px var(--gutter) 120px;display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);grid-template-areas:"copy media" "stats stats";column-gap:clamp(40px,6cqi,104px);row-gap:88px}
.ab-copy{grid-area:copy;display:flex;flex-direction:column;gap:22px;max-width:660px}
.ab-h{margin:0 0 6px;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:58px;line-height:1.05;letter-spacing:-.01em;text-wrap:balance}
.ab-lead{margin:0;font-size:22px;line-height:1.45;font-weight:600;color:var(--ink);text-wrap:pretty}
.ab-p{margin:0;font-size:17px;line-height:1.72;color:var(--ink2);text-wrap:pretty;transition:color 1s var(--sweep-ease) 1s}
.ab-list{list-style:none;margin:2px 0 4px;padding:0;display:grid;gap:14px}
.ab-list li{display:flex;gap:14px;align-items:flex-start;font-size:17px;line-height:1.5;font-weight:500;color:var(--ink)}
/* the live site's tick: a Turquoise check mark, popping in after its line */
.ab-tick{flex:none;width:22px;font-size:17px;line-height:1.5;color:var(--accent);text-align:center}
.ab.arm .ab-tick{opacity:0;transform:scale(.4)}
.ab.in .ab-tick{opacity:1;transform:none;transition:opacity .5s var(--ease) .35s,transform .7s cubic-bezier(.34,1.56,.64,1) .35s}
.ab-say{margin:10px 0 0;padding-top:26px;border-top:1px solid var(--line);font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:34px;line-height:1.2;letter-spacing:-.005em;transition:border-color 1s var(--sweep-ease) 1s}
.ab-say .acc{color:var(--accent)}
/* the photo: a collage on a white ground, so at night it sits in a light frame like a print */
.ab-media{grid-area:media;align-self:start;margin-top:8px}
.ab-frame{position:relative;aspect-ratio:4/5;border-radius:26px;overflow:hidden;background:#FFFFFF;box-shadow:0 0 0 1px rgba(255,255,255,.14),0 50px 120px -50px rgba(18,192,198,.55);transition:box-shadow 1.3s var(--sweep-ease) .9s,clip-path 1.5s var(--ease)}
.ab.light .ab-frame{box-shadow:0 0 0 1px #DDDDDF,0 40px 90px -60px rgba(0,0,0,.35)}
.ab-par{position:absolute;inset:-5% 0;will-change:transform}
.ab-par img{display:block;width:100%;height:100%;object-fit:cover;transition:transform 1.8s var(--ease)}
.ab.arm .ab-frame{clip-path:inset(14% 0 0 0 round 26px)}.ab.in .ab-frame{clip-path:inset(0 0 0 0 round 26px)}
.ab.arm .ab-par img{transform:scale(1.08)}.ab.in .ab-par img{transform:none}
@supports (animation-timeline:view()){.ab-par{animation:abPar linear both;animation-timeline:view();animation-range:cover}@keyframes abPar{from{transform:translateY(-4%)}to{transform:translateY(4%)}}}
/* the proof: three numbers under a line that draws */
.ab-stats{grid-area:stats;position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--line);transition:border-color 1s var(--sweep-ease) 1s}
.ab-stats:before{content:"";position:absolute;left:0;right:0;top:-1px;height:1px;background:var(--accent);transform-origin:left;transform:scaleX(.18)}
.ab.arm .ab-stats:before{transform:scaleX(0)}.ab.in .ab-stats:before{transform:scaleX(.18);transition:transform 1.4s var(--ease) .2s}
.ab-stat{display:flex;flex-direction:column;gap:12px;padding:40px 32px 0 0;min-width:0}
.ab-stat+.ab-stat{padding-left:40px;border-left:1px solid var(--line);transition:border-color 1s var(--sweep-ease) 1s}
.ab-num{font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:96px;line-height:.95;letter-spacing:-.02em;font-variant-numeric:tabular-nums;white-space:nowrap}
.ab-num .plus{color:var(--accent)}
.ab-lab{font-size:13px;line-height:1.4;letter-spacing:.14em;text-transform:uppercase;font-weight:600;color:var(--muted);transition:color 1s var(--sweep-ease) 1s}
/* phone first */
@container ab (max-width:820px){
  .ab-in{grid-template-columns:minmax(0,1fr);grid-template-areas:"copy" "stats" "media";padding:76px var(--gutter) 72px;row-gap:48px}
  .ab-h{font-size:34px;line-height:1.1}
  .ab-lead{font-size:19px}
  .ab-p,.ab-list li{font-size:16px}
  .ab-say{font-size:26px;padding-top:20px}
  /* phone: the three numbers stack, each big number with its label beside it */
  .ab-stats{grid-template-columns:minmax(0,1fr)}
  .ab-stat{flex-direction:row;align-items:center;justify-content:space-between;gap:16px;padding:22px 0}
  .ab-stat+.ab-stat{padding-left:0;border-left:0;border-top:1px solid var(--line)}
  .ab-num{font-size:52px}
  .ab-num{flex:none}.ab-lab{font-size:12px;letter-spacing:.1em;text-align:right;min-width:0}
  .ab-media{margin-top:0}
}
@container ab (max-width:370px){.ab-num{font-size:46px}.ab-h{font-size:31px}}
${REVEAL("ab")}
@media (prefers-reduced-motion:reduce){.ab-tick{opacity:1!important;transform:none!important}.ab-frame{clip-path:none!important}.ab-par{animation:none!important}.ab-stats:before{transform:scaleX(.18)!important}}`;
const aboutBody = `<section class="ab {{cls}}" ref="{{rootRef}}" aria-labelledby="ab-h"><div class="ab-in">
<div class="ab-copy">
<h2 class="ab-h rv" id="ab-h">Healthcare International Group</h2>
<p class="ab-lead rv" style="--d:80">With over 40 years of experience, Healthcare International Group (HCIG) is built to manage the full patient journey across international healthcare markets.</p>
<p class="ab-p rv" style="--d:160">Rather than operating as a traditional healthcare provider, HCIG brings structure to a system that is often fragmented connecting urgent care, hospital treatment, and international medical coordination within one clear model.</p>
<p class="ab-p rv" style="--d:220">Our ecosystem spans on-site medical services in hotels and resorts, advanced hospital care, and direct coordination with insurance and assistance partners.</p>
<p class="ab-p rv" style="--d:280">This approach allows us to ensure:</p>
<ul class="ab-list">
<li class="rv" style="--d:340">${tick(340)}<span>faster access to care</span></li>
<li class="rv" style="--d:440">${tick(440)}<span>clear responsibility across the case</span></li>
<li class="rv" style="--d:540">${tick(540)}<span>seamless patient management from first contact to resolution</span></li>
</ul>
<p class="ab-p rv" style="--d:620">Operating across multiple markets, HCIG supports international patients, insurers, and global partners with structured, reliable, and scalable healthcare solutions.</p>
<p class="ab-say rv" style="--d:700">We don’t just provide healthcare <span class="acc">we manage it.</span></p>
</div>
<figure class="ab-media rv" style="--d:200;margin-left:0;margin-right:0;margin-bottom:0"><div class="ab-frame"><div class="ab-par"><img src="${B["about"]}" alt="HCIG medical tourism in Egypt"></div></div></figure>
<div class="ab-stats" role="list">
<div class="ab-stat rv" role="listitem" style="--d:120"><span class="ab-num">{{n1}}<span class="plus">+</span></span><span class="ab-lab">Years of Experience</span></div>
<div class="ab-stat rv" role="listitem" style="--d:220"><span class="ab-num">{{n2}}<span class="plus">+</span></span><span class="ab-lab">Patients Served</span></div>
<div class="ab-stat rv" role="listitem" style="--d:320"><span class="ab-num">{{n3}}<span class="plus">+</span></span><span class="ab-lab">Medical Professionals</span></div>
</div>
</div></section>`;
const aboutVals = `    const p = s.p === undefined ? 1 : s.p;
    return {
      rootRef,
      cls: theme + (s.arm ? ' arm' : '') + (s.inv ? ' in' : ''),
      n1: String(Math.round(40 * p)), n2: Math.round(600 * p) + 'K', n3: String(Math.round(350 * p)),
    };`;
writeFileSync(join(OUT, "Sec03About.dc.html"), page("HCIG home, 3 About", aboutCss, aboutBody,
  { theme: { editor: "enum", options: ["dark", "light"], default: "dark", section: "Section" }, $preview: { width: 1440, height: 1350 } }, aboutVals));

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
const H = { hero: 900, heroPh: { B: 1000, D: 1050, J: 860, O: 990, BFilm: 1050 }, about: 1350, aboutPh: 1980, group: 1225, groupPh: 1240 };
const rows = [];
const HEROES = [["B", "HeroB", "Hero B · Night Network"], ["D", "HeroD", "Hero D · Boardroom"], ["J", "HeroJ", "Hero J · Marble Noir"], ["O", "HeroO", "Hero O · the original, polished"], ["BFilm", "HeroBFilm", "Hero B with the group film"]];
for (const [id, comp, label] of HEROES) {
  const f = `Home2${id}`;
  wrap(comp, `${f}Night.dc.html`, `HCIG home, ${label}, night`, 1440, H.hero, "dark");
  wrap(comp, `${f}Day.dc.html`, `HCIG home, ${label}, day`, 1440, H.hero, "light");
  wrap(comp, `${f}PhoneNight.dc.html`, `HCIG home, ${label}, phone, night`, 390, H.heroPh[id], "dark");
  wrap(comp, `${f}PhoneDay.dc.html`, `HCIG home, ${label}, phone, day`, 390, H.heroPh[id], "light");
  rows.push({ title: `2 · ${label} (hero not chosen yet)`, short: `2 ${label.replace("Hero ", "Hero ")}`, f, h: H.hero, ph: H.heroPh[id] });
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
rows.push({ title: "4 · Our Premises and Facilities: the group film (next: the 8 brand cards and the live heading)", short: "4 Our Premises and Facilities", f: "Home4Group", h: H.group, ph: H.groupPh });

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
c.notes.homeNote = { x: 4040, y: 0, w: 460, maxH: 1200, size: "m", fill: "yellow", page: PAGE, text: "Home, every section\n\nThe home in the live order, one row per section, each its own boards: night, day, phone night, phone day.\n\n2 Hero: B, D, J, O and B with the group film. Not chosen yet; all stay.\n3 About: new. Heading Healthcare International Group (your pick). Every word is the live text.\n4 Our Premises and Facilities: the group film now; the 8 brand cards come next.\n\nPress Play on a board to see the motion: lines draw, ticks draw, numbers count up, the photo opens." };
c.notes.homeOpen = { x: 4040, y: 1400, w: 460, maxH: 700, size: "m", fill: "orange", page: PAGE, text: "Open items from the live site\n\n1. The About heading is blank on the live site (a script breaks). Your pick: Healthcare International Group.\n2. The two closing buttons, Become a Partner and Request a Consultation, point nowhere.\n3. The insurer band shows 100% with an empty second line.\n4. The live footer reads 2026 Healthcare International Group. All Rights Reserved. without a ©." };
// the section components themselves: every .dc.html shows on the canvas, so they get their own page (edit there, every board follows)
c.pages = c.pages.filter((p) => p.id !== "parts"); c.pages.push({ id: "parts", name: "Parts (section components)" });
const PARTS = [["Sec03About.dc.html", 1440, H.about, "3 · About, the component"]];
PARTS.forEach(([file, w, h, title], i) => { c.boards[file] = { x: 0, y: i * (h + 370), w, h, title, is_interactive: true, page: "parts" }; if (!c.order.includes(file)) c.order.push(file); });
writeFileSync(join(OUT, "canvas.json"), JSON.stringify(c, null, 2));
console.log("home page:", rows.length, "rows,", Object.values(c.boards).filter((b) => b.page === PAGE).length, "boards; pages", c.pages.map((p) => p.id).join(","));
