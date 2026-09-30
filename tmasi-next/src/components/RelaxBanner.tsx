"use client";

import Reveal from "./Reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import JourneyLine from "./JourneyLine";
import { useSite } from "./site/SiteProvider";
import { asset } from "@/lib/asset";
import type { Seg } from "./site/Segments";

type Relax = { title: Seg[]; text: string };

// The live slogan and paragraph, per language. On phones the highlighted words sit on their own line.
export default function RelaxBanner({ content }: { content?: Relax }) {
  const { live } = useSite();
  const r: Relax = content || live.home.relax;
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section id="relax" ref={containerRef} style={{ position: "relative", minHeight: "450px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
      {/* Parallax Background Image */}
      <motion.div 
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "140%", y, zIndex: 0 }}
      >
        <Image 
          src={asset("/img/abouts.jpg")} 
          alt="TMASI Global Relax and Enjoy" 
          fill 
          style={{ objectFit: "cover", objectPosition: "center", filter: "brightness(1.1) saturate(1.06)" }}
          className="relax-photo"
          priority
        />
      </motion.div>
      {/* Shade ("balanced", 2026-09-30): darkest behind the words, the photo open at the edges. */}
      <div aria-hidden="true" className="relax-shade" />

      <div className="container" style={{ position: "relative", zIndex: 2, padding: "0 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <Reveal type="scale">
            <h2 className="headline-titling relax-heading" style={{ color: "#ffffff", fontSize: "clamp(30px, 6vw, 42px)", fontWeight: 800, marginBottom: "20px", letterSpacing: "1px", textShadow: "0 4px 20px rgba(0,0,0,0.5)", lineHeight: 1.2 }}>
              {r.title.map((seg, i) =>
                seg.accent ? (
                  <span key={i}>
                    <br className="mobile-br" />
                    <span style={{ color: "var(--tmasi-teal)", whiteSpace: "nowrap" }}>{seg.t.trim()}</span>
                    <br className="mobile-br" />
                  </span>
                ) : (
                  <span key={i}>{seg.t}</span>
                )
              )}
            </h2>
          </Reveal>
          
          <Reveal delay={0.2}>
            <p style={{ color: "rgba(255,255,255,0.95)", fontSize: "clamp(15px, 2.5vw, 17px)", lineHeight: 1.8, margin: "0 auto", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              {r.text}
            </p>
          </Reveal>
        </div>
        <JourneyLine />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .mobile-br { display: none; }
        .relax-shade {
          position: absolute; inset: 0; z-index: 1;
          background: radial-gradient(ellipse 62% 78% at 50% 50%, rgba(8,17,51,0.74) 0%, rgba(15,32,92,0.5) 62%, rgba(15,32,92,0.3) 100%);
        }
        @media (max-width: 768px) {
          .mobile-br { display: block; margin-bottom: 4px; }
          /* Phones only (2026-09-30): the two people sit in the middle, the photo brighter, a lighter shade
             that stays darkest behind the words. Desktop unchanged. */
          #relax .relax-photo { object-position: 12% center !important; filter: brightness(1.2) saturate(1.1) !important; }
          /* The highlighted words in the bright teal the hero uses: the plain teal is too faint on the lighter photo. */
          #relax .relax-heading span span { color: #00D5D8 !important; }
          #relax .relax-shade {
            background: radial-gradient(ellipse 90% 70% at 50% 45%, rgba(8,17,51,0.62) 0%, rgba(15,32,92,0.42) 60%, rgba(15,32,92,0.22) 100%);
          }
        }
      `}} />
    </section>
  );
}
