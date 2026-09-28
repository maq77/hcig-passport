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
            <h1 className="section-hero-heading" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
              Your <strong className="orange" style={{ color: "var(--tmasi-teal)" }}>Trusted</strong> Partner in Global Medical, Travel, and Tourism Assistance.
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
        @media (max-width: 768px) {
          .hero-desktop-bg { display: none; }
          .hero-mobile-bg { display: block; }
          .section-hero { padding-top: 100px !important; }
          .section-hero-heading { font-size: 32px !important; margin-bottom: 20px !important; }
        }
      `}} />
    </section>
  );
}
