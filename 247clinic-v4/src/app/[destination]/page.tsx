/* Destination pages (brief 21): /hurghada, /sahl-hasheesh, /soma-bay, /marsa-alam,
   /el-quseir, /north-coast. Built from the brief's template with the destination's own
   name; the clinics, services, insurance line, FAQs and map are the brief's.
   v6 (spec 015 section 5): the hero on the destination's own graded photo; then its clinics with the map,
   the services as one numbered list, one guest's words, the insurance line, the FAQs, and the other five
   destinations as the home's tiles. */
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { section, reviews } from "@/content/load";
import { BASE } from "@/data/facts";
import { CLINICS, DESTINATIONS } from "@/data/clinics";
import { FLAGS } from "@/data/media";
import { CallButton, LinkButton, WaButton } from "@/components/ui/Buttons";
import { FaqList } from "@/components/home/FaqList";
import { GuestWords } from "@/components/home/GuestWords";
import { DestTiles } from "@/components/home/Destinations";
import { Band, PageHero, pageMeta } from "@/components/page/Page";
import { Finder, ServiceList } from "@/components/page/Common";

export const dynamicParams = false;
export function generateStaticParams() {
  return DESTINATIONS.filter((d) => CLINICS.some((c) => c.destination === d.id)).map((d) => ({ destination: d.id }));
}

const tpl = section("destination-template", "destination-seo-pages");
const fill = (s: string, name: string) => s.replace(/Hurghada/g, name);

type P = { params: Promise<{ destination: string }> };
const find = (id: string) => DESTINATIONS.find((d) => d.id === id);

export async function generateMetadata({ params }: P) {
  const d = find((await params).destination);
  if (!d) return {};
  return pageMeta(fill(tpl.heading, d.name), fill(tpl.body[0], d.name), `/${d.id}`);
}

export default async function Destination({ params }: P) {
  const d = find((await params).destination);
  if (!d) notFound();
  const list = CLINICS.filter((c) => c.destination === d.id);
  const ins = section("insurance-cashless", "insurance-cashless-care");
  const stories = section("home", "reviews-testimonials");
  const faq = section("faq", "faq").items;
  const pick = [0, 1, 5, 7, 8].map((i) => ({ q: faq[i].title, a: faq[i].text ?? "" }));
  const [line, rest] = fill(tpl.body[0], d.name).split(/(?<=\?)\s+/);
  return (
    <>
      <PageHero eyebrow={d.name} title={fill(tpl.heading, d.name)} line={line} img={`/img/dest-${d.id}-1200.webp`} pos="50% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "Find a Clinic", path: "/our-clinics" }, { name: d.name, path: `/${d.id}` }]}>
        <WaButton placement="destination-hero" ctx="destination" destination={d.name}>WhatsApp Us 24/7</WaButton>
        <CallButton placement="destination-hero" />
      </PageHero>

      {/* One list with its map: WhatsApp This Clinic, Directions, Show on map, More details. */}
      <Band id="d-clinics" title="Hotel & Resort Clinics" eyebrow={d.name} lead={rest ? <p>{rest}</p> : undefined} stack>
        <div className="finder"><Finder list={list} /></div>
      </Band>

      <Band id="d-services" title="Medical Services" tint>
        <ServiceList compact />
        <div className="cta-row mt-cta rv">
          <LinkButton href={`${BASE}/services`} placement="destination-services">View All Medical Services</LinkButton>
        </div>
      </Band>

      <Band id="d-guests" title={stories.heading} eyebrow="Patient stories">
        <GuestWords reviews={reviews()} flags={FLAGS} base={BASE} labels={{ prev: "Previous", next: "Next" }} labelledBy="d-guests" compact />
      </Band>

      <Band id="d-insurance" title={ins.heading} tint>
        <div className="pg-copy rv">
          <p className="pg-pull">{ins.body[3]}</p>
          <p className="pg-note"><Info size={18} aria-hidden="true" /><span>{ins.body[4]}</span></p>
        </div>
        <div className="cta-row mt-cta rv">
          <WaButton placement="destination-insurance" ctx="insurance">{ins.ctas[0].label}</WaButton>
        </div>
      </Band>

      <Band id="d-faq" title="Frequently Asked Questions" eyebrow="FAQ">
        <FaqList items={pick} />
      </Band>

      <Band id="d-more" title="Destinations" tint stack>
        <DestTiles except={d.id} />
      </Band>
    </>
  );
}
