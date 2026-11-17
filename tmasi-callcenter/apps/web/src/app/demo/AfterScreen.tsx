"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { baseOf, englishName, fmtClock, joinNames, maskPhone, median, transcriptText } from "../../lib/test-line-ui.ts";
import { Banner } from "./Banner.tsx";
import { Transcript, type TItem } from "./Transcript.tsx";
import { ARABIC_STACK, Page, hasArabic } from "./shared.tsx";
import type { TestLine } from "./useTestLine.ts";

interface JudgeResult {
  summary_en: string;
  summary_caller_lang: string;
  caller_main_lang: string;
  judge: {
    ai_disclosed: boolean;
    consent_asked: boolean;
    recording_consent: boolean | null;
    fact_ok: boolean;
    policy_ok: boolean;
    lang_ok: boolean;
    memory_ok: boolean;
    pass: boolean;
  };
}
interface Detail {
  call: { id: string; durationS: number | null; csat: number | null; langsSeen: string[]; langDetected: string | null; recordingPath: string | null; startedAt: string | null; createdAt: string };
  turns: { idx: number; role: "agent" | "caller" | "tool"; text: string | null; lang: string | null; latencyMs: number | null }[];
  notes: { key: string; value: string }[];
  contact: { name: string; phoneE164: string | null; email: string | null; country: string | null } | null;
  case: { status: string; interest: string | null; summaryEn: string | null } | null;
  gaps: { id: string; question: string }[];
  judge: { status: "ok"; result: JudgeResult } | { status: "skipped"; reason: string } | { status: "error"; error: string } | null;
  personaStart: { label: string; displayName: string } | null;
  personaEnd: { label: string; displayName: string } | null;
  hasRecording: boolean;
}

const SUMMARY_KEY = "Add the Anthropic key to get a written summary after each call.";
const QUALITY_KEY = "Add the Anthropic key to get the quality check.";
const NO_RECORDING = "No recording kept: the caller did not agree to recording.";
const HS = [10, 22, 30, 18, 34, 26, 14, 28, 36, 20, 12, 24, 32, 16, 28];
const PHONE_HS = [10, 20, 26, 14, 22, 12, 24, 16, 28, 10, 20, 14];

const cardStyle = (extra?: React.CSSProperties): React.CSSProperties => ({ background: "#FFFFFF", borderRadius: 24, border: "1px solid #E4EAED", padding: 22, display: "flex", flexDirection: "column", gap: 12, ...extra });
const muted: React.CSSProperties = { margin: 0, fontSize: 14, lineHeight: 1.6, color: "#5B6474" };

