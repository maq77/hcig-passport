/* The design gate (spec 015 section 3). Runs after check-brief in `npm run build`.
   Scans src/app/**\/*.css (not the two files the home editor writes) and the inline styles of
   src/**\/*.tsx (not the editor itself, a development tool). It fails on:
   - a colour gradient: any gradient( outside a mask-image declaration, except the --panel token built from the burgundy stops
   - !important outside a @media (prefers-reduced-motion: reduce) block
   - more than three font families (the sans, lux and display variables; generic fallbacks are fine)
   and warns on a hex colour that is not one of the tokens. Prints a short report. */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const SKIP_CSS = new Set(["editor-overrides.css", "theme-overrides.css"]);
const SKIP_DIRS = new Set(["editor", "node_modules"]);
const ALLOWED_HEX = new Set(["#fbf8f4", "#1a1414", "#c00000", "#e8121c", "#25d366", "#0b7a3a", "#1da851", "#5f0008", "#86020d", "#3a0006", "#f7b7b7", "#ffffff", "#fff", "#000", "#000000"]);
const GENERIC = new Set(["serif", "sans-serif", "system-ui", "-apple-system", "monospace", "cursive", "fantasy", "ui-sans-serif", "ui-serif", "inherit", "initial", "unset", "segoe ui", "arial", "georgia", "book antiqua", "palatino", "cormorant garamond", "helvetica"]);

function walk(dir, test, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, test, out);
    else if (test(e.name)) out.push(p);
  }
  return out;
}
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, "/");
const lineOf = (src, i) => src.slice(0, i).split("\n").length;

const fails = [];
const warns = [];
const families = new Map(); // primary family -> first place seen
let scanned = 0;

/* Ranges of every @media (prefers-reduced-motion: reduce) { ... } block. */
function reducedRanges(src) {
  const out = [];
  const re = /@media[^{]*prefers-reduced-motion:\s*reduce[^{]*\{/g;
  let m;
  while ((m = re.exec(src))) {
    let depth = 1, j = m.index + m[0].length;
    while (j < src.length && depth) { if (src[j] === "{") depth++; else if (src[j] === "}") depth--; j++; }
    out.push([m.index, j]);
  }
  return out;
}

/* Each declaration as [property, value, index], comments removed (kept as spaces so indexes hold). */
function declarations(src) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, (c) => " ".repeat(c.length));
  const out = [];
  const re = /([a-zA-Z-]+)\s*:\s*([^;{}]+)(?=[;}])/g;
  let m;
  while ((m = re.exec(clean))) out.push([m[1].toLowerCase(), m[2], m.index]);
  return { clean, out };
}

/* The first family of a stack, with the token variables folded to the three real families. */
function familyOf(value) {
  const first = value.split(",")[0].trim().replace(/^["']|["']$/g, "");
  if (/^var\(--font-(sans|body)\)$/.test(first)) return "sans (Poppins)";
  if (/^var\(--font-(lux|head|serif)\)$/.test(first)) return "lux (Cormorant Garamond)";
  if (/^var\(--font-(display|num)\)$/.test(first)) return "display (Calisto)";
  return first;
}

/* The one allowed colour gradient: the brand panel, a custom property named --panel* whose stops are
   only the burgundy hexes sampled from the logo (never black, never another colour). */
const PANEL_HEX = new Set(["#86020d", "#5f0008", "#3a0006"]);
function brandPanel(prop, value) {
  if (!/^--panel[\w-]*$/.test(prop)) return false;
  const hexes = value.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  return hexes.length >= 2 && hexes.every((h) => PANEL_HEX.has(h.toLowerCase())) && !/rgba?\(|hsl|var\(/i.test(value);
}

function check(file, src, { css }) {
  scanned++;
  const ranges = css ? reducedRanges(src) : [];
  const inReduced = (i) => ranges.some(([a, b]) => i >= a && i < b);
  const { clean, out } = declarations(src);

  for (const [prop, value, i] of out) {
    if (/gradient\(/i.test(value) && !/^(-webkit-)?mask(-image)?$/.test(prop) && !brandPanel(prop, value)) {
      fails.push(`${rel(file)}:${lineOf(src, i)} colour gradient in ${prop}`);
    }
    if (prop === "font-family" || prop === "font") {
      const v = prop === "font" ? value.replace(/^.*?\d+(px|em|rem|%)(\/[\d.]+\w*)?\s+/, "") : value;
      const fam = familyOf(v);
      if (fam && !GENERIC.has(fam.toLowerCase()) && !families.has(fam)) families.set(fam, `${rel(file)}:${lineOf(src, i)}`);
    }
  }
  /* custom properties that define a font stack count too */
  for (const m of clean.matchAll(/--font-[a-z]+\s*:\s*([^;}]+)/g)) {
    const fam = familyOf(m[1]);
    if (fam && !GENERIC.has(fam.toLowerCase()) && !families.has(fam)) families.set(fam, `${rel(file)}:${lineOf(src, m.index)}`);
  }
  for (const m of clean.matchAll(/!important/g)) {
    if (!inReduced(m.index)) fails.push(`${rel(file)}:${lineOf(src, m.index)} !important outside the reduced motion block`);
  }
  for (const m of clean.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const before = clean.slice(Math.max(0, m.index - 1), m.index);
    if (/[\w-]/.test(before)) continue;
    if (!ALLOWED_HEX.has(m[0].toLowerCase())) warns.push(`${rel(file)}:${lineOf(src, m.index)} ${m[0]} is not a token`);
  }
}

/* CSS */
for (const f of walk(path.join(ROOT, "src", "app"), (n) => n.endsWith(".css") && !SKIP_CSS.has(n))) check(f, fs.readFileSync(f, "utf8"), { css: true });

/* TSX inline styles: style={{ ... }} objects, written as CSS-like text for the same checks. */
for (const f of walk(path.join(ROOT, "src"), (n) => n.endsWith(".tsx"))) {
  const src = fs.readFileSync(f, "utf8");
  let i = 0, any = false;
  while ((i = src.indexOf("style={{", i)) !== -1) {
    let j = i + 8, depth = 2;
    while (j < src.length && depth) { if (src[j] === "{") depth++; else if (src[j] === "}") depth--; j++; }
    const body = src.slice(i + 8, j - 2);
    const asCss = body.replace(/([a-zA-Z]+)\s*:/g, (_, k) => `${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:`).replace(/,\s*(?=[a-zA-Z"[-]+\s*:)/g, ";") + ";";
    const pad = " ".repeat(i + 8);
    check(f, pad + asCss, { css: false });
    any = true;
    i = j;
  }
  if (/gradient\(/.test(src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")) && !/mask/i.test(src)) fails.push(`${rel(f)} colour gradient in a class or string`);
  if (!any) scanned++;
}

const famList = [...families.keys()];
if (famList.length > 3) fails.push(`${famList.length} font families referenced (at most 3): ${famList.map((f) => `${f} (${families.get(f)})`).join(", ")}`);

console.log(`audit-design: ${scanned} file(s) scanned.`);
console.log(`  font families: ${famList.join(", ") || "none"}`);
if (warns.length) {
  console.log(`  ${warns.length} warning(s), hex colours outside the tokens:`);
  for (const w of warns) console.log(`    WARN ${w}`);
}
if (fails.length) {
  console.log(`  ${fails.length} failure(s):`);
  for (const x of fails) console.log(`    FAIL ${x}`);
  process.exit(1);
}
console.log("  no colour gradients, no !important outside reduced motion, families within three.");
