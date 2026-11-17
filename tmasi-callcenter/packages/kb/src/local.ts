// LocalPgvector: our own pgvector index of the compiled KB, used for grading and citation checks.
import { and, eq, sql } from "drizzle-orm";
import { getDb, knowledgeChunks, knowledgeDocs } from "@tc/db";
import { embedQuery } from "./embed.ts";
import type { KnowledgeHit, KnowledgeProvider } from "./provider.ts";

export interface DocMeta {
  sourcePath: string;
  sourceKind: "site" | "data" | "news" | "core_facts" | "staff_faq" | "owner_upload";
  lang: string;
  title: string;
  contentMd: string;
  contentHash: string;
  usageMode: "prompt" | "rag";
  elDocId?: string | null;
}

export interface ChunkRow {
  idx: number;
  text: string;
  tokens: number;
  embedding: number[];
}

/** Insert or update a doc by (source_path, lang). Returns its id. A changed hash bumps the version. */
export async function upsertDoc(meta: DocMeta): Promise<string> {
  const db = await getDb();
  const [existing] = await db
    .select()
    .from(knowledgeDocs)
    .where(and(eq(knowledgeDocs.sourcePath, meta.sourcePath), eq(knowledgeDocs.lang, meta.lang)));
  if (existing) {
    await db
      .update(knowledgeDocs)
      .set({
        sourceKind: meta.sourceKind,
        title: meta.title,
        contentMd: meta.contentMd,
        contentHash: meta.contentHash,
        usageMode: meta.usageMode,
        ...(meta.elDocId !== undefined ? { elDocId: meta.elDocId } : {}),
        version: existing.contentHash === meta.contentHash ? existing.version : existing.version + 1,
      })
      .where(eq(knowledgeDocs.id, existing.id));
    return existing.id;
  }
  const [row] = await db
    .insert(knowledgeDocs)
    .values({
      sourcePath: meta.sourcePath,
      sourceKind: meta.sourceKind,
      lang: meta.lang,
      title: meta.title,
      contentMd: meta.contentMd,
      contentHash: meta.contentHash,
      usageMode: meta.usageMode,
      elDocId: meta.elDocId ?? null,
    })
    .returning({ id: knowledgeDocs.id });
  return row!.id;
}

const SRC = /^\[src:([^\]\s]+)\]/;

/** Replace all chunks of a doc in one transaction. */
export async function upsertChunks(docId: string, chunks: ChunkRow[]): Promise<void> {
  const db = await getDb();
  await db.transaction(async (tx) => {
    await tx.delete(knowledgeChunks).where(eq(knowledgeChunks.docId, docId));
    const BATCH = 50;
    for (let i = 0; i < chunks.length; i += BATCH) {
      await tx.insert(knowledgeChunks).values(
        chunks.slice(i, i + BATCH).map((c) => ({
          docId,
          idx: c.idx,
          text: c.text,
          src: SRC.exec(c.text)?.[1] ?? null,
          tokens: c.tokens,
          embedding: c.embedding,
        })),
      );
    }
  });
}

export class LocalPgvector implements KnowledgeProvider {
  async search(question: string, lang: string, k = 6): Promise<KnowledgeHit[]> {
    const q = await embedQuery(question);
    const vec = `[${q.join(",")}]`;
    const query = async (l: string, limit: number): Promise<KnowledgeHit[]> => {
      const db = await getDb();
      const res = await db.execute(sql`
        select c.doc_id as "docId", c.src as "src", c.text as "text",
               1 - (c.embedding <=> ${vec}::vector) as "score"
        from ${knowledgeChunks} c
        join ${knowledgeDocs} d on d.id = c.doc_id
        where d.lang = ${l} and c.embedding is not null
        order by c.embedding <=> ${vec}::vector asc
        limit ${limit}`);
      return (res.rows as any[]).map((r) => ({
        docId: String(r.docId),
        src: String(r.src ?? ""),
        text: String(r.text),
        score: Number(r.score),
      }));
    };
    const own = await query(lang, k);
    if (lang === "en" || own.length >= k) return own;
    const key = (h: KnowledgeHit) => `${h.docId}|${h.src}|${h.text}`;
    const seen = new Set(own.map(key));
    const extra = (await query("en", k)).filter((h) => !seen.has(key(h)));
    return [...own, ...extra].sort((a, b) => b.score - a.score).slice(0, k);
  }
}
