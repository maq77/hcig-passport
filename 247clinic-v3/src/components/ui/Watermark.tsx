"use client";

/* The 24/7 behind "Medical Care Without Leaving Your Resort", moving (the user,
   2026-09-24: "make 247 text in background ... to be animated and moving").
   Two rows drift in opposite directions as the section scrolls past, and each row
   also glides slowly on its own. Transform only; still under reduced motion. */
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function Watermark({ text = "24/7", count = 5 }: { text?: string; count?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["4%", "-22%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-26%", "0%"]);
  const words = Array.from({ length: count }, (_, i) => <span key={i}>{text}</span>);
  return (
    <div ref={ref} className="wm" aria-hidden="true">
      <motion.div className="wm-row wm-fill" style={reduce ? undefined : { x: x1 }}>
        <div className="wm-glide">{words}</div>
      </motion.div>
      <motion.div className="wm-row wm-line" style={reduce ? undefined : { x: x2 }}>
        <div className="wm-glide rev">{words}</div>
      </motion.div>
    </div>
  );
}
