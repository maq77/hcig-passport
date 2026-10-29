// The share image (Open Graph, 1200 x 630), round 11b. His brief 2026-10-29: minimal, but show that we are global,
// international, everywhere and a group; all the group companies' logos in a structured way; that we are accredited
// and partners. Backgrounds are his Gemini images (silk, Red Sea coast), faded into the card. One English image for
// every page. One source for the canvas boards and for the final file, so what ships is the board he picks.
// Words: "Integrated healthcare group all over the world" and "The group brands" are approved; the three seal labels
// follow the company profile slide 8 (his pick 2026-10-30: S4, profile wording, Ma Vie Clinique as the ninth brand).
// asset(key) returns the URL of a media key (canvas blob or local file).

const LINE = "Integrated healthcare group all over the world";
const BRANDS = [
  ["brand-247", "24/7 Clinic"], ["brand-medpark", "MedPark Health Group"], ["brand-medone", "MedOne Group"], ["brand-tmasi", "TMASI GLOBAL"],
  ["brand-onemedical", "One Medical Center"], ["brand-onespa", "One Medical Spa"], ["brand-mavie", "Ma Vie Clinique"], ["og-scmg", "Shakankiry Clinics Medical Group"], ["og-uca", "UCA MENA"],
];
const SEALS = [   // company profile slide 8, word for word in short (owner 2026-10-30)
  ["gha", "Global Healthcare Accreditation (GHA)", "GHA", "Official Partner in Egypt"],
  ["og-dmwv", "German Medical Wellness Association (DMWV)", "DMWV", "Partner"],
  ["og-uca-seal", "Urgent Care Association (UCA)", "UCA", "Founder of UCA MENA"],
];

