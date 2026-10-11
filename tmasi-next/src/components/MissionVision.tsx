"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import ChipIcon from "./ChipIcon";
import { useSite } from "./site/SiteProvider";

// Mission & Vision as two text cards (his ask 2026-10-11: the images removed, home and About).
// Phone and tablet: the cards stacked. Desktop: side by side. Each card has the icon, title and the whole text.
// Heading and both texts are the live tmasi.net words in each language, whole and unchanged.
type Mission = { title: string; cards: { title: string; text: string; icon: string }[] };

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
              <article key={c.title} className="mv-tile rv-item" style={{ "--i": i } as React.CSSProperties}>
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
        .mv-body { padding: 20px 22px 24px; }
        .mv-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .mv-title { margin: 0; font-size: 22px; font-weight: 700; line-height: 1.25; color: var(--lx-ink); letter-spacing: -0.015em; }
        .mv-text { margin: 0; color: var(--lx-body); font-size: 15px; line-height: 1.75; }

        @media (min-width: 960px) {
          .mv-bento { gap: 16px; grid-template-columns: 1fr 1fr; }
          .mv-body { padding: 44px 48px; }
          .mv-head { flex-direction: column; align-items: flex-start; gap: 18px; margin-bottom: 16px; }
          .mv-title { font-size: 28px; }
          .mv-text { font-size: 16px; line-height: 1.8; }
        }
      `}} />
    </section>
  );
}
