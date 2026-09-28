"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";

// The guest's journey, drawn as icons only (no words): call, assessment, coordination, travel, home
// (design 5, approved 2026-09-28). The teal line fills as the banner scrolls through the view, and each
// step lights up when the line reaches it. Visitors who ask for less motion see it complete.

const STEPS: ReactNode[] = [
  <path key="call" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
  <g key="assess"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></g>,
  <g key="coord"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></g>,
  <path key="fly" d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  <g key="home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></g>,
];

function Step({ icon, at, progress }: { icon: ReactNode; at: number; progress: MotionValue<number> }) {
  // The lit layer fades in over a short stretch once the line reaches this step.
  const lit = useTransform(progress, [Math.max(0, at - 0.04), at], [0, 1]);
  const svg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icon}
    </svg>
  );
  return (
    <span className="jl-step">
      <span className="jl-dot jl-dot--base">{svg}</span>
      <motion.span className="jl-dot jl-dot--lit" style={{ opacity: lit }}>{svg}</motion.span>
    </span>
  );
}

export default function JourneyLine() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "start 38%"] });
  const progress = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0, 1]);

  return (
    <div ref={ref} className="jl" aria-hidden="true">
      <span className="jl-track" />
      <motion.span className="jl-fill" style={{ scaleX: progress }} />
      <div className="jl-steps">
        {STEPS.map((icon, i) => (
          <Step key={i} icon={icon} at={i / (STEPS.length - 1)} progress={progress} />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .jl { --jl-dot: 64px; position: relative; width: min(860px, 100%); margin: clamp(40px, 5vw, 56px) auto 0; }
        .jl-track, .jl-fill {
          position: absolute; top: calc(var(--jl-dot) / 2 - 1px); height: 2px;
          left: calc(var(--jl-dot) / 2); right: calc(var(--jl-dot) / 2);
        }
        .jl-track { background: rgba(255,255,255,0.18); }
        .jl-fill { background: var(--tmasi-teal); transform-origin: left center; }
        .jl-steps { position: relative; display: flex; justify-content: space-between; }
        .jl-step { position: relative; width: var(--jl-dot); height: var(--jl-dot); flex-shrink: 0; }
        .jl-dot {
          position: absolute; inset: 0; border-radius: 50%; box-sizing: border-box;
          display: flex; align-items: center; justify-content: center; background: #0d1a45;
        }
        .jl-dot svg { width: 42%; height: 42%; }
        .jl-dot--base { border: 1px solid rgba(255,255,255,0.28); color: rgba(255,255,255,0.55); }
        .jl-dot--lit { border: 2px solid var(--tmasi-teal); color: #7fe0e1; box-shadow: 0 0 0 6px rgba(0,154,156,0.14); }
        @media (max-width: 640px) {
          .jl { --jl-dot: 46px; }
          .jl-dot--lit { box-shadow: 0 0 0 4px rgba(0,154,156,0.14); }
        }
      `}} />
    </div>
  );
}
