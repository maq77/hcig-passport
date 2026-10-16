// T012 (spec 009 FR-022b; plan.md weight budget; contracts/media-contract.md).
// Fails the build when the first-load JavaScript, the 3D chunk or any media file is over its budget.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
const KB = 1024;
const problems = [];
const gz = (p) => gzipSync(readFileSync(p), { level: 9 }).length;
const files = (d) => (existsSync(d) ? readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? files(join(d, n)) : [join(d, n)])) : []);

// 1. JavaScript the home loads before any 3D: every <script src> in out/index.html.
const html = readFileSync(join(OUT, "index.html"), "utf8");
const base = "/tmasi/v4";
const firstLoad = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1].replace(base, "")).filter((s) => s.startsWith("/_next/"));
const firstKB = firstLoad.reduce((n, s) => n + gz(join(OUT, ...s.split("/"))), 0) / KB;
// 220 KB: Next 16 + React 19 alone measured 169 KB (2026-10-04); v3's home loads 261 KB.
if (firstKB > 220) problems.push(`first-load JS ${firstKB.toFixed(0)} KB gzip > 220 KB`);

// 2. The 3D chunk: the chunk that carries the three.js renderer, loaded after first paint.
const chunks = files(join(OUT, "_next", "static", "chunks")).filter((f) => f.endsWith(".js"));
const three = chunks.filter((f) => readFileSync(f, "utf8").includes("WebGLRenderer"));
const threeKB = three.reduce((n, f) => n + gz(f), 0) / KB;
if (three.some((f) => firstLoad.some((s) => f.replaceAll(sep, "/").endsWith(s)))) problems.push("the 3D chunk is in the first load: it must load after first paint");
if (threeKB > 190) problems.push(`3D chunk ${threeKB.toFixed(0)} KB gzip > 190 KB`);

// 3. Media budgets per folder (KB on disk). "-phone" files get the phone budget.
const BUDGET = {
  globe: { still: [120, 80], bin: [40, 40] },
  img: [200, 120],
  icons: [25, 25],
  logos: [30, 30],
  posters: [80, 60],
  loops: [1536, 1024],
  film: [14336, 7168],
};
for (const f of files(OUT)) {
  const rel = relative(OUT, f).split(sep);
  const folder = rel[0];
  if (!(folder in BUDGET) || f.endsWith(".html")) continue;
  const phone = /-phone\./.test(f);
  let limits = BUDGET[folder];
  if (folder === "globe") limits = f.endsWith(".bin") ? BUDGET.globe.bin : BUDGET.globe.still;
  const max = limits[phone ? 1 : 0];
  const size = statSync(f).size / KB;
  if (size > max) problems.push(`${rel.join("/")} ${size.toFixed(0)} KB > ${max} KB`);
}

console.log(`check-weight: first-load JS ${firstKB.toFixed(0)} KB gzip, 3D chunk ${threeKB.toFixed(0)} KB gzip (${three.length} file), ${problems.length} problems`);
for (const p of problems) console.log(`  OVER  ${p}`);
if (problems.length) process.exit(1);
