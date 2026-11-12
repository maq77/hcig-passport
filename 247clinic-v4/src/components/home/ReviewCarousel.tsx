"use client";

/* Guest words for the patient stories section (the user, 2026-11-12: "make better design for Patient stories,
   What Our Patients Say and Trusted by Patients, as one section"). Their published reviews, quoted exactly in
   the language they were written in. One quote at a time, slow cross-fade, every 7 s; hover, focus or touch
   pauses it, reduced motion never auto-advances. */
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Voice = { name: string; country: string; lang: string; text: string; flag?: string };

export function ReviewCarousel({ voices, flagBase }: { voices: Voice[]; flagBase: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = voices.length;
  useEffect(() => {
    if (paused || n < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % n), 7000);
    return () => clearInterval(t);
  }, [paused, n]);
  const go = (d: number) => setI((v) => (v + d + n) % n);

  return (
    <div className="voices-quotes" role="region" aria-roledescription="carousel" aria-label="Trusted by Patients"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onTouchStart={() => setPaused(true)}>
      <svg className="voices-mark" viewBox="0 0 48 36" aria-hidden="true"><path d="M0 36V20C0 9 6 2 18 0l2 5c-7 2-10 6-10 12h8v19H0Zm28 0V20C28 9 34 2 46 0l2 5c-7 2-10 6-10 12h8v19H28Z" /></svg>
      <ul className="voices-stage">
        {voices.map((v, k) => (
          <li key={v.name} className={k === i ? "on" : ""} aria-hidden={k !== i} aria-roledescription="slide" aria-label={`${k + 1} / ${n}`}>
            <blockquote lang={v.lang}><p>{v.text}</p></blockquote>
            <div className="voices-who">
              {v.flag && <img src={`${flagBase}/flag-${v.flag}.svg`} alt="" width={30} height={30} />}
              <span><b>{v.name}</b><small>{v.country}</small></span>
            </div>
          </li>
        ))}
      </ul>
      <div className="voices-nav">
        <div className="voices-dots" aria-hidden="true">{voices.map((v, k) => <i key={v.name} className={k === i ? "on" : ""} />)}</div>
        <div className="voices-arrows">
          <button type="button" onClick={() => go(-1)} aria-label="Previous"><ChevronLeft size={18} aria-hidden="true" /></button>
          <button type="button" onClick={() => go(1)} aria-label="Next"><ChevronRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
}
