// key:use. Switch the account new calls use: `npm run key:use -- 2` (or 1). Without a number it only shows the state.
// Shows credits left on both accounts and whether each has its agent.
import "./_env.mjs";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { KEY_1 } from "./_env.mjs";
import { dataDir } from "@tc/db";

const want = process.argv[2];
const keys = { 1: KEY_1, 2: process.env.ELEVENLABS_API_KEY_2 };
const agentFile = (a) => join(dataDir(), a === "1" ? "agent.json" : `agent-${a}.json`);
const activeFile = join(dataDir(), "active-account.json");

async function credits(a) {
  if (!keys[a]) return "no key";
  try {
    const r = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": keys[a] } });
    const j = await r.json();
    return `${j.character_limit - j.character_count} of ${j.character_limit} credits left`;
  } catch (e) {
    return `credits unknown (${e.message})`;
  }
}

if (want === "1" || want === "2") {
  if (!keys[want]) {
    console.error(`No key for account ${want} in .env.local`);
    process.exit(1);
  }
  if (!existsSync(agentFile(want))) {
    console.error(`Account ${want} has no agent yet. Run: npm run kb:sync -- --account ${want} && npm run agent:push -- --account ${want}`);
    process.exit(1);
  }
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(activeFile, JSON.stringify({ account: want, reason: "manual switch (key:use)", at: new Date().toISOString() }, null, 2) + "\n");
  console.log(`New calls now use account ${want}.`);
} else if (want) {
  console.error("Usage: npm run key:use -- 1   or   npm run key:use -- 2");
  process.exit(1);
}

const active = existsSync(activeFile) ? JSON.parse(readFileSync(activeFile, "utf8")).account : process.env.ELEVENLABS_ACTIVE_KEY || "1";
for (const a of ["1", "2"]) {
  console.log(`Account ${a}${a === String(active) ? " (active)" : ""}: ${await credits(a)}, agent ${existsSync(agentFile(a)) ? "ready" : "not set up"}`);
}
