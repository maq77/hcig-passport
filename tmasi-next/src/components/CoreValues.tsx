"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { useSite } from "./site/SiteProvider";

// Words are the live tmasi.net Core Values in each language (a heading dash became a colon, as live).
type Values = { title: string; items: { n: string; title: string; text: string }[] };

export default function CoreValues({ content }: { content?: Values }) {
  const { live } = useSite();
  const v = content || live.home.values;
  return (
    <section className="values-section lx-section lx-white" id="values">
      <div className="lx-wrap">
        <Reveal>
          <SectionHead title={v.title} />
        </Reveal>

        <div className="cv-grid">
          {v.items.map((item, i) => (
            <Reveal key={item.n} delay={0.06 * i} className="cv-item">
              <div className="cv-card">
                <span className="cv-num" aria-hidden="true">{item.n}</span>
                <h3 className="cv-title">{item.title}</h3>
                <p className="cv-text">{item.text}</p>
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
          font-family: var(--font-display); 
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

