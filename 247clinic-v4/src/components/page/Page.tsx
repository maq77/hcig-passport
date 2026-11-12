/* Inner pages (spec 007 phases 8 and 9, the user 2026-11-12: "finish making all other
   pages"). One quiet system on the home's look: a short cinematic page hero (the photo
   melts into bordeaux, as the phone home hero does), then ivory sections of few words,
   icon tiles instead of paragraphs, and one call to action per page.
   Every word is the brief's (scripts/check-brief.mjs checks the built pages). */
import type { Metadata } from "next";
import {
  Activity, Ambulance, Award, BadgeCheck, BedDouble, Briefcase, Building2, ClipboardCheck, ClipboardList, Clock,
  FileText, FlaskConical, Globe, HandHeart, HeartPulse, Hospital, Hotel, IdCard, Languages, Mail, MapPin, MessageCircle,
  Phone, PiggyBank, Plane, Receipt, ShieldCheck, Smile, Sparkles, Stethoscope, Syringe, Thermometer, UserRound,
  UserRoundCheck, Users, Wallet, Zap, type LucideIcon, Bandage, Siren, Handshake, CircleCheck, Pill,
} from "lucide-react";
import { asset, BASE, IS_PREVIEW } from "@/data/facts";
import { More } from "@/components/ui/More";

/* ---------- meta: the page's own h1 and opening line ---------- */
export function pageMeta(title: string, description: string, path: string): Metadata {
  return {
    title: `${title} | 24/7 Clinic`,
    description,
    ...(IS_PREVIEW ? {} : { alternates: { canonical: `https://www.247clinic.net${path}` } }),
    openGraph: { title, description, siteName: "24/7 Clinic", type: "website" },
  };
}

/* ---------- icons, picked by the words of each item ---------- */
const ICONS: [RegExp, LucideIcon][] = [
  [/prescription|delivery/i, Pill],
  [/wellness|aesthetic/i, Sparkles],
  [/ambulance/i, Ambulance],
  [/hospital|referral|escalation/i, Hospital],
  [/insurance|insurer|policy|gop|guarantee|billing|cashless/i, ShieldCheck],
  [/document|report|certificate/i, FileText],
  [/accredit|quality|standard|governance/i, Award],
  [/safety/i, BadgeCheck],
  [/hotel|resort|room setup/i, Hotel],
  [/room visit|doctor visit|hotel room/i, BedDouble],
  [/doctor|physician|staff|specialist/i, Stethoscope],
  [/24\/7|coordination|support/i, Clock],
  [/travel|international travelers/i, Plane],
  [/multilingual|language/i, Languages],
  [/fever|urgent|acute/i, Thermometer],
  [/injur|wound|burn|trauma|sprain|dressing|sutur/i, Bandage],
  [/diagnos|laborator|test/i, FlaskConical],
  [/iv |medication|injection/i, Syringe],
  [/dental|smile/i, Smile],
  [/beauty|wellness/i, Sparkles],
  [/guest|experience/i, HandHeart],
  [/faster|immediate|response/i, Zap],
  [/pressure|operational/i, Activity],
  [/cost/i, PiggyBank],
  [/follow-up|follow up/i, ClipboardCheck],
  [/case|process/i, ClipboardList],
  [/name/i, UserRound],
  [/passport|id\b|card/i, IdCard],
  [/location|map/i, MapPin],
  [/what happened|description|problem/i, MessageCircle],
  [/careers/i, Briefcase],
  [/partner/i, Handshake],
  [/corporate|general/i, Building2],
  [/familiar|less travel/i, HeartPulse],
  [/emergency/i, Siren],
  [/invoice|payment/i, Receipt],
  [/wallet/i, Wallet],
  [/phone/i, Phone],
  [/mail/i, Mail],
  [/team|people/i, Users],
  [/check|verification/i, UserRoundCheck],
  [/travelers|international/i, Globe],
];
export const iconFor = (s: string): LucideIcon => ICONS.find(([re]) => re.test(s))?.[1] ?? CircleCheck;

