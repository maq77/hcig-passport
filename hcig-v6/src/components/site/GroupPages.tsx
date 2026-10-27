"use client";
// Group hub, Network and Trust: live lines and the approved fact sheet only.
import { CONTACT, GROUP } from "@/content/home.mjs";
import { GROUP_PAGE, NETWORK_PAGE, TRUST_PAGE } from "@/content/pages.mjs";
import { POSTS } from "@/content/blog.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";

type Brand = { short: string; name: string; line: string; url: string; logo: string };
type Post = { n: number; slug: string; title: string; dateline: string; img: string | null; alt: string };
const post = (n: number) => (POSTS as Post[]).find((p) => p.n === n) as Post;

// ---------------- Group ----------------
export function BrandGrid() {
  const brands = GROUP.brands as Brand[];
  return (
    <section className="sec brands-sec" aria-labelledby="brands-h">
      <div className="wrap">
        <SectionHead id="brands-h" title={GROUP.listLabel.text.replace(/^The g/, "G")} />
        <Stagger className="brand-grid" gap={0.06}>
          {brands.map((b) => (
            <Item as="article" className="brand-card" key={b.short}>
              <a href={b.url} target="_blank" rel="noopener">
                <span className="brand-logo"><img src={asset(b.logo)} alt={b.name} loading="lazy" /></span>
                <h3>{b.name}</h3>
                <p>{b.line}</p>
                <span className="brand-visit">{GROUP_PAGE.visit.text}<Icon name="up" size={15} /></span>
              </a>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function MedParkPlaces() {
  const P = GROUP_PAGE.places;
  return (
    <section className="sec places-sec band-soft" aria-labelledby="places-h">
      <div className="wrap">
        <SectionHead id="places-h" title={P.title.text} lead={(GROUP.brands as Brand[]).find((b) => b.short === "MedPark")?.line} />
        <Stagger className="places-grid" gap={0.1}>
          {[P.hub, P.hospital].map((x) => (
            <Item className="place" key={x.name}>
              <img src={asset(x.img)} alt={`${x.name}, ${x.place}`} loading="lazy" />
              <p className="place-cap"><b>{x.name}</b><span><Icon name="pin" size={15} />{x.place}</span></p>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ---------------- Network ----------------
export function NetworkBody() {
  const N = NETWORK_PAGE;
  const offices = CONTACT.offices as string[];
  return (
    <>
      <section className="sec net-sec" aria-label={N.title.text}>
        <div className="wrap">
          <Stagger as="ol" className="net-list" gap={0.08}>
            {N.countries.map((c, i) => (
              <Item as="li" key={c.name} className={c.office !== undefined ? "has-office" : undefined}>
                <span className="net-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{c.name}</h3>
                {c.note ? <p>{c.note}</p> : null}
                {c.office !== undefined ? <p className="net-office"><Icon name="pin" size={15} />{offices[c.office]}</p> : null}
              </Item>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}

// ---------------- Trust ----------------
export function TrustBody() {
  const T = TRUST_PAGE;
  const uca = post(T.uca.post);
  return (
    <>
      <section className="sec trust-sec" aria-labelledby="tp-h">
        <div className="wrap">
          <Reveal className="trust-line"><p id="tp-h">{T.partnership.text}</p></Reveal>
          <Stagger className="trust-partners" gap={0.1}>
            {T.partners.map((p) => {
              const pp = post(p.post);
              return (
                <Item as="article" className="trust-card" key={p.name}>
                  <span className="trust-logo"><img src={asset(p.logo)} alt={p.name} loading="lazy" /></span>
                  <h3>{p.name}</h3>
                  <a className="trust-read" href={href(`/blog/${pp.slug}/`)}>{pp.title}<Icon name="arrow" size={16} /></a>
                </Item>
              );
            })}
          </Stagger>
        </div>
      </section>
      <section className="sec uca-sec" aria-labelledby="uca-h">
        <div className="wrap uca-grid">
          <Reveal className="uca-im">{uca.img ? <img src={asset(uca.img)} alt={uca.alt} loading="lazy" /> : null}</Reveal>
          <Reveal className="uca-copy" delay={120}>
            <p className="eyebrow">{uca.dateline}</p>
            <h2 className="h3d" id="uca-h">{T.uca.text}</h2>
            <a className="btn2" href={href(`/blog/${uca.slug}/`)}>{uca.title}<Icon name="arrow" /></a>
          </Reveal>
        </div>
      </section>
      <section className="sec events-sec band-soft" aria-labelledby="ev-h">
        <div className="wrap">
          <SectionHead id="ev-h" title={T.eventsTitle.text} />
          <Stagger className="ev-grid" gap={0.06}>
            {T.events.map((n) => {
              const p = post(n);
              return (
                <Item as="article" key={n}>
                  <a className="ev" href={href(`/blog/${p.slug}/`)}>
                    <figure>{p.img ? <img src={asset(p.img)} alt={p.alt} loading="lazy" /> : null}</figure>
                    <span className="ev-place"><Icon name="pin" size={14} />{p.dateline}</span>
                    <h3>{p.title}</h3>
                  </a>
                </Item>
              );
            })}
          </Stagger>
        </div>
      </section>
    </>
  );
}
