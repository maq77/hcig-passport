import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "@tc/core";

// ---------- enums (verbatim from data-model.md and tasks.md T011) ----------
export const userRole = pgEnum("user_role", ["admin", "coordinator", "viewer"]);
export const personaGender = pgEnum("persona_gender", ["female", "male"]);
export const agentVersionStatus = pgEnum("agent_version_status", ["draft", "candidate", "live", "retired"]);
export const callStatus = pgEnum("call_status", ["live", "imported", "import_failed", "deleted"]);
export const turnRole = pgEnum("turn_role", ["agent", "caller", "tool"]);
export const callNoteKey = pgEnum("call_note_key", [
  "name",
  "need",
  "dates",
  "contact",
  "preference",
  "question",
  "other",
]);
export const callEventKind = pgEnum("call_event_kind", [
  "tool_ok",
  "tool_error",
  "import",
  "judge",
  "cost",
  "latency",
]);
export const caseType = pgEnum("case_type", ["lead", "assistance", "urgent"]);
export const caseStatus = pgEnum("case_status", ["new", "contacted", "qualified", "closed"]);
export const casePriority = pgEnum("case_priority", ["normal", "high", "urgent"]);
export const noteAuthor = pgEnum("note_author", ["ai", "user"]);
export const knowledgeSourceKind = pgEnum("knowledge_source_kind", [
  "site",
  "data",
  "news",
  "core_facts",
  "staff_faq",
  "owner_upload",
]);
export const knowledgeUsageMode = pgEnum("knowledge_usage_mode", ["prompt", "rag"]);
export const kbGapStatus = pgEnum("kb_gap_status", ["open", "answered", "rejected", "needs_owner"]);
export const evalRunMode = pgEnum("eval_run_mode", ["text", "voice"]);
export const evalItemCategory = pgEnum("eval_item_category", [
  "fact",
  "out_of_scope",
  "missing_price",
  "emergency",
  "medical_advice",
  "forbidden_claim",
  "lead_capture",
  "voice_switch",
  "lang_switch",
]);

// ---------- helpers ----------
const id = () =>
  uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7());
const createdAt = () => timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
const tstz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

// ---------- users, audit ----------
export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  pwHash: text("pw_hash").notNull(),
  role: userRole("role").notNull().default("viewer"),
  displayName: text("display_name").notNull(),
  lastLoginAt: tstz("last_login_at"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    at: tstz("at").notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [index("audit_log_entity_idx").on(t.entity, t.entityId), index("audit_log_at_idx").on(t.at)],
);

// ---------- personas, agent versions ----------
export const personas = pgTable(
  "personas",
  {
    id: id(),
    lang: text("lang").notNull(),
    gender: personaGender("gender").notNull(),
    displayName: text("display_name").notNull(),
    isPlaceholder: boolean("is_placeholder").notNull().default(true),
    elVoiceId: text("el_voice_id"),
    label: text("label").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("personas_one_default_per_lang").on(t.lang).where(sql`${t.isDefault}`),
    uniqueIndex("personas_label_uq").on(t.label),
  ],
);

