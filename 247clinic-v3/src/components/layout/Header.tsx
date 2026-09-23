"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { CallButton, WaButton } from "@/components/ui/Buttons";
import { asset, BASE } from "@/data/facts";
import { NAV } from "@/data/nav";

export function Header({ labels }: { labels: { nav: string[]; waLong: string; waShort: string } }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      menuRef.current?.focus();
    };
  }, [open]);

  const links = NAV.map((n, i) => ({ href: `${BASE}${n.path}`, label: labels.nav[i], home: n.path === "/" }));

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="hdr">
        <a href={`${BASE}/`} className="logo" aria-label="24/7 Clinic">
          <img src={asset("/logos/marks/247-logo.svg")} alt="24/7 Clinic" width={52} height={50} />
        </a>
        <nav className="nav" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href} aria-current={l.home ? "page" : undefined}>{l.label}</a>
          ))}
        </nav>
        <div className="hdr-actions">
          <CallButton placement="header" iconOnly />
          <WaButton placement="header" small className="wa-long">{labels.waLong}</WaButton>
          <WaButton placement="header" small className="wa-short">{labels.waShort}</WaButton>
          <button ref={menuRef} className="menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <Menu size={24} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="sheet-top">
            <img src={asset("/logos/marks/247-logo.svg")} alt="24/7 Clinic" width={40} height={38} />
            <button ref={closeRef} className="menu-btn" aria-label="Close" onClick={() => setOpen(false)}>
              <X size={26} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Main">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                <span>{l.label}</span>
                <ArrowRight size={20} aria-hidden="true" />
              </a>
            ))}
          </nav>
          <div className="actions">
            <WaButton placement="menu" block>{labels.waLong}</WaButton>
            <CallButton placement="menu" className="btn-block" />
          </div>
        </div>
      )}
    </header>
  );
}
