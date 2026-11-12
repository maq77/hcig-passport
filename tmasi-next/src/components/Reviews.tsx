"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Reveal from "./Reveal";
import { FLAG, FLAG_ROW, REVIEWS, REVIEWS_TEXT as T, type Review } from "@/content/reviews";
import { asset } from "@/lib/asset";

// Home guest reviews (2026-11-12): canvas board "Reviews C. Moving wall", as he approved it.
// Two rows of real guest reviews drift in opposite directions; a card opens the full review in a popup.
// Less motion: the rows stand still and scroll sideways by hand instead.

const ROWS = [REVIEWS.slice(0, 5), REVIEWS.slice(5)];
const N = REVIEWS.length;

const initials = (name: string) => {
  const p = name.split(" ");
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
};
const pad = (n: number) => String(n).padStart(2, "0");
const flagSrc = (code: string) => asset(`/img/flags/${code}.svg`);

function Flag({ country }: { country: string }) {
  const code = FLAG[country];
  if (!code) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="rvw-flag" src={flagSrc(code)} alt="" width={20} height={15} />;
}

function Seal({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>
      <path fill="#1A73E8" d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12z" />
      <path fill="#fff" d="M10.09 16.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48z" />
    </svg>
  );
}

function Popup({ index, onClose, onStep }: { index: number; onClose: () => void; onStep: (d: number) => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const r: Review = REVIEWS[index];
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
    <div className="rvw-ov" onClick={onClose}>
      <div className="rvw-mod" role="dialog" aria-modal="true" aria-label={`Review by ${r.name}`} lang="en" onClick={(e) => e.stopPropagation()}>
        <button ref={closeBtn} type="button" className="rvw-x" onClick={onClose} aria-label={T.close}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="rvw-top">
          <span className={`rvw-mono rvw-t${index % 3}`} aria-hidden="true">{initials(r.name)}</span>
          <div>
            <div className="rvw-nm">{r.name}<Seal label={T.verified} /></div>
            <div className="rvw-ct rvw-cty"><Flag country={r.country} />{r.country} · {T.verified} · {T.form}</div>
          </div>
        </div>
        <p className="rvw-q rvw-q--full" lang={r.lang || "en"}>{r.text}</p>
        {r.tr && <p className="rvw-trn"><b>{T.translated}</b>{r.tr}</p>}
        <div className="rvw-mnav">
          <button type="button" onClick={() => onStep(-1)}>{T.prev}</button>
          <span className="rvw-ct">{pad(index + 1)} / {pad(N)}</span>
          <button type="button" onClick={() => onStep(1)}>{T.next}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function Reviews() {
  const [open, setOpen] = useState(-1);
  const close = useCallback(() => setOpen(-1), []);
  const step = useCallback((d: number) => setOpen((o) => (o + d + N) % N), []);

  return (
    <section id="reviews" className="rvw-section" aria-labelledby="reviews-title" lang="en">
      <Reveal>
        <div className="rvw-head">
          <h2 id="reviews-title">{T.title}</h2>
          <div className="rvw-sub">
            <Seal />
            <span><b>{T.count}</b> {T.source}</span>
          </div>
          <div className="rvw-globe" aria-hidden="true">
            {FLAG_ROW.map((c, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={c} src={flagSrc(c)} alt="" width={34} height={34} style={{ animationDelay: k * 80 + "ms" }} />
            ))}
            <span style={{ animationDelay: FLAG_ROW.length * 80 + "ms" }}>+</span>
          </div>
        </div>
      </Reveal>

      <div className="rvw-rows">
        {ROWS.map((row, ri) => (
          <div key={ri} className={`rvw-row${ri ? " rvw-rev" : ""}`}>
            {[0, 1].map((copy) =>
              row.map((r) => {
                const i = REVIEWS.indexOf(r);
                return (
                  <button
                    key={`${copy}-${i}`}
                    type="button"
                    className="rvw-card"
                    onClick={() => setOpen(i)}
                    aria-label={`Read the review by ${r.name}`}
                    aria-hidden={copy ? true : undefined}
                    tabIndex={copy ? -1 : undefined}
                  >
                    <span className="rvw-top">
                      <span className={`rvw-mono rvw-t${i % 3}`} aria-hidden="true">{initials(r.name)}</span>
                      <span>
                        <span className="rvw-nm">{r.name}<Seal /></span>
                        <span className="rvw-ct rvw-cty"><Flag country={r.country} />{r.country}</span>
                      </span>
                    </span>
                    <span className="rvw-q" lang={r.lang || "en"}>{r.text}</span>
                    <span className="rvw-foot">
                      <span className="rvw-vchip"><Seal />{T.verified}</span>
                      <span className="rvw-rd">{T.read}</span>
                    </span>
                  </button>
                );
              }),
            )}
          </div>
        ))}
      </div>

      {open >= 0 && <Popup index={open} onClose={close} onStep={step} />}

      <style dangerouslySetInnerHTML={{ __html: `
        .rvw-section { background: #F8FAFC; padding: 96px 0 100px; border-top: 1px solid #E2E8F0; overflow: clip; }
        .rvw-head { text-align: center; padding: 0 48px; margin-bottom: 44px; }
        .rvw-head::before { content: ""; display: block; width: 40px; height: 2px; background: #009A9C; margin: 0 auto 22px; }
        .rvw-head h2 { margin: 0; font-family: var(--font-display), sans-serif; font-weight: 400; font-size: 58px; line-height: 1.02; letter-spacing: 0.02em; color: #0F205C; text-transform: uppercase; }
        .rvw-sub { display: inline-flex; align-items: center; gap: 10px; margin-top: 18px; font-size: 16px; color: #54606E; }
        .rvw-sub b { color: #0F205C; }
        .rvw-sub svg { width: 24px; height: 24px; flex: none; }

        .rvw-cty { display: flex; align-items: center; gap: 7px; }
        .rvw-flag { width: 20px; height: 15px; border-radius: 3px; object-fit: cover; flex: none; box-shadow: 0 0 0 1px rgba(15,32,92,0.14); }
        .rvw-globe { display: flex; justify-content: center; margin-top: 22px; }
        .rvw-globe img, .rvw-globe span { width: 34px; height: 34px; box-sizing: border-box; border-radius: 50%; border: 3px solid #fff; margin-left: -8px;
          box-shadow: 0 4px 12px rgba(15,32,92,0.16); animation: rvw-fin .7s cubic-bezier(.16,1,.3,1) both; }
        .rvw-globe img { object-fit: cover; transition: transform .4s cubic-bezier(.34,1.56,.64,1); }
        .rvw-globe img:first-child { margin-left: 0; }
        .rvw-globe span { background: #0F205C; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; line-height: 1; }
        @media (hover: hover) { .rvw-globe img:hover { transform: translateY(-4px) scale(1.12); position: relative; z-index: 2; } }
        @keyframes rvw-fin { from { opacity: 0; transform: translateY(10px) scale(.8); } }

        .rvw-rows { --rvw-gap: 20px; display: flex; flex-direction: column; gap: var(--rvw-gap);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
        .rvw-row { display: flex; gap: var(--rvw-gap); width: max-content; animation: rvw-mq 70s linear infinite; }
        .rvw-row.rvw-rev { animation-direction: reverse; animation-duration: 80s; }
        .rvw-rows:hover .rvw-row, .rvw-rows:focus-within .rvw-row { animation-play-state: paused; }
        @keyframes rvw-mq { to { transform: translateX(calc(-50% - var(--rvw-gap) / 2)); } }

        .rvw-card { width: 380px; box-sizing: border-box; text-align: left; background: #fff; border: 1px solid #E2E8F0; border-radius: 20px; padding: 22px 22px 18px;
          display: flex; flex-direction: column; gap: 12px; cursor: pointer; font: inherit; color: inherit;
          box-shadow: 0 1px 3px rgba(15,32,92,0.04), 0 4px 14px rgba(15,32,92,0.06);
          transition: transform .45s cubic-bezier(.16,1,.3,1), box-shadow .45s cubic-bezier(.16,1,.3,1), border-color .3s; }
        @media (hover: hover) { .rvw-card:hover { transform: translateY(-5px); border-color: #9ED9DA; box-shadow: 0 4px 12px rgba(15,32,92,0.08), 0 18px 40px rgba(15,32,92,0.12); } }
        .rvw-card:focus-visible { outline: 3px solid #009A9C; outline-offset: 3px; }
        .rvw-top { display: flex; align-items: center; gap: 12px; }
        .rvw-mono { width: 42px; height: 42px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; }
        .rvw-t0 { background: linear-gradient(135deg, #009A9C, #007AB5); }
        .rvw-t1 { background: linear-gradient(135deg, #007AB5, #0F205C); }
        .rvw-t2 { background: linear-gradient(135deg, #0F205C, #081133); }
        .rvw-nm { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 15.5px; color: #0F205C; }
        .rvw-nm svg { width: 17px; height: 17px; flex: none; }
        .rvw-ct { font-size: 13px; color: #54606E; margin-top: 2px; }
        .rvw-q { margin: 0; font-size: 15px; line-height: 1.65; color: #1C2229; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-line; }
        .rvw-foot { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 12px; border-top: 1px solid #F1F5F9; font-size: 12.5px; }
        .rvw-vchip { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: #1A73E8; }
        .rvw-vchip svg { width: 15px; height: 15px; }
        .rvw-rd { color: #007AB5; font-weight: 600; }

        .rvw-ov { position: fixed; inset: 0; z-index: 9500; background: rgba(8,17,51,0.55); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 32px; box-sizing: border-box; animation: rvw-fade .35s cubic-bezier(.23,1,.32,1); }
        @keyframes rvw-fade { from { opacity: 0; } }
        .rvw-mod { position: relative; width: min(640px, 100%); max-height: 100%; overflow-y: auto; box-sizing: border-box; background: #fff; border-radius: 24px; padding: 34px 34px 26px;
          box-shadow: 0 30px 80px rgba(8,17,51,0.35); animation: rvw-rise .55s cubic-bezier(.16,1,.3,1); font-family: var(--font-montserrat), Montserrat, system-ui, sans-serif; color: #1C2229; }
        @keyframes rvw-rise { from { opacity: 0; transform: translateY(24px) scale(.97); } }
        .rvw-q--full { display: block; -webkit-line-clamp: unset; font-size: 17px; line-height: 1.75; margin-top: 18px; }
        .rvw-trn { margin: 14px 0 0; padding: 12px 14px; background: #F8FAFC; border-radius: 12px; font-size: 14px; line-height: 1.6; color: #54606E; }
        .rvw-trn b { display: block; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #007AB5; margin-bottom: 3px; }
        .rvw-x { position: absolute; top: 14px; right: 14px; width: 44px; height: 44px; border-radius: 50%; border: 0; background: #F1F5F9; color: #0F205C; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .rvw-x:hover { background: #E2E8F0; }
        .rvw-mnav { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; padding-top: 16px; border-top: 1px solid #F1F5F9; }
        .rvw-mnav button { min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid #CBD5E1; background: #fff; color: #0F205C; font: 600 14px var(--font-montserrat), Montserrat, sans-serif; cursor: pointer; }
        .rvw-mnav button:hover { background: #0F205C; color: #fff; }
        .rvw-mod .rvw-nm, .rvw-mod .rvw-ct { font-family: inherit; }
        .rvw-mod > .rvw-top { padding-right: 52px; }

        @media (max-width: 699px) {
          .rvw-section { padding: 64px 0 72px; }
          .rvw-head { padding: 0 20px; margin-bottom: 28px; }
          .rvw-head h2 { font-size: 40px; }
          .rvw-sub { font-size: 14px; text-align: left; }
          .rvw-rows { --rvw-gap: 14px; }
          .rvw-card { width: 286px; padding: 18px 18px 14px; }
          .rvw-q { font-size: 14.5px; }
          .rvw-ov { padding: 14px; align-items: flex-end; }
          .rvw-mod { padding: 28px 20px 20px; border-radius: 24px 24px 18px 18px; }
          .rvw-q--full { font-size: 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rvw-row { animation: none; }
          .rvw-card { transition: none; }
          .rvw-globe img, .rvw-globe span { animation: none; }
          .rvw-rows { overflow-x: auto; }
          .rvw-row .rvw-card[aria-hidden="true"] { display: none; }
        }
      ` }} />
    </section>
  );
}
