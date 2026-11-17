import { describe, expect, it } from "vitest";
import {
  SPARK,
  caseProgress,
  chunkWords,
  consentFromReply,
  emptyCase,
  fmtClock,
  maskPhone,
  median,
  mergeCaseFields,
  recentMeta,
  recentResult,
  recentTitle,
  saidItIsAi,
  sparkPoints,
  sparkY,
} from "../../apps/web/src/lib/test-line-ui.ts";

describe("median", () => {
  it("handles odd, even and empty lists", () => {
    expect(median([0.9, 0.6, 0.7])).toBe(0.7);
    expect(median([0.6, 0.8])).toBeCloseTo(0.7);
    expect(median([])).toBeNull();
  });
});

describe("sparkline mapping", () => {
  it("maps 0 to the bottom, 2 s to the top and the 1.0 s target to the middle", () => {
    expect(sparkY(0)).toBe(SPARK.h - SPARK.padY);
    expect(sparkY(2)).toBe(SPARK.padY);
    expect(sparkY(1)).toBe(SPARK.h / 2);
    expect(sparkY(5)).toBe(SPARK.padY); // clamped
  });
  it("spreads points from 20 to 280 and centres a single point", () => {
    const p = sparkPoints([0.6, 0.7, 0.8]);
    expect(p.map((q) => q.x)).toEqual([20, 150, 280]);
    expect(sparkPoints([1])[0]!.x).toBe(150);
  });
});

describe("maskPhone", () => {
  it("keeps the country code and the last two digits", () => {
    expect(maskPhone("+491701234521")).toBe("+49 ··· ··· 21");
    expect(maskPhone("+201001234567")).toBe("+20 ··· ··· 67");
    expect(maskPhone("")).toBe("");
  });
});

describe("consentFromReply", () => {
  it("reads yes, no and unclear like the server import", () => {
    expect(consentFromReply("Yes, that's fine")).toBe("allowed");
    expect(consentFromReply("نعم")).toBe("allowed");
    expect(consentFromReply("No, please do not")).toBe("declined");
    expect(consentFromReply("Hmm, what for")).toBeNull();
  });
});

describe("mergeCaseFields", () => {
  it("fills fields from tools and notes and defaults the type to Lead", () => {
    let c = emptyCase();
    c = mergeCaseFields(c, { tool: "save_note", args: { key: "name", value: "Sara" } });
    expect(c.type).toBe("Lead");
    c = mergeCaseFields(c, { tool: "save_note", args: { key: "need", value: "Check-up in Hurghada" } });
    c = mergeCaseFields(c, { tool: "save_note", args: { key: "dates", value: "Next month" } });
    expect(c.dates).toBe("Next month");
    c = mergeCaseFields(c, { tool: "capture_lead", args: { name: "Sara", country: "Germany", phone: "+491701234521", interest: "Check-up" } });
    expect(c.country).toBe("Germany");
    expect(c.contact).toBe("+491701234521");
    expect(c.need).toBe("Check-up");
    expect(c.created).toBe(false);
    c = mergeCaseFields(c, { tool: "open_case", args: { type: "urgent", interest: "Check-up" }, ok: true });
    expect(c.type).toBe("Urgent");
    expect(c.created).toBe(true);
    expect(caseProgress(c)).toEqual({ filled: 5, total: 5 });
  });
  it("never blanks an existing value", () => {
    const c = mergeCaseFields({ ...emptyCase(), name: "Sara" }, { tool: "save_note", args: { key: "name", value: "" } });
    expect(c.name).toBe("Sara");
  });
});

describe("small helpers", () => {
  it("chunks words by three", () => {
    expect(chunkWords("a b c d e f g")).toEqual(["a b c", "d e f", "g"]);
  });
  it("formats the clock", () => {
    expect(fmtClock(102)).toBe("01:42");
  });
  it("detects the opening line", () => {
    const fm = "Hello, I'm Emma, the AI assistant of TMASI Global. Before we start, is it okay?";
    expect(saidItIsAi("Hello, I'm Emma, the AI assistant of TMASI Global.", fm)).toBe(true);
    expect(saidItIsAi("Good morning", fm)).toBe(false);
  });
  it("describes recent calls", () => {
    expect(recentTitle({ contactName: "Sara", interest: "Check-up" })).toBe("Sara · Check-up");
    expect(recentTitle({ contactName: null, interest: null })).toBe("Test call");
    expect(recentResult({ hasCase: true, gapCount: 2 }).text).toBe("Case created");
    expect(recentResult({ hasCase: false, gapCount: 2 }).text).toBe("2 questions to answer");
    expect(recentResult({ hasCase: false, gapCount: 0 }).text).toBe("Answered");
    const now = new Date("2026-11-17T12:00:00");
    expect(recentMeta({ startedAt: "2026-11-17T09:00:00", durationS: 192, langsSeen: ["en", "ar"] }, now)).toBe("Today · 03:12 · EN, AR");
  });
});
