"use client";

// All the call logic of the test line in one hook. The screens only draw what it returns.
import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ApiError,
  LatencyTracker,
  friendlyStartError,
  makeClientTools,
  parseDetectedLanguage,
  platformLanguage,
  postJson,
  startCall,
  type CallSession,
  type Gender,
  type TokenResponse,
} from "../../lib/test-line.ts";
import { baseOf, consentFromReply, emptyCase, mergeCaseFields, stripAudioTags, type CaseEvent, type CaseFields, type Consent, type RecentCall } from "../../lib/test-line-ui.ts";

export type Phase = "idle" | "connecting" | "live" | "ended";

export interface ChatLine {
  id: number;
  role: "agent" | "caller";
  text: string;
  lang: string;
  latencyMs: number | null;
  persona: string | null;
}
export interface LangEvent {
  lang: string;
  atS: number;
}
export interface BannerState {
  kind: "mic" | "key" | "agent" | "dropped" | "other";
  text: string;
}
export interface ImportResult {
  ok: boolean;
  callId: string;
  turns: number;
  durationS: number | null;
  recordingConsent: boolean;
  recordingPath: string | null;
  postCall: string;
  langsSeen?: string[];
}
interface NoteRow {
  id: string;
  key: string;
  value: string;
  at: string;
}
export interface AgentStatus {
  ready: boolean;
  version: string | null;
}
export interface PersonaNames {
  female: string;
  male: string;
}

export const MIC_BLOCKED = "Microphone is blocked. Click the lock icon in the address bar, allow the microphone, then try again.";
export const KEY_MISSING = "The voice service key is missing. Add ELEVENLABS_API_KEY to tmasi-callcenter/.env.local and restart.";
export const AGENT_MISSING = "The agent is not set up yet. Run npm run agent:push in tmasi-callcenter, then reload this page.";
export const DROPPED = "The call dropped. Your transcript so far is saved.";

export function bannerFromError(e: unknown): BannerState {
  if (e instanceof ApiError) {
    const code = (e.body as { code?: string } | null)?.code;
    if (code === "missing_api_key") return { kind: "key", text: KEY_MISSING };
    if (code === "no_agent") return { kind: "agent", text: AGENT_MISSING };
    return { kind: "other", text: e.message };
  }
  const name = (e as { name?: string } | null)?.name ?? "";
  if (name === "NotAllowedError" || name === "SecurityError") return { kind: "mic", text: MIC_BLOCKED };
  return { kind: "other", text: friendlyStartError(e) };
}

