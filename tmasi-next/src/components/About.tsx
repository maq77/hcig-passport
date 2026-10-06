"use client";

import Image from "next/image";
import { useInView, useReducedMotion } from "framer-motion";
import { Globe, HeartPulse, Phone, Users } from "lucide-react";
import { useRef } from "react";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import { useSite } from "./site/SiteProvider";
import { asset } from "@/lib/asset";

// About Us, as approved on the design canvas (2026-09-30, "hybrid"): the slogan on a photo band with the
// heartbeat line from the logo running into a phone, the three short lines as icon columns, and the paragraph
// with the numbers in one panel. Used on the home (compact panel) and on the About Us page (larger numbers).
// Every word is the live tmasi.net text in each language, unchanged. Stat labels approved 2026-09-28.

const FACT_ICONS = [HeartPulse, Globe, Users];
const ECG = "M0 28H128L140 6L154 50L168 12L178 28H300";

/** The slogan on two lines, split after its first sentence ("Your Care." / "One Call Away."). */
function sloganLines(s: string) {
  const i = s.search(/\.\s/);
  return i < 0 ? [s] : [s.slice(0, i + 1), s.slice(i + 2)];
}

/** The heartbeat: the line draws in once, then a pulse runs along it into the phone, again and again, only
 *  while the band is on screen. Visitors who ask for less motion see the still line. Plain CSS since 2026-10-05
 *  (stroke-dash animations on a path of length 1), so it costs no JavaScript per frame. */
function Heartbeat() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, { amount: 0.5 });
  const reduce = useReducedMotion();
  const beat = live && !reduce;
  return (
    <div ref={ref} className={`about-band-signal${live ? " is-drawn" : ""}${beat ? " is-beating" : ""}`} aria-hidden="true">
      <svg className="about-ecg" viewBox="0 0 300 56" fill="none">
        <path d={ECG} pathLength={1} className="about-ecg-line" stroke="rgba(255,255,255,0.85)" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d={ECG} pathLength={1} className="about-ecg-pulse" stroke="#ffffff" strokeWidth="4"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="about-band-phone"><Phone size={26} /></span>
    </div>
  );
}

export function AboutIntro({ statement, facts, body, size }: {
  statement: string; facts: string[]; body: string; size: "compact" | "large";
}) {
  const { lang, ui } = useSite();
  const long = statement.length > 34; // Polish runs to two long lines: set a size smaller
  return (
    <>
      <Reveal delay={0.06}>
        <div className="about-band">
          <div className="about-band-photo">
            <Image src={asset("/img/about-band-headset.webp")} alt="" fill sizes="(max-width: 900px) 100vw, 720px" className="about-band-img" />
          </div>
          <div className="about-band-copy">
            <Heartbeat />
            <p className={`about-slogan${long ? " about-slogan--long" : ""}`}>
              {sloganLines(statement).map((line, i) => <span key={i}>{line}</span>)}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <ul className="about-facts">
          {facts.map((line, i) => {
            const Icon = FACT_ICONS[i % FACT_ICONS.length];
            return (
              <li key={i}>
                <span className="lx-chip" aria-hidden="true"><Icon size={26} /></span>
                <p>{line}</p>
              </li>
            );
          })}
        </ul>
      </Reveal>

      <Reveal delay={0.14}>
        <div className={`about-panel about-panel--${size}`}>
          <p className="about-body">{body}</p>
          <dl className="about-stats">
            <div className="about-stat">
              <dt>{ui.stats[0]}</dt>
              <dd className="about-stat-num"><CountUp end={30000} suffix="+" locale={lang} /></dd>
            </div>
            <div className="about-stat">
              <dt>{ui.stats[1]}</dt>
              <dd className="about-stat-num"><CountUp end={570} suffix="+" locale={lang} /></dd>
            </div>
            <div className="about-stat">
              <dt>{ui.stats[2]}</dt>
              <dd className="about-stat-num">24/7</dd>
            </div>
            <div className="about-stat">
              <dt>{ui.stats[3]}</dt>
              <dd className="about-stat-num"><CountUp end={5} locale={lang} /></dd>
            </div>
          </dl>
        </div>
      </Reveal>
      <AboutStyles />
    </>
  );
}

