"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { asset } from "@/lib/asset";

export type Crumb = { label: string; href?: string };

// The top of every inner page: a dark band the transparent header sits on, the page's live title,
// an optional line under it, and a breadcrumb built from the live menu words.
// soft: blurs the picture a little, for pictures with their own text (news posters) that would
// otherwise read through the title.
export default function PageHero({ title, sub, crumbs, image = "/img/glavbanner.jpg", eyebrow, soft = false }: {
  title: string; sub?: string; crumbs: Crumb[]; image?: string; eyebrow?: string; soft?: boolean;
}) {
  return (
    <section className="ph">
      <div className={`ph-bg${soft ? " ph-bg--soft" : ""}`} aria-hidden="true">
        <Image src={asset(image)} alt="" fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "center" }} />
        <div className="ph-shade" />
      </div>
      <div className="lx-wrap ph-inner">
        <nav aria-label="Breadcrumb">
          <ol className="ph-crumbs">
            {crumbs.map((c, i) => (
              <li key={i}>
                {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                {i < crumbs.length - 1 && <ChevronRight size={14} aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <p className="ph-eyebrow">{eyebrow}</p>}
        <h1 className="ph-title">{title}</h1>
        {sub && <p className="ph-sub">{sub}</p>}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .ph { position: relative; overflow: hidden; background: #0F205C; color: #ffffff;
          padding: calc(112px + clamp(40px, 5vw, 72px)) 0 clamp(56px, 6vw, 88px); }
        .ph-bg { position: absolute; inset: 0; }
        .ph-bg--soft img { filter: blur(6px); transform: scale(1.08); }
        .ph-shade { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(8,17,51,0.94) 0%, rgba(15,32,92,0.86) 55%, rgba(15,32,92,0.6) 100%); }
        .ph-inner { position: relative; z-index: 1; }
        .ph-crumbs { list-style: none; margin: 0 0 22px; padding: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; letter-spacing: 0.04em; color: rgba(255,255,255,0.7); }
        .ph-crumbs li { display: inline-flex; align-items: center; gap: 6px; }
        .ph-crumbs a { color: rgba(255,255,255,0.78); text-decoration: none; }
        .ph-crumbs a:hover { color: #7fe0e1; }
        .ph-crumbs [aria-current] { color: #ffffff; }
        .ph-eyebrow { margin: 0 0 12px; font-size: 13px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #7fe0e1; }
        .ph-title { margin: 0; max-width: 22ch; color: #ffffff; font-family: var(--font-bignoodle), var(--font-montserrat), sans-serif;
          font-weight: 400; text-transform: uppercase; letter-spacing: 0.02em; line-height: 1.02; font-size: clamp(40px, 5.2vw, 68px); }
        .ph-sub { margin: 18px 0 0; max-width: 62ch; font-size: clamp(16px, 1.4vw, 19px); line-height: 1.65; color: rgba(255,255,255,0.88); }
        @media (max-width: 991px) { .ph { padding-top: calc(96px + 40px); } }
      `}} />
    </section>
  );
}
