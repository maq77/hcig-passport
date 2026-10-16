// T009 (spec 009 FR-001, FR-002, SC-001; contracts/content-contract.md).
// Fails the build when the built home shows a sentence that is not theirs (foreign) or leaves out one of
// theirs (missing). Sources: src/content/home.en.json (the v3 words), approved-labels.json, the fixed forms
// in approved-edits.json, and the alt texts he approved in media.json.
// Matching ignores all whitespace, so a headline split over several design lines still matches its sentence,
// while an invented sentence never does. Curly quotes, the · dateline mark and arrows are normalised.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const home = read("src/content/home.en.json");
const labels = read("src/content/approved-labels.json").labels.map((l) => l.text);
const edits = read("src/content/approved-edits.json").edits;
const media = existsSync(join(root, "src/content/media.json")) ? read("src/content/media.json") : { assets: [] };
const htmlPath = join(root, "out", "index.html");
if (!existsSync(htmlPath)) {
  console.error("check-words: no out/index.html. Run next build first.");
  process.exit(1);
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', middot: "·", copy: "©", rarr: "→" };
const decode = (t) =>
  t.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e.toLowerCase()] ?? m);
// The comparison key: no whitespace, straight quotes, no arrows or bullet marks.
const key = (t) => decode(t).replace(/[‘’′]/g, "'").replace(/[“”]/g, '"').replace(/[→←↗·•]/g, "").replace(/\s+/g, "");

// ---- page text -------------------------------------------------------------------------------
let html = readFileSync(htmlPath, "utf8");
html = html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, " ");
const attrs = [...html.matchAll(/\s(?:alt|aria-label|title|placeholder)="([^"]*)"/gi)].map((m) => m[1]).filter(Boolean);
const INLINE = "a|span|strong|em|b|i|small|sup|sub|abbr|time|mark|u|s|bdi|bdo|label|svg|path|g|circle|rect|line|polyline|use|img|picture|source|wbr";
const text = html
  .replace(/<\/?(?:br)\s*\/?>/gi, " ")
  .replace(new RegExp(`<\\/?(?:${INLINE})\\b[^>]*>`, "gi"), "")
  .replace(/<[^>]+>/g, "\n");
const segments = [...text.split("\n"), ...attrs].map((t) => decode(t).replace(/\s+/g, " ").trim()).filter((t) => key(t).length > 0);

// ---- sources ---------------------------------------------------------------------------------
const SKIP_KEYS = new Set(["href", "tel", "image", "icon", "value", "suffix", "n", "accent", "_about", "pulseHref", "viewAllHref", "code"]);
const OPTIONAL_TOP = new Set(["ui", "head"]);
const OPTIONAL_KEYS = new Set(["thanks", "thanksText", "sending", "errorBefore", "errorAfter", "showMore", "languages", "language"]);
const required = []; // [section, text]
const allowed = [];
function walk(v, section, optional, k) {
  if (v == null || SKIP_KEYS.has(k)) return;
  if (typeof v === "string") {
    allowed.push(v);
    if (!optional) required.push([section, v]);
  } else if (Array.isArray(v)) {
    // Hero and Relax titles are arrays of segments: one sentence when joined.
    if (v.length && v.every((x) => x && typeof x === "object" && "t" in x)) walk(v.map((x) => x.t).join(""), section, optional, k);
    else v.forEach((x) => walk(x, section, optional, k));
  } else if (typeof v === "object") {
    for (const [kk, vv] of Object.entries(v)) walk(vv, section, optional || OPTIONAL_KEYS.has(kk), kk);
  }
}
for (const [section, v] of Object.entries(home)) if (section !== "_about") walk(v, section, OPTIONAL_TOP.has(section), section);
allowed.push(...labels, ...edits.map((e) => e.fixed), ...media.assets.filter((a) => a.status === "approved").map((a) => a.alt).filter(Boolean));

// A fixed sentence replaces its source as the required form.
const fixedFor = new Map(edits.map((e) => [key(e.source), e.fixed]));
const corpus = allowed.map(key).join("\u0000");
const labelKeys = new Set(labels.map(key));
const pageKey = segments.map(key).join("");

const foreign = segments.filter((s) => !labelKeys.has(key(s)) && !corpus.includes(key(s)));
const missing = required.filter(([, t]) => {
  const want = fixedFor.get(key(t)) ?? t;
  return !pageKey.includes(key(want));
});

console.log(`check-words: ${segments.length} text pieces, ${required.length} required source texts, ${foreign.length} foreign, ${missing.length} missing`);
for (const f of [...new Set(foreign)].slice(0, 40)) console.log(`  FOREIGN  "${f.slice(0, 120)}"`);
for (const [section, t] of missing.slice(0, 60)) console.log(`  MISSING  [${section}] "${t.slice(0, 110)}"`);
if (foreign.length || missing.length) process.exit(1);
