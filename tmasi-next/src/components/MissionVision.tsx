"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import ChipIcon from "./ChipIcon";
import { useSite } from "./site/SiteProvider";
import { asset } from "@/lib/asset";

// Mission & Vision as a bento (approved on the design canvas 2026-10-06: design A, an image made for each).
// Phone and tablet: the image heads each card, then the icon and title, then the whole text.
// Desktop: one wide tile each, text beside its image, the image switching sides from Mission to Vision.
// Heading and both texts are the live tmasi.net words in each language, whole and unchanged.
type Mission = { title: string; cards: { title: string; text: string; icon: string }[] };

const IMAGES = ["/img/bento/mission.webp", "/img/bento/vision.webp"];

export default function MissionVision({ content }: { content?: Mission }) {
  const { live } = useSite();
  const m = content || live.home.mission;

  return (
    <section id="mission-vision" className="lx-section lx-surface">
      <div className="lx-wrap">
        {m.title && (
          <Reveal>
            <SectionHead title={m.title} />
          </Reveal>
        )}

        <Reveal type="fade">
          <div className="mv-bento">
            {m.cards.map((c, i) => (
              <article key={c.title} className={`mv-tile rv-item${i % 2 ? " mv-tile--flip" : ""}`} style={{ "--i": i } as React.CSSProperties}>
                <div className="mv-img">
                  <Image src={asset(IMAGES[i % IMAGES.length])} alt="" fill sizes="(max-width: 960px) 100vw, 560px" />
                </div>
                <div className="mv-body">
                  <div className="mv-head">
                    <span className="lx-chip"><ChipIcon src={c.icon} /></span>
                    <h3 className="mv-title">{c.title}</h3>
                  </div>
                  <p className="mv-text">{c.text}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .mv-bento { display: grid; gap: 12px; }
        .mv-tile {
          display: flex; flex-direction: column; overflow: hidden;
          background: #ffffff; border: 1px solid var(--lx-line); border-radius: var(--lx-radius);
        }
        .mv-img { position: relative; aspect-ratio: 16 / 10; background: var(--lx-surface); }
        .mv-img img { object-fit: cover; }
        .mv-body { padding: 20px 22px 24px; }
        .mv-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .mv-title { margin: 0; font-size: 22px; font-weight: 700; line-height: 1.25; color: var(--lx-ink); letter-spacing: -0.015em; }
        .mv-text { margin: 0; color: var(--lx-body); font-size: 15px; line-height: 1.75; }

        @media (min-width: 960px) {
          .mv-bento { gap: 16px; }
          .mv-tile { display: grid; grid-template-columns: 1.2fr 1fr; }
          .mv-tile--flip { grid-template-columns: 1fr 1.2fr; }
          .mv-img { aspect-ratio: auto; min-height: 340px; order: 2; }
          .mv-tile--flip .mv-img { order: 0; }
          .mv-body { align-self: center; padding: 44px 48px; }
          .mv-head { flex-direction: column; align-items: flex-start; gap: 18px; margin-bottom: 16px; }
          .mv-title { font-size: 28px; }
          .mv-text { font-size: 16px; line-height: 1.8; }
        }
      `}} />
    </section>
  );
}
