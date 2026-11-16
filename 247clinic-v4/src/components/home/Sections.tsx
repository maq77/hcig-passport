/* The home, round 4 (the user's notes, 2026-09-24): every idea said once, long
   descriptions behind an arrow, a numbers band under the hero, the moving 24/7,
   centred steps, mobile first. "Why a hotel clinic" (brief 9) said what "Medical Care
   Without Leaving Your Resort" (brief 8) says, so the two are one section now.
   The words come from content/247clinic/en/home.json, rewritten on his instruction
   and logged in content/247clinic/approved-edits.json. Facts only from the brief or him. */
import {
  Ambulance, ArrowUpRight, Award, Bandage, BedDouble, Check, CheckCheck, FlaskConical, Globe, HeartPulse, Hotel,
  MapPin, Pill, ShieldCheck, Sparkles, Stethoscope, Syringe, Thermometer, UserRoundCheck, UsersRound,
} from "lucide-react";
import { section, reviews } from "@/content/load";
import { APPROVED, BRIEF, THEIRS } from "@/content/brief";
import { preload } from "react-dom";
import { asset, BASE, NUMBERS } from "@/data/facts";
import { CLINICS, clinicPath } from "@/data/clinics";
import { FLAGS, HERO_SLIDES, HOTEL_BRANDS, INSURERS, INTRO, PHOTOS, POSTS, STORIES, TRUSTED_PHOTOS, type Logo } from "@/data/media";
import { ROUTES } from "@/data/nav";
import { CallButton, LinkButton, TextLink, WaButton } from "@/components/ui/Buttons";
import { Head } from "@/components/ui/Bits";
import { Slot, slotFile } from "@/components/ui/Slot";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { CountUp, InViewVideo } from "@/components/ui/Motion";
import { Marquee } from "@/components/ui/Marquee";
import { More } from "@/components/ui/More";
import { SnapRow } from "@/components/ui/SnapRow";
import { BigPlay, Watch } from "@/components/ui/Viewer";
import { HeroCarousel } from "./HeroCarousel";
import { StoryCarousel } from "./StoryRow";
import { ClinicFinder } from "./ClinicFinder";
import { FaqList } from "./FaqList";
import { StepsReveal } from "./StepsReveal";
import { DetailCard } from "@/components/ui/DetailCard";
import { DetailBody, OpenMark } from "@/components/page/Detail";
import { serviceDetail } from "@/components/page/Common";

const href = (p: string) => `${BASE}${p}`;
const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });
const k = (n: number) => ({ ["--k" as string]: n });

/* The side words beside each section, desktop only. The same strings as in src/content/ui-labels.json,
   named here instead of read by index (that file is append only). */
const SIDE = {
  hotelBand: "Partner",
  services: " Luxury   Premium  ELite ",
  howItWorks: "Fast Procedures",
  stories: "Experience",
  facilities: "WORLD-CLASS CLINICS",
  intro: "Elite Care",
  insurance: "PROFESSIONALISM",
} as const;

/* ---------------- 1. hero ----------------
   v6 (spec 015): desktop, the ink panel left (44%) and the photo right (56%); phones, the photo
   on top and the ink panel below with stacked buttons. Two tiers in Cormorant (his 0.9 / 0.8 edit),
   one foot row: the approved accreditation line with the UCA mark, and the slide counter. */
