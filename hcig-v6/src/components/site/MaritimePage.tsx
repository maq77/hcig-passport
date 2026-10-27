"use client";
// Maritime & Cruise Healthcare Solutions: the manager's page, word for word (src/content/maritime.mjs), in the order she
// wrote it. A cinematic cover, the ecosystem, six capabilities as alternating image chapters, the journey from vessel to
// shore as a flow with a travelling light, the partnership models on a Dim Gray band, who it is for, why HCIG, and the
// maritime form with the fields she listed.
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { MARITIME_PAGE } from "@/content/maritime.mjs";
import { CONTACT } from "@/content/home.mjs";
import { asset } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import type { IconName } from "@/lib/icons";

const M = MARITIME_PAGE;
const CAP_IMG = ["mar-clinic", "mar-consult", "coordination-desk", "ship-to-shore", "maritime-hero", "yacht-marina"];
const CAP_ALT = [
  "An onboard medical clinic on a cruise ship",
  "A ship doctor with a passenger in the onboard medical centre",
  "A medical operations room coordinating several vessels",
  "A medical transfer from a cruise ship to an ambulance in port",
  "A ship at anchor with a medical tender alongside",
  "Yachts moored in a marina at sunset",
];
const MODEL_ICONS: IconName[] = ["doctor", "hospital", "fleet", "anchor", "headset", "ship"];
const WHY_ICONS: IconName[] = ["standard", "network", "control", "globe", "growth", "headset"];
const FLOW_ICONS: IconName[] = ["ship", "telemed", "anchor", "hospital", "plane"];

function Chapter({ c, i }: { c: (typeof M.caps)[number]; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);
  return (
    <article ref={ref} className={`mc-ch${i % 2 ? " flip" : ""}`} id={`capability-${c.n}`}>
      <Reveal className="mc-media">
        <motion.img style={{ y }} src={asset(CAP_IMG[i])} alt={CAP_ALT[i]} loading="lazy" />
        <span className="mc-num" aria-hidden="true">{c.n}</span>
      </Reveal>
      <Reveal className="mc-copy" delay={120}>
        <p className="eyebrow">{c.n}</p>
        <h3>{c.title}</h3>
        <p className="mc-kicker">{c.kicker}</p>
        {c.intro.map((x) => <p className="mc-intro" key={x}>{x}</p>)}
        <p className="mc-label">{c.listLabel}</p>
        <ul className="mc-list">
          {c.items.map((t) => <li key={t}><span className="mv-check" aria-hidden="true"><Icon name="check" size={13} /></span>{t}</li>)}
        </ul>
        {c.close ? <p className="mc-close">{c.close}</p> : null}
      </Reveal>
    </article>
  );
}

