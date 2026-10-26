"use client";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE, Reveal } from "./Motion";

/** ONE section header for every section, in the brand guideline's own motif: the Helma title between two black
    hairlines (guideline pages 1 to 25), then the lead. The hairlines draw outward from the title when it enters.
    `start` keeps it left aligned inside a column. */
export function SectionHead({ id, title, lead, eyebrow, tone, align, className = "" }: { id: string; title: ReactNode; lead?: ReactNode; eyebrow?: string; tone?: "ink"; align?: "start"; className?: string }) {
  const reduce = useReducedMotion();
  const line = (side: "l" | "r") => (
    <motion.span
      className={`hl ${side}`}
      aria-hidden="true"
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "100000px 0px -8% 0px" }}
      transition={{ duration: 1.3, ease: EASE, delay: 0.25 }}
    />
  );
  return (
    <Reveal className={`sec-head${align === "start" ? " start" : ""}${tone === "ink" ? " on-ink" : ""} ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="h2" id={id}>{line("l")}<span>{title}</span>{line("r")}</h2>
      {lead ? <p className="lead">{lead}</p> : null}
    </Reveal>
  );
}
