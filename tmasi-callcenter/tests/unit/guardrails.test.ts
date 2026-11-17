import { describe, it, expect } from "vitest";
import { findForbiddenClaims, hasEmergencySignal, hasMedicalAdvice, ALLOWED_LEAD_FIELDS } from "../../packages/core/src/guardrails.ts";

describe("guardrails", () => {
  it("flags forbidden claims in several languages", () => {
    expect(findForbiddenClaims("TMASI is fully accredited")).toContain("accredit");
    expect(findForbiddenClaims("Wir sind akkreditiert")).toContain("akkreditier");
    expect(findForbiddenClaims("We are the best in Egypt")).toContain("the best");
    expect(findForbiddenClaims("TMASI has five hubs and a 24/7 desk")).toEqual([]);
  });
  it("detects emergencies across languages", () => {
    expect(hasEmergencySignal("I have chest pain right now")).toBe(true);
    expect(hasEmergencySignal("عندي ألم في الصدر")).toBe(true);
    expect(hasEmergencySignal("Ich habe Atemnot")).toBe(true);
    expect(hasEmergencySignal("I want a check-up next month")).toBe(false);
  });
  it("detects medical advice in agent turns", () => {
    expect(hasMedicalAdvice("You should take 400 mg of ibuprofen")).toBe(true);
    expect(hasMedicalAdvice("A doctor needs to assess that. Shall I arrange a consultation?")).toBe(false);
  });
  it("lists exactly the allowed lead fields", () => {
    expect([...ALLOWED_LEAD_FIELDS].sort()).toEqual(["country", "email", "interest", "lang", "name", "phone", "preferred_contact_time", "sensitive_note"]);
  });
});
