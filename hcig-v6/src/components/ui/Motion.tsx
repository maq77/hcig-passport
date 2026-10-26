"use client";
// Shared motion primitives (Framer Motion). Every one has a still state under reduced motion,
// and the layout adds a <noscript> rule so nothing stays hidden without script.
import { animate, motion, useInView, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;
/** In view, or anywhere above it: a block the reader flicked past still shows when they scroll back. */
const PAST = "100000px 0px -8% 0px";

type RevealProps = HTMLMotionProps<"div"> & { delay?: number; y?: number; as?: "div" | "li" | "article" | "p" | "figure" | "section" };

/** Fade and rise into place once, when the block enters the screen. */
export function Reveal({ delay = 0, y = 28, as = "div", children, ...rest }: RevealProps) {
  const reduce = useReducedMotion();
  const C = motion[as] as typeof motion.div;
  return (
    <C
      data-rv=""
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: PAST }}
      transition={{ duration: 0.9, ease: EASE, delay: delay / 1000 }}
      {...rest}
    >
      {children}
    </C>
  );
}

/** A container whose direct Item children rise one after another. */
export function Stagger({ children, className, gap = 0.08, as = "div", ...rest }: { children: ReactNode; className?: string; gap?: number; as?: "div" | "ul" | "ol" } & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();
  const C = motion[as] as typeof motion.div;
  return (
    <C
      className={className}
      initial={reduce ? false : "hide"}
      whileInView="show"
      viewport={{ once: true, margin: PAST }}
      variants={{ hide: {}, show: { transition: { staggerChildren: gap } } }}
      {...rest}
    >
      {children}
    </C>
  );
}

export const itemVariants = {
  hide: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};

export function Item({ as = "div", children, ...rest }: { as?: "div" | "li" | "article" } & HTMLMotionProps<"div">) {
  const C = motion[as] as typeof motion.div;
  return (
    <C data-rv="" variants={itemVariants} {...rest}>
      {children}
    </C>
  );
}

/** Counts from 0 to the real number (already in the HTML) when it enters the screen. */
export function CountUp({ to, duration = 1.6 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, reduce, to, duration]);
  return <span ref={ref}>{v}</span>;
}
