/* The home, round 2 (the user's notes, 2026-09-23). Every sentence comes from
   content/247clinic/en/home.json (WEBSITE.docx), from the edits he named
   (content/247clinic/approved-edits.json), or from their live site with his leave.
   Our own words are eyebrows and control labels only (src/content/ui-labels.json). */
import {
  Ambulance, ArrowUpRight, Award, Bandage, BedDouble, Check, CheckCheck, FlaskConical, Globe, HeartPulse, Hotel,
  MapPin, ShieldCheck, Stethoscope, Syringe, Thermometer, UserRoundCheck, Zap,
} from "lucide-react";
import { section, reviews } from "@/content/load";
import { APPROVED, BRIEF, THEIRS } from "@/content/brief";
import { asset, BASE, NUMBERS } from "@/data/facts";
import { CLINICS } from "@/data/clinics";
import { HOTELS, INSURERS, INTRO, PHOTOS, POSTS, STORIES, type Logo } from "@/data/media";
import { ROUTES } from "@/data/nav";
import { CallButton, LinkButton, TextLink, WaButton } from "@/components/ui/Buttons";
import { Head } from "@/components/ui/Bits";
import { Slot, slotFile } from "@/components/ui/Slot";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { CountUp, InViewVideo } from "@/components/ui/Motion";
import { Marquee } from "@/components/ui/Marquee";
import { BigPlay, Watch } from "@/components/ui/Viewer";
import { RowControls } from "./StoryRow";
import { ClinicFinder } from "./ClinicFinder";
import { Parallax } from "./Parallax";

