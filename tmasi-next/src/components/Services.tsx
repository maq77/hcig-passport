"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronRight, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSite } from "./site/SiteProvider";
import { asset, SERVICE_FOCUS, SERVICE_IMAGES } from "@/lib/asset";

// The same photo for each group in every language (the live site's own images).

/** "One Call, Endless Support: TMASI Global Has You Covered." shown on two lines after its first colon. */
function twoLines(t: string) {
  const i = t.search(/[:.]\s/);
  return i < 0 ? t : <>{t.slice(0, i + 1)}<br />{t.slice(i + 2)}</>;
}

type Bullet = {
  title?: string;
  text: string;
};

type Service = {
  id: number;
  img: string;
  /** Where the photo's subject sits in the card, and in the wide window crop. */
  pos: string;
  wide: string;
  title: string;
  bullets: Bullet[];
  href?: string;
};

export default function Services() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  // The window plays a short exit before it unmounts (2026-10-05); it used to vanish at once.
  const [closing, setClosing] = useState(false);
  const close = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => { setSelectedService(null); setClosing(false); }, 180);
  };
  const { live, ui, links } = useSite();

  // Disable body scroll when modal is open
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedService]);

  // Every group name, item title and item text is word for word from the live tmasi.net home (2026-09-26 backup).
  // Every group name, item title and item text is word for word from the live home in this language.
  const services: Service[] = live.home.services.groups.map((g, i) => ({
    id: i + 1,
    img: asset(SERVICE_IMAGES[i] || SERVICE_IMAGES[0]),
    pos: SERVICE_FOCUS.card[i] || "50% 50%",
    wide: SERVICE_FOCUS.wide[i] || "50% 50%",
    title: g.title,
    bullets: g.items as Bullet[],
    href: links.groups[i],
  }));

  // The card preview lists the group's first three item names (live words), so no summary text has to be invented.
  const preview = (svc: Service) =>
    svc.bullets.slice(0, 3).map((b) => (b.title ?? b.text).replace(/\.$/, ""));

  return (
    <section id="services" className="services-section lx-section lx-surface">
      <div className="lx-wrap">
        <Reveal>
          <SectionHead title={live.home.services.title} sub={twoLines(live.home.services.sub)} />
        </Reveal>

        <div className="packages-grid">
          {services.map((svc, idx) => (
            <Reveal key={svc.id} delay={0.06 * (idx % 3)} className="package-card-wrapper">
              <button className="package-card group" onClick={() => setSelectedService(svc)}>
                <div className="package-img-wrapper">
                  <Image
                    src={svc.img}
                    alt={svc.title}
                    fill
                    style={{ objectFit: "cover", objectPosition: svc.pos }}
                    className="package-img"
                  />
                </div>
                <div className="package-content">
                  <h3 className="package-title">{svc.title}</h3>
                  <ul className="package-desc">
                    {preview(svc).map((line) => <li key={line}>{line}</li>)}
                  </ul>

                  <div className="package-action">
                    <span className="view-details-btn">
                      {ui.viewDetails} <ChevronRight size={16} className="vd-icon" />
                    </span>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* The service window opens straight into <body> (like the quote form), so no section or page wrapper
          can become its frame and push it off screen (bug fixed 2026-10-05). It only renders after a click. */}
      {selectedService && createPortal(
        <div className={`modal-backdrop${closing ? " is-closing" : ""}`} onClick={close}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={close} aria-label="Close modal">
              <X size={24} color="#0F205C" />
            </button>

            <div className="modal-hero">
              <Image
                src={selectedService.img}
                alt={selectedService.title}
                fill
                style={{ objectFit: "cover", objectPosition: selectedService.wide }}
              />
              <div className="modal-hero-overlay" />
              <h2 className="modal-hero-title headline-titling">{selectedService.title}</h2>
            </div>

            <div className="modal-body">
              <ul className="modal-details-list">
                {selectedService.bullets.map((bullet, i) => (
                  <li key={i} className="modal-bullet-item">
                    <div className="modal-bullet-icon">
                      <CheckCircle2 size={20} color="var(--tmasi-teal)" />
                    </div>
                    <div className="modal-bullet-text">
                      {bullet.title && <strong>{bullet.title}:</strong>} {bullet.text}
                    </div>
                  </li>
                ))}
              </ul>
              {selectedService.href && (
                <Link href={selectedService.href} className="modal-page-link">
                  {selectedService.title} <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .services-section { overflow: hidden; }

        /* PACKAGES GRID */
        .packages-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(20px, 2.2vw, 28px);
        }

        @media (max-width: 1024px) {
          .packages-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
        }

        @media (max-width: 640px) {
          /* 2x3 Grid on Mobile */
          .packages-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        }

        .package-card-wrapper {
          height: 100%;
          min-width: 0;
        }

        .package-card {
          width: 100%;
          height: 100%;
          background: #ffffff;
          border-radius: var(--lx-radius);
          overflow: hidden;
          border: 1px solid var(--lx-line);
          display: flex;
          flex-direction: column;
          text-align: left;
          cursor: pointer;
          transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out), border-color 0.3s var(--ease-out);
          padding: 0;
          outline: none;
        }

        /* Lift only with a real pointer (a tap on a phone must not leave the card raised); keyboard focus too. */
        @media (hover: hover) and (pointer: fine) {
          .package-card:hover { transform: translateY(-4px); box-shadow: var(--lx-lift); border-color: rgba(0,154,156,0.35); }
          .package-card:hover .package-img { transform: scale(1.04) !important; }
          .package-card:hover .view-details-btn .vd-icon { transform: translateX(4px); }
        }
        .package-card:focus-visible { transform: translateY(-4px); box-shadow: var(--lx-lift); border-color: rgba(0,154,156,0.35); }
        .package-card:active { transform: scale(0.98); transition-duration: 0.12s; }

        .package-img-wrapper {
          position: relative;
          width: 100%;
          padding-top: 60%; /* Aspect ratio for thumbnails */
          overflow: hidden;
        }

        /* The hover zoom grows from the top edge, so it never trims a head. */
        .package-img {
          transform-origin: 50% 0;
          transition: transform 0.6s var(--ease-out), opacity 0.5s var(--ease-out) !important;
        }

        .package-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        @media (max-width: 640px) {
          .package-content { padding: 16px; }
        }

        .package-title {
          font-family: var(--font-montserrat), sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--lx-ink);
          margin: 0 0 10px 0;
          line-height: 1.25;
          letter-spacing: -0.015em;
        }

        @media (max-width: 640px) {
          .package-title { font-size: 17px; }
        }

        .package-desc {
          list-style: none; margin: 0 0 22px; padding: 0;
          display: flex; flex-direction: column; gap: 6px;
        }
        .package-desc li {
          position: relative; padding-left: 16px; font-size: 14.5px; line-height: 1.5; color: var(--lx-body);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .package-desc li::before {
          content: ""; position: absolute; left: 0; top: 0.62em; width: 6px; height: 6px; border-radius: 50%;
          background: var(--tmasi-teal); opacity: 0.7;
        }

        @media (max-width: 640px) {
          .package-desc { display: none; }
        }

        .package-action {
          margin-top: auto;
          padding-top: 4px;
        }

        .view-details-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 700;
          color: var(--tmasi-teal);
        }

        @media (max-width: 640px) {
          .view-details-btn { font-size: 13px; gap: 4px; }
        }

        .vd-icon {
          transition: transform 0.3s var(--ease-out);
        }

        /* PREMIUM MODAL */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 32, 92, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          opacity: 0;
          animation: modalFadeIn 0.25s var(--ease-out) forwards;
        }
        /* Exit: quicker than the entrance. */
        .modal-backdrop.is-closing { animation: modalFadeOut 0.18s var(--ease-out) forwards; }
        .modal-backdrop.is-closing .modal-container { animation: modalSlideOut 0.18s var(--ease-out) forwards; }
        @keyframes modalFadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes modalSlideOut { from { opacity: 1; transform: none; } to { opacity: 0; transform: scale(0.97) translateY(8px); } }

        @media (max-width: 640px) {
          .modal-backdrop {
            padding: 12px;
          }
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: #ffffff;
          width: 100%;
          max-width: 850px;
          max-height: 85vh;
          border-radius: 20px;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transform: scale(0.95) translateY(20px);
          opacity: 0;
          animation: modalSlideUp 0.35s var(--ease-out) 0.04s forwards;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 640px) {
          .modal-container {
            max-height: 95vh;
            border-radius: 16px;
          }
        }

        /* Custom Scrollbar for Modal */
        .modal-container::-webkit-scrollbar {
          width: 8px;
        }
        .modal-container::-webkit-scrollbar-track {
          background: transparent;
          margin: 16px 0; /* Keeps it away from edges */
        }
        .modal-container::-webkit-scrollbar-thumb {
          background: rgba(15, 32, 92, 0.2);
          border-radius: 10px;
        }
        .modal-container::-webkit-scrollbar-thumb:hover {
          background: rgba(15, 32, 92, 0.4);
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: transform 0.2s, background 0.2s;
        }

        .modal-close:hover {
          background: #f1f5f9;
          transform: scale(1.05);
        }

        .modal-hero {
          position: relative;
          height: 300px;
          width: 100%;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .modal-hero { height: 210px; }
        }

        .modal-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(15, 32, 92, 0.2), rgba(15, 32, 92, 0.8));
          z-index: 1;
        }

        .modal-hero-title {
          position: absolute;
          bottom: 24px;
          left: 32px;
          right: 32px;
          color: #ffffff;
          z-index: 2;
          font-size: clamp(24px, 4vw, 36px);
          margin: 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        @media (max-width: 640px) {
          .modal-hero-title { left: 24px; right: 24px; bottom: 20px; }
        }

        .modal-body {
          padding: 32px;
        }

        @media (max-width: 640px) {
          .modal-body { padding: 24px; }
        }

        .modal-quote-box {
          border-left: 4px solid var(--tmasi-teal);
          padding-left: 20px;
          margin-bottom: 32px;
        }

        .modal-quote-box p {
          font-size: 18px;
          color: #334155;
          margin: 0;
          font-style: italic;
          line-height: 1.6;
        }

        @media (max-width: 640px) {
          .modal-quote-box p { font-size: 16px; }
        }

        .modal-page-link {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 28px; min-height: 44px;
          color: var(--tmasi-teal); font-weight: 700; font-size: 15px; text-decoration: none;
          border-bottom: 1px solid rgba(0,154,156,0.35);
        }
        .modal-page-link:hover { color: var(--lx-ink); border-color: var(--lx-ink); }

        .modal-details-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .modal-bullet-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .modal-bullet-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .modal-bullet-text {
          font-size: 16px;
          color: #475569;
          line-height: 1.6;
        }

        .modal-bullet-text strong {
          color: #0F205C;
          font-weight: 700;
        }
      `}} />
    </section>
  );
}
