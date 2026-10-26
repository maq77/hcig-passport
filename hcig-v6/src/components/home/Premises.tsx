"use client";
// Our Premises and Facilities: the approved group section (film, eight brands, hover logos), always day now
// (only the hero switches), and the group-logo marquee that closes the section (his note 2026-10-26).
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { GROUP } from "@/content/home.mjs";
import { asset } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import { Marquee } from "@/components/ui/Marquee";

type Brand = { short: string; name: string; line: string; url: string; logo: string };

export function Premises() {
  const film = useRef<HTMLDivElement>(null);
  const wide = useRef<HTMLVideoElement>(null);
  const tall = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!film.current) return;
    const io = new IntersectionObserver((es) => setOnScreen(es[0].isIntersecting), { threshold: 0.25 });
    io.observe(film.current);
    return () => io.disconnect();
  }, []);

  // Only the cut that is visible plays (wide on desktop, tall on phones), and only while the film is on screen.
  useEffect(() => {
    const sync = () => {
      for (const v of [wide.current, tall.current]) {
        if (!v) continue;
        const lead = v.offsetParent !== null;
        v.muted = !(lead && sound);
        if (lead && onScreen && (!reduce || sound)) {
          if (v.preload === "none") { v.preload = "auto"; v.load(); }
          v.play().catch(() => {});
        } else if (!v.paused) v.pause();
      }
    };
    sync();
    addEventListener("resize", sync, { passive: true });
    return () => removeEventListener("resize", sync);
  }, [onScreen, sound, reduce]);

  const brands = GROUP.brands as Brand[];

  return (
    <section className="sec gf band-soft" aria-labelledby="gf-h">
      <div className="wrap">
        <SectionHead id="gf-h" title={GROUP.heading.text} lead={GROUP.line.text} />
        <Reveal className="gf-film" ref={film}>
          <video ref={wide} className="gf-wide" src={asset("film-day-wide")} muted loop playsInline preload="none" aria-label={GROUP.filmLabel.text} />
          <video ref={tall} className="gf-tall" src={asset("film-day-tall")} muted loop playsInline preload="none" aria-label={GROUP.filmLabel.text} />
          <button type="button" className="gf-sound" onClick={() => setSound((s) => !s)} aria-pressed={sound}>
            {sound ? <><Icon name="speaker" /><span>{GROUP.soundOff.text}</span></> : <><Icon name="muted" /><span>{GROUP.soundOn.text}</span></>}
          </button>
        </Reveal>
        <ul className="gf-brands" aria-label={GROUP.listLabel.text}>
          {brands.map((x) => (
            <li key={x.short}>
              <a href={x.url} target="_blank" rel="noopener">
                <span className="gf-chip" aria-hidden="true"><img src={asset(x.logo)} alt="" loading="lazy" /></span>
                <span>{x.short}</span>
              </a>
              <span className="gf-card" aria-hidden="true">
                <img src={asset(x.logo)} alt="" loading="lazy" />
                <b>{x.name}</b>
                <small>{x.line}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Reveal className="gf-marquee">
        <Marquee duration={48} label={GROUP.listLabel.text}>
          {brands.map((x) => (
            <a key={x.short} className="logo-tile logo-tile-lg" href={x.url} target="_blank" rel="noopener">
              <img src={asset(x.logo)} alt={x.name} loading="lazy" />
            </a>
          ))}
        </Marquee>
      </Reveal>
    </section>
  );
}
