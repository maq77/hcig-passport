/* For Insurance & Assistance Companies (brief 25), a B2B page.
   v6: the split hero, the position as one pull line, the services as hairline rows, the insurers, one call. */
import { section } from "@/content/load";
import { BASE } from "@/data/facts";
import { LinkButton, WaButton } from "@/components/ui/Buttons";
import { Band, CtaPanel, PageHero, Tiles, pageMeta } from "@/components/page/Page";
import { InsurerBand } from "@/components/page/Common";

const s = section("for-insurers", "for-insurance-assistance-companies");
export const metadata = pageMeta(s.heading, s.body[0], "/insurance-assistance-partners");

export default function InsurancePartners() {
  const [opening, position] = s.body;
  const cta = s.ctas[0].label;
  return (
    <>
      <PageHero eyebrow="Insurance & cashless" title={s.heading} line={opening} img="/slots/svc-specialist.webp" pos="50% 50%" posM="40% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "For Hotels & Partners", path: "/for-hotels" }, { name: "For Insurance & Assistance Companies", path: "/insurance-assistance-partners" }]}>
        <LinkButton href={`${BASE}/contact-us#business`} placement="insurers-hero">{cta}</LinkButton>
      </PageHero>

      <Band id="p-services" title="Services may include">
        <p className="pg-pull rv">{position}</p>
        <div className="mt-cta"><Tiles items={s.items} cols={3} /></div>
        <InsurerBand />
      </Band>

      <CtaPanel title={cta}>
        <LinkButton href={`${BASE}/contact-us#business`} placement="insurers-cta">General & Business Enquiries</LinkButton>
        <WaButton placement="insurers-cta" ctx="general">WhatsApp Us 24/7</WaButton>
      </CtaPanel>
    </>
  );
}
