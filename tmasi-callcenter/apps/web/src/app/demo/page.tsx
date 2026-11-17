"use client";

// Plain private test line. Not a designed screen: system font, no branding.
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ApiError,
  LANGUAGE_OPTIONS,
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
  type TranscriptLine,
} from "../../lib/test-line.ts";

interface NoteRow {
  id: string;
  key: string;
  value: string;
  lang: string | null;
  at: string;
}

interface ImportResult {
  ok: boolean;
  callId: string;
  turns: number;
  durationS: number | null;
  recordingConsent: boolean;
  recordingPath: string | null;
  postCall: string;
  error?: string;
}

const box: React.CSSProperties = { border: "1px solid #bbb", padding: 12, marginTop: 12, borderRadius: 4 };

function Demo() {
  const [lang, setLang] = useState("en");
  const [gender, setGender] = useState<Gender>("female");
  const [token, setToken] = useState<TokenResponse | null>(null);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);
  const [personaName, setPersonaName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const sessionRef = useRef<{ callId: string; toolToken: string } | null>(null);
  const langRef = useRef("en");
  const conversationIdRef = useRef<string | null>(null);
  const importedRef = useRef(false);
  const lineId = useRef(0);
  const tracker = useRef(new LatencyTracker());

  const getSession = useCallback((): CallSession | null => {
    const s = sessionRef.current;
    return s ? { callId: s.callId, toolToken: s.toolToken, lang: () => langRef.current } : null;
  }, []);
  const clientTools = useMemo(() => {
    const base = makeClientTools(getSession);
    // switch_persona changes the displayed name too
    const sp = base.switch_persona!;
    base.switch_persona = async (p) => {
      const out = await sp(p);
      try {
        const parsed = JSON.parse(String(out)) as { ok?: boolean; display_name?: string };
        if (parsed.ok && parsed.display_name) setPersonaName(parsed.display_name);
      } catch {
        /* ignore */
      }
      return out;
    };
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
      const s = sessionRef.current;
      if (s) void postJson("/api/calls/link", { callId: s.callId, toolToken: s.toolToken, conversationId }).catch((e) => setError(`Link failed: ${e instanceof Error ? e.message : e}`));
    },
    onDisconnect: () => {
      const id = conversationIdRef.current;
      if (id) void runImport(id);
    },
    onError: (message) => setError(String(message)),
    onMessage: ({ message, role }) => {
      const r = role === "agent" ? "agent" : "caller";
      let latencyMs: number | null = null;
      if (r === "caller") tracker.current.onUserFinal();
      else latencyMs = tracker.current.takeForAgentLine();
      setLines((prev) => [...prev, { id: lineId.current++, role: r, text: message, lang: langRef.current, latencyMs }]);
    },
    onModeChange: ({ mode }) => {
      if (mode === "speaking") tracker.current.onAgentAudio();
    },
    onAgentToolResponse: (p) => {
      const payload = p as { tool_name?: string; full_tool_result?: string };
      if (payload.tool_name === "language_detection" && payload.full_tool_result) {
        const l = parseDetectedLanguage(payload.full_tool_result);
        if (l) {
          langRef.current = l;
          setDetected(l);
        }
      }
    },
  });

  const live = conversation.status === "connected" || conversation.status === "connecting";

  // poll the notes of the live call every 2 seconds
  useEffect(() => {
    if (!token) return;
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/calls/${token.callId}/notes`, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { notes: NoteRow[] };
          if (!stop) setNotes(data.notes);
        }
      } catch {
        /* keep the last notes */
      }
    };
    void tick();
    const t = setInterval(tick, 2000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [token]);

  async function start() {
    setError(null);
    setImportResult(null);
    setImportError(null);
    setLines([]);
    setNotes([]);
    setDetected(null);
    importedRef.current = false;
    conversationIdRef.current = null;
    setBusy(true);
    try {
      // ask for the microphone first so a refusal gives a friendly message
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      const t = await startCall(lang, gender);
      sessionRef.current = { callId: t.callId, toolToken: t.toolToken };
      langRef.current = platformLanguage(lang);
      setToken(t);
      setPersonaName(t.persona.displayName);
      const common = {
        overrides: {
          agent: { firstMessage: t.firstMessage, language: platformLanguage(lang) as never },
          ...(t.persona.voiceId ? { tts: { voiceId: t.persona.voiceId } } : {}),
        },
        dynamicVariables: t.dynamicVariables,
      };
      if (t.conversationToken) conversation.startSession({ ...common, conversationToken: t.conversationToken, connectionType: "webrtc" });
      else if (t.signedUrl) conversation.startSession({ ...common, signedUrl: t.signedUrl, connectionType: "websocket" });
      else throw new Error("The server returned no session token.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : friendlyStartError(e));
    } finally {
      setBusy(false);
    }
  }

  function end() {
    conversation.endSession();
  }

  const state = conversation.status === "connected" ? (conversation.isSpeaking ? "agent speaking" : "listening") : conversation.status;

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 820, margin: "0 auto", padding: 16, lineHeight: 1.4 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>TMASI test line (private)</h1>

      <section style={box} aria-label="Controls">
        <label>
          Starting language{" "}
          <select value={lang} onChange={(e) => setLang(e.target.value)} disabled={live || busy}>
            {LANGUAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset style={{ display: "inline", border: 0, marginLeft: 16, padding: 0 }}>
          <legend style={{ display: "none" }}>Voice</legend>
          <label>
            <input type="radio" name="gender" checked={gender === "female"} onChange={() => setGender("female")} disabled={live || busy} /> Woman
          </label>{" "}
          <label>
            <input type="radio" name="gender" checked={gender === "male"} onChange={() => setGender("male")} disabled={live || busy} /> Man
          </label>
        </fieldset>
        <span style={{ display: "inline-flex", gap: 8, marginLeft: 16, marginTop: 8, flexWrap: "wrap" }}>
          <button onClick={start} disabled={live || busy} style={btn("#0b7a3b", live || busy)}>
            {busy ? "Starting..." : "Start call"}
          </button>
          <button onClick={end} disabled={!live} style={btn("#b42318", !live)}>
            End call
          </button>
        </span>
        {error && (
          <p role="alert" style={{ color: "#a00", marginTop: 8 }}>
            {error}
          </p>
        )}
      </section>

      <section style={box} aria-label="Status">
        <div>
          Persona: <b>{personaName ?? "none yet"}</b>
          {token ? ` (${token.persona.label})` : ""}
        </div>
        <div>
          Connection: <b>{conversation.status}</b>. Now: <b>{state}</b>
          {detected ? <> . Detected language: <b>{detected}</b></> : null}
        </div>
      </section>

      <section style={box} aria-label="Transcript">
        <h2 style={{ fontSize: 16, margin: 0 }}>Transcript</h2>
        {lines.length === 0 ? <p style={{ color: "#666" }}>Nothing yet.</p> : null}
        <ol style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
          {lines.map((l) => (
            <li key={l.id} style={{ margin: "6px 0" }}>
              <b>{l.role === "agent" ? "Agent" : "Caller"}</b>
              {l.lang ? <span style={{ color: "#666" }}> [{l.lang}]</span> : null}
              {l.latencyMs != null ? <span style={{ color: "#666" }}> ({l.latencyMs} ms)</span> : null}
              <div dir="auto">{l.text}</div>
            </li>
          ))}
        </ol>
      </section>

      <section style={box} aria-label="Notes so far">
        <h2 style={{ fontSize: 16, margin: 0 }}>Notes so far</h2>
        {notes.length === 0 ? <p style={{ color: "#666" }}>No notes yet.</p> : null}
        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
          {notes.map((n) => (
            <li key={n.id} dir="auto">
              <b>{n.key}</b>: {n.value}
            </li>
          ))}
        </ul>
      </section>

      {(importing || importResult || importError) && (
        <section style={box} aria-label="Import">
          <h2 style={{ fontSize: 16, margin: 0 }}>After the call</h2>
          {importing ? <p>Importing the call...</p> : null}
          {importError ? (
            <p role="alert" style={{ color: "#a00" }}>
              Import failed: {importError}
            </p>
          ) : null}
          {importResult ? (
            <p>
              Imported {importResult.turns} turns, {importResult.durationS ?? "?"} s, recording {importResult.recordingPath ? "saved" : "not saved"}, post call {importResult.postCall}.{" "}
              <a href={`/api/calls/${importResult.callId}`} target="_blank" rel="noreferrer">
                Open call JSON
              </a>
            </p>
          ) : null}
        </section>
      )}
    </main>
  );
}

// Plain, clearly clickable buttons for the test tool (not a designed screen).
const btn = (color: string, disabled: boolean): CSSProperties => ({
  padding: "10px 18px",
  minHeight: 44,
  borderRadius: 8,
  border: `1px solid ${color}`,
  background: disabled ? "#f2f2f2" : color,
  color: disabled ? "#888" : "#fff",
  borderColor: disabled ? "#ccc" : color,
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
});

export default function DemoPage() {
  return (
    <ConversationProvider>
      <Demo />
    </ConversationProvider>
  );
}
