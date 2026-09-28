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
                .values-section { overflow: visible; padding-bottom: 60px; }
        .cv-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(20px, 2vw, 30px);
        }
        .cv-card { 
          position: relative; 
          padding: 32px 24px; 
          height: 100%; 
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid var(--lx-line);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .cv-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 20px 40px rgba(15, 32, 92, 0.12);
          border-color: var(--tmasi-teal);
          z-index: 10;
        }
        .cv-num {
          display: flex; align-items: center; justify-content: center;
          width: 48px; height: 48px; border-radius: 50%;
          background: var(--tmasi-teal); color: #ffffff;
          margin-bottom: 24px;
          font-family: var(--font-bignoodle), var(--font-montserrat), sans-serif; 
          font-size: 30px; font-variant-numeric: tabular-nums;
          line-height: 1; padding-top: 4px; /* offset for bignoodle */
        }
        .cv-title { margin: 0 0 12px; font-size: 19px; font-weight: 700; line-height: 1.35; color: var(--lx-ink); letter-spacing: -0.01em; }
        .cv-text { margin: 0; font-size: 15px; line-height: 1.7; color: var(--lx-body); }

        @media (max-width: 960px) {
          .cv-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
          .cv-grid { grid-template-columns: 1fr; }
          .cv-card { padding: 24px 20px; }
        }


      `}} />
    </section>
  );
}

