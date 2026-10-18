// Builds canvas 1 for healthcareig.com: three luxury directions as complete, responsive home pages,
// plus a phone artboard for each (the same page mounted at 390 px).
// Run: node hcig-v3/canvas/build-directions.mjs   ->   hcig-v3/canvas/project/*
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { C, IMG } from "./content.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "project");
mkdirSync(OUT, { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Hairline icons: 24 px grid, stroke 1.25, drawn for this site. Decorative unless labelled.
const P = {
  insurance: '<path d="M12 3l7 3v5.5c0 4.4-2.9 7.9-7 9.5-4.1-1.6-7-5.1-7-9.5V6l7-3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  embassy: '<path d="M3 9.5L12 4l9 5.5"/><path d="M5.5 10v8M9.5 10v8M14.5 10v8M18.5 10v8"/><path d="M3 20.5h18"/>',
  hotel: '<path d="M3 18.5V7"/><path d="M3 14.5h18v4"/><path d="M21 14.5V12a3 3 0 0 0-3-3h-7v5.5"/><circle cx="7" cy="11.5" r="1.6"/>',
  tour: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 5-5 2 2-5 5-2z"/>',
  provider: '<path d="M4 20.5V9l8-5 8 5v11.5"/><path d="M3 20.5h18"/><path d="M12 10.5v6M9 13.5h6"/>',
  corporate: '<rect x="3" y="7.5" width="18" height="12.5" rx="1.5"/><path d="M8.5 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v2"/><path d="M3 12.5h18"/>',
  arrow: '<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>',
  external: '<path d="M8 16L16 8M9.5 8H16v6.5"/>',
  plus: '<path d="M12 5.5v13M5.5 12h13"/>',
  minus: '<path d="M5.5 12h13"/>',
  menu: '<path d="M4 9h16M4 15h16"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  chevron: '<path d="M7 10l5 5 5-5"/>',
  play: '<circle cx="12" cy="12" r="10"/><path d="M10.2 8.6v6.8l5.6-3.4-5.6-3.4z"/>',
  tri: '<path d="M9 6.8v10.4l8.4-5.2L9 6.8z"/>',
  phone: '<path d="M6.5 4h2.6l1.6 4.2-2 1.3a11.5 11.5 0 0 0 5.8 5.8l1.3-2 4.2 1.6v2.6a2 2 0 0 1-2.2 2A15.8 15.8 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M4 7l8 5.8L20 7"/>',
  pin: '<path d="M12 21s-6.5-6.1-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.9 12 21 12 21z"/><circle cx="12" cy="9.6" r="2.3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9M12 3c-2.6 2.6-3.8 5.6-3.8 9s1.2 6.4 3.8 9"/>',
  chat: '<path d="M4.5 5h15v10.5H10l-5.5 4V5z"/><path d="M8.5 9.5h7M8.5 12.5h4.5"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M8 10.5V16M8 7.8v.01M11.5 16v-3.4a2 2 0 0 1 4 0V16M11.5 10.5V16"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7v.01"/>',
  facebook: '<path d="M13.5 20.5v-7h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5v7"/>',
};
const icon = (name, size = 24, cls = "") =>
  `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;

// ---------- themes ----------
const LIGHT = {
  bg: "#FFFFFF", band: "#F1F2F2", ink: "#0B0B0C", ink2: "#3F4042", muted: "#565759", line: "#DDDDDE",
  accent: "#12C0C6", accentInk: "#087276", btnBg: "#0B0B0C", btnInk: "#FFFFFF", btn2Ink: "#0B0B0C", btn2Line: "#0B0B0C",
  card: "#FFFFFF", glow: "transparent",
};
const DARK = {
  bg: "#07080A", band: "#0F1113", ink: "#F3F4F4", ink2: "#C3C5C7", muted: "#9A9DA0", line: "rgba(255,255,255,0.14)",
  accent: "#12C0C6", accentInk: "#12C0C6", btnBg: "#12C0C6", btnInk: "#041314", btn2Ink: "#F3F4F4", btn2Line: "rgba(255,255,255,0.55)",
  card: "#0C0E10", glow: "rgba(18,192,198,0.16)",
};
const vars = (t) =>
  `--bg:${t.bg};--band:${t.band};--ink:${t.ink};--ink2:${t.ink2};--muted:${t.muted};--line:${t.line};--accent:${t.accent};--accent-ink:${t.accentInk};--btn-bg:${t.btnBg};--btn-ink:${t.btnInk};--btn2-ink:${t.btn2Ink};--btn2-line:${t.btn2Line};--card:${t.card};--glow:${t.glow};`;

function css(p, base, opts) {
  const S = `.${p}`;
  return `
${S}{${vars(base)}--serif:'Helma','Bodoni Moda',Didot,Georgia,serif;--sans:'Inter',system-ui,-apple-system,'Segoe UI',Arial,sans-serif;--space:112px;--gutter:clamp(20px,4.6cqi,72px);container-type:inline-size;container-name:page;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:17px;line-height:1.7;-webkit-font-smoothing:antialiased;font-synthesis:none;position:relative;overflow:hidden}
${S} *{box-sizing:border-box}
${S} img{display:block;max-width:100%}
${S} a{color:inherit;text-decoration:none}
${S} a:focus-visible,${S} button:focus-visible,${S} input:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:2px}
${S} .${p}-dark{${vars(DARK)}background:var(--bg);color:var(--ink)}
${S} .${p}-light{${vars(LIGHT)}background:var(--bg);color:var(--ink)}
${S} .${p}-band{background:var(--band)}
${S} .${p}-wrap{max-width:1280px;margin:0 auto;padding-inline:var(--gutter)}
${S} .${p}-sec{padding-block:var(--space)}
${S} .${p}-h1{font-family:var(--serif);font-weight:400;font-size:${opts.h1}px;line-height:1.04;letter-spacing:-0.022em;margin:0;text-wrap:balance}
${S} .${p}-h2{font-family:var(--serif);font-weight:400;font-size:48px;line-height:1.1;letter-spacing:-0.015em;margin:0;text-wrap:balance}
${S} .${p}-h2-s{font-size:40px}
${S} .${p}-h2-l{font-size:60px}
${S} .${p}-pull-s{font-size:40px;margin-top:56px}
${S} .${p}-h3{font-family:var(--sans);font-weight:600;font-size:18px;line-height:1.35;letter-spacing:-0.005em;margin:0}
${S} .${p}-h3s{font-family:var(--serif);font-weight:400;font-size:28px;line-height:1.2;margin:0}
${S} .${p}-lead{font-size:20px;line-height:1.6;color:var(--ink2);margin:0;max-width:60ch}
${S} .${p}-body{color:var(--ink2);margin:0;max-width:62ch}
${S} .${p}-small{font-size:14px;line-height:1.6;color:var(--muted);margin:0}
${S} .${p}-sub{font-size:18px;color:var(--muted);margin:14px 0 0;max-width:56ch}
${S} .${p}-btns{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
${S} .${p}-btn{white-space:nowrap;display:inline-flex;align-items:center;gap:12px;min-height:52px;padding:0 26px;background:var(--btn-bg);color:var(--btn-ink);font:500 15px/1 var(--sans);letter-spacing:.01em;border:1px solid var(--btn-bg);border-radius:${opts.radius}px;cursor:pointer;transition:background .18s,color .18s,border-color .18s}
${S} .${p}-btn:hover{background:transparent;color:var(--ink);border-color:var(--ink)}
${S} .${p}-btn2{white-space:nowrap;display:inline-flex;align-items:center;gap:12px;min-height:52px;padding:0 26px;background:transparent;color:var(--btn2-ink);font:500 15px/1 var(--sans);border:1px solid var(--btn2-line);border-radius:${opts.radius}px;cursor:pointer;transition:border-color .18s,color .18s}
${S} .${p}-btn2:hover{border-color:var(--accent)}
${S} .${p}-btn-sm{min-height:44px;padding:0 18px;font-size:14px}
${S} .${p}-link{display:inline-flex;align-items:center;gap:10px;font-weight:500;font-size:15px;color:var(--ink);border-bottom:1px solid var(--accent);padding-bottom:4px}
${S} .${p}-rule{height:1px;background:var(--line);border:0;margin:0}
${S} .${p}-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);flex:none}
${S} .${p}-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;align-items:end;margin-bottom:56px}
/* header */
${S} .${p}-header{position:relative;z-index:5}
${S} .${p}-nav-list{list-style:none;margin:0;padding:0;display:flex;gap:28px}
${S} .${p}-nav-list a{white-space:nowrap;font-size:15px;font-weight:500;color:var(--ink);padding-block:10px;border-bottom:1px solid transparent;transition:border-color .18s}
${S} .${p}-nav-list a:hover{border-bottom-color:var(--accent)}
${S} .${p}-tools{display:flex;align-items:center;gap:14px}
${S} .${p}-lang{position:relative}
${S} .${p}-lang-btn{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;background:transparent;border:1px solid var(--line);border-radius:${opts.radius}px;color:var(--ink);font:500 14px/1 var(--sans);cursor:pointer}
${S} .${p}-lang-menu{position:absolute;right:0;top:52px;min-width:180px;list-style:none;margin:0;padding:8px;background:var(--card);border:1px solid var(--line);border-radius:${opts.radius}px;box-shadow:0 24px 48px -24px rgba(0,0,0,.35)}
${S} .${p}-lang-menu a{display:block;padding:10px 12px;font-size:15px;color:var(--ink);border-radius:2px}
${S} .${p}-lang-menu a:hover{background:var(--band)}
${S} .${p}-menu-btn{display:none;width:48px;height:48px;align-items:center;justify-content:center;background:transparent;border:1px solid var(--line);border-radius:${opts.radius}px;color:var(--ink);cursor:pointer}
${S} .${p}-drawer{display:none}
${S} .${p}-mark{display:none;height:44px;width:auto}
/* hero */
${S} .${p}-cred{display:flex;gap:18px;align-items:center}
${S} .${p}-cred-logo{width:84px;height:auto;flex:none;background:#fff;padding:8px 10px;border-radius:${opts.radius}px}
${S} .${p}-caption{display:flex;gap:10px;align-items:center;font-size:13px;color:var(--muted);margin-top:14px}
/* numbers */
${S} .${p}-nums{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
${S} .${p}-num{padding:36px 32px 34px 0;border-top:1px solid var(--line)}
${S} .${p}-num+.${p}-num{padding-left:32px;border-left:1px solid var(--line)}
${S} .${p}-num b{display:block;font-family:var(--serif);font-weight:400;font-size:76px;line-height:1;letter-spacing:-0.02em}
${S} .${p}-num b i{font-style:normal;color:var(--accent)}
${S} .${p}-num span{display:block;margin-top:14px;font-size:15px;color:var(--muted)}
/* statement */
${S} .${p}-two{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:72px;align-items:start}
${S} .${p}-stack{display:grid;gap:22px}
${S} .${p}-ticks{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
${S} .${p}-ticks li{display:flex;gap:16px;align-items:center;padding:14px 0;border-bottom:1px solid var(--line);color:var(--ink)}
${S} .${p}-pull{margin:88px 0 0;padding-top:40px;border-top:1px solid var(--line);font-family:var(--serif);font-weight:400;font-size:64px;line-height:1.08;letter-spacing:-0.02em;text-wrap:balance}
${S} .${p}-pull em{font-style:normal;color:var(--accent-ink)}
/* partners */
${S} .${p}-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0}
${S} .${p}-door{display:grid;gap:16px;align-content:start;padding:36px 32px 40px;border-top:1px solid var(--line);border-right:1px solid var(--line);transition:background .25s}
${S} .${p}-door:nth-child(3n){border-right:0}
${S} .${p}-door:hover{background:var(--band)}
${S} .${p}-door .${p}-ic{color:var(--accent-ink)}
${S} .${p}-door-go{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;color:var(--ink);margin-top:6px;opacity:.85}
/* system */
${S} .${p}-steps{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:28px;position:relative}
${S} .${p}-steps:before{content:"";position:absolute;left:0;right:0;top:17px;height:1px;background:var(--line)}
${S} .${p}-step{position:relative;display:grid;gap:14px;align-content:start}
${S} .${p}-step-n{position:relative;z-index:1;display:inline-flex;width:36px;height:36px;border-radius:50%;align-items:center;justify-content:center;background:var(--bg);border:1px solid var(--accent);color:var(--ink);font:500 13px/1 var(--sans)}
${S} .${p}-step p{margin:0;font-size:15px;line-height:1.65;color:var(--ink2)}
/* trust */
${S} .${p}-trust{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:64px;align-items:center}
${S} .${p}-stat{font-family:var(--serif);font-size:120px;line-height:.9;letter-spacing:-0.03em;margin:0 0 18px}
${S} .${p}-logos{background:#FFFFFF;padding:28px;border-radius:${opts.radius}px;border:1px solid #E6E7E8}
${S} .${p}-partner-line{display:flex;gap:22px;align-items:center;margin-top:48px;padding-top:28px;border-top:1px solid var(--line)}
/* care accordion */
${S} .${p}-acc{border-top:1px solid var(--line)}
${S} .${p}-acc-item{border-bottom:1px solid var(--line)}
${S} .${p}-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:22px 0;background:transparent;border:0;color:var(--ink);text-align:left;cursor:pointer;font:400 28px/1.25 var(--serif)}
${S} .${p}-acc-btn svg{flex:none;color:var(--accent-ink)}
${S} .${p}-acc-item.open .${p}-acc-btn{color:var(--ink)}
${S} .${p}-acc-panel{padding:0 64px 26px 0;color:var(--ink2);margin:0}
/* group */
${S} .${p}-brands{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
${S} .${p}-brand{display:grid;grid-template-rows:auto 1fr auto;gap:14px;padding:0 0 22px;border-bottom:1px solid var(--line)}
${S} .${p}-brand-logo{height:132px;background:#FFFFFF;border:1px solid #E6E7E8;border-radius:${opts.radius}px;display:flex;align-items:center;justify-content:center;padding:22px}
${S} .${p}-brand-logo img{max-height:84px;max-width:82%;width:auto;height:auto;object-fit:contain}
${S} .${p}-brand-site{display:inline-flex;align-items:center;gap:6px;font-size:14px;color:var(--muted)}
${S} .${p}-brand-site:hover{color:var(--ink)}
/* tabs */
${S} .${p}-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:44px}
${S} .${p}-tab{min-height:48px;padding:0 22px;background:transparent;border:1px solid var(--line);border-radius:${opts.radius}px;color:var(--muted);font:500 15px/1 var(--sans);cursor:pointer}
${S} .${p}-tab.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
${S} .${p}-feats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px 48px}
${S} .${p}-feat{display:grid;gap:10px;align-content:start;padding-top:22px;border-top:1px solid var(--line)}
${S} .${p}-feat p{margin:0;color:var(--ink2);font-size:16px}
/* mission */
${S} .${p}-mv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:72px}
${S} .${p}-mv .${p}-h2{font-size:44px;margin-bottom:24px}
${S} .${p}-mv p{margin:0 0 16px;color:var(--ink2)}
/* quote */
${S} .${p}-quote{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:72px;align-items:center}
${S} .${p}-quote-img{aspect-ratio:4/5;width:100%;object-fit:cover;filter:grayscale(1)}
${S} .${p}-quote-mark{font-family:var(--serif);font-size:120px;line-height:.6;color:var(--accent);display:block;height:56px}
${S} .${p}-quote blockquote{margin:0;font-family:var(--serif);font-size:42px;line-height:1.24;letter-spacing:-0.01em;text-wrap:pretty}
${S} .${p}-quote figcaption{margin-top:32px;display:flex;gap:16px;align-items:center;font-size:15px;color:var(--muted)}
${S} .${p}-quote figcaption b{color:var(--ink);font-weight:600}
/* films */
${S} .${p}-films{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
${S} .${p}-film{position:relative;aspect-ratio:4/5;border-radius:${opts.radius}px;overflow:hidden;background:var(--band);border:1px solid var(--line)}
${S} .${p}-film-btn{position:absolute;inset:0;width:100%;display:flex;flex-direction:column;justify-content:space-between;padding:28px;background:transparent;border:0;color:var(--ink);cursor:pointer;text-align:left}
${S} .${p}-film-ring{position:relative;z-index:1;width:76px;height:76px;border-radius:50%;border:1px solid var(--accent);display:flex;align-items:center;justify-content:center;color:var(--ink);transition:background .25s,color .25s}
${S} .${p}-film-btn:hover .${p}-film-ring{background:var(--accent);color:#041314}
${S} .${p}-film-meta{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:end;width:100%;font-size:14px;color:var(--muted);font-variant-numeric:tabular-nums}
${S} .${p}-film-wm{position:absolute;right:-12%;bottom:-10%;width:78%;height:auto;opacity:.07;pointer-events:none}
${S} .${p}-film video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000}
${S} .${p}-film-close{position:absolute;top:12px;right:12px;z-index:2;width:44px;height:44px;border-radius:50%;border:0;background:rgba(0,0,0,.6);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
/* impact */
${S} .${p}-impact{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0}
${S} .${p}-impact li{list-style:none;padding:28px 28px 30px 0;border-top:1px solid var(--line);font-family:var(--serif);font-size:24px;line-height:1.3;display:grid;gap:18px;align-content:start}
${S} .${p}-impact li+li{padding-left:28px;border-left:1px solid var(--line)}
/* blog */
${S} .${p}-posts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px}
${S} .${p}-post{display:grid;gap:16px;align-content:start}
${S} .${p}-post img{aspect-ratio:4/5;width:100%;object-fit:cover;border-radius:${opts.radius}px;transition:transform 1.2s cubic-bezier(.16,1,.3,1)}
${S} .${p}-post:hover img{transform:scale(1.02)}
${S} .${p}-post h3{font-family:var(--serif);font-weight:400;font-size:24px;line-height:1.25;margin:0}
/* partner band */
${S} .${p}-cta{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:72px;align-items:end}
${S} .${p}-form{display:grid;gap:12px}
${S} .${p}-form label{font-size:14px;color:var(--muted)}
${S} .${p}-form-row{display:flex;gap:10px}
${S} .${p}-input{flex:1;min-width:0;min-height:52px;padding:0 16px;background:transparent;border:1px solid var(--btn2-line);border-radius:${opts.radius}px;color:var(--ink);font:400 16px/1 var(--sans)}
${S} .${p}-thanks{display:flex;gap:12px;align-items:center;font-size:15px;color:var(--ink);min-height:52px}
/* footer */
${S} .${p}-foot{display:grid;grid-template-columns:minmax(0,4fr) repeat(3,minmax(0,2.6fr));gap:48px;padding-block:88px 56px}
${S} .${p}-foot h3{font:600 14px/1.4 var(--sans);margin:0 0 18px;color:var(--ink)}
${S} .${p}-foot ul{list-style:none;margin:0;padding:0;display:grid;gap:12px}
${S} .${p}-foot li,${S} .${p}-foot a{font-size:15px;color:var(--ink2)}
${S} .${p}-foot a:hover{color:var(--ink)}
${S} .${p}-foot-logo{height:120px;width:auto}
${S} .${p}-foot-gap{height:38px}
${S} .${p}-social{display:flex;gap:10px;margin-top:28px}
${S} .${p}-social a{width:44px;height:44px;border:1px solid var(--line);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--ink)}
${S} .${p}-social a:hover{border-color:var(--accent)}
${S} .${p}-legal{display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between;padding-block:24px 36px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
${S} .${p}-legal a{color:var(--ink2);border-bottom:1px solid var(--line)}
${S} .${p}-chat{position:fixed;right:24px;bottom:24px;z-index:20;width:56px;height:56px;border-radius:50%;border:1px solid var(--line);background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;box-shadow:0 18px 40px -18px rgba(0,0,0,.45);cursor:pointer}
@media (prefers-reduced-motion: reduce){${S} *{transition:none!important}}
${opts.extra(S, p)}
@container page (max-width: 900px){
  ${S} .${p}-page{--space:60px;font-size:16px}
  ${S} .${p}-nav,${S} .${p}-tools .${p}-btn,${S} .${p}-tools .${p}-lang,${S} .${p}-logo-full{display:none}
  ${S} .${p}-menu-btn{display:inline-flex}
  ${S} .${p}-mark{display:block}
  ${S} .${p}-drawer{display:block;padding:8px var(--gutter) 28px;border-top:1px solid var(--line);background:var(--bg)}
  ${S} .${p}-drawer ul{list-style:none;margin:0 0 20px;padding:0}
  ${S} .${p}-drawer li a{display:flex;justify-content:space-between;align-items:center;min-height:52px;font:400 24px/1.2 var(--serif);border-bottom:1px solid var(--line);color:var(--ink)}
  ${S} .${p}-drawer-langs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px}
  ${S} .${p}-drawer-langs a{min-height:40px;display:inline-flex;align-items:center;padding:0 12px;border:1px solid var(--line);font-size:14px;color:var(--ink2)}
  ${S} .${p}-h1{font-size:${opts.h1phone}px;line-height:1.08}
  ${S} .${p}-h2{font-size:31px}
  ${S} .${p}-h2-s{font-size:30px}
  ${S} .${p}-h2-l{font-size:38px}
  ${S} .${p}-pull-s{font-size:28px}
  ${S} .${p}-lead{font-size:18px}
  ${S} .${p}-head,${S} .${p}-two,${S} .${p}-trust,${S} .${p}-quote,${S} .${p}-cta,${S} .${p}-mv{grid-template-columns:minmax(0,1fr);gap:32px}
  ${S} .${p}-head{margin-bottom:36px}
  ${S} .${p}-nums{grid-template-columns:minmax(0,1fr)}
  ${S} .${p}-num,${S} .${p}-num+.${p}-num{display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:22px 0;border-left:0}
  ${S} .${p}-num b{font-size:52px}
  ${S} .${p}-num span{margin:0;text-align:right}
  ${S} .${p}-pull{font-size:38px;margin-top:56px}
  ${S} .${p}-grid3{grid-template-columns:minmax(0,1fr)}
  ${S} .${p}-door{border-right:0;padding:24px 0 26px;gap:12px}
  ${S} .${p}-door:hover{background:transparent}
  ${S} .${p}-steps{grid-template-columns:minmax(0,1fr);gap:26px;padding-left:0}
  ${S} .${p}-steps:before{top:0;bottom:0;left:17px;right:auto;width:1px;height:auto}
  ${S} .${p}-step{grid-template-columns:36px minmax(0,1fr);column-gap:18px}
  ${S} .${p}-step .${p}-h3,${S} .${p}-step p{grid-column:2}
  ${S} .${p}-step-n{grid-row:span 2}
  ${S} .${p}-stat{font-size:84px}
  ${S} .${p}-acc-btn{font-size:22px}
  ${S} .${p}-acc-panel{padding-right:0}
  ${S} .${p}-brands{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  ${S} .${p}-brand-logo{height:104px;padding:16px}
  ${S} .${p}-feats{grid-template-columns:minmax(0,1fr);gap:0}
  ${S} .${p}-feat{padding-block:20px}
  ${S} .${p}-mv .${p}-h2{font-size:32px}
  ${S} .${p}-quote blockquote{font-size:28px}
  ${S} .${p}-films{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px;margin-right:calc(var(--gutter) * -1);padding-right:var(--gutter)}
  ${S} .${p}-film{flex:0 0 78%;scroll-snap-align:start}
  ${S} .${p}-impact{grid-template-columns:minmax(0,1fr)}
  ${S} .${p}-impact li,${S} .${p}-impact li+li{padding:20px 0;border-left:0;font-size:22px}
  ${S} .${p}-posts{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:16px;margin-right:calc(var(--gutter) * -1);padding-right:var(--gutter)}
  ${S} .${p}-post{flex:0 0 78%;scroll-snap-align:start}
  ${S} .${p}-form-row{flex-direction:column}
  ${S} .${p}-foot{grid-template-columns:minmax(0,1fr);gap:28px;padding-block:64px 40px}
  ${S} .${p}-foot-gap{display:none}
  ${S} .${p}-partner-line{flex-direction:column;align-items:flex-start}
  ${opts.phone(S, p)}
}
`;
}

// ---------- shared sections ----------
const navLinks = [["Home", "#top"], ["About Us", "#about"], ["Services", "#services"], ["For Partners", "#partners"], ["Blog", "#blog"], ["Contact", "#contact"]];

function header(p, { logo, mark, layout }) {
  const nav = `<nav class="${p}-nav" aria-label="Main"><ul class="${p}-nav-list">${navLinks.map(([t, h]) => `<li><a href="${h}">${esc(t)}</a></li>`).join("")}</ul></nav>`;
  const lang = `<div class="${p}-lang"><button type="button" class="${p}-lang-btn" onClick="{{toggleLang}}" aria-haspopup="true" aria-expanded="{{langExp}}">${icon("globe", 18)}<span>EN</span>${icon("chevron", 16)}</button><sc-if value="{{langOpen}}" hint-placeholder-val="{{ false }}"><ul class="${p}-lang-menu" aria-label="Language">${C.languages.map((l) => `<li><a href="#top">${esc(l)}</a></li>`).join("")}</ul></sc-if></div>`;
  const tools = `<div class="${p}-tools">${lang}<a href="#partner" class="${p}-btn ${p}-btn-sm">${esc(C.talk)}</a><button type="button" class="${p}-menu-btn" onClick="{{toggleMenu}}" aria-label="Menu" aria-expanded="{{menuExp}}"><sc-if value="{{menuOpen}}" hint-placeholder-val="{{ false }}">${icon("close")}</sc-if><sc-if value="{{menuClosed}}" hint-placeholder-val="{{ true }}">${icon("menu")}</sc-if></button></div>`;
  const brand = `<a href="#top" class="${p}-logo" aria-label="Healthcare International Group, home"><img class="${p}-logo-full" src="${logo}" alt="Healthcare International Group"><img class="${p}-mark" src="${mark}" alt="Healthcare International Group"></a>`;
  const drawer = `<sc-if value="{{menuOpen}}" hint-placeholder-val="{{ false }}"><div class="${p}-drawer"><ul>${navLinks.map(([t, h]) => `<li><a href="${h}" onClick="{{closeMenu}}">${esc(t)}${icon("arrow", 20)}</a></li>`).join("")}</ul><div class="${p}-drawer-langs">${C.languages.map((l) => `<a href="#top">${esc(l)}</a>`).join("")}</div><a href="#partner" class="${p}-btn" onClick="{{closeMenu}}">${esc(C.talk)}</a></div></sc-if>`;
  if (layout === "masthead") {
    return `<header class="${p}-header"><div class="${p}-wrap ${p}-masthead">${brand}</div><div class="${p}-wrap ${p}-bar">${brand}${nav}${tools}</div>${drawer}</header>`;
  }
  return `<header class="${p}-header"><div class="${p}-wrap ${p}-bar">${brand}${nav}${tools}</div>${drawer}</header>`;
}

const cred = (p) => `<div class="${p}-cred"><img class="${p}-cred-logo" src="${IMG.gha}" alt="Global Healthcare Accreditation"><p class="${p}-small">${esc(C.credential)}</p></div>`;
const ctas = (p) => `<div class="${p}-btns"><a href="#partner" class="${p}-btn">${esc(C.talk)}${icon("arrow", 18)}</a><a href="#partner" class="${p}-btn2">${esc(C.build.become)}</a></div>`;
const numbers = (p) => `<div class="${p}-nums">${C.numbers.map(([n, plus, label]) => `<div class="${p}-num"><b>${esc(n)}<i>${plus}</i></b><span>${esc(label)}</span></div>`).join("")}</div>`;

const statement = (p, cls = "") => `<section id="about" class="${p}-sec ${cls}"><div class="${p}-wrap"><div class="${p}-two"><h2 class="${p}-h2">${esc(C.structured)}</h2><div class="${p}-stack">${C.about.map((t) => `<p class="${p}-body">${esc(t)}</p>`).join("")}<p class="${p}-body">${esc(C.ensureLead)}</p><ul class="${p}-ticks">${C.ensure.map((t) => `<li><span class="${p}-dot"></span>${esc(t)}</li>`).join("")}</ul><p class="${p}-body">${esc(C.operating)}</p></div></div><p class="${p}-pull">We don’t just provide healthcare. <em>We manage it.</em></p></div></section>`;

const doors = (p, cls = "") => `<section id="partners" class="${p}-sec ${cls}"><div class="${p}-wrap"><div class="${p}-head"><h2 class="${p}-h2">${esc(C.work.title)}</h2><p class="${p}-sub">${esc(C.work.sub)}</p></div><div class="${p}-grid3">${C.work.items.map(([ic, t, d]) => `<a href="#partner" class="${p}-door">${icon(ic, 30, `${p}-ic`)}<h3 class="${p}-h3s">${esc(t)}</h3><p class="${p}-body">${esc(d)}</p><span class="${p}-door-go">${icon("arrow", 20)}</span></a>`).join("")}</div></div></section>`;

const system = (p, cls = "") => `<section class="${p}-sec ${cls}"><div class="${p}-wrap"><div class="${p}-head"><h2 class="${p}-h2">${esc(C.system.title)}</h2></div><ol class="${p}-steps" style="list-style:none;margin:0;padding:0">${C.system.steps.map(([n, t, d]) => `<li class="${p}-step"><span class="${p}-step-n">${n}</span><h3 class="${p}-h3">${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}</ol></div></section>`;

const trust = (p, cls = "") => `<section id="trust" class="${p}-sec ${cls}"><div class="${p}-wrap"><div class="${p}-trust"><div><p class="${p}-stat">${esc(C.trust.stat)}</p><h2 class="${p}-h2 ${p}-h2-s">${esc(C.trust.title)}</h2><p class="${p}-body" style="margin-top:20px">${esc(C.trust.body)}</p><p class="${p}-small" style="margin-top:18px;color:var(--ink)">${esc(C.trust.close)}</p></div><div class="${p}-logos"><img src="${IMG.insurers}" alt="Insurance and assistance partners: Lloyds, Aviva, AXA, Post Office, ADAC, UNIQA, Leisure Guard, Admiral, adec, Gouda, Europe Insurance, CoverWise, Liberty Mutual, Vienna Insurance Group, Allianz, HanseMerkur, ERV, ERGO Hestia, AllClear, ERGO, Mondial Assistance, avanti, Groupama"></div></div></div></section>`;

const care = (p, cls = "") => `<section id="services" class="${p}-sec ${cls}"><div class="${p}-wrap"><div class="${p}-two"><div><h2 class="${p}-h2">${esc(C.care.title)}</h2><p class="${p}-sub">${esc(C.care.sub)}</p></div><div class="${p}-acc">${C.care.items.map(([t, d], i) => `<div class="${p}-acc-item {{svcCls${i}}}"><button type="button" class="${p}-acc-btn" onClick="{{svcToggle${i}}}" aria-expanded="{{svcExp${i}}}"><span>${esc(t)}</span><sc-if value="{{svc${i}}}" hint-placeholder-val="{{ ${i === 0} }}">${icon("minus", 22)}</sc-if><sc-if value="{{svcShut${i}}}" hint-placeholder-val="{{ ${i !== 0} }}">${icon("plus", 22)}</sc-if></button><sc-if value="{{svc${i}}}" hint-placeholder-val="{{ ${i === 0} }}"><p class="${p}-acc-panel">${esc(d)}</p></sc-if></div>`).join("")}</div></div></div></section>`;

const group = (p, cls = "") => `<section id="group" class="${p}-sec ${cls}"><div class="${p}-wrap"><div class="${p}-head"><h2 class="${p}-h2">${esc(C.premises)}</h2></div><div class="${p}-brands">${C.brands.map((b) => `<article class="${p}-brand"><div class="${p}-brand-logo"><img src="/_blob/${b.logo}" alt="${esc(b.name)}"></div><div><h3 class="${p}-h3">${esc(b.name)}</h3><p class="${p}-small" style="margin-top:6px">${esc(b.line)}</p></div><a class="${p}-brand-site" href="${b.site}" target="_blank" rel="noopener">${esc(b.domain)}${icon("external", 14)}</a></article>`).join("")}</div></div></section>`;

const feats = (p, list) => `<div class="${p}-feats">${list.map(([t, d]) => `<div class="${p}-feat"><h3 class="${p}-h3">${esc(t)}</h3><p>${esc(d)}</p></div>`).join("")}</div>`;
const whyTabs = (p, cls = "") => `<section class="${p}-sec ${cls}"><div class="${p}-wrap"><div class="${p}-tabs" role="tablist" aria-label="${esc(C.why.title)}"><button type="button" role="tab" class="${p}-tab {{tabAClass}}" aria-selected="{{tabASel}}" onClick="{{showTabA}}">${esc(C.why.title)}</button><button type="button" role="tab" class="${p}-tab {{tabBClass}}" aria-selected="{{tabBSel}}" onClick="{{showTabB}}">${esc(C.built.title)}</button></div><sc-if value="{{tabA}}" hint-placeholder-val="{{ true }}"><div role="tabpanel"><div class="${p}-head"><h2 class="${p}-h2">${esc(C.why.title)}</h2><p class="${p}-sub">${esc(C.why.sub)}</p></div>${feats(p, C.why.items)}</div></sc-if><sc-if value="{{tabB}}" hint-placeholder-val="{{ false }}"><div role="tabpanel"><div class="${p}-head"><h2 class="${p}-h2">${esc(C.built.title)}</h2><p class="${p}-sub">${esc(C.built.sub)}</p></div>${feats(p, C.built.items)}<p class="${p}-pull ${p}-pull-s">${esc(C.built.close)}</p></div></sc-if></div></section>`;

const missionVision = (p, cls = "") => `<section class="${p}-sec ${cls}"><div class="${p}-wrap ${p}-mv">${[C.mission, C.vision].map((m) => `<div><h2 class="${p}-h2">${esc(m.title)}</h2>${m.lines.map((t) => `<p>${esc(t)}</p>`).join("")}</div>`).join("")}</div></section>`;

const quote = (p, cls = "") => `<section class="${p}-sec ${cls}"><div class="${p}-wrap"><figure class="${p}-quote" style="margin:0"><img class="${p}-quote-img" src="${IMG.amr}" alt="${esc(C.quote.name)}"><div><span class="${p}-quote-mark" aria-hidden="true">“</span><blockquote>${esc(C.quote.text)}</blockquote><figcaption><span class="${p}-dot"></span><span><b>${esc(C.quote.name)}</b><br>${esc(C.quote.role)}</span></figcaption></div></figure></div></section>`;

const films = (p, cls = "", markSrc) => `<section class="${p}-sec ${cls}"><div class="${p}-wrap"><div class="${p}-head"><h2 class="${p}-h2">${esc(C.testimonials)}</h2></div><div class="${p}-films">${C.films.map((f, i) => `<div class="${p}-film"><sc-if value="{{film${i}}}" hint-placeholder-val="{{ false }}"><video src="/_blob/${f.src}" controls autoplay playsinline preload="none"></video><button type="button" class="${p}-film-close" onClick="{{closeVideo}}" aria-label="Close">${icon("close", 20)}</button></sc-if><sc-if value="{{tile${i}}}" hint-placeholder-val="{{ true }}"><button type="button" class="${p}-film-btn" onClick="{{play${i}}}" aria-label="Play testimonial ${i + 1}, ${f.length}"><span class="${p}-film-ring">${icon("tri", 26)}</span><span class="${p}-film-meta"><span>${f.length}</span><span>0${i + 1}</span></span><img class="${p}-film-wm" src="${markSrc}" alt=""></button></sc-if></div>`).join("")}</div></div></section>`;

const impact = (p, cls = "") => `<section class="${p}-sec ${cls}" style="padding-top:0"><div class="${p}-wrap"><h2 class="${p}-h2 ${p}-h2-s" style="margin-bottom:40px">${esc(C.impact.title)}</h2><ul class="${p}-impact" style="margin:0;padding:0">${C.impact.items.map((t) => `<li><span class="${p}-dot"></span>${esc(t)}</li>`).join("")}</ul></div></section>`;

const blog = (p, cls = "") => `<section id="blog" class="${p}-sec ${cls}"><div class="${p}-wrap"><div class="${p}-head"><h2 class="${p}-h2">${esc(C.blog.title)}</h2><div style="justify-self:end"><a href="#blog" class="${p}-link">${esc(C.NEW.allPosts)}${icon("arrow", 16)}</a></div></div><div class="${p}-posts">${C.blog.posts.map((b) => `<a href="#blog" class="${p}-post"><img src="/_blob/${b.img}" alt=""><span class="${p}-small">${esc(b.place)}</span><h3>${esc(b.title)}</h3></a>`).join("")}</div></div></section>`;

const partnerBand = (p, cls = "") => `<section id="partner" class="${p}-sec ${cls}"><div class="${p}-wrap ${p}-cta"><div class="${p}-stack" style="gap:26px"><h2 class="${p}-h2 ${p}-h2-l">${esc(C.build.title)}</h2><p class="${p}-lead">${esc(C.build.body)}</p><div class="${p}-btns"><a href="#contact" class="${p}-btn">${esc(C.build.become)}${icon("arrow", 18)}</a><a href="#contact" class="${p}-btn2">${esc(C.build.consult)}</a></div></div><form class="${p}-form" onSubmit="{{subscribe}}"><label for="${p}-email">${esc(C.NEW.newsletterLabel)}</label><sc-if value="{{notSubscribed}}" hint-placeholder-val="{{ true }}"><div class="${p}-form-row"><input id="${p}-email" class="${p}-input" type="email" required placeholder="${esc(C.NEW.emailLabel)}" aria-label="${esc(C.NEW.emailLabel)}"><button type="submit" class="${p}-btn">${esc(C.NEW.subscribe)}</button></div></sc-if><sc-if value="{{subscribed}}" hint-placeholder-val="{{ false }}"><p class="${p}-thanks"><span class="${p}-dot"></span>${esc(C.NEW.thanks)}</p></sc-if></form></div></section>`;

const footer = (p, cls = "", footLogo) => `<footer id="contact" class="${cls}"><div class="${p}-wrap"><div class="${p}-foot"><div><img class="${p}-foot-logo" src="${footLogo}" alt="Healthcare International Group"><div class="${p}-social">${C.social.map(([n, h, l]) => `<a href="${h}" target="_blank" rel="noopener" aria-label="${esc(l)}">${icon(n, 18)}</a>`).join("")}</div></div><div><h3>${esc(C.contact.title)}</h3><ul>${C.contact.phones.map((t) => `<li><a href="tel:${t.replace(/\s/g, "")}">${esc(t)}</a></li>`).join("")}<li><a href="mailto:${C.contact.email}">${esc(C.contact.email)}</a></li></ul></div><div><div class="${p}-foot-gap" aria-hidden="true"></div><ul>${C.contact.addresses.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div><div><div class="${p}-foot-gap" aria-hidden="true"></div><ul>${navLinks.map(([t, h]) => `<li><a href="${h}">${esc(t)}</a></li>`).join("")}</ul></div></div><div class="${p}-legal"><span>${esc(C.footer)} <a href="https://pulsemarketing.global/" target="_blank" rel="noopener">${esc(C.pulse)}</a></span><span>EN · DE · PL · FR · IT · ES · CS</span></div></div><button type="button" class="${p}-chat" aria-label="Chat with HCIG">${icon("chat", 24)}</button></footer>`;

// ---------- logic ----------
const logic = `class Component extends DCLogic {
  renderVals() {
    const s = this.state || {};
    const svc = s.svc === undefined ? 0 : s.svc;
    const tab = s.tab || 0;
    const video = s.video === undefined ? -1 : s.video;
    const set = (o) => this.setState(o);
    const v = {
      menuOpen: !!s.menu, menuClosed: !s.menu, menuExp: s.menu ? 'true' : 'false',
      toggleMenu: () => set({ menu: !s.menu }), closeMenu: () => set({ menu: false }),
      langOpen: !!s.lang, langExp: s.lang ? 'true' : 'false', toggleLang: () => set({ lang: !s.lang }),
      tabA: tab === 0, tabB: tab === 1, tabAClass: tab === 0 ? 'on' : '', tabBClass: tab === 1 ? 'on' : '',
      tabASel: tab === 0 ? 'true' : 'false', tabBSel: tab === 1 ? 'true' : 'false',
      showTabA: () => set({ tab: 0 }), showTabB: () => set({ tab: 1 }),
      closeVideo: () => set({ video: -1 }),
      subscribed: !!s.subscribed, notSubscribed: !s.subscribed,
      subscribe: (e) => { if (e && e.preventDefault) e.preventDefault(); set({ subscribed: true }); }
    };
    for (let i = 0; i < 7; i++) {
      v['svc' + i] = svc === i; v['svcShut' + i] = svc !== i;
      v['svcCls' + i] = svc === i ? 'open' : ''; v['svcExp' + i] = svc === i ? 'true' : 'false';
      v['svcToggle' + i] = () => set({ svc: svc === i ? -1 : i });
    }
    for (let i = 0; i < 3; i++) {
      v['film' + i] = video === i; v['tile' + i] = video !== i;
      v['play' + i] = () => set({ video: i });
    }
    return v;
  }
}`;

function page({ file, title, p, base, sections, opts, height }) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Bodoni+Moda:opsz,wght@6..96,400&amp;display=swap">
<style>
@font-face{font-family:'Helma';src:url('${IMG.helma}') format('woff2');font-weight:400;font-style:normal;font-display:swap}
body{margin:0}
${css(p, base, opts)}
</style>
</helmet>
<div id="top" class="${p}" style="font-family:'Inter',system-ui,sans-serif;color:${base.ink}"><div class="${p}-page">
${sections}
</div></div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":${height}}}'>
${logic}
</script>
</body>
</html>
`;
  writeFileSync(join(OUT, file), html);
  return html.length;
}

function phone({ file, title, child, height, base }) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;display=swap">
<style>body{margin:0}</style>
</helmet>
<div style="width:390px;min-height:${height}px;background:${base.bg};font-family:'Inter',system-ui,sans-serif;color:${base.ink}">
<dc-import name="${child}" hint-size="390px,${height}px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":390,"height":${height}}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`;
  writeFileSync(join(OUT, file), html);
}

// ---------- Direction A: Ivory editorial ----------
const A = "ia";
const aSections = [
  header(A, { logo: IMG.logoBlack, mark: IMG.markBlack, layout: "masthead" }),
  `<section class="${A}-hero"><div class="${A}-wrap ${A}-hero-grid"><div class="${A}-hero-copy"><h1 class="${A}-h1">Integrated Healthcare Ecosystem for International Patients and <em>Travel Industry</em></h1><p class="${A}-lead">${esc(C.lead)}</p>${ctas(A)}${cred(A)}</div><figure class="${A}-hero-fig" style="margin:0"><img src="${IMG.hub}" alt="MedPark Health Hub and ambulance in Hurghada"><figcaption class="${A}-caption"><span class="${A}-dot"></span>${esc(C.NEW.hubCaption)}</figcaption></figure></div><div class="${A}-wrap">${numbers(A)}</div></section>`,
  statement(A),
  doors(A, `${A}-band`),
  system(A),
  trust(A, `${A}-band`),
  care(A),
  group(A, `${A}-band`),
  whyTabs(A),
  missionVision(A, `${A}-band`),
  quote(A),
  films(A, `${A}-band`, IMG.markBlack),
  impact(A, `${A}-band`),
  blog(A),
  partnerBand(A, `${A}-band`),
  footer(A, "", IMG.logoBlack),
].join("\n");
const aLen = page({
  file: "Main.dc.html", title: "HCIG · Direction A · Ivory editorial", p: A, base: LIGHT, height: 12180, sections: aSections,
  opts: {
    h1: 66, h1phone: 38, radius: 2,
    extra: (S, p) => `
${S} .${p}-masthead{display:flex;justify-content:center;padding-block:36px 28px}
${S} .${p}-masthead .${p}-logo-full{height:120px;width:auto}
${S} .${p}-bar{display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:72px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
${S} .${p}-bar .${p}-logo{display:none}
${S} .${p}-hero{padding-top:72px}
${S} .${p}-hero-grid{display:grid;grid-template-columns:minmax(0,8fr) minmax(0,4fr);gap:64px;align-items:start;padding-bottom:64px}
${S} .${p}-hero-copy{display:grid;gap:34px}
${S} .${p}-h1 em{font-style:normal;color:var(--accent-ink)}
${S} .${p}-hero-fig img{aspect-ratio:4/5;width:100%;object-fit:cover;object-position:58% 78%}
${S} .${p}-cred{padding-top:26px;border-top:1px solid var(--line)}`,
    phone: (S, p) => `
${S} .${p}-masthead{display:none}
${S} .${p}-bar{border-top:0;min-height:68px}
${S} .${p}-bar .${p}-logo{display:block}
${S} .${p}-hero{padding-top:36px}
${S} .${p}-hero-grid{grid-template-columns:minmax(0,1fr);gap:40px;padding-bottom:40px}
${S} .${p}-hero-fig{order:-1}
${S} .${p}-hero-fig img{aspect-ratio:4/3}`,
  },
});

// ---------- Direction B: Noir and turquoise ----------
const B = "nb";
const triptych = [
  [IMG.resortAerial, "On-site medical services in hotels and resorts"],
  [IMG.hospital, "Advanced hospital care"],
  [IMG.booth, "Direct coordination with insurance and assistance partners"],
];
const bSections = [
  header(B, { logo: IMG.logoVWhite, mark: IMG.markWhite, layout: "bar" }),
  `<section class="${B}-hero"><div class="${B}-wrap ${B}-hero-copy"><div class="${B}-hero-cred">${cred(B)}</div><h1 class="${B}-h1">Integrated Healthcare Ecosystem for International Patients and <em>Travel Industry</em></h1><p class="${B}-lead">${esc(C.lead)}</p>${ctas(B)}</div><div class="${B}-wrap"><div class="${B}-trip">${triptych.map(([src, cap], i) => `<figure class="${B}-trip-item ${B}-trip-${i}" style="margin:0"><img src="${src}" alt="${esc(cap)}"><figcaption class="${B}-caption"><span class="${B}-dot"></span>${esc(cap)}</figcaption></figure>`).join("")}</div>${numbers(B)}</div></section>`,
  statement(B),
  doors(B, `${B}-band`),
  system(B),
  trust(B, `${B}-band`),
  care(B),
  group(B, `${B}-band`),
  whyTabs(B),
  missionVision(B, `${B}-band`),
  quote(B),
  films(B, `${B}-band`, IMG.markWhite),
  impact(B, `${B}-band`),
  blog(B),
  partnerBand(B, `${B}-band ${B}-glowband`),
  footer(B, "", IMG.logoWhite),
].join("\n");
const bLen = page({
  file: "Noir.dc.html", title: "HCIG · Direction B · Noir and turquoise", p: B, base: DARK, height: 12840, sections: bSections,
  opts: {
    h1: 92, h1phone: 40, radius: 2,
    extra: (S, p) => `
${S} .${p}-bar{display:flex;align-items:center;justify-content:space-between;gap:24px;padding-block:28px}
${S} .${p}-logo-full{height:120px;width:auto}
${S} .${p}-hero{position:relative;padding-top:56px}
${S} .${p}-hero:before{content:"";position:absolute;left:50%;top:38%;width:1100px;height:900px;transform:translate(-50%,-50%);background:radial-gradient(closest-side,var(--glow),transparent);pointer-events:none}
${S} .${p}-hero-copy{position:relative;display:grid;gap:30px;justify-items:center;text-align:center;padding-bottom:72px}
${S} .${p}-hero-copy .${p}-lead{max-width:56ch}
${S} .${p}-hero-cred{max-width:760px;text-align:left}
${S} .${p}-h1{max-width:17ch}
${S} .${p}-h1 em{font-style:normal;color:var(--accent)}
${S} .${p}-trip{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:end;padding-bottom:72px}
${S} .${p}-trip-item img{width:100%;aspect-ratio:3/4;object-fit:cover;border:1px solid var(--line);border-radius:2px}
${S} .${p}-trip-2 img{object-position:50% 40%}
${S} .${p}-trip-1 img{aspect-ratio:3/4.6}
${S} .${p}-trip-1{transform:translateY(-36px)}
${S} .${p}-num b i{color:var(--accent)}
${S} .${p}-tab.on{background:var(--accent);color:#041314;border-color:var(--accent)}
${S} .${p}-glowband{position:relative}
${S} .${p}-glowband:before{content:"";position:absolute;right:-200px;top:-120px;width:900px;height:700px;background:radial-gradient(closest-side,var(--glow),transparent);pointer-events:none}
${S} .${p}-glowband .${p}-wrap{position:relative}
${S} .${p}-quote-img{filter:grayscale(1) contrast(1.05)}
${S} .${p}-film{background:#0C0E10}
${S} .${p}-chat{background:var(--accent);color:#041314;border-color:var(--accent)}`,
    phone: (S, p) => `
${S} .${p}-bar{padding-block:14px}
${S} .${p}-hero{padding-top:28px}
${S} .${p}-hero-copy{gap:24px;padding-bottom:44px}
${S} .${p}-trip{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px;padding-bottom:40px;margin-right:calc(var(--gutter) * -1);padding-right:var(--gutter)}
${S} .${p}-trip-item{flex:0 0 74%;scroll-snap-align:start}
${S} .${p}-trip-1{transform:none}
${S} .${p}-trip-1 img{aspect-ratio:3/4}`,
  },
});

// ---------- Direction C: Hybrid ----------
const H = "hy";
const cSections = [
  `<div class="${H}-dark ${H}-herowrap"><img class="${H}-hero-bg" src="${IMG.hospital}" alt=""><div class="${H}-hero-shade"></div>${header(H, { logo: IMG.logoVWhite, mark: IMG.markWhite, layout: "bar" })}<section class="${H}-hero"><div class="${H}-wrap" style="width:100%"><div class="${H}-hero-copy"><h1 class="${H}-h1">Integrated Healthcare Ecosystem for International Patients and <em>Travel Industry</em></h1><p class="${H}-lead">${esc(C.lead)}</p>${ctas(H)}</div></div></section></div>`,
  `<div class="${H}-light"><div class="${H}-wrap ${H}-numcard">${numbers(H)}<div class="${H}-numcard-cred">${cred(H)}</div></div></div>`,
  `<div class="${H}-light">${statement(H)}${doors(H, `${H}-band`)}</div>`,
  `<div class="${H}-dark">${system(H)}</div>`,
  `<div class="${H}-light">${trust(H, `${H}-band`)}${care(H)}${group(H, `${H}-band`)}${whyTabs(H)}${missionVision(H, `${H}-band`)}</div>`,
  `<div class="${H}-dark">${quote(H)}${films(H, "", IMG.markWhite)}</div>`,
  `<div class="${H}-light">${impact(H, "")}${blog(H, `${H}-band`)}</div>`,
  `<div class="${H}-dark">${partnerBand(H, "")}${footer(H, "", IMG.logoWhite)}</div>`,
].join("\n");
const cLen = page({
  file: "Hybrid.dc.html", title: "HCIG · Direction C · Hybrid", p: H, base: LIGHT, height: 12040, sections: cSections,
  opts: {
    h1: 74, h1phone: 38, radius: 2,
    extra: (S, p) => `
${S} .${p}-herowrap{position:relative;min-height:860px;display:flex;flex-direction:column}
${S} .${p}-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 60%}
${S} .${p}-hero-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,8,10,.94) 0%,rgba(7,8,10,.86) 44%,rgba(7,8,10,.55) 68%,rgba(7,8,10,.32) 100%)}
${S} .${p}-header{position:relative}
${S} .${p}-bar{display:flex;align-items:center;justify-content:space-between;gap:24px;padding-block:24px;border-bottom:1px solid var(--line)}
${S} .${p}-logo-full{height:120px;width:auto}
${S} .${p}-hero{position:relative;flex:1;display:flex;align-items:center;padding-block:72px 150px}
${S} .${p}-hero-copy{display:grid;gap:30px;max-width:900px}
${S} .${p}-h1 em{font-style:normal;color:var(--accent)}
${S} .${p}-numcard{position:relative;margin-top:-96px;z-index:2}
${S} .${p}-numcard .${p}-nums{background:#FFFFFF;border:1px solid var(--line);box-shadow:0 40px 80px -48px rgba(0,0,0,.4)}
${S} .${p}-numcard .${p}-num{border-top:0;padding:40px 40px 38px}
${S} .${p}-numcard .${p}-num+.${p}-num{padding-left:40px}
${S} .${p}-numcard-cred{padding:28px 0 0}
${S} .${p}-dark .${p}-tab.on{background:var(--accent);color:#041314;border-color:var(--accent)}
${S} .${p}-dark .${p}-steps:before{background:rgba(18,192,198,.45)}
${S} .${p}-dark .${p}-chat{background:var(--accent);color:#041314;border-color:var(--accent)}`,
    phone: (S, p) => `
${S} .${p}-herowrap{min-height:0}
${S} .${p}-hero-shade{background:linear-gradient(180deg,rgba(7,8,10,.55) 0%,rgba(7,8,10,.86) 55%,rgba(7,8,10,.95) 100%)}
${S} .${p}-bar{padding-block:14px}
${S} .${p}-hero{padding-block:56px 120px}
${S} .${p}-numcard{margin-top:-72px}
${S} .${p}-numcard .${p}-num,${S} .${p}-numcard .${p}-num+.${p}-num{padding:20px 22px}`,
  },
});

// ---------- phone artboards ----------
phone({ file: "IvoryPhone.dc.html", title: "HCIG · Direction A · Phone", child: "Main", height: 16520, base: LIGHT });
phone({ file: "NoirPhone.dc.html", title: "HCIG · Direction B · Phone", child: "Noir", height: 16600, base: DARK });
phone({ file: "HybridPhone.dc.html", title: "HCIG · Direction C · Phone", child: "Hybrid", height: 16180, base: LIGHT });

// ---------- the canvas index ----------
const pairs = [
  ["A · Ivory editorial", "Main.dc.html", 12180, "IvoryPhone.dc.html", 16520],
  ["B · Noir and turquoise", "Noir.dc.html", 12840, "NoirPhone.dc.html", 16600],
  ["C · Hybrid", "Hybrid.dc.html", 12040, "HybridPhone.dc.html", 16180],
];
const boards = {}; const order = []; const notes = {};
let x = 0;
pairs.forEach(([label, desk, dh, ph, phH], i) => {
  const key = label.charAt(0);
  boards[desk] = { x, y: 0, w: 1440, h: dh, title: key + " · Desktop", expand: "fill", is_interactive: true };
  boards[ph] = { x: x + 1440 + 80, y: 0, w: 390, h: phH, title: key + " · Phone", is_interactive: true };
  notes["dir" + key] = { x, y: -300, text: label, kind: "title1", maxW: 1910 };
  order.push(desk, ph);
  x += 1440 + 80 + 390 + 200;
});
writeFileSync(join(OUT, "canvas.json"), JSON.stringify({ v: 3, createdOnFiles: { v: 1, at: "2026-10-18T14:30:00Z" }, title: "HCIG Website Directions", launch: { view: "canvas" }, pages: [], boards, order, notes, designSystems: [] }, null, 2));
console.log(`Main ${aLen} B, Noir ${bLen} B, Hybrid ${cLen} B and canvas.json written to ${OUT}`);
