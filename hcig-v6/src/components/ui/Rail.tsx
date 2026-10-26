"use client";
// Phone first: on phones a card grid becomes a horizontal slider with arrows and a counter (owner, 2026-10-26:
// "you can make horizontal with sliders and arrow on phone"). From tablet up the same items sit in their grid.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import { Stagger } from "./Motion";
import { UI } from "@/content/home.mjs";

export function Rail({ children, className = "", label, gap = 0.07 }: { children: ReactNode; className?: string; label: string; gap?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const kids = () => [...el.children] as HTMLElement[];
    setCount(kids().length);
    const onScroll = () => {
      const x = el.scrollLeft + 4;
      const i = kids().findIndex((k) => k.offsetLeft - el.offsetLeft + k.offsetWidth / 2 > x);
      setAt(Math.max(0, i));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (d: number) => {
    const el = ref.current;
    if (!el) return;
    const k = el.children[Math.min(count - 1, Math.max(0, at + d))] as HTMLElement | undefined;
    if (k) el.scrollTo({ left: k.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || "0"), behavior: "smooth" });
  };

  return (
    <div className="rail-wrap">
      <Stagger className={`rail ${className}`} gap={gap} ref={ref} role="group" aria-label={label}>
        {children}
      </Stagger>
      <div className="rail-nav">
        <button type="button" className="rail-btn" onClick={() => go(-1)} disabled={at <= 0} aria-label={UI.prev.text}>
          <Icon name="arrow" size={20} className="flip-x" />
        </button>
        <span className="rail-count" aria-live="polite">
          <b>{String(at + 1).padStart(2, "0")}</b> / {String(count || 1).padStart(2, "0")}
        </span>
        <span className="rail-bar" aria-hidden="true"><span style={{ width: `${count ? ((at + 1) / count) * 100 : 0}%` }} /></span>
        <button type="button" className="rail-btn" onClick={() => go(1)} disabled={at >= count - 1} aria-label={UI.next.text}>
          <Icon name="arrow" size={20} />
        </button>
      </div>
    </div>
  );
}