export function MaritimeBody() {
  const [sent, setSent] = useState(false);
  return (
    <>
      {/* the opening statement */}
      <section className="sec mx-intro" aria-label={M.intro.kicker}>
        <div className="wrap mx-intro-grid">
          <Reveal as="p" className="mx-big">{M.intro.paras[1]}</Reveal>
          <Reveal className="mx-side" delay={120}>
            <p>{M.intro.paras[2]}</p>
            <p className="mx-line">{M.intro.line}</p>
          </Reveal>
        </div>
      </section>

      {/* the ecosystem */}
      <section className="sec mx-eco band-soft" aria-labelledby="mx-eco-h">
        <div className="wrap mx-eco-grid">
          <div>
            <SectionHead id="mx-eco-h" align="start" eyebrow={M.eco.eyebrow} title={M.eco.title} />
            <Stagger className="mx-paras" gap={0.1}>
              {M.eco.paras.map((p) => <Item key={p}><p>{p}</p></Item>)}
            </Stagger>
          </div>
          <Reveal className="mx-eco-media"><img src={asset("onboard-clinic")} alt="An onboard medical centre with sea views" loading="lazy" /></Reveal>
        </div>
      </section>

      {/* six capabilities */}
      <section className="sec mx-caps" id="capabilities" aria-labelledby="mx-caps-h">
        <div className="wrap">
          <SectionHead id="mx-caps-h" title={M.capsHead.title} />
          <nav className="mc-index" aria-label={M.capsHead.eyebrow}>
            {M.caps.map((c) => <a key={c.n} href={`#capability-${c.n}`}><b>{c.n}</b>{c.title}</a>)}
          </nav>
          <div className="mc-chapters">{M.caps.map((c, i) => <Chapter key={c.n} c={c} i={i} />)}</div>
        </div>
      </section>

      {/* from vessel to shore */}
      <section className="sec mx-journey band-soft" aria-labelledby="mx-j-h">
        <div className="wrap">
          <SectionHead id="mx-j-h" eyebrow={M.journey.eyebrow} title={M.journey.title} />
          <Reveal className="mj-flow">
            <ol>
              {M.journey.flow.map((s, i) => (
                <li key={s}><span className="mj-dot" aria-hidden="true"><Icon name={FLOW_ICONS[i]} size={22} /></span><span className="mj-t">{s}</span></li>
              ))}
            </ol>
          </Reveal>
          <div className="mj-text">
            <Stagger className="mx-paras" gap={0.1}>{M.journey.paras.map((p) => <Item key={p}><p>{p}</p></Item>)}</Stagger>
            <Reveal as="p" className="mj-line">{M.journey.line}</Reveal>
          </div>
        </div>
      </section>

      {/* partnership models */}
      <section className="sec mx-models" aria-labelledby="mx-m-h">
        <div className="wrap">
          <SectionHead id="mx-m-h" tone="ink" eyebrow={M.models.eyebrow} title={M.models.title} />
          <Stagger className="mm-grid" gap={0.07}>
            {M.models.items.map((m, i) => (
              <Item as="article" className="mm-card" key={m.title}>
                <span className="mm-ico" aria-hidden="true"><Icon name={MODEL_ICONS[i]} size={24} /></span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* who it is for */}
      <section className="sec mx-who" aria-labelledby="mx-who-h">
        <div className="wrap mx-who-grid">
          <div>
            <SectionHead id="mx-who-h" align="start" title={M.who.title} lead={M.who.lead} />
            <Reveal as="p" className="mx-who-close">{M.who.close}</Reveal>
          </div>
          <Stagger as="ul" className="mx-who-list" gap={0.06}>
            {M.who.items.map((t, i) => <Item as="li" key={t}><b>{String(i + 1).padStart(2, "0")}</b>{t}</Item>)}
          </Stagger>
        </div>
      </section>

      {/* why HCIG */}
      <section className="sec mx-why band-soft" aria-labelledby="mx-why-h">
        <div className="wrap">
          <SectionHead id="mx-why-h" eyebrow={M.why.eyebrow} title={M.why.title} lead={M.why.lead} />
          <Stagger className="mw-grid" gap={0.07}>
            {M.why.items.map((w, i) => (
              <Item as="article" className="card mw-card" key={w.title}>
                <span className="ico" aria-hidden="true"><Icon name={WHY_ICONS[i]} size={24} /></span>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* the maritime form */}
      <section className="sec mx-form-sec" id="maritime-form" aria-labelledby="mx-f-h">
        <div className="wrap mx-form-grid">
          <Reveal className="mx-form-copy">
            <p className="eyebrow">{M.closing.title}</p>
            <h2 className="h2 mx-f-title" id="mx-f-h">{M.closing.line}</h2>
            <p className="lead">{M.closing.text}</p>
            <a className="mx-mail" href={`mailto:${M.closing.email}`}><Icon name="mail" size={18} />{M.closing.email}</a>
            <a className="btn2 mx-brochure" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(M.meta.secondary)}`}>{M.meta.secondary}</a>
          </Reveal>
          <Reveal className="ct-form-card" delay={120}>
            {sent ? (
              <div className="ct-done" role="status"><span className="ct-done-ico"><Icon name="check" size={28} /></span><p>{M.closing.line}</p></div>
            ) : (
              <form className="ct-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                {M.form.fields.map((f, i) => (
                  <div className={`field${i >= 2 ? " ct-wide" : ""}`} key={f}>
                    <label htmlFor={`mf-${i}`}>{f}</label>
                    {i === 4 ? <textarea id={`mf-${i}`} required rows={4} /> : <input id={`mf-${i}`} required={i === 0} />}
                  </div>
                ))}
                <div className="ct-submit ct-wide"><button type="submit" className="btn">{M.closing.cta}<Icon name="arrow" /></button></div>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
