import { z } from "zod";

/** Strip spaces, dashes, dots and brackets; a leading "00" becomes "+". */
export function normalizePhone(raw: string): string {
  let s = raw.replace(/[\s\-(). ]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  return s;
}

const e164 = /^\+[1-9]\d{6,14}$/;

const phoneField = z
  .string()
  .transform(normalizePhone)
  .refine((v) => e164.test(v), { message: "phone must be E.164 after normalising" });

export const captureLeadSchema = z
  .object({
    name: z.string().min(1).max(120),
    country: z.string().min(1),
    lang: z.string().min(2),
    phone: phoneField.optional(),
    email: z.string().email().optional(),
    interest: z.string().min(1).max(500),
    preferred_contact_time: z.string().optional(),
    sensitive_note: z.string().max(1000).optional(),
  })
  .strict()
  .refine((v) => v.phone !== undefined || v.email !== undefined, {
    message: "at least one of phone or email is required",
    path: ["phone"],
  });
export type CaptureLead = z.infer<typeof captureLeadSchema>;

export const openCaseSchema = z
  .object({
    contact_id: z.string().min(1),
    type: z.enum(["lead", "assistance", "urgent"]),
    interest: z.string().min(1),
    priority: z.enum(["normal", "high", "urgent"]).optional(),
  })
  .strict()
  .transform((v) => ({ ...v, priority: v.type === "urgent" ? ("urgent" as const) : v.priority }));
export type OpenCase = z.infer<typeof openCaseSchema>;

export const switchPersonaSchema = z
  .object({
    gender: z.enum(["female", "male"]),
    lang: z.string().min(2),
  })
  .strict();
export type SwitchPersona = z.infer<typeof switchPersonaSchema>;

export const endCallCsatSchema = z
  .object({
    score: z.number().int().min(1).max(5),
    comment: z.string().max(300).optional(),
  })
  .strict();
export type EndCallCsat = z.infer<typeof endCallCsatSchema>;

export const NOTE_KEYS = ["name", "need", "dates", "contact", "preference", "question", "other"] as const;
export const saveNoteSchema = z
  .object({
    key: z.enum(NOTE_KEYS),
    value: z.string().max(300),
  })
  .strict();
export type SaveNote = z.infer<typeof saveNoteSchema>;
