"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import SocialLinks from "./SocialLinks";
import QuoteModal from "./QuoteModal";
import { useSite } from "./site/SiteProvider";
import { asset } from "@/lib/asset";

export default function Footer() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { live, ui, links } = useSite();
  const egypt = live.shell.offices[0];
  const quickLinks = [links.home, links.about, links.services, links.contact, links.blog]
    .map((href, i) => ({ name: live.shell.footerNav[i] || "", href: href || "" }))
    .filter((l) => l.href && l.name);
  const closeQuote = useCallback(() => setQuoteOpen(false), []);

  return (
    <footer id="footi" style={{ background: "#0F205C", color: "#ffffff", position: "relative", overflow: "hidden" }}>
      {/* Top CTA Banner in Footer */}
      <div style={{ background: "var(--lx-field)", padding: "60px 0" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "30px" }}>
          <div>
            <h2 className="headline-titling" style={{ fontSize: "36px", marginBottom: "8px", color: "#ffffff" }}>{ui.partnerTitle}</h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.9)", margin: 0, maxWidth: "700px" }}>
              {ui.partnerText}
            </p>
          </div>
          <div className="band-actions">
            <button type="button" className="band-btn band-btn--solid hover-scale" onClick={() => setQuoteOpen(true)} aria-haspopup="dialog">
              {live.shell.quote.submit}
            </button>
            <a href="mailto:info@tmasi.net" className="band-btn band-btn--line hover-scale">
              {ui.getInTouch} <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container" style={{ padding: "80px 20px 40px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "60px", marginBottom: "60px" }}>

          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "24px" }}>
              <Image src={asset("/img/logo-header.png")} alt="TMASI Global Logo" width={150} height={51} style={{ filter: "brightness(0) invert(1)", height: "auto" }} />
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.8, marginBottom: "24px" }}>
              {live.home.about.lead[0]}<br />
              {live.home.about.lead[1]}
            </p>
            <SocialLinks tone="dark" />
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, marginBottom: "24px", letterSpacing: "1px", textTransform: "uppercase" }}>{ui.quickLinks}</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link href={link.href} style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", textDecoration: "none", transition: "color 0.3s" }} className="hover-text-teal">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, marginBottom: "24px", letterSpacing: "1px", textTransform: "uppercase" }}>{live.home.services.title}</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {live.home.services.groups.map((g, i) => ({ name: g.title, href: links.groups[i] || links.services })).map(service => (
                <li key={service.name}>
                  <Link href={service.href} style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", textDecoration: "none", transition: "color 0.3s" }} className="hover-text-teal">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, marginBottom: "24px", letterSpacing: "1px", textTransform: "uppercase" }}>{live.shell.footerNav[3]}</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <MapPin size={20} color="var(--tmasi-teal)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.6 }}>{egypt.name}<br/>{egypt.address}</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Phone size={20} color="var(--tmasi-teal)" style={{ flexShrink: 0 }} />
                <a href={`tel:${egypt.tel}`} style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", textDecoration: "none", transition: "color 0.3s" }} className="hover-text-teal">
                  {egypt.phone}
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Mail size={20} color="var(--tmasi-teal)" style={{ flexShrink: 0 }} />
                <a href={`mailto:${egypt.email}`} style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", textDecoration: "none", transition: "color 0.3s" }} className="hover-text-teal">
                  {egypt.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: 0 }}>
            &copy; {new Date().getFullYear()} {ui.copyright}
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: 0 }}>
              {ui.poweredBy}{" "}
              <a href="https://pulsemarketing.global/" target="_blank" rel="noopener" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, letterSpacing: "0.5px", textDecoration: "none" }} className="hover-text-teal">
                PULSE Marketing
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Hover Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .hover-bg-teal:hover { background: var(--tmasi-teal) !important; color: white !important; }
        .hover-text-teal:hover { color: var(--tmasi-teal) !important; }
        @media (hover: hover) and (pointer: fine) { .hover-scale:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); } }
        .band-actions { display: flex; flex-wrap: wrap; gap: 14px; }
        .band-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 54px; padding: 0 30px;
          border-radius: 999px; font-family: inherit; font-weight: 700; font-size: 15px; cursor: pointer; text-decoration: none;
          transition: transform .3s, box-shadow .3s, background-color .25s, color .25s;
        }
        .band-btn--solid { background: #ffffff; color: #0F205C; border: none; }
        .band-btn--line { background: transparent; color: #ffffff; border: 1px solid rgba(255,255,255,0.7); }
        .band-btn--line:hover { background: rgba(255,255,255,0.12); color: #ffffff; }
        @media (max-width: 600px) { .band-actions { width: 100%; } .band-btn { flex: 1 1 100%; } }
      `}} />
      <QuoteModal open={quoteOpen} onClose={closeQuote} />
    </footer>
  );
}
