"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QuoteForm from "./QuoteForm";
import { useSite } from "./site/SiteProvider";

// The same quote form in a pop-up, opened from the "Ready to partner" band in the footer.
// Escape or the backdrop closes it; focus moves in on open and back to the button on close.
export default function QuoteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { live, ui } = useSite();
  const reduce = useReducedMotion();
  const dialog = useRef<HTMLDivElement>(null);
  // Rendered into <body> so no parent's overflow or containment can clip the fixed overlay.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => dialog.current?.querySelector<HTMLInputElement>("input")?.focus(), 80);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      back?.focus();
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <>
    <AnimatePresence>
      {open && (
        <motion.div
          className="qm-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
        >
          <motion.div
            ref={dialog}
            className="qm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qm-title"
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <button type="button" className="qm-close" onClick={onClose} aria-label={ui.close}>
              <X size={22} aria-hidden="true" />
            </button>
            <span className="qm-rule" aria-hidden="true" />
            <h2 id="qm-title" className="qm-title">{live.shell.quote.title}</h2>
            <p className="qm-sub">{live.shell.quote.text}</p>
            <QuoteForm idPrefix="quote-modal" columns={2} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .qm-backdrop {
          position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;
          padding: 24px; background: rgba(8,17,51,0.62); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .qm-dialog {
          position: relative; width: min(760px, 100%); max-height: calc(100dvh - 48px); overflow-y: auto; box-sizing: border-box;
          background: #ffffff; border-radius: 22px; padding: clamp(28px, 4vw, 48px);
          box-shadow: 0 40px 80px -30px rgba(8,17,51,0.55);
        }
        .qm-close {
          position: absolute; top: 14px; right: 14px; width: 44px; height: 44px; border-radius: 50%;
          border: none; background: #F1F5F9; color: var(--lx-ink); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background-color .2s ease;
        }
        .qm-close:hover { background: #e2e8f0; }
        .qm-rule { display: block; width: 40px; height: 2px; background: var(--tmasi-teal); margin-bottom: 18px; }
        .qm-title {
          margin: 0 0 12px; color: var(--lx-ink); font-family: var(--font-display);
          font-weight: 400; font-size: clamp(34px, 4vw, 46px); line-height: 1.02; letter-spacing: 0.02em; text-transform: uppercase;
        }
        .qm-sub { margin: 0 0 28px; font-size: 15px; line-height: 1.7; color: var(--lx-body); }
        @media (max-width: 600px) {
          .qm-backdrop { padding: 12px; align-items: flex-end; }
          .qm-dialog { border-radius: 20px; max-height: calc(100dvh - 24px); }
        }
      `}} />
    </>,
    document.body
  );
}
