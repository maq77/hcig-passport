"use client";

/* Copied from medcierge-next/src/components/WhatsAppFloat.tsx (the user, 2026-09-23),
   now in its original WhatsApp greens ("lighter green like the real color of whatsapp")
   and shown from the first second ("whatsapp button should appear directly").
   The phrases it cycles are the brief's own. */
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { waHref } from "@/lib/wa";

export function WhatsAppFloat({ prompts, sub, aria }: { prompts: string[]; sub: string; aria: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % prompts.length), 4200);
    return () => clearInterval(t);
  }, [prompts.length, reduce]);

  const label = prompts[i];

  return (
    <a href={waHref("homepage")} target="_blank" rel="noopener" className="wa-float" aria-label={aria}
      data-ev="whatsapp_medical_click" data-placement="floating">
      <span className="wa-bubble" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={label} style={{ display: "block" }}
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="t" aria-hidden="true">
        <b>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={label} style={{ display: "block" }}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              {label}
            </motion.span>
          </AnimatePresence>
        </b>
        <small>{sub}</small>
      </span>
      <span className="g" aria-hidden="true">
        <WhatsAppGlyph size={28} />
      </span>
    </a>
  );
}
