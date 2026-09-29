"use client";

/* A description that shows two lines and opens on its arrow (the user, 2026-09-24:
   "adding an arrow button that will reveal more description when clicked on it, and
   make like hovering effect ... animated ... framer motion and tailwind").
   Every description reserves the same two lines, so cards stay the same size. The full
   text is always in the page: without JS it simply shows whole (html:not(.js) rules). */
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

export function More({ text, label, lines = 2, center = false, className = "" }: {
  text: string; label: string; lines?: number; center?: boolean; className?: string;
}) {
  const id = useId();
  const body = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  /* The two-line height and the full height, in px, once measured. Animating between two
     numbers is exact both ways ("auto" loses track on the way back). */
  const [dims, setDims] = useState<{ closed: number; full: number } | null>(null);
  const long = dims ? dims.full > dims.closed + 2 : true;
  const reduce = useReducedMotion();

  useEffect(() => {
    const p = body.current?.firstElementChild as HTMLElement | null;
    if (!p) return;
    const measure = () => {
      const lh = parseFloat(getComputedStyle(p).lineHeight) || 24;
      const next = { closed: Math.round(lh * lines), full: p.scrollHeight };
      setDims((d) => (d && d.closed === next.closed && d.full === next.full ? d : next));
    };
    measure();
    /* The paragraph only changes size with the width, never with the animation. */
    const ro = new ResizeObserver(measure);
    ro.observe(p);
    return () => ro.disconnect();
  }, [lines]);

  /* Opens in 0.42s, closes a little faster, as exits should. */
  const spring = reduce ? { duration: 0 } : { duration: open ? 0.42 : 0.3, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      className={`more grid items-end gap-x-3 ${center ? "grid-cols-1 justify-items-center text-center" : "grid-cols-[minmax(0,1fr)_auto]"} ${open ? "is-open" : ""} ${long ? "is-long" : ""} ${className}`}
      style={{ ["--more-lines" as string]: lines }}
    >
      <motion.div
        ref={body}
        id={id}
        className="more-body overflow-hidden"
        initial={false}
        animate={dims && long ? { height: open ? dims.full : dims.closed } : undefined}
        transition={spring}
      >
        <p>{text}</p>
      </motion.div>
      {long && (
        <motion.button
          type="button"
          className="more-btn mt-2 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border transition-colors duration-200"
          aria-expanded={open}
          aria-controls={id}
          aria-label={`${open ? "Show less" : "Show more"}: ${label}`}
          onClick={() => setOpen((o) => !o)}
          whileHover={reduce ? undefined : { scale: 1.1, y: -1 }}
          whileTap={reduce ? undefined : { scale: 0.92 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
        >
          <motion.span className="grid" animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}>
            <ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" />
          </motion.span>
        </motion.button>
      )}
    </div>
  );
}
