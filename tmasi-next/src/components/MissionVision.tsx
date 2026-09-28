"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { useSite } from "./site/SiteProvider";
import { asset } from "@/lib/asset";
import CornerOrbs from "./CornerOrbs";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

// Heading and both paragraphs are the live tmasi.net text in each language, whole and unchanged.
// "Show More" only reveals the rest of each paragraph; it never cuts or rewords it.
type Mission = { title: string; cards: { title: string; text: string; icon: string }[] };

export default function MissionVision({ content }: { content?: Mission }) {
  const { live, ui } = useSite();
  const m = content || live.home.mission;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="mission-vision" className="lx-section lx-surface">
      <CornerOrbs corners={["top-left", "bottom-right"]} />
      <div className="lx-wrap relative z-10">
        <Reveal>
          {m.title && <SectionHead title={m.title} />}
        </Reveal>

        <div className="mv-grid">
          {m.cards.map((c, i) => (
            <Reveal key={c.title} delay={0.08 * (i + 1)}>
              <article className="mv-card">
                <div className="mv-card-head">
                  <span className="mv-icon"><Image src={asset(c.icon)} alt="" width={36} height={36} /></span>
                  <h3 className="mv-title">{c.title}</h3>
                </div>
                <p id={`mv-text-${i}`} className={`mv-text${isExpanded ? " is-open" : ""}`}>{c.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mv-toggle-row">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mv-toggle-btn"
            aria-expanded={isExpanded}
            aria-controls="mv-text-0 mv-text-1"
          >
            <span>{isExpanded ? ui.showLess : ui.showMore}</span>
            {isExpanded ? <ArrowUp size={18} aria-hidden="true" /> : <ArrowDown size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .mv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(20px, 2.5vw, 32px); }
        .mv-grid > * { display: flex; }
        .mv-card {
          width: 100%; background: #ffffff; border: 1px solid var(--lx-line); border-radius: var(--lx-radius);
          padding: clamp(28px, 3.4vw, 48px);
        }
        .mv-card-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .mv-icon {
          width: 56px; height: 56px; flex-shrink: 0; border-radius: 14px; background: rgba(0,154,156,0.07);
          display: inline-flex; align-items: center; justify-content: center;
        }
        .mv-title { margin: 0; font-size: clamp(22px, 2vw, 26px); font-weight: 800; color: var(--lx-ink); letter-spacing: -0.015em; }
        .mv-text {
          margin: 0; color: var(--lx-body); font-size: 16px; line-height: 1.8;
          display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden;
        }
        .mv-text.is-open { display: block; -webkit-line-clamp: unset; }

        .mv-toggle-row { display: flex; justify-content: center; margin-top: clamp(28px, 3vw, 40px); }
        .mv-toggle-btn {
          display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 26px;
          background: transparent; border: 1px solid rgba(15,32,92,0.18); border-radius: 999px;
          color: var(--lx-ink); font-weight: 700; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase;
          cursor: pointer; transition: background-color .25s ease, color .25s ease, border-color .25s ease;
        }
        .mv-toggle-btn:hover { background: var(--lx-ink); border-color: var(--lx-ink); color: #ffffff; }

        @media (max-width: 768px) {
          .mv-grid { grid-template-columns: 1fr; }
          .mv-text { font-size: 15px; line-height: 1.75; }
          .mv-icon { width: 48px; height: 48px; }
        }
      `}} />
    </section>
  );
}
