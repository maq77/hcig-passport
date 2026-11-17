/* The home, round 4 (the user's notes, 2026-09-24): every idea said once, long
   descriptions behind an arrow, a numbers band under the hero, the moving 24/7,
   centred steps, mobile first. "Why a hotel clinic" (brief 9) said what "Medical Care
   Without Leaving Your Resort" (brief 8) says, so the two are one section now.
   The words come from content/247clinic/en/home.json, rewritten on his instruction
   and logged in content/247clinic/approved-edits.json. Facts only from the brief or him. */
import { Ambulance, ArrowUpRight, Award, Check, Globe, ShieldCheck, Stethoscope } from "lucide-react";
import { section, reviews } from "@/content/load";
import { APPROVED, BRIEF, THEIRS } from "@/content/brief";
import { preload } from "react-dom";
import { asset, BASE, NUMBERS } from "@/data/facts";
import { CLINICS, clinicPath } from "@/data/clinics";
import { FLAGS, HERO_SLIDES, HOTEL_BRANDS, INSURERS, INTRO, PHOTOS, POSTS, STORIES, TRUSTED_PHOTOS, type Logo } from "@/data/media";
import { ROUTES } from "@/data/nav";
import { CallButton, LinkButton, TextLink, WaButton } from "@/components/ui/Buttons";
import { Head, Words } from "@/components/ui/Bits";
import { Slot, slotFile } from "@/components/ui/Slot";
import { CountUp, InViewVideo } from "@/components/ui/Motion";
import { Marquee } from "@/components/ui/Marquee";
import { More } from "@/components/ui/More";
import { SnapRow } from "@/components/ui/SnapRow";
import { BigPlay, Watch } from "@/components/ui/Viewer";
import { HeroCarousel } from "./HeroCarousel";
import { StoryCarousel } from "./StoryRow";
import { ClinicFinder } from "./ClinicFinder";
import { FaqList } from "./FaqList";
import { StepsLine } from "./StepsLine";
import { GuestWords } from "./GuestWords";
import { CarePhone, HowPhone, InsurancePhone } from "./PhoneSections";
import { DetailCard } from "@/components/ui/DetailCard";
import { DetailBody, OpenMark } from "@/components/page/Detail";
import { serviceDetail } from "@/components/page/Common";

const href = (p: string) => `${BASE}${p}`;
const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });
const k = (n: number) => ({ ["--k" as string]: n });

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

/* ---------------- 2. proof: the numbers, then the hotels they are inside ----------------
   v6: three open columns, Calisto numerals (a red "+" where the number has one), hairline dividers, no icon
   tiles; one slow logo row at 28px that eases to a stop on hover. */
