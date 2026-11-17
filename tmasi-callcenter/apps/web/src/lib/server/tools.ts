// Logic of the client-tool routes (contracts/client-tools.md). Routes stay thin: parse, authorise, call these.
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { captureLeadSchema, endCallCsatSchema, openCaseSchema, saveNoteSchema, switchPersonaSchema, type CaptureLead } from "@tc/core";
import { callNotes, calls, cases, contacts, getDb, personas as personasTable, writeAudit } from "@tc/db";
import { isUuid, requireCall } from "./calls.ts";
import { HttpError, readJsonObject } from "./http.ts";
import { ensurePersonaRows, personaById, pickPersona } from "./personas.ts";
import { baseLang, saySoon } from "./say.ts";
import { requireToolToken } from "./tool-auth.ts";

export interface ToolEnvelope {
  callId: string;
  lang: string | null;
  args: Record<string, unknown>;
}

/** Split {callId, toolToken, ctxLang?, ...args}. ctxLang is the call language the page knows (the tool args may carry their own lang). Checks the token (403) before anything else is validated. */
export async function parseToolRequest(req: Request): Promise<ToolEnvelope> {
  const body = await readJsonObject(req);
  const { callId, toolToken, ctxLang, ...args } = body;
  const id = requireToolToken(callId, toolToken);
  return { callId: id, lang: typeof ctxLang === "string" && ctxLang ? ctxLang : null, args };
}

export async function captureLead(env: ToolEnvelope) {
  const call = await requireCall(env.callId);
  const input: CaptureLead = captureLeadSchema.parse(env.args);
  const db = await getDb();
  const match = [input.phone ? eq(contacts.phoneE164, input.phone) : undefined, input.email ? eq(contacts.email, input.email) : undefined].filter(
    (x) => x !== undefined,
  );
  const [existing] = await db
    .select()
    .from(contacts)
    .where(or(...match));
  let contactId: string;
  if (existing) {
    contactId = existing.id;
    await db
      .update(contacts)
      .set({
        name: input.name,
        country: input.country,
        lang: input.lang,
        phoneE164: existing.phoneE164 ?? input.phone ?? null,
        email: existing.email ?? input.email ?? null,
        consentRecording: call.recordingConsent || existing.consentRecording,
      })
      .where(eq(contacts.id, existing.id));
    await writeAudit(null, "contact.update", "contacts", contactId, { name: existing.name }, { name: input.name, callId: call.id });
  } else {
    const [row] = await db
      .insert(contacts)
      .values({
        name: input.name,
        phoneE164: input.phone ?? null,
        email: input.email ?? null,
        country: input.country,
        lang: input.lang,
        consentRecording: call.recordingConsent,
        firstCallId: call.id,
      })
      .returning({ id: contacts.id });
    contactId = row!.id;
    await writeAudit(null, "contact.create", "contacts", contactId, null, { name: input.name, callId: call.id });
  }
  // keep these on the call as notes so open_case and the reviewer can copy them into the case
  if (input.sensitive_note) {
    await db.insert(callNotes).values({ callId: call.id, key: "other", value: `[sensitive] ${input.sensitive_note}`.slice(0, 300), lang: baseLang(input.lang) });
  }
  if (input.preferred_contact_time) {
    await db.insert(callNotes).values({ callId: call.id, key: "preference", value: `Best time: ${input.preferred_contact_time}`.slice(0, 300), lang: baseLang(input.lang) });
  }
  return { ok: true as const, contact_id: contactId, returning: Boolean(existing) };
}

export async function openCase(env: ToolEnvelope) {
  const call = await requireCall(env.callId);
  const input = openCaseSchema.parse(env.args);
  if (!isUuid(input.contact_id)) throw new HttpError(400, "contact_id must be the id returned by capture_lead");
  const db = await getDb();
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, input.contact_id));
  if (!contact) throw new HttpError(404, "Unknown contact_id", { say: "Sorry, I could not open that. A coordinator will follow up." });
  const priority = input.type === "urgent" ? "urgent" : (input.priority ?? "normal");
  const sensitive = await db
    .select({ value: callNotes.value })
    .from(callNotes)
    .where(and(eq(callNotes.callId, call.id), eq(callNotes.key, "other")));
  const sens = sensitive.find((n) => n.value.startsWith("[sensitive] "))?.value.slice("[sensitive] ".length) ?? null;
  const [row] = await db
    .insert(cases)
    .values({ contactId: contact.id, callId: call.id, type: input.type, interest: input.interest, priority, sensitiveNote: sens })
    .returning({ id: cases.id });
  const caseId = row!.id;
  await writeAudit(null, "case.create", "cases", caseId, null, { type: input.type, priority, callId: call.id });
  const persona = await personaById(call.personaIdStart);
  const lang = env.lang ?? call.langDetected ?? persona?.lang ?? "en";
  return { ok: true as const, case_id: caseId, say: saySoon(lang) };
}

export async function switchPersona(env: ToolEnvelope) {
  const call = await requireCall(env.callId);
  const input = switchPersonaSchema.parse(env.args);
  const start = await personaById(call.personaIdStart);
  // R4a: the voice follows the STARTING line language, only the gender changes
  const target = pickPersona(start?.lang ?? input.lang, input.gender);
  const ids = await ensurePersonaRows();
  const personaId = ids.get(target.label);
  const db = await getDb();
  if (personaId) await db.update(calls).set({ personaIdEnd: personaId }).where(eq(calls.id, call.id));
  await writeAudit(null, "call.switch_persona", "calls", call.id, { from: start?.label ?? null }, { to: target.label });
  const [row] = personaId ? await db.select().from(personasTable).where(eq(personasTable.id, personaId)) : [];
  return { ok: true as const, label: target.label, display_name: row?.displayName ?? target.display_name };
}

export async function csat(env: ToolEnvelope) {
  const call = await requireCall(env.callId);
  const input = endCallCsatSchema.parse(env.args);
  const db = await getDb();
  await db.update(calls).set({ csat: input.score }).where(eq(calls.id, call.id));
  await writeAudit(null, "call.csat", "calls", call.id, { csat: call.csat }, { csat: input.score, comment: input.comment ?? null });
  return { ok: true as const };
}

export async function saveNote(env: ToolEnvelope) {
  const call = await requireCall(env.callId);
  const input = saveNoteSchema.parse(env.args);
  const db = await getDb();
  const [row] = await db
    .insert(callNotes)
    .values({ callId: call.id, key: input.key, value: input.value, lang: env.lang ? baseLang(env.lang) : null })
    .returning({ id: callNotes.id });
  await writeAudit(null, "call_note.create", "call_notes", row!.id, null, { callId: call.id, key: input.key });
  return { ok: true as const };
}

export const linkBody = z.object({ callId: z.string(), conversationId: z.string().min(1).max(200), toolToken: z.string() }).strict();
