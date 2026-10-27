"use client";
// Press room: the group in figures, the boilerplate to copy, the news, the media kit and the press contact.
import { useState } from "react";
import { ABOUT, CONTACT, HERO, NEWS, UI } from "@/content/home.mjs";
import { PRESS_PAGE } from "@/content/pages.mjs";
import { asset } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import { SheetLink } from "@/components/ui/Sheet";
import { MoreNews } from "@/components/site/Blog";

const P = PRESS_PAGE;

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* clipboard blocked: the text stays selectable */ }
  };
  return (
    <Item as="article" className="pr-copy">
      <div className="pr-copy-top">
        <p className="eyebrow">{label}</p>
        <button type="button" className="pr-copy-btn" onClick={copy} aria-live="polite">
          <Icon name={done ? "check" : "clipboard"} size={15} />{done ? P.copied.text : P.copy.text}
        </button>
      </div>
      <p className="pr-copy-text">{text}</p>
    </Item>
  );
}

export function PressBody() {
  return (
    <>
      <section className="sec pr-glance" aria-labelledby="pr-g">
        <div className="wrap">
          <SectionHead id="pr-g" title={P.glance.text} lead={P.partner.text} />
          <Stagger className="pr-facts" gap={0.07}>
            {P.facts.map((f) => <Item className="bp-fact" key={f.t}><b>{f.v}</b><span>{f.t}</span></Item>)}
          </Stagger>
        </div>
      </section>

      <section className="sec pr-about band-soft" aria-labelledby="pr-a">
        <div className="wrap">
          <SectionHead id="pr-a" title={P.aboutTitle.text} />
          <Stagger className="pr-copies" gap={0.08}>
            <CopyBlock label={P.short.label} text={ABOUT.paras[0]} />
            <CopyBlock label={P.long.label} text={P.pitch.text} />
          </Stagger>
        </div>
      </section>

      <MoreNews title={NEWS.heading.text} cta={UI.allNews.text} />

      <section className="sec pr-kit" aria-labelledby="pr-k">
        <div className="wrap">
          <SectionHead id="pr-k" title={P.kitTitle.text} lead={P.kitLead.text} />
          <Stagger className="pr-logos" gap={0.06}>
            {P.logos.map((l) => (
              <Item className={`pr-logo on-${l.ground}`} key={l.key}>
                <span className="pr-logo-im"><img src={asset(l.key)} alt={l.name} loading="lazy" /></span>
                <span className="pr-logo-row">
                  <b>{l.name}</b>
                  <a href={asset(l.key)} download={`hcig-${l.key}.png`}><Icon name="up" size={14} className="pr-dl" />{P.download.text}</a>
                </span>
              </Item>
            ))}
          </Stagger>
          <div className="pr-specs">
            <Reveal className="pr-spec">
              <p className="eyebrow">{P.colours.text}</p>
              <ul className="pr-swatches">
                {P.palette.map((c) => <li key={c.hex}><i style={{ background: c.hex }} /><b>{c.name}</b><span>{c.hex}</span></li>)}
              </ul>
            </Reveal>
            <Reveal className="pr-spec" delay={0.08}>
              <p className="eyebrow">{P.type.text}</p>
              <ul className="pr-fonts">
                {P.fonts.map((f) => <li key={f.name}><b className={f.name === "Helma" ? "pr-helma" : "pr-inter"}>{f.name}</b><span>{f.use}</span></li>)}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec pr-contact" aria-labelledby="pr-c">
        <div className="wrap">
          <Reveal className="bp-within-card pr-contact-card">
            <div className="bp-within-head">
              <span className="bp-mark" aria-hidden="true"><img src={asset("mark-white")} alt="" /></span>
              <h2 className="bp-h" id="pr-c">{P.contactTitle.text}</h2>
              <p>{P.contactLead.text}</p>
            </div>
            <div className="pr-contact-ways">
              <a className="btn" href={`mailto:${CONTACT.email}`}><Icon name="mail" />{CONTACT.email}</a>
              <SheetLink className="btn2 pr-btn-ink">{HERO.ctaPrimary.text}<Icon name="arrow" /></SheetLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
