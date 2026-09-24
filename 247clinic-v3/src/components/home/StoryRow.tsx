"use client";

/* Patient stories carousel (the user, 2026-09-23: "better representation of videos,
   make them auto scroll, and the arrows at the video section itself"). Cards advance on
   their own every 4.5 s and loop; hovering, touching or focusing the row pauses it;
   reduced motion never auto-advances. Arrows sit on the carousel, left and right. */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function StoryCarousel({ children, label, count }: { children: React.ReactNode; label: string; count: number }) {
  const row = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);

  const cards = () => Array.from(row.current?.children ?? []) as HTMLElement[];

  const goTo = useCallback((i: number) => {
    const r = row.current;
    const list = cards();
    if (!r || !list.length) return;
    const n = (i + list.length) % list.length;
    const target = list[n];
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    r.scrollTo({ left: target.offsetLeft - r.offsetLeft - parseFloat(getComputedStyle(r).paddingLeft || "0"), behavior: still ? "auto" : "smooth" });
    setIndex(n);
  }, []);

  /* keep the index in step with manual swipes */
  useEffect(() => {
    const r = row.current;
    if (!r) return;
    let t = 0;
    const onScroll = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const list = cards();
        const left = r.scrollLeft;
        let best = 0, dist = Infinity;
        list.forEach((c, i) => { const d = Math.abs(c.offsetLeft - r.offsetLeft - left); if (d < dist) { dist = d; best = i; } });
        setIndex(best);
      }, 120);
    };
    r.addEventListener("scroll", onScroll, { passive: true });
    return () => r.removeEventListener("scroll", onScroll);
  }, []);

  /* auto-advance while on screen and not paused */
  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = row.current;
    if (!r) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 });
    io.observe(r);
    const t = window.setInterval(() => { if (visible) goTo(index + 1); }, 4500);
    return () => { clearInterval(t); io.disconnect(); };
  }, [paused, index, goTo]);

  return (
    <div className="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onTouchStart={() => setPaused(true)}>
      <ul ref={row} className="row" tabIndex={0} aria-label={label}>{children}</ul>
      <button className="car-arrow prev" aria-label="Previous" onClick={() => goTo(index - 1)}><ChevronLeft size={24} aria-hidden="true" /></button>
      <button className="car-arrow next" aria-label="Next" onClick={() => goTo(index + 1)}><ChevronRight size={24} aria-hidden="true" /></button>
      <div className="car-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => <span key={i} className={i === index ? "on" : undefined} />)}
      </div>
    </div>
  );
}
