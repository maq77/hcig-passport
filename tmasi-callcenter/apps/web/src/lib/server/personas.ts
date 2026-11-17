import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { dataDir, getDb, personas as personasTable } from "@tc/db";
import personasJson from "../../../../../agent/personas.json";
import firstMessagesJson from "../../../../../agent/prompts/first-messages.json";
import agentConfig from "../../../../../agent/agent.config.ts";

export interface PersonaEntry {
  lang: string;
  gender: "female" | "male";
  label: string;
  display_name: string;
  el_voice_id: string;
  is_default: boolean;
  is_placeholder: boolean;
}

export const PERSONAS: PersonaEntry[] = (personasJson as { personas: PersonaEntry[] }).personas;
export const EMERGENCY_LINE = agentConfig.dynamicVariables.emergency_line ?? "";
export const DEFAULT_LANG = agentConfig.defaultLang;

const FIRST_MESSAGES = firstMessagesJson as Record<string, string>;

export function firstMessageFor(label: string, personaName: string): string {
  const t = FIRST_MESSAGES[label] ?? FIRST_MESSAGES[`${DEFAULT_LANG.toUpperCase()}_F`] ?? "";
  return t.replaceAll("{{persona_name}}", personaName);
}

/** Pick the persona for a line language and gender. Falls back to English, then to the first entry. */
export function pickPersona(lang: string, gender: "female" | "male"): PersonaEntry {
  const exact = PERSONAS.find((p) => p.lang === lang && p.gender === gender);
  if (exact) return exact;
  // "ar" alone means the Egyptian line; "de-AT" falls back to "de"
  const base = lang.split("-")[0]!;
  const near = PERSONAS.find((p) => p.lang.split("-")[0] === base && p.gender === gender);
  if (near) return near;
  const en = PERSONAS.find((p) => p.lang === DEFAULT_LANG && p.gender === gender);
  return en ?? PERSONAS[0]!;
}

/** Voice fallback written by agent:push into <data>/voices.json when personas.json has no voice ids. */
export function fallbackVoiceId(gender: "female" | "male"): string | null {
  const f = join(dataDir(), "voices.json");
  if (!existsSync(f)) return null;
  try {
    const v = JSON.parse(readFileSync(f, "utf8")) as Record<string, { voiceId?: string } | undefined>;
    return v[gender]?.voiceId ?? null;
  } catch {
    return null;
  }
}

export function voiceIdFor(p: { el_voice_id?: string | null; gender: "female" | "male" }): string | null {
  return p.el_voice_id || fallbackVoiceId(p.gender);
}

/** Make sure every persona of personas.json has a database row (the calls table points at them). Returns label -> id. */
export async function ensurePersonaRows(): Promise<Map<string, string>> {
  const db = await getDb();
  const rows = await db.select({ id: personasTable.id, label: personasTable.label }).from(personasTable);
  const have = new Set(rows.map((r) => r.label));
  const missing = PERSONAS.filter((p) => !have.has(p.label));
  if (missing.length) {
    await db
      .insert(personasTable)
      .values(
        missing.map((p) => ({
          lang: p.lang,
          gender: p.gender,
          displayName: p.display_name,
          isPlaceholder: p.is_placeholder,
          elVoiceId: p.el_voice_id || null,
          label: p.label,
          isDefault: p.is_default,
        })),
      )
      .onConflictDoNothing();
  }
  const all = await db.select({ id: personasTable.id, label: personasTable.label }).from(personasTable);
  return new Map(all.map((r) => [r.label, r.id]));
}

export async function personaById(id: string | null | undefined) {
  if (!id) return null;
  const db = await getDb();
  const [row] = await db.select().from(personasTable).where(eq(personasTable.id, id));
  return row ?? null;
}
