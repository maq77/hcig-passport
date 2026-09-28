"use client";

import Reveal from "./Reveal";
import CountUp from "./CountUp";


// Words are the live tmasi.net About Us, unchanged. Stat labels approved by Mohamed on 2026-09-28.
export default function About() {
  return (
    <section className="section-about lx-section lx-white" id="about">
      <div className="lx-wrap">
        <Reveal>
          <div className="lx-head">
            <h2 className="lx-title">About Us</h2>
            <h3 className="about-statement" style={{ marginTop: "16px" }}>Your Care. One Call Away.</h3>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="about-copy">
            <p className="about-lead">
              Leading provider of medical, travel, insurance, and tourism assistance.<br />
              Operations spanning <strong>Germany</strong>, <strong>Spain</strong>, <strong>USA</strong>, <strong>UAE</strong>, and <strong>Egypt</strong>.<br />
              Supporting individuals, corporations, insurers, hotels &amp; resorts, and travelers across the Globe.
            </p>
            <p className="about-body">
              In just the past three years, we&apos;ve proudly served over 30,000 cases, including more than 570 successful repatriation cases. It&apos;s a testament to the professional excellence we bring to every single client.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <dl className="about-stats">
            <div className="about-stat">
              <dt className="lx-label">Cases Handled</dt>
              <dd className="about-stat-num"><CountUp end={30000} suffix="+" /></dd>
            </div>
            <div className="about-stat">
              <dt className="lx-label">Medical Repatriations</dt>
              <dd className="about-stat-num"><CountUp end={570} suffix="+" /></dd>
            </div>
            <div className="about-stat">
              <dt className="lx-label">Operational Desk</dt>
              <dd className="about-stat-num">24/7</dd>
            </div>
            <div className="about-stat">
              <dt className="lx-label">Global Hubs</dt>
              <dd className="about-stat-num"><CountUp end={5} /></dd>
            </div>
          </dl>
        </Reveal>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        
        
        
        .about-statement {
          margin: 0; color: var(--tmasi-teal); font-weight: 800; letter-spacing: -0.02em;
          font-size: clamp(34px, 4.5vw, 60px); line-height: 1.1; white-space: nowrap;
        }
        .about-copy { max-width: 920px; margin: 0 auto; text-align: center; }
        .about-lead {
          margin: 0 0 22px; color: #1E293B; font-weight: 500;
          font-size: clamp(16px, 1.45vw, 19px); line-height: 1.85;
        }
        .about-lead strong { color: var(--lx-ink); font-weight: 700; }
        .about-body { margin: 0 auto; max-width: 760px; color: var(--lx-body); font-size: clamp(15px, 1.25vw, 17px); line-height: 1.8; }

        /* Stats: an open band between two hairlines, no box, no shadow. */
        .about-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          margin: clamp(48px, 5.5vw, 80px) 0 0; padding: 0;
          border-top: 1px solid var(--lx-line); border-bottom: 1px solid var(--lx-line);
        }
        .about-stat {
          display: flex; flex-direction: column-reverse; align-items: center; gap: 14px;
          padding: clamp(28px, 3vw, 44px) 12px; text-align: center;
        }
        .about-stat + .about-stat { border-left: 1px solid var(--lx-line); }
        .about-stat dt { color: var(--lx-muted); }
        .about-stat-num {
          margin: 0; line-height: 1; color: var(--tmasi-teal);
          font-family: var(--font-bignoodle), var(--font-montserrat), sans-serif;
          font-size: clamp(44px, 5vw, 68px); letter-spacing: 0.01em;
          font-variant-numeric: tabular-nums;
        }

        @media (max-width: 900px) {
          .about-stats { grid-template-columns: repeat(2, 1fr); }
          .about-stat:nth-child(3) { border-left: none; }
          .about-stat:nth-child(n+3) { border-top: 1px solid var(--lx-line); }
        }
        @media (max-width: 520px) {
          /* Stays on one line on phones, as on the live site. */
          .about-statement { font-size: 5.5vw; }
          .about-stat { padding: 24px 8px; gap: 10px; }
          .about-stat dt { font-size: 10.5px; letter-spacing: 0.14em; }
        }
      `}} />
    </section>
  );
}










