/* Destination pages (brief 21): /hurghada, /sahl-hasheesh, /soma-bay, /marsa-alam,
   /el-quseir, /north-coast. Built from the brief's template with the destination's own
   name; the clinics, services, insurance line, FAQs and map are the brief's. */
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { section } from "@/content/load";
import { BASE } from "@/data/facts";
import { CLINICS, DESTINATIONS, type DestinationId } from "@/data/clinics";
import { CallButton, LinkButton, WaButton } from "@/components/ui/Buttons";
import { FaqList } from "@/components/home/FaqList";
import { Band, PageHero, pageMeta } from "@/components/page/Page";
import { DestLinks, Finder, ServiceList } from "@/components/page/Common";

export const dynamicParams = false;
export function generateStaticParams() {
  return DESTINATIONS.filter((d) => CLINICS.some((c) => c.destination === d.id)).map((d) => ({ destination: d.id }));
}

const tpl = section("destination-template", "destination-seo-pages");
const fill = (s: string, name: string) => s.replace(/Hurghada/g, name);
const HERO_IMG: Record<DestinationId, [string, string]> = {
  "hurghada": ["/img/hero-resort.webp", "60% 50%"],
  "sahl-hasheesh": ["/img/resort-aerial.webp", "50% 50%"],
  "soma-bay": ["/img/resort-pool.webp", "50% 55%"],
  "marsa-alam": ["/img/resort-aerial.webp", "40% 60%"],
  "el-quseir": ["/img/hero-resort-enhanced.jpg", "50% 50%"],
  "north-coast": ["/img/resort-pool.webp", "35% 55%"],
};

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
  const faq = section("faq", "faq").items;
  const pick = [0, 1, 5, 7, 8].map((i) => ({ q: faq[i].title, a: faq[i].text ?? "" }));
  const [img, pos] = HERO_IMG[d.id];
  return (
    <>
      <PageHero eyebrow="Find a clinic" title={fill(tpl.heading, d.name)} lead={[fill(tpl.body[0], d.name)]} img={img} pos={pos}
        trail={[{ name: "Home", path: "/" }, { name: "Find a Clinic", path: "/our-clinics" }, { name: d.name, path: `/${d.id}` }]}>
        <WaButton placement="destination-hero" ctx="destination" destination={d.name}>WhatsApp Us 24/7</WaButton>
        <CallButton placement="destination-hero" />
      </PageHero>

      {/* One list with its map: WhatsApp This Clinic, Directions, Show on map, View Clinic. */}
      <Band id="d-clinics" title="Hotel & Resort Clinics" eyebrow={d.name}>
        <div className="finder"><Finder list={list} /></div>
      </Band>

      <Band id="d-services" title="Medical Services">
        <ServiceList compact />
        <div className="cta-row mt-cta rv">
          <LinkButton href={`${BASE}/services`} placement="destination-services">View All Medical Services</LinkButton>
        </div>
      </Band>

      <Band id="d-insurance" title={ins.heading} tint narrow>
        <div className="pg-copy rv">
          <p className="pg-pull">{ins.body[3]}</p>
          <p className="pg-note"><Info size={18} aria-hidden="true" /><span>{ins.body[4]}</span></p>
        </div>
        <div className="cta-row mt-cta rv">
          <WaButton placement="destination-insurance" ctx="insurance">{ins.ctas[0].label}</WaButton>
        </div>
      </Band>

      <Band id="d-faq" title="Frequently Asked Questions" eyebrow="FAQ">
        <div className="pg-faq"><FaqList items={pick} /></div>
      </Band>

      <Band id="d-more" title="Destinations" tint>
        <DestLinks except={d.id} />
      </Band>
    </>
  );
}
