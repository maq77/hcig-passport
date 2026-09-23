"use client";

/* Films open in a frosted-white viewer in the film's real shape, with sound, because
   the visitor asked to watch. In the page they only ever play muted.
   Escape, the Close button or a click outside closes it and returns focus. */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Play, X } from "lucide-react";
import { asset } from "@/data/facts";

function useViewer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => close.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; btn.current?.focus(); };
  }, [open]);
  return { open, setOpen, mounted, btn, close };
}

function ViewerPortal({ v, src, label }: { v: ReturnType<typeof useViewer>; src: string; label: string }) {
  if (!v.mounted) return null;
  return createPortal(
    <AnimatePresence>
      {v.open && (
        <motion.div className="viewer" role="dialog" aria-modal="true" aria-label={label}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          onClick={(e) => { if (e.target === e.currentTarget) v.setOpen(false); }}>
          <motion.video src={asset(src)} controls autoPlay playsInline
            initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} />
          <button ref={v.close} className="close" aria-label="Close" onClick={() => v.setOpen(false)}>
            <X size={22} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* Small pill on a film card. */
export function Watch({ src, label = "Watch", className = "watch" }: { src: string; label?: string; className?: string }) {
  const v = useViewer();
  return (
    <>
      <button ref={v.btn} className={className} onClick={() => v.setOpen(true)}>
        <i aria-hidden="true"><Play size={15} fill="currentColor" /></i>
        <span>{label}</span>
      </button>
      <ViewerPortal v={v} src={src} label={label} />
    </>
  );
}

/* The big centred play button on the facilities film: white disc, red play mark,
   two soft rings breathing out of it, a label pill under it. */
export function BigPlay({ src, label = "Watch video" }: { src: string; label?: string }) {
  const v = useViewer();
  return (
    <>
      <button ref={v.btn} className="bigplay" onClick={() => v.setOpen(true)}>
        <span className="bigplay-disc" aria-hidden="true">
          <span className="ring r1" /><span className="ring r2" />
          <Play size={30} fill="currentColor" />
        </span>
        <span className="bigplay-label">{label}</span>
      </button>
      <ViewerPortal v={v} src={src} label={label} />
    </>
  );
}
