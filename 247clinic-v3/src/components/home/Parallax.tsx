"use client";

/* The photograph behind "Feeling Unwell During Your Holiday?" drifts a little slower
   than the page (Motion's useScroll). Transform only; still under reduced motion. */
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function Parallax({ src, small }: { src: string; small: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <div ref={ref} className="parallax" aria-hidden="true">
      <motion.img src={src} srcSet={`${small} 1200w, ${src} 2400w`} sizes="100vw" alt="" loading="lazy"
        style={reduce ? undefined : { y }} />
    </div>
  );
}
