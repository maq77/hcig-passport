"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { useSite } from "./site/SiteProvider";
import { Heartbeat, HEARTBEAT_CSS } from "./About";
import ChipIcon from "./ChipIcon";
import { asset } from "@/lib/asset";

// Why Choose as a bento (approved on the design canvas 2026-10-06, an image made for each reason, so a visitor
// understands each one before reading). Desktop (design A): "One Call" as the big navy tile with the heartbeat,
// four smaller tiles, each led by its picture. Phone and tablet (design B): the picture of one reason on top and the
// five as a short list; it moves on by itself every few seconds while in view and stops once the visitor taps.
// Words are the live tmasi.net "Why Choose TMASI Global?" in each language, unchanged.
type Why = { title: string; items: { title: string; text: string; icon: string }[] };

const IMAGES = [
  "/img/bento/w1-onecall.webp", "/img/bento/w2-endtoend.webp", "/img/bento/w3-solving.webp",
  "/img/bento/w4-experience.webp", "/img/bento/w5-comprehensive.webp",
];
const STEP_MS = 5000;

export default function WhyChoose({ content }: { content?: Why }) {
  const { live } = useSite();
  const w = content || live.home.why;
  const n = w.items.length;
  const img = (i: number) => asset(IMAGES[i % IMAGES.length]);

  // Phone: the reason in front, moving on by itself until the visitor picks one.
  const phone = useRef<HTMLDivElement>(null);
  const inView = useInView(phone, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const running = auto && inView && !reduce;
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % n), STEP_MS);
    return () => window.clearTimeout(t);
  }, [running, active, n]);

  return (
    <section className="section-why lx-section lx-white" id="why">
      <div className="lx-wrap">
        <Reveal>
          <SectionHead title={w.title} />
        </Reveal>

        {/* Desktop: the bento. */}
        <Reveal type="fade" className="why-desk">
          <div className="why-bento">
            <article className="why-big rv-item">
              <Heartbeat />
              <div className="why-big-head">
                <span className="lx-chip why-chip-dark"><ChipIcon src={w.items[0].icon} /></span>
                <h3 className="why-big-title">{w.items[0].title}</h3>
              </div>
              <p className="why-big-text">{w.items[0].text}</p>
              <div className="why-big-img"><Image src={img(0)} alt="" fill sizes="560px" /></div>
            </article>
            {w.items.slice(1).map((r, k) => (
              <article key={r.title} className={`why-tile rv-item${k === 2 ? " why-tile--teal" : ""}`} style={{ "--i": k + 1 } as React.CSSProperties}>
                <div className="why-tile-img"><Image src={img(k + 1)} alt="" fill sizes="280px" /></div>
                <div className="why-tile-body">
                  <span className="lx-chip why-tile-chip"><ChipIcon src={r.icon} /></span>
                  <h3 className="why-tile-title">{r.title}</h3>
                  <p className="why-tile-text">{r.text}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        {/* Phone and tablet: the picture stage and the list. */}
        <Reveal type="fade" className="why-phone">
          <div ref={phone}>
            <div className="why-stage" aria-hidden="true">
              {w.items.map((r, i) => (
                <div key={r.title} className={`why-stage-img${i === active ? " is-on" : ""}`}>
                  <Image src={img(i)} alt="" fill sizes="(max-width: 960px) 100vw, 1px" />
                </div>
              ))}
            </div>
            <ul className="why-list">
              {w.items.map((r, i) => {
                const on = i === active;
                return (
                  <li key={r.title} className={`why-row${on ? " is-on" : ""}`}>
                    <button type="button" className="why-row-btn" aria-expanded={on} aria-controls={`why-p-${i}`}
                      onClick={() => { setActive(i); setAuto(false); }}>
                      <span className={`lx-chip why-row-chip${on ? " why-chip-dark" : ""}`}><ChipIcon src={r.icon} size={24} /></span>
                      <span className="why-row-title">{r.title}</span>
                    </button>
                    <div id={`why-p-${i}`} className="why-row-body" hidden={!on}>
                      <p>{r.text}</p>
                      {running && on && <span className="why-bar" aria-hidden="true"><i key={active} /></span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        ${HEARTBEAT_CSS}

        /* Phone first: the picture stage and the list. */
        .why-desk { display: none; }
        .why-stage { position: relative; aspect-ratio: 16 / 11; border-radius: var(--lx-radius); overflow: hidden; background: var(--lx-surface); margin-bottom: 12px; }
        .why-stage-img { position: absolute; inset: 0; opacity: 0; transition: opacity 0.5s var(--ease-out); }
        .why-stage-img.is-on { opacity: 1; }
        .why-stage-img img { object-fit: cover; }
        .why-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
        .why-row { border: 1px solid var(--lx-line); border-radius: var(--lx-radius); background: #ffffff; overflow: hidden;
          transition: background-color 0.35s var(--ease-out), border-color 0.35s var(--ease-out); }
        .why-row.is-on { background: var(--lx-ink); border-color: var(--lx-ink); }
        .why-row-btn { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 64px; padding: 8px 14px;
          background: none; border: 0; text-align: left; cursor: pointer; font: inherit; }
        /* The original icons (2026-10-06, his ask): navy in the light circle, light teal on the navy row and tile. */
        .why-row .why-row-chip { width: 44px; height: 44px; transition: background-color 0.35s var(--ease-out), color 0.35s var(--ease-out); }
        .why-chip-dark { background: rgba(255,255,255,0.14); color: var(--lx-teal-on-dark); }
        .why-row-title { font-size: 15.5px; font-weight: 700; line-height: 1.3; color: var(--lx-ink); letter-spacing: -0.01em; }
        .why-row.is-on .why-row-title { color: #ffffff; }
        .why-row-body { padding: 0 16px 16px; }
        .why-row-body p { margin: 0; font-size: 14.5px; line-height: 1.65; color: #ffffff; }
        .why-bar { display: block; height: 3px; margin-top: 14px; border-radius: 3px; background: rgba(255,255,255,0.25); overflow: hidden; }
        .why-bar i { display: block; height: 100%; width: 100%; background: var(--lx-teal-on-dark); transform-origin: left center;
          animation: why-progress ${STEP_MS}ms linear both; }
        @keyframes why-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }

        /* Desktop: the bento. */
        @media (min-width: 960px) {
          .why-phone { display: none; }
          .why-desk { display: block; }
          .why-bento { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
          .why-big {
            grid-column: 1 / 3; grid-row: 1 / 3; display: flex; flex-direction: column; padding: 32px;
            background: var(--lx-ink); border-radius: var(--lx-radius); color: #ffffff;
          }
          .why-big .about-band-signal { margin-bottom: 22px; }
          .why-big .about-ecg { width: 220px; height: 42px; }
          .why-big .about-band-phone { width: 52px; height: 52px; }
          .why-big-head { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
          .why-big-head .lx-chip { width: 52px; height: 52px; }
          .why-big-title { margin: 0; font-size: 28px; font-weight: 700; line-height: 1.25; letter-spacing: -0.015em; color: #ffffff; }
          .why-big-text { margin: 0; font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.88); }
          .why-big-img { position: relative; flex: 1; min-height: 240px; margin-top: 24px; border-radius: 12px; overflow: hidden; }
          .why-big-img img { object-fit: cover; }
          .why-tile { display: flex; flex-direction: column; overflow: hidden; background: #ffffff; border: 1px solid var(--lx-line); border-radius: var(--lx-radius); }
          .why-tile-img { position: relative; height: 150px; flex: none; background: var(--lx-surface); }
          .why-tile-img img { object-fit: cover; }
          .why-tile-body { position: relative; padding: 0 22px 24px; }
          /* The icon sits on the edge between the picture and the text. */
          .why-tile-chip { margin: -28px 0 12px; box-shadow: 0 0 0 4px #ffffff; }
          .why-tile--teal .why-tile-chip { box-shadow: 0 0 0 4px var(--lx-field); }
          .why-tile-title { margin: 0 0 8px; font-size: 17px; font-weight: 700; line-height: 1.3; color: var(--lx-ink); letter-spacing: -0.01em; }
          .why-tile-text { margin: 0; font-size: 14.5px; line-height: 1.65; color: var(--lx-body); }
          .why-tile--teal { background: var(--lx-field); border-color: var(--lx-field); }
          .why-tile--teal .why-tile-title, .why-tile--teal .why-tile-text { color: #ffffff; }
        }
        @media (prefers-reduced-motion: reduce) { .why-stage-img, .why-row { transition: none; } }
      `}} />
    </section>
  );
}
