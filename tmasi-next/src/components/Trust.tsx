"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Reveal from "./Reveal";
import { asset } from "@/lib/asset";
import { TRUST, TRUST_PHOTOS, type TrustPhoto } from "@/content/trust";

// "Beyond Assistance. Built on Trust." (2026-10-15): canvas board C, "Wall of Moments", as he approved it.
// The heading follows the home section heads (teal rule, Big Noodle, navy); TRUST. carries the gold underline from
// board A. Two rows of his real case photos drift in opposite directions and open full size on a click.
// Less motion: the rows stand still and scroll sideways by hand instead.

const src = (p: TrustPhoto) => asset(`/img/trust/${p.file}.webp`);
const ROWS = [TRUST_PHOTOS.slice(0, 5), TRUST_PHOTOS.slice(5)];

function Swash() {
  return (
    <svg className="tr-swash" viewBox="0 0 220 18" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 12C52 4 120 2 218 9" fill="none" stroke="#C9973A" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Tag({ children }: { children: string }) {
  return <span className="tr-tag"><i aria-hidden="true" />{children}</span>;
}

function Viewer({ index, onClose, onStep }: { index: number; onClose: () => void; onStep: (d: number) => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const p = TRUST_PHOTOS[index];
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onStep(-1);
      else if (e.key === "ArrowRight") onStep(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      back?.focus();
    };
  }, [onClose, onStep]);

  return createPortal(
    <div className="tr-lb" role="dialog" aria-modal="true" aria-label={p.cat} lang="en" onClick={onClose}>
      <button ref={closeBtn} type="button" className="tr-lb-b tr-lb-x" onClick={onClose} aria-label={TRUST.close}><X size={20} /></button>
      <figure className="tr-lb-fig" onClick={(e) => e.stopPropagation()}>
        <Image src={src(p)} alt={p.alt} width={p.w} height={p.h} className="tr-lb-img" />
        <figcaption><Tag>{p.cat}</Tag><span>{String(index + 1).padStart(2, "0")} / {String(TRUST_PHOTOS.length).padStart(2, "0")}</span></figcaption>
        <div className="tr-lb-row">
          <button type="button" className="tr-lb-b" onClick={() => onStep(-1)} aria-label={TRUST.prev}><ChevronLeft size={20} /></button>
          <button type="button" className="tr-lb-b" onClick={() => onStep(1)} aria-label={TRUST.next}><ChevronRight size={20} /></button>
        </div>
      </figure>
    </div>,
    document.body,
  );
}

