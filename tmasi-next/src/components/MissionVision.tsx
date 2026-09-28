"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

export default function MissionVision() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="mission-vision" style={{ background: "#F8FAFC", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      
      {/* Background Graphics */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        {/* Left MISSION text */}
        <div className="bg-text-mission headline-titling">MISSION</div>
        {/* Right VISION text */}
        <div className="bg-text-vision headline-titling">VISION</div>
        {/* Flying Plane SVG */}
        <div className="bg-plane">
          <svg viewBox="0 0 24 24" width="200" height="200" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.6c-.1.5.3.9.8.9l6.5 2.1-3.5 3.5-3.4-.6c-.5-.1-.9.2-1.1.7l-1 2.9c-.1.5.3.9.8.9l4.5 1.5 1.5 4.5c0 .5.4.9.9.8l2.9-1c.5-.2.8-.6.7-1.1l-.6-3.4 3.5-3.5 2.1 6.5c0 .5.4.9.9.8l3.6-1.2c.5-.2.8-.6.7-1.1z"/>
          </svg>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 10 }}>
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
        
        @media (max-width: 768px) {
          .mv-grid { grid-template-columns: 1fr; gap: 16px; }
          .mv-card { padding: 24px !important; }
          .mv-title { font-size: 18px !important; }
          .mv-content { font-size: 14px !important; }
          .mv-icon-wrapper { width: 56px !important; height: 56px !important; margin-bottom: 16px !important; }
          .mv-icon-wrapper img { width: 32px !important; height: 32px !important; }
          
          /* Hide giant background text on mobile to avoid overflow */
          .bg-text-mission, .bg-text-vision { display: none; }
        }

        /* Background Animations */
        .bg-text-mission {
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          font-size: 180px;
          color: transparent;
          -webkit-text-stroke: 2px rgba(15, 32, 92, 0.04);
          white-space: nowrap;
          animation: floatTextY 12s ease-in-out infinite alternate;
        }
        
        .bg-text-vision {
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%) rotate(90deg);
          font-size: 180px;
          color: transparent;
          -webkit-text-stroke: 2px rgba(15, 32, 92, 0.04);
          white-space: nowrap;
          animation: floatTextY 15s ease-in-out infinite alternate-reverse;
        }

        .bg-plane {
          position: absolute;
          bottom: -100px;
          left: -100px;
          color: rgba(0, 154, 156, 0.05);
          animation: flyAcross 25s linear infinite;
        }

        @keyframes floatTextY {
          0% { margin-top: -30px; }
          100% { margin-top: 30px; }
        }

        @keyframes flyAcross {
          0% { transform: translate(0, 0) rotate(15deg); }
          100% { transform: translate(120vw, -120vh) rotate(15deg); }
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
          position: relative;
          overflow: hidden;
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