export default function About() {
  const { live } = useSite();
  const a = live.home.about;
  return (
    <section className="section-about lx-section lx-white" id="about">
      <div className="lx-wrap">
        <Reveal>
          <div className="lx-head">
            <h2 className="lx-title">{a.eyebrow}</h2>
          </div>
        </Reveal>
        <AboutIntro statement={a.statement} facts={a.lead} body={a.body} size="compact" />
      </div>
    </section>
  );
}

function AboutStyles() {
  return (
    <style dangerouslySetInnerHTML={{__html: `
      .section-about .lx-head { margin-bottom: 0; }

      /* The slogan band (design rules 2026-10-01): the words on the one teal field, the photo shown clean in the
         right half with a straight edge, no fade (white text on the field 4.5:1). */
      .about-band {
        position: relative; min-height: 340px; margin-top: clamp(28px, 3.2vw, 44px);
        border-radius: var(--lx-radius-lg); overflow: hidden; background: var(--lx-field);
        display: flex; align-items: center;
      }
      .about-band-photo { position: absolute; top: 0; bottom: 0; right: 0; left: 50%; }
      .about-band-img { object-fit: cover; object-position: center 30%; }
      .about-band-copy {
        position: relative; z-index: 1; width: 50%; box-sizing: border-box; padding: 48px clamp(32px, 4.4vw, 64px);
        display: flex; flex-direction: column; gap: 22px;
      }
      .about-band-signal { display: flex; align-items: center; gap: 14px; }
      .about-ecg { width: 300px; height: 56px; flex: none; overflow: visible; }
      /* Draw-in once, then a short bright stretch runs along the line every 2.4s while the band is on screen. */
      .about-ecg-line { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1); }
      .is-drawn .about-ecg-line { stroke-dashoffset: 0; }
      .about-ecg-pulse { stroke-dasharray: 0.14 0.86; stroke-dashoffset: 0; opacity: 0; filter: drop-shadow(0 0 6px rgba(255,255,255,0.9)); }
      .is-beating .about-ecg-pulse { animation: ecg-move 2.4s 1.2s infinite, ecg-fade 2.4s 1.2s infinite; }
      @keyframes ecg-move { 0% { stroke-dashoffset: 0; animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1); } 66.7%, 100% { stroke-dashoffset: -0.86; } }
      @keyframes ecg-fade { 0% { opacity: 0; } 22%, 44% { opacity: 1; } 66.7%, 100% { opacity: 0; } }
      @media (prefers-reduced-motion: reduce) {
        .about-ecg-line { stroke-dashoffset: 0; transition: none; }
        .about-ecg-pulse { display: none; }
      }
      .about-band-phone {
        position: relative; width: 60px; height: 60px; flex: none; border-radius: 50%; background: #ffffff;
        color: var(--tmasi-teal); display: flex; align-items: center; justify-content: center;
      }
      /* The phone answers each beat with a soft ring, only while the band is on screen. */
      .about-band-phone::after {
        content: ""; position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(255,255,255,0.9);
        opacity: 0; pointer-events: none;
      }
      .is-beating .about-band-phone::after { animation: about-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) 2.6s infinite; }
      @keyframes about-ring {
        0%, 55% { transform: scale(1); opacity: 0; }
        62% { opacity: 0.9; }
        100% { transform: scale(1.7); opacity: 0; }
      }
      .about-slogan {
        margin: 0; color: #ffffff; font-family: var(--font-display); font-weight: 400; text-transform: uppercase;
        font-size: clamp(44px, 5vw, 72px); line-height: 0.94; letter-spacing: 0.02em;
      }
      .about-slogan span { display: block; }
      .about-slogan--long { font-size: clamp(34px, 3.8vw, 54px); line-height: 1; }

      /* The three short lines as icon columns. */
      .about-facts {
        list-style: none; margin: clamp(40px, 4.5vw, 56px) 0 0; padding: 0;
        display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .about-facts li {
        display: flex; flex-direction: column; align-items: center; gap: 18px;
        padding: 8px clamp(20px, 2.6vw, 36px); text-align: center;
      }
      .about-facts li + li { border-left: 1px solid var(--lx-line); }
      .about-facts p { margin: 0; color: var(--lx-ink); font-weight: 600; font-size: clamp(16px, 1.3vw, 18px); line-height: 1.6; }

      /* The paragraph and the numbers. Home: one compact panel (2026-09-30). About Us page: larger. */
      .about-panel { margin-top: clamp(36px, 4vw, 48px); background: var(--lx-surface); }
      .about-panel--compact {
        padding: 30px 40px; border-radius: var(--lx-radius);
        display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 40px; align-items: center;
      }
      .about-panel--large { padding: 52px 64px 56px; border-radius: var(--lx-radius); text-align: center; }
      .about-body { margin: 0; color: var(--lx-body); font-size: 15.5px; line-height: 1.7; }
      .about-panel--large .about-body { max-width: 760px; margin: 0 auto 40px; font-size: clamp(16px, 1.3vw, 18px); line-height: 1.75; }
      .about-stats { margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
      /* Number on top, label under it (the label comes first for screen readers). Pinned to the top so the
         four numbers share one line even when a label wraps to two. */
      .about-stat {
        display: flex; flex-direction: column-reverse; justify-content: flex-end; align-items: center; gap: 8px;
        padding: 4px 12px; text-align: center;
      }
      .about-stat + .about-stat { border-left: 1px solid var(--lx-line); }
      .about-stat dt { color: var(--lx-muted); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
      .about-stat-num {
        margin: 0; line-height: 1; color: var(--tmasi-teal); font-family: var(--font-display);
        font-size: 44px; letter-spacing: 0.01em; font-variant-numeric: tabular-nums;
      }
      /* The counting numbers render inside CountUp's own box; make it follow this panel exactly, so
         "24/7" (plain text) and the counters share one line. */
      .about-stat-num .metric-number { font: inherit; line-height: inherit; letter-spacing: inherit; color: inherit; margin: 0; }
      .about-panel--large .about-stat { gap: 12px; }
      .about-panel--large .about-stat-num { font-size: clamp(48px, 4.6vw, 64px); }
      .about-panel--large .about-stat dt { font-size: 12px; letter-spacing: 0.18em; }

      @media (max-width: 900px) {
        /* Phones: the photo on top, the words on the teal field under it, a straight edge between. */
        .about-band { min-height: 0; flex-direction: column; align-items: stretch; }
        .about-band-photo { position: relative; left: auto; aspect-ratio: 16 / 10; }
        .about-band-img { object-position: 72% 22%; }
        .about-band-copy { width: auto; padding: 22px 22px 26px; gap: 14px; }
        .about-ecg { width: 150px; height: 28px; }
        .about-band-phone { width: 46px; height: 46px; }
        .about-slogan { font-size: clamp(36px, 11.5vw, 46px); }
        /* German, Polish, Spanish on phones: 38px (approved on the canvas 2026-10-04), three lines down to 360px wide. */
        .about-slogan--long { font-size: clamp(30px, 10.6vw, 38px); line-height: 0.96; }

        .about-facts { grid-template-columns: 1fr; margin-top: 32px; }
        .about-facts li {
          flex-direction: row; align-items: flex-start; gap: 16px; padding: 18px 0; text-align: left;
          border-top: 1px solid var(--lx-line);
        }
        .about-facts li + li { border-left: none; }
        .about-facts p { font-size: 16px; line-height: 1.55; }

        .about-panel--compact, .about-panel--large {
          display: block; padding: 20px 16px; margin-top: 24px;
        }
        .about-body, .about-panel--large .about-body { text-align: center; font-size: 14.5px; line-height: 1.65; margin: 0 0 12px; }
        .about-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .about-stat { padding: 12px 6px; gap: 6px; }
        .about-stat:nth-child(3) { border-left: none; }
        .about-stat:nth-child(n+3) { border-top: 1px solid var(--lx-line); }
        .about-stat-num, .about-panel--large .about-stat-num { font-size: 34px; }
        .about-stat dt, .about-panel--large .about-stat dt { font-size: 10.5px; letter-spacing: 0.12em; }
        .about-panel--large .about-stat-num { font-size: 40px; }
      }
    `}} />
  );
}
