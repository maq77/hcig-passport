"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { useEffect, useState } from "react";
import { ChevronRight, X, CheckCircle2 } from "lucide-react";

type Bullet = {
  title?: string;
  text: string;
};

type Service = {
  id: number;
  img: string;
  title: string;
  bullets: Bullet[];
};

export default function Services() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedService]);

  // Every group name, item title and item text is word for word from the live tmasi.net home (2026-09-26 backup).
  const services: Service[] = [
    {
      id: 1,
      img: "/tmasi/v3/img/msa.jpg",
      title: "Medical Assistance Services",
      bullets: [
        { title: "Emergency Medical Assistance", text: "Immediate response and professional medical support around the clock." },
        { title: "Air and Ground Medical Evacuations", text: "Safe and efficient transport to the nearest medical facilities." },
        { title: "Hospital and Treatment Coordination", text: "Connecting patients to top-quality healthcare services." },
        { title: "Case Management and Follow-Up", text: "Continuous monitoring and support to ensure the best outcomes." },
        { title: "Evaluation and Review", text: "Regular assessments to maintain high standards of care." },
        { title: "Funeral Services", text: "Compassionate and professional coordination of funeral arrangements." }
      ]
    },
    {
      id: 2,
      img: "/tmasi/v3/img/emc.jpeg",
      title: "Elite Medical Concierge Services",
      bullets: [
        { title: "Doctor On Call", text: "Licensed physicians available for private medical consultations at hotels, residences, or workplaces." },
        { title: "Private Medical Visits", text: "Personalized healthcare delivered directly to your location for maximum comfort and privacy." },
        { title: "Portable Medical Diagnostics", text: "Basic diagnostic equipment available during visits for immediate medical assessment." },
        { title: "VIP Patient Care", text: "Discreet and personalized medical support tailored for VIP travelers and families." },
        { title: "Insurance Covered Services", text: "Doctor visits can be coordinated with international insurance and assistance providers for cashless treatment whenever coverage is available." },
        { title: "Follow-up Medical Support", text: "Ongoing guidance and medical coordination after the initial consultation if further care is required." }
      ]
    },
    {
      id: 3,
      img: "/tmasi/v3/img/tas.jpg",
      title: "Travel Assistance Services",
      bullets: [
        { title: "Optimized Customer Experience", text: "Personalized support to ensure seamless journeys." },
        { title: "Translation Assistance", text: "Multilingual support to overcome language barriers." },
        { title: "Advance Cash Provision", text: "Financial support in emergencies." },
        { title: "Roadside Assistance and Car Replacement", text: "Immediate help with breakdowns and vehicle replacements." },
        { title: "Taxi Bookings", text: "Reliable and prompt transportation services." },
        { title: "Hotel and Flight Reservations", text: "Convenient booking support to minimize stress." },
        { title: "Legal Consultations and Support", text: "Professional advice and guidance when needed." }
      ]
    },
    {
      id: 4,
      img: "/tmasi/v3/img/mtss.jpg",
      title: "Medical Tourism Services",
      bullets: [
        { title: "Comprehensive Healthcare Packages", text: "Tailored solutions for wellness, longevity, and recovery programs, full body check-ups, diagnostics, second opinions, treatments, and surgeries." },
        { title: "Top Medical Destinations", text: "Access to world-renowned hospitals, clinics, and rehabs, top doctors, and technologies/equipment in Germany, Spain, Egypt, and the UAE." },
        { title: "Personalized Travel Arrangements", text: "From visas and transportation to accommodation and post-treatment care." },
        { title: "Dedicated Coordinators", text: "One-point contact to manage all aspects of the medical journey." },
        { title: "Luxury and Comfort Options", text: "Combine healthcare with leisure in premium destinations, offering optional spa treatments, sightseeing, and retreats." }
      ]
    },
    {
      id: 5,
      img: "/tmasi/v3/img/ia.jpg",
      title: "Insurance Assistance",
      bullets: [
        { title: "Insurance Issue Resolution", text: "Expert support to navigate and resolve insurance-related problems efficiently." },
        { title: "Claim Management", text: "Assistance with submitting, tracking, and processing insurance claims." },
        { title: "Policy Verification", text: "Confirming coverage and benefits for medical and travel needs." },
        { title: "Direct Billing Arrangements", text: "Simplifying the payment process by coordinating directly with insurance providers." },
        { title: "Liaison with Insurance Companies", text: "We handle communication with insurers to ensure smooth and hassle-free procedures." }
      ]
    },
    {
      id: 6,
      img: "/tmasi/v3/img/as.jpg",
      title: "Additional Services",
      bullets: [
        { text: "Travel risk assessments and safety recommendations." },
        { text: "Assistance with documentation and paperwork." },
        { text: "Customized support for corporate clients and insurance partners." }
      ]
    }
  ];

  // The card preview lists the group's own item names (live words), so no summary text has to be invented.
  const preview = (svc: Service) =>
    svc.bullets.map((b) => (b.title ?? b.text).replace(/\.$/, "")).join(" · ");

  return (
    <section id="services" className="services-section">
      {/* Background Graphics */}
      <div className="bg-shape bg-shape-top"></div>
      <div className="bg-shape bg-shape-bottom"></div>

      <div className="services-container">
        <div className="services-header">
          <Reveal>
            <h2 className="headline-titling">OUR SERVICES</h2>
            <p className="services-subtitle">
              One Call, Endless Support.<br />TMASI Global Has You Covered.
            </p>
          </Reveal>
        </div>

        <div className="packages-grid">
          {services.map((svc, idx) => (
            <Reveal key={svc.id} delay={0.1 * idx} className="package-card-wrapper">
              <button className="package-card group" onClick={() => setSelectedService(svc)}>
                <div className="package-img-wrapper">
                  <Image 
                    src={svc.img}
                    alt={svc.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="package-img"
                  />
                  <div className="package-img-overlay" />
                </div>
                <div className="package-content">
                  <h3 className="package-title">{svc.title}</h3>
                  <p className="package-desc">{preview(svc)}</p>
                  
                  <div className="package-action">
                    <span className="view-details-btn">
                      View Details <ChevronRight size={16} className="vd-icon" />
                    </span>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Premium Glassmorphism Modal */}
      {selectedService && (
        <div className="modal-backdrop" onClick={() => setSelectedService(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedService(null)} aria-label="Close modal">
              <X size={24} color="#0F205C" />
            </button>
            
            <div className="modal-hero">
              <Image 
                src={selectedService.img}
                alt={selectedService.title}
                fill
                style={{ objectFit: "cover" }}
              />
              <div className="modal-hero-overlay" />
              <h2 className="modal-hero-title headline-titling">{selectedService.title}</h2>
            </div>
            
            <div className="modal-body">
              <ul className="modal-details-list">
                {selectedService.bullets.map((bullet, i) => (
                  <li key={i} className="modal-bullet-item">
                    <div className="modal-bullet-icon">
                      <CheckCircle2 size={20} color="var(--tmasi-teal)" />
                    </div>
                    <div className="modal-bullet-text">
                      {bullet.title && <strong>{bullet.title}:</strong>} {bullet.text}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .services-section {
          background: #F8FAFC;
          padding: 100px 0;
          position: relative;
          overflow: hidden;
        }

        .bg-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(100, 116, 139, 0.05); /* Subtle Slate */
          pointer-events: none;
          z-index: 0;
          animation: pulseSoft 8s ease-in-out infinite alternate;
        }

        .bg-shape-top { width: 500px; height: 500px; top: -250px; right: -250px; }
        .bg-shape-bottom { width: 600px; height: 600px; bottom: -300px; left: -300px; animation-duration: 12s; }

        @keyframes pulseSoft {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        .services-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }

        .services-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .services-header h2 {
          color: #0F205C;
          font-size: clamp(32px, 5vw, 48px);
          margin-bottom: 12px;
        }

        .services-subtitle {
          color: #475569;
          font-size: clamp(16px, 2vw, 18px);
          margin: 0 auto;
          max-width: 600px;
          line-height: 1.6;
        }

        /* PACKAGES GRID */
        .packages-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .packages-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }

        @media (max-width: 640px) {
          /* 2x3 Grid on Mobile */
          .packages-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }

        .package-card-wrapper {
          height: 100%;
        }

        .package-card {
          width: 100%;
          height: 100%;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          text-align: left;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
          padding: 0;
          outline: none;
        }

        .package-card:hover, .package-card:focus-visible {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }

        .package-img-wrapper {
          position: relative;
          width: 100%;
          padding-top: 60%; /* Aspect ratio for thumbnails */
          overflow: hidden;
        }

        .package-img {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .package-card:hover .package-img {
          transform: scale(1.05) !important;
        }

        .package-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(15, 32, 92, 0.1) 100%);
          z-index: 1;
        }

        .package-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        @media (max-width: 640px) {
          .package-content { padding: 16px; }
        }

        .package-title {
          font-family: var(--font-heading), serif;
          font-size: 22px;
          font-weight: 700;
          color: #0F205C;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        @media (max-width: 640px) {
          .package-title { font-size: 17px; }
        }

        .package-desc {
          font-size: 15px;
          color: #475569;
          line-height: 1.5;
          margin: 0 0 20px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        @media (max-width: 640px) {
          .package-desc { font-size: 13px; margin: 0 0 16px 0; -webkit-line-clamp: 3; }
        }

        .package-action {
          margin-top: auto;
        }

        .view-details-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 700;
          color: var(--tmasi-teal);
          padding: 8px 16px;
          background: rgba(0, 154, 156, 0.08);
          border-radius: 99px;
          transition: all 0.3s ease;
        }

        @media (max-width: 640px) {
          .view-details-btn { font-size: 12px; padding: 6px 12px; gap: 4px; }
        }

        .package-card:hover .view-details-btn {
          background: var(--tmasi-teal);
          color: #ffffff;
        }

        .vd-icon {
          transition: transform 0.3s ease;
        }

        .package-card:hover .vd-icon {
          transform: translateX(4px);
        }

        /* PREMIUM MODAL */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 32, 92, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          opacity: 0;
          animation: modalFadeIn 0.3s forwards;
        }

        @media (max-width: 640px) {
          .modal-backdrop {
            padding: 12px;
          }
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: #ffffff;
          width: 100%;
          max-width: 850px;
          max-height: 85vh;
          border-radius: 20px;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transform: scale(0.95) translateY(20px);
          opacity: 0;
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 640px) {
          .modal-container {
            max-height: 95vh;
            border-radius: 16px;
          }
        }

        /* Custom Scrollbar for Modal */
        .modal-container::-webkit-scrollbar {
          width: 8px;
        }
        .modal-container::-webkit-scrollbar-track {
          background: transparent;
          margin: 16px 0; /* Keeps it away from edges */
        }
        .modal-container::-webkit-scrollbar-thumb {
          background: rgba(15, 32, 92, 0.2);
          border-radius: 10px;
        }
        .modal-container::-webkit-scrollbar-thumb:hover {
          background: rgba(15, 32, 92, 0.4);
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: transform 0.2s, background 0.2s;
        }

        .modal-close:hover {
          background: #f1f5f9;
          transform: scale(1.05);
        }

        .modal-hero {
          position: relative;
          height: 250px;
          width: 100%;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .modal-hero { height: 180px; }
        }

        .modal-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(15, 32, 92, 0.2), rgba(15, 32, 92, 0.8));
          z-index: 1;
        }

        .modal-hero-title {
          position: absolute;
          bottom: 24px;
          left: 32px;
          right: 32px;
          color: #ffffff;
          z-index: 2;
          font-size: clamp(24px, 4vw, 36px);
          margin: 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        @media (max-width: 640px) {
          .modal-hero-title { left: 24px; right: 24px; bottom: 20px; }
        }

        .modal-body {
          padding: 32px;
        }

        @media (max-width: 640px) {
          .modal-body { padding: 24px; }
        }

        .modal-quote-box {
          border-left: 4px solid var(--tmasi-teal);
          padding-left: 20px;
          margin-bottom: 32px;
        }

        .modal-quote-box p {
          font-size: 18px;
          color: #334155;
          margin: 0;
          font-style: italic;
          line-height: 1.6;
        }

        @media (max-width: 640px) {
          .modal-quote-box p { font-size: 16px; }
        }

        .modal-details-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .modal-bullet-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .modal-bullet-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .modal-bullet-text {
          font-size: 16px;
          color: #475569;
          line-height: 1.6;
        }

        .modal-bullet-text strong {
          color: #0F205C;
          font-weight: 700;
        }
      `}} />
    </section>
  );
}
