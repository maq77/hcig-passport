/* The home, round 4 (the user's notes, 2026-09-24): every idea said once, long
   descriptions behind an arrow, a numbers band under the hero, the moving 24/7,
   centred steps, mobile first. "Why a hotel clinic" (brief 9) said what "Medical Care
   Without Leaving Your Resort" (brief 8) says, so the two are one section now.
   The words come from content/247clinic/en/home.json, rewritten on his instruction
   and logged in content/247clinic/approved-edits.json. Facts only from the brief or him. */
import {
  Ambulance, ArrowUpRight, Award, Bandage, BedDouble, Check, CheckCheck, FlaskConical, Globe, HeartPulse, Hotel,
  MapPin, ShieldCheck, Stethoscope, Syringe, Thermometer, UserRoundCheck, UsersRound,
} from "lucide-react";
import { section, reviews } from "@/content/load";
import { APPROVED, BRIEF, THEIRS } from "@/content/brief";
import { asset, BASE, NUMBERS } from "@/data/facts";
import { CLINICS, clinicPath } from "@/data/clinics";
import { FLAGS, HERO_SLIDES, HOTEL_BRANDS, INSURERS, INTRO, PHOTOS, POSTS, STORIES, type Logo } from "@/data/media";
import { ROUTES } from "@/data/nav";
import { CallButton, LinkButton, TextLink, WaButton } from "@/components/ui/Buttons";
import { Head } from "@/components/ui/Bits";
import { Slot, slotFile } from "@/components/ui/Slot";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { CountUp, InViewVideo } from "@/components/ui/Motion";
import { Marquee } from "@/components/ui/Marquee";
import { More } from "@/components/ui/More";
import { Watermark } from "@/components/ui/Watermark";
import { SnapRow } from "@/components/ui/SnapRow";
import { BigPlay, Watch } from "@/components/ui/Viewer";
import { Drift, Grow, HeroDepth } from "@/components/ui/ScrollFx";
import { HeroCarousel } from "./HeroCarousel";
import { StoryCarousel } from "./StoryRow";
import { ClinicFinder } from "./ClinicFinder";
import { Parallax } from "./Parallax";

