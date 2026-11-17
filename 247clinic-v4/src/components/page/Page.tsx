/* Inner pages (spec 007 phases 8 and 9, the user 2026-11-12: "finish making all other
   pages"; spec 015 section 5 for the v6 system). One quiet system on the home's look: a page hero
   as a solid ink panel beside the photo, then ivory sections with a label column, hairline rows
   instead of boxes, long words behind More, and one call to action per page.
   Every word is the brief's (scripts/check-brief.mjs checks the built pages). */
import { Words } from "@/components/ui/Bits";
import type { Metadata } from "next";
import {
  Activity, Ambulance, Award, BadgeCheck, BedDouble, Briefcase, Building2, ClipboardCheck, ClipboardList, Clock,
  FileText, FlaskConical, Globe, HandHeart, HeartPulse, Hospital, Hotel, IdCard, Languages, Mail, MapPin, MessageCircle,
  Phone, PiggyBank, Plane, Receipt, ShieldCheck, Smile, Sparkles, Stethoscope, Syringe, Thermometer, UserRound,
  UserRoundCheck, Users, Wallet, Zap, type LucideIcon, Bandage, Siren, Handshake, CircleCheck, Pill, Check,
} from "lucide-react";
import { asset, BASE, IS_PREVIEW } from "@/data/facts";
import { More } from "@/components/ui/More";

