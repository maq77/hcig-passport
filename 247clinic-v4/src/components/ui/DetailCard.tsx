"use client";

/* A card that opens into a full card (the user, 2026-11-12: "pop up cards or cards that open
   on screen with animation and motion and good design, to save spacing"). Approved on the
   canvas H6dARjuHkaTeYqcUUvwYdB: desktop = a centred card, photo on the left at full height,
   words on the right; phones = a bottom sheet with a taller photo.
   The full content is always in the page (hidden while closed) so search engines and AI
   answers read it; opening moves it into a layer on top of the page. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function DetailCard({ trigger, children, label, className = "" }: {
  trigger: ReactNode; children: ReactNode; label: string; className?: string;
}) {
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const btn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setState((s) => (s === "open" ? "closing" : s));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => { setState("closed"); btn.current?.focus(); }, reduce ? 0 : 260);
  }, []);

  useEffect(() => {
    if (state !== "open") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtn.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(t); document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [state, close]);

  const shown = state !== "closed";
  return (
    <>
      <button ref={btn} type="button" className={`dc-trigger ${className}`} aria-haspopup="dialog" aria-expanded={state === "open"}
        onClick={() => setState("open")}>
        {trigger}
      </button>
      {!shown && <div hidden>{children}</div>}
      {shown && createPortal(
        <div className={`dc-scrim ${state === "closing" ? "is-closing" : ""}`} onClick={close}>
          <div className="dc-panel" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
            <span className="dc-handle" aria-hidden="true" />
            <button ref={closeBtn} type="button" className="dc-x" aria-label="Close" onClick={close}><X size={20} strokeWidth={2.2} aria-hidden="true" /></button>
            {children}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
