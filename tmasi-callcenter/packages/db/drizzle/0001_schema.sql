CREATE TYPE "public"."agent_version_status" AS ENUM('draft', 'candidate', 'live', 'retired');--> statement-breakpoint
CREATE TYPE "public"."call_event_kind" AS ENUM('tool_ok', 'tool_error', 'import', 'judge', 'cost', 'latency');--> statement-breakpoint
CREATE TYPE "public"."call_note_key" AS ENUM('name', 'need', 'dates', 'contact', 'preference', 'question', 'other');--> statement-breakpoint
CREATE TYPE "public"."call_status" AS ENUM('live', 'imported', 'import_failed', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."case_priority" AS ENUM('normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."case_status" AS ENUM('new', 'contacted', 'qualified', 'closed');--> statement-breakpoint
CREATE TYPE "public"."case_type" AS ENUM('lead', 'assistance', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."eval_item_category" AS ENUM('fact', 'out_of_scope', 'missing_price', 'emergency', 'medical_advice', 'forbidden_claim', 'lead_capture', 'voice_switch', 'lang_switch');--> statement-breakpoint
CREATE TYPE "public"."eval_run_mode" AS ENUM('text', 'voice');--> statement-breakpoint
CREATE TYPE "public"."kb_gap_status" AS ENUM('open', 'answered', 'rejected', 'needs_owner');--> statement-breakpoint
CREATE TYPE "public"."knowledge_source_kind" AS ENUM('site', 'data', 'news', 'core_facts', 'staff_faq', 'owner_upload');--> statement-breakpoint
CREATE TYPE "public"."knowledge_usage_mode" AS ENUM('prompt', 'rag');--> statement-breakpoint
CREATE TYPE "public"."note_author" AS ENUM('ai', 'user');--> statement-breakpoint
CREATE TYPE "public"."persona_gender" AS ENUM('female', 'male');--> statement-breakpoint
CREATE TYPE "public"."turn_role" AS ENUM('agent', 'caller', 'tool');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'coordinator', 'viewer');--> statement-breakpoint
CREATE TABLE "agent_versions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"semver" text NOT NULL,
	"status" "agent_version_status" DEFAULT 'draft' NOT NULL,
	"system_prompt" text NOT NULL,
	"first_messages" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"core_facts_hash" text,
	"kb_snapshot_hash" text,
	"llm_model" text NOT NULL,
	"tts_settings" jsonb,
	"guard_settings" jsonb,
	"eval_run_id" uuid,
	"published_by" uuid,
	"published_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"before" jsonb,
	"after" jsonb,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "call_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"call_id" uuid NOT NULL,
	"kind" "call_event_kind" NOT NULL,
	"data" jsonb,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "call_notes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"call_id" uuid NOT NULL,
	"key" "call_note_key" NOT NULL,
	"value" text NOT NULL,
	"lang" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "call_notes_value_len" CHECK (char_length("call_notes"."value") <= 300)
);
--> statement-breakpoint
CREATE TABLE "calls" (
	"id" uuid PRIMARY KEY NOT NULL,
	"el_conversation_id" text NOT NULL,
	"agent_version_id" uuid,
	"persona_id_start" uuid,
	"persona_id_end" uuid,
	"lang_detected" text,
	"langs_seen" text[] DEFAULT '{}'::text[] NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"duration_s" integer,
	"recording_consent" boolean DEFAULT false NOT NULL,
	"ai_disclosed" boolean DEFAULT false NOT NULL,
	"recording_path" text,
	"status" "call_status" DEFAULT 'live' NOT NULL,
	"csat" smallint,
	"judge_score" numeric,
	"judge_pass" boolean,
	"el_cost_usd" numeric,
	"llm_cost_usd" numeric,
	"end_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calls_el_conversation_id_unique" UNIQUE("el_conversation_id"),
	CONSTRAINT "calls_csat_range" CHECK ("calls"."csat" is null or ("calls"."csat" between 1 and 5))
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY NOT NULL,
	"contact_id" uuid,
	"call_id" uuid,
	"type" "case_type" NOT NULL,
	"interest" text,
	"preferred_contact_time" text,
	"sensitive_note" text,
	"summary_en" text,
	"summary_caller_lang" text,
	"status" "case_status" DEFAULT 'new' NOT NULL,
	"priority" "case_priority" DEFAULT 'normal' NOT NULL,
	"owner_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone_e164" text,
	"email" text,
	"country" text,
	"lang" text,
	"consent_recording" boolean DEFAULT false NOT NULL,
	"consent_contact" boolean DEFAULT false NOT NULL,
	"first_call_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eval_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"set_id" uuid NOT NULL,
	"category" "eval_item_category" NOT NULL,
	"question" text NOT NULL,
	"expected_facts" text[] DEFAULT '{}'::text[] NOT NULL,
	"must_not" text[] DEFAULT '{}'::text[] NOT NULL,
	"kb_refs" text[] DEFAULT '{}'::text[] NOT NULL,
	"approved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eval_results" (
	"id" uuid PRIMARY KEY NOT NULL,
	"run_id" uuid NOT NULL,
	"item_id" uuid,
	"call_id" uuid,
	"answer" text,
	"fact_ok" boolean,
	"policy_ok" boolean,
	"lang_ok" boolean,
	"pass" boolean,
	"judge_rationale" text,
	"human_override" boolean,
	"overridden_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eval_runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"mode" "eval_run_mode" DEFAULT 'text' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"per_lang" jsonb,
	"passed" boolean,
	"cost_usd" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eval_sets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"lang" text NOT NULL,
	"name" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kb_gaps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"call_id" uuid,
	"turn_id" uuid,
	"question" text NOT NULL,
	"lang" text,
	"status" "kb_gap_status" DEFAULT 'open' NOT NULL,
	"proposed_answer" text,
	"final_answer" text,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_chunks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"doc_id" uuid NOT NULL,
	"idx" integer NOT NULL,
	"text" text NOT NULL,
	"src" text,
	"tokens" integer NOT NULL,
	"embedding" vector(384),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_docs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_path" text NOT NULL,
	"source_kind" "knowledge_source_kind" NOT NULL,
	"lang" text NOT NULL,
	"title" text NOT NULL,
	"content_md" text NOT NULL,
	"content_hash" text NOT NULL,
	"el_doc_id" text,
	"usage_mode" "knowledge_usage_mode" DEFAULT 'rag' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"case_id" uuid NOT NULL,
	"author" "note_author" NOT NULL,
	"author_user_id" uuid,
	"body" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY NOT NULL,
	"lang" text NOT NULL,
	"gender" "persona_gender" NOT NULL,
	"display_name" text NOT NULL,
	"is_placeholder" boolean DEFAULT true NOT NULL,
	"el_voice_id" text,
	"label" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "turns" (
	"id" uuid PRIMARY KEY NOT NULL,
	"call_id" uuid NOT NULL,
	"idx" integer NOT NULL,
	"role" "turn_role" NOT NULL,
	"text" text,
	"lang" text,
	"t_start_ms" integer,
	"latency_ms" integer,
	"tool_name" text,
	"tool_args" jsonb,
	"tool_result" jsonb,
	"kb_chunk_ids" text[],
	"flags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"pw_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"display_name" text NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "agent_versions" ADD CONSTRAINT "agent_versions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_events" ADD CONSTRAINT "call_events_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_notes" ADD CONSTRAINT "call_notes_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_agent_version_id_agent_versions_id_fk" FOREIGN KEY ("agent_version_id") REFERENCES "public"."agent_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_persona_id_start_personas_id_fk" FOREIGN KEY ("persona_id_start") REFERENCES "public"."personas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_persona_id_end_personas_id_fk" FOREIGN KEY ("persona_id_end") REFERENCES "public"."personas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_first_call_id_calls_id_fk" FOREIGN KEY ("first_call_id") REFERENCES "public"."calls"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_items" ADD CONSTRAINT "eval_items_set_id_eval_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."eval_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_items" ADD CONSTRAINT "eval_items_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_run_id_eval_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."eval_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_item_id_eval_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."eval_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_overridden_by_users_id_fk" FOREIGN KEY ("overridden_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_runs" ADD CONSTRAINT "eval_runs_agent_version_id_agent_versions_id_fk" FOREIGN KEY ("agent_version_id") REFERENCES "public"."agent_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_gaps" ADD CONSTRAINT "kb_gaps_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_gaps" ADD CONSTRAINT "kb_gaps_turn_id_turns_id_fk" FOREIGN KEY ("turn_id") REFERENCES "public"."turns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_gaps" ADD CONSTRAINT "kb_gaps_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_doc_id_knowledge_docs_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."knowledge_docs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turns" ADD CONSTRAINT "turns_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_versions_one_live" ON "agent_versions" USING btree ("status") WHERE "agent_versions"."status" = 'live';--> statement-breakpoint
CREATE UNIQUE INDEX "agent_versions_semver_uq" ON "agent_versions" USING btree ("semver");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_at_idx" ON "audit_log" USING btree ("at");--> statement-breakpoint
CREATE INDEX "call_events_call_idx" ON "call_events" USING btree ("call_id");--> statement-breakpoint
CREATE INDEX "call_notes_call_idx" ON "call_notes" USING btree ("call_id");--> statement-breakpoint
CREATE INDEX "calls_started_idx" ON "calls" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "cases_status_idx" ON "cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cases_contact_idx" ON "cases" USING btree ("contact_id");--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_phone_uq" ON "contacts" USING btree ("phone_e164") WHERE "contacts"."phone_e164" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_email_uq" ON "contacts" USING btree ("email") WHERE "contacts"."email" is not null;--> statement-breakpoint
CREATE INDEX "eval_results_run_idx" ON "eval_results" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "kb_gaps_status_idx" ON "kb_gaps" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_chunks_doc_idx_uq" ON "knowledge_chunks" USING btree ("doc_id","idx");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_docs_path_lang_uq" ON "knowledge_docs" USING btree ("source_path","lang");--> statement-breakpoint
CREATE UNIQUE INDEX "personas_one_default_per_lang" ON "personas" USING btree ("lang") WHERE "personas"."is_default";--> statement-breakpoint
CREATE UNIQUE INDEX "personas_label_uq" ON "personas" USING btree ("label");--> statement-breakpoint
CREATE UNIQUE INDEX "turns_call_idx_uq" ON "turns" USING btree ("call_id","idx");