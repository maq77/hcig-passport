"use client";
// Maritime & Cruise (manager's block), Testimonials, CEO quote, insurers, Who We Work With, Our Impact,
// the closing band with the newsletter. Words from src/content/home.mjs only.
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CEO, CTA, IMPACT, INSURERS, MARITIME, TESTIMONIALS, UI, WHO } from "@/content/home.mjs";
import { asset, file, href, slug } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { CountUp, Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import { SheetLink } from "@/components/ui/Sheet";
import { Marquee } from "@/components/ui/Marquee";
import { Watermark } from "@/components/ui/Brand";
import { Rail } from "@/components/ui/Rail";
import type { IconName } from "@/lib/icons";

// ---------- Maritime & Cruise Healthcare (the manager's copy, word for word) ----------
const CHIP_ICONS: IconName[] = ["hospital", "doctor", "ship", "anchor", "plane"];

export function Maritime() {
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: box, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);
  return (
    <section className="sec mar band-soft" aria-labelledby="mar-h">
      <div className="wrap mar-grid">
        <div className="mar-copy">
          <SectionHead id="mar-h" align="start" eyebrow={MARITIME.eyebrow} title={MARITIME.heading} />
          <Stagger className="mar-paras" gap={0.12}>
            {(MARITIME.paras as string[]).map((p) => <Item key={p}><p>{p}</p></Item>)}
          </Stagger>
          <Stagger as="ul" className="mar-chips" gap={0.06}>
            {(MARITIME.chips as string[]).map((c, i) => (
              <Item as="li" key={c}><Icon name={CHIP_ICONS[i]} size={18} />{c}</Item>
            ))}
          </Stagger>
          <Reveal>
            <a className="btn" href={href("/maritime-cruise-healthcare/")}>{MARITIME.cta}<Icon name="arrow" /></a>
          </Reveal>
        </div>
        <Reveal className="mar-media" ref={box}>
          <figure className="mar-main media">
            <motion.img style={{ y, scale: 1.12 }} src={asset("mar-deck")} alt="A medical team on the deck of a cruise ship at sea" loading="lazy" />
          </figure>
          <figure className="mar-sm media"><img src={asset("mar-consult")} alt="A ship doctor with a passenger in the onboard medical centre" loading="lazy" /></figure>
          <figure className="mar-sm media"><img src={asset("mar-clinic")} alt="An onboard medical clinic on a cruise ship" loading="lazy" /></figure>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Testimonials: video bento, Google card, moments row ----------
type Clip = { key: string; label: { text: string } };

function VideoTile({ clip, className, onWatch }: { clip: Clip; className: string; onWatch: (k: string) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (v.preload === "none") { v.preload = "auto"; v.load(); }
        v.play().catch(() => {});
      } else v.pause();
    }, { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);
  return (
    // reveals on its own: on desktop its slider wrapper is display: contents and has no box to observe
    <Item as="article" className={`vtile ${className}`} initial="hide" whileInView="show" viewport={{ once: true, margin: "100000px 0px -8% 0px" }}>
      <video ref={ref} src={file(`media/preview/${clip.key}-loop.mp4`)} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
      <span className="vtile-q" aria-hidden="true"><Icon name="quote" size={22} /></span>
      <button type="button" className="watch" onClick={() => onWatch(clip.key)}>
        <span className="pi" aria-hidden="true"><Icon name="play" size={16} /></span>
        <span>{TESTIMONIALS.watch.text}<span className="visually-hidden">: {clip.label.text}</span></span>
      </button>
    </Item>
  );
}

type Review = { name: string; text: string };

/** MedPark Health Hub's Google rating and real reviews, sliding on their own; pauses on hover and focus. */
function Reviews() {
  const R = TESTIMONIALS.reviews as { rating: string; count: string; url: string; items: Review[] };
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (hold || reduce) return;
    const t = setTimeout(() => setI((n) => (n + 1) % R.items.length), 6000);
    return () => clearTimeout(t);
  }, [i, hold, reduce, R.items.length]);
  const r = R.items[i];
  const fill = (Number(R.rating) / 5) * 100;
  return (
    <Reveal as="article" className="g-card" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      <div className="g-top">
        <svg className="g-mark" viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        <h3>{TESTIMONIALS.reviewsTitle.text}</h3>
      </div>
      <div className="g-score">
        <b>{R.rating}</b>
        <span className="g-stars" aria-label={`${R.rating} / 5`}>
          <span className="g-stars-bg">★★★★★</span>
          <span className="g-stars-fg" style={{ width: `${fill}%` }}>★★★★★</span>
        </span>
        <span className="g-count">({R.count})</span>
      </div>
      <div className="g-slide" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure key={i} className="g-review" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.5 }}>
            <blockquote><p>{r.text}</p></blockquote>
            <figcaption><span className="g-av" aria-hidden="true">{r.name.charAt(0)}</span>{r.name}</figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="g-foot">
        <div className="g-dots">
          {R.items.map((x, k) => (
            <button key={x.name} type="button" className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={x.name} aria-current={k === i} />
          ))}
        </div>
        <a className="g-link" href={R.url} target="_blank" rel="noopener">{TESTIMONIALS.reviewsLink.text}<Icon name="up" size={16} /></a>
      </div>
    </Reveal>
  );
}

