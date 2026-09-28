"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { motion } from "framer-motion";

export default function WhyChoose() {
  return (
    <>
      <section className="section-why" id="why">
        <div className="container">
          <Reveal>
            <h2 className="section-why-heading headline-titling">
              Why Choose TMASI Global?
            </h2>
          </Reveal>

          <div className="why-grid">
            <Reveal delay={0.06} className="section-why-item">
              <Image src="/tmasi/v3/img/support.png" alt="One Call Total Support" className="section-why-icon" width={56} height={56} />
              <h3 className="section-why-item-heading">One Call, Total Support</h3>
              <p className="section-why-item-description">
                With TMASI Global, you only need to make one call. No need to coordinate with multiple contacts or manage different services on your own.
              </p>
            </Reveal>

            <Reveal delay={0.12} className="section-why-item">
              <Image src="/tmasi/v3/img/maintenance.png" alt="End to End Control" className="section-why-icon" width={56} height={56} />
              <h3 className="section-why-item-heading">End-to-End Control</h3>
              <p className="section-why-item-description">
                We take full responsibility for every step of the process, from medical emergencies to travel arrangements and medical tourism, ensuring a smooth and hassle-free experience.
              </p>
            </Reveal>

            <Reveal delay={0.18} className="section-why-item">
              <Image src="/tmasi/v3/img/support (1).png" alt="Problem Solving and Efficiency" className="section-why-icon" width={56} height={56} />
              <h3 className="section-why-item-heading">Problem Solving and Efficiency</h3>
              <p className="section-why-item-description">
                Our dedicated team handles everything with professionalism, quickly resolving issues while keeping you informed at every stage.
              </p>
            </Reveal>

            <Reveal delay={0.06} className="section-why-item">
              <Image src="/tmasi/v3/img/experience.png" alt="Decades of Industry Experience" className="section-why-icon" width={56} height={56} />
              <h3 className="section-why-item-heading">Decades of Industry Experience</h3>
              <p className="section-why-item-description">
                Our wealth of knowledge and expertise guarantees reliable and innovative solutions.
              </p>
            </Reveal>

            <Reveal delay={0.12} className="section-why-item why-last-item">
              <Image src="/tmasi/v3/img/social-care.png" alt="Comprehensive Assistance" className="section-why-icon" width={56} height={56} />
              <h3 className="section-why-item-heading">Comprehensive Assistance</h3>
              <p className="section-why-item-description">
                Medical, travel, and tourism support tailored to meet diverse client needs.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
      <style dangerouslySetInnerHTML={{__html: `
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
          .why-grid {
            gap: 16px;
          }
          .why-last-item {
            max-width: 100%;
          }
          .section-why-item {
            padding: 20px !important;
          }
          .section-why-item-heading {
            font-size: 16px !important;
          }
          .section-why-item-description {
            font-size: 13px !important;
          }
          .section-why-icon {
            width: 40px !important;
            height: 40px !important;
          }
        }
      `}} />
    </>
  );
}
