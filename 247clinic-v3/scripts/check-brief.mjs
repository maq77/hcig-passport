/* The word-for-word gate (specs/007-247clinic-v3/contracts/content.md).
   Every visible sentence, alt, aria-label, title and meta description in out/ must be
   found in the brief (docs/247clinic-website-brief.md and the content JSON made from
   it), in their published reviews, in the logo names, or in our registered UI labels.
   Punctuation is ignored, words are not. Exits 1 on any failure. */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("..");
const OUT = path.resolve("out");

const norm = (s) => s.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/* ---- the corpus ---- */
const jsonStrings = (v, acc = []) => {
  if (typeof v === "string") acc.push(v);
  else if (Array.isArray(v)) v.forEach((x) => jsonStrings(x, acc));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (k !== "devNotes") jsonStrings(x, acc);
  return acc;
};
const contentDir = path.join(ROOT, "content", "247clinic", "en");
const parts = [fs.readFileSync(path.join(ROOT, "docs", "247clinic-website-brief.md"), "utf8")];
for (const f of fs.readdirSync(contentDir)) parts.push(...jsonStrings(JSON.parse(fs.readFileSync(path.join(contentDir, f), "utf8"))));
parts.push(...jsonStrings(JSON.parse(fs.readFileSync(path.join(ROOT, "content", "247clinic", "reviews.json"), "utf8")).reviews));
/* Changes he named (logged with his words) and lines he allowed from their live site. */
const approved = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "247clinic", "approved-edits.json"), "utf8"));
for (const e of approved.edits) parts.push(...[].concat(e.to ?? [], e.text ?? []));
parts.push(...approved.fromTheirSite.text);
const corpus = ` ${parts.map(norm).join(" | ")} `;

const ui = JSON.parse(fs.readFileSync(path.resolve("src/content/ui-labels.json"), "utf8"));
const labels = new Set(ui.labels.map(norm));
const patterns = ui.patterns.map((p) => new RegExp(p));
const media = fs.readFileSync(path.resolve("src/data/media.ts"), "utf8");
for (const m of media.matchAll(/name: "([^"]+)"/g)) labels.add(norm(m[1]));
const clinics = fs.readFileSync(path.resolve("src/data/clinics.ts"), "utf8");
/* every hotel name in the clinic data, as their data has it and as corrected */
for (const call of clinics.matchAll(/\bc\(([^)]*)\)/g)) for (const s of call[1].matchAll(/"([^"]+)"/g)) labels.add(norm(s[1]));

/* ---- extract text from a built page ---- */
const decode = (s) => s
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&ldquo;/g, "“").replace(/&rdquo;/g, "”").replace(/&copy;/g, "©")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));

function chunks(html) {
  const out = [];
  const title = html.match(/<title>([\s\S]*?)<\/title>/);
  if (title) out.push(["title", decode(title[1])]);
  const desc = html.match(/<meta name="description" content="([^"]*)"/);
  if (desc) out.push(["meta", decode(desc[1])]);
  const body = html.slice(html.indexOf("<body"))
    .replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<template[\s\S]*?<\/template>/g, " ").replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<div class="slot-in"[\s\S]*?<\/div>/g, " ");
  for (const m of body.matchAll(/\s(alt|aria-label|title)="([^"]*)"/g)) if (m[2].trim()) out.push([m[1], decode(m[2])]);
  for (const t of body.replace(/<[^>]+>/g, "\u0000").split("\u0000")) {
    const s = decode(t).trim();
    if (s) out.push(["text", s]);
  }
  return out;
}

const ok = (s) => {
  const n = norm(s);
  if (!n) return true;
  if (patterns.some((re) => re.test(s.trim()))) return true;
  if (labels.has(n)) return true;
  return corpus.includes(` ${n} `);
};

/* ---- run ---- */
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!e.name.startsWith("_next")) walk(p); }
    else if (e.name.endsWith(".html")) pages.push(p);
  }
})(OUT);

let fails = 0;
for (const file of pages) {
  const rel = path.relative(OUT, file);
  const html = fs.readFileSync(file, "utf8");
  for (const [kind, raw] of chunks(html)) {
    /* a whole registered pattern (design slots, phone) passes as it is; otherwise
       "Title | Brand" and "Label: Name" are two things, each checked on its own */
    if (patterns.some((re) => re.test(raw.trim()))) continue;
    const pieces = raw.split(/\s\|\s|:\s/);
    for (const s of pieces) {
      const problems = [];
      if (/[–—]/.test(s)) problems.push("em or en dash");
      if (/lorem|\bTODO\b/i.test(s)) problems.push("placeholder text");
      if (/accredit\w*[^.]{0,60}(GHA|DMWV|German Medical Wellness)/i.test(s)) problems.push("accreditation wording next to a partner body");
      if (!ok(s)) problems.push("not in the brief or the UI labels");
      if (problems.length) {
        fails++;
        console.log(`FAIL ${rel} [${kind}] "${s.slice(0, 120)}" -> ${problems.join(", ")}`);
      }
    }
  }
}
console.log(fails ? `\ncheck-brief: ${fails} failure(s) in ${pages.length} page(s).` : `check-brief: ${pages.length} page(s), every sentence is the brief's.`);
process.exit(fails ? 1 : 0);
