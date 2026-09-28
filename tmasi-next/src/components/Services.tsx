"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Services() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-slide logic for mobile
  useEffect(() => {
    if (!isMobile) return;
    
    let interval: NodeJS.Timeout;
    
    const startAutoSlide = () => {
      interval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          // If we reach the end, scroll back to start
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollRef.current.scrollBy({ left: clientWidth * 0.85, behavior: 'smooth' });
          }
        }
      }, 3500); // Auto slide every 3.5s
    };

    startAutoSlide();

    return () => clearInterval(interval);
  }, [isMobile]);

  const scrollPrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -(scrollRef.current.clientWidth * 0.85), behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth * 0.85, behavior: 'smooth' });
    }
  };

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
    <section id="services" style={{ background: "#F8FAFC", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      
      {/* Background Graphics */}
      <div className="bg-shape bg-shape-top"></div>
      <div className="bg-shape bg-shape-bottom"></div>

      <div className="container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 10 }}>
        
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

        <div style={{ position: "relative" }}>
          
          {/* Mobile Arrows (only visible on mobile) */}
          <div className="mobile-arrows" style={{ display: "none", justifyContent: "space-between", position: "absolute", top: "50%", left: "-10px", right: "-10px", transform: "translateY(-50%)", zIndex: 20, pointerEvents: "none" }}>
            <button onClick={scrollPrev} style={{ pointerEvents: "auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}><ChevronLeft size={20} color="#0F205C" /></button>
            <button onClick={scrollNext} style={{ pointerEvents: "auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}><ChevronRight size={20} color="#0F205C" /></button>
          </div>

          <div className="services-container" ref={scrollRef}>
            {services.map((svc, idx) => (
              <Reveal key={svc.id} delay={isMobile ? 0 : 0.1 * idx} className="service-card-wrapper">
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
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .bg-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(100, 116, 139, 0.05); /* Subtle Slate */
          pointer-events: none;
          z-index: 0;
          animation: pulseSoft 8s ease-in-out infinite alternate;
        }

        .bg-shape-top {
          width: 500px;
          height: 500px;
          top: -250px;
          right: -250px;
        }

        .bg-shape-bottom {
          width: 600px;
          height: 600px;
          bottom: -300px;
          left: -300px;
          animation-duration: 12s;
        }

        @keyframes pulseSoft {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

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

        /* Mobile Slider CSS */
        @media (max-width: 768px) {
          .services-container { 
            display: grid;
            grid-template-rows: 1fr 1fr;
            grid-auto-flow: column;
            grid-auto-columns: 85%;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 16px;
            padding-bottom: 20px;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .services-container::-webkit-scrollbar {
            display: none;
          }
          .service-card-wrapper {
            scroll-snap-align: center;
            height: 100%;
          }
          .mobile-arrows {
            display: flex !important;
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
