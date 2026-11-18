"use client";

/* WhatsApp always one move away, theme F (Ms. Irina, 2026-11-18, canvas EHR1TvKpp3Tfamj14uEz9T, his picks).
   Desktop (1024px and up), WA2 option A: near the top of the page an open white pill with a charcoal frame,
   "WhatsApp Us 24/7" and the small living green dot; past 200px it folds into a 58px white disc with a charcoal
   ring, the glyph and the dot on its shoulder. While it is open on the home it rests just above the hero's
   burgundy strip (the translate property, set per frame), so it never covers the promises.
   Phones and tablets (under 1024px), WA3 option F, the concierge dock: once the hero has scrolled away, a frosted
   white bar at the foot of the screen with a round burgundy call button and the full width option 00 WhatsApp
   button. It replaces the round floating button there; the footer leaves room for it.
   Both hide while the menu, an opening card or a film is up (has-layer, and the layers themselves in CSS).
   Only transform, opacity and colour move. The tracking attributes are the ones the float always had. */
import { useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";
import { WaDot, WhatsAppGlyph } from "@/components/ui/Icon";
import { PHONE } from "@/data/facts";
import { telHref, waHref } from "@/lib/wa";

const OPEN_ABOVE = 200;
const DESK = 1024;

export function WhatsAppFloat({ label, aria }: { label: string; aria: string }) {
  const [small, setSmall] = useState(false);
  const [dock, setDock] = useState(false);
  const float = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const vh = window.innerHeight;
      const desk = window.innerWidth >= DESK;
      const folded = window.scrollY > OPEN_ABOVE;
      setSmall(folded);
      /* Desktop: while the pill is open it rests just above the hero's strip (it rides up with it); once it
         folds, the disc sits in the corner. Set every frame, without a transition, so it tracks the strip. */
      const el = float.current;
      const strip = desk && !folded ? document.querySelector<HTMLElement>(".hero-strip") : null;
      let lift = 0;
      if (el && strip) {
        const natural = vh - (parseFloat(getComputedStyle(el).bottom) || 0);
        lift = Math.max(0, Math.round(natural - strip.getBoundingClientRect().top + 12));
      }
      el?.style.setProperty("--lift", `${lift}px`);
      /* Phones: the dock comes once the hero (or the page hero) has mostly scrolled away. */
      const hero = document.querySelector<HTMLElement>(".hero, .ph");
      setDock(!desk && !(hero && hero.getBoundingClientRect().bottom > vh * 0.55));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <a ref={float} href={waHref("homepage")} target="_blank" rel="noopener" className={`wa-float v6 ${small ? "small" : ""}`} aria-label={aria}
        data-ev="whatsapp_medical_click" data-placement="floating">
        <span className="wa-pill" aria-hidden="true"><WaDot /><b>{label}</b></span>
        <span className="g" aria-hidden="true"><WhatsAppGlyph size={24} /><WaDot /></span>
      </a>
      <div className={`wa-dock v6 ${dock ? "on" : ""}`}>
        <a href={telHref} className="dock-call" aria-label={`Call ${PHONE.display}`} data-ev="phone_click" data-placement="floating">
          <Phone size={19} strokeWidth={1.8} aria-hidden="true" />
        </a>
        <a href={waHref("homepage")} target="_blank" rel="noopener" className="btn btn-wa dock-wa" data-ev="whatsapp_medical_click" data-placement="floating">
          <WaDot /><span>{label}</span>
        </a>
      </div>
    </>
  );
}
