"use client";

import Reveal from "./Reveal";
import { MapPin, Phone, Mail } from "lucide-react";

export default function WorldMap() {
  const hubs = [
    { 
      id: "egypt",
      name: "Egypt", 
      title: "MENA & Africa Hub (HQ)",
      address: "Cairo, Egypt",
      phone: "+20 120 678 8566",
      email: "mena@tmasiglobal.com",
    },
    { 
      id: "germany",
      name: "Germany", 
      title: "European Operations",
      address: "Munich, Germany",
      phone: "+49 89 1234 5678",
      email: "europe@tmasiglobal.com",
    },
    { 
      id: "spain",
      name: "Spain", 
      title: "Southern Europe & LatAm",
      address: "Madrid, Spain",
      phone: "+34 91 123 45 67",
      email: "spain@tmasiglobal.com",
    },
    { 
      id: "uae",
      name: "UAE", 
      title: "GCC Operations Hub",
      address: "Dubai, UAE",
      phone: "+971 4 123 4567",
      email: "gcc@tmasiglobal.com",
    },
    { 
      id: "usa",
      name: "USA", 
      title: "Americas Coordinator",
      address: "New York, USA",
      phone: "+1 212 555 1234",
      email: "americas@tmasiglobal.com",
    }
  ];

  return (
    <section id="offices" style={{ padding: "100px 0", background: "#ffffff" }}>
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 className="headline-titling" style={{ color: "#0F205C", fontSize: "clamp(32px, 5vw, 42px)", marginBottom: "16px" }}>
              Global Operational Hubs
            </h2>
            <p style={{ color: "#475569", fontSize: "clamp(16px, 2vw, 17px)", maxWidth: "700px", margin: "0 auto", lineHeight: 1.6 }}>
              Connected operations across continents delivering rapid emergency medical assistance, ground coordination, and local expertise worldwide.
            </p>
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
                    <h3 style={{ color: "#0F205C", fontSize: "20px", fontWeight: 800, margin: "0 0 4px 0" }}>{hub.name}</h3>
                    <div style={{ color: "var(--tmasi-teal)", fontSize: "14px", fontWeight: 600 }}>{hub.title}</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", color: "#475569", fontSize: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <MapPin size={16} color="#94a3b8" /> {hub.address}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Phone size={16} color="#94a3b8" /> {hub.phone}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Mail size={16} color="#94a3b8" /> {hub.email}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hubs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

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
