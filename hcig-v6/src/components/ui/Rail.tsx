"use client";
// Phone first: on phones a card grid becomes a horizontal slider (owner, 2026-10-26: "horizontal with sliders and
// arrow on phone", then "2 rows each slider and auto slide"). From tablet up the same items sit in their grid.
// rows=2 lays the cards out in two rows that move one column at a time; auto slides on its own, pauses while the
// reader touches it, while it is off screen and under reduced motion. nav="story" shows story bars, "count" 01 / 07.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { Icon } from "./Icon";
import { Stagger } from "./Motion";
import { UI } from "@/content/home.mjs";

type Props = { children: ReactNode; className?: string; label: string; gap?: number; rows?: 1 | 2; auto?: number; nav?: "count" | "story" | "side" };

const PHONE = "(max-width: 760px)";

export function Rail({ children, className = "", label, gap = 0.07, rows = 1, auto = 0, nav = "count" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [cols, setCols] = useState<number[]>([]);
  const [hold, setHold] = useState(false);
  const [seen, setSeen] = useState(false);
  const reduce = useReducedMotion();

  // the slider's stops: one per column (two cards share a column when rows = 2)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const lefts = [...new Set(([...el.children] as HTMLElement[]).map((k) => k.offsetLeft))].sort((a, b) => a - b);
      setCols(lefts.map((x) => x - lefts[0]));
    };
    const onScroll = () => {
      const x = el.scrollLeft;
      setCols((c) => {
        let i = 0;
        c.forEach((v, k) => { if (v <= x + 8) i = k; });
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) i = c.length - 1;
        setAt(i);
        return c;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); el.removeEventListener("scroll", onScroll); };
  }, []);

  const go = (i: number) => {
    const el = ref.current;
    if (!el || !cols.length) return;
    const n = (i + cols.length) % cols.length;
    if (nav === "side") {
      // story rail: the chosen card comes to the centre (cards snap to the centre)
      const k = el.children[n] as HTMLElement | undefined;
      if (k) el.scrollTo({ left: k.offsetLeft - el.offsetLeft - (el.clientWidth - k.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    } else el.scrollTo({ left: cols[n], behavior: reduce ? "auto" : "smooth" });
    setAt(n);
  };

  // auto slide on phones only
  useEffect(() => {
    if (!auto || hold || !seen || reduce || cols.length < 2) return;
    if (!matchMedia(PHONE).matches) return;
    const t = setTimeout(() => go(at + 1), auto);
    return () => clearTimeout(t);
  });

  // a touch pauses the auto slide for a while, then it carries on
  useEffect(() => {
    if (!hold) return;
    const t = setTimeout(() => setHold(false), 9000);
    return () => clearTimeout(t);
  }, [hold]);

  const n = cols.length || 1;
  if (nav === "side") {
    // his spec 2026-10-27 (MedPark "Patient stories"): arrows on the sides of the videos and a small "Swipe for more"
    return (
      <div className="rail-wrap rail-side-wrap">
        <div className="rail-side">
          <Stagger className={`rail ${className}`} gap={gap} ref={ref} role="group" aria-label={label}>
            {children}
          </Stagger>
          <button type="button" className="rail-arrow prev" onClick={() => go(at - 1)} aria-label={UI.prev.text}><Icon name="arrow" size={20} className="flip-x" /></button>
          <button type="button" className="rail-arrow next" onClick={() => go(at + 1)} aria-label={UI.next.text}><Icon name="arrow" size={20} /></button>
        </div>
        <p className="rail-note"><Icon name="hand" size={16} />{UI.swipe.text}</p>
      </div>
    );
  }
  return (
    <div className="rail-wrap" onPointerDown={() => setHold(true)} onFocus={() => setHold(true)}>
      <Stagger className={`rail${rows === 2 ? " r2" : ""} ${className}`} gap={gap} ref={ref} role="group" aria-label={label}>
        {children}
      </Stagger>
      <div className={`rail-nav nav-${nav}`}>
        {nav === "story" ? (
          <span className="rail-story" aria-hidden="true" style={{ ["--auto" as string]: `${auto || 4000}ms` } as CSSProperties}>
            {Array.from({ length: n }, (_, i) => (
              <i key={i} className={i < at ? "done" : i === at ? (auto && !hold && seen && !reduce ? "on run" : "on") : ""} />
            ))}
          </span>
        ) : (
          <>
            <span className="rail-count" aria-hidden="true"><b>{String(at + 1).padStart(2, "0")}</b> / {String(n).padStart(2, "0")}</span>
            <span className="rail-bar" aria-hidden="true"><span style={{ width: `${((at + 1) / n) * 100}%` }} /></span>
          </>
        )}
        <button type="button" className="rail-btn prev" onClick={() => { setHold(true); go(at - 1); }} aria-label={UI.prev.text}>
          <Icon name="arrow" size={20} className="flip-x" />
        </button>
        <button type="button" className="rail-btn next" onClick={() => { setHold(true); go(at + 1); }} aria-label={UI.next.text}>
          <Icon name="arrow" size={20} />
        </button>
      </div>
    </div>
  );
}
