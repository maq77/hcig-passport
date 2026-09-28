"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import CornerOrbs from "./CornerOrbs";
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
    <section id="offices" className="lx-section lx-surface">
      <CornerOrbs corners={["top-left", "bottom-right"]} />
      <div className="lx-wrap relative z-10">
        <Reveal>
          <SectionHead title="Global Operational Hubs" />
        </Reveal>

        {/* One panel, five offices side by side, divided by hairlines. */}
        <Reveal delay={0.08}>
          <ul className="hubs-panel">
            {hubs.map((hub) => (
              <li key={hub.id} className="hub">
                <h3 className="hub-name">{hub.name}</h3>
                <p className="hub-line hub-address"><MapPin size={16} aria-hidden="true" /> <span>{hub.address}</span></p>
                <p className="hub-line"><Phone size={16} aria-hidden="true" /> <a href={`tel:${hub.tel}`}>{hub.phone}</a></p>
                <p className="hub-line"><Mail size={16} aria-hidden="true" /> <a href={`mailto:${hub.email}`}>{hub.email}</a></p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hubs-panel {
          list-style: none; margin: 0; padding: 0;
          display: grid; grid-template-columns: repeat(5, 1fr);
          background: #ffffff; border: 1px solid var(--lx-line); border-radius: var(--lx-radius);
        }
        .hub { padding: clamp(24px, 2.4vw, 34px) clamp(18px, 1.7vw, 26px); position: relative; }
        .hub + .hub { border-left: 1px solid var(--lx-line); }
        .hub::before {
          content: ""; position: absolute; top: -1px; left: clamp(18px, 1.7vw, 26px);
          width: 32px; height: 2px; background: var(--tmasi-teal);
        }
        .hub-name { margin: 0 0 16px; font-size: 16px; font-weight: 700; line-height: 1.35; color: var(--lx-ink); letter-spacing: -0.01em; }
        .hub-line {
          display: flex; gap: 10px; align-items: flex-start; margin: 0 0 10px;
          font-size: 14px; line-height: 1.55; color: var(--lx-body); overflow-wrap: anywhere;
        }
        .hub-line:last-child { margin-bottom: 0; }
        .hub-line svg { flex-shrink: 0; margin-top: 2px; color: var(--tmasi-teal); }
        .hub-line a { color: var(--lx-body); text-decoration: none; transition: color .2s ease; }
        .hub-line a:hover { color: var(--tmasi-teal); }

        @media (max-width: 1080px) {
          .hubs-panel { grid-template-columns: repeat(2, 1fr); }
          .hub + .hub { border-left: none; }
          .hub:nth-child(even) { border-left: 1px solid var(--lx-line); }
          .hub:nth-child(n+3) { border-top: 1px solid var(--lx-line); }
          .hub:last-child:nth-child(odd) { grid-column: 1 / -1; }
          .hub:nth-child(n+3)::before { display: none; }
        }
        @media (max-width: 600px) {
          .hubs-panel { grid-template-columns: 1fr; }
          .hub:nth-child(even) { border-left: none; }
          .hub:nth-child(n+2) { border-top: 1px solid var(--lx-line); }
          .hub:nth-child(n+2)::before { display: none; }
          .hub { padding: 22px 20px; }
          .hub-name { margin-bottom: 12px; }
          .hub-line { margin-bottom: 8px; }
        }
      `}} />
    </section>
  );
}