/* ---------- meta: the page's own h1 and opening line ---------- */
const OG_IMAGE = IS_PREVIEW ? `https://hcig-passport.vercel.app${BASE}/og-image.jpg` : "https://www.247clinic.net/og-image.jpg";
export function pageMeta(title: string, description: string, path: string): Metadata {
  return {
    title: `${title} | 24/7 Clinic`,
    description,
    ...(IS_PREVIEW ? {} : { alternates: { canonical: `https://www.247clinic.net${path}` } }),
    openGraph: { title, description, siteName: "24/7 Clinic", type: "website", images: [{ url: OG_IMAGE, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [OG_IMAGE] },
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

/* ---------- the page hero ----------
   v6 (spec 015 section 5): the home's split language at about 540px on desktop. A solid ink panel with the
   crumbs, eyebrow, Cormorant h1, one line and the buttons; the photo on the right, opening with the clip wipe.
   Phones: the photo at 40svh on top, then the ink panel. `quiet` drops the photo (ivory, h1, one line) for
   faqs, contact, blog and not found. `typeLed` gives the words the larger share (hotel pages). No veil, no orb. */
export function PageHero({ eyebrow, title, line, img, pos = "50% 50%", posM, trail, quiet, typeLed, whole, children }: {
  eyebrow?: string; title: string; line?: string | null; img?: string; pos?: string; posM?: string; trail?: Crumb[];
  quiet?: boolean; typeLed?: boolean; whole?: boolean; children?: React.ReactNode;
}) {
  const bare = quiet || !img;
  return (
    <section className={`ph ${bare ? "quiet" : ""} ${typeLed ? "type" : ""}`} aria-labelledby="ph-h">
      {!bare && (
        <div className="ph-media" aria-hidden="true">
          <img src={asset(img!)} alt="" style={{ ["--pos" as string]: pos, ["--pos-m" as string]: posM ?? pos }} fetchPriority="high" />
        </div>
      )}
      <div className="ph-panel">
        <div className="ph-in">
          <div className="ph-head">
            {trail && <Crumbs trail={trail} />}
            {eyebrow && <p className="ph-eyebrow rv" style={{ ["--d" as string]: "60ms" }}>{eyebrow}</p>}
            {/* `whole`: a name (a hotel) rises as one line instead of word by word, so it stays one phrase. */}
            <h1 id="ph-h" className="hw rv">{whole ? <span className="w"><span>{title}</span></span> : <Words text={title} />}</h1>
          </div>
          {(line || children) && (
            <div className="ph-foot">
              {line && <p className="ph-line rv" style={{ ["--d" as string]: "200ms" }}>{line}</p>}
              {children && <div className="cta-row ph-ctas rv" style={{ ["--d" as string]: "280ms" }}>{children}</div>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- a section ----------
   Desktop: a label column, the eyebrow and h2 sticky in 4 of 12 columns, the content in the other 8 (Pulso).
   `stack` keeps the heading above full width content (maps, photo grids); `center` centres it.
   `tint` is the flat ink 4% ground; `dark` is solid ink with ivory words and the brighter red. */
export function Band({ id, eyebrow, title, lead, tint, center, stack, children, narrow, dark, anchor, label }: {
  id: string; eyebrow?: string; title?: string; lead?: React.ReactNode; tint?: boolean; center?: boolean; stack?: boolean;
  children?: React.ReactNode; narrow?: boolean; dark?: boolean; anchor?: string; label?: string;
}) {
  const head = title && (
    <div className={`head ${center ? "center" : ""}`}>
      {eyebrow && <span className="eyebrow rv">{eyebrow}</span>}
      <h2 id={id} className="h2 rv hw"><Words text={title} /></h2>
      {lead && <div className="lead rv" style={{ ["--d" as string]: "200ms" }}>{lead}</div>}
    </div>
  );
  const cols = !!title && !center && !stack;
  return (
    <section id={anchor} className={`section pg-band ${tint ? "bg-surface" : ""} ${dark ? "dark" : ""}`}
      aria-labelledby={title ? id : undefined} aria-label={title ? undefined : label}>
      <div className={`container ${narrow ? "pg-narrow" : ""}`}>
        {cols ? (
          <div className="pg-cols">
            <div className="pg-label">{head}</div>
            <div className="pg-body">{children}</div>
          </div>
        ) : (
          <>{head}{children}</>
        )}
      </div>
    </section>
  );
}

/* ---------- tiles: hairline rows, a 1.25 stroke icon (or a Calisto numeral), the title, and More ---------- */
export function Tiles({ items, cols = 3, numbered }: { items: { title: string; text?: string | null }[]; cols?: 2 | 3; numbered?: boolean }) {
  const hasText = items.some((it) => it.text);
  return (
    <ul className={`tiles c${cols} ${hasText ? "has-text" : ""} ${numbered ? "numbered" : ""}`}>
      {items.map((it, i) => {
        const Ico = iconFor(it.title);
        return (
          <li key={it.title} className="tile rv" style={{ ["--d" as string]: `${(i % cols) * 70}ms` }}>
            {numbered
              ? <span className="tile-n num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              : <span className="tile-ico" aria-hidden="true"><Ico size={26} /></span>}
            <div className="tile-text">
              <h3>{it.title}</h3>
              {it.text && <More text={it.text} label={it.title} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- a checked list: two hairline columns ---------- */
export function Checks({ items, title }: { items: string[]; title?: string }) {
  return (
    <div className={`checks-card rv ${items.length > 4 ? "two" : ""}`}>
      {title && <h3>{title}</h3>}
      <ul>
        {items.map((t) => (
          <li key={t}><Check size={18} aria-hidden="true" /><span>{t}</span></li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- a picture beside the words: two offset photos that overlap and open with the clip wipe ---------- */
export function Split({ img, img2, alt = "", children, rev, pos, pos2 }: {
  img: string; img2?: string; alt?: string; children: React.ReactNode; rev?: boolean; pos?: string; pos2?: string;
}) {
  return (
    <div className={`pg-split ${rev ? "rev" : ""} ${img2 ? "duo" : ""}`}>
      <div className="pg-split-media">
        <span className="ps-main drift"><img src={asset(img)} alt={alt} loading="lazy" style={pos ? { objectPosition: pos } : undefined} /></span>
        {img2 && <span className="ps-sub drift back"><img src={asset(img2)} alt="" loading="lazy" style={pos2 ? { objectPosition: pos2 } : undefined} /></span>}
      </div>
      <div className="pg-split-copy">{children}</div>
    </div>
  );
}

/* ---------- the page's one call to action: a solid ink panel, the red rule, WhatsApp and call ---------- */
export function CtaPanel({ title, text, children }: { title: string; text?: string; children: React.ReactNode }) {
  return (
    <section className="section pg-cta-wrap" aria-labelledby="pg-cta-h">
      <div className="container">
        <div className="pg-cta rv">
          <span className="rule" aria-hidden="true" />
          <div className="pg-cta-copy">
            <h2 id="pg-cta-h" className="h2">{title}</h2>
            {text && <p className="lead">{text}</p>}
          </div>
          <div className="cta-row">{children}</div>
        </div>
      </div>
    </section>
  );
}
