"use client";
// The opening of every inner page: breadcrumbs (with their BreadcrumbList schema), eyebrow, the Helma title, the lead,
// the calls to action and a photo. "split" sets the photo beside the words on a light ground; "cover" lays the words over
// a full-bleed photo (for pages that should open cinematic, like Maritime).
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { asset, href } from "@/lib/site";
import { SITE_URL } from "@/content/pages.mjs";
import { Icon } from "@/components/ui/Icon";
import { EASE } from "@/components/ui/Motion";

export type Crumb = { label: string; path: string };
type Props = {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  image?: string;
  imageAlt?: string;
  actions?: ReactNode;
  note?: string;
  tone?: "split" | "cover";
  aside?: ReactNode;
};

export function PageHero({ crumbs, eyebrow, title, lead, image, imageAlt = "", actions, note, tone = "split", aside }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "12%"]);
  const rise = (d: number) => ({
    initial: reduce ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE, delay: d },
  });
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: SITE_URL + c.path })),
  };

  return (
    <section ref={ref} className={`ph-hero ph-${tone}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {tone === "cover" && image ? (
        <motion.img className="ph-cover-img" style={{ y }} src={asset(image)} alt={imageAlt} fetchPriority="high" />
      ) : null}
      <div className="ph-in wrap">
        <div className="ph-copy">
          <motion.nav className="ph-crumbs" aria-label="Breadcrumb" {...rise(0)}>
            <ol>
              {crumbs.map((c, i) => (
                <li key={c.path}>
                  {i < crumbs.length - 1 ? <a href={href(c.path)}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
                </li>
              ))}
            </ol>
          </motion.nav>
          {eyebrow ? <motion.p className="eyebrow ph-eyebrow" {...rise(0.08)}>{eyebrow}</motion.p> : null}
          <motion.h1 className="h1 ph-title" {...rise(0.16)}>{title}</motion.h1>
          {lead ? <motion.p className="ph-lead" {...rise(0.28)}>{lead}</motion.p> : null}
          {actions ? <motion.div className="ctas ph-actions" {...rise(0.38)}>{actions}</motion.div> : null}
          {note ? <motion.p className="ph-note" {...rise(0.46)}><Icon name="shield" size={16} />{note}</motion.p> : null}
        </div>
        {tone === "split" && image ? (
          <motion.figure className="ph-media" initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}>
            <motion.img style={{ y }} src={asset(image)} alt={imageAlt} fetchPriority="high" />
          </motion.figure>
        ) : null}
        {aside}
      </div>
    </section>
  );
}

/** The closing band of an inner page, in the home's style (photo panel bridging into the footer). */
export function CtaBand({ title, text, actions, note, image = "cta-bg" }: { title: ReactNode; text?: string; actions: ReactNode; note?: string; image?: string }) {
  return (
    <section className="cta" aria-label={typeof title === "string" ? title : undefined}>
      <div className="cta-card">
        <img className="cta-bg" src={asset(image)} alt="" loading="lazy" />
        <div className="cta-in">
          <div className="sec-head start on-ink">
            <h2 className="h2"><span>{title}</span></h2>
            {text ? <p className="lead">{text}</p> : null}
          </div>
          <div className="ctas cta-btns">{actions}</div>
          {note ? <p className="cta-note"><Icon name="shield" size={16} />{note}</p> : null}
        </div>
      </div>
    </section>
  );
}
