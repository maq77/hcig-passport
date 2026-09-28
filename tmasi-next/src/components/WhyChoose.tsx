"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { motion } from "framer-motion";

export default function WhyChoose() {
  return (
    <>
      <section className="section-why" id="why" style={{ position: "relative", overflow: "hidden" }}>
        
        {/* Background Floating Plus Signs */}
        <div className="bg-plus bg-plus-1">+</div>
        <div className="bg-plus bg-plus-2">+</div>
        <div className="bg-plus bg-plus-3">+</div>

        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <Reveal>
            <h2 className="section-why-heading headline-titling">
              Why Choose TMASI Global?
            </h2>
          </Reveal>

          <div className="why-grid">
            <Reveal delay={0.06} className="section-why-item">
              <Image src="/tmasi/v3/img/support.png" alt="One Call Total Support" className="section-why-icon" width={56} height={56} />
              <div>
                <h3 className="section-why-item-heading">One Call, Total Support</h3>
                <p className="section-why-item-description">
                  With TMASI Global, you only need to make one call. No need to coordinate with multiple contacts or manage different services on your own.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12} className="section-why-item">
              <Image src="/tmasi/v3/img/maintenance.png" alt="End to End Control" className="section-why-icon" width={56} height={56} />
              <div>
                <h3 className="section-why-item-heading">End-to-End Control</h3>
                <p className="section-why-item-description">
                  We take full responsibility for every step of the process, from medical emergencies to travel arrangements and medical tourism, ensuring a smooth and hassle-free experience.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.18} className="section-why-item">
              <Image src="/tmasi/v3/img/support (1).png" alt="Problem Solving and Efficiency" className="section-why-icon" width={56} height={56} />
              <div>
                <h3 className="section-why-item-heading">Problem Solving and Efficiency</h3>
                <p className="section-why-item-description">
                  Our dedicated team handles everything with professionalism, quickly resolving issues while keeping you informed at every stage.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.06} className="section-why-item">
              <Image src="/tmasi/v3/img/experience.png" alt="Decades of Industry Experience" className="section-why-icon" width={56} height={56} />
              <div>
                <h3 className="section-why-item-heading">Decades of Industry Experience</h3>
                <p className="section-why-item-description">
                  Our wealth of knowledge and expertise guarantees reliable and innovative solutions.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12} className="section-why-item why-last-item">
              <Image src="/tmasi/v3/img/social-care.png" alt="Comprehensive Assistance" className="section-why-icon" width={56} height={56} />
              <div>
                <h3 className="section-why-item-heading">Comprehensive Assistance</h3>
                <p className="section-why-item-description">
                  Medical, travel, and tourism support tailored to meet diverse client needs.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <style dangerouslySetInnerHTML={{__html: `
        .bg-plus {
          position: absolute;
          font-size: 300px;
          color: rgba(15, 32, 92, 0.02);
          font-weight: 300;
          pointer-events: none;
          z-index: 0;
          animation: float 10s ease-in-out infinite alternate;
        }

        .bg-plus-1 { top: -100px; left: -50px; animation-duration: 12s; }
        .bg-plus-2 { bottom: 100px; right: 0px; animation-duration: 15s; font-size: 200px; }
        .bg-plus-3 { top: 300px; left: 50%; font-size: 400px; animation-duration: 18s; }

        @keyframes float {
          0% { transform: translateY(0); }
          100% { transform: translateY(30px); }
        }

        .why-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .why-last-item {
          grid-column: 1 / -1;
          margin: 0 auto;
          max-width: 50%;
        }
        @media (max-width: 768px) {
          .bg-plus { display: none; } /* Hide on mobile to keep clean */
          
          .why-grid {
            grid-template-columns: 1fr !important;
            gap: 16px;
          }
          .why-last-item {
            max-width: 100%;
          }
          .section-why-item {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-start !important;
            gap: 16px !important;
            padding: 20px !important;
            text-align: left !important;
          }
          .section-why-icon {
            width: 48px !important;
            height: 48px !important;
            flex-shrink: 0 !important;
            margin: 0 !important;
          }
          .section-why-item-heading {
            font-size: 16px !important;
            margin: 0 0 6px 0 !important;
          }
          .section-why-item-description {
            font-size: 14px !important;
            margin: 0 !important;
          }
          /* We need a wrapper div for the text to sit next to the icon */
          .section-why-item > div {
            flex: 1;
          }
        }
      `}} />
    </>
  );
}
