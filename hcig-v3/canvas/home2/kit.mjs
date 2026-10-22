// Shared kit for the home v2 sections: the brand palette exactly (Black, Dim Gray #565759, Turquoise #12C0C6, White and
// tints), Helma + Inter, night and day with the hero's timing, reveal on scroll, drawn hairline icons, buttons, board wrappers.
// Same values as hcig-v3/canvas/sections/build-sections.mjs, so v1 and v2 sections look alike.
import { writeFileSync } from "node:fs";
import { join } from "node:path";

export const HEAD = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap">
<style>
@font-face{font-family:'Helma';src:url('/_blob/dd74c2cb45ea68cbd798ea38d33c7729') format('woff2');font-weight:400;font-style:normal;font-display:swap}
body{margin:0}`;

export const TOKENS = (cls) => `.${cls}{--accent:#12C0C6;--ink:#FFFFFF;--ink2:#DDDDDF;--muted:#BBBCBE;--line:#333333;--paper:#000000;--card:rgba(255,255,255,.035);--serif:'Helma',Georgia,'Times New Roman',serif;--sans:'Inter',system-ui,-apple-system,'Segoe UI',Arial,sans-serif;--gutter:clamp(20px,5cqi,80px);--ease:cubic-bezier(.16,1,.3,1);--sweep-ease:cubic-bezier(.45,.05,.35,1);
  container-type:inline-size;container-name:${cls};background:var(--paper);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;font-synthesis:none;
  transition:background-color 1.3s var(--sweep-ease) .9s,color 1s var(--sweep-ease) 1s}
.${cls}.light{--ink:#000000;--ink2:#565759;--muted:#565759;--line:#DDDDDF;--paper:#FFFFFF;--card:#FFFFFF}
.${cls} *{box-sizing:border-box}
.${cls} .in-w{max-width:1440px;margin:0 auto;padding:128px var(--gutter)}
.${cls} .eye{margin:0;font:600 13px/1.2 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
.${cls} .h2{margin:0;font-family:var(--serif);font-weight:600;font-synthesis:weight;font-size:64px;line-height:1.03;letter-spacing:-.015em;text-wrap:balance}
.${cls} .acc{color:var(--accent)}
.${cls} .lead{margin:0;font-size:20px;line-height:1.55;color:var(--ink2);max-width:46ch;text-wrap:pretty;transition:color 1s var(--sweep-ease) 1s}
@container ${cls} (max-width:900px){.${cls} .in-w{padding:76px var(--gutter)}.${cls} .h2{font-size:36px;line-height:1.08}.${cls} .lead{font-size:17px}}
@container ${cls} (max-width:370px){.${cls} .h2{font-size:32px}}`;

// reveal on scroll from a visible resting state: nothing hides until the script arms it, so a board is complete at rest
export const REVEAL = (cls) => `.${cls}.arm .rv{opacity:0;transform:translateY(22px)}
.${cls}.in .rv{opacity:1;transform:none;transition:opacity .9s var(--ease) calc(var(--d,0) * 1ms),transform 1.1s var(--ease) calc(var(--d,0) * 1ms)}
@media (prefers-reduced-motion:reduce){.${cls} .rv{opacity:1!important;transform:none!important;transition:none!important}}`;

// drawn hairline icons: <span class="ic"><svg viewBox="0 0 24 24"> paths with pathLength="1" </svg></span>
export const ICONS = (cls, size = 56) => `.${cls} .ic{flex:none;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;border:1px solid var(--line);transition:border-color .45s var(--ease)}
.${cls} .ic svg{width:${Math.round(size / 2)}px;height:${Math.round(size / 2)}px;fill:none;stroke:var(--accent);stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.${cls} .ic path,.${cls} .ic circle,.${cls} .ic rect{stroke-dasharray:1;stroke-dashoffset:0}
.${cls}.arm .ic path,.${cls}.arm .ic circle,.${cls}.arm .ic rect{stroke-dashoffset:1}
.${cls}.in .ic path,.${cls}.in .ic circle,.${cls}.in .ic rect{stroke-dashoffset:0;transition:stroke-dashoffset 1.2s var(--ease) calc(var(--d,0) * 1ms + 350ms)}
.${cls} .hov:hover .ic{border-color:var(--accent)}
.${cls} .hov:hover .ic path,.${cls} .hov:hover .ic circle,.${cls} .hov:hover .ic rect{animation:${cls}Draw 1.1s var(--ease)}
@keyframes ${cls}Draw{0%{stroke-dashoffset:1}100%{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.${cls} .ic path,.${cls} .ic circle,.${cls} .ic rect{stroke-dashoffset:0!important;animation:none!important}}`;
export const icon = (paths) => `<span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24">${paths}</svg></span>`;
export const P = (d) => `<path d="${d}" pathLength="1"/>`;
export const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" pathLength="1"/>`;

// buttons: the hero's primary (Turquoise, Black text) and the outline secondary
export const BUTTONS = (cls) => `.${cls} .btn{white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:56px;padding:0 30px;border-radius:999px;background:var(--accent);color:#000000;font:600 15px/1 var(--sans);text-decoration:none;border:1px solid var(--accent);position:relative;overflow:hidden;cursor:pointer;transition:transform .25s var(--ease),box-shadow .35s}
.${cls} .btn:after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);transform:translateX(-120%);transition:transform .9s var(--ease)}
.${cls} .btn:hover{transform:translateY(-1px);box-shadow:0 16px 36px -14px rgba(18,192,198,.8)}.${cls} .btn:hover:after{transform:translateX(120%)}
.${cls} .btn2{white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:56px;padding:0 30px;border-radius:999px;background:transparent;color:var(--ink);font:600 15px/1 var(--sans);text-decoration:none;border:1px solid var(--line);cursor:pointer;transition:border-color .3s,color 1s var(--sweep-ease) 1s}
.${cls} .btn2:hover{border-color:var(--accent)}
.${cls} .btn:focus-visible,.${cls} .btn2:focus-visible,.${cls} a:focus-visible,.${cls} button:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
@container ${cls} (max-width:900px){.${cls} .btn,.${cls} .btn2{width:100%;min-height:54px}}`;
export const ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/></svg>';

// arm the reveal when the section is out of view, play it once when it comes in; p runs 0..1 for count-ups
export const REVEAL_JS = `  componentDidMount() {
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

// one section component file. vals is the body of renderVals after s, theme and rootRef are set; it must return an object
// that includes rootRef and cls (use CLS below). extraJs adds methods to the class.
export const CLS = "theme + (s.arm ? ' arm' : '') + (s.inv ? ' in' : '')";
export const page = (title, css, body, props, vals, extraJs = "") => `<!doctype html>
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
${REVEAL_JS}
${extraJs}
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
export const THEME_PROP = (h) => ({ theme: { editor: "enum", options: ["dark", "light"], default: "dark", section: "Section" }, $preview: { width: 1440, height: h } });

// thin board wrapper around a component, night or day, desktop or phone
export const wrap = (OUT, comp, file, title, w, h, theme) => writeFileSync(join(OUT, file), `<!doctype html>
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
