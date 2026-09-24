"use client";

/* The hero's image carousel (the user, 2026-09-24: "add image carousel ... great ux buttons
   and animations ... auto scrolls and great transitions in and out ... perfect and smooth").
   - A new slide slides over from the side it comes from, its picture moving against the
     frame (a parallax reveal) and zooming gently to rest; the old one drifts back beneath.
     Transform only, so it stays smooth everywhere.
   - The progress bars are the timer: the active bar fills, and when it ends the next slide
     comes. Pausing freezes the bar, so nothing jumps on resume.
   - Pauses on hover, keyboard focus, a held touch, off screen and in a hidden tab.
     No autoplay and no motion under reduced motion; arrows, bars and swipe still work. */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSlide = { src: string; w: number; h: number; caption: string; pos?: string; slot?: string };

const SLIDE_MS = 6500;
const EASE = [0.76, 0, 0.24, 1] as const;

export function HeroCarousel({ slides, label, labels }: {
  slides: HeroSlide[]; label: string; labels: { prev: string; next: string; show: string };
}) {
  const n = slides.length;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [hold, setHold] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback((to: number, d: number) => {
    setDir(d);
    setI(((to % n) + n) % n);
  }, [n]);
  const next = useCallback(() => go(i + 1, 1), [go, i]);
  const prev = useCallback(() => go(i - 1, -1), [go, i]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting && !document.hidden), { threshold: 0.25 });
    io.observe(el);
    const vis = () => setOnScreen(!document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, []);

  /* Warm the next picture so its wipe never waits on the network. */
  useEffect(() => {
    if (n < 2) return;
    const img = new Image();
    img.src = slides[(i + 1) % n].src;
  }, [i, n, slides]);

  const auto = !reduce && n > 1;
  const running = auto && !hold && onScreen;

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    if (e.pointerType !== "mouse") setHold(true);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (e.pointerType !== "mouse") setHold(false);
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.3) (dx < 0 ? next : prev)();
  };

  const s = slides[i];
  return (
    <div
      ref={root}
      className="hc"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setHold(false); start.current = null; }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { setHold(false); start.current = null; }}
      onFocus={() => setHold(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHold(false); }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      }}
    >
      <div className="hc-stage" aria-live={running ? "off" : "polite"}>
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={i}
            className="hc-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${n}: ${s.caption}`}
            custom={dir}
            variants={{
              enter: (d: number) => (reduce ? { opacity: 0 } : { x: d > 0 ? "100%" : "-100%", zIndex: 2 }),
              center: { x: "0%", opacity: 1, zIndex: 2 },
              exit: (d: number) => (reduce ? { opacity: 0, zIndex: 1 } : { x: d > 0 ? "-28%" : "28%", zIndex: 1 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduce ? { duration: 0.25 } : { duration: 1.1, ease: EASE }}
          >
            {/* The picture moves against its frame, so the slide reads as a reveal. */}
            <motion.img
              src={s.src}
              data-slot={s.slot}
              alt=""
              width={s.w}
              height={s.h}
              draggable={false}
              fetchPriority={i === 0 ? "high" : "auto"}
              decoding="async"
              style={{ objectPosition: s.pos }}
              custom={dir}
              variants={{
                enter: (d: number) => (reduce ? {} : { x: d > 0 ? "-55%" : "55%", scale: 1.14 }),
                center: { x: "0%", scale: 1 },
              }}
              transition={reduce ? { duration: 0 } : {
                x: { duration: 1.1, ease: EASE },
                scale: { duration: SLIDE_MS / 1000 + 1.2, ease: [0.22, 1, 0.36, 1] },
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {/* The white wash that keeps the headline readable on desktop, under the controls. */}
      <div className="hero-veil" aria-hidden="true" />

      {/* The caption crossfades: the old one rises out while the new one rises in, so it
          always names the slide on screen. */}
      <div className="hc-cap">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={i}
            className="hc-caption"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hc-count">{String(i + 1).padStart(2, "0")}</span>
            {s.caption}
          </motion.p>
        </AnimatePresence>
      </div>

      {n > 1 && (
        <div className="hc-controls">
          <motion.button type="button" className="hc-arrow" aria-label={labels.prev} onClick={prev}
            whileHover={reduce ? undefined : { scale: 1.08 }} whileTap={reduce ? undefined : { scale: 0.9 }}>
            <ChevronLeft size={20} strokeWidth={2.4} aria-hidden="true" />
          </motion.button>
          <ol className="hc-bars">
            {slides.map((sl, k) => (
              <li key={sl.src}>
                <button
                  type="button"
                  className={`hc-bar ${k < i ? "done" : ""} ${k === i ? "on" : ""}`}
                  aria-label={`${labels.show} ${k + 1}: ${sl.caption}`}
                  aria-current={k === i ? "true" : undefined}
                  onClick={() => go(k, k >= i ? 1 : -1)}
                >
                  <span className="hc-track">
                    <span
                      key={`${k}-${i}`}
                      className={`hc-fill ${k === i && auto ? "run" : ""}`}
                      style={k === i && auto
                        ? { animationDuration: `${SLIDE_MS}ms`, animationPlayState: running ? "running" : "paused" }
                        : undefined}
                      onAnimationEnd={k === i && auto ? next : undefined}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <motion.button type="button" className="hc-arrow" aria-label={labels.next} onClick={next}
            whileHover={reduce ? undefined : { scale: 1.08 }} whileTap={reduce ? undefined : { scale: 0.9 }}>
            <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