const href = (p: string) => `${BASE}${p}`;
const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/* ---------------- 1. hero ---------------- */
export function Hero() {
  const s = section("home", "hero");
  const [first, ...rest] = s.heading.split(". ");
  const [live, ...tags] = (s.subheading ?? "").split("•").map((t) => t.trim()).filter(Boolean);
  /* Each slide is captioned with the title of what it shows, further down the page. */
  const svc = section("home", "medical-services");
  const care = section("home", "what-is-247-clinic");
  const how = section("home", "how-it-works");
  const captions = [svc.items[5]?.title, care.items[0]?.title, how.items[0]?.title, care.items[1]?.title];
  const slides = HERO_SLIDES
    .filter((sl) => (sl.slot ? slotFile(sl.slot) : true))
    .map((sl, k) => ({ ...sl, src: asset(sl.src), caption: captions[k] ?? "" }));
  return (
    <section className="hero" aria-labelledby="hero-h">
      <div className="hero-media">
        <HeroDepth className="hero-pic">
          {slides.length
            ? <HeroCarousel slides={slides} label="Photos" labels={{ prev: "Previous", next: "Next", show: "Show photo" }} />
            : <Slot file="hero-desktop.webp" purpose="hero image" px="2400 x 1350" />}
        </HeroDepth>
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="live"><span className="pulse" aria-hidden="true" />{live}</p>
          <h1 id="hero-h">
            <span className="ln">{first}.</span>
            <span className="ln accent">{rest.join(". ")}</span>
          </h1>
          <p className="hero-text">{s.body[0]}</p>
          <div className="cta-row hero-ctas">
            <WaButton placement="hero">{s.ctas[0].label}</WaButton>
            <LinkButton href={href(ROUTES.clinics)} placement="hero" ev="find_clinic_click">{s.ctas[1].label}</LinkButton>
          </div>
          {/* On phones the black top bar is hidden, so its promises sit here instead. */}
          <ul className="hero-facts">
            {tags.map((t, i) => (
              <li key={t}>{i === 0 ? <ShieldCheck size={17} aria-hidden="true" /> : <Globe size={17} aria-hidden="true" />}<span>{t}</span></li>
            ))}
          </ul>
        </div>
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
      <div className="container">
        <ul className="stats">
          {NUMBERS.map((n, i) => {
            const Ico = STAT_ICONS[i];
            return (
              <li key={n.label} className="stat rv" style={d(i * 90)}>
                <span className="stat-ico" aria-hidden="true"><Ico size={22} /></span>
                <span className="stat-num"><CountUp value={n.value} /></span>
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
    <section className="section bg-surface facilities" aria-labelledby="fac-h">
      <div className="container">
        <Head center eyebrow="Accreditation" id="fac-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
        <div className="stage-wrap">
          <Grow className="stage">
            <InViewVideo src={asset("/media/hero.mp4")} className="stage-film" />
            <div className="stage-veil" aria-hidden="true" />
            <BigPlay src="/media/commercial.mp4" label="Watch video" />
          </Grow>
          <div className="stage-chips">
            <div className="stage-chip rv" style={d(200)}>
              <img src={asset("/logos/marks/uca.png")} alt="" width={48} height={48} />
              <span>Urgent Care Association</span>
            </div>
            <div className="stage-chip rv" style={d(300)}>
              <img src={asset("/logos/marks/hcig.png")} alt="" width={50} height={48} />
              <span>{APPROVED.partOf}</span>
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
        <div className="cta-row center rv" style={{ marginTop: 20 }}>
          <TextLink href={href(ROUTES.accreditation)} placement="accreditation">{s.ctas[0].label}</TextLink>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 4. what we treat (brief 10) ---------------- */
const SVC_ICONS = [Thermometer, Bandage, FlaskConical, Syringe, UserRoundCheck, BedDouble];
const SVC_FILES = ["svc-urgent", "svc-injuries", "svc-diagnostics", "svc-iv", "svc-specialist", "svc-room-visit"];
export function Services() {
  const s = section("home", "medical-services");
  return (
    <section className="section services" aria-labelledby="svc-h">
      <div className="container">
        <div className="head-row">
          <Head eyebrow="What we treat" id="svc-h" title={s.heading} />
          <div className="rv head-link"><TextLink href={href(ROUTES.services)} placement="services">{s.ctas[0].label}</TextLink></div>
        </div>
        {/* Two columns on phones so all six show at once (the user, 2026-09-24), three on desktop. */}
        <ul className="svc-grid">
          {s.items.map((it, i) => {
            const Ico = SVC_ICONS[i];
            const file = `${SVC_FILES[i]}.webp`;
            return (
              <li key={it.title} className="rv" style={d((i % 3) * 70)}>
                <article className={`card svc ${slotFile(file) ? "has-img" : ""}`}>
                  <div className="svc-media">
                    <Slot file={file} purpose={`service card, ${it.title}`} px="1200 x 800" alt={it.title} ratio="3 / 2" />
                    <span className="svc-n" aria-hidden="true">0{i + 1}</span>
                  </div>
                  <div className="svc-body">
                    <span className="ico"><Ico size={22} aria-hidden="true" /></span>
                    <div className="svc-text">
                      <h3>{it.title}</h3>
                      {it.text && <More text={it.text} label={it.title} />}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        <div className="cta-row center rv" style={{ marginTop: 28 }}>
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
    <section className="section bg-surface intro" aria-labelledby="intro-h">
      <Watermark />
      <div className="container intro-grid">
        <div className="intro-media rv">
          <Drift speed={0.04} className="wv-main">
            <img src={asset(PHOTOS.why.src)} alt="" width={PHOTOS.why.w} height={PHOTOS.why.h} loading="lazy" />
            <Watch src={INTRO.full} label="Watch video" />
          </Drift>
          <Drift speed={-0.1} className="wv-sub">
            <img src={asset(PHOTOS.whyResort.src)} alt="" width={PHOTOS.whyResort.w} height={PHOTOS.whyResort.h} loading="lazy" />
          </Drift>
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
    <section className="section how" aria-labelledby="how-h">
      <div className="container">
        <Head center eyebrow="How it works" id="how-h" title={s.heading} />
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
        <div className="cta-row center rv" style={{ marginTop: 32 }}>
          <WaButton placement="section-how">{s.ctas[0].label}</WaButton>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 7. insurance and cashless (brief 11) ---------------- */
export function Insurance({ insuranceMessage }: { insuranceMessage: string }) {
  const s = section("home", "insurance-cashless-care");
  const [p1, cashless] = s.body;
  const half = Math.ceil(INSURERS.length / 2);
  return (
    <section className="section bg-surface insurance" aria-labelledby="ins-h">
      <div className="container split">
        <div className="stack">
          <Head eyebrow="Insurance & cashless" id="ins-h" title={s.heading} />
          <p className="sub rv">{s.subheading}</p>
          <p className="lead rv">{p1}</p>
          <div className="cashless rv">
            <p>{cashless}</p>
            <ul className="checks">
              {s.items.map((it) => (
                <li key={it.title}><i aria-hidden="true"><Check size={13} strokeWidth={3.2} /></i>{it.title}</li>
              ))}
            </ul>
          </div>
          <div className="cta-row rv" style={{ marginTop: 4 }}>
            <WaButton placement="section-insurance" ctx="insurance">{s.ctas[0].label}</WaButton>
            <LinkButton href={href(ROUTES.insurance)} placement="section-insurance">{s.ctas[1].label}</LinkButton>
          </div>
        </div>
        <div className="rv chat-wrap" style={d(120)}>
          <figure className="chat" aria-hidden="true">
            <div className="chat-top">
              <span className="av"><img src={asset("/logos/marks/247-mark.svg")} alt="" width={30} height={29} /></span>
              <b>24/7 Clinic</b>
              <WhatsAppGlyph size={22} />
            </div>
            <div className="chat-body">
              <p className="bubble">{insuranceMessage}<CheckCheck className="ticks" size={16} /></p>
              <span className="typing"><span /><span /><span /></span>
            </div>
          </figure>
        </div>
      </div>
      <div className="band rv">
        <span className="band-label">{BRIEF.insurancePartners}</span>
        <Marquee label={BRIEF.insurancePartners} bg="#faf7f5">
          {INSURERS.slice(0, half).map((l) => <LogoTile key={l.name} l={l} />)}
        </Marquee>
        <Marquee label={BRIEF.insurancePartners} direction="right" bg="#faf7f5">
          {INSURERS.slice(half).map((l) => <LogoTile key={l.name} l={l} />)}
        </Marquee>
      </div>
    </section>
  );
}

/* ---------------- 8. what our patients say (brief 15) ---------------- */
export function Stories() {
  const s = section("home", "reviews-testimonials");
  const list = reviews();
  return (
    <section className="section stories" aria-labelledby="st-h">
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
      <div className="reviews">
        <Marquee label={s.heading} speed={28} gap={16} bg="#fff">
          {list.map((r) => (
            <li key={r.name}>
              <blockquote className="review">
                <span className="qm" aria-hidden="true">&ldquo;</span>
                <q lang={r.lang}>{r.text}</q>
                <footer>
                  {FLAGS[r.country]
                    ? <img className="rv-flag" src={asset(`/logos/marks/flag-${FLAGS[r.country]}.svg`)} alt={r.country} width={26} height={26} />
                    : null}
                  <b>{r.name}</b>
                </footer>
              </blockquote>
            </li>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/* ---------------- 9. their blog (from their site, with his leave) ---------------- */
export function Posts() {
  return (
    <section className="section bg-surface" aria-labelledby="blog-h">
      <div className="container">
        <Head center id="blog-h" title={THEIRS.blog} />
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
        <div className="cta-row center rv" style={{ marginTop: 24 }}>
          <LinkButton href={href(ROUTES.clinics)} placement="finder" ev="find_clinic_click">{s.ctas[0].label}</LinkButton>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 11. the resort photograph the help band sits on ---------------- */
export function FinalCta() {
  return (
    <div className="final" aria-hidden="true">
      <Parallax src={asset(PHOTOS.resort.src)} small={asset(PHOTOS.resort.small)} />
      <div className="final-scrim" />
    </div>
  );
}

/* Kept for inner pages that still use the icons. */
export const _icons = { Ambulance };
