"use client";

import Link from "next/link";
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
              <Link href="#footi" className="section-hero-btn">
                Request A Quote
              </Link>
              <a href="tel:+201206788566" className="section-hero-btn2">
                CALL THE TEAM
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hero-mobile-bg { display: none; }
        /* Room for the 24/7 bar above the header; the spacing under the header is unchanged. */
        #hero.section-hero { padding-top: calc(clamp(100px, 14vw, 160px) + var(--bar-h)); }

        /* Phones only. Desktop keeps its original hero untouched (Mohamed, 2026-09-28). */
        @media (max-width: 768px) {
          .hero-desktop-bg { display: none; }
          .hero-mobile-bg { display: block; }

          /* Clear air under the header, then title, paragraph and buttons in even steps. */
          #hero.section-hero { padding: calc(152px + var(--bar-h)) 0 72px; }
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