const href = (p: string) => `${BASE}${p}`;
const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/* ---------------- 1. hero: an image, no film (the user, 2026-09-23) ---------------- */
export function Hero() {
  const s = section("home", "hero");
  const [first, ...rest] = s.heading.split(". ");
  const [live, ...tags] = (s.subheading ?? "").split("•").map((t) => t.trim()).filter(Boolean);
  const [text, trust] = s.body;
  const img = slotFile("hero-desktop.webp");
  return (
    <section className="hero" aria-labelledby="hero-h">
      <div className="hero-media">
        {img
          ? <img src={img} alt="" width={1376} height={768} fetchPriority="high" decoding="async" />
          : <Slot file="hero-desktop.webp" purpose="hero image" px="2400 x 1350" />}
        <div className="hero-veil" aria-hidden="true" />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="live"><span className="pulse" aria-hidden="true" />{live}</p>
          <h1 id="hero-h">
            <span className="ln">{first}.</span>
            <span className="ln accent">{rest.join(". ")}</span>
          </h1>
          <p className="hero-text">{text}</p>
          <div className="cta-row hero-ctas">
            <WaButton placement="hero">{s.ctas[0].label}</WaButton>
            <LinkButton href={href(ROUTES.clinics)} placement="hero" ev="find_clinic_click">{s.ctas[1].label}</LinkButton>
          </div>
          <ul className="hero-facts">
            <li className="f-uca"><img src={asset("/logos/marks/uca.png")} alt="" width={40} height={40} /><span>{trust}</span></li>
            {tags.map((t, i) => (
              <li key={t}>{i === 0 ? <ShieldCheck size={19} aria-hidden="true" /> : <Globe size={19} aria-hidden="true" />}<span>{t}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 2. facilities, standards, accreditation: the film (brief 7) ---------------- */
const POINT_ICONS = [Globe, ShieldCheck, Stethoscope, Award];
export function Facilities() {
  const s = section("home", "accreditation-block");
  return (
    <section className="section facilities" aria-labelledby="fac-h">
      <div className="container">
        <Head center eyebrow="Accreditation" id="fac-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
        <div className="stage-wrap">
          <div className="stage rv rv-scale">
            <InViewVideo src={asset("/media/hero.mp4")} className="stage-film" />
            <div className="stage-veil" aria-hidden="true" />
            <BigPlay src="/media/commercial.mp4" label="Watch video" />
          </div>
          <div className="stage-chips">
            <div className="stage-chip rv" style={d(200)}>
              <img src={asset("/logos/marks/uca.png")} alt="Urgent Care Association" width={48} height={48} />
              <span>{APPROVED.accredited}</span>
            </div>
            <div className="stage-chip rv" style={d(300)}>
              <img src={asset("/logos/marks/hcig.png")} alt="Healthcare International Group" width={50} height={48} />
              <span>{APPROVED.partOf}</span>
            </div>
          </div>
        </div>
        <ul className="standards">
          {s.items.map((it, i) => {
            const Ico = POINT_ICONS[i] ?? Check;
            return (
              <li key={it.title} className="std rv" style={d(i * 80)}>
                <span className="ico"><Ico size={22} aria-hidden="true" /></span>
                <b>{it.title}</b>
              </li>
            );
          })}
        </ul>
        <div className="cta-row center rv" style={{ marginTop: 32 }}>
          <TextLink href={href(ROUTES.accreditation)} placement="accreditation">{s.ctas[0].label}</TextLink>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 3. what is 24/7 Clinic (brief 8) ---------------- */
export function Intro() {
  const s = section("home", "what-is-247-clinic");
  const [a, b, c, pull] = s.body;
  return (
    <section className="section bg-surface intro" aria-labelledby="intro-h">
      <span className="watermark" aria-hidden="true">24/7</span>
      <div className="container split rev">
        <div className="intro-media rv">
          <div className="film-card">
            <InViewVideo src={asset(INTRO.preview)} />
            <Watch src={INTRO.full} label="Watch video" />
          </div>
          <div className="intro-deco" aria-hidden="true" />
        </div>
        <div className="stack">
          <Head eyebrow="On-site care" id="intro-h" title={s.heading} />
          <p className="lead rv">{a}</p>
          <p className="rv">{b}</p>
          <p className="rv">{c}</p>
          <p className="pull rv">{pull}</p>
          <div className="rv" style={{ marginTop: 8 }}>
            <LinkButton href={href(ROUTES.clinics)} placement="intro" ev="find_clinic_click">{s.ctas[0].label}</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 4. why a hotel clinic (brief 9), with a photograph ---------------- */
const WHY_ICONS = [Hotel, Zap, Stethoscope, Ambulance];
export function WhyHotel() {
  const s = section("home", "why-hotel-based-medical-care");
  const clinics = NUMBERS.find((n) => n.label === BRIEF.hotelClinics);
  return (
    <section className="section" aria-labelledby="why-h">
      <div className="container why-grid">
        <div className="why-photo rv">
          <img src={asset(PHOTOS.why.src)} alt="" width={PHOTOS.why.w} height={PHOTOS.why.h} loading="lazy" />
          {clinics && <div className="why-stat" aria-hidden="true"><b>{clinics.value}</b><span>{clinics.label}</span></div>}
        </div>
        <div>
          <Head eyebrow="Why a hotel clinic" id="why-h" title={s.heading} />
          <ul className="why-list">
            {s.items.map((it, i) => {
              const Ico = WHY_ICONS[i];
              return (
                <li key={it.title} className="rv" style={d(i * 70)}>
                  <span className="ico"><Ico size={22} aria-hidden="true" /></span>
                  <div><h3>{it.title}</h3><p>{it.text}</p></div>
                </li>
              );
            })}
          </ul>
          <div className="cta-row rv" style={{ marginTop: 28 }}>
            <WaButton placement="section-why">{BRIEF.waUs}</WaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 5. what we treat (brief 10) ---------------- */
const SVC_ICONS = [Thermometer, Bandage, FlaskConical, Syringe, UserRoundCheck, BedDouble];
const SVC_FILES = ["svc-urgent", "svc-injuries", "svc-diagnostics", "svc-iv", "svc-specialist", "svc-room-visit"];
export function Services() {
  const s = section("home", "medical-services");
  return (
    <section className="section bg-surface" aria-labelledby="svc-h">
      <div className="container">
        <div className="head-row">
          <Head eyebrow="What we treat" id="svc-h" title={s.heading} />
          <div className="rv"><TextLink href={href(ROUTES.services)} placement="services">{s.ctas[0].label}</TextLink></div>
        </div>
        <ul className="grid g2 g3">
          {s.items.map((it, i) => {
            const Ico = SVC_ICONS[i];
            return (
              <li key={it.title} className="rv" style={d((i % 3) * 70)}>
                <article className="card svc">
                  <Slot file={`${SVC_FILES[i]}.webp`} purpose={`service card, ${it.title}`} px="1200 x 900" alt={it.title} ratio="4 / 3" />
                  <div className="svc-body">
                    <span className="ico"><Ico size={24} aria-hidden="true" /></span>
                    <h3>{it.title}</h3>
                    <p>{it.text}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        <div className="cta-row center rv" style={{ marginTop: 40 }}>
          <WaButton placement="section-services">{BRIEF.waUs}</WaButton>
          <CallButton placement="section-services" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- 6. insurance and cashless (brief 11) ---------------- */
function LogoTile({ l }: { l: Logo }) {
  return <li className="logo-tile"><img src={asset(l.src)} alt={l.name} width={l.w} height={l.h} loading="lazy" /></li>;
}
export function Insurance({ insuranceMessage }: { insuranceMessage: string }) {
  const s = section("home", "insurance-cashless-care");
  const [p1, p2, assist] = s.body;
  const half = Math.ceil(INSURERS.length / 2);
  return (
    <section className="section" aria-labelledby="ins-h">
      <div className="container split">
        <div className="stack">
          <Head eyebrow="Insurance & cashless" id="ins-h" title={s.heading} />
          <p className="sub rv">{s.subheading}</p>
          <p className="lead rv">{p1}</p>
          <p className="rv">{p2}</p>
          <p className="assist rv">{assist}</p>
          <ul className="checks">
            {s.items.map((it, i) => (
              <li key={it.title} className="rv" style={d(i * 50)}><i aria-hidden="true"><Check size={15} strokeWidth={3} /></i>{it.title}</li>
            ))}
          </ul>
          <div className="cta-row rv" style={{ marginTop: 10 }}>
            <WaButton placement="section-insurance" ctx="insurance">{s.ctas[0].label}</WaButton>
            <LinkButton href={href(ROUTES.insurance)} placement="section-insurance">{s.ctas[1].label}</LinkButton>
          </div>
        </div>
        <div className="rv" style={d(120)}>
          <figure className="chat" aria-hidden="true">
            <div className="chat-top">
              <span className="av"><img src={asset("/logos/marks/247-logo.svg")} alt="" width={30} height={29} /></span>
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
        <span className="eyebrow">{BRIEF.insurancePartners}</span>
        <Marquee label={BRIEF.insurancePartners}>
          {INSURERS.slice(0, half).map((l) => <LogoTile key={l.name} l={l} />)}
        </Marquee>
        <Marquee label={BRIEF.insurancePartners} direction="right">
          {INSURERS.slice(half).map((l) => <LogoTile key={l.name} l={l} />)}
        </Marquee>
      </div>
    </section>
  );
}

/* ---------------- 7. how it works (brief 12) ---------------- */
const STEP_ICONS: React.ComponentType<{ size?: number }>[] = [WhatsAppGlyph, MapPin, ShieldCheck, HeartPulse];
export function HowItWorks() {
  const s = section("home", "how-it-works");
  return (
    <section className="section bg-surface" aria-labelledby="how-h">
      <div className="container">
        <Head center eyebrow="How it works" id="how-h" title={s.heading} />
        <ol className="steps" data-inview>
          <span className="rail" aria-hidden="true"><i /></span>
          {s.items.map((it, i) => {
            const Ico = STEP_ICONS[i];
            return (
              <li key={it.title} className="step rv" style={d(i * 120)}>
                <span className="dot" aria-hidden="true"><Ico size={26} /></span>
                <div>
                  <span className="n">0{i + 1}</span>
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="cta-row center rv" style={{ marginTop: 48 }}>
          <WaButton placement="section-how">{s.ctas[0].label}</WaButton>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 8. what our patients say (brief 15) ---------------- */
export function Stories() {
  const s = section("home", "reviews-testimonials");
  const list = reviews();
  return (
    <section className="section" aria-labelledby="st-h">
      <div className="container">
        <div className="head-row">
          <Head eyebrow="Patient stories" id="st-h" title={s.heading} />
          <RowControls target="story-row" />
        </div>
      </div>
      <ul id="story-row" className="row" tabIndex={0} aria-label={s.heading}>
        {STORIES.map((f) => (
          <li key={f.id} className={`story ${f.shape}`}>
            <InViewVideo src={asset(f.preview)} />
            {f.flag && <span className="flag" aria-hidden="true"><img src={asset(`/logos/marks/flag-${f.flag}.svg`)} alt="" /></span>}
            <Watch src={f.full} />
          </li>
        ))}
      </ul>
      <div className="reviews">
        <Marquee label={s.heading} speed={28} gap={16} bg="#fff">
          {list.map((r) => (
            <li key={r.name}>
              <blockquote className="review">
                <span className="qm" aria-hidden="true">&ldquo;</span>
                <q lang={r.lang}>{r.text}</q>
                <footer><b>{r.name}</b><span>{r.country}</span></footer>
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
        <Head center eyebrow="24/7 Clinic" id="blog-h" title={THEIRS.blog} />
        <ul className="posts">
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
        </ul>
      </div>
    </section>
  );
}

/* ---------------- 10. hotel logos ---------------- */
export function HotelBand() {
  return (
    <section className="section hotels-band" aria-label={BRIEF.hotelClinics}>
      <div className="container band">
        <span className="eyebrow">{BRIEF.hotelClinics}</span>
        <ul className="logo-row">
          {HOTELS.map((l) => <LogoTile key={l.name} l={l} />)}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- 11. find a clinic + numbers (brief 13, 14), Medcierge style ---------------- */
export function Finder() {
  const s = section("home", "find-a-clinic");
  return (
    <section className="section bg-surface finder" id="clinics" aria-labelledby="find-h">
      <div className="container">
        <Head eyebrow="Find a clinic" id="find-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
        <ClinicFinder
          clinics={CLINICS.map(({ hotel, destination, lat, lng, coord }) => ({ hotel, destination, lat, lng, mappable: coord !== "placeholder" }))}
          labels={{ all: THEIRS.all, waClinic: "WhatsApp This Clinic", directions: "Directions", clinics: BRIEF.hotelClinics, mapLabel: s.heading }}
        />
        <div className="numbers">
          {NUMBERS.map((n) => (
            <div key={n.label} className="rv"><CountUp value={n.value} /><span>{n.label}</span></div>
          ))}
        </div>
        <div className="cta-row center rv" style={{ marginTop: 36 }}>
          <LinkButton href={href(ROUTES.clinics)} placement="finder" ev="find_clinic_click">{s.ctas[0].label}</LinkButton>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 12. final call to action over a photograph (brief 16) ---------------- */
export function FinalCta() {
  const s = section("home", "final-cta");
  return (
    <section className="final" aria-labelledby="final-h">
      <Parallax src={asset(PHOTOS.resort.src)} small={asset(PHOTOS.resort.small)} />
      <div className="final-scrim" aria-hidden="true" />
      <div className="container">
        <div className="final-card rv">
          <h2 id="final-h" className="h2">{s.heading}</h2>
          <p className="lead">{s.body[0]}</p>
          <div className="cta-row center">
            <WaButton placement="final">{s.ctas[0].label}</WaButton>
            <LinkButton href={href(ROUTES.clinics)} placement="final" ev="find_clinic_click">{s.ctas[1].label}</LinkButton>
          </div>
          <CallButton placement="final" className="btn-sm" />
        </div>
      </div>
    </section>
  );
}
