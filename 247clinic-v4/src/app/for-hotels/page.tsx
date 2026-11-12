/* For Hotels & Partners, content update 2026-11-12 (his B2B brief, content only, design kept;
   approved on canvas H6dARjuHkaTeYqcUUvwYdB). The Hotel Clinic Concept is not a page: it is
   the #model section here, four cards that open into full cards.
   Partnership buttons go to the business enquiry form (his answer, not WhatsApp). */
import { ArrowDown, ArrowRight } from "lucide-react";
import { section } from "@/content/load";
import { asset, BASE } from "@/data/facts";
import { Band, Checks, CtaPanel, PageHero, iconFor, pageMeta } from "@/components/page/Page";
import { DetailCard } from "@/components/ui/DetailCard";
import { DetailBody, OpenMark } from "@/components/page/Detail";

const P = "for-hotels";
const hero = section(P, "hero");
export const metadata = pageMeta(hero.heading, hero.body[0], "/for-hotels");

/* Photos: real ones first (clinic care at a resort, the team with the golf cart, the hotel). */
const MODEL_IMG: [string, string][] = [
  ["/img/new-medical-care.jpg", "50% 38%"],
  ["/slots/svc-specialist.webp", "50% 55%"],
  ["/img/hero-resort-authentic.jpg", "50% 84%"],
  ["/img/why-resort.webp", "50% 60%"],
];

export default function ForHotels() {
  const ch = section(P, "challenges");
  const adv = section(P, "advantage");
  const svc = section(P, "services");
  const model = section(P, "model");
  const cards = [1, 2, 3, 4].map((n) => section(P, `model-${n}`));
  const val = section(P, "value");
  const cta = section(P, "cta");
  const form = `${BASE}/contact-us#business`;
  const partner = hero.ctas[0].label;
  const PartnerBtn = ({ red }: { red?: boolean }) => (
    <a href={form} className={`btn ${red ? "btn-call" : "btn-white"}`} data-placement="for-hotels-partner">
      <span>{partner}</span><ArrowRight size={18} aria-hidden="true" />
    </a>
  );
  return (
    <>
      <PageHero eyebrow="For Hotels & Partners" title={hero.heading} sub={hero.subheading}
        img="/img/hero-resort.webp" pos="62% 50%" posM="72% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "For Hotels & Partners", path: "/for-hotels" }]}>
        <PartnerBtn />
        <a href="#model" className="btn btn-secondary"><span>{hero.ctas[1].label}</span><ArrowDown size={18} aria-hidden="true" /></a>
      </PageHero>

      {/* His note 2026-11-12: the hero was "Very overcrowded"; its paragraph and pull line open the page instead. */}
      <section className="section pg-band" aria-label={hero.heading}>
        <div className="container pg-narrow">
          <div className="pg-copy rv">
            {hero.body.slice(0, 2).map((p) => <p key={p}>{p}</p>)}
            {hero.body[2] && <p className="pg-pull">{hero.body[2]}</p>}
          </div>
        </div>
      </section>

      <Band id="h-ch" title={ch.heading} center>
        {/* One short sentence each: shown whole, no arrow. */}
        <ul className="tiles c4 has-text">
          {ch.items.map((it, i) => {
            const Ico = iconFor(it.title);
            return (
              <li key={it.title} className="tile rv" style={{ ["--d" as string]: `${i * 70}ms` }}>
                <span className="tile-ico" aria-hidden="true"><Ico size={22} /></span>
                <div className="tile-text"><h3>{it.title}</h3><p className="tile-p">{it.text}</p></div>
              </li>
            );
          })}
        </ul>
        <p className="pg-statement rv">{ch.body[0]} <em>{ch.body[1]}</em></p>
      </Band>

      <Band id="h-adv" title={adv.heading} center tint>
        <div className="pg-two">
          <Checks title={adv.body[0]} items={adv.items.slice(0, 6).map((i) => i.title)} />
          <Checks title={adv.body[1]} items={adv.items.slice(6).map((i) => i.title)} />
        </div>
        <p className="pg-closing rv">{adv.body[2]}</p>
      </Band>

      <Band id="h-svc" title={svc.heading} eyebrow={svc.subheading ?? undefined} lead={<p>{svc.body[0]}</p>} dark>
        <ul className="glass-tiles">
          {svc.items.map((it, i) => {
            const Ico = iconFor(it.title);
            return <li key={it.title} className="rv" style={{ ["--d" as string]: `${(i % 4) * 60}ms` }}><span className="tile-ico" aria-hidden="true"><Ico size={22} /></span><b>{it.title}</b></li>;
          })}
        </ul>
      </Band>

      <Band id="h-model" anchor="model" title={model.heading} eyebrow="Hotel Clinic Concept" center
        lead={<><p className="pg-sub2">{model.subheading}</p><p style={{ marginTop: 12 }}>{model.body[0]}</p></>}>
        <ul className="model-cards">
          {cards.map((c, i) => {
            const [img, pos] = MODEL_IMG[i];
            const quick = i === 1 ? "Our on-site clinics provide access to medical assessment, treatment and coordinated care within the hospitality environment" : c.body[1];
            return (
              <li key={c.id} className="rv" style={{ ["--d" as string]: `${i * 70}ms` }}>
                <DetailCard label={c.heading} trigger={
                  <span className="mcard">
                    <span className="mcard-img"><img src={asset(img)} alt="" loading="lazy" style={{ objectPosition: pos }} /><span className="mcard-n" aria-hidden="true">0{i + 1}</span></span>
                    <span className="mcard-body">
                      <span className="mcard-k">{c.subheading}</span>
                      <h3>{c.heading}</h3>
                      <p>{quick}</p>
                      <OpenMark label="Open" />
                    </span>
                  </span>
                }>
                  <DetailBody img={img} pos={pos} kicker={c.subheading ?? undefined} title={c.heading} text={c.body[0]}
                    points={c.items.map((p) => p.title)}
                    note={i === 1 ? c.body[1] : undefined} closing={i === 1 ? undefined : c.body[1]}>
                    <PartnerBtn red />
                  </DetailBody>
                </DetailCard>
              </li>
            );
          })}
        </ul>
        <p className="pg-closing rv">{model.body[1]}</p>
      </Band>

      <Band id="h-val" title={val.heading} eyebrow={val.subheading ?? undefined} lead={<p>{val.body[0]}</p>} center tint>
        <ul className="ben-grid">
          {val.items.map((it, i) => {
            const Ico = iconFor(it.title);
            return <li key={it.title} className="rv" style={{ ["--d" as string]: `${i * 60}ms` }}><span className="tile-ico" aria-hidden="true"><Ico size={22} /></span><span className="ben-n" aria-hidden="true">0{i + 1}</span><b>{it.title}</b></li>;
          })}
        </ul>
      </Band>

      <CtaPanel title={cta.heading} text={cta.body[0]}>
        <PartnerBtn />
      </CtaPanel>
    </>
  );
}

