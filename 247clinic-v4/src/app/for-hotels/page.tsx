/* For Hotels & Resorts (brief 24), a B2B page. */
import { section } from "@/content/load";
import { BASE } from "@/data/facts";
import { LinkButton, WaButton } from "@/components/ui/Buttons";
import { Band, Checks, CtaPanel, PageHero, Split, Tiles, pageMeta } from "@/components/page/Page";

const s = section("for-hotels", "for-hotels");
export const metadata = pageMeta(s.heading, s.body[0], "/for-hotels");

export default function ForHotels() {
  const provide = s.items.slice(0, 10);
  const benefits = s.items.slice(10).map((it) => it.title);
  const cta = s.ctas[0].label;
  return (
    <>
      <PageHero eyebrow="For Hotels & Partners" title={s.heading} lead={s.body} img="/img/hero-resort.webp" pos="62% 50%" posM="72% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "For Hotels & Partners", path: "/for-hotels" }]}>
        <WaButton placement="hotels-hero" ctx="general">{cta}</WaButton>
        <LinkButton href={`${BASE}/hotel-clinics`} placement="hotels-hero">Hotel Clinic Concept</LinkButton>
      </PageHero>

      <Band id="h-provide" title="24/7 Clinic can provide">
        <Tiles items={provide} cols={4} />
      </Band>

      <Band id="h-benefits" title="Benefits" tint>
        <Split img="/img/why-resort.webp">
          <Checks items={benefits} />
        </Split>
      </Band>

      <CtaPanel title={cta}>
        <WaButton placement="hotels-cta" ctx="general">{cta}</WaButton>
        <LinkButton href={`${BASE}/contact-us#business`} placement="hotels-cta">General & Business Enquiries</LinkButton>
      </CtaPanel>
    </>
  );
}
