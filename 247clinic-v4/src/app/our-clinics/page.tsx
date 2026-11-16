/* Find a Clinic (brief 19), at the live URL /our-clinics. The full explorer stays here (it left the home,
   spec 015 Amendment 1): v6, the destination names are the navigation above the map, the clinic list is
   hairline rows (WhatsApp This Clinic, Directions, More details) and the map loads only near the screen.
   Then the six destinations as the home's photo tiles. */
import { section } from "@/content/load";
import { BRIEF } from "@/content/brief";
import { WaButton } from "@/components/ui/Buttons";
import { Band, PageHero, pageMeta } from "@/components/page/Page";
import { Finder } from "@/components/page/Common";
import { DestTiles } from "@/components/home/Destinations";

const s = section("find-a-clinic", "find-a-clinic");
export const metadata = pageMeta(s.heading, s.body[0], "/our-clinics");

export default function OurClinics() {
  const [line] = s.body[0].split(/(?<=\.)\s+/);
  return (
    <>
      <PageHero eyebrow="Find a clinic" title={s.heading} line={line} img="/img/hero-resort.webp" pos="60% 50%" posM="72% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "Find a Clinic", path: "/our-clinics" }]}>
        <WaButton placement="clinics-hero">{BRIEF.waUs}</WaButton>
      </PageHero>

      <section className="section finder" id="clinics" aria-label={s.heading}>
        <div className="container"><Finder /></div>
      </section>

      <Band id="dest-all" title="Destinations" tint stack>
        <DestTiles />
      </Band>
    </>
  );
}
