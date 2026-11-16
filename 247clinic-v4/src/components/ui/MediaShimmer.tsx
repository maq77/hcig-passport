"use client";

/* Premium loading for every photo (the user, 2026-11-12: "add loading state and shimmer ... even if it doesnt take
   much time, make it take time so it feel more premium and smooth"). Each visible photo in the page first shows a
   soft ivory shimmer; when it scrolls into view it waits at least 0.9 s, then the photo blurs up sharp over 1.2 s.
   Hidden photos (opening cards, other slides) and moving logo rows are left alone, so nothing can stay invisible.
   Without JS or with reduced motion the photos simply show. */
import { useEffect } from "react";

const SKIP = ".hero, .mq, .flag, .stat-ico, .badges, .uca-badge, .logo, .hdr, .menu, [aria-hidden='true']";
const HOLD = 900;

export function MediaShimmer() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("main img")).filter((img) => {
      if (img.closest(SKIP)) return false;
      const r = img.getBoundingClientRect();
      return r.width >= 90 && r.height >= 60;
    });
    const watch = new Map<Element, HTMLImageElement>();
    imgs.forEach((img) => {
      const box = img.parentElement;
      if (!box) return;
      img.classList.add("shim-i");
      box.classList.add("shim");
      watch.set(box, img);
    });
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const img = watch.get(e.target);
      if (!img) return;
      const t0 = performance.now();
      const reveal = () => {
        const wait = Math.max(0, HOLD - (performance.now() - t0));
        window.setTimeout(() => {
          img.classList.add("ld");
          window.setTimeout(() => e.target.classList.remove("shim"), 1400);
        }, wait);
      };
      if (img.complete && img.naturalWidth) reveal();
      else { img.addEventListener("load", reveal, { once: true }); img.addEventListener("error", reveal, { once: true }); }
    }), { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });
    watch.forEach((_, box) => io.observe(box));
    /* Safety net: anything still waiting after 8 s shows anyway. */
    const safety = window.setTimeout(() => imgs.forEach((img) => { img.classList.add("ld"); img.parentElement?.classList.remove("shim"); }), 8000 + HOLD);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, []);
  return null;
}
