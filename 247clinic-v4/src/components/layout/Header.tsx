"use client";

/* Header, redesigned 2026-09-23 (the user: "completely re design header").
   Desktop: a slim top bar with the brief's three promises, email and phone, over a
   sticky main bar (logo, the brief's seven nav items, red call, green WhatsApp).
   Phone: logo, green "Need a Doctor?", menu. The menu slides in from the right. */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Clock, Globe, Mail, Menu, Phone, ShieldCheck, X } from "lucide-react";
import { CallButton, WaButton } from "@/components/ui/Buttons";
import { asset, BASE, PHONE } from "@/data/facts";
import { NAV } from "@/data/nav";
import { telHref } from "@/lib/wa";

type Labels = { nav: string[]; waLong: string; waShort: string; promises: string[]; email: string; address: string; accredited: string; partOf: string };

const PROMISE_ICONS = [Clock, ShieldCheck, Globe];

export function Header({ labels }: { labels: Labels }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); menuRef.current?.focus(); };
  }, [open]);

  const links = NAV.map((n, i) => ({ href: `${BASE}${n.path}`, label: labels.nav[i], home: n.path === "/" }));

  return (
    <>
      <div className="topbar">
        <div className="topbar-in">
          <ul className="promises">
            {labels.promises.map((p, i) => {
              const Ico = PROMISE_ICONS[i] ?? Clock;
              return <li key={p}><Ico size={15} aria-hidden="true" />{p}</li>;
            })}
          </ul>
          <div className="topbar-contact">
            <a href={`mailto:${labels.email}`}><Mail size={15} aria-hidden="true" />{labels.email}</a>
            <a href={telHref} className="tb-phone" data-ev="phone_click" data-placement="topbar"><Phone size={15} aria-hidden="true" />{PHONE.display}</a>
          </div>
        </div>
      </div>

      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="hdr">
          <a href={`${BASE}/`} className="logo" aria-label="24/7 Clinic">
            <img src={asset("/logos/marks/247-mark.svg")} alt="24/7 Clinic" width={60} height={58} />
          </a>
          <nav className="nav" aria-label="Main">
            {links.map((l) => (
              <a key={l.href} href={l.href} aria-current={l.home ? "page" : undefined}><span>{l.label}</span></a>
            ))}
          </nav>
          <div className="hdr-actions">
            <CallButton placement="header" iconOnly className="hdr-call" />
            <WaButton placement="header" small className="wa-long">{labels.waLong}</WaButton>
            <WaButton placement="header" small className="wa-short">{labels.waShort}</WaButton>
            <button ref={menuRef} className="menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)}>
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="sheet-scrim" onClick={() => setOpen(false)} aria-hidden="true"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
            <motion.div className="sheet" role="dialog" aria-modal="true" aria-label="Menu"
              initial={reduce ? { opacity: 0 } : { x: "100%" }} animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
              <div className="sheet-top">
                <img src={asset("/logos/marks/247-mark.svg")} alt="24/7 Clinic" width={44} height={42} />
                <button ref={closeRef} className="menu-btn" aria-label="Close" onClick={() => setOpen(false)}>
                  <X size={24} aria-hidden="true" />
                </button>
              </div>
              <nav aria-label="Main">
                {links.map((l, i) => (
                  <motion.a key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={l.home ? "page" : undefined}
                    initial={reduce ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <span>{l.label}</span>
                    <ArrowRight size={20} aria-hidden="true" />
                  </motion.a>
                ))}
              </nav>
              <div className="sheet-actions">
                <WaButton placement="menu" block>{labels.waLong}</WaButton>
                <CallButton placement="menu" className="btn-block" />
              </div>
              <ul className="sheet-info">
                <li><Mail size={16} aria-hidden="true" /><a href={`mailto:${labels.email}`}>{labels.email}</a></li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
