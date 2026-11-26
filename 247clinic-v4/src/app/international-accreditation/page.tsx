/* International Accreditation (brief 23). UCA only, as he named it; no other claim. */
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
      <PageHero eyebrow="Accreditation" title={s.heading} lead={s.body} img="/img/team-resort.webp" pos="62% 60%" posM="74% 62%"
        trail={[{ name: "Home", path: "/" }, { name: "International Accreditation", path: "/international-accreditation" }]}>
        <LinkButton href={`${BASE}/our-clinics`} placement="accreditation-hero" ev="find_clinic_click">{cta}</LinkButton>
      </PageHero>

      <Band id="a-standards" title="Urgent Care Association" eyebrow="Accreditation">
        <div className="pg-split">
          <div className="pg-stage rv">
            <InViewVideo src={asset("/media/hero.mp4")} />
            <BigPlay src="/media/commercial.mp4" label="Watch video" />
            <div className="uca-badge">
              <span className="uca-logo"><img src={asset("/logos/marks/uca.png")} alt="" width={48} height={48} /></span>
              <span className="uca-text"><small>Accreditation</small><b>Urgent Care Association</b></span>
            </div>
          </div>
          <div className="pg-split-copy">
            <Tiles items={s.items} cols={2} />
          </div>
        </div>
        <div className="cta-row mt-cta rv">
          <LinkButton href={`${BASE}/our-clinics`} placement="accreditation-list" ev="find_clinic_click">{cta}</LinkButton>
        </div>
      </Band>
    </>
  );
}