export default function Trust() {
  const [open, setOpen] = useState(-1);
  const n = TRUST_PHOTOS.length;
  const close = useCallback(() => setOpen(-1), []);
  const step = useCallback((d: number) => setOpen((o) => (o + d + n) % n), [n]);

  return (
    <section id="trust" className="tr-section" aria-labelledby="trust-title" lang="en">
      <div className="lx-wrap">
        <Reveal>
          <div className="lx-head tr-head">
            <h2 id="trust-title" className="tr-title">
              <span className="tr-l1">{TRUST.titleA}</span>{" "}
              <span className="tr-l2">{TRUST.titleB} <span className="tr-mark">{TRUST.titleC}<Swash /></span></span>
            </h2>
            <p className="tr-lead">{TRUST.lead} <strong>{TRUST.leadStrong}</strong></p>
          </div>
        </Reveal>
      </div>

      <div className="tr-mq" role="group" aria-label={TRUST.rowLabel}>
        {ROWS.map((row, r) => (
          <div key={r} className={`tr-row${r ? " tr-row--rev" : ""}`}>
            {[0, 1].map((copy) =>
              row.map((p) => {
                const i = TRUST_PHOTOS.indexOf(p);
                return (
                  <button
                    key={`${copy}-${p.file}`}
                    type="button"
                    className="tr-tile"
                    onClick={() => setOpen(i)}
                    aria-label={`${TRUST.open}: ${p.cat}`}
                    aria-hidden={copy ? true : undefined}
                    tabIndex={copy ? -1 : undefined}
                  >
                    <Image src={src(p)} alt={copy ? "" : p.alt} width={p.w} height={p.h} loading="lazy" sizes="400px" />
                    <Tag>{p.cat}</Tag>
                  </button>
                );
              }),
            )}
          </div>
        ))}
      </div>

      <div className="lx-wrap">
        <div className="tr-pair">
          <Reveal>
            <article className="tr-pc">
              <Image src={asset("/img/trust/ultrasound-1.webp")} alt={TRUST_PHOTOS[1].alt} width={960} height={1200} loading="lazy" sizes="(min-width: 900px) 260px, 92vw" />
              <p><span className="tr-w">{TRUST.sometimesWord}</span> {TRUST.sometimes}</p>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="tr-pc">
              <Image src={asset("/img/trust/flowers-door.webp")} alt={TRUST_PHOTOS[2].alt} width={960} height={1200} loading="lazy" sizes="(min-width: 900px) 260px, 92vw" />
              <p><span className="tr-w">{TRUST.andSometimesWord}</span> {TRUST.andSometimes}</p>
            </article>
          </Reveal>
        </div>
        <Reveal>
          <p className="tr-mid">
            {TRUST.moments.map((m, i) => (typeof m === "string" ? <span key={i}>{m}</span> : <span key={i} className="tr-k">{m.k}</span>))}
          </p>
        </Reveal>
      </div>

      <div className="tr-dark">
        <div className="lx-wrap tr-dk">
          <Reveal>
            <div className="tr-gl" aria-hidden="true" />
            <p>{TRUST.closing}</p>
            <p className="tr-there">{TRUST.there}</p>
          </Reveal>
        </div>
      </div>

      {open >= 0 && <Viewer index={open} onClose={close} onStep={step} />}

      <style dangerouslySetInnerHTML={{ __html: `
        .tr-section { position: relative; background: #ffffff; padding-top: var(--lx-section); overflow: clip; }
        .tr-head { margin-bottom: 0; }
        .tr-title { margin: 0; font-family: var(--font-display); font-weight: 400; text-transform: uppercase; letter-spacing: 0.02em;
          font-size: 76px; line-height: 1.02; color: var(--lx-ink); }
        .tr-l2 { color: #008486; }
        .tr-mark { position: relative; display: inline-block; }
        .tr-swash { position: absolute; left: -2%; width: 106%; bottom: -12px; height: 17px; overflow: visible; }
        .tr-lead { margin: 36px auto 0; max-width: 54ch; font-size: clamp(17px, 1.5vw, 21px); line-height: 1.6; font-weight: 500; color: var(--lx-ink); }
        .tr-lead strong { color: var(--tmasi-teal); font-weight: 700; }
        @media (max-width: 999px) {
          .tr-title { font-size: clamp(40px, 12.3vw, 60px); }
          .tr-l1, .tr-l2 { display: block; }
          .tr-swash { bottom: -8px; height: 12px; }
        }

        .tr-mq { margin-top: clamp(48px, 6vw, 88px); display: flex; flex-direction: column; gap: clamp(10px, 1.2vw, 16px);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
        .tr-row { display: flex; width: max-content; gap: clamp(10px, 1.2vw, 16px); animation: tr-slide 70s linear infinite; }
        .tr-row--rev { animation-direction: reverse; animation-duration: 80s; }
        .tr-mq:hover .tr-row, .tr-mq:focus-within .tr-row { animation-play-state: paused; }
        @keyframes tr-slide { from { transform: translateX(0); } to { transform: translateX(calc(-50% - clamp(5px, 0.6vw, 8px))); } }
        .tr-tile { position: relative; flex: 0 0 auto; height: clamp(210px, 21vw, 300px); padding: 0; margin: 0; border: 0; border-radius: 18px;
          overflow: hidden; cursor: zoom-in; background: var(--tmasi-indigo-blue); box-shadow: 0 1px 2px rgba(15,32,92,0.08), 0 20px 40px -22px rgba(15,32,92,0.5); }
        .tr-row--rev .tr-tile { height: clamp(180px, 18vw, 260px); }
        .tr-tile img { height: 100%; width: auto; display: block; transition: transform .9s cubic-bezier(0.22,1,0.36,1); }
        .tr-tile:hover img { transform: scale(1.05); }
        .tr-tile::after { content: ""; position: absolute; inset: auto 0 0 0; height: 45%; background: linear-gradient(180deg, rgba(8,17,51,0), rgba(8,17,51,0.5)); pointer-events: none; }
        .tr-tile .tr-tag { position: absolute; left: 12px; bottom: 12px; z-index: 1; }
        .tr-tile:focus-visible { outline: 3px solid var(--tmasi-teal); outline-offset: 3px; }
        .tr-tag { display: inline-flex; align-items: center; gap: 7px; padding: 7px 11px; border-radius: 999px; background: rgba(255,255,255,0.95);
          color: var(--lx-ink); font: 700 11px/1.2 var(--font-montserrat), sans-serif; letter-spacing: 0.03em; }
        .tr-tag i { width: 6px; height: 6px; border-radius: 50%; background: var(--tmasi-teal); flex: 0 0 6px; }
        .tr-tag { white-space: nowrap; }
        @media (max-width: 699px) {
          .tr-row--rev .tr-tile { height: 210px; }
          .tr-tile .tr-tag { left: 8px; bottom: 8px; }
          .tr-tag { gap: 6px; padding: 6px 9px; font-size: 10px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tr-mq { -webkit-mask-image: none; mask-image: none; }
          .tr-row { animation: none; overflow-x: auto; width: auto; padding: 0 var(--lx-gutter); scrollbar-width: none; }
          .tr-row button[aria-hidden="true"] { display: none; }
        }

        .tr-pair { margin-top: clamp(64px, 8vw, 120px); display: grid; gap: 16px; }
        .tr-pc { margin: 0; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 22px; padding: 12px 12px 22px; }
        .tr-pc img { width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 14px; display: block; }
        .tr-pc p { margin: 18px 8px 0; font-size: 16px; line-height: 1.6; color: var(--lx-ink); font-weight: 500; }
        .tr-w { display: block; font-family: var(--font-display); font-size: 40px; line-height: 0.9; color: var(--tmasi-teal); margin-bottom: 8px; }
        @media (min-width: 700px) {
          .tr-pc { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 28px; align-items: center; border-radius: 28px; padding: 18px 32px 18px 18px; }
          .tr-pc img { aspect-ratio: 4 / 5; border-radius: 18px; }
          .tr-pc p { margin: 0; font-size: 19px; }
          .tr-w { font-size: 48px; margin-bottom: 12px; white-space: nowrap; }
        }
        @media (min-width: 1100px) {
          .tr-pair { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; }
          .tr-pc { gap: 24px; padding-right: 28px; }
        }
        .tr-mid { margin: clamp(48px, 6vw, 96px) auto 0; max-width: 68ch; text-align: center; font-size: clamp(16px, 1.3vw, 18px); line-height: 1.85; color: #54606E; }
        .tr-k { color: var(--lx-ink); font-weight: 600; background: linear-gradient(transparent 62%, rgba(0,154,156,0.18) 62%); }

        .tr-dark { margin-top: clamp(72px, 8vw, 120px); background: var(--tmasi-indigo-deep); color: #ffffff; padding-block: clamp(72px, 8vw, 120px); }
        .tr-dk { text-align: center; }
        .tr-gl { width: 56px; height: 1px; background: #C9973A; margin: 0 auto 28px; }
        .tr-dk p { margin: 0; font-size: clamp(17px, 1.5vw, 21px); line-height: 1.6; color: rgba(255,255,255,0.82); font-weight: 500; }
        .tr-dk .tr-there { margin-top: 16px; font-family: var(--font-display); font-size: clamp(56px, 9vw, 128px); line-height: 0.9; font-weight: 400;
          background: linear-gradient(135deg, #7FE0E1, #009A9C 55%, #007AB5); -webkit-background-clip: text; background-clip: text; color: transparent; }

        .tr-lb { position: fixed; inset: 0; z-index: 1000; background: rgba(8,17,51,0.95); display: flex; align-items: center; justify-content: center; padding: 72px 16px 32px; }
        .tr-lb-fig { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .tr-lb-img { max-height: min(74vh, 860px); max-width: min(92vw, 760px); width: auto; height: auto; border-radius: 16px; display: block; }
        .tr-lb-fig figcaption { display: flex; align-items: center; gap: 14px; color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 600; }
        .tr-lb-row { display: flex; gap: 16px; }
        .tr-lb-b { width: 52px; height: 52px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.06); color: #ffffff;
          display: grid; place-items: center; cursor: pointer; }
        .tr-lb-b:hover, .tr-lb-b:focus-visible { border-color: #7FE0E1; color: #7FE0E1; }
        .tr-lb-x { position: absolute; top: 16px; right: 16px; }
      ` }} />
    </section>
  );
}
