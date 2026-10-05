"use client";

import { ReactNode, useEffect, useRef } from "react";

// Scroll reveals in plain CSS (2026-10-05). One shared IntersectionObserver marks each block `data-in` the first
// time it enters the view, and the browser runs the fade and rise itself on the compositor (globals.css,
// "Scroll reveals"). The old framer-motion version moved every block frame by frame in JavaScript, which was most of
// the scrolling work on slower phones. Visitors who ask for less motion get a short fade with no movement.

type RevealType = "fade" | "rise" | "scale" | "slide-right";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  type?: RevealType;
}

let shared: IntersectionObserver | null = null;
function observer() {
  if (!shared) {
    shared = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = "";
          shared!.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
  }
  return shared;
}

export default function Reveal({ children, delay = 0, className = "", style, type = "rise" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = observer();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  const css = delay ? ({ ...style, "--rv-delay": `${delay}s` } as React.CSSProperties) : style;
  return (
    <div ref={ref} className={`reveal reveal--${type}${className ? ` ${className}` : ""}`} style={css}>
      {children}
    </div>
  );
}
