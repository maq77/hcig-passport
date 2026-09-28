"use client";

import Reveal from "./Reveal";
import { MapPin, Phone, Mail } from "lucide-react";

export default function WorldMap() {
  // Office names, addresses, phones and emails word for word from the live tmasi.net footer (2026-09-26 backup).
  // The footer gives no USA email; usa@tmasi.net is from the live contacts page.
  const hubs = [
    { id: "egypt", name: "Egypt Office", address: "Airport Road, Hurghada, Red Sea, Egypt.", phone: "+20 120 678 8566", tel: "+201206788566", email: "egypt@tmasi.net" },
    { id: "germany", name: "Germany Office", address: "Leopoldstraße 244, Munich, Germany, 80807", phone: "+49 170 9350490", tel: "+491709350490", email: "germany@tmasi.net" },
    { id: "uae", name: "United Arab Emirates Office", address: "Dubai, United Arab Emirates", phone: "+971 586 824 247", tel: "+971586824247", email: "uae@tmasi.net" },
    { id: "spain", name: "Spain Office", address: "Barcelona, Spain", phone: "+34 930 414 953", tel: "+34930414953", email: "spain@tmasi.net" },
    { id: "usa", name: "USA Office", address: "Florida, USA", phone: "+1 727 591 9010", tel: "+17275919010", email: "usa@tmasi.net" }
  ];

  return (
    <section id="offices" style={{ padding: "100px 0", background: "#ffffff" }}>
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 className="headline-titling" style={{ color: "#0F205C", fontSize: "clamp(32px, 5vw, 42px)", marginBottom: "16px" }}>
              Global Operational Hubs
            </h2>
          </div>
        </Reveal>

        <div className="hubs-grid">
          {hubs.map((hub, idx) => (
            <Reveal key={hub.id} delay={0.1 * idx}>
              <div className="hub-card">
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div className="hub-icon">
                    <MapPin size={24} color="var(--tmasi-teal)" />
                  </div>
                  <div>
                    <h3 style={{ color: "#0F205C", fontSize: "20px", fontWeight: 800, margin: 0 }}>{hub.name}</h3>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", color: "#475569", fontSize: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <MapPin size={16} color="#94a3b8" /> {hub.address}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Phone size={16} color="#94a3b8" /> <a href={`tel:${hub.tel}`} style={{ color: "inherit", textDecoration: "none" }}>{hub.phone}</a>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Mail size={16} color="#94a3b8" /> <a href={`mailto:${hub.email}`} style={{ color: "inherit", textDecoration: "none" }}>{hub.email}</a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* Flex, not grid, so a short last row sits centred; every card keeps the same width and height. */
        .hubs-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 24px;
        }
        .hubs-grid > * { flex: 0 1 360px; display: flex; }
        .hubs-grid .hub-card { width: 100%; }

        .hub-card {
          background: #f8fafc;
          border-radius: 20px;
          padding: 30px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .hub-card:hover {
          background: #ffffff;
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border-color: rgba(0,154,156,0.2);
        }

        .hub-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: rgba(0,154,156,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }

        .hub-card:hover .hub-icon {
          transform: scale(1.1) rotate(5deg);
        }
      `}} />
    </section>
  );
}
