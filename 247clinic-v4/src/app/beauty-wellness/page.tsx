/* Beauty & Wellness (brief 29: keep the page, out of the main menu, never competing
   with urgent care). The brief gives it no words, so the treatments are their own, quoted
   exactly from www.247clinic.net/beauty-wellness (content/247clinic/en/beauty-treatments.json). */
import fs from "node:fs";
import path from "node:path";
import { BRIEF } from "@/content/brief";
import { BASE } from "@/data/facts";
import { LinkButton, WaButton } from "@/components/ui/Buttons";
import { Band, PageHero, Tiles, pageMeta } from "@/components/page/Page";

type Treat = { title: string; text: string; indications: string[] };
const data = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "..", "content", "247clinic", "en", "beauty-treatments.json"), "utf8")) as { items: Treat[] };
export const metadata = pageMeta("Beauty & Wellness", data.items[0].text, "/beauty-wellness");

export default function Beauty() {
  return (
    <>
      <PageHero eyebrow="Secondary Services" title="Beauty & Wellness" img="/img/hero-02-faces.jpg" pos="50% 50%" posM="55% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "Medical Services", path: "/services" }, { name: "Beauty & Wellness", path: "/beauty-wellness" }]}>
        <WaButton placement="beauty-hero">{BRIEF.waUs}</WaButton>
      </PageHero>
      <Band id="b-list">
        <Tiles items={data.items.map((t) => ({ title: t.title, text: t.text }))} cols={3} />
        <div className="cta-row mt-cta rv">
          <LinkButton href={`${BASE}/services`} placement="beauty-list">Medical Services</LinkButton>
        </div>
      </Band>
    </>
  );
}