export function Hero() {
  const s = section("home", "hero");
  /* Two lines, the second in red. A line break in the heading splits them; older content
     split at the full stop. Nothing is added to the words. */
  const [first, ...rest] = s.heading.includes("\n") ? s.heading.split("\n") : s.heading.split(/(?<=\.)\s+/);
  const [live] = (s.subheading ?? "").split("•").map((t) => t.trim()).filter(Boolean);
  /* Each slide is captioned with the title of what it shows, further down the page. */
  const svc = section("home", "medical-services");
  const care = section("home", "what-is-247-clinic");
  const how = section("home", "how-it-works");
  const captions = [svc.items.find((x) => /hotel room/i.test(x.title))?.title, care.items[0]?.title, how.items[0]?.title, care.items[1]?.title];
  const slides = HERO_SLIDES
    .filter((sl) => (sl.slot ? slotFile(sl.slot) : true))
    .map((sl, n) => ({ ...sl, src: asset(sl.src), srcM: "srcM" in sl && sl.srcM ? asset(sl.srcM) : undefined, caption: captions[n] ?? "" }));
  /* The first photo is the largest paint: ask for it before the page does. */
  if (slides[0]) preload(slides[0].src, { as: "image", fetchPriority: "high" });
  return (
    <section className="hero" aria-labelledby="hero-h">
      <div className="hero-media">
        {slides.length
          ? <HeroCarousel slides={slides} label="Photos" labels={{ prev: "Previous", next: "Next", show: "Show photo" }} />
          : <Slot file="hero-desktop.webp" purpose="hero image" px="2400 x 1350" />}
      </div>
      <div className="hero-panel on-ink">
        <div className="hero-copy">
          <p className="hero-k label" style={k(0)}><span className="rule" aria-hidden="true" />{live}</p>
          <h1 id="hero-h">
            <span className="ln"><span>{first}</span></span>
            <span className="ln accent"><span>{rest.join(" ")}</span></span>
          </h1>
          <p className="hero-text" style={k(1)}>{s.body[0]}</p>
          <div className="cta-row hero-ctas" style={k(2)}>
            <WaButton placement="hero">{s.ctas[0].label}</WaButton>
            <LinkButton href={href(ROUTES.clinics)} placement="hero" ev="find_clinic_click">{s.ctas[1].label}</LinkButton>
          </div>
        </div>
        <p className="hero-foot" style={k(3)}>
          <span className="hero-uca"><img src={asset("/logos/marks/uca.png")} alt="" width={30} height={30} /></span>
          <span>{APPROVED.accredited}</span>
        </p>
      </div>
    </section>
  );
}

