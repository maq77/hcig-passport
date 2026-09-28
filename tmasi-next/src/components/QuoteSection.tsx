"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import QuoteForm from "./QuoteForm";

// "Request My Free Quote" on the home (design B, approved 2026-09-28), right after Our Services.
// Heading and paragraph are the live tmasi.net footer text. The form opens in place from the button;
// anything else on the page can open it with the "tmasi:open-quote" event (the hero REQUEST A QUOTE does).
export default function QuoteSection() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const openFromElsewhere = () => {
      setOpen(true);
      // The browser's own smooth scroll is cancelled by the panel opening at the same time, so the scroll
      // is driven frame by frame here. The offset keeps the heading clear of the fixed header.
      const el = ref.current;
      if (!el) return;
      const target = () => el.getBoundingClientRect().top + window.scrollY - 72;
      if (reduce) {
        window.scrollTo({ top: target(), behavior: "instant" as ScrollBehavior });
        return;
      }
      animate(window.scrollY, target(), {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (y) => window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior }),
      });
    };
    window.addEventListener("tmasi:open-quote", openFromElsewhere);
    return () => window.removeEventListener("tmasi:open-quote", openFromElsewhere);
  }, [reduce]);

  return (
    <section id="quote" ref={ref} className="lx-section lx-white">
      <div className="lx-wrap">
        <Reveal>
          <SectionHead
            title="Request My Free Quote"
            sub="Choose TMASI GLOBAL as your travel medical assistant to ensure the safety and well-being of your tourists wherever they go. Simply fill out our quick form to let us know your needs, and our team will get in touch with a customized solution to support your tourists on the move."
          />
        </Reveal>

        <div className="qs-toggle-row">
          <button
            type="button"
            className={`qs-toggle${open ? " is-open" : ""}`}
            aria-expanded={open}
            aria-controls="quote-panel"
            onClick={() => setOpen((o) => !o)}
          >
            Request a Quote
            <ChevronDown size={18} aria-hidden="true" className="qs-chevron" />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="quote-panel"
              key="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="qs-card">
                <QuoteForm idPrefix="quote" columns={4} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        #quote .lx-head { margin-bottom: clamp(28px, 3vw, 36px); }
        .qs-toggle-row { display: flex; justify-content: center; }
        .qs-toggle {
          display: inline-flex; align-items: center; gap: 10px; min-height: 54px; padding: 0 30px;
          border: none; border-radius: 999px; background: var(--tmasi-teal); color: #ffffff;
          font-family: inherit; font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: background-color .25s ease, box-shadow .25s ease, transform .2s ease;
        }
        .qs-toggle:hover { background: #008486; box-shadow: 0 12px 28px -12px rgba(0,154,156,0.6); }
        .qs-toggle:active { transform: scale(0.98); }
        .qs-chevron { transition: transform .35s var(--ease); }
        .qs-toggle.is-open .qs-chevron { transform: rotate(180deg); }
        .qs-card {
          margin-top: clamp(28px, 3vw, 40px); background: #ffffff; border: 1px solid var(--lx-line);
          border-radius: 20px; padding: clamp(24px, 3vw, 40px);
          box-shadow: 0 24px 60px -36px rgba(15,32,92,0.28);
        }
        @media (max-width: 600px) { .qs-toggle { width: 100%; justify-content: center; } }
      `}} />
    </section>
  );
}
