"use client";
// The contact page: the ways to reach the team as a dark card, then the message form and the two offices.
// On the preview the form shows its states but sends nothing (the lead endpoint arrives with the live build).
import { useState } from "react";
import { CONTACT, UI, WHO } from "@/content/home.mjs";
import { CONTACT_PAGE } from "@/content/pages.mjs";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Motion";
import { sendLead } from "@/lib/lead";

const tel = (p: string) => "tel:" + p.replace(/[^\d+]/g, "");
const WA = `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`;
const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export function ContactCard() {
  return (
    <div className="ct-card">
      <a className="ct-row wa" href={WA} target="_blank" rel="noopener"><span className="ct-ico"><Icon name="whatsapp" size={22} /></span><span><b>{UI.whatsapp.text}</b><small>+20 100 182 8828</small></span><Icon name="arrow" size={18} /></a>
      {(CONTACT.phones as string[]).map((p) => (
        <a key={p} className="ct-row" href={tel(p)}><span className="ct-ico"><Icon name="phone" size={22} /></span><span><b>{CONTACT_PAGE.labels.phone}</b><small>{p}</small></span><Icon name="arrow" size={18} /></a>
      ))}
      <a className="ct-row" href={`mailto:${CONTACT.email}`}><span className="ct-ico"><Icon name="mail" size={22} /></span><span><b>{CONTACT_PAGE.labels.email}</b><small>{CONTACT.email}</small></span><Icon name="arrow" size={18} /></a>
    </div>
  );
}

export function ContactBody() {
  const [sent, setSent] = useState(false);
  const F = CONTACT_PAGE.form;
  const offices = CONTACT.offices as string[];
  return (
    <section className="sec ct-sec" aria-label={CONTACT_PAGE.eyebrow}>
      <div className="wrap ct-grid">
        <Reveal className="ct-form-card">
          {sent ? (
            <div className="ct-done" role="status"><span className="ct-done-ico"><Icon name="check" size={28} /></span><p>{F.sent}</p></div>
          ) : (
            <form className="ct-form" onSubmit={async (e) => { e.preventDefault(); if (await sendLead(e.currentTarget, "contact")) setSent(true); }}>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
              <div className="field"><label htmlFor="c-name">{F.name}</label><input id="c-name" required autoComplete="name" /></div>
              <div className="field"><label htmlFor="c-company">{F.company}</label><input id="c-company" autoComplete="organization" /></div>
              <div className="field"><label htmlFor="c-mail">{F.mail}</label><input id="c-mail" type="email" required autoComplete="email" /></div>
              <div className="field"><label htmlFor="c-phone">{F.phone}</label><input id="c-phone" type="tel" autoComplete="tel" /></div>
              <div className="field ct-wide"><label htmlFor="c-type">{F.type}</label>
                <select id="c-type" defaultValue="">
                  <option value="" disabled>{F.type}</option>
                  {(WHO.items as { title: string }[]).map((x) => <option key={x.title}>{x.title}</option>)}
                </select>
              </div>
              <div className="field ct-wide"><label htmlFor="c-msg">{F.message}</label><textarea id="c-msg" required rows={5} /></div>
              <div className="ct-submit ct-wide">
                <button type="submit" className="btn">{F.send}<Icon name="arrow" /></button>
                <p className="form-note"><Icon name="shield" size={15} />{F.privacy}</p>
              </div>
            </form>
          )}
        </Reveal>
        <div className="ct-offices">
          {offices.map((o, i) => (
            <Reveal className="ct-office" key={o} delay={i * 120}>
              <span className="ct-ico"><Icon name="pin" size={22} /></span>
              <h3>{i === 0 ? CONTACT_PAGE.offices.cairo : CONTACT_PAGE.offices.florida}</h3>
              <p>{o}</p>
              <a className="ct-map" href={maps(o)} target="_blank" rel="noopener">{CONTACT_PAGE.map.text}<Icon name="up" size={15} /></a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
