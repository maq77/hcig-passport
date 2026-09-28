"use client";

import Image from "next/image";
import Reveal from "./Reveal";

export default function Services() {

  const services = [
    {
      id: 1,
      img: "/tmasi/v3/img/msa.jpg",
      title: "Medical Assistance",
      desc: "Immediate emergency response, air/ground evacuations, and full case management.",
      bullets: ["Emergency Medical Assistance", "Air and Ground Evacuations", "Hospital Coordination", "Case Management", "Funeral Services"]
    },
    {
      id: 2,
      img: "/tmasi/v3/img/emc.jpeg",
      title: "Elite Concierge",
      desc: "Discreet and personalized medical support for VIP travelers and families.",
      bullets: ["Doctor On Call", "Private Medical Visits", "Portable Diagnostics", "VIP Patient Care", "Insurance Covered Services"]
    },
    {
      id: 3,
      img: "/tmasi/v3/img/tas.jpg",
      title: "Travel Assistance",
      desc: "Comprehensive support for a seamless journey, from translation to cash provision.",
      bullets: ["Translation Assistance", "Advance Cash Provision", "Roadside Assistance", "Hotel & Flight Reservations"]
    },
    {
      id: 4,
      img: "/tmasi/v3/img/mtss.jpg",
      title: "Medical Tourism",
      desc: "Tailored healthcare packages combining treatment with luxury destinations.",
      bullets: ["Comprehensive Healthcare Packages", "Top Medical Destinations", "Personalized Travel Arrangements", "Dedicated Coordinators", "Luxury Options"]
    },
    {
      id: 5,
      img: "/tmasi/v3/img/ia.jpg",
      title: "Insurance Assistance",
      desc: "Expert support to navigate, resolve, and direct-bill your insurance claims.",
      bullets: ["Insurance Issue Resolution", "Claim Management", "Policy Verification", "Direct Billing Arrangements"]
    },
    {
      id: 6,
      img: "/tmasi/v3/img/as.jpg",
      title: "Additional Services",
      desc: "Risk assessments, paperwork, corporate support, and compassionate repatriation.",
      bullets: ["Travel Risk Assessments", "Documentation and Paperwork", "Customized Corporate Support", "Repatriation of Mortal Remains"]
    }
  ];

  return (
    <section id="services" style={{ background: "#F8FAFC", padding: "100px 0", position: "relative" }}>
      <div className="container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "60px", position: "relative", zIndex: 10 }}>
          <Reveal>
            <h2 className="headline-titling" style={{ color: "#0F205C", fontSize: "clamp(32px, 5vw, 48px)", marginBottom: "12px" }}>
              OUR SERVICES
            </h2>
            <p style={{ color: "#475569", fontSize: "clamp(16px, 2vw, 18px)", margin: "0 auto", maxWidth: "600px", lineHeight: 1.6 }}>
              One Call, Endless Support.<br />TMASI Global Has You Covered.
            </p>
          </Reveal>
        </div>

        <div className="services-container">
          {services.map((svc, idx) => (
            <Reveal key={svc.id} delay={0.1 * idx} className="service-card-wrapper">
              <div className="service-card group">
                <div className="service-img-wrapper">
                  <Image 
                    src={svc.img}
                    alt={svc.title}
                    fill
                    style={{ objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
                    className="service-img"
                  />
                  <div className="service-overlay" />
                </div>
                
                <div className="service-content">
                  <h3 className="service-title">{svc.title}</h3>
                  
                  <div className="service-bullets">
                    <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", fontSize: "14px", lineHeight: 1.5, listStyleType: "square" }}>
                      {svc.bullets.slice(0, 3).map((bullet, i) => (
                        <li key={i} style={{ marginBottom: "8px", fontWeight: 500 }}>{bullet}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="service-action">
                    <span style={{ color: "var(--tmasi-teal)", fontWeight: 700, fontSize: "14px", display: "inline-block", borderBottom: "2px solid transparent", transition: "all 0.3s" }} className="more-services-btn">
                      Read More &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .services-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .service-card-wrapper {
          height: 100%;
        }

        @media (max-width: 1024px) {
          .services-container { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }

        /* Mobile Grid CSS */
        @media (max-width: 768px) {
          .services-container { 
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .service-content {
            padding: 16px !important;
          }
          .service-title {
            font-size: 16px !important;
            margin-bottom: 12px !important;
          }
          .service-bullets ul {
            font-size: 12px !important;
          }
          .service-bullets li {
            margin-bottom: 4px !important;
          }
          .service-img-wrapper {
            height: 140px !important;
          }
          .more-services-btn {
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .services-container {
            grid-template-columns: repeat(2, 1fr); /* Enforce 2 columns */
          }
        }

        .service-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid #f1f5f9;
        }
        
        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,154,156,0.1);
          border-color: rgba(0,154,156,0.2);
        }

        .service-img-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .service-card:hover .service-img {
          transform: scale(1.05);
        }

        .service-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15,32,92,0.4), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .service-card:hover .service-overlay {
          opacity: 1;
        }

        .service-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .service-title {
          color: #0F205C;
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 16px 0;
          line-height: 1.3;
        }

        .service-bullets {
          margin-bottom: 20px;
        }

        .service-action {
          margin-top: auto;
        }

        .service-card:hover .more-services-btn {
          border-bottom-color: var(--tmasi-teal);
        }
      `}} />
    </section>
  );
}
