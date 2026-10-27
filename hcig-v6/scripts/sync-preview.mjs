/* Copy the preview export (out/) into the root site at src/hcig-v6, which build.js serves at /hcig/v6.
   Only this copy is committed. */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const DEST = path.resolve("..", "src", "hcig-v6");
const index = path.join(OUT, "index.html");
if (!fs.existsSync(index)) { console.error("sync: out/index.html missing, run the build first"); process.exit(1); }
if (!fs.readFileSync(index, "utf8").includes("/hcig/v6/")) { console.error("sync: out/ was not built for /hcig/v6"); process.exit(1); }
fs.rmSync(DEST, { recursive: true, force: true });
fs.cpSync(OUT, DEST, { recursive: true });

/* The other languages (scripts/build-langs.mjs) sit beside English: /hcig/v6/de/, /hcig/v6/pl/ and so on. */
const LANGS = path.resolve("out-langs");
if (fs.existsSync(LANGS)) for (const l of fs.readdirSync(LANGS)) {
  if (!fs.existsSync(path.join(LANGS, l, "index.html"))) continue;
  fs.cpSync(path.join(LANGS, l), path.join(DEST, l), { recursive: true });
  console.log(`sync: + ${l}`);
}

/* Media the page never names stay out of the committed copy (night film cuts, full testimonial films are kept: Watch uses them). */
const texts = [];
(function read(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) read(p); else if (/\.(html|txt|js|css|json)$/.test(e.name) && e.name !== "manifest.json") texts.push(fs.readFileSync(p, "utf8")); } })(DEST);
const MEDIA = path.join(DEST, "media");
const unused = [];
(function prune(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) prune(p); else if (!texts.some((t) => t.includes(e.name))) { fs.rmSync(p); unused.push(e.name); } } })(MEDIA);
if (unused.length) console.log(`sync: left out ${unused.length} unused media file(s)`);

let n = 0, bytes = 0;
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { n++; bytes += fs.statSync(p).size; } } })(DEST);
console.log(`sync: ${n} files, ${(bytes / 1048576).toFixed(1)} MB -> src/hcig-v6`);
