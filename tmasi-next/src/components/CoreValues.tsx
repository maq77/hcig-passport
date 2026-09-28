"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

// Words are the live tmasi.net Core Values, unchanged (the dash in the heading became a colon, as on the live site).
const VALUES = [
  { n: "1", title: "Client-Centered", text: "We prioritize the safety, comfort, and needs of every patient and traveler." },
  { n: "2", title: "Integrity & Transparency", text: "We provide honest, clear, and ethical guidance throughout the journey." },
  { n: "3", title: "Excellence & Reliability", text: "We deliver seamless, high-quality assistance and dependable support." },
  { n: "4", title: "Global Collaboration & Respect", text: "We build strong international partnerships and honor cultural diversity." },
];

export default function CoreValues() {
  return (
    <section className="values-section lx-section lx-white" id="values">
      <div className="lx-wrap">
        <Reveal>
          <SectionHead title="TMASI Global: Core Values" />
        </Reveal>

        <div className="cv-grid">
          {VALUES.map((v, i) => (
            <Reveal key={v.n} delay={0.06 * i} className="cv-item">
              <div className="cv-card">
                <span className="cv-num" aria-hidden="true">{v.n}</span>
                <h3 className="cv-title">{v.title}</h3>
                <p className="cv-text">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .values-section { overflow: visible; }
        /* Open columns: a hairline on top, a teal accent where the number sits. No boxes. */
        .cv-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(24px, 3vw, 48px);
        }
        .cv-card { position: relative; padding-top: 28px; border-top: 1px solid var(--lx-line); height: 100%; }
        .cv-card::before {
          content: ""; position: absolute; top: -1px; left: 0; width: 40px; height: 2px; background: var(--tmasi-teal);
        }
        .cv-num {
          display: block; line-height: 1; margin-bottom: 18px; color: var(--tmasi-teal);
          font-family: var(--font-bignoodle), var(--font-montserrat), sans-serif; font-size: 44px;
          font-variant-numeric: tabular-nums;
        }
        .cv-title { margin: 0 0 10px; font-size: 18px; font-weight: 700; line-height: 1.35; color: var(--lx-ink); letter-spacing: -0.01em; }
        .cv-text { margin: 0; font-size: 15px; line-height: 1.7; color: var(--lx-body); }

        @media (max-width: 960px) {
          .cv-grid { grid-template-columns: repeat(2, 1fr); row-gap: 40px; }
        }
        @media (max-width: 520px) {
          .cv-grid { column-gap: 18px; row-gap: 32px; }
          .cv-card { padding-top: 20px; }
          .cv-num { font-size: 34px; margin-bottom: 12px; }
          .cv-title { font-size: 15.5px; }
          .cv-text { font-size: 14px; line-height: 1.6; }
        }
      `}} />
    </section>
  );
}
