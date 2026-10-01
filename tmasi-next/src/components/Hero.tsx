"use client";

import { Fragment } from "react";
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
            className="hero-photo"
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
            className="hero-photo"
            priority
          />
        </div>

        {/* Shade for readability: dark behind the words, light over the photo ("balanced", 2026-09-30). */}
        <div className="hero-shade" aria-hidden="true" />
      </div>

      <div className="hero-container" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-content">
          <div className="hero-in">
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
          </div>

          <div className="hero-in hero-in-2">
            <p className="section-hero-description" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              {h.text}
            </p>
          </div>

          <div className="hero-in hero-in-3">
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
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hero-mobile-bg { display: none; }
        /* Entrance in plain CSS (2026-09-30): the first screen fades in the moment the page arrives, instead of
           waiting for the page's JavaScript as the scroll reveals do. */
        @keyframes hero-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        #hero .hero-in { animation: hero-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both; }
        #hero .hero-in-2 { animation-delay: 0.14s; }
        #hero .hero-in-3 { animation-delay: 0.23s; }
        @media (prefers-reduced-motion: reduce) { #hero .hero-in { animation: none; } }
        /* The photo shows more: a lighter shade and a touch of brightness, the image file untouched. */
        #hero .hero-photo { filter: brightness(1.12) saturate(1.08); }
        #hero .hero-shade {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(15,32,92,0.82) 0%, rgba(15,32,92,0.5) 42%, rgba(15,32,92,0.08) 78%);
        }
        /* Title in the brand headline face, Big Noodle (approved 2026-09-30). The widest English line is
           7.5 times the font size, so 88px fits the 780px column. */
        #hero .section-hero-heading {
          font-family: var(--font-display); font-weight: 400; text-transform: uppercase;
          letter-spacing: 0.015em; line-height: 0.96; font-size: clamp(52px, 6.1vw, 88px); margin-bottom: 26px;
        }
        #hero .hero-line { display: block; }
        /* Desktop: the header grew to 112px at the top, so the hero moves down with it and the
           gap between header and title stays 64px. */
        @media (min-width: 992px) { #hero.section-hero { padding-top: 176px; } }
        /* Exactly one screen tall (2026-09-30): desktop centres the words in the space under the 112px header. */
        #hero.section-hero { min-height: 100vh; min-height: 100svh; box-sizing: border-box; display: flex; align-items: center; }
        #hero .hero-container { width: 100%; }
        @media (min-width: 992px) { #hero.section-hero { padding: 112px 0 32px; } }

        /* Phones only. Desktop keeps its original hero untouched (Mohamed, 2026-09-28). */
        @media (max-width: 768px) {
          .hero-desktop-bg { display: none; }
          .hero-mobile-bg { display: block; }

          /* Clear air under the header, then title, paragraph and buttons in even steps. */
          /* Phones (2026-09-30): one screen tall, words from the top; the photo anchored at its bottom and a
             little larger, so the globe in the hand rises into view and the empty dark top is cut away. */
          #hero.section-hero { align-items: flex-start; padding: 116px 0 28px; }
          #hero .hero-mobile-bg { transform: scale(1.12); transform-origin: center bottom; }
          #hero .hero-shade {
            background: linear-gradient(to bottom, rgba(15,32,92,0.3) 0%, rgba(15,32,92,0.5) 40%, rgba(15,32,92,0.36) 60%, rgba(15,32,92,0.1) 80%, rgba(15,32,92,0) 100%);
          }
          #hero .hero-photo { filter: brightness(1.22) saturate(1.1); object-position: center bottom !important; }
          #hero .section-hero-heading {
            /* The widest line is about 8 times the font size in Big Noodle, so each line stays whole. */
            font-size: clamp(32px, calc((100vw - 40px) / 8), 56px);
            line-height: 0.98; margin: 0 0 22px;
          }
          #hero .hero-line { display: block; white-space: nowrap; }
          #hero .section-hero-description { font-size: 15.5px; line-height: 1.65; margin: 0 0 28px; }
        }
      `}} />
    </section>
  );
}
