"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* Previous / Next for a snap row. The row itself scrolls by touch and keyboard. */
export function RowControls({ target }: { target: string }) {
  const go = (dir: 1 | -1) => {
    const row = document.getElementById(target);
    if (!row) return;
    const card = row.querySelector<HTMLElement>(":scope > *");
    const step = card ? card.getBoundingClientRect().width + 16 : row.clientWidth * 0.8;
    row.scrollBy({ left: dir * step, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="row-ctrl" ref={ref}>
      <button aria-label="Previous" onClick={() => go(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
      <button aria-label="Next" onClick={() => go(1)}><ChevronRight size={22} aria-hidden="true" /></button>
    </div>
  );
}
