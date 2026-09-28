"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer id="footi" style={{ background: "#0F205C", color: "#ffffff", position: "relative", overflow: "hidden" }}>
      {/* Top CTA Banner in Footer */}
      <div style={{ background: "linear-gradient(90deg, var(--tmasi-teal) 0%, #007AB5 100%)", padding: "60px 0" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "30px" }}>
          <div>
            <h2 className="headline-titling" style={{ fontSize: "36px", marginBottom: "8px", color: "#ffffff" }}>READY TO PARTNER WITH TMASI GLOBAL?</h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.9)", margin: 0, maxWidth: "700px" }}>
              Join our network of international insurers, corporations, and travel agencies today.
            </p>
          </div>
          <a href="mailto:info@tmasi.net" style={{ background: "#ffffff", color: "#0F205C", padding: "16px 32px", borderRadius: "30px", fontWeight: 700, fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "10px", transition: "transform 0.3s, box-shadow 0.3s" }} className="hover-scale">
            Get in Touch <ArrowRight size={18} />
          </a>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container" style={{ padding: "80px 20px 40px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "60px", marginBottom: "60px" }}>
          
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "24px" }}>
              <Image src="/tmasi/v3/img/logo-header.png" alt="TMASI Global Logo" width={150} height={51} style={{ filter: "brightness(0) invert(1)", height: "auto" }} />
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.8, marginBottom: "24px" }}>
              Leading provider of medical, travel, insurance, and tourism assistance.<br />
              Operations spanning Germany, Spain, USA, UAE, and Egypt.
            </p>
            <SocialLinks tone="dark" />
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, marginBottom: "24px", letterSpacing: "1px" }}>QUICK LINKS</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { name: "Home", href: "#hero" },
                { name: "About", href: "#about" },
                { name: "Services", href: "#services" },
                { name: "Contact Us", href: "#offices" },
                { name: "Blog", href: "#blog" }
              ].map(link => (
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
            <h4 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, marginBottom: "24px", letterSpacing: "1px" }}>OUR SERVICES</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Medical Assistance Services", "Elite Medical Concierge Services", "Travel Assistance Services", "Medical Tourism Services", "Insurance Assistance", "Additional Services"].map(service => (
                <li key={service}>
                  <Link href="#services" style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", textDecoration: "none", transition: "color 0.3s" }} className="hover-text-teal">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, marginBottom: "24px", letterSpacing: "1px" }}>CONTACT US</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <MapPin size={20} color="var(--tmasi-teal)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.6 }}>Egypt Office<br/>Airport Road, Hurghada, Red Sea, Egypt.</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Phone size={20} color="var(--tmasi-teal)" style={{ flexShrink: 0 }} />
                <a href="tel:+201206788566" style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", textDecoration: "none", transition: "color 0.3s" }} className="hover-text-teal">
                  +20 120 678 8566
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Mail size={20} color="var(--tmasi-teal)" style={{ flexShrink: 0 }} />
                <a href="mailto:egypt@tmasi.net" style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", textDecoration: "none", transition: "color 0.3s" }} className="hover-text-teal">
                  egypt@tmasi.net
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: 0 }}>
            &copy; {new Date().getFullYear()} TMASI Global. Part of Healthcare International Group.
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: 0 }}>
              Powered by{" "}
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
        .hover-scale:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      `}} />
    </footer>
  );
}
