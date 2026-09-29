"use client";

/* The home FAQs (the user, 2026-09-24: "add FAQs with good styling and design").
   One open at a time, the first open on arrival. Answers are always in the page, so
   search engines and AI answers read them; closed ones are only folded to zero height.
   Without JS every answer shows (html:not(.js) rule in globals.css). */
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  const reduce = useReducedMotion();
  return (
    <ol className="faq-list">
      {items.map((it, i) => (
        <FaqItem key={it.q} n={i + 1} q={it.q} a={it.a} open={open === i} reduce={!!reduce}
          onToggle={() => setOpen((o) => (o === i ? -1 : i))} />
      ))}
    </ol>
  );
}

function FaqItem({ n, q, a, open, reduce, onToggle }: {
  n: number; q: string; a: string; open: boolean; reduce: boolean; onToggle: () => void;
}) {
  const id = useId();
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => setH(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <li className={`faq-item ${open ? "is-open" : ""}`}>
      <h3 className="faq-q">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <span className="faq-n" aria-hidden="true">{String(n).padStart(2, "0")}</span>
          <span className="faq-text">{q}</span>
          <motion.span className="faq-ico" aria-hidden="true" animate={{ rotate: open ? 135 : 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 22 }}>
            <Plus size={18} strokeWidth={2.4} />
          </motion.span>
        </button>
      </h3>
      <motion.div id={id} role="region" className="faq-a" initial={false}
        animate={h === null ? undefined : { height: open ? h : 0, opacity: open ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: open ? 0.4 : 0.28, ease: [0.22, 1, 0.36, 1] }}>
        <div ref={inner}><p>{a}</p></div>
      </motion.div>
    </li>
  );
}
