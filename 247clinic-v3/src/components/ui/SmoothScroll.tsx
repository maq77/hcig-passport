"use client";

/* Smooth wheel scrolling for the whole page (the user, 2026-09-24: "make it smooth to
   scroll"). Lenis eases the page toward the wheel instead of jumping in steps; phones keep
   their own native momentum, which is already smooth. Scroll areas inside the page (the
   clinic list, the menu, the map) still scroll on their own. Off under reduced motion and
   in the editor. */
import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (new URLSearchParams(location.search).get("edit") === "1") return;
    const hdr = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hdr")) || 64;
    const lenis = new Lenis({
      lerp: 0.1,
      autoRaf: true,
      allowNestedScroll: true,
      anchors: { offset: -(hdr + 16) },
    });
    return () => lenis.destroy();
  }, []);
  return null;
}
