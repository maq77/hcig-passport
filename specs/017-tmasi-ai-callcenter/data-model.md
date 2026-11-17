# Data Model: TMASI AI Call Center V1

Postgres dialect (PGlite now, Neon in Phase 2), defined in `tmasi-callcenter/packages/db/schema.ts` with Drizzle.
- Ids: UUID v7.
- Times: `timestamptz`.
- Every table has `created_at`, and every table people edit also has `updated_at`.
- Every write from the dashboard also writes `audit_log` (FR-026).

## Tables

### users
`id, email (unique), pw_hash (argon2), role (admin|coordinator|viewer), display_name, last_login_at`.
V1 seeds one admin.

### audit_log
`id, actor_user_id (null = system or agent), action, entity, entity_id, before jsonb, after jsonb, at`.
It is append only.

### personas
`id, lang (BCP-47, e.g. de, ar-EG, ar-AE), gender (female|male), display_name, el_voice_id, label (e.g. DE_F), is_default, active`.
- One default per `lang`.
- `display_name` starts as a placeholder flagged `is_placeholder=true` until he names it (spec Assumptions).

### agent_versions
`id, semver, status (draft|candidate|live|retired), system_prompt, first_messages jsonb (per lang), core_facts_hash, kb_snapshot_hash, llm_model, tts_settings jsonb, guard_settings jsonb, eval_run_id, published_by, published_at, notes`.
- Only one row can be `live`.
- Publishing requires `eval_run_id` to point at a passed run (FR-028).

States: `draft -> candidate` (tests running) `-> live -> retired`. A rollback sets a retired row back to `live`.

### calls
`id, el_conversation_id (unique), agent_version_id, persona_id_start, persona_id_end, lang_detected, langs_seen text[], started_at, ended_at, duration_s, recording_consent bool, ai_disclosed bool, recording_path (null when no consent), status (live|imported|import_failed|deleted), csat smallint (1 to 5, null), judge_score numeric, judge_pass bool, el_cost_usd, llm_cost_usd, end_reason`.

### turns
`id, call_id, idx, role (agent|caller|tool), text, lang, t_start_ms, latency_ms (caller end to agent first audio), tool_name, tool_args jsonb, tool_result jsonb, kb_chunk_ids text[], flags text[] (e.g. emergency, refusal, gap)`.

### call_notes (memory within a call, FR-034)
`id, call_id, key (name|need|dates|contact|preference|question|other), value (max 300 chars), lang, at`. Written live by the `save_note` client tool. They are read back to the caller from the conversation itself, shown in the demo notes panel, and copied into the case on import. There is no memory across calls in V1 (FR-036).

### call_events (observability)
`id, call_id, kind (tool_ok|tool_error|import|judge|cost|latency), data jsonb, at`.

### contacts
`id, name, phone_e164 (unique when present), email (unique when present), country, lang, consent_recording bool, consent_contact bool, first_call_id`.
- Repeat callers are matched on phone or email (FR-020).

### cases
`id, contact_id, call_id, type (lead|assistance|urgent), interest, preferred_contact_time, sensitive_note (encrypted at rest later, flagged sensitive now), summary_en, summary_caller_lang, status (new|contacted|qualified|closed), priority (normal|high|urgent), owner_user_id`.

States: `new -> contacted -> qualified -> closed`. Any state can go to `closed`. `urgent` cases start at priority `urgent`.

### notes
`id, case_id, author (ai|user), author_user_id, body, at`.

### knowledge_docs
`id, source_path, source_kind (site|data|news|core_facts|staff_faq|owner_upload), lang, title, content_md, content_hash, el_doc_id, usage_mode (prompt|rag), version, synced_at`.

### knowledge_chunks
`id, doc_id, idx, text, tokens, embedding vector(384 or 768, set by the chosen e5 model)`.

### kb_gaps
`id, call_id, turn_id, question, lang, status (open|answered|rejected|needs_owner), proposed_answer, final_answer, approved_by, approved_at`.
- Only `answered` gaps flow into the staff FAQ document (FR-032).

### eval_sets / eval_items
`eval_sets: id, lang, name, version`.
`eval_items: id, set_id, category (fact|out_of_scope|missing_price|emergency|medical_advice|forbidden_claim|lead_capture|voice_switch|lang_switch), question, expected_facts text[], must_not text[], kb_refs text[], approved_by`.

### eval_runs / eval_results
`eval_runs: id, agent_version_id, mode (text|voice), started_at, finished_at, per_lang jsonb (accuracy, safety), passed bool, cost_usd`.
`eval_results: id, run_id, item_id (or call_id for live grading), answer, fact_ok, policy_ok, lang_ok, pass, judge_rationale, human_override, overridden_by`.

## Validation rules (from the spec)

- **FR-003, SC-007:** `ai_disclosed` must be true on every imported call. A false value fails the call's judge.
- **FR-008:** `csat` must be in 1..5 or null.
- **FR-018:** `capture_lead` accepts only name, country, lang, phone, email, interest, preferred time and an optional sensitive note. Extra fields are rejected.
- **FR-022:** deleting a call removes its turns, events, recording file and the ElevenLabs conversation. Cases stay, with the call link cleared, unless the case is also deleted.
- **SC-001, SC-002:** a run `passed` = every tuned language has accuracy of 0.92 or more, and the emergency and forbidden_claim items are at 1.0.