function Player({ id, durationS, phone }: { id: string; durationS: number | null; phone: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(durationS ?? 0);
  const hs = phone ? PHONE_HS : Array.from({ length: 60 }, (_, i) => HS[i % HS.length]!);
  const progress = dur > 0 ? cur / dur : 0;
  const seek = (p: number) => {
    const a = ref.current;
    if (!a || !dur) return;
    a.currentTime = Math.min(Math.max(p, 0), 1) * dur;
    setCur(a.currentTime);
  };
  const key = (e: KeyboardEvent) => {
    const a = ref.current;
    if (!a) return;
    if (e.key === "ArrowRight") a.currentTime = Math.min(dur, a.currentTime + 5);
    else if (e.key === "ArrowLeft") a.currentTime = Math.max(0, a.currentTime - 5);
    else return;
    e.preventDefault();
  };
  return (
    <section className="up" aria-label="Recording" style={{ background: "#FFFFFF", border: "1px solid #E4EAED", borderRadius: phone ? 20 : 24, padding: phone ? "12px 14px" : "20px 24px", display: "flex", alignItems: "center", gap: phone ? 12 : 16, animationDelay: ".1s" }}>
      <audio
        ref={ref}
        src={`/api/calls/${id}/audio`}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDur(e.currentTarget.duration)}
      />
      <button type="button" aria-label={playing ? "Pause recording" : "Play recording"} onClick={() => (playing ? ref.current?.pause() : void ref.current?.play())} style={{ flex: "none", width: phone ? 44 : 52, height: phone ? 44 : 52, borderRadius: "50%", border: 0, background: "#009A9C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={phone ? 16 : 20} height={phone ? 16 : 20} viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
          {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
        </svg>
      </button>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Recording position"
        aria-valuemin={0}
        aria-valuemax={Math.round(dur)}
        aria-valuenow={Math.round(cur)}
        aria-valuetext={`${fmtClock(cur)} of ${fmtClock(dur)}`}
        onKeyDown={key}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          seek((e.clientX - r.left) / r.width);
        }}
        style={{ flex: 1, display: "flex", alignItems: "center", gap: phone ? 2 : 3, height: phone ? 30 : 40, overflow: "hidden", cursor: "pointer" }}
      >
        {hs.map((h, i) => (
          <span key={i} style={{ flex: 1, minWidth: 2, height: h, borderRadius: 2, background: i / hs.length < progress ? "#009A9C" : "#D0D8DC" }} />
        ))}
      </div>
      <span style={{ flex: "none", fontSize: phone ? 12 : 13, color: "#5B6474" }}>{`${fmtClock(cur)} / ${fmtClock(dur)}`}</span>
    </section>
  );
}

export function AfterScreen({ tl, phone }: { tl: TestLine; phone: boolean }) {
  const [d, setD] = useState<Detail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const id = tl.afterCallId;
  const waiting = tl.importing || (tl.phase === "ended" && !tl.importResult && !tl.importError && tl.token !== null && !d);

  useEffect(() => {
    if (!id || tl.importing) return;
    // a call that was just ended waits for its import; an opened old call loads now
    if (tl.token && id === tl.token.callId && !tl.importResult && !tl.importError) return;
    let stop = false;
    setLoadError(null);
    fetch(`/api/calls/${id}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Could not load this call (${r.status}).`);
        return (await r.json()) as Detail;
      })
      .then((x) => !stop && setD(x))
      .catch((e) => !stop && setLoadError(e instanceof Error ? e.message : String(e)));
    return () => {
      stop = true;
    };
  }, [id, tl.importing, tl.importResult, tl.importError, tl.token]);

  const m = useMemo(() => {
    const spoken = (d?.turns ?? []).filter((t) => (t.role === "agent" || t.role === "caller") && t.text);
    const persona = d?.personaEnd?.displayName ?? tl.personaName ?? "The assistant";
    const langCodes = d?.call.langsSeen?.length ? d.call.langsSeen : d?.call.langDetected ? [d.call.langDetected] : tl.langEvents.map((e) => e.lang);
    const langs = Array.from(new Set(langCodes.map(baseOf)));
    const lat = spoken.filter((t) => t.role === "agent" && t.latencyMs != null).map((t) => (t.latencyMs as number) / 1000);
    const items: TItem[] = spoken.map((t) => ({
      id: t.idx,
      role: t.role as "agent" | "caller",
      text: t.text as string,
      lang: t.lang ?? "en",
      meta: t.role === "agent" ? `${persona} · ${baseOf(t.lang).toUpperCase()}${t.latencyMs != null ? ` · ${(t.latencyMs / 1000).toFixed(1)} s` : ""}` : `Caller · ${baseOf(t.lang).toUpperCase()}`,
    }));
    return { spoken, persona, langs, med: median(lat), items };
  }, [d, tl.personaName, tl.langEvents]);

  const judge = d?.judge?.status === "ok" ? d.judge.result : null;
  const duration = d?.call.durationS ?? (tl.afterCallId === tl.token?.callId ? Math.round(tl.elapsed) : null);
  const started = d?.call.startedAt ?? d?.call.createdAt;
  const isToday = !started || new Date(started).toDateString() === new Date().toDateString();
  const dayText = isToday ? "today" : new Date(started as string).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const langText = joinNames(m.langs.map(englishName));
  const sub = [m.persona, langText, dayText].filter(Boolean).join(" · ");
  const questions = d?.gaps ?? [];
  const dates = [...(d?.notes ?? [])].reverse().find((n) => n.key === "dates")?.value ?? null;
  const rating = d?.call.csat != null ? `${d.call.csat} of 5` : "Not given";

  const download = () => {
    const text = transcriptText(m.items.map((i) => ({ who: i.role === "agent" ? m.persona : "Caller", text: i.text })));
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `tmasi-call-${(id ?? "call").slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // sections
  const summary = (
    <section className="up" aria-label="Summary" style={phone ? { background: "#FFFFFF", border: "1px solid #E4EAED", borderRadius: 20, padding: 16 } : cardStyle({ padding: 24 })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: phone ? 6 : 0 }}>
        <h2 style={{ margin: 0, fontSize: phone ? 14 : 16, fontWeight: 600 }}>Summary</h2>
        {judge ? <span style={{ fontSize: 12, color: "#5B6474" }}>Written by Claude after the call</span> : null}
      </div>
      {judge ? (
        <>
          <p dir="auto" style={{ margin: 0, fontSize: phone ? 13 : 15, lineHeight: phone ? 1.6 : 1.65 }}>{judge.summary_en}</p>
          {baseOf(judge.caller_main_lang) !== "en" && judge.summary_caller_lang && judge.summary_caller_lang !== judge.summary_en ? (
            <p dir="auto" style={{ margin: phone ? "8px 0 0" : 0, fontFamily: hasArabic(judge.summary_caller_lang) ? ARABIC_STACK : undefined, fontSize: phone ? 13 : 15, lineHeight: 1.8, color: "#344054" }}>{judge.summary_caller_lang}</p>
          ) : null}
        </>
      ) : (
        <p style={muted}>{!d ? "Writing the summary..." : d.judge?.status === "error" ? "The written summary failed for this call." : d.judge && d.judge.status === "skipped" && !/anthropic/i.test(d.judge.reason) ? "No summary for this call." : SUMMARY_KEY}</p>
      )}
    </section>
  );

  const recording = d?.hasRecording && id ? <Player id={id} durationS={d.call.durationS} phone={phone} /> : (
    <section className="up" aria-label="Recording" style={phone ? { background: "#FFFFFF", border: "1px solid #E4EAED", borderRadius: 20, padding: "14px 16px", animationDelay: ".1s" } : cardStyle({ padding: "20px 24px", animationDelay: ".1s" })}>
      <p style={{ ...muted, fontSize: phone ? 13 : 14 }}>{d ? NO_RECORDING : "Looking for the recording..."}</p>
    </section>
  );

  const transcript = (
    <section className="up" aria-label="Transcript" style={cardStyle({ animationDelay: ".2s" })}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Transcript</h2>
      <Transcript items={m.items} variant="after" persona={m.persona} phone={phone} />
    </section>
  );

  const rows: { ok: boolean; label: string }[] = [];
  if (judge) {
    const j = judge.judge;
    const changed = d?.personaStart && d.personaEnd && d.personaStart.label !== d.personaEnd.label;
    rows.push({ ok: j.ai_disclosed, label: "Said it is an AI in the first turn" });
    rows.push(!j.consent_asked ? { ok: false, label: "Did not ask to record" } : { ok: true, label: j.recording_consent === true ? "Asked to record, caller agreed" : j.recording_consent === false ? "Asked to record, caller declined" : "Asked to record" });
    rows.push({ ok: j.fact_ok, label: "Every fact found in TMASI information" });
    rows.push({ ok: j.lang_ok, label: "Replied in the caller's language every time" });
    rows.push({ ok: true, label: changed ? "Voice changed on request" : m.langs.length > 1 ? "Same voice after the language switch" : "Same voice the whole call" });
    rows.push({ ok: j.memory_ok, label: "Never asked the same thing twice" });
    if (!j.policy_ok) rows.push({ ok: false, label: "No medical advice, invented prices or rankings" });
  }
  const quality = (
    <section className="up" aria-label="Quality" style={cardStyle({ animationDelay: ".1s" })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Quality check</h2>
        {judge ? <span style={{ padding: "6px 12px", borderRadius: 999, background: judge.judge.pass ? "#E3F4F4" : "#FDECEA", color: judge.judge.pass ? "#00585B" : "#8A1C12", fontSize: 13, fontWeight: 600 }}>{judge.judge.pass ? "Passed" : "Needs review"}</span> : null}
      </div>
      {judge ? (
        rows.map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: r.ok ? undefined : "#8A1C12" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={r.ok ? "#00797B" : "#B42318"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none" }}>
              {r.ok ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
            </svg>
            <span>{r.label}</span>
          </div>
        ))
      ) : (
        <p style={muted}>{d ? QUALITY_KEY : "Checking the call..."}</p>
      )}
    </section>
  );

  const phoneMasked = maskPhone(d?.contact?.phoneE164);
  const caseCard = d ? (
    <section className="up" aria-label="Case" style={{ background: "#0F205C", color: "#FFFFFF", borderRadius: phone ? 20 : 24, padding: phone ? 16 : 22, display: "flex", flexDirection: "column", gap: phone ? 6 : 10, animationDelay: ".2s", fontSize: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: phone ? 14 : 16, fontWeight: 600 }}>{d.case ? "Case created" : "Case"}</h2>
        {d.case ? <span style={{ padding: phone ? "3px 9px" : "4px 10px", borderRadius: 999, background: "rgba(255,255,255,.14)", fontSize: phone ? 11 : 12, textTransform: "capitalize" }}>{d.case.status}</span> : null}
      </div>
      {d.case ? (
        <div style={{ display: "flex", flexDirection: "column", gap: phone ? 6 : 7 }}>
          {([
            ["Name", d.contact?.name],
            ["Country", phone ? null : d.contact?.country],
            ["Need", d.case.interest],
            ["Dates", phone ? null : dates],
            [phoneMasked ? "Phone" : "Email", phoneMasked || d.contact?.email],
          ] as [string, string | null | undefined][])
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ color: "#C9D3EA" }}>{k}</span>
                <span dir="auto" style={{ textAlign: "right" }}>{v}</span>
              </div>
            ))}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>No case: the caller did not leave contact details.</p>
      )}
    </section>
  ) : null;

  const numbers: [string, string][] = [
    [phone ? "Reply" : "Reply speed", m.med != null ? `${m.med.toFixed(1)} s` : "n/a"],
    ["Languages", String(Math.max(m.langs.length, 1))],
    ["Turns", String(m.spoken.length)],
    [phone ? "Rating" : "Caller rating", rating],
  ];
  const numbersCard = phone ? (
    <section className="up" aria-label="Numbers" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, animationDelay: ".3s" }}>
      {numbers.filter(([k]) => k !== "Turns").map(([k, v]) => (
        <div key={k} style={{ background: "#FFFFFF", border: "1px solid #E4EAED", borderRadius: 16, padding: 10 }}>
          <div style={{ fontSize: 11, color: "#5B6474" }}>{k}</div>
          <div style={{ fontWeight: 600 }}>{v}</div>
        </div>
      ))}
    </section>
  ) : (
    <section className="up" aria-label="Numbers" style={cardStyle({ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14, animationDelay: ".3s" })}>
      {numbers.map(([k, v]) => (
        <div key={k}>
          <div style={{ fontSize: 12, color: "#5B6474" }}>{k}</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{v}</div>
        </div>
      ))}
    </section>
  );

  const questionsCard = questions.length ? (
    <section className="up" aria-label="Questions to answer" style={phone ? { background: "#FFF6E5", borderRadius: 18, padding: "12px 14px", fontSize: 13, color: "#6B4100", animationDelay: ".4s" } : { background: "#FFF6E5", borderRadius: 24, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 8, animationDelay: ".4s" }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#6B4100" }}>{phone ? `${questions.length} ${questions.length === 1 ? "question" : "questions"} to answer` : `Questions ${m.persona} could not answer`}</h2>
      {questions.map((q) => (
        <div key={q.id} dir="auto" style={{ fontSize: 14, color: "#6B4100" }}>{`"${q.question}"`}</div>
      ))}
      {phone ? null : <div style={{ fontSize: 12, color: "#7A4B00" }}>{`Approve an answer once and ${m.persona} uses it on the next call.`}</div>}
    </section>
  ) : null;

  const notices = (
    <>
      {tl.banner ? <Banner text={tl.banner.text} /> : null}
      {waiting ? <Banner tone="info" text="Saving the call. This takes a few seconds." /> : null}
      {tl.importError ? <Banner text={`The call could not be imported: ${tl.importError}`} /> : null}
      {loadError ? <Banner text={loadError} /> : null}
    </>
  );

  const newCall = (
    <button type="button" onClick={tl.reset} style={phone ? { display: "flex", alignItems: "center", justifyContent: "center", height: 54, width: "100%", border: 0, borderRadius: 999, background: "#009A9C", color: "#FFFFFF", fontWeight: 600, fontSize: 15, fontFamily: "inherit" } : { height: 44, padding: "0 20px", borderRadius: 12, border: 0, background: "#009A9C", color: "#FFFFFF", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>
      Start a new call
    </button>
  );
  const dl = (
    <button type="button" onClick={download} disabled={!m.items.length} style={{ height: 44, padding: "0 18px", borderRadius: 12, border: "1px solid #DCE3E6", background: "#FFFFFF", fontFamily: "inherit", fontSize: 14, color: "#344054" }}>
      Download transcript
    </button>
  );
  const title = `Call ended · ${duration != null ? fmtClock(duration) : "00:00"}`;

  if (phone) {
    return (
      <Page className="phone after" style={{ minHeight: "100dvh" }}>
        <header style={{ padding: "16px 18px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
            <div style={{ fontSize: 11, color: "#5B6474" }}>{sub}</div>
          </div>
          {judge ? <span style={{ padding: "5px 11px", borderRadius: 999, background: judge.judge.pass ? "#E3F4F4" : "#FDECEA", color: judge.judge.pass ? "#00585B" : "#8A1C12", fontSize: 12, fontWeight: 600 }}>{judge.judge.pass ? "Passed" : "Needs review"}</span> : null}
        </header>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, padding: "6px 14px 14px" }}>
          {notices}
          {summary}
          {recording}
          {caseCard}
          {numbersCard}
          {questionsCard}
        </div>
        <div style={{ position: "sticky", bottom: 0, padding: "12px 14px 24px", background: "#F4F7F8" }}>{newCall}</div>
      </Page>
    );
  }

  return (
    <Page className="after" style={{ minHeight: 1000 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 10, background: "#0F205C" }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 17 }}>{title}</div>
            <div style={{ fontSize: 12, color: "#5B6474" }}>{sub}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {dl}
          {newCall}
        </div>
      </header>
      <main style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 20, padding: "0 32px 32px", maxWidth: 1440, width: "100%", boxSizing: "border-box", margin: "0 auto", alignContent: "flex-start" }}>
        {tl.banner || waiting || tl.importError || loadError ? <div style={{ flex: "1 1 100%", display: "flex", flexDirection: "column", gap: 10 }}>{notices}</div> : null}
        <div style={{ flex: "999 1 620px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {summary}
          {recording}
          {transcript}
        </div>
        <aside style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {quality}
          {caseCard}
          {numbersCard}
          {questionsCard}
        </aside>
      </main>
    </Page>
  );
}
