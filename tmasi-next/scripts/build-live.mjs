// The tmasi.net build (go-live 2026-10-16): no base path, so pages are indexable, canonicals point at
// https://tmasi.net and the live analytics tags load; the quote form posts to the site's own /send.php and reads
// its reply. Output: ../tmasi-live/v3-live-build/ (a fresh copy each run). The preview build (`npm run build`,
// base path /tmasi/v3) is untouched; run it again afterwards before `npm run sync`.
import { execSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const env = { ...process.env, TMASI_BASE_PATH: "", NEXT_PUBLIC_QUOTE_ENDPOINT: "/send.php", SITE_URL: "https://tmasi.net" };

execSync("npx next build", { cwd: root, env, stdio: "inherit" });
execSync("node scripts/flatten-prefetch.mjs", { cwd: root, env, stdio: "inherit" });

const from = join(root, "out");
const to = join(root, "..", "tmasi-live", process.env.LIVE_OUT || "v3-live-build");
if (!existsSync(join(from, "index.html"))) throw new Error("No out/index.html after the live build.");
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log(`Live build copied to ${to}`);
