"use client";

/* Full-bleed hero film: the first 14 s of the Le Reve commercial, silent loop.
   No poster from the film. Before it plays, and under reduced motion, the
   dedicated hero still (a design slot until he supplies it) shows instead. */
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { asset } from "@/data/facts";
import { HERO } from "@/data/media";
import { DesignSlot } from "@/components/ui/Bits";

export function HeroFilm({ still }: { still: string | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setReduced(true); setPaused(true); return; }
    const small = matchMedia("(max-width: 767px)").matches;
    const webm = v.canPlayType('video/webm; codecs="vp9"');
    v.src = asset(small ? (webm ? HERO.webmm : HERO.mp4m) : (webm ? HERO.webm : HERO.mp4));
    const onPlay = () => setOn(true);
    v.addEventListener("playing", onPlay);
    v.play().catch(() => setPaused(true));
    /* pause when the hero is off screen */
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) v.pause();
      else if (!v.dataset.user) v.play().catch(() => {});
    });
    io.observe(v);
    return () => { v.removeEventListener("playing", onPlay); io.disconnect(); };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (!v.src) v.src = asset(HERO.mp4);
    if (v.paused) { delete v.dataset.user; v.play().then(() => { setPaused(false); setOn(true); }).catch(() => {}); }
    else { v.dataset.user = "1"; v.pause(); setPaused(true); }
  };

  return (
    <>
      <div className="hero-media" aria-hidden="true">
        {still
          ? <img src={still} alt="" className={`slot-hero slot-img ${reduced || (paused && !on) ? "show" : ""}`} />
          : <DesignSlot purpose="hero still" px="2400 x 1350" className={`slot-hero ${reduced || (paused && !on) ? "show" : ""}`} />}
        <video ref={ref} className={on ? "on" : ""} muted loop playsInline preload="none" />
        <div className="hero-scrim" />
      </div>
      <button className="hero-ctrl" onClick={toggle} aria-label={paused ? "Play" : "Pause"}>
        {paused ? <Play size={20} aria-hidden="true" /> : <Pause size={20} aria-hidden="true" />}
      </button>
    </>
  );
}
