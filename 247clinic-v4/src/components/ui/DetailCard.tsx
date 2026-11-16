"use client";

/* A card that opens into a full card (the user, 2026-11-12: "pop up cards or cards that open
   on screen with animation and motion and good design, to save spacing"). Approved on the
   canvas H6dARjuHkaTeYqcUUvwYdB: desktop = a centred ivory card, photo on the left at full height,
   words on the right, scaling in from 0.98 over 400ms; phones = a bottom sheet with a taller photo.
   v6 (spec 015 section 5): on phones the sheet follows a finger pulled down from its photo or handle
   (pointer events) and closes past about 80px or on a fast flick; otherwise it springs back.
   The full content is always in the page (hidden while closed) so search engines and AI
   answers read it; opening moves it into a layer on top of the page. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const PULL = 80; // px past which a released sheet closes
const FLICK = 0.6; // px per ms that closes it whatever the distance
const OUT = 260; // the closing animation, ms

export function DetailCard({ trigger, children, label, className = "" }: {
  trigger: ReactNode; children: ReactNode; label: string; className?: string;
}) {
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const btn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; y0: number; dy: number; trail: { y: number; t: number }[] } | null>(null);

  const close = useCallback(() => {
    setState((s) => (s === "open" ? "closing" : s));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => { setState("closed"); btn.current?.focus(); }, reduce ? 0 : OUT);
  }, []);

  /* The body class hides the WhatsApp float while the card is up. */
  useEffect(() => {
    if (state === "closed") return;
    document.body.classList.add("has-layer");
    return () => document.body.classList.remove("has-layer");
  }, [state]);

  useEffect(() => {
    if (state !== "open") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtn.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(t); document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [state, close]);

  /* ---- swipe down to close, phones only ---- */
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = panel.current;
    if (!el || state !== "open" || e.button !== 0) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    if (!(e.target as Element).closest(".dc-media, .dc-handle")) return;
    drag.current = { id: e.pointerId, y0: e.clientY, dy: 0, trail: [{ y: e.clientY, t: performance.now() }] };
    el.setPointerCapture(e.pointerId);
    el.style.animation = "none";
    el.style.transition = "none";
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current, el = panel.current;
    if (!d || !el || e.pointerId !== d.id) return;
    const now = performance.now();
    d.trail.push({ y: e.clientY, t: now });
    while (d.trail.length > 2 && now - d.trail[0].t > 100) d.trail.shift();
    d.dy = Math.max(0, e.clientY - d.y0);
    el.style.transform = `translateY(${d.dy}px)`;
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current, el = panel.current;
    if (!d || !el || e.pointerId !== d.id) return;
    drag.current = null;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    /* the speed over the last 100ms, so one jittery sample cannot read as a flick */
    const a = d.trail[0], b = d.trail[d.trail.length - 1];
    const v = (b.y - a.y) / Math.max(16, b.t - a.t);
    if (d.dy > PULL || (v > FLICK && d.dy > 24)) {
      el.style.transition = `transform ${OUT}ms cubic-bezier(0.65, 0, 0.35, 1)`;
      el.style.transform = "translateY(100%)";
      close();
    } else {
      el.style.transition = "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "";
    }
  };

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
          <div ref={panel} className="dc-panel" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <span className="dc-handle" aria-hidden="true" />
            <button ref={closeBtn} type="button" className="dc-x" aria-label="Close" onClick={close}><X size={20} aria-hidden="true" /></button>
            {children}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