export const agentVersions = pgTable(
  "agent_versions",
  {
    id: id(),
    semver: text("semver").notNull(),
    status: agentVersionStatus("status").notNull().default("draft"),
    systemPrompt: text("system_prompt").notNull(),
    firstMessages: jsonb("first_messages").notNull().default(sql`'{}'::jsonb`),
    coreFactsHash: text("core_facts_hash"),
    kbSnapshotHash: text("kb_snapshot_hash"),
    llmModel: text("llm_model").notNull(),
    ttsSettings: jsonb("tts_settings"),
    guardSettings: jsonb("guard_settings"),
    // points at eval_runs.id; no FK because eval_runs references agent_versions (circular)
    evalRunId: uuid("eval_run_id"),
    publishedBy: uuid("published_by").references(() => users.id, { onDelete: "set null" }),
    publishedAt: tstz("published_at"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // only one live version at a time
    uniqueIndex("agent_versions_one_live").on(t.status).where(sql`${t.status} = 'live'`),
    uniqueIndex("agent_versions_semver_uq").on(t.semver),
  ],
);

// ---------- calls ----------
export const calls = pgTable(
  "calls",
  {
    id: id(),
    elConversationId: text("el_conversation_id").notNull().unique(),
    agentVersionId: uuid("agent_version_id").references(() => agentVersions.id, { onDelete: "set null" }),
    personaIdStart: uuid("persona_id_start").references(() => personas.id, { onDelete: "set null" }),
    personaIdEnd: uuid("persona_id_end").references(() => personas.id, { onDelete: "set null" }),
    langDetected: text("lang_detected"),
    langsSeen: text("langs_seen").array().notNull().default(sql`'{}'::text[]`),
    startedAt: tstz("started_at"),
    endedAt: tstz("ended_at"),
    durationS: integer("duration_s"),
    recordingConsent: boolean("recording_consent").notNull().default(false),
    aiDisclosed: boolean("ai_disclosed").notNull().default(false),
    recordingPath: text("recording_path"),
    status: callStatus("status").notNull().default("live"),
    csat: smallint("csat"),
    judgeScore: numeric("judge_score"),
    judgePass: boolean("judge_pass"),
    elCostUsd: numeric("el_cost_usd"),
    llmCostUsd: numeric("llm_cost_usd"),
    endReason: text("end_reason"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("calls_csat_range", sql`${t.csat} is null or (${t.csat} between 1 and 5)`),
    index("calls_started_idx").on(t.startedAt),
  ],
);

export const turns = pgTable(
  "turns",
  {
    id: id(),
    callId: uuid("call_id")
      .notNull()
      .references(() => calls.id, { onDelete: "cascade" }),
    idx: integer("idx").notNull(),
    role: turnRole("role").notNull(),
    text: text("text"),
    lang: text("lang"),
    tStartMs: integer("t_start_ms"),
    latencyMs: integer("latency_ms"),
    toolName: text("tool_name"),
    toolArgs: jsonb("tool_args"),
    toolResult: jsonb("tool_result"),
    kbChunkIds: text("kb_chunk_ids").array(),
    flags: text("flags").array().notNull().default(sql`'{}'::text[]`),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("turns_call_idx_uq").on(t.callId, t.idx)],
);

export const callNotes = pgTable(
  "call_notes",
  {
    id: id(),
    callId: uuid("call_id")
      .notNull()
      .references(() => calls.id, { onDelete: "cascade" }),
    key: callNoteKey("key").notNull(),
    value: text("value").notNull(),
    lang: text("lang"),
    at: tstz("at").notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [
    check("call_notes_value_len", sql`char_length(${t.value}) <= 300`),
    index("call_notes_call_idx").on(t.callId),
  ],
);

export const callEvents = pgTable(
  "call_events",
  {
    id: id(),
    callId: uuid("call_id")
      .notNull()
      .references(() => calls.id, { onDelete: "cascade" }),
    kind: callEventKind("kind").notNull(),
    data: jsonb("data"),
    at: tstz("at").notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [index("call_events_call_idx").on(t.callId)],
);

// ---------- contacts, cases, notes ----------
export const contacts = pgTable(
  "contacts",
  {
    id: id(),
    name: text("name").notNull(),
    phoneE164: text("phone_e164"),
    email: text("email"),
    country: text("country"),
    lang: text("lang"),
    consentRecording: boolean("consent_recording").notNull().default(false),
    consentContact: boolean("consent_contact").notNull().default(false),
    firstCallId: uuid("first_call_id").references(() => calls.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("contacts_phone_uq").on(t.phoneE164).where(sql`${t.phoneE164} is not null`),
    uniqueIndex("contacts_email_uq").on(t.email).where(sql`${t.email} is not null`),
  ],
);

export const cases = pgTable(
  "cases",
  {
    id: id(),
    contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    callId: uuid("call_id").references(() => calls.id, { onDelete: "set null" }),
    type: caseType("type").notNull(),
    interest: text("interest"),
    preferredContactTime: text("preferred_contact_time"),
    // flagged sensitive; encrypted at rest later
    sensitiveNote: text("sensitive_note"),
    summaryEn: text("summary_en"),
    summaryCallerLang: text("summary_caller_lang"),
    status: caseStatus("status").notNull().default("new"),
    priority: casePriority("priority").notNull().default("normal"),
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("cases_status_idx").on(t.status), index("cases_contact_idx").on(t.contactId)],
);

export const notes = pgTable("notes", {
  id: id(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, { onDelete: "cascade" }),
  author: noteAuthor("author").notNull(),
  authorUserId: uuid("author_user_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  at: tstz("at").notNull().defaultNow(),
  createdAt: createdAt(),
});

// ---------- knowledge ----------
export const knowledgeDocs = pgTable(
  "knowledge_docs",
  {
    id: id(),
    sourcePath: text("source_path").notNull(),
    sourceKind: knowledgeSourceKind("source_kind").notNull(),
    lang: text("lang").notNull(),
    title: text("title").notNull(),
    contentMd: text("content_md").notNull(),
    contentHash: text("content_hash").notNull(),
    elDocId: text("el_doc_id"),
    usageMode: knowledgeUsageMode("usage_mode").notNull().default("rag"),
    version: integer("version").notNull().default(1),
    syncedAt: tstz("synced_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("knowledge_docs_path_lang_uq").on(t.sourcePath, t.lang)],
);

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: id(),
    docId: uuid("doc_id")
      .notNull()
      .references(() => knowledgeDocs.id, { onDelete: "cascade" }),
    idx: integer("idx").notNull(),
    text: text("text").notNull(),
    // the [src:<doc-slug>#<n>] tag carried from the paragraph
    src: text("src"),
    tokens: integer("tokens").notNull(),
    embedding: vector("embedding", { dimensions: 384 }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("knowledge_chunks_doc_idx_uq").on(t.docId, t.idx)],
);

export const kbGaps = pgTable(
  "kb_gaps",
  {
    id: id(),
    callId: uuid("call_id").references(() => calls.id, { onDelete: "set null" }),
    turnId: uuid("turn_id").references(() => turns.id, { onDelete: "set null" }),
    question: text("question").notNull(),
    lang: text("lang"),
    status: kbGapStatus("status").notNull().default("open"),
    proposedAnswer: text("proposed_answer"),
    finalAnswer: text("final_answer"),
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
    approvedAt: tstz("approved_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("kb_gaps_status_idx").on(t.status)],
);

// ---------- evals ----------
export const evalSets = pgTable("eval_sets", {
  id: id(),
  lang: text("lang").notNull(),
  name: text("name").notNull(),
  version: integer("version").notNull().default(1),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const evalItems = pgTable("eval_items", {
  id: id(),
  setId: uuid("set_id")
    .notNull()
    .references(() => evalSets.id, { onDelete: "cascade" }),
  category: evalItemCategory("category").notNull(),
  question: text("question").notNull(),
  expectedFacts: text("expected_facts").array().notNull().default(sql`'{}'::text[]`),
  mustNot: text("must_not").array().notNull().default(sql`'{}'::text[]`),
  kbRefs: text("kb_refs").array().notNull().default(sql`'{}'::text[]`),
  approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const evalRuns = pgTable("eval_runs", {
  id: id(),
  agentVersionId: uuid("agent_version_id")
    .notNull()
    .references(() => agentVersions.id, { onDelete: "cascade" }),
  mode: evalRunMode("mode").notNull().default("text"),
  startedAt: tstz("started_at").notNull().defaultNow(),
  finishedAt: tstz("finished_at"),
  perLang: jsonb("per_lang"),
  passed: boolean("passed"),
  costUsd: numeric("cost_usd"),
  createdAt: createdAt(),
});

export const evalResults = pgTable(
  "eval_results",
  {
    id: id(),
    runId: uuid("run_id")
      .notNull()
      .references(() => evalRuns.id, { onDelete: "cascade" }),
    itemId: uuid("item_id").references(() => evalItems.id, { onDelete: "set null" }),
    callId: uuid("call_id").references(() => calls.id, { onDelete: "set null" }),
    answer: text("answer"),
    factOk: boolean("fact_ok"),
    policyOk: boolean("policy_ok"),
    langOk: boolean("lang_ok"),
    pass: boolean("pass"),
    judgeRationale: text("judge_rationale"),
    humanOverride: boolean("human_override"),
    overriddenBy: uuid("overridden_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("eval_results_run_idx").on(t.runId)],
);
