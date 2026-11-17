// Logic of the plain test line (no React here, so it can be unit tested). The page wires it to useConversation.
// Client tools follow contracts/client-tools.md: each POSTs to /api/tools/* with callId and toolToken and returns the JSON as a string.

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "ru", label: "Русский" },
  { value: "pl", label: "Polski" },
  { value: "ar-EG", label: "العربية مصر" },
  { value: "ar-AE", label: "العربية الخليج" },
  { value: "es", label: "Español" },
  { value: "it", label: "Italiano" },
  { value: "fr", label: "Français" },
  { value: "cs", label: "Čeština" },
] as const;

export type Gender = "female" | "male";

export interface TokenResponse {
  ok: true;
  conversationToken?: string;
  signedUrl?: string;
  connectionType: "webrtc" | "websocket";
  callId: string;
  toolToken: string;
  agentId: string;
  persona: { label: string; displayName: string; voiceId: string | null; lang: string };
  firstMessage: string;
  dynamicVariables: { persona_name: string; emergency_line: string };
}

export interface TranscriptLine {
  id: number;
  role: "agent" | "caller";
  text: string;
  lang: string | null;
  /** Agent lines only: caller final transcript to the agent's first audio, measured in the browser. */
  latencyMs: number | null;
}

export interface CallSession {
  callId: string;
  toolToken: string;
  /** Latest language the page knows (starting language, then the detected one). */
  lang: () => string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body: unknown,
  ) {
    super(message);
  }
}

export async function postJson<T = unknown>(url: string, body: unknown, f: typeof fetch = fetch): Promise<T> {
  const res = await f(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

export function startCall(lang: string, gender: Gender, f: typeof fetch = fetch): Promise<TokenResponse> {
  return postJson<TokenResponse>("/api/el/token", { lang, gender }, f);
}

type ToolFn = (params: Record<string, unknown>) => Promise<string | void> | void;

/**
 * The five client tools. Failures never throw into the call: the agent gets {ok:false, say}.
 * save_note is fire and forget (the agent does not wait): it returns nothing and ignores errors.
 */
export function makeClientTools(session: () => CallSession | null, f: typeof fetch = fetch): Record<string, ToolFn> {
  const post = async (path: string, params: Record<string, unknown>): Promise<string> => {
    const s = session();
    if (!s) return JSON.stringify({ ok: false, say: "Sorry, I could not save that. Please carry on." });
    try {
      const data = await postJson(`/api/tools/${path}`, { ...params, callId: s.callId, toolToken: s.toolToken, ctxLang: s.lang() }, f);
      return JSON.stringify(data);
    } catch (e) {
      const body = e instanceof ApiError ? (e.body as { say?: string } | null) : null;
      return JSON.stringify({ ok: false, say: body?.say ?? "Sorry, I could not save that. Please carry on." });
    }
  };
  return {
    capture_lead: (p) => post("capture-lead", p),
    open_case: (p) => post("open-case", p),
    switch_persona: (p) => post("switch-persona", p),
    end_call_csat: (p) => post("csat", p),
    save_note: (p) => {
      void post("save-note", p);
    },
  };
}

/** Measures caller final transcript to the agent's first audio, in the browser. */
export class LatencyTracker {
  private userFinalAt: number | null = null;
  private pending: number | null = null;
  constructor(private now: () => number = () => performance.now()) {}

  onUserFinal(): void {
    this.userFinalAt = this.now();
    this.pending = null;
  }

  /** The agent started speaking. Returns the latency once per user turn. */
  onAgentAudio(): number | null {
    if (this.userFinalAt === null) return null;
    this.pending = Math.round(this.now() - this.userFinalAt);
    this.userFinalAt = null;
    return this.pending;
  }

  /** Latency for the agent line that just arrived: the audio event value, or measured now when audio came later. */
  takeForAgentLine(): number | null {
    if (this.pending !== null) {
      const v = this.pending;
      this.pending = null;
      return v;
    }
    if (this.userFinalAt !== null) {
      const v = Math.round(this.now() - this.userFinalAt);
      this.userFinalAt = null;
      return v;
    }
    return null;
  }
}

/** Language from a language_detection tool result, best effort (the SDK passes the raw tool result string). */
export function parseDetectedLanguage(result: string): string | null {
  const t = result.trim();
  if (/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(t)) return t;
  const m = /"?language(?:_detected|_code)?"?\s*[:=]\s*"?([A-Za-z]{2,3}(?:-[A-Za-z]{2,4})?)"?/.exec(t);
  return m ? m[1]! : null;
}

/** Friendly text for the failures a visitor can hit when starting a call. */
export function friendlyStartError(e: unknown): string {
  const name = (e as { name?: string } | null)?.name ?? "";
  const msg = e instanceof Error ? e.message : String(e);
  if (name === "NotAllowedError" || name === "SecurityError" || /permission|denied|not allowed/i.test(msg)) {
    return "The microphone is blocked. Allow microphone access for this page in the browser address bar, then press Start call again.";
  }
  if (name === "NotFoundError" || /no (audio )?input|requested device not found|not found/i.test(msg) && /device|microphone/i.test(msg)) {
    return "No microphone was found. Plug one in or choose one in the system sound settings, then try again.";
  }
  if (name === "NotReadableError") return "The microphone is busy in another app. Close that app and try again.";
  if (e instanceof ApiError) return e.message;
  return msg || "Could not start the call.";
}

/** Convert the picker value to the 2-letter language the platform override accepts (ar-EG and ar-AE both use ar). */
export function platformLanguage(tag: string): string {
  return tag.split("-")[0]!.toLowerCase();
}
