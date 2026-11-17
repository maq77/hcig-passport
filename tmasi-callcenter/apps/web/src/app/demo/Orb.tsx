"use client";

import { useRef } from "react";
import { useFrame, useReducedMotion } from "./shared.tsx";

/** The calm orb. The wrapper scale follows the live volume through a CSS variable (skipped with reduced motion). */
export function Orb({ state, name, sub, phone, getVolume }: { state: "speaking" | "listening" | "thinking"; name: string; sub: string; phone?: boolean; getVolume: () => number }) {
  const box = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useFrame(!reduced, reduced, () => {
    const v = state === "thinking" ? 0 : Math.min(1, Math.max(0, getVolume()));
    box.current?.style.setProperty("--vol", v.toFixed(3));
  });
  const size = phone ? 150 : 220;
  const inset = phone ? 18 : 26;
  return (
    <div
      ref={box}
      className={state}
      style={{ position: "relative", width: size, height: size, margin: phone ? "18px 0 10px" : "20px 0", transform: "scale(calc(1 + var(--vol, 0) * 0.12))", transition: "transform .06s linear" }}
    >
      <span className="ring r1" aria-hidden="true" />
      <span className="ring r2" aria-hidden="true" />
      <span className="ring r3" aria-hidden="true" />
      <div className="core" style={{ position: "absolute", inset, borderRadius: "50%", background: "#009A9C", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: phone ? undefined : "0 24px 60px rgba(0,154,156,.28)" }}>
        <div style={{ textAlign: "center", color: "#FFFFFF" }}>
          <div style={{ fontSize: phone ? 20 : 28, fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: phone ? 10 : 12, opacity: 0.85 }}>{sub}</div>
        </div>
      </div>
    </div>
  );
}
