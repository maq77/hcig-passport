/* Build the preview for another slot and sync it there: `node scripts/preview-slot.mjs v3`
   serves this site at hcig-passport.vercel.app/247clinic/v3 (the user, 2026-09-29:
   "push v4 on v3"). The env var is set here, not in package.json, so it works on Windows. */
import { spawnSync } from "node:child_process";

const slot = process.argv[2];
if (!/^v\d+$/.test(slot || "")) { console.error("usage: node scripts/preview-slot.mjs v3"); process.exit(1); }
const env = { ...process.env, PREVIEW_BASE: `/247clinic/${slot}` };
const run = (cmd) => spawnSync(cmd, { stdio: "inherit", shell: true, env }).status;
if (run("npm run build") !== 0) process.exit(1);
process.exit(run(`node scripts/sync-preview.mjs ${slot}`));
