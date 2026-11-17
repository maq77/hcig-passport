"use client";

/* Ported from v6 to v3 on 2026-11-17 (v3 look in home-calm.css). How it works, folded into On-site care (spec 015 Amendment 1): the four steps as one slim numbered
   hairline row. Titles only; each step's words open in place. Desktop: four columns on one hairline, and
   one arrow at the end opens all four at once (the user, 2026-11-12: "in desktop, i want one arrow down,
   not two"). Phones: a vertical line, each step opens on its own. The words are always in the page, so
   search engines read them; without JS they simply show (html:not(.js) rule). */
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Plus } from "lucide-react";

type Step = { title: string; text: string | null };

export function StepsLine({ steps, labels }: { steps: Step[]; labels: { more: string; less: string } }) {
  const [open, setOpen] = useState<boolean[]>(() => steps.map(() => false));
  const reduce = !!useReducedMotion();
  const all = open.every(Boolean);
  const toggle = (k: number) => setOpen((o) => o.map((v, j) => (j === k ? !v : v)));
  return (
    <div className={`sline-wrap ${all ? "all-open" : ""}`}>
      <ol className="sline">
        {steps.map((s, k) => (
          <StepItem key={s.title} n={k + 1} step={s} open={open[k]} reduce={reduce} onToggle={() => toggle(k)} />
        ))}
      </ol>
      <button type="button" className="sline-all" aria-expanded={all} aria-label={all ? labels.less : labels.more}
        onClick={() => setOpen(steps.map(() => !all))}>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

function StepItem({ n, step, open, reduce, onToggle }: { n: number; step: Step; open: boolean; reduce: boolean; onToggle: () => void }) {
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
    <li className={`sl-step rv ${open ? "is-open" : ""}`} style={{ ["--d" as string]: `${(n - 1) * 90}ms` }}>
      <h3 className="sl-q">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <span className="sl-n num" aria-hidden="true">{String(n).padStart(2, "0")}</span>
          <span className="sl-t">{step.title}</span>
          <span className="sl-plus" aria-hidden="true"><Plus size={16} /></span>
        </button>
      </h3>
      {step.text && (
        <motion.div id={id} className="sl-a" initial={false}
          animate={h === null ? undefined : { height: open ? h : 0, opacity: open ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <div ref={inner}><p>{step.text}</p></div>
        </motion.div>
      )}
    </li>
  );
}
