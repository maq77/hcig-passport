"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

export default function MissionVision() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="mission-vision" style={{ background: "#F8FAFC", padding: "100px 0" }}>
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div className="mv-grid">
          
          {/* Mission Card */}
          <Reveal delay={0.1}>
            <div className="mv-card">
              <div className="mv-icon-wrapper">
                <Image src="/tmasi/v3/img/shield.png" alt="TMASI Global Mission Shield" width={48} height={48} />
              </div>
              <h3 className="mv-title">Our Mission</h3>
              
              <div className="mv-content">
                <p>
                  At TMASI Global, our mission is to deliver safety, provide qualified services, and ensure that our clients feel relaxed and carefree. We are dedicated to being the number one international travel medical assistance provider...
                </p>
                <div className={`mv-hidden-text ${isExpanded ? "expanded" : ""}`}>
                  <p style={{ marginTop: "12px" }}>
                    by maintaining the highest standards of reliability, efficiency, and innovation.
                  </p>
                  <p style={{ marginTop: "12px" }}>
                    Our goal is to simplify complex situations with a single point of contact, giving our clients peace of mind and comprehensive support at every step. To deliver world-class medical and travel assistance across borders, ensuring safety and care for every traveler.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Vision Card */}
          <Reveal delay={0.2}>
            <div className="mv-card">
              <div className="mv-icon-wrapper">
                <Image src="/tmasi/v3/img/healthcare.png" alt="TMASI Global Vision Healthcare" width={48} height={48} />
              </div>
              <h3 className="mv-title">Our Vision</h3>
              
              <div className="mv-content">
                <p>
                  We envision a world where medical and travel assistance is seamless, accessible, and efficient. No matter where you are. As a global leader, we strive to strengthen our position as the best international travel...
                </p>
                <div className={`mv-hidden-text ${isExpanded ? "expanded" : ""}`}>
                  <p style={{ marginTop: "12px" }}>
                    medical assistance provider by delivering top-notch solutions combined with personalized care.
                  </p>
                  <p style={{ marginTop: "12px" }}>
                    Our vision is to build a worldwide network of support that empowers our clients to feel safe, supported, and stress-free, whether traveling for leisure, business, or medical needs.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Global Show More Button */}
        <Reveal delay={0.3}>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mv-toggle-btn"
            >
              <span>{isExpanded ? "Show Less" : "Show More"}</span>
              {isExpanded ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
            </button>
          </div>
        </Reveal>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .mv-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        /* Force 2 columns even on mobile */
        @media (max-width: 768px) {
          .mv-grid { gap: 16px; }
          .mv-card { padding: 24px !important; }
          .mv-title { font-size: 18px !important; }
          .mv-content { font-size: 13px !important; }
          .mv-icon-wrapper { width: 56px !important; height: 56px !important; margin-bottom: 16px !important; }
          .mv-icon-wrapper img { width: 32px !important; height: 32px !important; }
        }

        .mv-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .mv-icon-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: rgba(0,154,156,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .mv-title {
          color: #0F205C;
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 16px 0;
        }

        .mv-content {
          color: #475569;
          font-size: 15px;
          line-height: 1.8;
        }

        .mv-hidden-text {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
        }

        .mv-hidden-text.expanded {
          max-height: 500px;
          opacity: 1;
        }

        .mv-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 50px;
          color: var(--tmasi-teal);
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }

        .mv-toggle-btn:hover {
          background: var(--tmasi-teal);
          color: #ffffff;
          border-color: var(--tmasi-teal);
        }
      `}} />
    </section>
  );
}