export function Testimonials() {
  const clips = TESTIMONIALS.videos as Clip[];
  const moments = ["moment-itic-stage", "moment-itic-booth", "moment-eha", "moment-luxor", "moment-gha", "moment-panel", "moment-whd", "moment-hub", "moment-uca", "moment-signing"];
  const ALT: Record<string, string> = {
    "moment-itic-stage": "HCIG on stage at ITIC Global 2025 in Venice",
    "moment-itic-booth": "The HCIG team at ITIC",
    "moment-eha": "Strategic dialogue with the Egypt Healthcare Authority at Africa Health ExCon 2025",
    "moment-luxor": "TMASI GLOBAL with the Nordic and New Zealand consulates in Luxor",
    "moment-gha": "GHA visits to leading hospitals with HCIG",
    "moment-panel": "The HCIG panel at Africa Health ExCon 2025",
    "moment-whd": "24/7 Clinic and Hilton Hurghada Plaza on World Health Day",
    "moment-hub": "The opening of MEDPARK Health Hub in Hurghada",
    "moment-uca": "24/7 Clinics receive UCA accreditation in Chicago",
    "moment-signing": "An HCIG partnership signing",
  };
  const dlg = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const watch = (k: string) => { setPlaying(k); dlg.current?.showModal(); };
  const close = () => { dlg.current?.close(); setPlaying(null); };

  return (
    <section className="sec tst" aria-labelledby="tst-h">
      <div className="wrap">
        <SectionHead id="tst-h" title={TESTIMONIALS.heading.text} />
        <div className="tst-bento">
          <Rail className="tst-vids" label={TESTIMONIALS.heading.text} gap={0.1} nav="side">
            <VideoTile clip={clips[0]} className="t-a" onWatch={watch} />
            <VideoTile clip={clips[1]} className="t-b" onWatch={watch} />
            <VideoTile clip={clips[2]} className="t-c" onWatch={watch} />
          </Rail>
          <Reviews />
        </div>
      </div>
      <Reveal className="tst-moments">
        <p className="tst-moments-label">{TESTIMONIALS.momentsLabel.text}</p>
        <Marquee duration={70} label={TESTIMONIALS.momentsLabel.text}>
          {moments.map((k) => (
            <figure className="moment" key={k}><img src={asset(k)} alt={ALT[k]} loading="lazy" /></figure>
          ))}
        </Marquee>
      </Reveal>
      <dialog ref={dlg} className="lightbox" onClose={() => setPlaying(null)} onClick={(e) => { if (e.target === dlg.current) close(); }}>
        <button type="button" className="dlg-close" onClick={close} aria-label={UI.close.text}><Icon name="close" size={22} /></button>
        {playing ? <video src={asset(playing)} controls autoPlay playsInline /> : null}
      </dialog>
    </section>
  );
}

// ---------- CEO quote: the words light up as the reader scrolls ----------
function Word({ w, i, n, p }: { w: string; i: number; n: number; p: MotionValue<number> }) {
  const o = useTransform(p, [i / n, (i + 1) / n], [0.22, 1]);
  return <motion.span style={{ opacity: o }}>{w} </motion.span>;
}

