"use client";
// Mission & Vision, Why partners choose HCIG, Built for Global Healthcare Delivery, How Our System Works,
// Our Healthcare. Words from src/content/home.mjs only.
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BUILT, ECOSYSTEM, HEALTHCARE, MARITIME, MISSION, SYSTEM, UI, WHY, T } from "@/content/home.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import { SheetLink } from "@/components/ui/Sheet";
import { Rail } from "@/components/ui/Rail";
import { Ribbons, Watermark } from "@/components/ui/Brand";
import { DetailModal, useDetail } from "@/components/ui/DetailModal";
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
        <SectionHead id="mv-h" title={<>{T.mission} <span className="acc">&amp;</span> {T.vision}</>} />
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
// The page stays minimal: number, icon, title (his idea 2026-10-27); the full reason opens in the Why modal, a split
// card whose Dim Gray panel carries the number and a large hairline icon (the image slot for later).
// Phones (his pick Y2): a bento, the first reason as a dark lead card that keeps its text.
export function Why() {
  const items = WHY.items as Card[];
  const d = useDetail();
  return (
    <section className="sec why band-soft" aria-labelledby="why-h">
      <div className="wrap">
        <SectionHead id="why-h" title={WHY.heading} lead={WHY.sub} />
        <Stagger className="why-grid" gap={0.06}>
          {items.map((x, i) => (
            <Item as="article" className="card why-card tap-card" key={x.title} {...d.trigger(i)} aria-label={x.title}>
              <span className="why-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="ico" aria-hidden="true"><Icon name={x.icon} size={24} /></span>
              <h3>{x.title}</h3>
              <p className="why-text">{x.text}</p>
              <span className="tap-plus" aria-hidden="true"><Icon name="arrow" size={16} /></span>
            </Item>
          ))}
        </Stagger>
      </div>
      <DetailModal
        items={items} index={d.index} origin={d.origin} variant="why" section={WHY.heading}
        onIndex={d.setIndex} onClose={d.close}
        render={(x, i, nav) => (
          <div className="dmw">
            <div className="dmw-art" aria-hidden="true">
              <span className="dmw-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="dmw-ico"><Icon name={x.icon as IconName} size={120} /></span>
              <small>{WHY.heading}</small>
            </div>
            <div className="dmw-tx"><h3>{x.title}</h3><p>{x.text}</p>{nav}</div>
          </div>
        )}
      />
    </section>
  );
}

