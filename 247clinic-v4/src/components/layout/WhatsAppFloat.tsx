"use client";

/* Copied from medcierge-next/src/components/WhatsAppFloat.tsx (the user, 2026-09-23), in its original WhatsApp
   greens ("lighter green like the real color of whatsapp") and shown from the first second. The phrases it
   cycles are the brief's own.
   v6 (spec 015): the same white and green look. The prompts change every 6s. Past 200px down it settles to the
   round icon; near the top it opens again. It hides while the menu, an opening card or a film is up (the
   has-layer body class those set). On desktop it never covers the hero's foot row: while that row sits under
   it, it stays the round icon (which clears the row). Only transform, opacity and colour move. */
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { waHref } from "@/lib/wa";

const OPEN_ABOVE = 200;

export function WhatsAppFloat({ prompts, sub, aria }: { prompts: string[]; sub: string; aria: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [small, setSmall] = useState(false);
  /* Phones and tablets (the stacked hero): the header already carries WhatsApp, so the float waits until the
     hero has mostly scrolled away (it covered the hero's words on a 390px screen, and the hero now fills the
     screen with the accreditation row at its foot). */
  const [away, setAway] = useState(false);
  const pill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % prompts.length), 6000);
    return () => clearInterval(t);
  }, [prompts.length, reduce]);

  useEffect(() => {
    let raf = 0;
    const rows = () => Array.from(document.querySelectorAll<HTMLElement>(".hero-foot, .hc-foot"));
    /* Would the open pill sit over a row of the hero foot? */
    const overHeroFoot = () => {
      const p = pill.current;
      if (!p || window.innerWidth < 1024) return false;
      const r = p.getBoundingClientRect();
      return rows().some((el) => {
        const b = el.getBoundingClientRect();
        return b.width > 0 && r.left < b.right && r.right > b.left && r.top < b.bottom + 12 && r.bottom > b.top - 12;
      });
    };
    const read = () => {
      raf = 0;
      setSmall(window.scrollY > OPEN_ABOVE || overHeroFoot());
      const hero = document.querySelector<HTMLElement>(".hero, .ph");
      setAway(window.innerWidth < 1024 && !!hero && hero.getBoundingClientRect().bottom > window.innerHeight * 0.55);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const label = prompts[i];

  return (
    <a href={waHref("homepage")} target="_blank" rel="noopener" className={`wa-float v6 ${small ? "small" : ""} ${away ? "away" : ""}`} aria-label={aria}
      data-ev="whatsapp_medical_click" data-placement="floating">
      <span ref={pill} className="wa-pill" aria-hidden="true">
        <span className="t">
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
      </span>
      <span className="g" aria-hidden="true">
        <WhatsAppGlyph size={28} />
      </span>
    </a>
  );
}
