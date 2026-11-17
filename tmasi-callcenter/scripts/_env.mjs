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

// Two accounts: `--account 2` makes this script use ELEVENLABS_API_KEY_2 and account 2's own agent and knowledge files.
export const KEY_1 = process.env.ELEVENLABS_API_KEY;
const ai = process.argv.indexOf("--account");
export const ACCOUNT = ai > -1 ? String(process.argv[ai + 1] ?? "") : "1";
if (ACCOUNT !== "1" && ACCOUNT !== "2") {
  console.error("--account must be 1 or 2");
  process.exit(1);
}
if (ACCOUNT === "2") {
  if (!process.env.ELEVENLABS_API_KEY_2) {
    console.error("Add ELEVENLABS_API_KEY_2 to tmasi-callcenter/.env.local");
    process.exit(1);
  }
  process.env.ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY_2;
}
export const agentFileName = (a = ACCOUNT) => (a === "1" ? "agent.json" : `agent-${a}.json`);
/** Account 2 keeps its knowledge doc ids in a file; account 1 keeps them in knowledge_docs.el_doc_id. */
export const kbMapFileName = (a = ACCOUNT) => `kb-account-${a}.json`;

export const hasElevenLabsKey = () => Boolean(process.env.ELEVENLABS_API_KEY);
