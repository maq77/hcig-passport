"use client";

/* How it works on desktop: one arrow under the steps opens every step text at once
   (the user, 2026-11-12: "in desktop, i want one arrow down, not two, only one that
   opens both 02 and 03"). Phones keep the arrow on each step. */
import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

export function StepsReveal({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className={`steps-wrap ${open ? "all-open" : ""}`}>
      {children}
      <div className="steps-toggle">
        <motion.button type="button" className="more-btn steps-toggle-btn" aria-expanded={open}
          aria-label={open ? "Show less" : "Show more"} onClick={() => setOpen((o) => !o)}
          whileHover={reduce ? undefined : { scale: 1.08, y: -1 }} whileTap={reduce ? undefined : { scale: 0.92 }}>
          <motion.span className="grid" animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}>
            <ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}
