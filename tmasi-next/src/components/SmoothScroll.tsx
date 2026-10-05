"use client";

import { useEffect } from "react";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // We removed heavy Lenis scrolling to keep native feel
    // Just enabling native smooth scrolling behavior for anchor links
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  // Images below the first screen fade in as they arrive instead of popping in (2026-10-05, globals.css
  // "Images fade in"). Images already loaded are marked first, so nothing on screen blinks when this switches on.
  useEffect(() => {
    const root = document.documentElement;
    const mark = (e: Event) => {
      const t = e.target;
      if (t instanceof HTMLImageElement) t.dataset.loaded = "";
    };
    document.addEventListener("load", mark, true);
    document.addEventListener("error", mark, true);
    document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
      if (img.complete) img.dataset.loaded = "";
    });
    root.dataset.imgfade = "";
    return () => {
      document.removeEventListener("load", mark, true);
      document.removeEventListener("error", mark, true);
      delete root.dataset.imgfade;
    };
  }, []);

  return <>{children}</>;
}
