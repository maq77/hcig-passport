"use client";
// For Partners, the six partner pages and the seven service pages: live words only, recombined (src/content/pages.mjs).
import { BUILT, HEALTHCARE, WHO, WHY } from "@/content/home.mjs";
import { PARTNER_PAGE, PARTNER_TYPES, SERVICES_PAGE, SERVICE_LINES } from "@/content/pages.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import type { IconName } from "@/lib/icons";

type Who = { title: string; text: string; path: string; icon: IconName };
const whoBySlug = (slug: string) => (WHO.items as Who[]).find((w) => w.path.endsWith(`/${slug}/`)) as Who;

/** The partner page's six steps as a flow: a line with numbered stops, horizontal on desktop, vertical on phones. */
export function StepsFlow({ id }: { id: string }) {
  const steps = PARTNER_PAGE.steps as { n: string; title: string; text: string }[];
  return (
    <section className="sec steps-flow-sec band-soft" aria-labelledby={id}>
      <div className="wrap">
        <SectionHead id={id} title={PARTNER_PAGE.stepsTitle} />
        <Stagger as="ol" className="sf" gap={0.1}>
          {steps.map((s) => (
            <Item as="li" key={s.n}>
              <span className="sf-n" aria-hidden="true">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/** Image cards linking to sibling pages. */
export function LinkCards({ id, title, lead, items }: { id: string; title: string; lead?: string; items: { title: string; text?: string; img: string; path: string; icon?: IconName }[] }) {
  return (
    <section className="sec linkcards-sec" aria-labelledby={id}>
      <div className="wrap">
        <SectionHead id={id} title={title} lead={lead} />
        <Stagger className="lc-grid" gap={0.07}>
          {items.map((x) => (
            <Item as="article" className="lc" key={x.path}>
              <a href={href(x.path)}>
                <figure className="lc-im"><img src={asset(x.img)} alt="" loading="lazy" />{x.icon ? <span className="lc-ico" aria-hidden="true"><Icon name={x.icon} size={20} /></span> : null}</figure>
                <div className="lc-body"><h3>{x.title}</h3>{x.text ? <p>{x.text}</p> : null}<span className="lc-go" aria-hidden="true"><Icon name="arrow" size={16} /></span></div>
              </a>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ---------------- For Partners ----------------
export function PartnerHubBody() {
  const P = PARTNER_PAGE;
  const why = P.why as { title: string; text: string; icon: IconName }[];
  const types = PARTNER_TYPES.map((t) => ({ ...whoBySlug(t.slug), img: t.img, icon: t.icon as IconName, text: (P.short as Record<string, string>)[t.slug] }));
  const enable = Object.entries(P.enable as Record<string, { title: string; text: string }>);
  return (
    <>
      <section className="sec pw-sec" aria-labelledby="pw-h">
        <div className="wrap">
          <SectionHead id="pw-h" title={P.whyTitle} />
          <Stagger className="pw-grid" gap={0.08}>
            {why.map((w, i) => (
              <Item as="article" className="pw-card" key={w.title}>
                <span className="pw-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="ico" aria-hidden="true"><Icon name={w.icon} size={24} /></span>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>
      <LinkCards id="pt-h" title={P.whoTitle} items={types.map((t) => ({ title: t.title, text: t.text, img: t.img, path: t.path, icon: t.icon }))} />
      <StepsFlow id="psf-h" />
      <section className="sec pe-sec" aria-labelledby="pe-h">
        <div className="wrap">
          <SectionHead id="pe-h" title={P.enableTitle} />
          <Stagger className="pe-list" gap={0.08}>
            {enable.map(([slug, e], i) => (
              <Item as="article" className="pe-row" key={slug}>
                <span className="pe-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{e.title}</h3>
                <p>{e.text}</p>
                <a className="pe-go" href={href(`/partner/${slug}/`)} aria-label={e.title}><Icon name="arrow" size={18} /></a>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>
      <SystemStatement />
    </>
  );
}

export function SystemStatement() {
  const S = PARTNER_PAGE.system;
  return (
    <section className="sec sys-sec" aria-labelledby="sys-h">
      <div className="wrap sys-in">
        <Reveal as="p" className="eyebrow">{S.lines[0]}</Reveal>
        <Reveal className="sys-title" delay={80}><h2 className="h2" id="sys-h">{S.title}</h2></Reveal>
        <Reveal as="p" className="sys-text" delay={160}>{S.lines[1]}</Reveal>
      </div>
    </section>
  );
}

// ---------------- One partner type ----------------
export function PartnerTypeBody({ slug }: { slug: string }) {
  const P = PARTNER_PAGE;
  const me = whoBySlug(slug);
  const enable = (P.enable as Record<string, { title: string; text: string }>)[slug];
  const short = (P.short as Record<string, string>)[slug];
  const others = PARTNER_TYPES.filter((t) => t.slug !== slug).map((t) => {
    const w = whoBySlug(t.slug);
    return { title: w.title, text: (P.short as Record<string, string>)[t.slug], img: t.img, path: w.path, icon: t.icon as IconName };
  });
  return (
    <>
      <section className="sec ptb-sec" aria-label={me.title}>
        <div className="wrap ptb-grid">
          <Reveal className="ptb-quote">
            <span className="ptb-ico" aria-hidden="true"><Icon name={me.icon} size={28} /></span>
            <p>{short}</p>
          </Reveal>
          {enable ? (
            <Reveal className="ptb-enable" delay={120}>
              <p className="eyebrow">{P.enableTitle}</p>
              <h2 className="h3d">{enable.title}</h2>
              <p>{enable.text}</p>
            </Reveal>
          ) : null}
          <Stagger className="ptb-why" gap={0.08}>
            {(P.why as { title: string; text: string; icon: IconName }[]).map((w) => (
              <Item as="article" className="ptb-why-item" key={w.title}>
                <span className="mv-check" aria-hidden="true"><Icon name="check" size={13} /></span>
                <div><h3>{w.title}</h3><p>{w.text}</p></div>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>
      <StepsFlow id="tsf-h" />
      <LinkCards id="po-h" title={P.whoTitle} items={others} />
    </>
  );
}

// ---------------- One service line ----------------
type Line = { title: string; text: string; img: string; path: string };
export function ServiceLineBody({ slug }: { slug: string }) {
  const lines = HEALTHCARE.items as Line[];
  const me = lines.find((l) => l.path.endsWith(`/${slug}/`)) as Line;
  const def = SERVICE_LINES.find((s) => s.slug === slug) as { caps: string[] };
  let caps = (SERVICES_PAGE.capabilities as { title: string; text: string; icon: IconName }[]).filter((c) => def.caps.includes(c.title));
  // accreditation and training: its own live words, the Why reason and the Built item about partner development
  if (slug === "accreditation-training") {
    const w = (WHY.items as { title: string; text: string; icon: IconName }[]).find((x) => x.title.startsWith("Partner Development"));
    const b = (BUILT.items as { title: string; text: string; icon: IconName }[]).find((x) => x.title.startsWith("Training"));
    caps = [w, b, ...caps].filter(Boolean) as typeof caps;
  }
  const others = lines.filter((l) => l !== me).map((l) => ({ title: l.title, img: l.img, path: l.path }));
  return (
    <>
      <section className="sec slc-sec" aria-labelledby="slc-h">
        <div className="wrap">
          <SectionHead id="slc-h" title={SERVICES_PAGE.title} lead={SERVICES_PAGE.lead} />
          <Stagger className={`slc-grid n${caps.length}`} gap={0.08}>
            {caps.map((c, i) => (
              <Item as="article" className="slc" key={c.title}>
                <span className="slc-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="cap-ico" aria-hidden="true"><Icon name={c.icon} size={24} /></span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>
      <StepsFlow id="ssf-h" />
      <LinkCards id="so-h" title={HEALTHCARE.heading} lead={HEALTHCARE.sub} items={others} />
    </>
  );
}
