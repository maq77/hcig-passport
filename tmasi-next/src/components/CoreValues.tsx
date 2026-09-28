"use client";

import Reveal from "./Reveal";

export default function CoreValues() {
  return (
    <section className="values-section" id="values">
      <div className="values-container">
        <Reveal>
          <h2 className="section-hero-heading center headline-titling">
            TMASI Global: Core Values
          </h2>
        </Reveal>

        <div className="values-list">
          <Reveal delay={0.06} className="values-item">
            <div className="values-number">1</div>
            <h3 className="values-title">Client-Centered</h3>
            <p className="values-description">
              We prioritize the safety, comfort, and needs of every patient and traveler.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="values-item">
            <div className="values-number">2</div>
            <h3 className="values-title">Integrity &amp; Transparency</h3>
            <p className="values-description">
              We provide honest, clear, and ethical guidance throughout the journey.
            </p>
          </Reveal>

          <Reveal delay={0.18} className="values-item">
            <div className="values-number">3</div>
            <h3 className="values-title">Excellence &amp; Reliability</h3>
            <p className="values-description">
              We deliver seamless, high-quality assistance and dependable support.
            </p>
          </Reveal>

          <Reveal delay={0.24} className="values-item">
            <div className="values-number">4</div>
            <h3 className="values-title">Global Collaboration &amp; Respect</h3>
            <p className="values-description">
              We build strong international partnerships and honor cultural diversity.
            </p>
          </Reveal>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .values-list {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px;
          }
          .values-item {
            padding: 20px 16px !important;
          }
          .values-title {
            font-size: 15px !important;
          }
          .values-description {
            font-size: 13px !important;
          }
          .values-number {
            font-size: 24px !important;
            margin-bottom: 12px !important;
          }
        }
      `}} />
    </section>
  );
}