export function useTestLine() {
  const [lang, setLang] = useState("en");
  const [gender, setGender] = useState<Gender>("female");
  const [phase, setPhase] = useState<Phase>("idle");
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [token, setToken] = useState<TokenResponse | null>(null);
  const [personaName, setPersonaName] = useState<string | null>(null);
  const [activeGender, setActiveGender] = useState<Gender>("female");
  const [names, setNames] = useState<PersonaNames>({ female: "Emma", male: "James" });
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [langEvents, setLangEvents] = useState<LangEvent[]>([]);
  const [caseFields, setCaseFields] = useState<CaseFields>(emptyCase());
  const [consent, setConsent] = useState<Consent>(null);
  const [voiceChanged, setVoiceChanged] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [now, setNow] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedElapsed, setEndedElapsed] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [afterCallId, setAfterCallId] = useState<string | null>(null);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [recent, setRecent] = useState<RecentCall[]>([]);

  const sessionRef = useRef<{ callId: string; toolToken: string } | null>(null);
  const langRef = useRef("en");
  const conversationIdRef = useRef<string | null>(null);
  const importedRef = useRef(false);
  const lineId = useRef(0);
  const tracker = useRef(new LatencyTracker());
  const startedAtRef = useRef<number | null>(null);
  const callerSeenRef = useRef(false);
  const personaNameRef = useRef<string | null>(null);
  const langEventsRef = useRef<LangEvent[]>([]);
  const volumeRef = useRef<{ input: () => number; output: () => number }>({ input: () => 0, output: () => 0 });

  const elapsedS = useCallback(() => (startedAtRef.current ? (Date.now() - startedAtRef.current) / 1000 : 0), []);

  const getSession = useCallback((): CallSession | null => {
    const s = sessionRef.current;
    return s ? { callId: s.callId, toolToken: s.toolToken, lang: () => langRef.current } : null;
  }, []);

  const clientTools = useMemo(() => {
    const base = makeClientTools(getSession);
    const parse = (out: unknown): Record<string, unknown> | null => {
      try {
        return JSON.parse(String(out)) as Record<string, unknown>;
      } catch {
        return null;
      }
    };
    const wrap = (name: string, after: (params: Record<string, unknown>, out: unknown) => void) => {
      const fn = base[name]!;
      base[name] = async (p) => {
        const out = await fn(p);
        try {
          after(p, out);
        } catch {
          /* the display must never break a tool */
        }
        return out;
      };
    };
    const merge = (ev: CaseEvent) => setCaseFields((c) => mergeCaseFields(c, ev));
    wrap("capture_lead", (p, out) => {
      if (parse(out)?.ok) merge({ tool: "capture_lead", args: p });
    });
    wrap("open_case", (p, out) => merge({ tool: "open_case", args: p, ok: Boolean(parse(out)?.ok) }));
    wrap("save_note", (p) => merge({ tool: "save_note", args: p }));
    wrap("switch_persona", (p, out) => {
      const r = parse(out);
      if (r?.ok && typeof r.display_name === "string") {
        personaNameRef.current = r.display_name;
        setPersonaName(r.display_name);
        if (p.gender === "female" || p.gender === "male") setActiveGender(p.gender);
        setVoiceChanged(true);
      }
    });
    return base;
  }, [getSession]);

  const runImport = useCallback(async (conversationId: string) => {
    if (importedRef.current) return;
    importedRef.current = true;
    setImporting(true);
    setImportError(null);
    try {
      const res = await postJson<ImportResult>(`/api/calls/import/${encodeURIComponent(conversationId)}`, {});
      setImportResult(res);
      setAfterCallId(res.callId);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : String(e));
    } finally {
      setImporting(false);
    }
  }, []);

  const conversation = useConversation({
    clientTools,
    onConnect: ({ conversationId }) => {
      conversationIdRef.current = conversationId;
      startedAtRef.current = Date.now();
      setStartedAt(Date.now());
      setNow(Date.now());
      setPhase("live");
      const s = sessionRef.current;
      if (s) void postJson("/api/calls/link", { callId: s.callId, toolToken: s.toolToken, conversationId }).catch((e) => setBanner({ kind: "other", text: `Link failed: ${e instanceof Error ? e.message : e}` }));
    },
    onDisconnect: (details) => {
      setEndedElapsed(elapsedS());
      setThinking(false);
      const id = conversationIdRef.current;
      if (!id) {
        setPhase("idle");
        return;
      }
      if (details.reason === "error") setBanner({ kind: "dropped", text: DROPPED });
      setPhase("ended");
      void runImport(id);
    },
    onError: (message) => setBanner({ kind: "other", text: String(message) }),
    onMessage: ({ message, role }) => {
      const r = role === "agent" ? "agent" : "caller";
      let latencyMs: number | null = null;
      if (r === "caller") {
        tracker.current.onUserFinal();
        setThinking(true);
        if (!callerSeenRef.current) {
          callerSeenRef.current = true;
          setConsent(consentFromReply(message));
        }
      } else {
        latencyMs = tracker.current.takeForAgentLine();
        setThinking(false);
      }
      setLines((prev) => [...prev, { id: lineId.current++, role: r, text: r === "agent" ? stripAudioTags(message) : message, lang: baseOf(langRef.current), latencyMs, persona: r === "agent" ? personaNameRef.current : null }]);
    },
    onModeChange: ({ mode }) => {
      if (mode === "speaking") {
        tracker.current.onAgentAudio();
        setThinking(false);
      }
    },
    onAgentToolResponse: (p) => {
      const payload = p as { tool_name?: string; full_tool_result?: string };
      if (payload.tool_name === "language_detection" && payload.full_tool_result) {
        const l = parseDetectedLanguage(payload.full_tool_result);
        if (!l) return;
        langRef.current = l;
        const b = baseOf(l);
        const last = langEventsRef.current[langEventsRef.current.length - 1];
        if (last && last.lang === b) return;
        const ev = { lang: b, atS: elapsedS() };
        langEventsRef.current = [...langEventsRef.current, ev];
        setLangEvents(langEventsRef.current);
        setVoiceChanged(false);
        // the caller line that caused the switch belongs to the new language
        setLines((prev) => {
          const i = prev.length - 1;
          return i >= 0 && prev[i]!.role === "caller" ? [...prev.slice(0, i), { ...prev[i]!, lang: b }] : prev;
        });
      }
    },
  });
  volumeRef.current = { input: () => conversation.getInputVolume(), output: () => conversation.getOutputVolume() };

  // the clock
  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // notes of the live call every 2 seconds, merged into the case card
  useEffect(() => {
    if (!token || (phase !== "live" && phase !== "connecting")) return;
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/calls/${token.callId}/notes`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { notes: NoteRow[] };
        if (stop) return;
        setCaseFields((c) => data.notes.reduce((acc, n) => mergeCaseFields(acc, { tool: "save_note", args: { key: n.key, value: n.value } }), c));
      } catch {
        /* keep the last values */
      }
    };
    void tick();
    const t = setInterval(tick, 2000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [token, phase]);

  // agent status and recent calls on the start screen
  useEffect(() => {
    if (phase !== "idle") return;
    let stop = false;
    void fetch("/api/agent/status", { cache: "no-store" })
      .then((r) => r.json() as Promise<AgentStatus>)
      .then((s) => !stop && setStatus(s))
      .catch(() => undefined);
    void fetch("/api/calls?limit=5", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ calls?: RecentCall[] }>)
      .then((d) => !stop && setRecent(d.calls ?? []))
      .catch(() => undefined);
    return () => {
      stop = true;
    };
  }, [phase]);

  // the two persona names of the chosen starting language
  useEffect(() => {
    let stop = false;
    void fetch(`/api/personas?lang=${encodeURIComponent(lang)}`, { cache: "no-store" })
      .then((r) => r.json() as Promise<{ female?: { displayName: string }; male?: { displayName: string } }>)
      .then((d) => {
        if (!stop && d.female && d.male) setNames({ female: d.female.displayName, male: d.male.displayName });
      })
      .catch(() => undefined);
    return () => {
      stop = true;
    };
  }, [lang]);

  const reset = useCallback(() => {
    setPhase("idle");
    setBanner(null);
    setToken(null);
    setPersonaName(null);
    personaNameRef.current = null;
    setLines([]);
    setLangEvents([]);
    langEventsRef.current = [];
    setCaseFields(emptyCase());
    setConsent(null);
    setVoiceChanged(false);
    setThinking(false);
    setStartedAt(null);
    startedAtRef.current = null;
    setImporting(false);
    setImportResult(null);
    setImportError(null);
    setAfterCallId(null);
    importedRef.current = false;
    conversationIdRef.current = null;
    callerSeenRef.current = false;
    sessionRef.current = null;
  }, []);

  const start = useCallback(async () => {
    reset();
    setPhase("connecting");
    try {
      // ask for the microphone first so a refusal gives a friendly message
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      const t = await startCall(lang, gender);
      sessionRef.current = { callId: t.callId, toolToken: t.toolToken };
      langRef.current = platformLanguage(lang);
      const first = { lang: baseOf(lang), atS: 0 };
      langEventsRef.current = [first];
      setLangEvents([first]);
      setToken(t);
      setAfterCallId(t.callId);
      personaNameRef.current = t.persona.displayName;
      setPersonaName(t.persona.displayName);
      setActiveGender(gender);
      const common = {
        overrides: {
          agent: { language: platformLanguage(lang) as never }, // greeting travels as the "greeting" dynamic variable
          ...(t.persona.voiceId ? { tts: { voiceId: t.persona.voiceId } } : {}),
        },
        dynamicVariables: t.dynamicVariables,
      };
      if (t.conversationToken) conversation.startSession({ ...common, conversationToken: t.conversationToken, connectionType: "webrtc" });
      else if (t.signedUrl) conversation.startSession({ ...common, signedUrl: t.signedUrl, connectionType: "websocket" });
      else throw new Error("The server returned no session token.");
    } catch (e) {
      setBanner(bannerFromError(e));
      setPhase("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, gender, reset]);

  const end = useCallback(() => conversation.endSession(), [conversation]);

  const requestVoice = useCallback(
    (g: Gender) => {
      if (g === activeGender) return;
      conversation.sendUserMessage(g === "male" ? "Can I speak to a man, please?" : "Can I speak to a woman, please?");
    },
    [conversation, activeGender],
  );

  const openCall = useCallback((id: string) => {
    setAfterCallId(id);
    setPhase("ended");
    setImporting(false);
    setImportResult(null);
    setImportError(null);
    setLines([]);
    setBanner(null);
  }, []);

  const elapsed = phase === "live" && startedAt ? Math.max(0, (now - startedAt) / 1000) : endedElapsed;
  const orb: "speaking" | "listening" | "thinking" = thinking ? "thinking" : conversation.mode === "speaking" ? "speaking" : "listening";

  return {
    lang,
    setLang,
    gender,
    setGender,
    phase,
    banner,
    setBanner,
    token,
    personaName,
    activeGender,
    names,
    lines,
    langEvents,
    caseFields,
    consent,
    voiceChanged,
    orb,
    elapsed,
    importing,
    importResult,
    importError,
    afterCallId,
    status,
    recent,
    isMuted: conversation.isMuted,
    setMuted: conversation.setMuted,
    volumeRef,
    start,
    end,
    reset,
    requestVoice,
    openCall,
  };
}

export type TestLine = ReturnType<typeof useTestLine>;
