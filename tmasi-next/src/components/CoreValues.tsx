"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { useSite } from "./site/SiteProvider";
import { asset } from "@/lib/asset";

// Core Values as a bento (approved on the design canvas 2026-10-06: design A, an image made for each value).
// Phone: a swipe row, one value per card (image, number, title, text) with dots. Tablet: two columns.
// Desktop: the first value as the big photo tile, the second split with its image, the third teal, the fourth navy.
// Each number fills with teal the first time its card is well in view. Words: the live Core Values, unchanged.
type Values = { title: string; items: { n: string; title: string; text: string }[] };

const IMAGES = ["/img/bento/v1-client.webp", "/img/bento/v2-integrity.webp", "/img/bento/v3-excellence.webp", "/img/bento/v4-global.webp"];

export default function CoreValues({ content }: { content?: Values }) {
  const { live } = useSite();
  const v = content || live.home.values;
  const row = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  // Light each number once its card is 60% in view (down the page, or swiped in on the phone row).
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).dataset.lit = "";
        io.unobserve(e.target);
      }
    }, { threshold: 0.6 });
    Array.from(el.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  // Phone row: which card is in front, for the dots.
  const onScroll = () => {
    const el = row.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    const i = Math.round(el.scrollLeft / (first.offsetWidth + 12));
    setActive(Math.max(0, Math.min(v.items.length - 1, i)));
  };

  return (
    <section className="values-section lx-section lx-white" id="values">
      <div className="lx-wrap">
        <Reveal>
          <SectionHead title={v.title} />
        </Reveal>

        <Reveal type="fade" className="cv-wrap">
          <ul className="cv-bento" ref={row} onScroll={onScroll}>
            {v.items.map((item, i) => (
              <li key={item.n} className={`cv-tile cv-tile--${i + 1} rv-item`} style={{ "--i": i } as React.CSSProperties}>
                <div className="cv-img">
                  <Image src={asset(IMAGES[i % IMAGES.length])} alt="" fill sizes="(max-width: 600px) 82vw, (max-width: 960px) 46vw, 560px" />
                </div>
                <div className="cv-body">
                  <span className="cv-num" aria-hidden="true">{item.n.padStart(2, "0")}</span>
                  <h3 className="cv-title">{item.title}</h3>
                  <p className="cv-text">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="cv-dots" aria-hidden="true">
            {v.items.map((item, i) => <i key={item.n} className={i === active ? "on" : ""} />)}
          </div>
        </Reveal>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* Phone first: a swipe row with the next card peeking in. */
        .cv-bento {
          list-style: none; margin: 0 calc(-1 * var(--lx-gutter)); padding: 0 var(--lx-gutter);
          display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding: 0 var(--lx-gutter);
          scrollbar-width: none; overscroll-behavior-x: contain;
        }
        .cv-bento::-webkit-scrollbar { display: none; }
        .cv-tile {
          position: relative; flex: 0 0 82%; scroll-snap-align: start; overflow: hidden; display: flex; flex-direction: column;
          background: #ffffff; border: 1px solid var(--lx-line); border-radius: var(--lx-radius);
        }
        .cv-img { position: relative; aspect-ratio: 4 / 3; background: var(--lx-surface); }
        .cv-img img { object-fit: cover; }
        .cv-body { position: relative; display: flex; flex-direction: column; padding: 18px 20px 22px; }
        .cv-num {
          display: block; font-family: var(--font-display); font-size: 46px; line-height: 0.8; letter-spacing: 0.01em;
          color: transparent; -webkit-text-stroke: 1.5px rgba(0,154,156,0.55); transition: color 0.6s var(--ease-out);
        }
        .cv-tile[data-lit] .cv-num { color: var(--tmasi-teal); }
        .cv-title { margin: 12px 0 8px; font-size: 17px; font-weight: 700; line-height: 1.3; color: var(--lx-ink); letter-spacing: -0.01em; }
        .cv-text { margin: 0; font-size: 14.5px; line-height: 1.65; color: var(--lx-body); }
        .cv-dots { display: flex; justify-content: center; gap: 6px; margin-top: 18px; }
        .cv-dots i { width: 6px; height: 6px; border-radius: 3px; background: #C9D3E0; transition: width 0.3s var(--ease-out), background-color 0.3s var(--ease-out); }
        .cv-dots i.on { width: 22px; background: var(--lx-ink); }

        /* Tablet: two columns, no swipe. */
        @media (min-width: 600px) {
          .cv-bento { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; overflow: visible; margin: 0; padding: 0; }
          .cv-dots { display: none; }
        }

        /* Desktop: the bento. */
        @media (min-width: 960px) {
          .cv-bento { grid-template-columns: repeat(4, minmax(0, 1fr)); grid-template-rows: minmax(310px, auto) minmax(410px, auto); }
          .cv-tile--1 { grid-column: 1 / 3; grid-row: 1 / 3; border: none; background: #081133; }
          .cv-tile--1 .cv-img { position: absolute; inset: 0; aspect-ratio: auto; }
          .cv-tile--1 .cv-img::after {
            content: ""; position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(15,32,92,0.05) 0%, rgba(15,32,92,0.2) 38%, rgba(15,32,92,0.86) 100%);
          }
          .cv-tile--1 .cv-body { margin-top: auto; padding: 32px; }
          .cv-tile--1 .cv-num { font-size: 150px; }
          .cv-tile--1 .cv-title { font-size: 28px; margin-top: 16px; }
          .cv-tile--1 .cv-text { font-size: 16px; }
          .cv-tile--2 { grid-column: 3 / 5; grid-row: 1; flex-direction: row-reverse; }
          .cv-tile--2 .cv-img { flex: 1; aspect-ratio: auto; }
          .cv-tile--2 .cv-body { flex: 1; padding: 28px; }
          .cv-tile--2 .cv-num { font-size: 84px; }
          .cv-tile--2 .cv-title { margin-top: auto; padding-top: 14px; }
          .cv-tile--3 { grid-column: 3; grid-row: 2; background: var(--lx-field); border-color: var(--lx-field); }
          .cv-tile--4 { grid-column: 4; grid-row: 2; background: var(--lx-ink); border-color: var(--lx-ink); }
          .cv-tile--3 .cv-img, .cv-tile--4 .cv-img { aspect-ratio: auto; height: 150px; flex: none; }
          .cv-tile--3 .cv-body, .cv-tile--4 .cv-body { padding: 20px 24px 24px; }
          .cv-tile--3 .cv-num, .cv-tile--4 .cv-num { font-size: 40px; }
          /* Words on the photo, teal and navy tiles are white; their numbers use the light teal. */
          .cv-tile--1 .cv-title, .cv-tile--3 .cv-title, .cv-tile--4 .cv-title { color: #ffffff; }
          .cv-tile--1 .cv-text, .cv-tile--3 .cv-text, .cv-tile--4 .cv-text { color: #ffffff; }
          .cv-tile--1 .cv-num, .cv-tile--3 .cv-num, .cv-tile--4 .cv-num { -webkit-text-stroke-color: rgba(127,224,225,0.65); }
          .cv-tile--1[data-lit] .cv-num, .cv-tile--3[data-lit] .cv-num, .cv-tile--4[data-lit] .cv-num { color: var(--lx-teal-on-dark); }
        }
        @media (prefers-reduced-motion: reduce) { .cv-num, .cv-dots i { transition: none; } }
      `}} />
    </section>
  );
}
