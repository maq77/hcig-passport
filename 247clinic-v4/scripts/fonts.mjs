/* Calisto MT (licensed, supplied by the user 2026-09-23) -> Latin woff2 subsets.
   The raw TTFs stay in `247 material/` and are gitignored; only these subsets ship.
   Latin Extended-A is kept so German, Polish and Czech headings render later. */
import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const SRC = path.resolve("..", "247 material");
const OUT = path.resolve("src", "fonts");
fs.mkdirSync(OUT, { recursive: true });

const UNICODES = "U+0000-00FF,U+0100-017F,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212";

for (const [file, out] of [
  ["Calisto MT Regular.ttf", "calisto-400.woff2"],
  ["Calisto MT Bold.ttf", "calisto-700.woff2"],
]) {
  execFileSync("python", [
    "-m", "fontTools.subset", path.join(SRC, file),
    `--unicodes=${UNICODES}`, "--flavor=woff2", "--layout-features=*",
    `--output-file=${path.join(OUT, out)}`,
  ], { stdio: "inherit" });
  console.log(out, Math.round(fs.statSync(path.join(OUT, out)).size / 1024), "KB");
}
