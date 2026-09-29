/* Copy the preview export (out/) into the root site at src/247clinic-<slot>, which
   build.js serves at /247clinic/<slot>. The slot is v4 by default; `npm run preview:v3`
   builds with PREVIEW_BASE=/247clinic/v3 and syncs into the v3 slot (the user,
   2026-09-29: "push v4 on v3"). Only this copy is committed, so each film is stored
   once in git. */
import fs from "node:fs";
import path from "node:path";

const slot = process.argv[2] || "v4";
const OUT = path.resolve("out");
const DEST = path.resolve("..", "src", `247clinic-${slot}`);
const index = path.join(OUT, "index.html");
if (!fs.existsSync(index)) { console.error("sync: out/index.html missing, run the build first"); process.exit(1); }
/* A build for one slot links every asset under its own base path, so it must never land in the other. */
if (!fs.readFileSync(index, "utf8").includes(`/247clinic/${slot}/`)) {
  console.error(`sync: out/ was not built for /247clinic/${slot}. Run npm run preview${slot === "v4" ? "" : `:${slot}`}.`);
  process.exit(1);
}
fs.rmSync(DEST, { recursive: true, force: true });
fs.cpSync(OUT, DEST, { recursive: true });

/* Draft photos the pages never name stay out of the committed copy (6.5 MB of unused hero
   drafts on 2026-09-29). Only .jpg files in img/: every other asset is copied as it is. */
const texts = [];
(function read(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) read(p); else if (/\.(html|txt|js|css)$/.test(e.name)) texts.push(fs.readFileSync(p, "utf8")); } })(DEST);
const IMG = path.join(DEST, "img");
const left = fs.existsSync(IMG) ? fs.readdirSync(IMG).filter((f) => f.endsWith(".jpg") && !texts.some((t) => t.includes(f))) : [];
for (const f of left) fs.rmSync(path.join(IMG, f));
if (left.length) console.log(`sync: left out ${left.length} unused draft photo(s): ${left.join(", ")}`);

let n = 0, bytes = 0;
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { n++; bytes += fs.statSync(p).size; } } })(DEST);
console.log(`sync: ${n} files, ${(bytes / 1048576).toFixed(1)} MB -> src/247clinic-${slot}`);
