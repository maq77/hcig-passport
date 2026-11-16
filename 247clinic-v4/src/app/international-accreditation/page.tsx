/* International Accreditation (brief 23). UCA only, as he named it; no other claim.
   v6: the split hero, then the film with the UCA plate and the standards as numbered hairline rows. */
import { section } from "@/content/load";
import { asset, BASE } from "@/data/facts";
import { LinkButton } from "@/components/ui/Buttons";
import { InViewVideo } from "@/components/ui/Motion";
import { BigPlay } from "@/components/ui/Viewer";
import { Band, PageHero, Tiles, pageMeta } from "@/components/page/Page";

const s = section("accreditation", "international-accreditation");
export const metadata = pageMeta(s.heading, s.body[0], "/international-accreditation");

export default function Accreditation() {
  const cta = s.ctas[0].label;
  return (
    <>
      <PageHero eyebrow="Accreditation" title={s.heading} line={s.body[0]} img="/img/hero-resort-enhanced.jpg" pos="50% 40%" posM="70% 40%"
        trail={[{ name: "Home", path: "/" }, { name: "International Accreditation", path: "/international-accreditation" }]}>
        <LinkButton href={`${BASE}/our-clinics`} placement="accreditation-hero" ev="find_clinic_click">{cta}</LinkButton>
      </PageHero>

      <Band id="a-standards" title="Urgent Care Association" eyebrow="Accreditation">
        <div className="pg-stage rv">
          <InViewVideo src={asset("/media/hero.mp4")} />
          <BigPlay src="/media/commercial.mp4" label="Watch video" />
          <div className="uca-plate">
            <span className="uca-logo"><img src={asset("/logos/marks/uca.png")} alt="" width={48} height={48} /></span>
            <span className="uca-text"><small>Accreditation</small><b>Urgent Care Association</b></span>
          </div>
        </div>
        <div className="mt-cta"><Tiles items={s.items} cols={2} numbered /></div>
        <div className="cta-row mt-cta rv">
          <LinkButton href={`${BASE}/our-clinics`} placement="accreditation-list" ev="find_clinic_click">{cta}</LinkButton>
        </div>
      </Band>
    </>
  );
}
