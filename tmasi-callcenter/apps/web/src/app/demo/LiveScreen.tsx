"use client";

import { useState, type KeyboardEvent } from "react";
import { chunkWords, englishName, fmtClock, median, nativeName, saidItIsAi } from "../../lib/test-line-ui.ts";
import { Banner } from "./Banner.tsx";
import { CaseCard } from "./CaseCard.tsx";
import { ChecksCard, type LiveCheck } from "./ChecksCard.tsx";
import { LanguageTimeline } from "./LanguageTimeline.tsx";
import { MicMeter } from "./MicMeter.tsx";
import { Orb } from "./Orb.tsx";
import { ReplySpeed } from "./ReplySpeed.tsx";
import { Transcript, type TItem } from "./Transcript.tsx";
import { ARABIC_STACK, Brand, MicIcon, Page, card, hasArabic } from "./shared.tsx";
import type { TestLine } from "./useTestLine.ts";

function useLiveModel(tl: TestLine) {
  const persona = tl.personaName ?? "Emma";
  const latencies = tl.lines.filter((l) => l.role === "agent" && l.latencyMs != null).map((l) => l.latencyMs as number);
  const med = median(latencies.map((m) => m / 1000));
  const currentLang = tl.langEvents[tl.langEvents.length - 1]?.lang ?? tl.lang;
  const firstAgent = tl.lines.find((l) => l.role === "agent");
  const aiDone = Boolean(firstAgent && tl.token && saidItIsAi(firstAgent.text, tl.token.firstMessage));
  const switched = tl.langEvents.length > 1;
  const checks: LiveCheck[] = [
    { label: "Said it is an AI", state: aiDone ? "First turn" : "Waiting", done: aiDone },
    { label: "Asked to record", state: tl.consent === "allowed" ? "Allowed" : tl.consent === "declined" ? "Declined" : "Waiting", done: Boolean(firstAgent) },
    { label: "Same voice after switch", state: switched ? (tl.voiceChanged ? "Changed on request" : persona) : "No switch yet", done: switched },
    { label: "No repeated questions", state: "Checked after the call", done: false },
    { label: "Read-back before goodbye", state: "At the end", done: false },
  ];
  const items: TItem[] = tl.lines.map((l) => ({
    id: l.id,
    role: l.role,
    text: l.text,
    lang: l.lang,
    meta: l.role === "agent" ? `${l.persona ?? persona}${l.latencyMs != null ? ` · ${(l.latencyMs / 1000).toFixed(1)} s` : ""}` : "Caller",
  }));
  const lastAgent = [...tl.lines].reverse().find((l) => l.role === "agent");
  const lastCaller = [...tl.lines].reverse().find((l) => l.role === "caller");
  const status = tl.orb === "speaking" ? `${persona} is speaking` : tl.orb === "thinking" ? "Thinking" : "Listening";
  const consentText = tl.consent === "allowed" ? "Recording allowed" : tl.consent === "declined" ? "Recording declined" : "Asking to record";
  const langNames = Array.from(new Set(tl.langEvents.map((e) => englishName(e.lang)))).join(", ");
  return { persona, latencies, med, currentLang, checks, items, lastAgent, lastCaller, status, consentText, langNames };
}

function AgentCaption({ line, phone }: { line: { id: number; text: string } | undefined; phone?: boolean }) {
  const chunks = line ? chunkWords(line.text) : [];
  return (
    <p
      key={line?.id ?? "none"}
      dir="auto"
      aria-live="polite"
      className="above-orb"
      style={{ margin: phone ? "4px 0 0" : 0, textAlign: "center", fontFamily: line && hasArabic(line.text) ? ARABIC_STACK : undefined, fontSize: phone ? 19 : 27, lineHeight: phone ? 1.6 : 1.55, fontWeight: 500, minHeight: phone ? 30 : 42 }}
    >
      {chunks.map((c, i) => (
        <span key={i} className="word" style={i ? { animationDelay: `${i * 0.25}s` } : undefined}>
          {c}{" "}
        </span>
      ))}
    </p>
  );
}

