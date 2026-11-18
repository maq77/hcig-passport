"use client";

// Loading states, copied from the approved canvas board L1 "orb and steps" (his pick 2026-11-18).
// Smooth, never faked: each wait shows at least MIN_SHOW_MS so nothing flashes, never longer than the real work.
import { useEffect, useState, type CSSProperties } from "react";

export const MIN_SHOW_MS = 1500;

/** True until `active` has been false AND at least `min` ms have passed since it first became true. */
export function useHeld(active: boolean, min = MIN_SHOW_MS): boolean {
  const [since, setSince] = useState<number | null>(active ? Date.now() : null);
  const [held, setHeld] = useState(active);
  useEffect(() => {
    if (active) {
      setSince((s) => s ?? Date.now());
      setHeld(true);
      return;
    }
    if (since === null) {
      setHeld(false);
      return;
    }
    const left = min - (Date.now() - since);
    if (left <= 0) {
      setHeld(false);
      setSince(null);
      return;
    }
    const t = setTimeout(() => {
      setHeld(false);
      setSince(null);
    }, left);
    return () => clearTimeout(t);
  }, [active, since, min]);
  return held;
}

const card: CSSProperties = { background: "#FFFFFF", border: "1px solid #E4EAED", borderRadius: 28 };

/** Wait 1: connecting to the persona. Full screen, centred, as the board's left panel. */
export function ConnectingScreen({ persona, phone }: { persona: string; phone: boolean }) {
  const size = phone ? 150 : 170;
  return (
    <div className="loading" style={{ minHeight: "100dvh", background: "#F4F7F8", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" }}>
      <section aria-label="Connecting" role="status" aria-live="polite" style={{ ...card, width: "100%", maxWidth: 520, padding: phone ? 28 : 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ position: "relative", width: size, height: size }}>
          <span className="ld-ripple" aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid #009A9C" }} />
          <svg className="ld-spin" viewBox="0 0 170 170" width={size} height={size} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
            <circle cx="85" cy="85" r="80" fill="none" stroke="#BFE3E3" strokeWidth="3" />
            <circle cx="85" cy="85" r="80" fill="none" stroke="#009A9C" strokeWidth="3" strokeLinecap="round" strokeDasharray="120 400" />
          </svg>
          <div className="ld-breathe" style={{ position: "absolute", inset: phone ? 20 : 22, borderRadius: "50%", background: "#009A9C", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontWeight: 600, fontSize: phone ? 20 : 22 }}>
            {persona}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            Connecting you to {persona}
            <span className="ld-dots" aria-hidden="true">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#5B6474", marginTop: 4 }}>A soft chime plays when {persona} is on the line</div>
        </div>
      </section>
    </div>
  );
}

type StepState = "done" | "active" | "todo";

function Step({ state, label }: { state: StepState; label: string }) {
  if (state === "done") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
        <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: "50%", background: "#009A9C", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        {label}
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="ld-active" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#00666A" }}>
        <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #009A9C", boxSizing: "border-box" }} />
        {label}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#98A2B3" }}>
      <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #D0D8DC", boxSizing: "border-box" }} />
      {label}
    </div>
  );
}

/**
 * Wait 2: saving the call, then the results arriving.
 * stage "saving" = the import is running; "loading" = import done, details loading.
 */
export function SavingCard({ stage, phone }: { stage: "saving" | "loading"; phone: boolean }) {
  return (
    <section aria-label="Saving the call" role="status" aria-live="polite" style={{ ...card, borderRadius: phone ? 22 : 28, padding: phone ? "20px 18px" : "28px 32px", display: "flex", alignItems: "center", gap: phone ? 18 : 28, flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: phone ? 72 : 96, height: phone ? 72 : 96, flex: "none" }}>
        <svg className="ld-spin" viewBox="0 0 96 96" width={phone ? 72 : 96} height={phone ? 72 : 96} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
          <circle cx="48" cy="48" r="44" fill="none" stroke="#E3F4F4" strokeWidth="4" />
          <circle cx="48" cy="48" r="44" fill="none" stroke="#009A9C" strokeWidth="4" strokeLinecap="round" strokeDasharray="70 300" />
        </svg>
        <div className="ld-breathe" style={{ position: "absolute", inset: phone ? 14 : 18, borderRadius: "50%", background: "#E3F4F4", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={phone ? 20 : 26} height={phone ? 20 : 26} viewBox="0 0 24 24" fill="none" stroke="#00797B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: phone ? 18 : 20, fontWeight: 600 }}>Saving your call</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Step state="done" label="Call ended safely" />
          <Step state={stage === "saving" ? "active" : "done"} label="Reading the transcript" />
          <Step state={stage === "loading" ? "active" : "todo"} label="Preparing your results" />
        </div>
      </div>
    </section>
  );
}

/** Two shimmering placeholder cards, as on the board, while the results are not there yet. */
export function SkeletonCards({ phone }: { phone: boolean }) {
  const box: CSSProperties = { ...card, borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 12 };
  return (
    <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: phone ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))", gap: 18 }}>
      <div style={box}>
        <div className="ld-shimmer" style={{ height: 16, width: "40%", borderRadius: 8 }} />
        <div className="ld-shimmer" style={{ height: 12, width: "92%", borderRadius: 6 }} />
        <div className="ld-shimmer" style={{ height: 12, width: "80%", borderRadius: 6 }} />
        <div className="ld-shimmer" style={{ height: 12, width: "60%", borderRadius: 6 }} />
      </div>
      <div style={box}>
        <div className="ld-shimmer" style={{ height: 16, width: "35%", borderRadius: 8 }} />
        <div className="ld-shimmer" style={{ height: 44, width: "100%", borderRadius: 12 }} />
        <div className="ld-shimmer" style={{ height: 12, width: "70%", borderRadius: 6 }} />
      </div>
    </div>
  );
}
