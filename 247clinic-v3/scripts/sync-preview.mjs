/* Copy the preview export (out/) into the root site at src/247clinic-v3, which
   build.js serves at /247clinic/v3. Only this copy is committed, so each film is
   stored once in git. */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const DEST = path.resolve("..", "src", "247clinic-v3");
if (!fs.existsSync(path.join(OUT, "index.html"))) { console.error("sync: out/index.html missing, run the build first"); process.exit(1); }
fs.rmSync(DEST, { recursive: true, force: true });
fs.cpSync(OUT, DEST, { recursive: true });
let n = 0, bytes = 0;
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { n++; bytes += fs.statSync(p).size; } } })(DEST);
console.log(`sync: ${n} files, ${(bytes / 1048576).toFixed(1)} MB -> src/247clinic-v3`);
