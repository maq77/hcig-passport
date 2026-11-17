// Tiny .env.local loader for scripts (no dependency). Import it first: `import "./_env.mjs"`.
// Real environment variables win over the file.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const MISSING_KEY = "Add ELEVENLABS_API_KEY to tmasi-callcenter/.env.local";

for (const name of [".env.local", ".env"]) {
  const f = join(ROOT, name);
  if (!existsSync(f)) continue;
  for (const raw of readFileSync(f, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (val !== "" && process.env[key] === undefined) process.env[key] = val;
  }
}

export const hasElevenLabsKey = () => Boolean(process.env.ELEVENLABS_API_KEY);
