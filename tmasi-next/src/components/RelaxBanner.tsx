"use client";

import Reveal from "./Reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function RelaxBanner() {
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
          src="/tmasi/v3/img/abouts.jpg" 
          alt="TMASI Global Relax and Enjoy" 
          fill 
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
        {/* Dark Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15,32,92,0.9), rgba(8,17,51,0.8))" }} />
      </motion.div>

      <div className="container" style={{ position: "relative", zIndex: 2, padding: "0 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <Reveal type="scale">
            <h2 className="headline-titling relax-heading" style={{ color: "#ffffff", fontSize: "clamp(30px, 6vw, 42px)", fontWeight: 800, marginBottom: "20px", letterSpacing: "1px", textShadow: "0 4px 20px rgba(0,0,0,0.5)", lineHeight: 1.2 }}>
              TMASI Global: Where <br className="mobile-br" />
              <span style={{ color: "var(--tmasi-teal)", whiteSpace: "nowrap" }}>RELAX &amp; ENJOY</span>{" "}
              <br className="mobile-br" />
              Is All You Need to Do.
            </h2>
          </Reveal>
          
          <Reveal delay={0.2}>
            <p style={{ color: "rgba(255,255,255,0.95)", fontSize: "clamp(15px, 2.5vw, 17px)", lineHeight: 1.8, margin: "0 auto", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              To make this a reality, we've built a robust infrastructure supported by a dedicated team of professionals. From the moment of booking to their return home, we handle every detail, ensuring immediate and seamless support for all their needs, so they can experience peace of mind throughout their journey.
            </p>
          </Reveal>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .mobile-br { display: none; }
        @media (max-width: 768px) {
          .mobile-br { display: block; margin-bottom: 4px; }
        }
      `}} />
    </section>
  );
}
