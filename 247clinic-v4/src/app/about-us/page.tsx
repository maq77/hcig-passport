/* About Us (brief 26): short, proof points, then the group (brief: "Keep corporate group
   information below this section"). v6: the split hero, the model beside two offset photos,
   the proof points as numbered hairline rows, the group in one quiet line. */
import { section } from "@/content/load";
import { APPROVED, BRIEF } from "@/content/brief";
import { asset } from "@/data/facts";
import { WaButton } from "@/components/ui/Buttons";
import { Band, PageHero, Split, Tiles, pageMeta } from "@/components/page/Page";
import { More } from "@/components/ui/More";

const s = section("about", "about-us");
export const metadata = pageMeta(s.heading, s.body[0], "/about-us");

export default function About() {
  const [opening, model, teams] = s.body;
  return (
    <>
      <PageHero eyebrow="About Us" title={s.heading} line={opening} img="/img/hero-resort-authentic.jpg" pos="50% 62%" posM="50% 70%"
        trail={[{ name: "Home", path: "/" }, { name: "About Us", path: "/about-us" }]}>
        <WaButton placement="about-hero">{BRIEF.waUs}</WaButton>
      </PageHero>

      <Band id="ab-model" label={s.heading}>
        <Split img="/img/new-medical-care.jpg" img2="/img/why-resort.webp" pos="50% 38%">
          <p className="pg-pull rv">{model}</p>
          <div className="rv"><More text={teams} label={s.heading} /></div>
        </Split>
      </Band>

      <Band id="ab-proof" tint label={s.heading}>
        <Tiles items={s.items} cols={3} numbered />
      </Band>

      <Band id="ab-group" narrow label={APPROVED.partOf}>
        <div className="group-card rv">
          <img src={asset("/logos/marks/hcig.png")} alt="" width={100} height={96} loading="lazy" />
          <p className="group-line">{APPROVED.partOf}</p>
        </div>
      </Band>
    </>
  );
}
