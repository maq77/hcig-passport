"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe, PhoneCall } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const langRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "EN", name: "English" },
    { code: "DE", name: "Deutsch" },
    { code: "PL", name: "Polski" },
    { code: "ES", name: "Español" }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
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
        className="main-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          background: scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.06)" : "none",
          padding: scrolled ? "12px 0" : "24px 0",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
          
          <Link href="#hero" aria-label="TMASI Global Home" style={{ display: "flex", alignItems: "center", zIndex: 101 }}>
            <Image
              src="/tmasi/v3/img/logo-header.png"
              alt="TMASI Global Logo"
              width={140}
              height={48}
              priority
              style={{ 
                mixBlendMode: scrolled ? "multiply" : "normal", 
                filter: scrolled ? "none" : "brightness(0) invert(1)", 
                height: "auto", 
                transition: "all 0.3s" 
              }}
              className="logo-img"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-only" aria-label="Main Navigation">
            <ul style={{ display: "flex", listStyle: "none", margin: 0, padding: 0, gap: "28px", alignItems: "center" }}>
              {[
                { name: "Home", href: "#hero" },
                { name: "About Us", href: "#about" },
                { name: "Values", href: "#values" },
                { name: "Why Us", href: "#why" },
                { name: "Services", href: "#services" },
                { name: "Global Hubs", href: "#offices" }
              ].map(item => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    style={{ 
                      color: scrolled ? "#1e293b" : "#ffffff", 
                      fontSize: "14px", 
                      fontWeight: 600, 
                      textDecoration: "none", 
                      transition: "color 0.2s" 
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
                  fontSize: "13px",
                  padding: "8px 14px",
                  borderRadius: "100px",
                  transition: "all 0.2s",
                  boxShadow: scrolled ? "none" : "0 4px 10px rgba(0,0,0,0.05)",
                  backdropFilter: scrolled ? "none" : "blur(4px)"
                }}
                className="lang-btn hover-shadow"
                aria-label="Select Language"
              >
                <Globe size={14} color={scrolled ? "var(--tmasi-teal)" : "#ffffff"} />
                {activeLang}
                <motion.div animate={{ rotate: langDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} />
                </motion.div>
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{
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
                      <button
                        key={lang.code}
                        onClick={() => {
                          setActiveLang(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        style={{
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
                        {activeLang === lang.code && <span style={{ fontSize: "12px" }}>✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a 
              href="tel:+201206788566" 
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
                fontSize: "13px",
                textDecoration: "none",
                letterSpacing: "0.5px",
                transition: "transform 0.3s, background 0.3s"
              }}
            >
              <PhoneCall size={14} />
              CALL TEAM
            </a>

            {/* Mobile Burger Menu Button */}
            <button
              className="mobile-only"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Toggle navigation menu"
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
                transition: "all 0.3s"
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
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
              <Image src="/tmasi/v3/img/logo-header.png" alt="TMASI Global Logo" width={130} height={44} style={{ mixBlendMode: "multiply" }} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "44px", height: "44px", fontSize: "24px", color: "#0F205C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                &times;
              </button>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "24px", flexGrow: 1 }}>
              {[
                { name: "Home", href: "#hero" },
                { name: "About Us", href: "#about" },
                { name: "Values", href: "#values" },
                { name: "Why Us", href: "#why" },
                { name: "Services", href: "#services" },
                { name: "Global Hubs", href: "#offices" },
                { name: "Blog", href: "#blog" },
                { name: "Contact", href: "#footi" }
              ].map(item => (
                <li key={item.name}>
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
            
            <a 
              href="tel:+201206788566" 
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
              <PhoneCall size={20} />
              CALL THE TEAM
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Global overrides for header layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 992px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 991px) {
          .desktop-only { display: none !important; }
          .logo-img { width: 110px !important; height: auto !important; }
        }
        .hover-bg-gray:hover { background: rgba(0,0,0,0.03) !important; }
        .hover-text-teal:hover { color: var(--tmasi-teal) !important; }
        .hover-scale:hover { transform: translateY(-2px); }
        .cta-btn:hover { background: var(--tmasi-teal) !important; }
        .lang-btn:hover { border-color: var(--tmasi-teal) !important; }
      `}} />
    </>
  );
}
