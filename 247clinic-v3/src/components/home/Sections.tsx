/* The home, section by section, in spec FR-007 order. Every sentence comes from
   content/247clinic/en/home.json (WEBSITE.docx). Our own words are the eyebrows and
   control labels only (src/content/ui-labels.json). */
import {
  Ambulance, Award, Bandage, BedDouble, Check, CheckCheck, FlaskConical, Globe, HeartPulse, Hotel,
  MapPin, ShieldCheck, Stethoscope, Syringe, Thermometer, UserRoundCheck, Zap,
} from "lucide-react";
import { section, reviews } from "@/content/load";
import { BRIEF } from "@/content/brief";
import { asset, BASE, NUMBERS } from "@/data/facts";
import { DESTINATIONS, clinicsIn, mappable } from "@/data/clinics";
import { HOTELS, INSURERS, INTRO, STORIES, type Logo } from "@/data/media";
import { ROUTES } from "@/data/nav";
import { CallButton, LinkButton, TextLink, WaButton } from "@/components/ui/Buttons";
import { Head } from "@/components/ui/Bits";
import { Slot, slotFile } from "@/components/ui/Slot";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { CountUp, InViewVideo } from "@/components/ui/Motion";
import { Marquee } from "@/components/ui/Marquee";
import { Watch } from "@/components/ui/Viewer";
import { HeroFilm } from "./HeroFilm";
import { RowControls } from "./StoryRow";
import { ClinicMap } from "./ClinicMap";

const href = (p: string) => `${BASE}${p}`;
const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/* ---------------- 1. hero (brief 6) ---------------- */
export function Hero() {
  const s = section("home", "hero");
  const [first, ...rest] = s.heading.split(". ");
  const tags = (s.subheading ?? "").split("•").map((t) => t.trim()).filter(Boolean);
  const [text, trust] = s.body;
  return (
    <section className="hero" aria-labelledby="hero-h">
      <HeroFilm still={slotFile("hero-still.webp")} />
      <div className="hero-inner">
        <div className="container">
          <div className="hero-panel">
            <h1 id="hero-h">
              {first}.<span className="accent">{rest.join(". ")}</span>
            </h1>
            <ul className="hero-tags">{tags.map((t) => <li key={t}>{t}</li>)}</ul>
            <p className="hero-text">{text}</p>
            <div className="cta-row">
              <WaButton placement="hero">{s.ctas[0].label}</WaButton>
              <LinkButton href={href(ROUTES.clinics)} placement="hero" ev="find_clinic_click">{s.ctas[1].label}</LinkButton>
            </div>
            <p className="hero-trust">
              <img src={asset("/logos/marks/uca.png")} alt="" width={40} height={40} />
              <span>{trust}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 2. accreditation (brief 7) ---------------- */
const POINT_ICONS = [Globe, ShieldCheck, Stethoscope, Award];
export function Accreditation() {
  const s = section("home", "accreditation-block");
  return (
    <section className="section" aria-labelledby="acc-h">
      <div className="container split">
        <div className="stack">
          <Head eyebrow="Accreditation" id="acc-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
          <ul className="points">
            {s.items.map((it, i) => {
              const Ico = POINT_ICONS[i] ?? Check;
              return <li key={it.title} className="rv" style={d(i * 60)}><Ico size={22} aria-hidden="true" />{it.title}</li>;
            })}
          </ul>
          <div className="rv" style={{ marginTop: 10 }}>
            <TextLink href={href(ROUTES.accreditation)} placement="accreditation">{s.ctas[0].label}</TextLink>
          </div>
        </div>
        <div className="seal rv" style={d(120)}>
          <div className="seal-row">
            <img src={asset("/logos/marks/uca.png")} alt="Urgent Care Association" width={210} height={210} />
            <Slot file="caucq.png" purpose="CAUCQ accreditation mark" px="600 x 600" alt="CAUCQ" />
          </div>
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
    <section className="section bg-surface" aria-labelledby="intro-h">
      <div className="container split rev">
        <div className="intro-media rv">
          <div className="film-card">
            <InViewVideo src={asset(INTRO.preview)} />
            <Watch src={INTRO.full} />
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

/* ---------------- 4. why a hotel clinic (brief 9) ---------------- */
const WHY_ICONS = [Hotel, Zap, Stethoscope, Ambulance];
export function WhyHotel() {
  const s = section("home", "why-hotel-based-medical-care");
  return (
    <section className="section" aria-labelledby="why-h">
      <div className="container">
        <Head center eyebrow="Why a hotel clinic" id="why-h" title={s.heading} />
        <ul className="grid g2 g4">
          {s.items.map((it, i) => {
            const Ico = WHY_ICONS[i];
            return (
              <li key={it.title} className="rv" style={d(i * 70)}>
                <div className="card why-card">
                  <div className="why-top"><span className="ico"><Ico size={24} aria-hidden="true" /></span><span className="num">0{i + 1}</span></div>
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="cta-row center rv" style={{ marginTop: 40 }}>
          <WaButton placement="section-why">{BRIEF.waUs}</WaButton>
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
          {INSURERS.map((l) => <LogoTile key={l.name} l={l} />)}
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

/* ---------------- 9. hotel logos ---------------- */
export function HotelBand() {
  return (
    <section className="section" style={{ paddingTop: 0 }} aria-label={BRIEF.hotelClinics}>
      <div className="band" style={{ paddingTop: 0 }}>
        <span className="eyebrow">{BRIEF.hotelClinics}</span>
        <Marquee label={BRIEF.hotelClinics} direction="right">
          {HOTELS.map((l) => <LogoTile key={l.name} l={l} />)}
        </Marquee>
      </div>
    </section>
  );
}

/* ---------------- 10. find a clinic + numbers (brief 13, 14) ---------------- */
export function Finder() {
  const s = section("home", "find-a-clinic");
  const pins = mappable().map(({ hotel, lat, lng }) => ({ hotel, lat, lng }));
  return (
    <section className="section bg-surface" aria-labelledby="find-h">
      <div className="container">
        <div className="split">
          <div className="stack">
            <Head eyebrow="Find a clinic" id="find-h" title={s.heading} lead={<p>{s.body[0]}</p>} />
            <div className="dest rv">
              <div className="dest-head" aria-hidden="true"><span>{BRIEF.destination}</span><span>{BRIEF.hotelClinics}</span></div>
              <ul>
                {DESTINATIONS.map((dd) => (
                  <li key={dd.id}>
                    <span className="nm"><MapPin size={20} aria-hidden="true" />{dd.name}</span>
                    <span className="ct">{clinicsIn(dd.id).length}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="cta-row rv" style={{ marginTop: 8 }}>
              <LinkButton href={href(ROUTES.clinics)} placement="finder" ev="find_clinic_click">{s.ctas[0].label}</LinkButton>
            </div>
          </div>
          <div className="rv" style={d(120)}>
            <ClinicMap pins={pins} label={s.heading} />
          </div>
        </div>
        <div className="numbers">
          {NUMBERS.map((n) => (
            <div key={n.label} className="rv"><CountUp value={n.value} /><span>{n.label}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 11. final call to action (brief 16) ---------------- */
export function FinalCta() {
  const s = section("home", "final-cta");
  return (
    <section className="final" aria-labelledby="final-h">
      <InViewVideo src={asset("/media/hero-m.mp4")} className="final-film" />
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
