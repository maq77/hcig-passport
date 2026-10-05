"use client";

import Reveal from "./Reveal";
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
  return (
    <section id="relax" style={{ position: "relative", minHeight: "450px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
      {/* The photo band: still, like the hero (design rules 2026-10-01). */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src={asset("/img/abouts.jpg")}
          alt="TMASI Global Relax and Enjoy"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          className="relax-photo"
          priority
        />
      </div>
      {/* The hero's navy shade, darkest behind the words, the photo open at the sides. */}
      <div aria-hidden="true" className="relax-shade" />

      <div className="container" style={{ position: "relative", zIndex: 2, padding: "0 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <Reveal>
            <h2 className="headline-titling relax-heading" style={{ color: "#ffffff", fontSize: "clamp(30px, 6vw, 42px)", fontWeight: 800, marginBottom: "20px", letterSpacing: "1px", textShadow: "0 4px 20px rgba(0,0,0,0.5)", lineHeight: 1.2 }}>
              {r.title.map((seg, i) =>
                seg.accent ? (
                  <span key={i}>
                    <br className="mobile-br" />
                    <span style={{ color: "var(--lx-teal-on-dark)", whiteSpace: "nowrap" }}>{seg.t.trim()}</span>
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
        /* Same lift as the hero photo. */
        #relax .relax-photo { filter: brightness(1.12) saturate(1.08); }
        /* Desktop only (2026-10-05): the photo sits lower so her face shows above the title (1280 to 1920 wide). */
        @media (min-width: 769px) { #relax .relax-photo { object-position: center 20% !important; } }
        .relax-shade {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to right, rgba(15,32,92,0.36) 0%, rgba(15,32,92,0.7) 28%, rgba(15,32,92,0.7) 72%, rgba(15,32,92,0.36) 100%);
        }
        @media (max-width: 768px) {
          .mobile-br { display: block; margin-bottom: 4px; }
          /* Phones only (2026-09-30): the two people sit in the middle, the photo brighter, a lighter shade
             that stays darkest behind the words. Desktop unchanged. */
          #relax .relax-photo { object-position: 12% center !important; filter: brightness(1.22) saturate(1.1); }
          #relax .relax-shade {
            /* Dark enough behind the words for readable text (title 3:1, paragraph 4.5:1), open at the edges. */
            background: linear-gradient(to bottom, rgba(15,32,92,0.62) 0%, rgba(15,32,92,0.68) 36%, rgba(15,32,92,0.6) 72%, rgba(15,32,92,0.35) 100%);
          }
        }
      `}} />
    </section>
  );
}
