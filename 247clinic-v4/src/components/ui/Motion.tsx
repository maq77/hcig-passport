"use client";

/* Small client behaviours. Every one of them only enhances: with JavaScript off,
   every word and link is already in the page. */
import { useEffect, useRef, useState } from "react";
import { track, type EventName } from "@/lib/track";

/* Reveal on scroll. Marks <html> ready so the inline safety timer in layout.tsx
   does not strip the `js` class (the v2 lesson: never hide content on a promise). */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("rv-ready");
    const els = Array.from(document.querySelectorAll<HTMLElement>(".rv:not(.in), [data-inview]"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    /* Catch-up: a jump (anchor link, fast fling) can pass blocks without them ever
       intersecting. Anything already above the fold line is revealed at once. */
    let raf = 0;
    const catchUp = () => {
      raf = 0;
      const line = window.innerHeight * 0.92;
      for (const el of els) {
        if (!el.classList.contains("in") && el.getBoundingClientRect().top < line) { el.classList.add("in"); io.unobserve(el); }
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(catchUp); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return null;
}

/* One listener for every tracked link: data-ev + data-placement. */
export function Tracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-ev]");
      if (!a) return;
      track(a.dataset.ev as EventName, { placement: a.dataset.placement });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}

/* Count up once when seen. The final value is already in the HTML. */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 4);
        setShown(Math.round(value * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      setShown(0);
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <b ref={ref}>{shown}</b>;
}

/* A muted preview film that plays only while on screen, never under reduced motion. */
export function InViewVideo({ src, className, label }: { src: string; className?: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!v.src) v.src = src;
        v.play().catch(() => {});
      } else v.pause();
    }, { threshold: 0.45 });
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return <video ref={ref} className={className} muted loop playsInline preload="none" aria-label={label} />;
}
