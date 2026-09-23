"use client";

/* Restrained scroll depth (scroll-craft: layers that move at slightly different rates,
   transform only). Every effect stays still under reduced motion, and the content is in
   the HTML either way. */
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/* A layer that drifts against the scroll: speed 0.1 moves 10% of its travel. */
export function Drift({ children, speed = 0.08, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  return <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>{children}</motion.div>;
}

/* Grows from 0.92 to 1 as it enters the screen, so a film stage opens like a curtain. */
export function Grow({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 35%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  return <motion.div ref={ref} className={className} style={reduce ? undefined : { scale }}>{children}</motion.div>;
}

/* The hero picture slowly sinks and the copy lifts away as the page scrolls on. */
export function HeroDepth({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 90]);
  const scale = useTransform(scrollY, [0, 700], [1, 1.06]);
  return <motion.div className={className} style={reduce ? undefined : { y, scale }}>{children}</motion.div>;
}
