"use client";

/* Ported from v6 to v3 on 2026-11-17 (v3 look in home-calm.css). Guest words (spec 015 section 4 and Amendment 1): the five real reviews from content/247clinic/reviews.json,
   one at a time, each kept in its own language with its lang attribute. Mechanics from the 21st.dev Quote
   Crossfade (docs/247clinic-design/2026-11-16-v6/refs.md): every quote sits in the same grid cell, so the
   tallest one holds the height and nothing jumps; the next quote rises 12px as the last one fades.
   Every 7s; pauses on hover, focus, off screen and a hidden tab; swipe on touch; arrow keys.
   The live region speaks only after a manual change. Reduced motion: an instant swap, no autoplay.
   No stars, ratings or counts: none exist in the data. */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type GuestReview = { name: string; lang: string; text: string; source: "google" | "facebook"; country?: string };

/* Source marks (canvas Main.dc.html, 2026-11-18). Decorative: the words beside them say the source. */
const SOURCE_LABEL = { google: "Google review", facebook: "Facebook review" } as const;
function SourceMark({ source }: { source: "google" | "facebook" }) {
  return source === "google" ? (
    <span className="gw-src g" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853"/><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z" fill="#FBBC05"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.8 9.4 6 12 6z" fill="#EA4335"/></svg>
    </span>
  ) : (
    <span className="gw-src f" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8z"/></svg>
    </span>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const DWELL = 7000;

export function GuestWords({ reviews, labels, labelledBy, label, compact = false }: {
  reviews: GuestReview[];
  labels: { prev: string; next: string };
  labelledBy?: string;
  label?: string;
  compact?: boolean;
}) {
  /* Longest first: the fullest words open the row. */
  const list = [...reviews].sort((a, b) => b.text.length - a.text.length);
  const n = list.length;
  const [i, setI] = useState(0);
  const [manual, setManual] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [seen, setSeen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduce, setReduce] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(m.matches);
    on();
    m.addEventListener("change", on);
    const vis = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", vis);
    const el = root.current;
    const io = el && "IntersectionObserver" in window ? new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 }) : null;
    if (el && io) io.observe(el); else setSeen(true);
    return () => { m.removeEventListener("change", on); document.removeEventListener("visibilitychange", vis); io?.disconnect(); };
  }, []);

  const go = useCallback((to: number, byHand: boolean) => {
    setI(((to % n) + n) % n);
    if (byHand) setManual(true);
  }, [n]);

  const playing = !reduce && !hover && !focus && seen && !hidden && n > 1;

  /* The timer lives in the progress line: its animation ends, the next quote comes. Pausing the
     line pauses the timer exactly where it stood. */
  const onLineEnd = () => { if (playing) go(i + 1, false); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1, true); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1, true); }
  };
  const onTouchStart = (e: React.TouchEvent) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) go(i + (dx < 0 ? 1 : -1), true);
  };

  return (
    <div ref={root} className={`gw ${compact ? "compact" : ""} ${reduce ? "still" : ""}`} role="region" aria-roledescription="carousel"
      aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : label}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false); }}
      onKeyDown={onKey} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="gw-stage" aria-live={manual ? "polite" : "off"}>
        {list.map((r, k) => {
          return (
            <figure key={r.name} className={`gw-q ${k === i ? "on" : ""}`} aria-hidden={k === i ? undefined : true} inert={k !== i}>
              <blockquote lang={r.lang}><p>{r.text}</p></blockquote>
              <figcaption className="gw-who">
                <SourceMark source={r.source} />
                <span className="gw-name">{r.name}</span>
                <span className="gw-country">{SOURCE_LABEL[r.source]}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <div className="gw-ctrl">
        <span className="gw-count num">{`${pad(i + 1)} / ${pad(n)}`}</span>
        <span className="gw-line" aria-hidden="true">
          {!reduce && <i key={i} className={playing ? "" : "held"} style={{ animationDuration: `${DWELL}ms` }} onAnimationEnd={onLineEnd} />}
        </span>
        <button type="button" className="gw-btn" aria-label={labels.prev} onClick={() => go(i - 1, true)}><ChevronLeft size={20} aria-hidden="true" /></button>
        <button type="button" className="gw-btn" aria-label={labels.next} onClick={() => go(i + 1, true)}><ChevronRight size={20} aria-hidden="true" /></button>
      </div>
    </div>
  );
}
