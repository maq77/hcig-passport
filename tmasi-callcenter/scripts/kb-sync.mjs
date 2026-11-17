// kb:sync. Compares data/kb/manifest.json with knowledge_docs by content hash.
// Local part (always): chunk, embed, store in pgvector. ElevenLabs part (needs ELEVENLABS_API_KEY): upload changed docs,
// delete removed ones. A second run with no changes reports 0 changed.
import "./_env.mjs";
import { eq, sql } from "drizzle-orm";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ACCOUNT, MISSING_KEY, hasElevenLabsKey, kbMapFileName } from "./_env.mjs";
import { dataDir } from "@tc/db";
import { closeDb, getDb, knowledgeChunks, knowledgeDocs, writeAudit } from "@tc/db";
import { ElevenLabsRuntime } from "@tc/voice";
import { chunkMarkdown, embedPassages, readDocBody, readManifest, upsertChunks, upsertDoc } from "@tc/kb";

/** Account 2: upload the same documents to that account, ids kept in data/kb-account-2.json. The local index is shared. */
async function mirror() {
  const manifest = readManifest();
  const remote = new ElevenLabsRuntime();
  const file = join(dataDir(), kbMapFileName());
  const map = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  const key = (path, lang) => `${path}|${lang}`;
  const seen = new Set();
  const counts = { uploaded: 0, unchanged: 0, removed: 0, failed: 0 };
  for (const entry of manifest.docs) {
    if (entry.kind === "core_facts") continue; // in the system prompt, never attached
    const k = key(entry.source_path, entry.lang);
    seen.add(k);
    const cur = map[k];
    if (cur && cur.hash === entry.content_hash && cur.usageMode === entry.usage_mode) {
      counts.unchanged++;
      continue;
    }
    try {
      if (cur?.elDocId) await remote.deleteKnowledge(cur.elDocId).catch(() => {});
      const elDocId = await remote.uploadKnowledgeText(`${entry.title} (${entry.lang})`, readDocBody(entry));
      map[k] = { elDocId, hash: entry.content_hash, title: entry.title, lang: entry.lang, usageMode: entry.usage_mode, kind: entry.kind };
      counts.uploaded++;
    } catch (e) {
      counts.failed++;
      console.error(`Upload failed for ${entry.slug}: ${e?.message ?? e}`);
    }
  }
  for (const k of Object.keys(map)) {
    if (seen.has(k)) continue;
    await remote.deleteKnowledge(map[k].elDocId).catch(() => {});
    delete map[k];
    counts.removed++;
  }
  writeFileSync(file, JSON.stringify(map, null, 2) + "\n");
  console.log("");
  console.log(`kb:sync account ${ACCOUNT}  uploaded ${counts.uploaded}  unchanged ${counts.unchanged}  removed ${counts.removed}  failed ${counts.failed}`);
  return counts.failed ? 1 : 0;
}

async function main() {
  if (ACCOUNT !== "1") return mirror();
  const manifest = readManifest();
  const db = await getDb();
  const remote = hasElevenLabsKey() ? new ElevenLabsRuntime() : null;
  if (!remote) console.log(`ElevenLabs upload skipped: ${MISSING_KEY}. Doing the local part only.`);

  const existingAll = await db.select().from(knowledgeDocs);
  const key = (path, lang) => `${path}\u0000${lang}`;
  const byKey = new Map(existingAll.map((d) => [key(d.sourcePath, d.lang), d]));
  const seen = new Set();
  const counts = { added: 0, changed: 0, removed: 0, unchanged: 0, uploaded: 0, uploadFailed: 0 };

  for (const entry of manifest.docs) {
    const k = key(entry.source_path, entry.lang);
    seen.add(k);
    const row = byKey.get(k);
    const body = readDocBody(entry);
    const isNew = !row;
    const isChanged = !!row && row.contentHash !== entry.content_hash;
    let chunkCount = 0;
    if (row) {
      const [c] = await db.select({ n: sql`count(*)::int` }).from(knowledgeChunks).where(eq(knowledgeChunks.docId, row.id));
      chunkCount = Number(c?.n ?? 0);
    }

    let docId = row?.id;
    if (isNew || isChanged || chunkCount === 0) {
      docId = await upsertDoc({
        sourcePath: entry.source_path,
        sourceKind: entry.kind,
        lang: entry.lang,
        title: entry.title,
        contentMd: body,
        contentHash: entry.content_hash,
        usageMode: entry.usage_mode,
      });
      const chunks = chunkMarkdown(body);
      const vectors = await embedPassages(chunks.map((c) => c.text));
      await upsertChunks(docId, chunks.map((c, i) => ({ idx: c.idx, text: c.text, tokens: c.tokens, embedding: vectors[i] })));
    }

    if (isNew) counts.added++;
    else if (isChanged) counts.changed++;
    else counts.unchanged++;

    // content changed or usage mode changed: the remote copy is stale until it is uploaded again
    const stale = isChanged || (!!row && row.usageMode !== entry.usage_mode);
    if (stale) await db.update(knowledgeDocs).set({ syncedAt: null, usageMode: entry.usage_mode }).where(eq(knowledgeDocs.id, docId));

    // core facts live in the system prompt (agent:push), so only the local copy (used for grading) is kept
    if (remote && entry.kind !== "core_facts") {
      const cur = (await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.id, docId)))[0];
      if (!cur.elDocId || !cur.syncedAt) {
        try {
          if (cur.elDocId) await remote.deleteKnowledge(cur.elDocId).catch(() => {});
          const elDocId = await remote.uploadKnowledgeText(`${entry.title} (${entry.lang})`, body);
          await db.update(knowledgeDocs).set({ elDocId, syncedAt: new Date() }).where(eq(knowledgeDocs.id, docId));
          counts.uploaded++;
        } catch (e) {
          counts.uploadFailed++;
          console.error(`Upload failed for ${entry.slug}: ${e?.message ?? e}`);
        }
      }
    }
  }

  const removed = existingAll.filter((d) => !seen.has(key(d.sourcePath, d.lang)));
  for (const d of removed) {
    if (remote && d.elDocId) await remote.deleteKnowledge(d.elDocId).catch((e) => console.error(`Remote delete failed for ${d.title}: ${e?.message ?? e}`));
    await db.delete(knowledgeDocs).where(eq(knowledgeDocs.id, d.id));
    counts.removed++;
  }

  await writeAudit(null, "kb.sync", "knowledge_docs", null, null, { ...counts, remote: Boolean(remote) });
  console.log("");
  console.log(`kb:sync  added ${counts.added}  changed ${counts.changed}  removed ${counts.removed}  unchanged ${counts.unchanged}`);
  console.log(remote ? `ElevenLabs: ${counts.uploaded} uploaded, ${counts.uploadFailed} failed` : "ElevenLabs: upload skipped (no key)");
  return counts.uploadFailed ? 1 : 0;
}

let code = 1;
try {
  code = await main();
} catch (e) {
  console.error(e?.message ?? e);
}
await closeDb().catch(() => {});
process.exit(code);
