"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import Reveal from "../Reveal";
import SectionHead from "../SectionHead";
import CornerOrbs from "../CornerOrbs";
import RelaxBanner from "../RelaxBanner";
import MissionVision from "../MissionVision";
import QuoteSection from "../QuoteSection";
import QuoteForm from "../QuoteForm";
import { AboutIntro } from "../About";
import Blog from "../Blog";
import PageHero, { type Crumb } from "../site/PageHero";
import { useSite } from "../site/SiteProvider";
import { asset, SERVICE_IMAGES } from "@/lib/asset";
import type { Block, PostCard } from "@/lib/site";

// Inner pages of TMASI v3. Every word comes from the live tmasi.net page of the same language
// (src/content/live/<lang>.json); v3 adds only the labels in src/content/ui.ts.

const fixSpelling = (t: string) => t.replace(/^Uber uns$/, "Über uns");
const stripFlag = (t: string) => t.replace(/^[\u{1F1E6}-\u{1F1FF}]{2}\s*/u, "");

function useCrumbs() {
  const { live, links } = useSite();
  const nav = live.shell.nav.map(fixSpelling);
  return {
    home: { label: nav[0], href: links.home } as Crumb,
    about: { label: nav[1], href: links.about } as Crumb,
    services: { label: nav[2], href: links.services } as Crumb,
    contact: { label: nav[3], href: links.contact } as Crumb,
    blog: { label: nav[4], href: links.blog || undefined } as Crumb,
  };
}

type Item = { title?: string; text: string };

