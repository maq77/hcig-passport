"use client";

import Reveal from "./Reveal";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="section-hero" id="hero" style={{ position: "relative", overflow: "hidden" }}>
      {/* Background Images for Desktop and Mobile */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {/* Desktop Hero Image (hidden on mobile) */}
        <div className="hero-desktop-bg" style={{ position: "absolute", inset: 0 }}>
          <Image 
            src="/tmasi/v3/img/glavbanner.jpg"
            alt="TMASI Global Assistance"
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
          />
        </div>
        
        {/* Mobile Hero Image (hidden on desktop) */}
        <div className="hero-mobile-bg" style={{ position: "absolute", inset: 0 }}>
          <Image 
            src="/tmasi/v3/img/bgmob.jpg"
            alt="TMASI Global Assistance"
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
          />
        </div>

        {/* Gradient Overlay for Readability */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15,32,92,0.9) 0%, rgba(15,32,92,0.7) 50%, rgba(15,32,92,0.3) 100%)" }} />
      </div>

      <div className="hero-container" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-content">
          <Reveal delay={0.1}>
            {/* Same words as the live site, broken by meaning: each line is one idea and never wraps. */}
            <h1 className="section-hero-heading" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
              <span className="hero-line">Your <strong className="orange" style={{ color: "var(--tmasi-teal)" }}>Trusted</strong> Partner in</span>{" "}
              <span className="hero-line">Global Medical, Travel,</span>{" "}
              <span className="hero-line">and Tourism Assistance.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="section-hero-description" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              At TMASI Global, we specialize in delivering world-class medical, travel, and tourism assistance services.
              With decades of industry experience and a deep commitment to client care, our company has become synonymous
              with reliability, excellence, and innovation. We are dedicated to providing swift and effective solutions
              to individuals, corporations, insurance companies, and travelers across the globe.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="section-hero-action">
              <a
                href="#quote"
                className="section-hero-btn"
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("tmasi:open-quote")); }}
              >
                Request A Quote
              </a>
              <a href="https://wa.me/201206788566" target="_blank" rel="noopener noreferrer" className="section-hero-btn2">
                CALL THE TEAM
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hero-mobile-bg { display: none; }
        /* Desktop: the header grew to 112px at the top, so the hero moves down with it and the
           gap between header and title stays 64px. */
        @media (min-width: 992px) { #hero.section-hero { padding-top: 176px; } }

        /* Phones only. Desktop keeps its original hero untouched (Mohamed, 2026-09-28). */
        @media (max-width: 768px) {
          .hero-desktop-bg { display: none; }
          .hero-mobile-bg { display: block; }

          /* Clear air under the header, then title, paragraph and buttons in even steps. */
          #hero.section-hero { padding: 152px 0 72px; }
          #hero .section-hero-heading {
            /* The widest line is about 13 times the font size, so each line stays whole on any phone. */
            font-size: clamp(22px, calc((100vw - 40px) / 13.2), 34px);
            line-height: 1.14; margin: 0 0 24px;
          }
          #hero .hero-line { display: block; white-space: nowrap; }
          #hero .section-hero-description { font-size: 15.5px; line-height: 1.75; margin: 0 0 36px; }
        }
      `}} />
    </section>
  );
}
