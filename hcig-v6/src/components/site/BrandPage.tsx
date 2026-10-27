"use client";
// One brand of the group (/group/<slug>/): the brand's own words from its website, how it fits the HCIG system, and
// the way on to its site and to the other seven brands. Brands without a real photo open on their logo plate.
import { GROUP, HEALTHCARE, WHO } from "@/content/home.mjs";
import { BRANDS, BRAND_UI } from "@/content/brands.mjs";
import { PARTNER_TYPES } from "@/content/pages.mjs";
import { POSTS } from "@/content/blog.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import { MedParkPlaces } from "@/components/site/GroupPages";
import type { IconName } from "@/lib/icons";
import { brandPath, groupOf, type Brand, type Line, type Point, type Post, type Who } from "@/lib/brands";
export { brandBySlug, brandPath, groupOf } from "@/lib/brands";

/** The hero's right side for a brand without a real photo: its logo on a calm plate with hairline rings. */
export function BrandPlate({ b }: { b: Brand }) {
  const g = groupOf(b);
  return (
    <Reveal className="bp-plate" y={18}>
      <span className="bp-rings" aria-hidden="true"><i /><i /><i /></span>
      <span className="bp-logo"><img src={asset(g.logo)} alt={g.name} /></span>
    </Reveal>
  );
}

export function BrandBody({ b }: { b: Brand }) {
  const g = groupOf(b);
  const U = BRAND_UI;
  const points = b.points as Point[];
  const lines = HEALTHCARE.items as Line[];
  const services = b.services.map((s) => lines.find((l) => l.path.endsWith(`/${s}/`))).filter(Boolean) as Line[];
  const partners = b.partners.map((s) => {
    const w = (WHO.items as Who[]).find((x) => x.path.endsWith(`/${s}/`)) as Who;
    const t = PARTNER_TYPES.find((p) => p.slug === s);
    return w && t ? { ...w, icon: t.icon as IconName } : null;
  }).filter(Boolean) as (Who & { icon: IconName })[];
  const post = b.post ? (POSTS as Post[]).find((p) => p.n === b.post) : undefined;
  const others = (BRANDS as Brand[]).filter((x) => x.slug !== b.slug);

  return (
    <>
      {/* At a glance: the brand in its own words, and its own figures */}
      <section className="sec bp-glance" aria-labelledby="bp-g">
        <div className="wrap bp-glance-in">
          <Reveal className="bp-about">
            <p className="eyebrow" id="bp-g">{U.glance.text}</p>
            <p className="bp-quote">{b.about}</p>
            {b.notice ? <p className="bp-notice"><Icon name="clock" size={15} />{b.notice}</p> : null}
            <a className="bp-visit" href={g.url} target="_blank" rel="noopener">{U.visit.text} <span>{g.url.replace(/^https?:\/\/(www\.)?/, "")}</span><Icon name="up" size={15} /></a>
          </Reveal>
          {b.facts.length ? (
            <Stagger className={`bp-facts n${b.facts.length}`} gap={0.08}>
              {b.facts.map((f) => (
                <Item className="bp-fact" key={f.t}><b>{f.v}</b><span>{f.t}</span></Item>
              ))}
            </Stagger>
          ) : null}
        </div>
      </section>

      {/* What they do */}
      <section className="sec bp-what band-soft" aria-labelledby="bp-w">
        <div className="wrap">
          <SectionHead id="bp-w" title={U.whatTitle.text} lead={g.line} />
          <Stagger className={`bp-points n${points.length}`} gap={0.07}>
            {points.map((p, i) => (
              <Item as="article" className="bp-point" key={p.t}>
                <span className="bp-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.t}</h3>
                {p.x ? <p>{p.x}</p> : null}
                {p.items ? <ul>{p.items.map((it) => <li key={it}><Icon name="check" size={15} />{it}</li>)}</ul> : null}
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {b.medpark ? <MedParkPlaces /> : null}

      {/* Where to find them, the founder, the milestone */}
      {b.places?.length || b.founder || post ? (
        <section className="sec bp-where" aria-labelledby="bp-p">
          <div className="wrap bp-where-in">
            {b.places?.length ? (
              <Reveal className="bp-places">
                <h2 className="bp-h" id="bp-p">{U.where.text}</h2>
                <ul>{b.places.map((p) => <li key={p.name}><Icon name="pin" size={17} /><span><b>{p.name}</b>{p.addr}</span></li>)}</ul>
              </Reveal>
            ) : null}
            {b.founder ? (
              <Reveal className="bp-founder">
                <img src={asset(b.founder.img)} alt={b.founder.name} loading="lazy" />
                <div><p className="eyebrow">{U.founder.text}</p><h2 className="bp-h">{b.founder.name}</h2><p>{b.founder.role}</p>
                  <a className="bp-link" href={href("/about/leadership/")}>{U.leadership.text}<Icon name="arrow" size={15} /></a></div>
              </Reveal>
            ) : null}
            {post ? (
              <Reveal className="bp-mile">
                <a href={href(`/blog/${post.slug}/`)}>
                  {post.img ? <figure><img src={asset(post.img)} alt="" loading="lazy" /></figure> : null}
                  <div><p className="eyebrow">{U.milestone.text}</p><h3>{post.title}</h3><span className="pc-place"><Icon name="pin" size={13} />{post.dateline}</span></div>
                </a>
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Part of the group: the services and partners this brand serves */}
      <section className="sec bp-within" aria-labelledby="bp-i">
        <div className="wrap">
          <div className="bp-within-card">
            <div className="bp-within-head">
              <span className="bp-mark" aria-hidden="true"><img src={asset("mark-white")} alt="" /></span>
              <h2 className="bp-h" id="bp-i">{U.within.text}</h2>
              <p>{U.withinLead.text}</p>
            </div>
            <div className="bp-within-cols">
              <div>
                <p className="eyebrow">{U.related.text}</p>
                <ul className="bp-chips">{services.map((s) => <li key={s.path}><a href={href(s.path)}>{s.title}<Icon name="arrow" size={14} /></a></li>)}</ul>
              </div>
              <div>
                <p className="eyebrow">{WHO.heading}</p>
                <ul className="bp-chips">{partners.map((p) => <li key={p.path}><a href={href(p.path)}><Icon name={p.icon} size={15} />{p.title}</a></li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The other seven brands */}
      <section className="sec bp-others" aria-labelledby="bp-o">
        <div className="wrap">
          <SectionHead id="bp-o" title={U.others.text} />
          <Stagger className="bp-other-grid" gap={0.05}>
            {others.map((o) => {
              const og = groupOf(o);
              return (
                <Item key={o.slug}>
                  <a className="bp-other" href={href(brandPath(o))}>
                    <span className="bp-other-logo"><img src={asset(og.logo)} alt="" loading="lazy" /></span>
                    <span className="bp-other-name">{og.name}</span>
                    <Icon name="arrow" size={15} />
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