// ---------- Built for Global Healthcare Delivery ----------
// Minimal tiles (number, icon, title); the Built modal is image-led, the photo carrying the title (his pick).
// Phones (his pick A): a bento, a wide dark tile first and last; the closing line on two lines.
const BUILT_IMG = ["built-multilingual", "built-global", "built-insurance", "built-training", "built-hospitality", "built-operations"];
export function Built() {
  const items = (BUILT.items as Card[]).map((x, i) => ({ ...x, img: BUILT_IMG[i] }));
  const [a, c] = BUILT.closing.split(". ");
  const d = useDetail();
  return (
    <section className="sec built" aria-labelledby="built-h">
      <div className="wrap">
        <SectionHead id="built-h" title={BUILT.heading} lead={BUILT.sub} />
        <Stagger className="built-grid" gap={0.07}>
          {items.map((x, i) => (
            <Item as="article" className="card built-card tap-card" key={x.title} {...d.trigger(i)} aria-label={x.title}>
              <span className="built-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="ico" aria-hidden="true"><Icon name={x.icon} size={24} /></span>
              <h3>{x.title}</h3>
              <p className="built-text">{x.text}</p>
              <span className="tap-plus" aria-hidden="true"><Icon name="arrow" size={16} /></span>
            </Item>
          ))}
        </Stagger>
        <Reveal as="p" className="built-close">
          <span className="bc-a">{a}.</span> <span className="acc bc-b">{c}</span>
        </Reveal>
      </div>
      <DetailModal
        items={items} index={d.index} origin={d.origin} variant="built" section={BUILT.heading}
        onIndex={d.setIndex} onClose={d.close}
        render={(x, i, nav) => (
          <div className="dmb">
            <figure className="dmb-im">
              <img src={asset(x.img as string)} alt="" />
              <figcaption>
                <span className="dmb-chip" aria-hidden="true"><Icon name={x.icon as IconName} size={26} /></span>
                <h3>{x.title}</h3>
                <b aria-hidden="true">{String(i + 1).padStart(2, "0")}</b>
              </figcaption>
            </figure>
            <div className="dmb-bd"><p>{x.text}</p>{nav}</div>
          </div>
        )}
      />
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
  // phones (his pick, the clock): one service lights up at a time and its name shows under the ring; tap any icon
  const [act, setAct] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (reduce || hold) return;
    const t = setInterval(() => setAct((v) => (v + 1) % n), 2200);
    return () => clearInterval(t);
  }, [reduce, hold, n]);
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
                  <motion.li key={x.label} data-rv="" variants={FADE} className={act === i ? "is-act" : ""} onClick={() => { setAct(i); setHold(true); }} style={{ ["--a" as string]: `${(360 / n) * i}deg` }}>
                    <span className="node-ico" aria-hidden="true"><Icon name={x.icon} size={24} /></span>
                    <span className="node-label">{x.label}</span>
                  </motion.li>
                ))}
              </Stagger>
            </div>
            <p className="ring-pill" aria-live="polite"><Icon name={nodes[act].icon} size={16} />{nodes[act].label}</p>
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
// The cards show the photo and the title; the Care modal (his pick) sets the photo beside the text, a Read more to the
// service page, and the seven services as thumbnails. The service links stay real links for search engines.
export function OurHealthcare({ more = false }: { more?: boolean }) {
  // the eighth service (his pick 2026-10-27): Maritime & Cruise, in the manager's words, opening her page
  const maritime = { title: "Maritime & Cruise Healthcare", text: (MARITIME.paras as string[])[0], img: "mar-deck", path: "/maritime-cruise-healthcare/" };
  const items = [...(HEALTHCARE.items as { title: string; text: string; img: string; path: string }[]), maritime].map((x) => ({ ...x, href: href(x.path) }));
  const d = useDetail();
  return (
    <section className="sec care" aria-labelledby="care-h">
      <div className="wrap">
        <SectionHead id="care-h" title={HEALTHCARE.heading} lead={HEALTHCARE.sub} />
        <Stagger className="care-grid" gap={0.07}>
          {items.map((x, i) => (
            <Item as="article" className="care-card tap-card" key={x.title} {...d.trigger(i)} aria-label={x.title}>
              <figure className="media">
                <img src={asset(x.img)} alt="" loading="lazy" />
              </figure>
              <div className="care-body">
                <h3><a href={x.href} tabIndex={-1}>{x.title}</a></h3>
                <p className="care-text">{x.text}</p>
              </div>
              <span className="care-go" aria-hidden="true"><Icon name="arrow" size={16} /></span>
            </Item>
          ))}
        </Stagger>
        {more ? (
          <Reveal className="care-more">
            <a className="btn2 care-more-btn" href={href("/services/")}>{UI.ourServices.text}<Icon name="arrow" /></a>
          </Reveal>
        ) : null}
      </div>
      <DetailModal
        items={items} index={d.index} origin={d.origin} variant="care" section={HEALTHCARE.heading}
        onIndex={d.setIndex} onClose={d.close}
        render={(x, i, nav) => (
          <div className="dmc">
            <figure className="dmc-im"><img src={asset(x.img as string)} alt="" /></figure>
            <div className="dmc-tx">
              <small>{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</small>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              <div className="dmc-row"><a className="btn" href={x.href}>{UI.readMore.text}<Icon name="arrow" /></a>{nav}</div>
              <div className="dmc-thumbs">
                {items.map((y, k) => (
                  <button key={y.title} type="button" className={k === i ? "on" : ""} onClick={() => d.setIndex(k)} aria-label={y.title}>
                    <img src={asset(y.img)} alt="" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      />
    </section>
  );
}
