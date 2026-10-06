"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { useSite } from "./site/SiteProvider";
import ChipIcon from "./ChipIcon";

// Words are the live tmasi.net "Why Choose TMASI Global?" in each language, unchanged.
type Why = { title: string; items: { title: string; text: string; icon: string }[] };

export default function WhyChoose({ content }: { content?: Why }) {
  const { live } = useSite();
  const w = content || live.home.why;
  return (
    <section className="section-why lx-section lx-white" id="why">
      <div className="lx-wrap">
        <Reveal>
          <SectionHead title={w.title} />
        </Reveal>

        {/* Five reasons in one row, divided by hairlines: everything visible at a glance. */}
        <div className="why-row">
          {w.items.map((r, i) => (
            <Reveal key={r.title} delay={0.05 * i} className="why-cell">
              <span className="lx-chip why-icon"><ChipIcon src={r.icon} /></span>
              <div>
                <h3 className="why-title">{r.title}</h3>
                <p className="why-text">{r.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .section-why { overflow: visible; }
        .why-row {
          display: grid; grid-template-columns: repeat(5, 1fr);
          border-top: 1px solid var(--lx-line); border-bottom: 1px solid var(--lx-line);
        }
        .why-cell { padding: clamp(28px, 2.6vw, 40px) clamp(16px, 1.6vw, 24px); text-align: left; }
        .why-cell + .why-cell { border-left: 1px solid var(--lx-line); }
        .why-icon { margin: 0 0 20px; }
        .why-title { margin: 0 0 10px; font-size: 16.5px; font-weight: 700; line-height: 1.35; color: var(--lx-ink); letter-spacing: -0.01em; }
        .why-text { margin: 0; font-size: 14.5px; line-height: 1.7; color: var(--lx-body); }

        /* Tablet: three over two, the short row centred. */
        @media (max-width: 1080px) {
          .why-row { grid-template-columns: repeat(6, 1fr); border-bottom: none; }
          .why-cell { grid-column: span 2; border-bottom: 1px solid var(--lx-line); }
          .why-cell:nth-child(4) { grid-column: 2 / span 2; }
          .why-cell:nth-child(4), .why-cell:nth-child(1) { border-left: none; }
        }
        /* Phone: compact rows, icon beside the text. */
        @media (max-width: 680px) {
          .why-row { grid-template-columns: 1fr; border-bottom: none; }
          .why-cell, .why-cell:nth-child(4) {
            grid-column: auto; display: flex; gap: 16px; align-items: flex-start; text-align: left;
            padding: 22px 0; border-left: none !important;
          }
          .why-icon { margin: 0; }
          .why-title { font-size: 16px; margin-bottom: 6px; }
          .why-text { font-size: 14px; line-height: 1.65; }
        }
      `}} />
    </section>
  );
}
