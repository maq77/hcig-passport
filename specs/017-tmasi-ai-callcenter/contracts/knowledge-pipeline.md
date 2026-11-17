# Contract: knowledge pipeline

## kb:build (packages/kb, `npm run kb:build`)

**Inputs** (read only, from the repo; paths relative to the repo root):

| Source | Kind | Languages |
|---|---|---|
| `content/tmasi/offices.json`, `services.json`, `site.json`, `leadership.json`, `news.json` | data | EN |
| `tmasi-next/src/content/live/{en,de,es,pl}.json` | site | EN, DE, ES, PL |
| `tmasi-next/src/content/{assist,trust,reviews,ui,maritime}.ts` | site | as written |
| `tmasi sponsor/news 1 content.txt`, `news 2 content.txt`, `translations/` | news | EN, DE, ES, PL |
| `tmasi-next/src/app/llms.txt/route.ts` | site summary | EN |
| `tmasi-callcenter/agent/core-facts/<lang>.md` | core_facts (hand-written by Opus from the sources above, approved by him) | per tuned language |
| `kb_gaps` with status answered | staff_faq | per language |
| `tmasi-callcenter/data/uploads/*` (Phase 1b: his packages, prices, hotels, coordinator FAQs) | owner_upload | as given |

**Rules:**
- **Reviews:** `reviews.ts` is included only for what TMASI offers. Review quotes are never spoken as testimonials (AI people never shown as real).
- **Excluded:** nothing invented is added. Any text that says "accredited" is excluded and reported.

**Outputs:**
- `data/kb/<lang>/<doc-slug>.md`, normalised markdown with a front-matter block `source_path, kind, lang, title, content_hash`.
- Every paragraph is prefixed with a source tag `[src:<doc-slug>#<n>]`, so citations survive retrieval.
- `data/kb/manifest.json` lists every doc and its hash.

## kb:sync (`npm run kb:sync`)

1. Compare `manifest.json` hashes with `knowledge_docs.content_hash`.
2. For each changed or new doc: upload it to ElevenLabs, store `el_doc_id`, attach it to the agent with its usage mode (core_facts = prompt, the rest = rag).
3. For each removed doc: detach and delete it in ElevenLabs.
4. Chunk changed docs (about 400 tokens, 15% overlap), embed them locally (R7), and upsert `knowledge_chunks`.
5. Write `audit_log` and print a summary (added, changed, removed, unchanged).

Running it twice in a row changes nothing (FR-027).

## Retrieval for grading (KnowledgeProvider.search)

`search(question, lang, k = 6)` returns chunks with `doc_id`, `src` tag and score. It searches the caller's language first, then falls back to EN. The judge maps each claim in an agent answer to a chunk. A claim with no chunk above the threshold means `fact_ok = false`.