export function CeoQuote() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "center 45%"] });
  const words = CEO.quote.split(" ");
  return (
    <section ref={ref} className="sec ceo" aria-label={`${CEO.name}, ${CEO.role}`}>
      <div className="wrap">
        <div className="ceo-band">
          <Watermark tone="light" />
          <figure className="ceo-copy">
            <span className="ceo-q" aria-hidden="true"><Icon name="quote" size={44} /></span>
            <blockquote className="ceo-text">
              <p aria-label={CEO.quote}>
                {reduce ? CEO.quote : words.map((w: string, i: number) => <Word key={i} w={w} i={i} n={words.length} p={scrollYProgress} />)}
              </p>
            </blockquote>
            <figcaption>
              <Reveal className="ceo-avatar"><img src={asset("ceo")} alt={CEO.name} loading="lazy" /></Reveal>
              <span><b>{CEO.name}</b><span>{CEO.role}</span></span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

// ---------- 100% Trusted by Global Insurance & Assistance Networks ----------
export function Insurers() {
  const logos = INSURERS.logos as string[];
  const tile = (name: string) => (
    <span className="logo-tile" key={name}><img src={asset("ins-" + slug(name))} alt={name} loading="lazy" /></span>
  );
  const tag = (INSURERS.tagline as string).split(". ").map((t, i, all) => (i < all.length - 1 ? t + "." : t));
  return (
    <section className="sec ins" aria-labelledby="ins-h">
      <div className="wrap">
        <SectionHead id="ins-h" title={INSURERS.title} lead={INSURERS.text} />
        <div className="ins-grid">
          <Reveal className="ins-copy">
            <p className="ins-stat"><CountUp to={100} />%</p>
            <p className="ins-tag">{tag.map((t) => <span key={t}>{t}</span>)}</p>
          </Reveal>
          <Reveal className="ins-logos" delay={120}>
            <Marquee duration={64}>{logos.slice(0, 12).map(tile)}</Marquee>
            <Marquee duration={72} reverse>{logos.slice(12).map(tile)}</Marquee>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------- Who We Work With ----------
export function WhoWeWorkWith() {
  const items = WHO.items as { title: string; text: string; path: string; icon: IconName }[];
  const [on, setOn] = useState(0);
  // phones (his pick W1, 2026-10-27): "choose your path", six rows; tapping a row opens its line, the arrow opens its page
  const pick = (i: number) => (e: React.MouseEvent) => {
    if (!matchMedia("(max-width: 760px)").matches || (e.target as Element).closest(".who-go")) return;
    e.preventDefault();
    setOn(i);
  };
  return (
    <section className="sec who band-soft" aria-labelledby="who-h">
      <div className="wrap">
        <SectionHead id="who-h" title={WHO.heading} lead={WHO.sub} />
        <Stagger className="who-grid" gap={0.07}>
          {items.map((x, i) => (
            <Item as="article" className={`card who-card${on === i ? " is-on" : ""}`} key={x.title} onClick={pick(i)}>
              <span className="ico" aria-hidden="true"><Icon name={x.icon} size={24} /></span>
              <h3><a href={href(x.path)} className="stretched" aria-expanded={on === i}>{x.title}</a></h3>
              <p>{x.text}</p>
              <a className="who-go" href={href(x.path)} aria-label={x.title} tabIndex={-1}><Icon name="arrow" size={20} /></a>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ---------- Our Impact ----------
const IMPACT_ICONS: IconName[] = ["hospital", "clock", "handshake", "users"];

export function Impact() {
  const items = IMPACT.items as { stat: string; text: string }[];
  return (
    <section className="sec impact" aria-labelledby="impact-h">
      <div className="wrap">
        <SectionHead id="impact-h" title={IMPACT.heading} />
        <Stagger as="ul" className="impact-row" gap={0.1}>
          {items.map((x, i) => {
            const n = /^(\d+)\+$/.exec(x.stat);
            return (
              <Item as="li" key={x.text}>
                <span className="impact-ico" aria-hidden="true"><Icon name={IMPACT_ICONS[i]} size={26} /></span>
                {x.stat ? <b className="impact-n">{n ? <><CountUp to={Number(n[1])} /><em>+</em></> : x.stat}</b> : null}
                <p>{x.text}</p>
              </Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

// ---------- Let's Build Healthcare Without Fragmentation + newsletter ----------
export function ClosingBand() {
  const [sent, setSent] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-10%", "10%"]);
  const words = (CTA.heading as string).split(" ");
  return (
    <section ref={ref} className="cta" aria-labelledby="cta-h">
      <div className="cta-card">
      <motion.img className="cta-bg" style={{ y }} src={asset("cta-bg")} alt="" loading="lazy" />
      <div className="cta-in">
        <SectionHead
          id="cta-h"
          tone="ink"
          align="start"
          title={<>{words.slice(0, 3).join(" ")} <span className="acc">{words.slice(3).join(" ")}</span></>}
          lead={CTA.text}
        />
        <Reveal className="ctas cta-btns">
          <a href={href("/partner/")} className="btn">{CTA.primary}<Icon name="arrow" /></a>
          <SheetLink className="btn2">{CTA.secondary}</SheetLink>
        </Reveal>
        <Reveal className="news" delay={120}>
          <form
            className={sent ? "sent" : ""}
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            aria-labelledby="news-l"
          >
            <p id="news-l" className="news-l">{CTA.newsletter.label.text}</p>
            {sent ? (
              <p className="news-done" role="status"><Icon name="check" size={18} />{UI.thanks.text}</p>
            ) : (
              <div className="news-row">
                <label className="visually-hidden" htmlFor="news-email">{CTA.newsletter.field.text}</label>
                <input id="news-email" type="email" required autoComplete="email" placeholder={CTA.newsletter.field.text} />
                <button type="submit" className="btn btn-sm">{CTA.newsletter.button.text}</button>
              </div>
            )}
            <p className="news-note">{CTA.newsletter.note.text}</p>
          </form>
        </Reveal>
      </div>
      </div>
    </section>
  );
}