function Controls({ tl, phone }: { tl: TestLine; phone: boolean }) {
  const f = tl.names.female;
  const m = tl.names.male;
  const other = tl.activeGender === "female" ? "male" : "female";
  const muteBtn = (
    <button
      type="button"
      aria-label={tl.isMuted ? "Unmute microphone" : "Mute microphone"}
      aria-pressed={tl.isMuted}
      onClick={() => tl.setMuted(!tl.isMuted)}
      style={{ width: phone ? 48 : 52, height: phone ? 48 : 52, borderRadius: "50%", border: `1px solid ${tl.isMuted ? "#F4B5AE" : "#DCE3E6"}`, background: tl.isMuted ? "#FDECEA" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <MicIcon size={phone ? 18 : 20} color={tl.isMuted ? "#B42318" : "#344054"} slash={tl.isMuted} />
    </button>
  );
  const endBtn = (
    <button type="button" onClick={tl.end} style={{ height: phone ? 52 : 52, padding: phone ? "0 24px" : "0 26px", borderRadius: 999, border: 0, background: "#B42318", color: "#FFFFFF", fontFamily: "inherit", fontWeight: 600, fontSize: phone ? 14 : 15 }}>
      End call
    </button>
  );
  if (phone) {
    const otherLabel = other === "male" ? `Man · ${m}` : `Woman · ${f}`;
    return (
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <button type="button" onClick={() => tl.requestVoice(other)} style={{ height: 48, padding: "0 14px", borderRadius: 12, border: "1px solid #DCE3E6", background: "#FFFFFF", fontFamily: "inherit", fontSize: 13, color: "#344054" }}>
          {otherLabel}
        </button>
        {muteBtn}
        {endBtn}
      </div>
    );
  }
  const seg: [("female" | "male"), string][] = [
    ["female", `Woman · ${f}`],
    ["male", `Man · ${m}`],
  ];
  return (
    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", width: "100%" }}>
      <div role="group" aria-label="Voice" style={{ display: "flex", padding: 4, borderRadius: 14, background: "#EEF2F4" }}>
        {seg.map(([g, label]) => {
          const on = tl.activeGender === g;
          return (
            <button key={g} type="button" aria-pressed={on} onClick={() => tl.requestVoice(g)} style={{ height: 44, padding: "0 18px", border: 0, borderRadius: 10, background: on ? "#FFFFFF" : "transparent", fontFamily: "inherit", fontWeight: on ? 600 : 400, fontSize: 14, color: on ? "#0B1220" : "#5B6474", boxShadow: on ? "0 1px 3px rgba(16,24,40,.12)" : undefined }}>
              {label}
            </button>
          );
        })}
      </div>
      {muteBtn}
      {endBtn}
    </div>
  );
}

function Tabs({ tab, setTab }: { tab: string; setTab: (t: "case" | "transcript" | "checks") => void }) {
  const tabs = [
    ["case", "Case"],
    ["transcript", "Transcript"],
    ["checks", "Checks"],
  ] as const;
  const onKey = (e: KeyboardEvent) => {
    const i = tabs.findIndex(([k]) => k === tab);
    if (e.key === "ArrowRight") setTab(tabs[(i + 1) % 3]![0]);
    else if (e.key === "ArrowLeft") setTab(tabs[(i + 2) % 3]![0]);
    else return;
    e.preventDefault();
    requestAnimationFrame(() => document.getElementById(`tab-${tabs[(i + (e.key === "ArrowRight" ? 1 : 2)) % 3]![0]}`)?.focus());
  };
  return (
    <div role="tablist" aria-label="Live panels" onKeyDown={onKey} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", padding: 3, borderRadius: 12, background: "#EEF2F4" }}>
      {tabs.map(([k, label]) => {
        const on = tab === k;
        return (
          <button key={k} id={`tab-${k}`} type="button" role="tab" aria-selected={on} aria-controls="live-panel" tabIndex={on ? 0 : -1} onClick={() => setTab(k)} style={{ height: 36, border: 0, borderRadius: 9, background: on ? "#FFFFFF" : "transparent", fontFamily: "inherit", fontSize: 12, fontWeight: on ? 600 : 400, color: on ? "#0B1220" : "#5B6474" }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function LiveScreen({ tl, phone }: { tl: TestLine; phone: boolean }) {
  const m = useLiveModel(tl);
  const [tab, setTab] = useState<"case" | "transcript" | "checks">("case");
  const getVol = () => (tl.orb === "speaking" ? tl.volumeRef.current.output() : tl.volumeRef.current.input());
  const orbSub = phone ? tl.orb : "TMASI AI assistant";
  const clock = fmtClock(tl.elapsed);
  const connecting = tl.phase === "connecting";

  if (phone) {
    return (
      <Page className="phone live" style={{ height: "100dvh", overflow: "hidden" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 6px" }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>TMASI Test Line</span>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ padding: "5px 10px", borderRadius: 999, background: "#E3F4F4", color: "#00666A", fontSize: 12, fontWeight: 600 }}>{clock}</span>
            <span style={{ padding: "5px 10px", borderRadius: 999, background: "#FFFFFF", border: "1px solid #DCE3E6", fontSize: 12, color: "#344054" }}>{m.med != null ? `${m.med.toFixed(1)} s` : "no reply yet"}</span>
          </div>
        </header>
        {tl.banner ? <Banner text={tl.banner.text} style={{ margin: "6px 16px 0" }} /> : null}
        <section aria-label="Call" aria-live="off" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 18px 0" }}>
          <Orb state={tl.orb} name={m.persona} sub={connecting ? "connecting" : orbSub} phone getVolume={getVol} />
          <span className="sr-status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }} role="status">
            {m.status}
          </span>
          <LanguageTimeline events={tl.langEvents} voiceChanged={tl.voiceChanged} phone />
          <AgentCaption line={m.lastAgent} phone />
        </section>
        <div style={{ flex: 1, margin: "14px 12px 0", background: "#FFFFFF", borderRadius: "22px 22px 0 0", border: "1px solid #E4EAED", borderBottom: 0, padding: "10px 16px 16px", display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
          <div aria-hidden="true" style={{ width: 40, height: 4, borderRadius: 4, background: "#D0D8DC", margin: "0 auto 4px" }} />
          <Tabs tab={tab} setTab={setTab} />
          <div id="live-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {tab === "case" ? <CaseCard fields={tl.caseFields} phone /> : null}
            {tab === "transcript" ? <Transcript items={m.items} variant="live" persona={m.persona} phone /> : null}
            {tab === "checks" ? (
              <>
                <ChecksCard checks={m.checks} bare />
                <ReplySpeed latenciesMs={m.latencies} />
              </>
            ) : null}
          </div>
          <Controls tl={tl} phone />
        </div>
      </Page>
    );
  }

  const callerRtl = m.lastCaller ? hasArabic(m.lastCaller.text) : false;
  return (
    <Page className="live" style={{ minHeight: 1180 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 32px", flexWrap: "wrap" }}>
        <Brand icon title="TMASI Test Line" sub="Private, runs on this laptop" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "#E3F4F4", color: "#00666A", fontSize: 13, fontWeight: 600 }}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: "#009A9C" }} />
            {connecting ? "Connecting" : `Live · ${clock}`}
          </span>
          <span style={{ padding: "8px 14px", borderRadius: 999, background: "#FFFFFF", border: "1px solid #DCE3E6", fontSize: 13, color: "#344054" }}>{m.consentText}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "#FFFFFF", border: "1px solid #DCE3E6", fontSize: 13, color: "#344054" }}>
            Your mic
            <MicMeter getLevel={() => (tl.isMuted ? 0 : tl.volumeRef.current.input())} />
          </span>
        </div>
      </header>
      {tl.banner ? <Banner text={tl.banner.text} style={{ margin: "0 auto 16px", width: "calc(100% - 64px)", maxWidth: 1376, boxSizing: "border-box" }} /> : null}
      <main style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 24, padding: "0 32px 32px", maxWidth: 1440, width: "100%", boxSizing: "border-box", margin: "0 auto" }}>
        <section aria-label="Call" style={{ flex: "999 1 640px", minWidth: 0, background: "#FFFFFF", borderRadius: 28, border: "1px solid #E4EAED", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 32px 26px", gap: 22 }}>
          <div role="status" aria-live="polite" className="above-orb" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontSize: 14, color: "#5B6474" }}>{m.status}</span>
            <span style={{ padding: "6px 12px", borderRadius: 999, background: "#0F205C", color: "#FFFFFF", fontSize: 13, fontWeight: 600, fontFamily: hasArabic(nativeName(m.currentLang)) ? ARABIC_STACK : undefined }}>{nativeName(m.currentLang)}</span>
          </div>
          <Orb state={tl.orb} name={m.persona} sub={orbSub} getVolume={getVol} />
          <div className="above-orb" style={{ width: "100%", maxWidth: 760, display: "flex", flexDirection: "column", gap: 12, textAlign: "center" }}>
            <p dir="auto" style={{ margin: 0, fontFamily: callerRtl ? ARABIC_STACK : undefined, fontSize: 15, color: "#5B6474", minHeight: 24 }}>
              {m.lastCaller?.text ?? ""}
            </p>
            <AgentCaption line={m.lastAgent} />
          </div>
          <LanguageTimeline events={tl.langEvents} voiceChanged={tl.voiceChanged} />
          <Controls tl={tl} phone={false} />
        </section>
        <aside aria-label="Live data" style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <ReplySpeed latenciesMs={m.latencies} />
          <CaseCard fields={tl.caseFields} />
          <ChecksCard checks={m.checks} />
        </aside>
        <section aria-label="Full transcript" style={card({ flex: "1 1 100%", borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 12 })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Full transcript</h2>
            <span style={{ fontSize: 12, color: "#5B6474" }}>{`${tl.lines.length} ${tl.lines.length === 1 ? "turn" : "turns"} · ${m.langNames}`}</span>
          </div>
          <Transcript items={m.items} variant="live" persona={m.persona} />
        </section>
      </main>
    </Page>
  );
}
