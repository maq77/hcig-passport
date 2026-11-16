"use client";

/* How it works on desktop: one arrow under the steps opens every step text at once
   (the user, 2026-11-12: "in desktop, i want one arrow down, not two, only one that
   opens both 02 and 03"). Phones keep the arrow on each step. The steps read the shared
   state through AllOpen, so no stylesheet has to fight the measured heights. */
import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { AllOpen } from "@/components/ui/More";

export function StepsReveal({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className={`steps-wrap ${open ? "all-open" : ""}`}>
      <AllOpen.Provider value={open}>{children}</AllOpen.Provider>
      <div className="steps-toggle">
        <motion.button type="button" className="more-btn steps-toggle-btn" aria-expanded={open}
          aria-label={open ? "Show less" : "Show more"} onClick={() => setOpen((o) => !o)}
          whileTap={reduce ? undefined : { scale: 0.96 }}>
          <motion.span className="grid" animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <ChevronDown size={18} aria-hidden="true" />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}
