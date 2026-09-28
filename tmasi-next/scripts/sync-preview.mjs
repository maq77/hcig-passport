// Copies the static export (out/) into the HCIG Work source tree, where build.js serves it at /tmasi/v3.
// Run after `npm run build`: `npm run sync`. Same pattern as 247clinic-v3.
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const from = join(here, "..", "out");
const to = join(here, "..", "..", "src", "tmasi-v3");

if (!existsSync(join(from, "index.html"))) {
  console.error("No out/index.html. Run `npm run build` first.");
  process.exit(1);
}
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log(`Synced ${from} -> ${to}`);