function LogoTile({ l }: { l: Logo }) {
  return <li className="logo-tile"><img src={asset(l.src)} alt={l.name} width={l.w} height={l.h} loading="lazy" /></li>;
}
export function HotelBand() {
  return (
    <section className="proof" aria-label={BRIEF.hotelClinics}>
      
      <div className="container">
        <ul className="stats">
          {NUMBERS.map((n, i) => (
            <li key={n.label} className="stat rv" style={d(i * 90)}>
              <span className="stat-num num"><CountUp value={n.value} suffix={"suffix" in n ? n.suffix : undefined} /></span>
              <span className="stat-label">{n.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <Marquee label={BRIEF.hotelClinics} speed={18}>
        {HOTEL_BRANDS.map((b) => b.logo
          ? <LogoTile key={b.name} l={b.logo} />
          : <li key={b.name} className="logo-tile name-tile"><span>{b.name}</span></li>)}
      </Marquee>
    </section>
  );
}

/* ---------------- 3. accreditation and standards, with the film (brief 7) ----------------
   v6: the film capped at 1040px (radius 16) with the opening commercial behind BigPlay, UCA as a hairline
   plate on the film (the user, 2026-11-12: on the video on every screen), the four standards as one
   hairline row (2 x 2 on phones), flat ivory ground. */
const POINT_ICONS = [Globe, ShieldCheck, Stethoscope, Award];
export function Facilities() {
  const s = section("home", "accreditation-block");
  return (
    <section className="section facilities" aria-labelledby="fac-h">
      <div className="container">
        <Head center eyebrow="Accreditation" id="fac-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
        <div className="stage rv">
          <InViewVideo src={asset("/media/hero.mp4")} className="stage-film" />
          <BigPlay src="/media/commercial.mp4" label="Watch video" />
          <div className="uca-plate">
            <span className="uca-logo"><img src={asset("/logos/marks/uca.png")} alt="" width={48} height={48} /></span>
            <span className="uca-text">
              <small>Accreditation</small>
              <b>Urgent Care Association</b>
            </span>
          </div>
        </div>
        <ul className="standards">
          {s.items.map((it, i) => {
            const Ico = POINT_ICONS[i] ?? Check;
            return (
              <li key={it.title} className="std rv" style={d(i * 80)}>
                <Ico size={20} aria-hidden="true" />
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

/* ---------------- 4. what we treat (brief 10) ----------------
   v6: photo cards, a Calisto numeral cut into the photo's corner, the title, one line, a hairline Open mark.
   Phones keep the 2 x 3 grid (his correction, 2026-09-24); 07 is a solid ink panel. The cards open into
   their full points (DetailCard, unchanged). */
const SVC_FILES = ["svc-urgent", "svc-injuries", "svc-diagnostics", "svc-delivery", "svc-specialist", "svc-room-visit"];
export function Services() {
  const s = section("home", "medical-services");
  const feature = s.items[6];
  return (
    <section className="section services" aria-labelledby="svc-h">
      <div className="container">
        <div className="head-row">
          <Head eyebrow="What we treat" id="svc-h" title={s.heading} />
          <div className="rv head-link"><TextLink href={href(ROUTES.services)} placement="services">{s.ctas[0].label}</TextLink></div>
        </div>
        <ul className="svc-grid">
          {s.items.slice(0, 6).map((it, i) => {
            const file = `${SVC_FILES[i]}.webp`;
            return (
              <li key={it.title} className="rv" style={d((i % 3) * 70)}>
                <DetailCard label={it.title} trigger={
                  <span className="svc">
                    <span className="svc-media">
                      <span className="svc-pic"><Slot file={file} purpose={`service card, ${it.title}`} px="1200 x 800" alt="" /></span>
                      <span className="svc-n num" aria-hidden="true">0{i + 1}</span>
                    </span>
                    <span className="svc-body">
                      <h3>{it.title}</h3>
                      {it.text && <span className="svc-quick">{it.text}</span>}
                      <OpenMark label="Open" />
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
              <span className="svc-feature-n num" aria-hidden="true">07</span>
              <h3 id="svc-feature-h">{feature.title}</h3>
              <ul className="svc-feature-list">
                {(feature.text ?? "").split(/,\s*/).map((x) => (
                  <li key={x}><Check size={16} aria-hidden="true" /><span>{x}</span></li>
                ))}
              </ul>
              <div><WaButton placement="section-services-feature">{BRIEF.waUs}</WaButton></div>
            </div>
            <span className="svc-feature-media"><img className="svc-feature-img" src={asset("/slots/svc-iv.webp")} alt={feature.title} width={1200} height={800} loading="lazy" /></span>
          </article>
        )}
      </div>
    </section>
  );
}

/* ---------------- 5. on-site care, with how it works at its foot (brief 8, 9 and 12) ----------------
   v6, the Pulso layout: a label column, two overlapping offset photos that open with the clip wipe, three
   numbered hairline rows. Then the four steps of How it works as one slim numbered row (Amendment 1: the
   Insurance section has its own three steps right after, and two step sections read as a manual). */
export function Intro() {
  const s = section("home", "what-is-247-clinic");
  const how = section("home", "how-it-works");
  /* Phones get their own motion layout (PhoneSections, the owner's Set 1, 2026-11-17); this one is desktop's. */
  return (
    <>
    <section className="section bg-surface intro pm-d" aria-labelledby="intro-h">
      <div className="container">
        <div className="intro-grid">
          <div className="intro-label">
            <Head eyebrow="On-site care" id="intro-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
          </div>
          <div className="intro-media">
            <div className="wv-main drift">
              <span className="wv-pic"><img src={asset(PHOTOS.why.src)} alt="" width={PHOTOS.why.w} height={PHOTOS.why.h} loading="lazy" /></span>
              <Watch src={INTRO.full} label="Watch video" />
            </div>
            <div className="wv-sub drift back">
              <span className="wv-pic"><img src={asset(PHOTOS.whyResort.src)} alt="" width={PHOTOS.whyResort.w} height={PHOTOS.whyResort.h} loading="lazy" /></span>
            </div>
          </div>
          <ol className="care-list">
            {s.items.map((it, i) => (
              <li key={it.title} className="care rv" style={d(i * 90)}>
                <span className="care-n num" aria-hidden="true">0{i + 1}</span>
                <div className="care-text">
                  <h3>{it.title}</h3>
                  {it.text && <More text={it.text} label={it.title} />}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="how-line">
          <div className="how-line-head">
            <span className="eyebrow rv">How it works</span>
            <h3 className="how-line-h rv" id="how-h">{how.heading}</h3>
          </div>
          <StepsLine steps={how.items.map((it) => ({ title: it.title, text: it.text }))} labels={{ more: "Show more", less: "Show less" }} />
        </div>
      </div>
    </section>
    <CarePhone />
    <HowPhone />
    </>
  );
}

/* ---------------- 7. insurance and cashless (brief 11) ----------------
   His rewritten words (2026-11-12), untouched: one promise, three steps as hairline rows with Calisto
   numerals, the cashless line with the red rule beside it, one button, one quiet insurer row. */
export function Insurance(_: { insuranceMessage: string }) {
  const s = section("home", "insurance-cashless-care");
  return (
    <>
    <section className="section bg-surface insurance ins2 pm-d" aria-labelledby="ins-h">
      <div className="container ins2-grid">
        <div className="ins2-copy">
          <Head eyebrow="Insurance & cashless" id="ins-h" title={s.heading} />
          <p className="ins2-sub rv">{s.subheading}</p>
          <p className="ins2-note rv"><span className="rule" aria-hidden="true" /><span>{s.body[0]}</span></p>
          <div className="ins2-ctas rv">
            <WaButton placement="section-insurance" ctx="insurance">{s.ctas[0].label}</WaButton>
            <TextLink href={href(ROUTES.insurance)} placement="section-insurance">{s.ctas[1].label}</TextLink>
          </div>
        </div>
        <ol className="ins2-steps">
          {s.items.map((it, i) => (
            <li key={it.title} className="rv" style={d(i * 120)}>
              <span className="n num" aria-hidden="true">0{i + 1}</span>
              <div><h3>{it.title}</h3>{it.text && <p>{it.text}</p>}</div>
            </li>
          ))}
        </ol>
      </div>
      <div className="band ins2-band rv">
        <span className="band-label">{BRIEF.insurancePartners}</span>
        <Marquee label={BRIEF.insurancePartners} speed={18}>
          {INSURERS.map((l) => <LogoTile key={l.name} l={l} />)}
        </Marquee>
      </div>
    </section>
    <InsurancePhone />
    </>
  );
}

/* ---------------- 8. guests: the films, their words, then Trusted by Patients (brief 15) ----------------
   Amendment 1: one section. Desktop: the films rail left, one guest quote right; phones stack them. Then
   the slim Trusted by Patients row that glides on its own (the user, 2026-11-12). */
export function Stories() {
  const s = section("home", "reviews-testimonials");
  return (
    <section className="section stories" aria-labelledby="st-h">
      <div className="container">
        <Head eyebrow="Patient stories" id="st-h" title={s.heading} />
      </div>
      <div className="container guests">
        <div className="guests-films">
          <StoryCarousel label={s.heading} count={STORIES.length}>
            {STORIES.map((f) => (
              <li key={f.id} className={`story ${f.shape}`}>
                <InViewVideo src={asset(f.preview)} />
                {f.flag && <span className="flag" aria-hidden="true"><img src={asset(`/logos/marks/flag-${f.flag}.svg`)} alt="" /></span>}
                <Watch src={f.full} />
              </li>
            ))}
          </StoryCarousel>
        </div>
        <div className="guests-words rv">
          <GuestWords reviews={reviews()} flags={FLAGS} base={BASE} labels={{ prev: "Previous", next: "Next" }} labelledBy="st-h" />
        </div>
      </div>

      <div className="trusted">
        <h3 className="band-label rv" id="trusted-h">Trusted by Patients</h3>
        <Marquee label="Trusted by Patients" speed={22} gap={12}>
          {TRUSTED_PHOTOS.map((p) => (
            <li key={p.src} className="moment" style={{ ["--ar" as string]: `${p.w} / ${p.h}` }}>
              <img src={asset(p.src)} alt="Trusted by patient" width={p.w} height={p.h} loading="lazy" />
            </li>
          ))}
        </Marquee>
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

/* ---------------- 11. FAQs on the resort photograph, then the closing line ----------------
   His cream room photo kept (2026-09-24: "make faq on the image itself"). v6: one flat ivory panel on the
   photo, the heading on the left and a hairline accordion on the right (the plus turns to an x, 400ms).
   Then the closing line from final-cta in Cormorant on ivory with WhatsApp and call; the footer does not
   repeat it on the home. */
export function FinalCta() {
  const s = section("home", "faq-home");
  const close = section("home", "final-cta");
  const items = s.items.map((it) => ({ q: it.title, a: it.text ?? "" }));
  /* The same questions and answers as on screen, for search engines and AI answers. */
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
  return (
    <>
      <section className="final" aria-labelledby="faq-h">
        <div className="final-photo" aria-hidden="true">
          <img className="drift" src={asset(PHOTOS.resort.src)} srcSet={`${asset(PHOTOS.resort.small)} 1200w, ${asset(PHOTOS.resort.src)} 2400w`} sizes="100vw" alt="" loading="lazy" width={PHOTOS.resort.w} height={PHOTOS.resort.h} />
        </div>
        <div className="container final-in">
          <div className="faq-panel rv">
            <div className="faq-side">
              <Head eyebrow="FAQ" id="faq-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
              <TextLink href={href("/faqs")} placement="faq">{s.ctas[0].label}</TextLink>
            </div>
            <FaqList items={items} />
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </section>
      <section className="final-close" aria-labelledby="close-h">
        <div className="container final-close-in">
          <span className="rule rv" aria-hidden="true" />
          <h2 className="h2 rv hw" id="close-h"><Words text={close.heading} /></h2>
          <p className="lead rv">{close.body[0]}</p>
          <div className="cta-row center rv">
            <WaButton placement="final-close">{BRIEF.waUs}</WaButton>
            <CallButton placement="final-close" />
          </div>
        </div>
      </section>
    </>
  );
}

/* Kept for inner pages that still use the icons. */
export const _icons = { Ambulance };
