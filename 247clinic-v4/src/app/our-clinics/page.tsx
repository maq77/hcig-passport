/* Find a Clinic (brief 19), at the live URL /our-clinics. One explorer, not a wall of
   cards: destination chips, the clinic list (WhatsApp This Clinic, Directions, View
   Clinic) and the map; then a link to each destination page. */
import { section } from "@/content/load";
import { BRIEF } from "@/content/brief";
import { WaButton } from "@/components/ui/Buttons";
import { Band, PageHero, pageMeta } from "@/components/page/Page";
import { DestLinks, Finder } from "@/components/page/Common";

const s = section("find-a-clinic", "find-a-clinic");
export const metadata = pageMeta(s.heading, s.body[0], "/our-clinics");

export default function OurClinics() {
  return (
    <>
      <PageHero eyebrow="Find a clinic" title={s.heading} lead={s.body} img="/img/clinic-in-hotel.webp" pos="62% 18%" posM="60% 40%"
        trail={[{ name: "Home", path: "/" }, { name: "Find a Clinic", path: "/our-clinics" }]}>
        <WaButton placement="clinics-hero">{BRIEF.waUs}</WaButton>
      </PageHero>

      <section className="section finder" id="clinics" aria-label={s.heading}>
        <div className="container"><Finder /></div>
      </section>

      <Band id="dest-all" title="Destinations" tint>
        <DestLinks />
      </Band>
    </>
  );
}
