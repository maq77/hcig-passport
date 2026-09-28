"use client";

import Reveal from "./Reveal";
import CountUp from "./CountUp";

export default function About() {
  return (
    <section className="section-about" id="about" style={{ padding: "100px 0", background: "#ffffff", position: "relative", overflow: "hidden" }}>
      
      {/* Moving TMASI Background Marquee */}
      <div style={{ position: "absolute", top: "20%", left: 0, width: "100%", overflow: "hidden", pointerEvents: "none", zIndex: 0, opacity: 0.03 }}>
        <div className="marquee-content" style={{ display: "flex", width: "fit-content" }}>
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className="headline-titling" style={{ fontSize: "clamp(120px, 15vw, 250px)", lineHeight: 1, paddingRight: "50px", whiteSpace: "nowrap", color: "#0F205C" }}>
              TMASI GLOBAL
            </span>
          ))}
        </div>
      </div>

      <div className="container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
        
        {/* Centered Heading */}
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="headline-titling" style={{ color: "var(--tmasi-teal)", fontSize: "clamp(36px, 5vw, 48px)", letterSpacing: "2px", marginBottom: "8px" }}>
              ABOUT US
            </h2>
            <h3 style={{ color: "#0F205C", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, margin: 0 }}>
              Your Care. One Call Away.
            </h3>
          </div>
        </Reveal>
        
        {/* Simple Centered Description */}
        <Reveal delay={0.1}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <p style={{ marginTop: 0, fontSize: "clamp(16px, 2vw, 18px)", fontWeight: 500, color: "#1E293B", lineHeight: 1.8, marginBottom: "24px" }}>
              Leading provider of medical, travel, insurance, and tourism assistance.<br />
              Operations spanning <strong>Germany</strong>, <strong>Spain</strong>, <strong>USA</strong>, <strong>UAE</strong>, and <strong>Egypt</strong>.<br />
              Supporting individuals, corporations, insurers, hotels &amp; resorts, and travelers across the Globe.
            </p>
            <p style={{ fontSize: "clamp(15px, 2vw, 17px)", lineHeight: 1.8, color: "#475569", margin: "0 auto", maxWidth: "800px" }}>
              In just the past three years, we've proudly served over 30,000 cases, including more than 570 successful repatriation cases. It's a testament to the professional excellence we bring to every single client.
            </p>
          </div>
        </Reveal>

        {/* Clean Metrics Strip */}
        <Reveal delay={0.2}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: "0", 
            background: "#ffffff", 
            borderRadius: "24px", 
            boxShadow: "0 20px 40px rgba(0,0,0,0.04)", 
            border: "1px solid rgba(0,154,156,0.1)",
            overflow: "hidden"
          }} className="metrics-container">
            <div className="metric-box">
              <div className="metric-number"><CountUp end={30000} suffix="+" /></div>
              <div className="metric-label">Cases Handled</div>
            </div>
            <div className="metric-box">
              <div className="metric-number"><CountUp end={570} suffix="+" /></div>
              <div className="metric-label">Medical Repatriations</div>
            </div>
            <div className="metric-box">
              <div className="metric-number" style={{ fontFamily: "var(--font-titling)", letterSpacing: "1px" }}>24/7</div>
              <div className="metric-label">Operational Desk</div>
            </div>
            <div className="metric-box" style={{ borderRight: "none" }}>
              <div className="metric-number"><CountUp end={5} /></div>
              <div className="metric-label">Global Hubs</div>
            </div>
          </div>
        </Reveal>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-content {
          animation: scroll-marquee 40s linear infinite;
        }
        
        .metric-box {
          text-align: center;
          padding: 40px 20px;
          border-right: 1px solid rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: background 0.3s;
        }
        
        .metric-box:hover {
          background: rgba(0,154,156,0.02);
        }

        .metric-number {
          font-size: clamp(36px, 4vw, 48px);
          font-weight: 800;
          color: var(--tmasi-teal);
          line-height: 1;
          margin-bottom: 12px;
        }

        .metric-label {
          color: #0F205C;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        @media (max-width: 992px) {
          .metrics-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .metric-box:nth-child(2) { border-right: none; }
          .metric-box:nth-child(3), .metric-box:nth-child(4) { border-top: 1px solid rgba(0,0,0,0.05); }
        }
        @media (max-width: 576px) {
          .metric-number { font-size: clamp(28px, 6vw, 36px); margin-bottom: 8px; }
          .metric-label { font-size: 11px; letter-spacing: 1px; }
          .metric-box { padding: 24px 12px; }
        }
      `}} />
    </section>
  );
}
