"use client";

import { useRef } from "react";
import { useFrame, useReducedMotion } from "./shared.tsx";

const HEADER = [6, 12, 9, 14, 7];
const BIG = [8, 16, 11, 18, 9];
const DELAYS = ["0s", ".15s", ".3s", ".45s", ".6s"];

/** Five bars. With getLevel the bars follow the real level (0..1); without it they use the board's looping animation. */
export function MicMeter({ big, getLevel, active = true }: { big?: boolean; getLevel?: () => number; active?: boolean }) {
  const box = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const heights = big ? BIG : HEADER;
  useFrame(Boolean(getLevel) && active, reduced, () => {
    const level = Math.min(1, Math.max(0, getLevel ? getLevel() : 0));
    const kids = box.current?.children;
    if (!kids) return;
    for (let i = 0; i < kids.length; i++) {
      const el = kids[i] as HTMLElement;
      // transform, not height: no layout work on every frame
      const scale = Math.max(3 / heights[i]!, 0.25 + 0.75 * Math.min(1, level * 2.2 * (0.6 + (i % 3) * 0.2)));
      el.style.transform = `scaleY(${scale.toFixed(3)})`;
    }
  });
  return (
    <span ref={box} className={`mic${big ? " big" : ""}${getLevel ? " live" : ""}`} aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: big ? 3 : 2, height: big ? 18 : 14 }}>
      {heights.map((h, i) => (
        <span key={i} style={{ height: h, animationDelay: i ? DELAYS[i] : undefined }} />
      ))}
    </span>
  );
}
