"use client";
// The HCIG promo film (his picks, round 10, 2026-10-28): one player for the whole site, opened from the hero
// thumbnail, the film band (home, About, Press) and played inline on its own page. The film is only ever used as
// video: muted previews play while in view and pause out of it; the cover is a designed image, never a frame.
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { FILM, HERO, UI } from "@/content/home.mjs";
import { abs, absAsset, asset } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Motion";

const OPEN = "hcig:film";
export const openFilm = () => window.dispatchEvent(new Event(OPEN));

/** The one player: full screen with sound; phones get the 720p file. Mounted once by the Shell. */
export function FilmDialog() {
  const dlg = useRef<HTMLDialogElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const open = () => {
      setSrc(asset(innerWidth < 900 ? "promo-film-720" : "promo-film"));
      const d = dlg.current;
      if (!d) return;
      d.showModal();
      requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("in")));
    };
    addEventListener(OPEN, open);
    return () => removeEventListener(OPEN, open);
  }, []);
  // fade out, then close (Esc and the backdrop take the same way out)
  const close = () => {
    const d = dlg.current;
    if (!d || !d.open) return;
    d.classList.remove("in");
    window.setTimeout(() => { d.close(); setSrc(null); }, reduce ? 0 : 420);
  };
  return (
    <dialog ref={dlg} className="lightbox film-dlg" aria-label={FILM.title.text} onCancel={(e) => { e.preventDefault(); close(); }} onClose={() => setSrc(null)} onClick={(e) => { if (e.target === dlg.current) close(); }}>
      <button type="button" className="dlg-close" onClick={close} aria-label={UI.close.text}><Icon name="close" size={22} /></button>
      {src ? <video src={src} poster={asset("film-cover")} controls autoPlay playsInline /> : null}
    </dialog>
  );
}

/** The silent preview: plays only while on screen (and never under reduced motion, which shows the cover). */
function FilmLoop({ clip = "promo-loop", late = false }: { clip?: string; late?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    const on = () => v.classList.add("on");
    v.addEventListener("playing", on);
    let seen = false, ready = !late, t = 0;
    const go = () => { if (seen && ready) v.play().catch(() => {}); };
    // late: wait until the page has painted and settled, so the clip never competes with the first screen
    if (late) {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      const start = () => { ready = true; go(); };
      t = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 3500 }) : window.setTimeout(start, 2500);
    }
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) go(); else v.pause(); }, { threshold: 0.25 });
    io.observe(v);
    return () => { io.disconnect(); v.removeEventListener("playing", on); if (late && !(window as Window & { requestIdleCallback?: unknown }).requestIdleCallback) clearTimeout(t); };
  }, [reduce]);
  return <video ref={ref} className="film-loop" src={asset(clip)} poster={asset("film-cover")} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />;
}

/** Hero: a living thumbnail floating over the globe on desktop, a compact chip on the globe on phones. */
export function HeroFilm() {
  return (
    <>
      <button type="button" className="hf-thumb" onClick={openFilm} aria-label={`${FILM.watch.text}, ${FILM.dur}`}>
        <span className="hf-tv" style={{ backgroundImage: `url(${asset("film-cover")})` }}><FilmLoop clip="promo-thumb" late /><span className="hf-play" aria-hidden="true"><Icon name="play" size={18} /></span></span>
        <span className="hf-txt">{FILM.watch.text}<small>{FILM.dur}</small></span>
      </button>
      <button type="button" className="hf-chip" onClick={openFilm} aria-label={`${FILM.watch.text}, ${FILM.dur}`}>
        <span className="hf-dot" aria-hidden="true"><Icon name="play" size={14} /></span>{FILM.watch.text}<small>{FILM.dur}</small>
      </button>
    </>
  );
}

/** The film as structured data (VideoObject), so search can show it. */
function FilmSchema() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: FILM.title.text,
    description: `${FILM.line.text} ${HERO.lead.text}`,
    thumbnailUrl: [absAsset("film-cover")],
    uploadDate: FILM.uploaded,
    duration: FILM.durIso,
    contentUrl: absAsset("promo-film"),
    embedUrl: abs("/film/"),
    publisher: { "@type": "Organization", name: "Healthcare International Group" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />;
}

/** The film band (home after About, About page, Press room): the film plays muted in a large card. */
export function FilmBand({ schema = true }: { schema?: boolean }) {
  return (
    <section className="sec film-band" aria-labelledby="film-h">
      {schema ? <FilmSchema /> : null}
      <div className="wrap">
        <Reveal className="fb-card" style={{ backgroundImage: `url(${asset("film-cover")})` }}>
          <FilmLoop />
          <div className="fb-in">
            <div>
              <p className="eyebrow fb-eyebrow">{FILM.title.text}</p>
              <h2 className="fb-line" id="film-h">{FILM.line.text}</h2>
            </div>
            <button type="button" className="fb-btn" onClick={openFilm}>
              <span className="fb-dot" aria-hidden="true"><Icon name="play" size={20} /></span>{FILM.sound.text}<small>{FILM.dur}</small>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** The film page: the film itself, ready to play with sound, under the designed cover. */
export function FilmStage() {
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const start = () => { setOn(true); requestAnimationFrame(() => ref.current?.play().catch(() => {})); };
  return (
    <div className="film-stage">
      <FilmSchema />
      <video ref={ref} src={asset("promo-film")} poster={asset("film-cover")} controls={on} playsInline preload="none" />
      {on ? null : (
        <button type="button" className="fs-cover" style={{ backgroundImage: `url(${asset("film-cover")})` }} onClick={start} aria-label={`${FILM.sound.text}, ${FILM.dur}`}>
          <span className="fb-dot" aria-hidden="true"><Icon name="play" size={26} /></span>
          <span className="fs-label">{FILM.sound.text}<small>{FILM.dur}</small></span>
        </button>
      )}
    </div>
  );
}
