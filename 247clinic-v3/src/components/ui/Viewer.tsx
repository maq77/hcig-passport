"use client";

/* "Watch" opens the whole film, with sound, in a frosted-white viewer in the
   film's real shape. Escape or Close returns focus to the button. */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Play, X } from "lucide-react";
import { asset } from "@/data/facts";

export function Watch({ src, label = "Watch", className = "watch" }: { src: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const btn = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; btn.current?.focus(); };
  }, [open]);

  return (
    <>
      <button ref={btn} className={className} onClick={() => setOpen(true)}>
        <i aria-hidden="true"><Play size={16} fill="currentColor" /></i>
        <span>{label}</span>
      </button>
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div className="viewer" role="dialog" aria-modal="true" aria-label={label}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
              <motion.video src={asset(src)} controls autoPlay playsInline
                initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
              <button ref={close} className="close" aria-label="Close" onClick={() => setOpen(false)}>
                <X size={22} aria-hidden="true" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
