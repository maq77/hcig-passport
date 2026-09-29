"use client";

/* Adapted from the 21st.dev "Logo Marquee" by ddoemonn (accessible, physics based):
   eases to a stop on hover and focus, only runs near the screen, becomes a still
   wrapped grid under reduced motion. Restyled to DESIGN.md v3. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const RAMP = 0.19;
const MAX_COPIES = 12;
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function fold(x: number, loop: number) { const m = x % loop; return m > 0 ? m - loop : m; }
function clamp(x: number, a: number, b: number) { return x < a ? a : x > b ? b : x; }

export function Marquee({ children, label, speed = 36, direction = "left", gap = 16, bg }: {
  children: React.ReactNode; label: string; speed?: number; direction?: "left" | "right"; gap?: number; bg?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);
  const [copies, setCopies] = useState(2);
  const [held, setHeld] = useState(false);
  const [near, setNear] = useState(false);
  const [reduced, setReduced] = useState(false);
  const moving = useRef(false);
  moving.current = !held && !reduced;
  const offset = useRef(0);
  const rate = useRef(0);
  const span = useRef(0);

  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const on = () => setReduced(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  const paint = useCallback(() => {
    const t = trackRef.current;
    if (t) t.style.transform = `translate3d(${(offset.current - span.current).toFixed(2)}px,0,0)`;
  }, []);

  useIso(() => {
    const vp = viewportRef.current, g = groupRef.current;
    if (!vp || !g) return;
    const measure = () => {
      const w = g.getBoundingClientRect().width;
      const loop = w > 0 ? w + gap : 0;
      span.current = loop;
      paint();
      const room = vp.getBoundingClientRect().width;
      const next = loop <= 0 ? 2 : clamp(Math.ceil(room / loop) + 2, 2, MAX_COPIES);
      setCopies((p) => (p === next ? p : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp); ro.observe(g);
    return () => ro.disconnect();
  }, [gap, paint, reduced]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "120px" });
    io.observe(vp);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !near) return;
    let raf = 0, last = 0;
    const sign = direction === "right" ? 1 : -1;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const loop = span.current;
      if (loop <= 0) return;
      rate.current += ((moving.current ? 1 : 0) - rate.current) * (1 - Math.exp(-dt / RAMP));
      offset.current = fold(offset.current + sign * speed * rate.current * dt, loop);
      paint();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, near, speed, direction, paint]);

  const bind = {
    onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType !== "touch") setHeld(true); },
    onPointerLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false),
  };

  if (reduced) {
    return (
      <section aria-label={label} className="mq static" style={bg ? ({ ["--mq-bg" as string]: bg }) : undefined}>
        <div className="mq-viewport"><ul style={{ gap }}>{children}</ul></div>
      </section>
    );
  }

  return (
    <section aria-label={label} className="mq" style={bg ? ({ ["--mq-bg" as string]: bg }) : undefined} {...bind}>
      <div ref={viewportRef} className="mq-viewport">
        <div ref={trackRef} className="mq-track" style={{ gap }}>
          {Array.from({ length: copies }, (_, i) => (
            <ul key={i} ref={i === 0 ? groupRef : undefined} aria-hidden={i === 0 ? undefined : true} style={{ gap }}>
              {children}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
