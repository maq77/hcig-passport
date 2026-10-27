"use client";
// Footer (live contact block, nav, social, Pulse credit) and the "Talk to our team" contact sheet.
import { useEffect, useRef } from "react";
import { CONTACT, HERO, NAV, UI } from "@/content/home.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Motion";
import { SOCIAL } from "./Header";
import { Ribbons, Watermark } from "@/components/ui/Brand";

// the group pages reachable from every page (labels are the pages' own titles)
const MORE = [
  { label: "Our Premises and Facilities", path: "/group/" },
  { label: "Board Members", path: "/about/leadership/" },
  { label: "Where We Operate", path: "/network/" },
  { label: "Trust and Standards", path: "/trust/" },
];

const tel = (p: string) => "tel:" + p.replace(/[^\d+]/g, ""); // "+2 01001828828" dials +20 100 182 8828

export function Footer() {
  return (
    <footer className="ft">
      <Ribbons />
      <Watermark tone="light" />
      <div className="wrap">
        <Reveal className="ft-top">
          <a href={href("/")} className="ft-logo" aria-label={UI.home.text}>
            <img className="ft-full" src={asset("logo-h-white")} alt="Healthcare International Group" width={372} height={120} loading="lazy" />
            <img className="ft-mark" src={asset("mark-white")} alt="" aria-hidden="true" width={63} height={64} loading="lazy" />
          </a>
          <div className="ft-soc">
            {SOCIAL.map((s) => <a key={s.name} href={s.url} target="_blank" rel="noopener" aria-label={s.name}><Icon name={s.icon} size={20} /></a>)}
          </div>
        </Reveal>
        <div className="ft-grid">
          <nav aria-label="Footer">
            <ul className="ft-nav">
              {NAV.map((n) => <li key={n.path}><a href={href(n.path)}>{n.label}</a></li>)}
              {MORE.map((n) => <li key={n.path}><a href={href(n.path)}>{n.label}</a></li>)}
            </ul>
          </nav>
          <div className="ft-col">
            <h2 className="ft-h">{CONTACT.heading}</h2>
            <ul className="ft-list">
              {(CONTACT.phones as string[]).map((p) => <li key={p}><Icon name="phone" size={18} /><a href={tel(p)}>{p}</a></li>)}
              <li><Icon name="mail" size={18} /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            </ul>
          </div>
          <div className="ft-col">
            <ul className="ft-list">
              {(CONTACT.offices as string[]).map((o) => <li key={o}><Icon name="pin" size={18} /><span>{o}</span></li>)}
            </ul>
          </div>
        </div>
        <p className="ft-copy">
          © {CONTACT.copyright} <a href="https://pulsemarketing.global/" target="_blank" rel="noopener">{CONTACT.pulse}</a>
        </p>
      </div>
    </footer>
  );
}

export function ContactSheet() {
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const open = () => dlg.current?.showModal();
    addEventListener("hcig:sheet", open);
    return () => removeEventListener("hcig:sheet", open);
  }, []);
  const close = () => dlg.current?.close();
  const wa = `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`;
  return (
    <dialog ref={dlg} className="sheet" aria-labelledby="sheet-h" onClick={(e) => { if (e.target === dlg.current) close(); }}>
      <div className="sheet-in">
        <div className="sheet-top">
          <h2 className="h2 sheet-h" id="sheet-h">{HERO.ctaPrimary.text}</h2>
          <button type="button" className="sheet-x" onClick={close} aria-label={UI.close.text}><Icon name="close" size={22} /></button>
        </div>
        <ul className="sheet-list">
          <li><a className="sheet-row wa" href={wa} target="_blank" rel="noopener"><span className="sheet-ico"><Icon name="whatsapp" size={22} /></span><span><b>{UI.whatsapp.text}</b><small>+20 100 182 8828</small></span><Icon name="arrow" size={18} /></a></li>
          {(CONTACT.phones as string[]).map((p) => (
            <li key={p}><a className="sheet-row" href={tel(p)}><span className="sheet-ico"><Icon name="phone" size={22} /></span><span><b>{UI.call.text}</b><small>{p}</small></span><Icon name="arrow" size={18} /></a></li>
          ))}
          <li><a className="sheet-row" href={`mailto:${CONTACT.email}`}><span className="sheet-ico"><Icon name="mail" size={22} /></span><span><b>{UI.email.text}</b><small>{CONTACT.email}</small></span><Icon name="arrow" size={18} /></a></li>
        </ul>
        <a className="btn sheet-cta" href={href("/partner/")}>{HERO.ctaSecondary.text}<Icon name="arrow" /></a>
      </div>
    </dialog>
  );
}
