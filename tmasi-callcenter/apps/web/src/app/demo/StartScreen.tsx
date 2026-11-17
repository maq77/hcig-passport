"use client";

import { LANGUAGE_OPTIONS } from "../../lib/test-line.ts";
import { recentMeta, recentResult, recentTitle } from "../../lib/test-line-ui.ts";
import { Banner } from "./Banner.tsx";
import { MicMeter } from "./MicMeter.tsx";
import { Brand, Page, card, h2s } from "./shared.tsx";
import { useMicCheck } from "./useMicCheck.ts";
import type { TestLine } from "./useTestLine.ts";

export const TIPS = [
  "Ask what TMASI does and where the offices are.",
  "Switch language during the call, for example from English to Arabic.",
  'Say "Can I speak to a man?" to change the voice.',
  "Leave your name and phone, then listen for the read-back.",
  "Ask a price: it should offer a coordinator, never guess.",
];
const NOTE = "Only invited testers for now. The assistant answers from TMASI's own information and says it is an AI at the start of every call.";

function MicLine({ state, getLevel, big }: { state: string; getLevel: () => number; big?: boolean }) {
  if (state === "ready") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13, color: "#344054" }}>
        <MicMeter big getLevel={getLevel} />
        Microphone ready
      </span>
    );
  }
  if (state === "prompt") return <span style={{ fontSize: 13, color: "#344054" }}>Microphone will be asked when you start</span>;
  return big ? <span style={{ fontSize: 13, color: "#344054" }}>&nbsp;</span> : null;
}

function Pill({ tl, phone }: { tl: TestLine; phone: boolean }) {
  const s = tl.status;
  const text = !s ? "Checking the agent" : s.ready ? (s.version ? `Agent ready · v${s.version}` : "Agent ready") : "Agent not set up";
  return <span style={{ padding: phone ? "5px 10px" : "8px 14px", borderRadius: 999, background: "#FFFFFF", border: "1px solid #DCE3E6", fontSize: phone ? 12 : 13, color: "#344054" }}>{text}</span>;
}

