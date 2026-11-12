/* About Us (brief 26): short, proof points, then the group (brief: "Keep corporate group
   information below this section"). */
import { section } from "@/content/load";
import { APPROVED, BRIEF } from "@/content/brief";
import { asset } from "@/data/facts";
import { WaButton } from "@/components/ui/Buttons";
import { Band, PageHero, Split, Tiles, pageMeta } from "@/components/page/Page";

const s = section("about", "about-us");
export const metadata = pageMeta(s.heading, s.body[0], "/about-us");

export default function About() {
  const [opening, model, teams] = s.body;
  return (
    <>
      <PageHero eyebrow="About Us" title={s.heading} lead={[opening]} img="/img/hero-resort-authentic.jpg" pos="50% 62%" posM="50% 70%"
        trail={[{ name: "Home", path: "/" }, { name: "About Us", path: "/about-us" }]}>
        <WaButton placement="about-hero">{BRIEF.waUs}</WaButton>
      </PageHero>

      <Band id="ab-model">
        <Split img="/img/new-medical-care.jpg" ratio="4 / 4.4">
          <p className="pg-pull rv">{model}</p>
          <p className="lead rv">{teams}</p>
        </Split>
      </Band>

      <Band id="ab-proof" tint>
        <Tiles items={s.items} cols={3} />
      </Band>

      <Band id="ab-group" narrow>
        <div className="group-card rv">
          <img src={asset("/logos/marks/hcig.png")} alt="" width={100} height={96} loading="lazy" />
          <div>
            <p className="group-line">{APPROVED.partOf}</p>
          </div>
        </div>
      </Band>
    </>
  );
}
