"use client";
// Mission & Vision, Why partners choose HCIG, Built for Global Healthcare Delivery, How Our System Works,
// Our Healthcare. Words from src/content/home.mjs only.
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { BUILT, ECOSYSTEM, HEALTHCARE, MISSION, SYSTEM, UI, WHY } from "@/content/home.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import { SheetLink } from "@/components/ui/Sheet";
import { Rail } from "@/components/ui/Rail";
import { Ribbons, Watermark } from "@/components/ui/Brand";
import type { IconName } from "@/lib/icons";

type Card = { title: string; text: string; icon: IconName };
const FADE = { hide: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.7 } } };

/** Long text shows three lines, then opens on tap. The full text is always in the page. */
function Clamp({ text, className = "" }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <p className={`clamp${open ? " open" : ""} ${className}`}>{text}</p>
      <button type="button" className="more-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{open ? UI.readLess.text : UI.readMore.text}</span>
        <Icon name="chevron" size={16} className={open ? "flip" : ""} />
      </button>
    </>
  );
}

// ---------- Mission & Vision (his title; the two cards keep the live headings; checks instead of dashes) ----------
export function MissionVision() {
  const cards = [MISSION.mission, MISSION.vision] as { heading: string; paras: string[] }[];
  return (
    <section className="sec mv" aria-labelledby="mv-h">
      <Ribbons />
      <div className="wrap">
        <SectionHead id="mv-h" title={<>Mission <span className="acc">&amp;</span> Vision</>} />
        <Stagger className="mv-grid" gap={0.14}>
          {cards.map((c, i) => (
            <Item as="article" className={`mv-card${i ? " mv-vision" : ""}`} key={c.heading}>
              {i ? <Watermark /> : null}
              <span className="mv-badge" aria-hidden="true"><Icon name={i ? "globe" : "standard"} size={26} /></span>
              <h3 className="h3d">{c.heading}</h3>
              <ul className="mv-list">
                {c.paras.map((p) => (
                  <li key={p}><span className="mv-check" aria-hidden="true"><Icon name="check" size={14} /></span><span>{p}</span></li>
                ))}
              </ul>
            </Item>
          ))}
        </Stagger>
        <Reveal className="mv-cta">
          <SheetLink className="btn">{MISSION.cta}<Icon name="arrow" /></SheetLink>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Why partners choose HCIG ----------
// Phones (his pick Y2, 2026-10-27): no slider; a bento with the first reason as a dark lead card with its text and the
// six others in a 2 x 3 grid of numbered cards; tapping one shows its text under the grid. Desktop keeps the full cards.
export function Why() {
  const items = WHY.items as Card[];
  const [on, setOn] = useState(1);
  return (
    <section className="sec why band-soft" aria-labelledby="why-h">
      <div className="wrap">
        <SectionHead id="why-h" title={WHY.heading} lead={WHY.sub} />
        <Stagger className="why-grid" gap={0.06}>
          {items.map((x, i) => (
            <Item as="article" className={`card why-card${on === i ? " is-on" : ""}`} key={x.title} onClick={() => { if (i) setOn(i); }}>
              <span className="why-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="ico" aria-hidden="true"><Icon name={x.icon} size={24} /></span>
              <h3>{x.title}</h3>
              {x.text.length > 140 ? <Clamp text={x.text} className="why-text" /> : <p className="why-text">{x.text}</p>}
            </Item>
          ))}
        </Stagger>
        <p className="why-open" aria-live="polite"><b>{items[on].title}</b>{items[on].text}</p>
      </div>
    </section>
  );
}

// ---------- Built for Global Healthcare Delivery ----------
// Phones (his pick B1, then "minimal" 2026-10-27): icon tiles in two rows that slide on their own, tap shows the text.
export function Built() {
  const items = BUILT.items as Card[];
  const [a, c] = BUILT.closing.split(". ");
  const [on, setOn] = useState(0);
  return (
    <section className="sec built" aria-labelledby="built-h">
      <div className="wrap">
        <SectionHead id="built-h" title={BUILT.heading} lead={BUILT.sub} />
        <Rail className="built-grid" label={BUILT.heading} rows={2} auto={4200}>
          {items.map((x, i) => (
            <Item as="article" className={`card built-card${on === i ? " is-on" : ""}`} key={x.title} onClick={() => setOn(i)}>
              <span className="built-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="ico" aria-hidden="true"><Icon name={x.icon} size={24} /></span>
              <h3>{x.title}</h3>
              <p className="built-text">{x.text}</p>
            </Item>
          ))}
        </Rail>
        <p className="built-open" aria-live="polite"><b>{items[on].title}</b>{items[on].text}</p>
        <Reveal as="p" className="built-close">
          {a}. <span className="acc">{c}</span>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- How Our System Works: the traveller at the centre + the six steps ----------
export function SystemWorks() {
  const nodes = ECOSYSTEM.nodes as { label: string; icon: IconName }[];
  const steps = SYSTEM.steps as { n: string; title: string; text: string }[];
  const ring = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ring, offset: ["start end", "end start"] });
  const spin = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const stepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepsP } = useScroll({ target: stepsRef, offset: ["start 75%", "end 60%"] });
  const fill = useTransform(stepsP, [0, 1], [reduce ? 1 : 0, 1]);
  const n = nodes.length;
  return (
    <section className="sec eco band-soft" aria-labelledby="eco-h">
      <div className="wrap">
        <SectionHead id="eco-h" title={SYSTEM.heading} />
        <div className="eco-grid">
          <Reveal className="eco-visual">
            <div className="eco-ring" ref={ring}>
              <svg className="ring-orbit" viewBox="0 0 600 600" aria-hidden="true">
                <circle className="orb" cx="300" cy="300" r="250" />
                <circle className="orb-run" cx="300" cy="300" r="250" />
                <motion.circle className="orb-inner" cx="300" cy="300" r="160" style={{ rotate: spin, originX: "300px", originY: "300px" }} />
              </svg>
              <div className="ring-centre">
                <span className="tv" aria-hidden="true"><Icon name="traveller" size={34} /></span>
                <strong>{ECOSYSTEM.centre.text}</strong>
                <small>{ECOSYSTEM.centreSub.text}</small>
              </div>
              <Stagger as="ul" className="ring-nodes" gap={0.06}>
                {nodes.map((x, i) => (
                  // opacity only: each node's place on the ring is a CSS transform
                  <motion.li key={x.label} data-rv="" variants={FADE} style={{ ["--a" as string]: `${(360 / n) * i}deg` }}>
                    <span className="node-ico" aria-hidden="true"><Icon name={x.icon} size={24} /></span>
                    <span className="node-label">{x.label}</span>
                  </motion.li>
                ))}
              </Stagger>
            </div>
            <p className="eco-tagline">{ECOSYSTEM.tagline.text}</p>
          </Reveal>
          {/* phones (his pick): a journey line that fills with turquoise as the reader scrolls the steps */}
          <div className="steps-wrap" ref={stepsRef}>
          <motion.span className="steps-fill" aria-hidden="true" style={{ scaleY: fill }} />
          <Stagger as="ol" className="steps" gap={0.1}>
            {steps.map((s) => (
              <Item as="li" key={s.n}>
                <span className="step-n" aria-hidden="true">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </Item>
            ))}
          </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Our Healthcare: seven image cards ----------
export function OurHealthcare() {
  const items = HEALTHCARE.items as { title: string; text: string; img: string; path: string }[];
  return (
    <section className="sec care" aria-labelledby="care-h">
      <div className="wrap">
        <SectionHead id="care-h" title={HEALTHCARE.heading} lead={HEALTHCARE.sub} />
        <Stagger className="care-grid" gap={0.07}>
          {items.map((x) => (
            <Item as="article" className="care-card" key={x.title}>
              <figure className="media">
                <img src={asset(x.img)} alt="" loading="lazy" />
              </figure>
              <div className="care-body">
                <h3><a href={href(x.path)}>{x.title}<Icon name="arrow" size={18} /></a></h3>
                <Clamp text={x.text} />
              </div>
              <a className="care-go" href={href(x.path)} tabIndex={-1} aria-hidden="true"><Icon name="up" size={16} /></a>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
