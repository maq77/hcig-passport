import { describe, it, expect } from "vitest";
import {
  captureLeadSchema,
  openCaseSchema,
  endCallCsatSchema,
  saveNoteSchema,
  switchPersonaSchema,
  normalizePhone,
} from "../../packages/core/src/tools.ts";
import { uuidv7 } from "../../packages/core/src/uuid.ts";

const base = { name: "Anna", country: "DE", lang: "de", interest: "Knee check and a week by the sea" };

describe("normalizePhone", () => {
  it("strips separators and converts 00 to +", () => {
    expect(normalizePhone("00 49 (170) 935-0490")).toBe("+491709350490");
    expect(normalizePhone("+20 120 678 8566")).toBe("+201206788566");
  });
});

describe("capture_lead", () => {
  it("accepts phone only, normalising it", () => {
    const r = captureLeadSchema.parse({ ...base, phone: "0049 170 9350490" });
    expect(r.phone).toBe("+491709350490");
  });
  it("accepts email only", () => {
    expect(captureLeadSchema.safeParse({ ...base, email: "a@b.co" }).success).toBe(true);
  });
  it("requires phone or email", () => {
    expect(captureLeadSchema.safeParse(base).success).toBe(false);
  });
  it("rejects unknown fields", () => {
    expect(captureLeadSchema.safeParse({ ...base, email: "a@b.co", passport: "X1" }).success).toBe(false);
  });
  it("rejects bad phone, bad email, long fields, empty name", () => {
    expect(captureLeadSchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
    expect(captureLeadSchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
    expect(captureLeadSchema.safeParse({ ...base, email: "a@b.co", interest: "x".repeat(501) }).success).toBe(false);
    expect(captureLeadSchema.safeParse({ ...base, email: "a@b.co", name: "" }).success).toBe(false);
    expect(captureLeadSchema.safeParse({ ...base, email: "a@b.co", name: "x".repeat(121) }).success).toBe(false);
    expect(captureLeadSchema.safeParse({ ...base, email: "a@b.co", sensitive_note: "x".repeat(1001) }).success).toBe(false);
    expect(captureLeadSchema.safeParse({ ...base, email: "a@b.co", sensitive_note: "x".repeat(1000) }).success).toBe(true);
  });
});

describe("open_case", () => {
  it("forces urgent priority when type is urgent", () => {
    const r = openCaseSchema.parse({ contact_id: "c1", type: "urgent", interest: "chest pain", priority: "normal" });
    expect(r.priority).toBe("urgent");
  });
  it("rejects unknown type and extra fields", () => {
    expect(openCaseSchema.safeParse({ contact_id: "c1", type: "x", interest: "i" }).success).toBe(false);
    expect(openCaseSchema.safeParse({ contact_id: "c1", type: "lead", interest: "i", extra: 1 }).success).toBe(false);
  });
});

describe("switch_persona, end_call_csat, save_note", () => {
  it("validates persona", () => {
    expect(switchPersonaSchema.safeParse({ gender: "male", lang: "de" }).success).toBe(true);
    expect(switchPersonaSchema.safeParse({ gender: "other", lang: "de" }).success).toBe(false);
  });
  it("csat score is an integer 1 to 5", () => {
    expect(endCallCsatSchema.safeParse({ score: 5 }).success).toBe(true);
    expect(endCallCsatSchema.safeParse({ score: 0 }).success).toBe(false);
    expect(endCallCsatSchema.safeParse({ score: 6 }).success).toBe(false);
    expect(endCallCsatSchema.safeParse({ score: 3.5 }).success).toBe(false);
    expect(endCallCsatSchema.safeParse({ score: 3, comment: "x".repeat(301) }).success).toBe(false);
  });
  it("save_note key enum and value length", () => {
    expect(saveNoteSchema.safeParse({ key: "dates", value: "May" }).success).toBe(true);
    expect(saveNoteSchema.safeParse({ key: "age", value: "1" }).success).toBe(false);
    expect(saveNoteSchema.safeParse({ key: "other", value: "x".repeat(301) }).success).toBe(false);
  });
});

describe("uuidv7", () => {
  it("has version 7, variant bits and sorts by time", () => {
    const a = uuidv7(1_000_000);
    const b = uuidv7(2_000_000);
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(a < b).toBe(true);
  });
});