function ItemList({ items, columns = 2 }: { items: Item[]; columns?: 1 | 2 }) {
  return (
    <ul className={`ip-items ip-items--${columns}`}>
      {items.map((it, i) => (
        <li key={i} className="ip-item">
          <CheckCircle2 size={20} aria-hidden="true" className="ip-item-ico" />
          <div>
            {it.title && <h3 className="ip-item-title">{it.title}</h3>}
            <p className="ip-item-text">{it.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------------------------- About

export function AboutPage() {
  const { live, links } = useSite();
  const a = live.about;
  const c = useCrumbs();
  const leaders = live.leaders;
  return (
    <>
      <PageHero title={a.heading} crumbs={[c.home, { label: c.about.label }]} />

      {/* The home's About design (2026-09-30): the same words as the live page, the numbers larger here. */}
      <section className="lx-section lx-white">
        <div className="lx-wrap">
          <AboutIntro statement={a.statement} facts={a.lines.slice(0, 3)} body={a.lines.slice(3).join(" ")} size="large" />
        </div>
      </section>

      <RelaxBanner content={a.relax} />
      <MissionVision content={a.mission} />

      <section className="lx-section lx-white">
        <div className="lx-wrap">
          <Reveal><SectionHead title={a.how.title} /></Reveal>
          <ol className="ip-steps">
            {a.how.steps.map((s, i) => (
              <Reveal key={i} delay={0.05 * i} className="ip-step-cell">
                <li className="ip-step">
                  <span className="ip-step-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="ip-step-title">{s}</h3>
                </li>
              </Reveal>
            ))}
          </ol>
          {a.how.footer && <p className="ip-steps-foot">{a.how.footer}</p>}
        </div>
      </section>

      {/* Board Members section removed at Mohamed's request (2026-09-30). */}

      <QuoteSection />
      <InnerStyles />
    </>
  );
}

// ------------------------------------------------------------------------------------------- Leader

export function LeaderPage({ index }: { index: number }) {
  const { live } = useSite();
  const l = live.leaders[index];
  const role = live.about.board?.members?.[index]?.role;
  const c = useCrumbs();
  return (
    <>
      <PageHero title={l.name} eyebrow={role} crumbs={[c.home, c.about, { label: l.name }]} />
      <section className="lx-section lx-white">
        <div className="lx-wrap ip-leader">
          {l.image && (
            <div className="ip-leader-img"><Image src={asset(l.image)} alt={l.name} fill sizes="(max-width: 900px) 100vw, 380px" style={{ objectFit: "cover" }} /></div>
          )}
          <div>
            <h2 className="ip-h2">{l.subheading}</h2>
            {l.paragraphs.map((p, i) => <p key={i} className="ip-body ip-left">{p}</p>)}
          </div>
        </div>
      </section>
      <InnerStyles />
    </>
  );
}

// ----------------------------------------------------------------------------------------- Services

export function ServicesPage() {
  const { live, ui, links } = useSite();
  const s = live.services;
  const c = useCrumbs();
  return (
    <>
      <PageHero title={s.heading} sub={s.sub} crumbs={[c.home, { label: c.services.label }]} />
      <section className="lx-section lx-surface">
        <CornerOrbs />
        <div className="lx-wrap relative z-10">
          <div className="ip-groups">
            {s.groups.map((g, i) => (
              <Reveal key={g.title} delay={0.05 * i} className="ip-group-cell">
                <article className="ip-group">
                  <div className="ip-group-img tq-wash">
                    <Image src={asset(SERVICE_IMAGES[i])} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" style={{ objectFit: "cover" }} />
                  </div>
                  <div className="ip-group-body">
                    <h2 className="ip-group-title">{g.title}</h2>
                    <ItemList items={g.items as Item[]} columns={1} />
                    {links.groups[i] && (
                      <Link href={links.groups[i]} className="ip-more">{ui.viewDetails}<span className="sr-only">: {g.title}</span> <ArrowRight size={16} aria-hidden="true" /></Link>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lx-section lx-white">
        <div className="lx-wrap">
          <Reveal><SectionHead title={s.benefits.title} sub={s.benefits.sub} /></Reveal>
          <div className="ip-benefits">
            {s.benefits.items.map((b, i) => (
              <Reveal key={b.title} delay={0.04 * i} className="ip-benefit">
                {b.icon && <Image src={asset(b.icon)} alt="" width={44} height={44} className="ip-benefit-ico" />}
                <h3 className="ip-benefit-title">{b.title}</h3>
                <p className="ip-benefit-text">{b.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <QuoteSection />
      <InnerStyles />
    </>
  );
}

export function GroupPage({ index }: { index: number }) {
  const { live, links } = useSite();
  const s = live.services;
  const g = s.groups[index];
  const c = useCrumbs();
  const img = SERVICE_IMAGES[index];
  return (
    <>
      <PageHero title={g.title} image={img} crumbs={[c.home, c.services, { label: g.title }]} />
      <section className="lx-section lx-white">
        <div className="lx-wrap">
          <ItemList items={g.items as Item[]} columns={2} />
        </div>
      </section>

      <section className="lx-section lx-surface">
        <div className="lx-wrap">
          <Reveal><SectionHead title={s.heading} /></Reveal>
          <div className="ip-others">
            {s.groups.map((o, i) => (i === index || !links.groups[i] ? null : (
              <Link key={o.title} href={links.groups[i]} className="ip-other">
                <span className="ip-other-img tq-wash"><Image src={asset(SERVICE_IMAGES[i])} alt="" fill sizes="(max-width: 700px) 100vw, 25vw" style={{ objectFit: "cover" }} /></span>
                <span className="ip-other-title">{o.title}</span>
              </Link>
            )))}
          </div>
        </div>
      </section>

      <QuoteSection />
      <InnerStyles />
    </>
  );
}

// ------------------------------------------------------------------------------------------ Contact

function OfficeLines({ lines, tel, email }: { lines: string[]; tel: string[]; email: string[] }) {
  return (
    <div className="ip-office-lines">
      {lines.map((line, i) => {
        const isPhone = tel.some((t) => line.replace(/\s/g, "").includes(t));
        const isMail = email.some((m) => line.includes(m));
        const Icon = isPhone ? Phone : isMail ? Mail : MapPin;
        return (
          <p key={i} className="ip-office-line">
            <Icon size={16} aria-hidden="true" />
            {isPhone ? (
              <span>{line.split(/(\+[\d\s]{8,}\d)/).map((part, k) =>
                /^\+[\d\s]+$/.test(part) ? <a key={k} href={`tel:${part.replace(/\s/g, "")}`}>{part}</a> : part)}</span>
            ) : isMail ? (
              <span>{line.split(new RegExp(`(${email.map((m) => m.replace(/[.]/g, "\\.")).join("|")})`)).map((part, k) =>
                email.includes(part) ? <a key={k} href={`mailto:${part}`}>{part}</a> : part)}</span>
            ) : <span>{line}</span>}
          </p>
        );
      })}
    </div>
  );
}

export function ContactPage() {
  const { live, links } = useSite();
  const ct = live.contact;
  const c = useCrumbs();
  return (
    <>
      <PageHero title={ct.heading} crumbs={[c.home, { label: c.contact.label }]} />
      <section className="lx-section lx-white">
        <div className="lx-wrap ip-contact">
          <div className="ip-card">
            <QuoteForm idPrefix="message" columns={2} variant="message" />
          </div>
          <div>
            <h2 className="ip-h2">{ct.locationHeading}</h2>
            {ct.maps[0] && (
              <div className="ip-map"><iframe title={ct.locationHeading} src={ct.maps[0]} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
            )}
          </div>
        </div>
      </section>

      <section className="lx-section lx-surface">
        <div className="lx-wrap">
          <div className="ip-offices">
            {ct.offices.map((o, i) => (
              <Reveal key={o.name} delay={0.05 * i}>
                <article className="ip-office">
                  <h3 className="ip-office-name"><Link href={links.offices[i]}>{o.name}</Link></h3>
                  <OfficeLines lines={o.lines} tel={o.tel} email={o.email} />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {ct.maps[1] && (
        <section className="lx-section lx-white">
          <div className="lx-wrap">
            <Reveal><SectionHead title={ct.mapHeading} /></Reveal>
            <div className="ip-map ip-map--wide"><iframe title={ct.mapHeading} src={ct.maps[1]} loading="lazy" /></div>
          </div>
        </section>
      )}
      <InnerStyles />
    </>
  );
}

export function OfficePage({ index }: { index: number }) {
  const { live, links } = useSite();
  const o = live.contact.offices[index];
  const c = useCrumbs();
  const address = o.lines[o.lines.length - 1];
  const map = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return (
    <>
      <PageHero title={stripFlag(o.name)} sub={o.lines[0]} crumbs={[c.home, c.contact, { label: stripFlag(o.name) }]} />
      <section className="lx-section lx-white">
        <div className="lx-wrap ip-contact">
          <article className="ip-office ip-office--solo">
            <h2 className="ip-office-name">{o.name}</h2>
            <OfficeLines lines={o.lines} tel={o.tel} email={o.email} />
          </article>
          <div className="ip-map"><iframe title={stripFlag(o.name)} src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
        </div>
      </section>
      <section className="lx-section lx-surface">
        <div className="lx-wrap">
          <div className="ip-offices ip-offices--small">
            {live.contact.offices.map((x, i) => (i === index ? null : (
              <Link key={x.name} href={links.offices[i]} className="ip-office ip-office--link">
                <span className="ip-office-name">{x.name}</span>
                <span className="ip-office-city">{x.lines[0]}</span>
              </Link>
            )))}
          </div>
        </div>
      </section>
      <QuoteSection />
      <InnerStyles />
    </>
  );
}

// --------------------------------------------------------------------------------------------- Blog

export function BlogPage() {
  const { live, ui } = useSite();
  const c = useCrumbs();
  const heading = (live as { blog?: { heading: string } }).blog?.heading || ui.latestNews;
  return (
    <>
      <PageHero title={heading} crumbs={[c.home, { label: c.blog.label }]} />
      <Blog page />
      <InnerStyles />
    </>
  );
}

export function PostPage({ post }: { post: PostCard & { body: Block[] } }) {
  const { ui, links, posts } = useSite();
  const c = useCrumbs();
  const [lead, ...rest] = post.body.filter((b) => b.img);
  const others = posts.filter((p) => p.key !== post.key).slice(0, 3);
  const text = post.body.filter((b) => !b.img);
  return (
    <>
      {/* Each post's own first picture behind its title, softened so a poster's text does not read through. */}
      <PageHero title={post.title} eyebrow={post.date} crumbs={[c.home, c.blog, { label: post.title }]} image={lead?.img} soft />
      <article className="lx-section lx-white">
        <div className="lx-wrap ip-post">
          {/* The lead image whole, at its own shape, as on the live site: nothing cropped off a poster. */}
          {lead?.img && (
            lead.size ? (
              <div className="ip-post-lead">
                <Image src={asset(lead.img)} alt={lead.alt || post.title} width={lead.size[0]} height={lead.size[1]} priority
                  sizes="(max-width: 900px) 100vw, 860px"
                  style={{ width: `min(100%, calc(min(72vh, 640px) * ${(lead.size[0] / lead.size[1]).toFixed(4)}))`, height: "auto" }} />
              </div>
            ) : (
              <div className="ip-post-lead ip-post-lead--crop"><Image src={asset(lead.img)} alt={lead.alt || post.title} fill sizes="(max-width: 900px) 100vw, 860px" style={{ objectFit: "cover" }} priority /></div>
            )
          )}
          {text.map((b, i) =>
            b.quote ? <blockquote key={i} className="ip-quote">{b.quote}</blockquote>
            : b.h ? <h2 key={i} className="ip-h2 ip-left">{b.h}</h2>
            : b.li ? <p key={i} className="ip-body ip-left">{b.li}</p>
            : <p key={i} className={`ip-body ip-left${(b.cls || "").includes("lead") ? " ip-post-leadp" : ""}`}>{b.p}</p>
          )}
          {rest.length > 0 && (
            <div className="ip-gallery">
              {rest.filter((b, i, arr) => arr.findIndex((x) => x.img === b.img) === i && b.img !== lead?.img).map((b, i) => (
                <div key={i} className="ip-gallery-img"><Image src={asset(b.img!)} alt={b.alt || ""} fill sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "cover" }} /></div>
              ))}
            </div>
          )}
          {links.blog && <Link href={links.blog} className="ip-more ip-back">{ui.viewAllNews} <ArrowRight size={16} aria-hidden="true" /></Link>}
        </div>
      </article>
      {others.length > 0 && (
        <section className="lx-section lx-surface">
          <div className="lx-wrap">
            <Reveal><SectionHead title={ui.latestNews} /></Reveal>
            <div className="ip-others">
              {others.map((p) => (
                <Link key={p.key} href={links.posts[p.key]} className="ip-other">
                  <span className="ip-other-img"><Image src={asset(p.image)} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "cover" }} /></span>
                  <span className="ip-other-date">{p.cardDate}</span>
                  <span className="ip-other-title">{p.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <InnerStyles />
    </>
  );
}

// ------------------------------------------------------------------------------------------- Styles

function InnerStyles() {
  return (
    <style dangerouslySetInnerHTML={{__html: `
      .ip-center { text-align: center; }
      .ip-statement { margin: 0 auto 28px; max-width: 24ch; color: var(--lx-ink); font-weight: 800; letter-spacing: -0.02em;
        font-size: clamp(28px, 3.6vw, 46px); line-height: 1.12; }
      .ip-lines { max-width: 900px; margin: 0 auto; }
      .ip-lead { margin: 0 0 6px; color: #1E293B; font-weight: 500; font-size: clamp(16px, 1.4vw, 19px); line-height: 1.8; }
      .ip-body { margin: 0 0 18px; color: var(--lx-body); font-size: clamp(15px, 1.2vw, 17px); line-height: 1.8; }
      .ip-center .ip-body { margin-top: 18px; max-width: 760px; margin-left: auto; margin-right: auto; }
      .ip-left { text-align: left; }
      .ip-h2 { margin: 0 0 20px; color: var(--lx-ink); font-weight: 800; letter-spacing: -0.015em; font-size: clamp(22px, 2.2vw, 30px); }

      .ip-items { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px 28px; }
      .ip-items--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .ip-items--1 { grid-template-columns: 1fr; }
      .ip-item { display: flex; gap: 14px; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid var(--lx-line); }
      .ip-item-ico { flex-shrink: 0; margin-top: 2px; color: var(--tmasi-teal); }
      .ip-item-title { margin: 0 0 4px; font-size: 16.5px; font-weight: 700; color: var(--lx-ink); line-height: 1.4; }
      .ip-item-text { margin: 0; font-size: 15px; line-height: 1.7; color: var(--lx-body); }

      .ip-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
        border-top: 1px solid var(--lx-line); }
      .ip-step-cell { border-bottom: 1px solid var(--lx-line); }
      .ip-step-cell:not(:nth-child(3n+1)) { border-left: 1px solid var(--lx-line); }
      .ip-step { list-style: none; padding: clamp(24px, 2.6vw, 36px) clamp(18px, 2vw, 28px); }
      .ip-step-n { display: block; margin-bottom: 14px; color: var(--tmasi-teal); line-height: 1;
        font-family: var(--font-display); font-size: 40px; }
      .ip-step-title { margin: 0; font-size: 17px; font-weight: 700; line-height: 1.4; color: var(--lx-ink); }
      .ip-steps-foot { margin: clamp(28px, 3vw, 40px) 0 0; text-align: center; color: var(--lx-ink); font-weight: 800;
        letter-spacing: 0.08em; text-transform: uppercase; font-size: 14px; }

      .ip-board { display: grid; grid-template-columns: repeat(2, minmax(0, 320px)); justify-content: center; gap: 24px; }
      .ip-person { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px;
        padding: 32px 24px; background: #ffffff; border: 1px solid var(--lx-line); border-radius: var(--lx-radius);
        text-decoration: none; transition: transform .3s var(--ease), box-shadow .3s ease, border-color .3s ease; }
      .ip-person:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -18px rgba(15,32,92,0.22); border-color: rgba(0,154,156,0.35); }
      .ip-person-img { position: relative; width: 120px; height: 120px; border-radius: 50%; overflow: hidden; margin-bottom: 12px; background: var(--lx-surface); }
      .ip-person-name { font-size: 18px; font-weight: 800; color: var(--lx-ink); }
      .ip-person-role { font-size: 14.5px; font-weight: 600; color: var(--tmasi-teal); }
      .ip-person-org { font-size: 13px; color: var(--lx-muted); }
      .ip-person-arrow { margin-top: 10px; color: var(--tmasi-teal); }

      .ip-leader { display: grid; grid-template-columns: 360px minmax(0, 1fr); gap: clamp(32px, 4vw, 64px); align-items: start; }
      .ip-leader-img { position: relative; aspect-ratio: 4 / 5; border-radius: var(--lx-radius); overflow: hidden; background: var(--lx-surface); }

      .ip-groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(20px, 2.4vw, 32px); }
      .ip-group-cell { display: flex; }
      .ip-group { display: flex; flex-direction: column; width: 100%; background: #ffffff; border: 1px solid var(--lx-line);
        border-radius: var(--lx-radius); overflow: hidden; }
      .ip-group-img { position: relative; aspect-ratio: 16 / 7; background: var(--lx-surface); }
      .ip-group-body { padding: clamp(22px, 2.4vw, 32px); display: flex; flex-direction: column; flex-grow: 1; }
      .ip-group-title { margin: 0 0 6px; font-size: clamp(20px, 1.8vw, 24px); font-weight: 800; color: var(--lx-ink); letter-spacing: -0.015em; }
      .ip-group .ip-item { padding: 12px 0; }
      .ip-group .ip-item-title { font-size: 15px; }
      .ip-group .ip-item-text { font-size: 14.5px; }
      .ip-more { display: inline-flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 20px; min-height: 44px;
        color: var(--tmasi-teal); font-weight: 700; font-size: 14px; text-decoration: none; }
      .ip-more:hover { color: var(--lx-ink); }

      .ip-benefits { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--lx-line); }
      .ip-benefit { padding: clamp(24px, 2.4vw, 34px) clamp(16px, 1.6vw, 22px); border-bottom: 1px solid var(--lx-line); }
      .ip-benefit:not(:nth-child(4n+1)) { border-left: 1px solid var(--lx-line); }
      .ip-benefit-ico { display: block; margin-bottom: 18px; }
      .ip-benefit-title { margin: 0 0 8px; font-size: 16px; font-weight: 700; color: var(--lx-ink); line-height: 1.35; }
      .ip-benefit-text { margin: 0; font-size: 14.5px; line-height: 1.7; color: var(--lx-body); }

      .ip-others { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
      .ip-other { display: flex; flex-direction: column; background: #ffffff; border: 1px solid var(--lx-line); border-radius: var(--lx-radius);
        overflow: hidden; text-decoration: none; transition: transform .3s var(--ease), box-shadow .3s ease; }
      .ip-other:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -18px rgba(15,32,92,0.22); }
      .ip-other-img { position: relative; aspect-ratio: 16 / 10; background: var(--lx-surface); }
      .ip-other-date { padding: 16px 20px 0; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--tmasi-teal); }
      .ip-other-title { padding: 12px 20px 20px; font-size: 16px; font-weight: 700; line-height: 1.4; color: var(--lx-ink); }

      .ip-contact { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(28px, 4vw, 56px); align-items: start; }
      .ip-card { background: #ffffff; border: 1px solid var(--lx-line); border-radius: 20px; padding: clamp(24px, 3vw, 40px);
        box-shadow: 0 24px 60px -36px rgba(15,32,92,0.28); }
      .ip-map { position: relative; border-radius: var(--lx-radius); overflow: hidden; border: 1px solid var(--lx-line); aspect-ratio: 4 / 3; background: var(--lx-surface); }
      .ip-map--wide { aspect-ratio: 16 / 7; }
      .ip-map iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
      /* Offices: as many per row as fit (five on desktop), a short last row centred. */
      .ip-offices { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
      .ip-offices > * { flex: 1 1 200px; max-width: 280px; }
      .ip-office { display: block; height: 100%; background: #ffffff; border: 1px solid var(--lx-line); border-radius: var(--lx-radius);
        padding: 26px 24px; text-decoration: none; }
      .ip-office--solo { height: auto; box-shadow: 0 24px 60px -36px rgba(15,32,92,0.28); }
      .ip-office--link { transition: border-color .25s ease, transform .3s var(--ease); }
      .ip-office--link:hover { border-color: rgba(0,154,156,0.4); transform: translateY(-3px); }
      .ip-office-name { display: block; margin: 0 0 14px; font-size: 17px; font-weight: 800; color: var(--lx-ink); line-height: 1.35; }
      .ip-office-name a { color: inherit; text-decoration: none; }
      .ip-office-name a:hover { color: var(--tmasi-teal); }
      .ip-office-city { font-size: 14px; color: var(--lx-body); }
      .ip-office-line { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 10px; font-size: 14.5px; line-height: 1.6; color: var(--lx-body); overflow-wrap: anywhere; }
      .ip-office-line svg { flex-shrink: 0; margin-top: 3px; color: var(--tmasi-teal); }
      .ip-office-line a { color: var(--lx-body); text-decoration: none; }
      .ip-office-line a:hover { color: var(--tmasi-teal); }

      .ip-post { max-width: 860px; }
      .ip-post-lead { display: flex; justify-content: center; margin-bottom: clamp(28px, 3vw, 40px); }
      .ip-post-lead img { display: block; border-radius: var(--lx-radius); box-shadow: 0 24px 60px -36px rgba(15,32,92,0.35); }
      .ip-post-lead--crop { position: relative; aspect-ratio: 16 / 9; border-radius: var(--lx-radius); overflow: hidden; background: var(--lx-surface); }
      .ip-post-leadp { font-size: clamp(17px, 1.5vw, 20px); color: #1E293B; font-weight: 500; }
      .ip-quote { margin: 28px 0; padding: 4px 0 4px 22px; border-left: 3px solid var(--tmasi-teal); color: var(--lx-ink);
        font-size: clamp(18px, 1.7vw, 22px); font-weight: 700; line-height: 1.5; }
      .ip-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin: 28px 0 8px; }
      .ip-gallery-img { position: relative; aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; background: var(--lx-surface); }
      .ip-back { padding-top: 12px; }

      @media (max-width: 900px) {
        .ip-items--2, .ip-groups, .ip-contact, .ip-leader { grid-template-columns: 1fr; }
        .ip-leader-img { max-width: 360px; }
        .ip-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .ip-step-cell:not(:nth-child(3n+1)) { border-left: none; }
        .ip-step-cell:nth-child(even) { border-left: 1px solid var(--lx-line); }
        .ip-benefits { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .ip-benefit:not(:nth-child(4n+1)) { border-left: none; }
        .ip-benefit:nth-child(even) { border-left: 1px solid var(--lx-line); }
        .ip-board { grid-template-columns: minmax(0, 1fr); }
        .ip-map--wide { aspect-ratio: 4 / 3; }
      }
      @media (max-width: 560px) {
        .ip-steps, .ip-benefits { grid-template-columns: 1fr; }
        .ip-step-cell:nth-child(even), .ip-benefit:nth-child(even) { border-left: none; }
      }
    `}} />
  );
}