export const css = (asset) => `
@font-face { font-family: 'Helma'; src: url('${asset("helma")}') format('woff2'); font-weight: 400; }
.og { --t:#12C0C6; --dim:#565759; --d20:#DDDDDF; position: relative; width: 1200px; height: 630px; overflow: hidden; box-sizing: border-box;
  background: #fff; color: #000; font: 400 16px/1.5 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
.og *, .og *::before, .og *::after { box-sizing: border-box; } .og p { margin: 0; } .og img { display: block; }
.og .bg { position: absolute; inset: 0; background-size: cover; background-position: right center; }
.og .bg::after { content: ""; position: absolute; inset: 0; }
.og .in { position: absolute; left: 64px; top: 54px; bottom: 50px; width: 560px; display: flex; flex-direction: column; }
.og .lg { height: 50px; width: auto; align-self: flex-start; }
.og h1 { margin: 44px 0 0; font: 400 50px/1.06 'Helma', Georgia, serif; letter-spacing: -.005em; }
.og .rule { width: 56px; height: 2px; margin: 26px 0 26px; background: var(--t); }
.og .seals { display: flex; gap: 14px; }
.og .seal { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 10px; width: 176px; }
.og .seal .pl { width: 58px; height: 58px; display: grid; place-items: center; border-radius: 14px; background: #fff; padding: 6px;
  box-shadow: 0 10px 22px -14px rgba(0,0,0,.45), inset 0 0 0 1px var(--d20); }
.og .seal .pl img { max-width: 100%; max-height: 100%; object-fit: contain; }
.og .seal b { display: block; font: 700 13px/1.1 'Inter', sans-serif; letter-spacing: .06em; }
.og .seal span { display: block; margin-top: 3px; font: 500 11.5px/1.25 'Inter', sans-serif; color: var(--dim); }
.og .dom { margin-top: auto; font: 600 12px/1 'Inter', sans-serif; letter-spacing: .26em; text-transform: uppercase; color: var(--dim); }
.og .cap { font: 600 10.5px/1 'Inter', sans-serif; letter-spacing: .24em; text-transform: uppercase; color: var(--dim); }
/* glass that holds the group */
.og .glass { background: rgba(255,255,255,.6); -webkit-backdrop-filter: blur(16px) saturate(1.15); backdrop-filter: blur(16px) saturate(1.15);
  border: 1px solid rgba(255,255,255,.85); box-shadow: 0 30px 60px -36px rgba(0,40,45,.45); }
.og .tile { display: grid; place-items: center; border-radius: 12px; background: #fff; box-shadow: inset 0 0 0 1px rgba(0,0,0,.05); }
.og .tile img { max-height: 46px; max-width: 74%; object-fit: contain; }
/* panel on the right: 2 x 4 */
.og .panel { position: absolute; right: 52px; top: 52px; bottom: 52px; width: 420px; border-radius: 24px; padding: 20px; display: grid; grid-template-rows: auto 1fr; gap: 14px; }
.og .panel .grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, 1fr); gap: 10px; }
/* strip along the bottom: 8 in a row */
.og .strip { position: absolute; left: 40px; right: 40px; bottom: 34px; height: 104px; border-radius: 22px; padding: 12px 14px 14px; display: grid; grid-template-rows: auto 1fr; gap: 9px; }
.og .strip .row { display: grid; grid-template-columns: repeat(9, 1fr); gap: 7px; }
.og .strip .tile img { max-height: 40px; max-width: 80%; }
.og.has-strip .in { bottom: 166px; } .og.s4 .dom { margin-bottom: 16px; } .og.has-strip h1 { margin-top: 30px; } .og.has-strip .rule { margin: 20px 0; }

/* S1 silk: the silk flows behind the glass */
.og.s1 .bg { background-image: url('${asset("og-silk")}'); }
/* S4 map: his glass world map, the routes meet in Egypt */
.og.s4 .bg { background-image: url('${asset("og-map")}'); }
.og.s4 .bg::after { background: linear-gradient(90deg, rgba(255,255,255,.95) 0, rgba(255,255,255,.86) 34%, rgba(255,255,255,.25) 54%, rgba(255,255,255,0) 66%); }
/* S2 and S3 coast: the sea melts into white under the words */
.og.s2 .bg, .og.s3 .bg { background-image: url('${asset("og-coast")}'); }
.og.s2 .bg::after { background: linear-gradient(90deg, rgba(255,255,255,.97) 0, rgba(255,255,255,.93) 36%, rgba(255,255,255,.45) 56%, rgba(255,255,255,0) 74%),
  linear-gradient(0deg, rgba(255,255,255,.55) 0, rgba(255,255,255,0) 30%); }
.og.s3 .bg::after { background: linear-gradient(90deg, rgba(255,255,255,.97) 0, rgba(255,255,255,.9) 38%, rgba(255,255,255,.2) 60%, rgba(255,255,255,0) 72%); }
`;

const seals = (asset) => `<div class="seals">${SEALS.map(([k, alt, n, l]) => `<div class="seal"><span class="pl"><img src="${asset(k)}" alt="${alt}"></span><div><b>${n}</b><span>${l}</span></div></div>`).join("")}</div>`;
const tiles = (asset) => BRANDS.map(([k, alt]) => `<span class="tile"><img src="${asset(k)}" alt="${alt}"></span>`).join("");
const left = (asset) => `<div class="in"><img class="lg" src="${asset("logo-h-black")}" alt="Healthcare International Group"><h1>${LINE}</h1><span class="rule"></span>${seals(asset)}<p class="dom">healthcareig.com</p></div>`;
const panel = (asset) => `<div class="panel glass"><p class="cap">The group brands</p><div class="grid">${tiles(asset)}</div></div>`;
const strip = (asset) => `<div class="strip glass"><p class="cap">The group brands</p><div class="row">${tiles(asset)}</div></div>`;

export const cards = (asset) => ({
  s1: `<div class="og s1"><div class="bg"></div>${left(asset)}${panel(asset)}</div>`,
  s2: `<div class="og s2 has-strip"><div class="bg"></div>${left(asset).replace('<p class="dom">healthcareig.com</p>', "")}${strip(asset)}</div>`,
  // his canvas edit 2026-10-29: the address stays on S4, under the seals, above the strip
  s4: `<div class="og s4 has-strip"><div class="bg"></div>${left(asset)}${strip(asset)}</div>`,
  s3: `<div class="og s3"><div class="bg"></div>${left(asset)}${panel(asset)}</div>`,
});
