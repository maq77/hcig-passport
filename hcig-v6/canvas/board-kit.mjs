// Shared pieces for the option boards (round 5 on): content, canvas uploads, hairline icons, the board wrapper.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const V6 = join(HERE, "..");
export const C = await import(pathToFileURL(join(V6, "src/content/home.mjs")).href);
const BLOBS = JSON.parse(readFileSync(join(HERE, "blobs.json"), "utf8"));
export const B = (k) => { const v = BLOBS[k]; if (!v) throw new Error("no blob " + k); return v.startsWith("/_blob/") ? v : "/_blob/" + v; };
const ICONS = Object.fromEntries([...readFileSync(join(V6, "src/lib/icons.ts"), "utf8").matchAll(/^\s+(\w+): '(.+)',$/gm)].map((m) => [m[1], m[2]]));
export const ic = (n, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const pad = (i) => String(i + 1).padStart(2, "0");

export const BASE = `
@font-face { font-family: 'Helma'; src: url('${B("helma")}') format('woff2'); font-weight: 400; font-display: swap; }
body { margin: 0; }
.ph { --black:#000; --b80:#333; --dim:#565759; --d60:#9A9A9C; --d40:#BBBCBE; --d20:#DDDDDF; --d06:#F6F6F6;
  --t:#12C0C6; --t60:#71D9DD; --t40:#A0E6E8; --t20:#D0F2F4; --t08:#EDFAFA; --w:#FFF; --ease: cubic-bezier(.16,1,.3,1);
  position: relative; font: 400 16px/1.6 'Inter', system-ui, sans-serif; color: var(--black); background: var(--w); -webkit-font-smoothing: antialiased; box-sizing: border-box; overflow: hidden; }
.ph *, .ph *::before, .ph *::after { box-sizing: border-box; }
.ph img { display: block; max-width: 100%; }
.ph p { margin: 0; }
.tag { position: absolute; top: 10px; right: 10px; z-index: 30; padding: 5px 10px; border-radius: 999px; background: var(--black); color: var(--w); font: 600 11px/1 'Inter', sans-serif; letter-spacing: .08em; }
.sec { position: relative; padding: 44px 20px 40px; }
.soft { background: var(--d06); }
.hd2 { margin: 0 0 24px; text-align: center; }
.hd2 h2 { margin: 0; font: 400 32px/1.1 'Helma', Georgia, serif; text-wrap: balance; }
.hd2 h2::after { content: ""; display: block; width: 56px; height: 1px; margin: 16px auto 0; background: var(--black); }
.hd2 p { margin-top: 14px; color: var(--dim); font-size: 15px; }
.eyebrow { display: inline-flex; align-items: center; gap: 10px; font: 500 11.5px/1 'Inter', sans-serif; letter-spacing: .22em; text-transform: uppercase; color: var(--dim); }
.eyebrow::before { content: ""; width: 26px; height: 1px; background: currentColor; }
.btn { display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 22px; border-radius: 999px; background: var(--t); color: var(--black); font: 600 14px/1 'Inter', sans-serif; }
.cbtn { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid var(--d20); background: var(--w); color: var(--black); flex: none; }
.cbtn.l svg { transform: scaleX(-1); }
`;
export const board = (title, css, body, w, h) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap">
<style>${BASE}${css}</style>
</helmet>
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`;
export const head = (h, sub) => `<div class="hd2"><h2>${esc(h)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>`;

/** Write the boards and register them on a canvas page. */
export function publishBoards(boards, pageId, pageName) {
  const P = join(HERE, "project");
  const cj = JSON.parse(readFileSync(join(P, "canvas.json"), "utf8"));
  if (!cj.pages.some((p) => p.id === pageId)) cj.pages.splice(1, 0, { id: pageId, name: pageName });
  for (const b of boards) {
    const f = `${b.id}.dc.html`;
    writeFileSync(join(P, f), b.html);
    cj.boards[f] = { x: b.x, y: b.y, w: b.w, h: b.h, title: b.title, page: pageId, is_interactive: true };
    if (!cj.order.includes(f)) cj.order.push(f);
  }
  writeFileSync(join(P, "canvas.json"), JSON.stringify(cj, null, 2));
  console.log("boards:", boards.map((b) => b.id).join(" "));
}
