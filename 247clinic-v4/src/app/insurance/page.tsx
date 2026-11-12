/* Insurance & Cashless Care (brief 18). Kept at the live URL /insurance. */
import { Info } from "lucide-react";
import { section } from "@/content/load";
import { BASE } from "@/data/facts";
import { LinkButton, WaButton } from "@/components/ui/Buttons";
import { Band, Checks, CtaPanel, PageHero, Split, Tiles, pageMeta } from "@/components/page/Page";
import { InsurerBand } from "@/components/page/Common";

const s = section("insurance-cashless", "insurance-cashless-care");
export const metadata = pageMeta(s.heading, s.body[0], "/insurance");

export default function Insurance() {
  const [opening, works, howTitle, how, disclaimer, coordTitle] = s.body;
  const coordinate = s.items.slice(0, 8);
  const need = s.items[8];
  const [needLead, needList] = (need.text ?? "").split(/:\s*/);
  return (
    <>
      <PageHero eyebrow="Insurance & cashless" title={s.heading} lead={[opening, works]} img="/img/hero-message.webp" pos="72% 50%" posM="92% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "Insurance & Cashless Care", path: "/insurance" }]}>
        <WaButton placement="insurance-hero" ctx="insurance">{s.ctas[0].label}</WaButton>
      </PageHero>

      <Band id="ins-how" title={howTitle} narrow>
        <div className="pg-copy rv">
          <p className="pg-pull">{how}</p>
          <p className="pg-note"><Info size={18} aria-hidden="true" /><span>{disclaimer}</span></p>
        </div>
      </Band>

      <InsurerBand />

      <Band id="ins-coord" title={coordTitle} tint>
        <Tiles items={coordinate} cols={4} />
      </Band>

      <Band id="ins-need" title={need.title}>
        <Split img="/img/why-bedside.webp" rev>
          <Checks title={`${needLead}:`} items={needList.replace(/\.\s*$/, "").split(/,\s*/)} />
          <div className="cta-row rv">
            <WaButton placement="insurance-need" ctx="insurance">{s.ctas[0].label}</WaButton>
            <LinkButton href={`${BASE}/our-clinics`} placement="insurance-need">Find a Clinic</LinkButton>
          </div>
        </Split>
      </Band>

      <CtaPanel title="Have Travel Insurance?" text="Send Your Insurance Details on WhatsApp">
        <WaButton placement="insurance-cta" ctx="insurance">{s.ctas[0].label}</WaButton>
      </CtaPanel>
    </>
  );
}
