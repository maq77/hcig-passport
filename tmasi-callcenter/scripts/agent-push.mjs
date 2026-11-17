// agent:push. Builds the ElevenLabs agent from agent/ (config as code), pushes it, records an agent_versions row.
//   npm run agent:push                             push as draft
//   npm run agent:push -- --publish                make this version live (refused unless its eval run passed)
//   npm run agent:push -- --publish --force-demo   first demo only, no passed eval yet
import "./_env.mjs";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { ROOT, MISSING_KEY, hasElevenLabsKey, ACCOUNT, agentFileName, kbMapFileName } from "./_env.mjs";
import { closeDb, dataDir, getDb, writeAudit, agentVersions, evalRuns, knowledgeDocs } from "@tc/db";
import { ElevenLabsRuntime, buildAgentSpec, allVoiceIdsEmpty } from "@tc/voice";
import config from "../agent/agent.config.ts";

const args = new Set(process.argv.slice(2));
const publish = args.has("--publish");
const forceDemo = args.has("--force-demo");
const sha = (s) => createHash("sha256").update(s).digest("hex");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

async function main() {
  if (!hasElevenLabsKey()) {
    console.error(MISSING_KEY);
    return 1;
  }
  const basePrompt = readFileSync(join(ROOT, config.files.basePrompt), "utf8");
  const firstMessages = readJson(join(ROOT, config.files.firstMessages));
  delete firstMessages.note;
  const personas = readJson(join(ROOT, config.files.personas)).personas;
  const coreFacts = {};
  for (const l of config.languages) {
    const f = join(ROOT, config.files.coreFactsDir, `${l}.md`);
    if (existsSync(f)) coreFacts[l] = readFileSync(f, "utf8");
  }

  const runtime = new ElevenLabsRuntime();
  const data = dataDir();
  mkdirSync(data, { recursive: true });

  // voices: personas.json first. When every id is empty, fall back to one multilingual woman and one man (data/voices.json).
  let voiceFallback = null;
  if (allVoiceIdsEmpty(personas)) {
    const vf = join(data, "voices.json");
    if (existsSync(vf)) {
      const v = readJson(vf);
      voiceFallback = { female: v.female?.voiceId ?? null, male: v.male?.voiceId ?? null };
      console.log(`Voices from ${vf}: woman ${v.female?.name} (${v.female?.voiceId}), man ${v.male?.name} (${v.male?.voiceId})`);
    } else {
      const pick = async (gender) => {
        const list = await runtime.listVoices({ gender, category: "premade", pageSize: 100 });
        return list.find((x) => x.multilingual) ?? list[0] ?? null;
      };
      const female = await pick("female");
      const male = await pick("male");
      if (!female || !male) {
        console.error("Voice search returned no premade voices. Fill el_voice_id in agent/personas.json.");
        return 1;
      }
      console.log(`Picked woman: ${female.name} (${female.voiceId})`);
      console.log(`Picked man:   ${male.name} (${male.voiceId})`);
      writeFileSync(
        vf,
        JSON.stringify(
          {
            female: { voiceId: female.voiceId, name: female.name },
            male: { voiceId: male.voiceId, name: male.name },
            pickedAt: new Date().toISOString(),
          },
          null,
          2,
        ) + "\n",
      );
      voiceFallback = { female: female.voiceId, male: male.voiceId };
    }
  }

  // knowledge documents already synced by kb:sync
  // account 2 never opens the local database, so it can be pushed while the dev server runs
  const db = ACCOUNT === "1" ? await getDb() : null;
  let docs = [];
  if (db) {
    try {
      docs = await db.select().from(knowledgeDocs).where(isNotNull(knowledgeDocs.elDocId));
    } catch (e) {
      console.error(`Cannot read knowledge_docs (${e.message}). Run "npm run migrate" first.`);
      return 1;
    }
  }
  // Core facts already sit in the system prompt (composeSystemPrompt), so they are not attached again:
  // a second copy would cost tokens and time on every turn.
  let knowledge = docs
    .filter((d) => d.sourceKind !== "core_facts")
    .map((d) => ({ elDocId: d.elDocId, name: `${d.title} (${d.lang})`, usageMode: d.usageMode }));
  if (ACCOUNT !== "1") {
    // account 2 has its own copies of the documents (npm run kb:sync -- --account 2)
    const mf = join(data, kbMapFileName());
    const map = existsSync(mf) ? readJson(mf) : {};
    knowledge = Object.values(map).map((d) => ({ elDocId: d.elDocId, name: `${d.title} (${d.lang})`, usageMode: d.usageMode }));
  }
  if (knowledge.length === 0) console.log("No synced knowledge documents yet (run npm run kb:sync). Core facts are in the prompt.");

  const spec = buildAgentSpec({ config, basePrompt, coreFacts, firstMessages, personas, voiceFallback, knowledge });
  const fingerprint = sha(JSON.stringify(spec));

  if (ACCOUNT !== "1") {
    // a mirror of the current config on the second account: same prompt, voices, tools; no version rows (account 1 is the record)
    const f2 = join(data, agentFileName());
    const existing2 = existsSync(f2) ? readJson(f2).agentId : null;
    const res2 = await runtime.pushAgent(spec, existing2 || null);
    writeFileSync(f2, JSON.stringify({ agentId: res2.agentId, account: ACCOUNT, fingerprint, updatedAt: new Date().toISOString() }, null, 2) + "\n");
    console.log("");
    console.log(`Account ${ACCOUNT}: agent ${res2.created ? "created" : "updated"}: ${res2.agentId}`);
    console.log(`Knowledge documents attached: ${knowledge.length}. Mirror of the current config (versions are tracked on account 1).`);
    return 0;
  }
  const coreFactsHash = sha(JSON.stringify(coreFacts));
  const kbSnapshotHash = sha(JSON.stringify(knowledge.map((k) => [k.elDocId, k.usageMode]).sort()));

  // agent_versions: reuse the newest unretired row when nothing changed, so an eval run can attach to it
  const all = await db.select().from(agentVersions).orderBy(desc(agentVersions.createdAt));
  let row = all.find((r) => r.status !== "retired" && r.guardSettings?.fingerprint === fingerprint) ?? null;

  if (publish) {
    if (!row) {
      console.error("Nothing to publish: push the current config first (npm run agent:push), run the eval, then publish.");
      return 2;
    }
    const runs = await db.select().from(evalRuns).where(and(eq(evalRuns.agentVersionId, row.id), eq(evalRuns.passed, true)));
    if (runs.length === 0 && !forceDemo) {
      console.error(`Refused: version ${row.semver} has no passed eval run (FR-028). Run the eval, or add --force-demo for the first demo.`);
      return 2;
    }
    if (runs.length === 0) console.warn("WARNING: --force-demo publishes without a passed eval run. Use it for the first demo only.");
  }

  const agentFile = join(data, agentFileName());
  const existing = existsSync(agentFile) ? readJson(agentFile).agentId : process.env.ELEVENLABS_AGENT_ID || null;
  const res = await runtime.pushAgent(spec, existing || null);
  writeFileSync(agentFile, JSON.stringify({ agentId: res.agentId, updatedAt: new Date().toISOString() }, null, 2) + "\n");

  if (!row) {
    const semver = `0.${all.length + 1}.0`;
    const inserted = await db
      .insert(agentVersions)
      .values({
        semver,
        status: "draft",
        systemPrompt: spec.systemPrompt,
        firstMessages,
        coreFactsHash,
        kbSnapshotHash,
        llmModel: spec.llmModel,
        ttsSettings: { model: spec.ttsModel, expressive: spec.expressive, supportedVoices: spec.supportedVoices },
        guardSettings: { fingerprint, agentId: res.agentId },
        notes: "agent:push",
      })
      .returning();
    row = inserted[0];
    await writeAudit(null, "agent.push", "agent_versions", row.id, null, { semver, agentId: res.agentId });
  }

  if (publish) {
    for (const r of all) {
      if (r.status === "live" && r.id !== row.id) await db.update(agentVersions).set({ status: "retired" }).where(eq(agentVersions.id, r.id));
    }
    await db.update(agentVersions).set({ status: "live", publishedAt: new Date() }).where(eq(agentVersions.id, row.id));
    await writeAudit(null, "agent.publish", "agent_versions", row.id, { status: row.status }, { status: "live", forceDemo });
    row = { ...row, status: "live" };
  }

  console.log("");
  console.log(`Agent ${res.created ? "created" : "updated"}: ${res.agentId}`);
  console.log(`Version ${row.semver} (${row.status}) ${row.id}`);
  console.log(`LLM ${spec.llmModel}, TTS ${spec.ttsModel}${spec.expressive ? " expressive" : ""}, languages ${spec.languages.join(" ")}`);
  console.log(`Voices for the woman/man switch: ${spec.supportedVoices.length}. Client tools: ${spec.clientTools.map((t) => t.name).join(", ")}`);
  console.log(`Knowledge documents attached: ${knowledge.length}`);
  return 0;
}

let code = 1;
try {
  code = await main();
} catch (e) {
  console.error(e?.message ?? e);
}
await closeDb().catch(() => {});
process.exit(code);