function VoiceButtons({ tl, phone }: { tl: TestLine; phone: boolean }) {
  const items: [("female" | "male"), string][] = [
    ["female", `Woman · ${tl.names.female}`],
    ["male", `Man · ${tl.names.male}`],
  ];
  return (
    <div style={phone ? { width: "100%", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 } : { display: "flex", gap: 10 }}>
      {items.map(([g, label]) => {
        const on = tl.gender === g;
        return (
          <button
            key={g}
            type="button"
            aria-pressed={on}
            onClick={() => tl.setGender(g)}
            style={{
              ...(phone ? { height: 50, fontSize: 14 } : { width: 150, height: 52, fontSize: 15 }),
              borderRadius: 14,
              border: on ? "2px solid #009A9C" : "1px solid #DCE3E6",
              background: on ? "#E3F4F4" : "#FFFFFF",
              fontFamily: "inherit",
              fontWeight: on ? 600 : 400,
              color: on ? "#00585B" : "#344054",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function LangSelect({ tl, phone }: { tl: TestLine; phone: boolean }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: phone ? 12 : 13, color: "#5B6474", width: phone ? "100%" : undefined }}>
      Starting language
      <select
        value={tl.lang}
        onChange={(e) => tl.setLang(e.target.value)}
        style={{ height: phone ? 50 : 52, minWidth: phone ? undefined : 220, borderRadius: 14, border: "1px solid #DCE3E6", padding: "0 14px", fontFamily: "inherit", fontSize: 15, color: "#0B1220", background: "#FFFFFF" }}
      >
        {LANGUAGE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Tips() {
  return (
    <div style={card({ display: "flex", flexDirection: "column", gap: 12 })}>
      <h2 style={h2s}>Things to try</h2>
      {TIPS.map((t, i) => (
        <div key={t} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.45 }}>
          <span aria-hidden="true" style={{ flex: "none", width: 22, height: 22, borderRadius: "50%", background: "#E3F4F4", color: "#00797B", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {i + 1}
          </span>
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}

function Recent({ tl }: { tl: TestLine }) {
  return (
    <div style={card({ display: "flex", flexDirection: "column", gap: 10 })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={h2s}>Recent calls</h2>
        <span style={{ fontSize: 12, color: "#5B6474" }}>On this laptop</span>
      </div>
      {tl.recent.length === 0 ? <span style={{ fontSize: 13, color: "#5B6474" }}>No calls yet. Your first call will show here.</span> : null}
      {tl.recent.map((r) => {
        const res = recentResult(r);
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => tl.openCall(r.id)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, background: "#F4F7F8", color: "#0B1220", border: 0, textAlign: "left", fontFamily: "inherit", width: "100%" }}
          >
            <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{recentTitle(r)}</span>
              <span style={{ fontSize: 12, color: "#5B6474" }}>{recentMeta(r)}</span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: res.color, textAlign: "right" }}>{res.text}</span>
          </button>
        );
      })}
    </div>
  );
}

const Note = () => <div style={{ padding: "14px 16px", borderRadius: 16, background: "#FFF6E5", color: "#7A4B00", fontSize: 13, lineHeight: 1.5 }}>{NOTE}</div>;

export function StartScreen({ tl, phone }: { tl: TestLine; phone: boolean }) {
  const mic = useMicCheck(tl.phase === "idle");
  const connecting = tl.phase === "connecting";
  const disabled = connecting || tl.status?.ready === false;
  const banner = tl.banner ?? (mic.state === "denied" || mic.state === "error" ? { kind: "mic" as const, text: mic.message ?? "" } : null);
  const agentBanner = tl.status?.ready === false && !tl.banner ? { kind: "agent" as const, text: "The agent is not set up yet. Run npm run agent:push in tmasi-callcenter, then reload this page." } : null;
  const shown = banner ?? agentBanner;
  const startLabel = connecting ? "Connecting..." : "Start call";
  const micIcon = (
    <svg width={phone ? 44 : 56} height={phone ? 44 : 56} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
      <path d="M12 18v4" />
    </svg>
  );

  if (phone) {
    return (
      <Page className="start phone" style={{ minHeight: "100dvh" }}>
        <header style={{ padding: "16px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <Brand phone title="TMASI Test Line" sub="Private, this laptop" />
        </header>
        {shown ? <Banner text={shown.text} style={{ margin: "14px 16px 0" }} /> : null}
        <section aria-label="Start a call" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: "16px 20px 0" }}>
          <div style={{ position: "relative", width: 140, height: 140 }}>
            <span className="halo" aria-hidden="true" style={{ position: "absolute", inset: -16, borderRadius: "50%", background: "#009A9C" }} />
            <div className="core" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#009A9C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {micIcon}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 600 }}>Talk to the TMASI assistant</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#5B6474" }}>Switch language any time during the call.</p>
          </div>
          <LangSelect tl={tl} phone />
          <div role="group" aria-label="Voice" style={{ width: "100%" }}>
            <VoiceButtons tl={tl} phone />
          </div>
        </section>
        <div style={{ padding: "18px 20px 26px" }}>
          <button type="button" onClick={() => void tl.start()} disabled={disabled} style={{ width: "100%", height: 58, borderRadius: 999, border: 0, background: "#009A9C", color: "#FFFFFF", fontFamily: "inherit", fontWeight: 600, fontSize: 16 }}>
            {startLabel}
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page className="start" style={{ minHeight: 900 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", flexWrap: "wrap", gap: 12 }}>
        <Brand title="TMASI Test Line" sub="Private, runs on this laptop" />
        <Pill tl={tl} phone={false} />
      </header>
      {shown ? <Banner text={shown.text} style={{ margin: "0 auto 16px", width: "calc(100% - 64px)", maxWidth: 1376, boxSizing: "border-box" }} /> : null}
      <main style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 24, padding: "0 32px 32px", maxWidth: 1440, width: "100%", boxSizing: "border-box", margin: "0 auto", alignItems: "stretch" }}>
        <section aria-label="Start a call" style={{ flex: "999 1 640px", minWidth: 0, background: "#FFFFFF", borderRadius: 28, border: "1px solid #E4EAED", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", gap: 28 }}>
          <div style={{ position: "relative", width: 200, height: 200 }}>
            <span className="halo" aria-hidden="true" style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "#009A9C" }} />
            <div className="core" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#009A9C", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 60px rgba(0,154,156,.25)" }}>
              {micIcon}
            </div>
          </div>
          <div className="up" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 600, letterSpacing: "-.3px" }}>Talk to the TMASI assistant</h1>
            <p style={{ margin: 0, fontSize: 15, color: "#5B6474" }}>Pick the language the call starts in and a voice. Switch language any time during the call.</p>
          </div>
          <div className="up" style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", animationDelay: ".15s" }}>
            <LangSelect tl={tl} phone={false} />
            <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              <legend style={{ fontSize: 13, color: "#5B6474", padding: 0, marginBottom: 6 }}>Voice</legend>
              <VoiceButtons tl={tl} phone={false} />
            </fieldset>
          </div>
          <div className="up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, animationDelay: ".3s" }}>
            <button type="button" onClick={() => void tl.start()} disabled={disabled} style={{ height: 60, padding: "0 44px", borderRadius: 999, border: 0, background: "#009A9C", color: "#FFFFFF", fontFamily: "inherit", fontWeight: 600, fontSize: 17, boxShadow: "0 14px 30px rgba(0,154,156,.3)" }}>
              {startLabel}
            </button>
            <MicLine state={mic.state} getLevel={mic.getLevel} big />
          </div>
        </section>
        <aside aria-label="Help and recent calls" style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <Tips />
          <Recent tl={tl} />
          <Note />
        </aside>
      </main>
    </Page>
  );
}

