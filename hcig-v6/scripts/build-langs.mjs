// Builds the six other languages, one static export each, into out-langs/<lang>/ (English stays in out/).
//   node scripts/build-langs.mjs            all six
//   node scripts/build-langs.mjs de pl      only these
// Per language: write the translated content copies (i18n-gen), build with HCIG_LANG, flatten the payloads, drop the
// media copy (every language uses the one under the site root), then give the pages their translated addresses from
// i18n/slugs.json (folders renamed and every link rewritten). Run `npm run build` for English as before.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, mkdirSync, statSync, writeFileSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { localPath } from "./slug-map.mjs";

const V6 = join(dirname(fileURLToPath(import.meta.url)), "..");
export const OTHER = ["de", "pl", "fr", "it", "es", "cs"];
const langs = process.argv.slice(2).length ? process.argv.slice(2) : OTHER;
const target = process.env.HCIG_TARGET === "live" ? "live" : "preview";
const root = target === "preview" ? "/hcig/v6" : "";
const SLUGS = existsSync(join(V6, "i18n/slugs.json")) ? JSON.parse(readFileSync(join(V6, "i18n/slugs.json"), "utf8")) : {};
const run = (cmd, args, env = {}) => execFileSync(cmd, args, { cwd: V6, stdio: "inherit", shell: true, env: { ...process.env, ...env } });

/** Every page folder of an export (a folder holding index.html), as a site path like /about/leadership/. */
function pages(dir, rel = "/") {
  const out = existsSync(join(dir, "index.html")) ? [rel] : [];
  for (const e of readdirSync(dir, { withFileTypes: true }))
    if (e.isDirectory() && !e.name.startsWith("_") && e.name !== "media") out.push(...pages(join(dir, e.name), `${rel}${e.name}/`));
  return out;
}

function texts(dir, fn) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "media") texts(p, fn); }
    else if (/\.(html|txt|json|xml|js)$/.test(e.name)) {
      const s = readFileSync(p, "utf8");
      const t = fn(s);
      if (t !== s) writeFileSync(p, t);
    }
  }
}

function applySlugs(lang, dir) {
  const map = SLUGS[lang] || {};
  if (!Object.keys(map).length) return 0;
  const base = `${root}/${lang}`;
  const moves = pages(dir).map((en) => [en, localPath(map, en)]).filter(([a, b]) => a !== b);
  // move each page's own files (and its payload folders); its child pages move by their own entry
  const tmp = join(dir, "__slugs_tmp");
  mkdirSync(tmp, { recursive: true });
  moves.forEach(([en], i) => {
    const from = join(dir, en);
    const to = join(tmp, String(i));
    mkdirSync(to, { recursive: true });
    for (const e of readdirSync(from, { withFileTypes: true }))
      if (!e.isDirectory() || e.name.startsWith("__next")) renameSync(join(from, e.name), join(to, e.name));
  });
  moves.forEach(([, local], i) => {
    const to = join(dir, local);
    mkdirSync(to, { recursive: true });
    for (const name of readdirSync(join(tmp, String(i)))) renameSync(join(tmp, String(i), name), join(to, name));
  });
  rmSync(tmp, { recursive: true, force: true });
  // empty English folders left behind
  (function prune(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) if (e.isDirectory() && !e.name.startsWith("_")) prune(join(d, e.name));
    if (d !== dir && !readdirSync(d).length) rmSync(d, { recursive: true });
  })(dir);
  // every link to a moved page, longest first so a parent never swallows its child
  // site links (with the base path) and absolute live URLs in the schema
  const site = `https://healthcareig.com/${lang}`;
  const pairs = moves.flatMap(([en, local]) => [[`${base}${en}`, `${base}${local}`], [`${site}${en}`, `${site}${local}`]]).sort((a, b) => b[0].length - a[0].length);
  texts(dir, (s) => {
    for (const [a, b] of pairs) if (s.includes(a)) s = s.split(`${a}"`).join(`${b}"`).split(`${a}\\"`).join(`${b}\\"`).split(`${a}#`).join(`${b}#`).split(`${a}<`).join(`${b}<`).split(`${a}?`).join(`${b}?`);
    return s;
  });
  return moves.length;
}

mkdirSync(join(V6, "out-langs"), { recursive: true });
for (const lang of langs) {
  console.log(`\n=== ${lang}`);
  run("node", ["scripts/i18n-gen.mjs", "gen", lang]);
  run("npx", ["next", "build"], { HCIG_LANG: lang });
  run("node", ["scripts/flatten-rsc.mjs"]);
  const dest = join(V6, "out-langs", lang);
  rmSync(dest, { recursive: true, force: true });
  renameSync(join(V6, "out"), dest);
  rmSync(join(dest, "media"), { recursive: true, force: true });
  const n = applySlugs(lang, dest);
  console.log(`${lang}: ${pages(dest).length} pages, ${n} translated addresses`);
}
console.log("\nlanguages built. Now run `npm run build` (English) and `npm run sync`.");
