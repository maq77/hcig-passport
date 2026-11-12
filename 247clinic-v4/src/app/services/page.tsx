/* Medical Services (brief 17). Urgent care first; dental and beauty kept as secondary. */
import { section } from "@/content/load";
import { BRIEF } from "@/content/brief";
import { BASE } from "@/data/facts";
import { CallButton, LinkButton, WaButton } from "@/components/ui/Buttons";
import { Band, PageHero, Tiles, pageMeta } from "@/components/page/Page";
import { ServiceList } from "@/components/page/Common";

const s = section("medical-services", "medical-services");
export const metadata = pageMeta(s.heading, s.body[0], "/services");

export default function Services() {
  const secondary = s.items.slice(6).map((it) => ({ title: it.title }));
  return (
    <>
      <PageHero eyebrow="What we treat" title={s.heading} lead={s.body} img="/slots/hero-desktop.webp" pos="64% 50%" posM="80% 40%"
        trail={[{ name: "Home", path: "/" }, { name: "Medical Services", path: "/services" }]}>
        <WaButton placement="services-hero">{BRIEF.waUs}</WaButton>
        <CallButton placement="services-hero" />
      </PageHero>

      <Band id="svc-list" title="Medical Services" eyebrow="What we treat">
        <ServiceList />
        <div className="cta-row center mt-cta rv">
          <WaButton placement="services-list">{s.ctas[0].label}</WaButton>
        </div>
      </Band>

      <Band id="svc-more" tint title="Secondary Services">
        <Tiles items={secondary} cols={2} />
        <div className="cta-row mt-cta rv">
          <LinkButton href={`${BASE}/beauty-wellness`} placement="services-secondary">Beauty & Wellness</LinkButton>
        </div>
      </Band>
    </>
  );
}
