"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe, MessageCircle } from "lucide-react";
import SocialLinks from "./SocialLinks";
import { useSite } from "./site/SiteProvider";
import { asset } from "@/lib/asset";
import { UI, type Lang } from "@/content/ui";

const LANGS: Lang[] = ["en", "de", "pl", "es"];
const HOME_OF: Record<Lang, string> = { en: "/", de: "/de/", pl: "/pl/", es: "/es/" };
// The live German menu says "Uber uns"; its footer spells it "Über uns". Spelling fix, logged.
const fixSpelling = (t: string) => t.replace(/^Uber uns$/, "Über uns");

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { lang, live, ui, links, alternates } = useSite();
  const activeLang = lang.toUpperCase();
  // Menu labels exactly as each language's live header; each opens the page in that language.
  const NAV = [links.home, links.about, links.services, links.contact, links.blog]
    .map((href, i) => ({ name: fixSpelling(live.shell.nav[i] || ""), href: href || "" }))
    .filter((n) => n.href && n.name);
  // The language switch opens the same page in the other language (or its home if that page has none).
  const languages = LANGS.map((code) => ({ code: code.toUpperCase(), name: UI[code].langName, href: alternates[code] || HOME_OF[code] }));

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Click outside to close lang dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`main-header${scrolled ? " is-scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          // The scroll change runs on the compositor (2026-10-05): the header slides up and its row slides back
          // down by half, so it looks shorter without any layout work, and the glass background fades in as a
          // layer (.main-header::before below). It used to animate padding, which re-laid it out every frame.
          padding: "24px 0",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>

          <Link href={links.home} aria-label="TMASI Global Home" style={{ display: "flex", alignItems: "center", zIndex: 101 }}>
            <Image
              src={asset("/img/logo-header.png")}
              alt="TMASI Global Logo"
              width={200}
              height={96}
              priority
              style={{
                filter: scrolled ? "none" : "brightness(0) invert(1)",
                height: "auto",
                transition: "filter 0.4s var(--ease-out), transform 0.4s var(--ease-out)"
              }}
              className="logo-img"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-only" aria-label="Main Navigation">
            <ul style={{ display: "flex", listStyle: "none", margin: 0, padding: 0, gap: "28px", alignItems: "center" }}>
              {NAV.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    style={{
                      color: scrolled ? "#1e293b" : "#ffffff",
                      fontSize: "17px",
                      fontWeight: 700,
                      textDecoration: "none",
                      transition: "color 0.3s var(--ease-out)"
                    }}
                    className={scrolled ? "hover-text-teal" : "hover-text-white"}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="desktop-only header-social">
              <SocialLinks tone={scrolled ? "light" : "dark"} size={40} />
            </div>

            {/* Animated Language Dropdown (Desktop & Mobile Friendly) */}
            <div ref={langRef} style={{ position: "relative" }}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: scrolled ? "#f8fafc" : "rgba(255,255,255,0.1)",
                  border: scrolled ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  color: scrolled ? "#0F205C" : "#ffffff",
                  fontWeight: 700,
                  fontSize: "14px",
                  padding: "8px 14px",
                  borderRadius: "100px",
                  transition: "background-color 0.3s var(--ease-out), border-color 0.3s var(--ease-out), color 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out)",
                  boxShadow: scrolled ? "none" : "0 4px 10px rgba(0,0,0,0.05)",
                  backdropFilter: scrolled ? "none" : "blur(4px)"
                }}
                className="lang-btn hover-shadow"
                aria-label={ui.language}
              >
                <Globe size={14} color={scrolled ? "var(--lx-ink)" : "#ffffff"} />
                {activeLang}
                <ChevronDown size={14} style={{ transform: langDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s var(--ease-out)" }} />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    // Grows from the button it belongs to; full transform strings so it runs on the compositor.
                    initial={{ opacity: 0, transform: "translateY(-6px) scale(0.97)" }}
                    animate={{ opacity: 1, transform: "translateY(0px) scale(1)", transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
                    exit={{ opacity: 0, transform: "translateY(-6px) scale(0.97)", transition: { duration: 0.14, ease: [0.23, 1, 0.32, 1] } }}
                    style={{
                      transformOrigin: "top right",
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: "#ffffff",
                      borderRadius: "16px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      overflow: "hidden",
                      minWidth: "150px",
                      zIndex: 110,
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    {languages.map(lang => (
                      <Link
                        key={lang.code}
                        href={lang.href}
                        hrefLang={lang.code.toLowerCase()}
                        aria-current={activeLang === lang.code ? "true" : undefined}
                        onClick={() => setLangDropdownOpen(false)}
                        style={{
                          textDecoration: "none",
                          background: activeLang === lang.code ? "rgba(0,154,156,0.05)" : "transparent",
                          border: "none",
                          padding: "14px 16px",
                          textAlign: "left",
                          cursor: "pointer",
                          color: activeLang === lang.code ? "var(--tmasi-teal)" : "#475569",
                          fontWeight: activeLang === lang.code ? 700 : 500,
                          fontSize: "14px",
                          transition: "background 0.2s, color 0.2s",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                        className="hover-bg-gray"
                      >
                        {lang.name}
                        {activeLang === lang.code && <span style={{ fontSize: "12px" }} aria-hidden="true">✓</span>}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="https://wa.me/201206788566"
              target="_blank"
              rel="noopener noreferrer"
              className="desktop-only cta-btn hover-scale"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#0F205C",
                color: "#ffffff",
                padding: "10px 24px",
                borderRadius: "100px",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
                letterSpacing: "0.5px",
                transition: "transform 0.25s var(--ease-out), background-color 0.25s var(--ease-out)"
              }}
            >
              <MessageCircle size={14} aria-hidden="true" />
              {live.shell.call}
            </a>

            {/* Mobile Burger Menu Button */}
            <button
              className="mobile-only"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={ui.openMenu}
              style={{
                background: scrolled ? "#ffffff" : "rgba(255,255,255,0.1)",
                border: scrolled ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.2)",
                backdropFilter: scrolled ? "none" : "blur(4px)",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                boxShadow: scrolled ? "none" : "0 4px 10px rgba(0,0,0,0.05)",
                transition: "background-color 0.3s var(--ease-out), border-color 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out)"
              }}
            >
              <span style={{ display: "block", width: "20px", height: "2px", background: scrolled ? "#0F205C" : "#ffffff", transition: "0.3s" }}></span>
              <span style={{ display: "block", width: "20px", height: "2px", background: scrolled ? "#0F205C" : "#ffffff", transition: "0.3s" }}></span>
              <span style={{ display: "block", width: "20px", height: "2px", background: scrolled ? "#0F205C" : "#ffffff", transition: "0.3s" }}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Solid Mobile Menu (No glassmorphism, performance optimized) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            // The drawer slides in on the compositor (full transform strings), with the iOS drawer curve.
            initial={{ transform: "translateX(100%)" }}
            animate={{ transform: "translateX(0%)", transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } }}
            exit={{ transform: "translateX(100%)", transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              background: "#ffffff",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              padding: "24px",
              overflowY: "auto"
            }}
            role="dialog"
            aria-modal="true"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
              <Image src={asset("/img/logo-header.png")} alt="TMASI Global Logo" width={130} height={44} style={{ mixBlendMode: "multiply" }} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label={ui.closeMenu}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "44px", height: "44px", fontSize: "24px", color: "#0F205C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                &times;
              </button>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "24px", flexGrow: 1 }}>
              {NAV.map((item, i) => (
                <li key={item.name} className="mm-item" style={{ "--i": i } as React.CSSProperties}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ color: "#0F205C", fontSize: "22px", fontWeight: 800, textDecoration: "none", display: "block", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
              <SocialLinks tone="light" size={44} />
            </div>

            <a
              href="https://wa.me/201206788566"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "#0F205C",
                color: "#ffffff",
                padding: "18px",
                borderRadius: "100px",
                fontWeight: 800,
                fontSize: "16px",
                textDecoration: "none",
                marginTop: "30px",
                marginBottom: "20px"
              }}
            >
              <MessageCircle size={20} aria-hidden="true" />
              {live.shell.call}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global overrides for header layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 992px) {
          .mobile-only { display: none !important; }
          /* Bigger header on desktop [Mohamed, 2026-09-28]; phones keep their sizes. */
          .main-header .logo-img { max-height: none !important; height: 64px !important; width: auto !important; }
          /* Scrolled: the logo scales to 54px tall instead of jumping to a new height. */
          .main-header .logo-img { transform-origin: left center; }
          .main-header.is-scrolled .logo-img { transform: scale(0.844); }
          .main-header { --hdr-t: 34px; }
          .main-header .cta-btn { padding: 13px 28px !important; }
          .main-header .lang-btn { padding: 10px 16px !important; }
        }
        @media (max-width: 991px) {
          .desktop-only { display: none !important; }
          .logo-img { width: 110px !important; height: auto !important; }
        }
        /* The scroll change (2026-10-05). Shrink: the header moves up by --hdr-t and its row back down by half
           (phone 24px: 96 to 72 tall; desktop 34px: 112 to 78). Glass: a layer that only fades; its blur switches
           on at once when it appears and off only after it has faded out. */
        .main-header { transition: transform 0.4s var(--ease-out); }
        .main-header > .container { transition: transform 0.4s var(--ease-out); }
        .main-header.is-scrolled { transform: translate3d(0, calc(-1 * var(--hdr-t, 24px)), 0); }
        .main-header.is-scrolled > .container { transform: translate3d(0, calc(var(--hdr-t, 24px) / 2), 0); }
        .main-header::before {
          content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
          background: rgba(255, 255, 255, 0.95); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.06);
          opacity: 0; -webkit-backdrop-filter: none; backdrop-filter: none;
          transition: opacity 0.35s var(--ease-out), backdrop-filter 0s linear 0.35s, -webkit-backdrop-filter 0s linear 0.35s;
        }
        .main-header.is-scrolled::before {
          opacity: 1; -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
          transition: opacity 0.35s var(--ease-out);
        }
        /* Phone menu links rise in one after another as the drawer arrives. */
        @keyframes mm-in { from { opacity: 0; transform: translate3d(0, 10px, 0); } to { opacity: 1; transform: none; } }
        .mm-item { animation: mm-in 0.4s var(--ease-out) both; animation-delay: calc(120ms + var(--i, 0) * 40ms); }
        @media (prefers-reduced-motion: reduce) {
          .main-header, .main-header > .container, .main-header .logo-img { transition: none !important; }
          .mm-item { animation: none; }
        }
        /* Hover only where there is a real pointer: a tap on a phone must not leave a button lifted. */
        .hover-text-teal:hover { color: var(--tmasi-teal) !important; }
        @media (hover: hover) and (pointer: fine) {
          .hover-bg-gray:hover { background: rgba(0,0,0,0.03) !important; }
          .hover-scale:hover { transform: translateY(-2px); }
          .cta-btn:hover { background: var(--tmasi-teal) !important; }
          .lang-btn:hover { border-color: var(--tmasi-teal) !important; }
        }
        .hover-scale:active { transform: scale(0.97); }
      `}} />
    </>
  );
}