/* ---------------- 2. numbers and the hotels they are inside ---------------- */
const STAT_ICONS = [Award, Hotel, UsersRound];
function LogoTile({ l }: { l: Logo }) {
  return <li className="logo-tile"><img src={asset(l.src)} alt={l.name} width={l.w} height={l.h} loading="lazy" /></li>;
}
export function HotelBand() {
  return (
    <section className="proof" aria-label={BRIEF.hotelClinics}>
      <div data-e-block="edge-label" data-e-field="text" className="edge-label left">{SIDE.hotelBand}</div>
      <div className="container">
        <ul className="stats">
          {NUMBERS.map((n, i) => {
            const Ico = STAT_ICONS[i];
            return (
              <li key={n.label} className="stat rv" style={d(i * 90)}>
                <span className="stat-ico" aria-hidden="true"><Ico size={22} /></span>
                <span className="stat-num"><CountUp value={n.value} suffix={"suffix" in n ? n.suffix : undefined} /></span>
                <span className="stat-label">{n.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <Marquee label={BRIEF.hotelClinics} speed={30}>
        {HOTEL_BRANDS.map((b) => b.logo
          ? <LogoTile key={b.name} l={b.logo} />
          : <li key={b.name} className="logo-tile name-tile"><span>{b.name}</span></li>)}
      </Marquee>
    </section>
  );
}

/* ---------------- 3. accreditation and standards, with the film (brief 7) ---------------- */
const POINT_ICONS = [Globe, ShieldCheck, Stethoscope, Award];
export function Facilities() {
  const s = section("home", "accreditation-block");
  return (
    <section className="section bg-surface facilities" aria-labelledby="fac-h"><div data-e-block="edge-label" data-e-field="text" className="edge-label right">{SIDE.facilities}</div>
      <div className="container">
        <Head center eyebrow="Accreditation" id="fac-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
        <div className="stage-wrap">
          <div className="stage">
            <InViewVideo src={asset("/media/hero.mp4")} className="stage-film" />
            <BigPlay src="/media/commercial.mp4" label="Watch video" />
            {/* The accreditation sits on the film on every screen (the user, 2026-11-12:
                "on mobile ... like on the video like on desktop"); the HCIG chip is gone here. */}
            <div className="uca-badge">
              <span className="uca-logo"><img src={asset("/logos/marks/uca.png")} alt="" width={48} height={48} /></span>
              <span className="uca-text">
                <small>Accreditation</small>
                <b>Urgent Care Association</b>
              </span>
            </div>
          </div>
        </div>
        <ul className="standards">
          {s.items.map((it, i) => {
            const Ico = POINT_ICONS[i] ?? Check;
            return (
              <li key={it.title} className="std rv" style={d(i * 80)}>
                <span className="ico"><Ico size={20} aria-hidden="true" /></span>
                <b>{it.title}</b>
              </li>
            );
          })}
        </ul>
        <div className="cta-row center rv">
          <TextLink href={href(ROUTES.accreditation)} placement="accreditation">{s.ctas[0].label}</TextLink>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 4. what we treat (brief 10) ---------------- */
/* Six cards in their old 3 x 2 / 2-column grid, then the seventh as a solid ink feature
   (the user, 2026-11-12: canvas option D, with 04 and 07 switched). */
const SVC_ICONS = [Thermometer, Bandage, FlaskConical, Pill, UserRoundCheck, BedDouble];
const SVC_FILES = ["svc-urgent", "svc-injuries", "svc-diagnostics", "svc-delivery", "svc-specialist", "svc-room-visit"];
export function Services() {
  const s = section("home", "medical-services");
  const feature = s.items[6];
  return (
    <section className="section services" aria-labelledby="svc-h"><div data-e-block="edge-label" data-e-field="text" className="edge-label left">{SIDE.services}</div>
      <div className="container">
        <div className="head-row">
          <Head eyebrow="What we treat" id="svc-h" title={s.heading} />
          <div className="rv head-link"><TextLink href={href(ROUTES.services)} placement="services">{s.ctas[0].label}</TextLink></div>
        </div>
        {/* Two columns on phones so all six show at once (the user, 2026-09-24), three on desktop. */}
        <ul className="svc-grid">
          {s.items.slice(0, 6).map((it, i) => {
            const Ico = SVC_ICONS[i];
            const file = `${SVC_FILES[i]}.webp`;
            return (
              <li key={it.title} className="rv" style={d((i % 3) * 70)}>
                {/* The card opens into its full points (the user, 2026-11-12; canvas H6dARjuHkaTeYqcUUvwYdB). */}
                <DetailCard label={it.title} trigger={
                  <span className={`card svc ${slotFile(file) ? "has-img" : ""}`}>
                    <span className="svc-media">
                      <Slot file={file} purpose={`service card, ${it.title}`} px="1200 x 800" alt="" ratio="3 / 2" />
                      <span className="svc-n" aria-hidden="true">0{i + 1}</span>
                    </span>
                    <span className="svc-body">
                      <span className="ico"><Ico size={22} aria-hidden="true" /></span>
                      <span className="svc-text">
                        <h3>{it.title}</h3>
                        {it.text && <span className="svc-quick">{it.text}</span>}
                        <OpenMark label="Open" />
                      </span>
                    </span>
                  </span>
                }>
                  {(() => {
                    const det = serviceDetail(it.title);
                    return (
                      <DetailBody img={`/slots/${file}`} kicker="What we treat" title={it.title} text={it.text && /\.$/.test(it.text.trim()) ? it.text : det.text} points={det.points}>
                        <WaButton placement="home-service-card">{BRIEF.waUs}</WaButton>
                        <CallButton placement="home-service-card" />
                      </DetailBody>
                    );
                  })()}
                </DetailCard>
              </li>
            );
          })}
        </ul>
        {feature && (
          <article className="svc-feature rv" aria-labelledby="svc-feature-h">
            <div className="svc-feature-copy">
              <div className="svc-feature-top">
                {/* Not a needle: the user asked for a softer mark (2026-11-12). */}
                <span className="svc-feature-ico" aria-hidden="true"><Sparkles size={22} /></span>
                <span className="svc-feature-n" aria-hidden="true">07</span>
              </div>
              <h3 id="svc-feature-h">{feature.title}</h3>
              <ul className="svc-feature-list">
                {(feature.text ?? "").split(/,\s*/).map((x) => (
                  <li key={x}><Check size={18} strokeWidth={2.4} aria-hidden="true" /><span>{x}</span></li>
                ))}
              </ul>
              <div><WaButton placement="section-services-feature">{BRIEF.waUs}</WaButton></div>
            </div>
            <img className="svc-feature-img" src={asset("/slots/svc-iv.webp")} alt={feature.title} width={1200} height={800} loading="lazy" />
          </article>
        )}
        <div className="cta-row center rv">
          <WaButton placement="section-services">{BRIEF.waUs}</WaButton>
          <CallButton placement="section-services" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- 5. care without leaving the resort (brief 8 and 9, one section) ---------------- */
export function Intro() {
  const s = section("home", "what-is-247-clinic");
  return (
    <section className="section bg-surface intro" aria-labelledby="intro-h"><div data-e-block="edge-label" data-e-field="text" className="edge-label right">{SIDE.intro}</div>
      <div className="container intro-grid">
        <div className="intro-media rv">
          <div className="wv-main drift">
            <img src={asset(PHOTOS.why.src)} alt="" width={PHOTOS.why.w} height={PHOTOS.why.h} loading="lazy" />
            <Watch src={INTRO.full} label="Watch video" />
          </div>
          <div className="wv-sub drift back">
            <img src={asset(PHOTOS.whyResort.src)} alt="" width={PHOTOS.whyResort.w} height={PHOTOS.whyResort.h} loading="lazy" />
          </div>
        </div>
        <div className="intro-copy">
          <Head eyebrow="On-site care" id="intro-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
          <ol className="care-list">
            {s.items.map((it, i) => (
              <li key={it.title} className="care rv" style={d(i * 90)}>
                <span className="care-n" aria-hidden="true">0{i + 1}</span>
                <div className="care-text">
                  <h3>{it.title}</h3>
                  {it.text && <More text={it.text} label={it.title} />}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 6. how it works (brief 12) ---------------- */
const STEP_ICONS: React.ComponentType<{ size?: number }>[] = [WhatsAppGlyph, MapPin, ShieldCheck, HeartPulse];
export function HowItWorks() {
  const s = section("home", "how-it-works");
  return (
    <section className="section how" aria-labelledby="how-h"><div data-e-block="edge-label" data-e-field="text" className="edge-label left">{SIDE.howItWorks}</div>
      <div className="container">
        <Head center eyebrow="How it works" id="how-h" title={s.heading} />
        <StepsReveal>
        <ol className="steps" data-inview>
          <span className="rail" aria-hidden="true"><i /></span>
          {s.items.map((it, i) => {
            const Ico = STEP_ICONS[i];
            return (
              <li key={it.title} className={`step rv ${i === 0 ? "first" : ""}`} style={d(i * 120)}>
                <span className="dot" aria-hidden="true"><Ico size={24} /></span>
                <div className="step-text">
                  <span className="n">Step 0{i + 1}</span>
                  <h3>{it.title}</h3>
                  {it.text && <More text={it.text} label={it.title} className="step-more" />}
                </div>
              </li>
            );
          })}
        </ol>
        </StepsReveal>
        <div className="cta-row center rv">
          <WaButton placement="section-how">{s.ctas[0].label}</WaButton>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 7. insurance and cashless (brief 11) ---------------- */
export function Insurance(_: { insuranceMessage: string }) {
  /* Rewritten 2026-11-12 (the user: "rewrite and re make ... easy to understand ... better design and not crowded"):
     one promise, three plain steps, one honest cashless line, one button, one quiet logo row. */
  const s = section("home", "insurance-cashless-care");
  return (
    <section className="section bg-surface insurance ins2" aria-labelledby="ins-h"><div data-e-block="edge-label" data-e-field="text" className="edge-label right">{SIDE.insurance}</div>
      <div className="container ins2-grid">
        <div className="ins2-copy">
          <Head eyebrow="Insurance & cashless" id="ins-h" title={s.heading} />
          <p className="ins2-sub rv">{s.subheading}</p>
          <p className="ins2-note rv"><ShieldCheck size={18} aria-hidden="true" /><span>{s.body[0]}</span></p>
          <div className="ins2-ctas rv">
            <WaButton placement="section-insurance" ctx="insurance">{s.ctas[0].label}</WaButton>
            <TextLink href={href(ROUTES.insurance)} placement="section-insurance">{s.ctas[1].label}</TextLink>
          </div>
        </div>
        <ol className="ins2-steps">
          {s.items.map((it, i) => (
            <li key={it.title} className="rv" style={d(i * 120)}>
              <span className="n" aria-hidden="true">0{i + 1}</span>
              <div><h3>{it.title}</h3>{it.text && <p>{it.text}</p>}</div>
            </li>
          ))}
        </ol>
      </div>
      <div className="band ins2-band rv">
        <span className="band-label">{BRIEF.insurancePartners}</span>
        <Marquee label={BRIEF.insurancePartners} speed={30}>
          {INSURERS.map((l) => <LogoTile key={l.name} l={l} />)}
        </Marquee>
      </div>
    </section>
  );
}

/* ---------------- 8. what our patients say + trusted by patients, one section (brief 15) ----------------
   The user, 2026-11-12: one section, films first, then Trusted by Patients as two slim auto-sliding rows
   (the guest-review quotes were removed at his request). */
export function Stories() {
  const s = section("home", "reviews-testimonials");
  return (
    <section className="section stories voices" aria-labelledby="st-h"><div data-e-block="edge-label" data-e-field="text" className="edge-label left">{SIDE.stories}</div>
      <div className="container">
        <Head eyebrow="Patient stories" id="st-h" title={s.heading} />
      </div>
      <StoryCarousel label={s.heading} count={STORIES.length}>
        {STORIES.map((f) => (
          <li key={f.id} className={`story ${f.shape}`}>
            <InViewVideo src={asset(f.preview)} />
            {f.flag && <span className="flag" aria-hidden="true"><img src={asset(`/logos/marks/flag-${f.flag}.svg`)} alt="" /></span>}
            <Watch src={f.full} />
          </li>
        ))}
      </StoryCarousel>

      {/* Trusted by Patients: one slim row that glides on its own
          (the user, 2026-11-12: "auto carousel ... like 247 Happy Moments ... less height ... two rows"). */}
      <div className="voices-moments">
        <div className="container"><Head center id="trusted-h" title="Trusted by Patients" /></div>
        {[TRUSTED_PHOTOS].map((row, r) => (
          <Marquee key={r} label="Trusted by Patients" speed={26} gap={14}>
            {row.map((p) => (
              <li key={p.src} className="moment" style={{ ["--ar" as string]: `${p.w} / ${p.h}` }}>
                <img src={asset(p.src)} alt="Trusted by patient" width={p.w} height={p.h} loading="lazy" />
              </li>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 9. their blog (from their site, with his leave) ---------------- */
export function Posts({ noHead }: { noHead?: boolean } = {}) {
  return (
    <section className="section bg-surface" aria-labelledby={noHead ? undefined : "blog-h"} aria-label={noHead ? THEIRS.blog : undefined}>
      <div className="container">
        {!noHead && <Head center id="blog-h" title={THEIRS.blog} />}
        <SnapRow className="posts-row" gridFrom={768} label={THEIRS.blog} labels={{ prev: "Previous", next: "Next" }}>
          {POSTS.map((p, i) => (
            <li key={p.href} className="rv" style={d(i * 90)}>
              <a className="post card" href={p.href} target="_blank" rel="noopener">
                <span className="post-img"><img src={asset(p.img)} alt="" width={980} height={500} loading="lazy" /></span>
                <span className="post-date"><b>{p.day}</b><span>{p.month}</span></span>
                <span className="post-body">
                  <h3>{p.title}</h3>
                  <span className="link"><span>{THEIRS.readMore}</span><ArrowUpRight size={18} aria-hidden="true" /></span>
                </span>
              </a>
            </li>
          ))}
        </SnapRow>
      </div>
    </section>
  );
}

/* ---------------- 10. find a clinic (brief 13), Medcierge's explorer ---------------- */
export function Finder() {
  const s = section("home", "find-a-clinic");
  return (
    <section className="section finder" id="clinics" aria-labelledby="find-h">
      <div className="container">
        <Head eyebrow="Find a clinic" id="find-h" title={s.heading} />
        <ClinicFinder
          base={BASE}
          clinics={CLINICS.map((c) => ({ hotel: c.hotel, destination: c.destination, lat: c.lat, lng: c.lng, mappable: c.coord !== "placeholder", href: clinicPath(c) }))}
          labels={{ all: THEIRS.all, waClinic: "WhatsApp This Clinic", directions: "Directions", clinics: BRIEF.hotelClinics, mapLabel: s.heading, showOnMap: "Show on map", moreDetails: "More details" }}
        />
        <div className="cta-row center rv">
          <LinkButton href={href(ROUTES.clinics)} placement="finder" ev="find_clinic_click">{s.ctas[0].label}</LinkButton>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 11. FAQs on the resort photograph; the help band sits on its foot ----------------
   The user, 2026-09-24: FAQs "between view clinic button and feeling unwell", then "make faq on
   the image itself, and make it look good". The heading sits on a white panel and the
   questions on solid white cards (no dark scrim, no blur, so scrolling stays light). */
export function FinalCta() {
  const s = section("home", "faq-home");
  const items = s.items.map((it) => ({ q: it.title, a: it.text ?? "" }));
  /* The same questions and answers as on screen, for search engines and AI answers. */
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
  return (
    <section className="final" aria-labelledby="faq-h">
      {/* His cream room photo, fixed; a slow CSS drift on fine pointers only. */}
      <div className="final-photo" aria-hidden="true">
        <img className="drift" src={asset(PHOTOS.resort.src)} srcSet={`${asset(PHOTOS.resort.small)} 1200w, ${asset(PHOTOS.resort.src)} 2400w`} sizes="100vw" alt="" loading="lazy" width={PHOTOS.resort.w} height={PHOTOS.resort.h} />
      </div>
      <div className="container final-in">
        <div className="faq-grid">
          <div className="faq-side">
            <div className="faq-panel rv">
              <Head eyebrow="FAQ" id="faq-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
            </div>
            <div className="faq-help rv">
              <WaButton placement="section-faq">{BRIEF.waUs}</WaButton>
              <TextLink href={href("/faqs")} placement="faq">{s.ctas[0].label}</TextLink>
            </div>
          </div>
          <FaqList items={items} />
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </section>
  );
}

/* Kept for inner pages that still use the icons. */
export const _icons = { Ambulance };
