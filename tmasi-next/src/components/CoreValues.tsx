"use client";

import Reveal from "./Reveal";

export default function CoreValues() {
  return (
    <section className="values-section" id="values" style={{ position: "relative", overflow: "hidden", zIndex: 1 }}>
      
      {/* Background Graphics */}
      <div className="bg-circle bg-circle-top"></div>
      <div className="bg-circle bg-circle-bottom"></div>

      <div className="values-container" style={{ position: "relative", zIndex: 10 }}>
        <Reveal>
          <h2 className="section-hero-heading center headline-titling">
            TMASI Global: Core Values
          </h2>
        </Reveal>

        <div className="values-list">
          <Reveal delay={0.06} className="values-item">
            <div className="values-number">1</div>
            <div>
              <h3 className="values-title">Client-Centered</h3>
              <p className="values-description">
                We prioritize the safety, comfort, and needs of every patient and traveler.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="values-item">
            <div className="values-number">2</div>
            <div>
              <h3 className="values-title">Integrity &amp; Transparency</h3>
              <p className="values-description">
                We provide honest, clear, and ethical guidance throughout the journey.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.18} className="values-item">
            <div className="values-number">3</div>
            <div>
              <h3 className="values-title">Excellence &amp; Reliability</h3>
              <p className="values-description">
                We deliver seamless, high-quality assistance and dependable support.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.24} className="values-item">
            <div className="values-number">4</div>
            <div>
              <h3 className="values-title">Global Collaboration &amp; Respect</h3>
              <p className="values-description">
                We build strong international partnerships and honor cultural diversity.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .bg-circle {
          position: absolute;
          border-radius: 50%;
          border: 2px dashed rgba(255, 255, 255, 0.15);
          pointer-events: none;
          z-index: 0;
          animation: spin 60s linear infinite;
        }
        
        .bg-circle-top {
          width: 800px;
          height: 800px;
          top: -400px;
          right: -200px;
        }

        .bg-circle-bottom {
          width: 600px;
          height: 600px;
          bottom: -300px;
          left: -150px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation-direction: reverse;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .bg-circle-top { width: 400px; height: 400px; top: -200px; right: -100px; }
          .bg-circle-bottom { width: 300px; height: 300px; bottom: -150px; left: -50px; }
          
          .values-list {
            grid-template-columns: 1fr !important;
            gap: 16px;
          }
          .values-item {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-start !important;
            gap: 16px !important;
            padding: 20px !important;
            text-align: left !important;
          }
          .values-number {
            flex-shrink: 0 !important;
            margin-bottom: 0 !important;
            width: 48px !important;
            height: 48px !important;
            font-size: 20px !important;
          }
          .values-title {
            font-size: 16px !important;
            margin: 0 0 4px 0 !important;
          }
          .values-description {
            font-size: 14px !important;
            margin: 0 !important;
          }
        }
      `}} />
    </section>
  );
}
