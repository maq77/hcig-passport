/* For Hotels & Partners, content update 2026-11-12 (his B2B brief, content only, design kept;
   approved on canvas H6dARjuHkaTeYqcUUvwYdB). The Hotel Clinic Concept is not a page: it is
   the #model section here, four cards that open into full cards.
   Partnership buttons go to the business enquiry form (his answer, not WhatsApp).
   v6 (spec 015 section 5): five bands down to four. The two advantage lists and the value list said
   the same things; they are one hairline list now, duplicates merged and nothing else cut (the trims
   are logged in content/247clinic/approved-edits.json). */
import { ArrowDown, ArrowRight } from "lucide-react";
import { section } from "@/content/load";
import { asset, BASE } from "@/data/facts";
import { More } from "@/components/ui/More";
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

/* The value list, merged into the advantage list: these four said what an advantage line already says. */
const SAME = /Stronger Safety & Premium|Greater Appeal to Families|Long-Stay Guest|No Need to Manage Healthcare/i;

export default function ForHotels() {
  const ch = section(P, "challenges");
  const adv = section(P, "advantage");
  const val = section(P, "value");
  const svc = section(P, "services");
  const model = section(P, "model");
  const cards = [1, 2, 3, 4].map((n) => section(P, `model-${n}`));
  const cta = section(P, "cta");
  const advantages = [...adv.items.map((i) => i.title), ...val.items.map((i) => i.title).filter((t) => !SAME.test(t))];
  const form = `${BASE}/contact-us#business`;
  const partner = hero.ctas[0].label;
  const PartnerBtn = ({ red }: { red?: boolean }) => (
    <a href={form} className={`btn ${red ? "btn-call" : "btn-white"}`} data-placement="for-hotels-partner">
      <span>{partner}</span><ArrowRight size={18} aria-hidden="true" />
    </a>
  );
  return (
    <>
      <PageHero eyebrow="For Hotels & Partners" title={hero.heading} line={hero.subheading}
        img="/img/hero-resort.webp" pos="62% 50%" posM="72% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "For Hotels & Partners", path: "/for-hotels" }]}>
        <PartnerBtn />
        <a href="#model" className="btn btn-secondary"><span>{hero.ctas[1].label}</span><ArrowDown size={18} aria-hidden="true" /></a>
      </PageHero>

      {/* His note 2026-11-12: the hero was "Very overcrowded"; its pull line and paragraph open the page instead. */}
      <section className="section pg-band" aria-label={hero.heading}>
        <div className="container">
          <div className="pg-lede">
            {hero.body[2] && <p className="pg-pull rv">{hero.body[2]}</p>}
            <div className="pg-copy rv" style={{ ["--d" as string]: "120ms" }}>
              <p>{hero.body[0]}</p>
              {hero.body[1] && <More text={hero.body[1]} label={hero.heading} />}
            </div>
          </div>
        </div>
      </section>

      <Band id="h-ch" title={ch.heading} tint>
        {/* One short sentence each: shown whole, no arrow. */}
        <ul className="tiles c2 has-text">
          {ch.items.map((it, i) => {
            const Ico = iconFor(it.title);
            return (
              <li key={it.title} className="tile rv" style={{ ["--d" as string]: `${(i % 2) * 70}ms` }}>
                <span className="tile-ico" aria-hidden="true"><Ico size={26} /></span>
                <div className="tile-text"><h3>{it.title}</h3><p className="tile-p">{it.text}</p></div>
              </li>
            );
          })}
        </ul>
        <p className="pg-statement rv">{ch.body[0]} <em>{ch.body[1]}</em></p>
      </Band>

      <Band id="h-adv" title={adv.heading}>
        <Checks items={advantages} />
        <p className="pg-closing rv">{adv.body[2]}</p>
      </Band>

      <Band id="h-svc" title={svc.heading} eyebrow={svc.subheading ?? undefined} dark>
        <p className="lead rv">{svc.body[0]}</p>
        <ul className="glass-tiles mt-cta">
          {svc.items.map((it, i) => {
            const Ico = iconFor(it.title);
            return <li key={it.title} className="rv" style={{ ["--d" as string]: `${(i % 2) * 60}ms` }}><span className="tile-ico" aria-hidden="true"><Ico size={24} /></span><b>{it.title}</b></li>;
          })}
        </ul>
      </Band>

      <Band id="h-model" anchor="model" title={model.heading} eyebrow="Hotel Clinic Concept" stack
        lead={<><p className="pg-sub2">{model.subheading}</p><p style={{ marginTop: 12 }}>{model.body[0]}</p></>}>
        <ul className="model-cards">
          {cards.map((c, i) => {
            const [img, pos] = MODEL_IMG[i];
            return (
              <li key={c.id} className="rv" style={{ ["--d" as string]: `${i * 70}ms` }}>
                <DetailCard label={c.heading} trigger={
                  <span className="svc">
                    <span className="svc-media">
                      <span className="svc-pic"><img src={asset(img)} alt="" loading="lazy" style={{ objectPosition: pos }} /></span>
                      <span className="svc-n num" aria-hidden="true">0{i + 1}</span>
                    </span>
                    <span className="svc-body">
                      <span className="mcard-k">{c.subheading}</span>
                      <h3>{c.heading}</h3>
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
        <p className="pg-closing center rv">{model.body[1]}</p>
      </Band>

      <CtaPanel title={cta.heading} text={cta.body[0]}>
        <PartnerBtn />
      </CtaPanel>
    </>
  );
}