/* ---------- breadcrumbs, with BreadcrumbList for search ---------- */
export type Crumb = { name: string; path: string };
function Crumbs({ trail }: { trail: Crumb[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `https://www.247clinic.net${c.path}` })),
  };
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {trail.map((c, i) => (
          <li key={c.path}>
            {i < trail.length - 1 ? <a href={`${BASE}${c.path}`}>{c.name}</a> : <span aria-current="page">{c.name}</span>}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}

/* ---------- the page hero ---------- */
export function PageHero({ eyebrow, title, sub, lead, close, img, pos = "50% 50%", posM, trail, children }: {
  eyebrow?: string; title: string; sub?: string | null; lead?: string[]; close?: string; img: string; pos?: string; posM?: string; trail: Crumb[]; children?: React.ReactNode;
}) {
  /* The last word group goes red, as on the home ("Urgent Medical Care / Right Inside Your Hotel"). */
  return (
    <section className="ph" aria-labelledby="ph-h">
      <div className="ph-media" aria-hidden="true">
        <img src={asset(img)} alt="" style={{ ["--pos" as string]: pos, ["--pos-m" as string]: posM ?? pos }} fetchPriority="high" />
      </div>
      <div className="ph-veil" aria-hidden="true" />
      <div className="container ph-in">
        <Crumbs trail={trail} />
        {eyebrow && <p className="ph-eyebrow">{eyebrow}</p>}
        <h1 id="ph-h">{title}</h1>
        {sub && <p className="ph-sub">{sub}</p>}
        {lead?.map((p) => <p key={p} className="ph-lead">{p}</p>)}
        {close && <p className="ph-close">{close}</p>}
        {children && <div className="cta-row ph-ctas">{children}</div>}
      </div>
    </section>
  );
}

/* ---------- a section with its heading ---------- */
export function Band({ id, eyebrow, title, lead, tint, center, children, narrow, dark, anchor }: {
  id: string; eyebrow?: string; title?: string; lead?: React.ReactNode; tint?: boolean; center?: boolean; children?: React.ReactNode; narrow?: boolean; dark?: boolean; anchor?: string;
}) {
  return (
    <section id={anchor} className={`section pg-band ${tint ? "bg-surface" : ""} ${dark ? "dark" : ""}`} aria-labelledby={title ? id : undefined}>
      <div className={`container ${narrow ? "pg-narrow" : ""}`}>
        {title && (
          <div className={`head ${center ? "center" : ""}`}>
            {eyebrow && <span className="eyebrow rv">{eyebrow}</span>}
            <h2 id={id} className="h2 rv">{title}</h2>
            {lead && <div className="lead rv">{lead}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/* ---------- icon tiles: a list said in a glance ---------- */
export function Tiles({ items, cols = 3, numbered }: { items: { title: string; text?: string | null }[]; cols?: 2 | 3 | 4; numbered?: boolean }) {
  return (
    <ul className={`tiles c${cols} ${items.some((it) => it.text) ? "has-text" : ""}`}>
      {items.map((it, i) => {
        const Ico = iconFor(it.title);
        return (
          <li key={it.title} className="tile rv" style={{ ["--d" as string]: `${(i % cols) * 70}ms` }}>
            <span className="tile-ico" aria-hidden="true"><Ico size={22} /></span>
            <div className="tile-text">
              {numbered && <span className="tile-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>}
              <h3>{it.title}</h3>
              {it.text && <More text={it.text} label={it.title} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- a checked list in one card ---------- */
export function Checks({ items, title }: { items: string[]; title?: string }) {
  return (
    <div className="checks-card rv">
      {title && <h3>{title}</h3>}
      <ul>
        {items.map((t) => (
          <li key={t}><CircleCheck size={20} aria-hidden="true" /><span>{t}</span></li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- a picture beside the words ---------- */
export function Split({ img, alt = "", children, rev, ratio = "4 / 3.2" }: { img: string; alt?: string; children: React.ReactNode; rev?: boolean; ratio?: string }) {
  return (
    <div className={`pg-split ${rev ? "rev" : ""}`}>
      <div className="pg-split-media rv"><img src={asset(img)} alt={alt} loading="lazy" style={{ aspectRatio: ratio }} /></div>
      <div className="pg-split-copy">{children}</div>
    </div>
  );
}

/* ---------- the page's one call to action ---------- */
export function CtaPanel({ title, text, children }: { title: string; text?: string; children: React.ReactNode }) {
  return (
    <section className="section pg-cta-wrap" aria-labelledby="pg-cta-h">
      <div className="container">
        <div className="pg-cta rv">
          <div>
            <h2 id="pg-cta-h" className="h2">{title}</h2>
            {text && <p className="lead">{text}</p>}
          </div>
          <div className="cta-row">{children}</div>
        </div>
      </div>
    </section>
  );
}
