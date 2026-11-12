/* Hotel Clinic Concept (brief 22). Two short lists side by side: travelers, hotels. */
import { section } from "@/content/load";
import { BRIEF } from "@/content/brief";
import { BASE } from "@/data/facts";
import { LinkButton, WaButton } from "@/components/ui/Buttons";
import { Band, Checks, PageHero, pageMeta } from "@/components/page/Page";

const s = section("hotel-clinic-concept", "hotel-clinic-concept");
export const metadata = pageMeta(s.heading, s.body[0], "/hotel-clinics");

export default function HotelClinics() {
  const [opening, travelersTitle, hotelsTitle] = s.body;
  const travelers = s.items.slice(0, 6).map((it) => it.title);
  const hotels = s.items.slice(6).map((it) => it.title);
  return (
    <>
      <PageHero eyebrow="On-site care" title={s.heading} lead={[opening]} img="/img/hero-family.webp" pos="70% 50%" posM="88% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "For Hotels & Partners", path: "/for-hotels" }, { name: "Hotel Clinic Concept", path: "/hotel-clinics" }]}>
        <LinkButton href={`${BASE}/our-clinics`} placement="concept-hero" ev="find_clinic_click">{s.ctas[0].label}</LinkButton>
      </PageHero>

      <Band id="c-benefits" title="Benefits">
        <div className="pg-two">
          <Checks title={travelersTitle} items={travelers} />
          <Checks title={hotelsTitle} items={hotels} />
        </div>
        <div className="cta-row mt-cta rv">
          <WaButton placement="concept-list">{BRIEF.waUs}</WaButton>
          <LinkButton href={`${BASE}/for-hotels`} placement="concept-list">For Hotels & Partners</LinkButton>
        </div>
      </Band>
    </>
  );
}
