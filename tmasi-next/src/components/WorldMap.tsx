"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import HubsMap from "./HubsMap";
import { useSite } from "./site/SiteProvider";

export default function WorldMap() {
  const { live, ui, links } = useSite();
  // Office names, addresses, phones and emails word for word from the live footer in this language.
  // The footer gives no USA email; the live contacts page does (usa@tmasi.net).
  const contactEmails = live.contact.offices.map((o) => o.email[0] || "");
  const hubs = live.shell.offices.map((o, i) => ({ ...o, id: String(i), email: o.email || contactEmails[i], href: links.offices[i] }));
  // The map pin and the office card light up together (hover, tap or keyboard focus on either).
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="offices" className="lx-section lx-surface">
      <div className="lx-wrap">
        <Reveal>
          <SectionHead title={ui.hubsTitle} />
        </Reveal>

        <Reveal delay={0.06}>
          <HubsMap names={hubs.map((h) => h.name)} hrefs={hubs.map((h) => h.href || "")} active={active} setActive={setActive} />
        </Reveal>

        {/* One panel, five offices side by side, divided by hairlines. */}
        <Reveal delay={0.1}>
          <ul className="hubs-panel">
            {hubs.map((hub, i) => (
              <li key={hub.id} className={`hub${active === i ? " is-active" : ""}`}
                onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
                <h3 className="hub-name">{hub.href ? <Link href={hub.href}>{hub.name}</Link> : hub.name}</h3>
                <p className="hub-line hub-address"><MapPin size={16} aria-hidden="true" /> <span>{hub.address}</span></p>
                <p className="hub-line"><Phone size={16} aria-hidden="true" /> <a href={`tel:${hub.tel}`}>{hub.phone}</a></p>
                {hub.email && <p className="hub-line"><Mail size={16} aria-hidden="true" /> <a href={`mailto:${hub.email}`}>{hub.email}</a></p>}
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
        .hub { transition: background-color .25s ease; }
        .hub.is-active { background: rgba(0,154,156,0.05); }
        .hub.is-active .hub-name { color: var(--tmasi-teal); }
        .hub-name a { color: inherit; text-decoration: none; }
        .hub-name a:hover { color: var(--tmasi-teal); }
        .hub-name { margin: 0 0 16px; font-size: 16px; font-weight: 700; line-height: 1.35; color: var(--lx-ink); letter-spacing: -0.01em; }
        .hub-line {
          display: flex; gap: 10px; align-items: flex-start; margin: 0 0 10px;
          font-size: 14px; line-height: 1.55; color: var(--lx-body); overflow-wrap: anywhere;
        }
        .hub-line:last-child { margin-bottom: 0; }
        .hub-line svg { flex-shrink: 0; margin-top: 2px; color: var(--lx-ink); }
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
          /* Phone and email links get a finger-sized tap area (44px) without moving the lines apart. */
          .hub-line a, .hub-name a { display: inline-block; padding: 11px 0; margin: -11px 0; }
        }
      `}} />
    </section>
  );
}
