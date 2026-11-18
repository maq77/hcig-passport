// Pure helpers of the test line screens (no React), so they can be unit tested.

const AFFIRM = /\b(yes|yeah|yep|sure|ok|okay|of course|fine|go ahead|ja|klar|gern|natürlich|да|конечно|хорошо|tak|jasne|oczywiście|sí|si|claro|por supuesto|oui|bien sûr|d'accord|ano|jistě|samozřejmě)\b|نعم|أيوه|ايوه|اه|آه|طبعا|طبعاً|تمام|اكيد|أكيد|موافق/i;
const NEGATE = /\b(no|nope|nein|нет|не надо|nie|non|ne)\b|لا\b|مش موافق|لأ/i;

export type Consent = "allowed" | "declined" | null;

/** Same reading as the server import: a no wins, then a yes, else still unclear (null). */
export function consentFromReply(text: string): Consent {
  const t = text ?? "";
  if (t && NEGATE.test(t)) return "declined";
  if (t && AFFIRM.test(t)) return "allowed";
  return null;
}

export function median(values: number[]): number | null {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m]! : (v[m - 1]! + v[m]!) / 2;
}

/** "0.7 s" from milliseconds, one decimal. */
export function fmtSeconds(ms: number | null): string {
  return ms == null ? "n/a" : `${(ms / 1000).toFixed(1)} s`;
}

export function fmtClock(totalS: number): string {
  const s = Math.max(0, Math.floor(totalS));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Sparkline geometry: the 0 to 2 s scale in a 300 x 70 box with 6 px padding top and bottom. */
export const SPARK = { w: 300, h: 70, padY: 6, padX: 20, maxS: 2, targetS: 1 } as const;

export function sparkY(seconds: number): number {
  const v = Math.min(Math.max(seconds, 0), SPARK.maxS);
  const usable = SPARK.h - SPARK.padY * 2;
  return Math.round((SPARK.h - SPARK.padY - (v / SPARK.maxS) * usable) * 10) / 10;
}

export function sparkPoints(secondsList: number[]): { x: number; y: number }[] {
  const n = secondsList.length;
  const span = SPARK.w - SPARK.padX * 2;
  return secondsList.map((s, i) => ({ x: n === 1 ? SPARK.w / 2 : Math.round((SPARK.padX + (i * span) / (n - 1)) * 10) / 10, y: sparkY(s) }));
}

const CALLING_CODES = new Set("1 7 20 27 30 31 32 33 34 36 39 40 41 43 44 45 46 47 48 49 61 81 82 86 90 91 212 213 216 218 351 352 353 357 358 375 380 420 421 961 962 964 965 966 968 971 972 973 974".split(" "));

/** "+49 ··· ··· 21": country code and last two digits stay, the rest is hidden. */
export function maskPhone(phone: string | null | undefined): string {
  const p = (phone ?? "").trim();
  if (!p) return "";
  const digits = p.replace(/[^\d]/g, "");
  if (digits.length < 5) return p;
  const all = p.startsWith("+") || p.startsWith("00") ? p.replace(/^\+|^00/, "").replace(/[^\d]/g, "") : digits;
  const cc = `+${[3, 2, 1].map((n) => all.slice(0, n)).find((c) => CALLING_CODES.has(c)) ?? all.slice(0, 2)}`;
  return `${cc} ··· ··· ${digits.slice(-2)}`;
}

export function maskContact(v: string): string {
  return v.includes("@") ? v : maskPhone(v);
}

export const LANG_NATIVE: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  ru: "Русский",
  pl: "Polski",
  ar: "العربية",
  es: "Español",
  it: "Italiano",
  fr: "Français",
  cs: "Čeština",
};
export const LANG_ENGLISH: Record<string, string> = {
  en: "English",
  de: "German",
  ru: "Russian",
  pl: "Polish",
  ar: "Arabic",
  es: "Spanish",
  it: "Italian",
  fr: "French",
  cs: "Czech",
};

export const baseOf = (l: string | null | undefined): string => (l ?? "en").split("-")[0]!.toLowerCase();
export const nativeName = (l: string | null | undefined): string => LANG_NATIVE[baseOf(l)] ?? (l ?? "").toUpperCase();
export const englishName = (l: string | null | undefined): string => LANG_ENGLISH[baseOf(l)] ?? (l ?? "").toUpperCase();

export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Split an agent line into chunks of about n words for the staggered entrance. */
export function chunkWords(text: string, n = 3): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length; i += n) out.push(words.slice(i, i + n).join(" "));
  return out;
}

