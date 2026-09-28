"use client";

import { Fragment } from "react";
import Reveal from "./Reveal";
import Image from "next/image";
import { useSite } from "./site/SiteProvider";
import { Segs, splitLines } from "./site/Segments";
import { asset } from "@/lib/asset";
import type { Lang } from "@/content/ui";

// Phone line breaks by meaning, per language (approved for English, 2026-09-28). Languages without an
// entry let the title wrap on its own.
const BREAKS: Partial<Record<Lang, string[]>> = { en: ["Partner in", "Travel,"] };
const ACCENT = { color: "var(--tmasi-teal)" };

export default function Hero() {
  const { lang, live } = useSite();
  const h = live.home.hero;
  const lines = BREAKS[lang] ? splitLines(h.title, BREAKS[lang]!) : null;
  return (
    <section className="section-hero" id="hero" style={{ position: "relative", overflow: "hidden" }}>
      {/* Background Images for Desktop and Mobile */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {/* Desktop Hero Image (hidden on mobile) */}
        <div className="hero-desktop-bg" style={{ position: "absolute", inset: 0 }}>
          <Image 
            src={asset("/img/glavbanner.jpg")}
            alt="TMASI Global Assistance"
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
          />
        </div>
        
        {/* Mobile Hero Image (hidden on desktop) */}
        <div className="hero-mobile-bg" style={{ position: "absolute", inset: 0 }}>
          <Image 
            src={asset("/img/bgmob.jpg")}
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
            {/* The live title, word for word. English breaks by meaning on phones: each line is one idea. */}
            <h1 className="section-hero-heading" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
              {lines
                ? lines.map((l, i) => (
                    <Fragment key={i}>
                      <span className="hero-line"><Segs segs={l} accentClass="orange" accentStyle={ACCENT} /></span>{" "}
                    </Fragment>
                  ))
                : <Segs segs={h.title} accentClass="orange" accentStyle={ACCENT} />}
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="section-hero-description" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              {h.text}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="section-hero-action">
              <a
                href="#quote"
                className="section-hero-btn"
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("tmasi:open-quote")); }}
              >
                {h.ctaQuote}
              </a>
              <a href="https://wa.me/201206788566" target="_blank" rel="noopener noreferrer" className="section-hero-btn2">
                {h.ctaCall}
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
