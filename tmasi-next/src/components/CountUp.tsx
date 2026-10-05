"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  locale?: string;
}

// The number is in the page as written (crawlers and visitors without JavaScript read the real figure). Once the
// script runs it starts from 0 and counts up when the number comes into view. Each frame writes the text directly,
// without re-rendering React (2026-10-05: the old version re-rendered every frame, three counters at once).
export default function CountUp({ end, suffix = "", duration = 1.4, locale }: CountUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const started = useRef(false);

  // Before it is seen, show 0 so the count has somewhere to start (it is below the first screen).
  useEffect(() => {
    if (!reduce && !started.current && num.current) num.current.textContent = (0).toLocaleString(locale);
  }, [reduce, locale]);

  useEffect(() => {
    const el = num.current;
    if (!isInView || !el) return;
    started.current = true;
    if (reduce) { el.textContent = end.toLocaleString(locale); return; }
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    let start = 0;
    let raf = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / (duration * 1000));
      el.textContent = Math.floor(end * easeOutQuart(p)).toLocaleString(locale);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, end, duration, locale, reduce]);

  return (
    <div ref={ref} className="metric-number">
      <span ref={num}>{end.toLocaleString(locale)}</span>
      {suffix}
    </div>
  );
}