// ---- case card ----
export interface CaseFields {
  type: "Lead" | "Assistance" | "Urgent" | null;
  name: string | null;
  country: string | null;
  need: string | null;
  dates: string | null;
  contact: string | null;
  created: boolean;
}
export const emptyCase = (): CaseFields => ({ type: null, name: null, country: null, need: null, dates: null, contact: null, created: false });

export type CaseEvent =
  | { tool: "capture_lead"; args: Record<string, unknown> }
  | { tool: "open_case"; args: Record<string, unknown>; ok: boolean }
  | { tool: "save_note"; args: Record<string, unknown> };

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const TYPE_LABEL = { lead: "Lead", assistance: "Assistance", urgent: "Urgent" } as const;

/** Merge one tool call or note into the live case fields. Later values win; nothing is ever blanked. */
export function mergeCaseFields(prev: CaseFields, ev: CaseEvent): CaseFields {
  const next = { ...prev };
  if (ev.tool === "capture_lead") {
    next.name = str(ev.args.name) ?? next.name;
    next.country = str(ev.args.country) ?? next.country;
    next.need = str(ev.args.interest) ?? next.need;
    next.dates = str(ev.args.preferred_contact_time) ?? next.dates;
    next.contact = str(ev.args.phone) ?? str(ev.args.email) ?? next.contact;
  } else if (ev.tool === "open_case") {
    const t = str(ev.args.type);
    if (t && t in TYPE_LABEL) next.type = TYPE_LABEL[t as keyof typeof TYPE_LABEL];
    next.need = str(ev.args.interest) ?? next.need;
    if (ev.ok) next.created = true;
  } else {
    const v = str(ev.args.value);
    if (v) {
      const k = str(ev.args.key);
      if (k === "name") next.name = v;
      else if (k === "need") next.need = v;
      else if (k === "dates") next.dates = v;
      else if (k === "contact") next.contact = v;
    }
  }
  if (!next.type && (next.name || next.country || next.need || next.contact)) next.type = "Lead";
  return next;
}

export function caseProgress(c: CaseFields): { filled: number; total: 5 } {
  const filled = [c.type, c.name, c.country, c.need, c.contact].filter(Boolean).length;
  return { filled, total: 5 };
}

/** Compare the first agent line with the opening line the server gave the agent. */
export function saidItIsAi(agentText: string, firstMessage: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
  const a = norm(agentText);
  const f = norm(firstMessage);
  if (!a) return false;
  if (!f) return false;
  const head = f.slice(0, 40);
  return a.includes(head) || f.includes(a.slice(0, 40));
}

// ---- recent calls ----
export interface RecentCall {
  id: string;
  startedAt: string | null;
  durationS: number | null;
  langsSeen: string[];
  hasCase: boolean;
  contactName: string | null;
  interest: string | null;
  gapCount: number;
}
export function recentTitle(c: Pick<RecentCall, "contactName" | "interest">): string {
  const t = [c.contactName, c.interest].filter(Boolean).join(" · ");
  return t || "Test call";
}
export function recentMeta(c: Pick<RecentCall, "startedAt" | "durationS" | "langsSeen">, now = new Date()): string {
  const d = c.startedAt ? new Date(c.startedAt) : null;
  const same = d && d.toDateString() === now.toDateString();
  const day = d ? (same ? "Today" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })) : "";
  const parts = [day, c.durationS != null ? fmtClock(c.durationS) : "", c.langsSeen.map((l) => baseOf(l).toUpperCase()).join(", ")].filter(Boolean);
  return parts.join(" · ");
}
export function recentResult(c: Pick<RecentCall, "hasCase" | "gapCount">): { text: string; color: string } {
  if (c.hasCase) return { text: "Case created", color: "#00797B" };
  if (c.gapCount > 0) return { text: `${c.gapCount} ${c.gapCount === 1 ? "question" : "questions"} to answer`, color: "#9A5B00" };
  return { text: "Answered", color: "#00797B" };
}

export function transcriptText(lines: { who: string; text: string }[]): string {
  return lines.map((l) => `${l.who}: ${l.text}`).join("\n\n") + "\n";
}

/**
 * The agent's expressive audio tags ("[happy]", "[laughs]", "[slow]") steer the voice and are never spoken.
 * They are removed from captions and transcripts on the page; blank lines the agent sends are collapsed.
 */
export function stripAudioTags(text: string): string {
  return text
    .replace(/<retrieved-knowledge-base>[\s\S]*?<\/retrieved-knowledge-base>\s*/g, "")
    .replace(/\[[a-zA-Z][a-zA-Z \-]{0,30}\]\s*/g, "")
    .replace(/<\/?(?:woman|man|[A-Z]{2,4}_[FM])>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
