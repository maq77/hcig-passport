"use client";

/* A row of cards that swipes on phones, with arrows and a progress line (the user,
   2026-09-24: services "with images, like in desktop" and the blog "horizontally and with
   arrows like carousel" on mobile). From `gridFrom` up it is a plain grid, no arrows.
   Native scroll snap does the moving, so swiping feels like the phone's own. */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function SnapRow({ children, label, labels, className = "", gridFrom = 1024 }: {
  children: React.ReactNode; label: string; labels: { prev: string; next: string };
  className?: string; gridFrom?: number;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [progress, setProgress] = useState(0);
  const [isRow, setIsRow] = useState(true);
  const reduce = useReducedMotion();

  const read = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const mq = matchMedia(`(min-width: ${gridFrom}px)`);
    const sync = () => { setIsRow(!mq.matches); read(); };
    sync();
    mq.addEventListener("change", sync);
    el.addEventListener("scroll", read, { passive: true });
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => { mq.removeEventListener("change", sync); el.removeEventListener("scroll", read); ro.disconnect(); };
  }, [gridFrom, read]);

  const step = (d: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const w = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0") : el.clientWidth * 0.8;
    el.scrollBy({ left: d * w, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={`snap ${className}`} style={{ ["--grid-from" as string]: `${gridFrom}px` }}>
      <ul ref={track} className="snap-track" aria-label={label}>
        {children}
      </ul>
      {isRow && (
        <div className="snap-ctrl">
          <motion.button type="button" className="snap-arrow" aria-label={labels.prev} onClick={() => step(-1)} disabled={edge.start}
            whileHover={reduce || edge.start ? undefined : { scale: 1.08 }} whileTap={reduce ? undefined : { scale: 0.9 }}>
            <ChevronLeft size={20} strokeWidth={2.4} aria-hidden="true" />
          </motion.button>
          <span className="snap-line" aria-hidden="true">
            <span style={{ transform: `scaleX(${0.18 + progress * 0.82})` }} />
          </span>
          <motion.button type="button" className="snap-arrow" aria-label={labels.next} onClick={() => step(1)} disabled={edge.end}
            whileHover={reduce || edge.end ? undefined : { scale: 1.08 }} whileTap={reduce ? undefined : { scale: 0.9 }}>
            <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
