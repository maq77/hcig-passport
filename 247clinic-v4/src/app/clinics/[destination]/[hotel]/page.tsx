/* Hotel clinic pages (brief 20): /clinics/{destination}/{hotel}-clinic, one per clinic.
   The brief's template with the hotel's own name; each part it lists (services,
   insurance, doctor availability, room visits, hospital care, map, WhatsApp) uses the
   brief's own lines for that subject. */
import { notFound } from "next/navigation";
import { BedDouble, Clock, Hospital, Info, MapPin, Navigation } from "lucide-react";
import { section } from "@/content/load";
import { BASE, PHONE } from "@/data/facts";
import { CLINICS, clinicPath, slugify } from "@/data/clinics";
import { CallButton, LinkButton, WaButton } from "@/components/ui/Buttons";
import { Band, CtaPanel, PageHero, pageMeta } from "@/components/page/Page";
import { destName, dirHref, ServiceList } from "@/components/page/Common";

export const dynamicParams = false;
export function generateStaticParams() {
  return CLINICS.map((c) => ({ destination: c.destination, hotel: `${slugify(c.hotel)}-clinic` }));
}

const tpl = section("hotel-clinic-template", "hotel-clinic-template");
const fill = (s: string, hotel: string, dest: string) => s.replace(/\[Hotel Name\]/g, hotel).replace(/\[Destination\]/g, dest);

type P = { params: Promise<{ destination: string; hotel: string }> };
const find = (p: { destination: string; hotel: string }) => CLINICS.find((c) => c.destination === p.destination && `${slugify(c.hotel)}-clinic` === p.hotel);

export async function generateMetadata({ params }: P) {
  const c = find(await params);
  if (!c) return {};
  return pageMeta(fill(tpl.heading, c.hotel, ""), fill(tpl.body[0], c.hotel, destName(c.destination)), clinicPath(c));
}

export default async function HotelClinic({ params }: P) {
  const c = find(await params);
  if (!c) notFound();
  const dest = destName(c.destination);
  const ins = section("insurance-cashless", "insurance-cashless-care");
  const faq = section("faq", "faq").items;
  const contact = section("contact", "contact");
  const [svcT, insT, docT, roomT, hospT, mapT] = tpl.items.map((it) => it.title);
  const [ctaQ, ctaBtn] = tpl.ctas[0].label.split(/\?\s*/);
  const facts = [
    { Ico: Clock, title: docT, text: contact.subheading ?? "" },
    { Ico: BedDouble, title: roomT, text: faq[5].text ?? "" },
    { Ico: Hospital, title: hospT, text: faq[8].text ?? "" },
  ];
  const nearby = CLINICS.filter((x) => x.destination === c.destination && x.hotel !== c.hotel);
  const mapSrc = c.coord === "placeholder"
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${c.hotel} ${dest} Egypt`)}&z=13&output=embed`
    : `https://www.google.com/maps?q=${c.lat},${c.lng}&z=15&output=embed`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: `24/7 Clinic, ${c.hotel}`,
    telephone: PHONE.tel,
    medicalSpecialty: "Urgent care",
    address: { "@type": "PostalAddress", addressLocality: dest, addressCountry: "EG" },
    ...(c.coord === "placeholder" ? {} : { geo: { "@type": "GeoCoordinates", latitude: c.lat, longitude: c.lng } }),
    url: `https://www.247clinic.net${clinicPath(c)}`,
  };
  return (
    <>
      <PageHero eyebrow={dest} title={fill(tpl.heading, c.hotel, dest)} lead={tpl.body.map((b) => fill(b, c.hotel, dest))} img="/slots/hero-desktop.webp" pos="64% 50%" posM="80% 40%"
        trail={[{ name: "Home", path: "/" }, { name: "Find a Clinic", path: "/our-clinics" }, { name: dest, path: `/${c.destination}` }, { name: c.hotel, path: clinicPath(c) }]}>
        <WaButton placement="hotel-hero" ctx="hotel" hotel={c.hotel}>{ctaBtn}</WaButton>
        <CallButton placement="hotel-hero" />
      </PageHero>

      <Band id="hc-services" title={svcT}>
        <ServiceList compact />
        <div className="cta-row mt-cta rv">
          <LinkButton href={`${BASE}/services`} placement="hotel-services">View All Medical Services</LinkButton>
        </div>
      </Band>

      <Band id="hc-facts" tint>
        <ul className="tiles c3 has-text">
          {facts.map(({ Ico, title, text }) => (
            <li key={title} className="tile rv">
              <span className="tile-ico" aria-hidden="true"><Ico size={22} /></span>
              <div className="tile-text"><h3>{title}</h3><p className="tile-p">{text}</p></div>
            </li>
          ))}
        </ul>
      </Band>

      <Band id="hc-insurance" title={insT} narrow>
        <div className="pg-copy rv">
          <p className="pg-pull">{ins.body[3]}</p>
          <p className="pg-note"><Info size={18} aria-hidden="true" /><span>{ins.body[4]}</span></p>
        </div>
        <div className="cta-row mt-cta rv">
          <WaButton placement="hotel-insurance" ctx="insurance">{ins.ctas[0].label}</WaButton>
        </div>
      </Band>

      <Band id="hc-map" title={mapT} tint>
        <div className="pg-map rv">
          <iframe src={mapSrc} title={c.hotel} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <div className="cta-row mt-cta rv">
          <a className="btn btn-secondary" href={dirHref(c)} target="_blank" rel="noopener" data-ev="clinic_directions_click" data-placement="hotel-map">
            <Navigation size={18} aria-hidden="true" /><span>Directions</span>
          </a>
        </div>
      </Band>

      {nearby.length > 0 && (
        <Band id="hc-nearby" title={dest} eyebrow="Hotel & Resort Clinics">
          <div className="dest-links">
            {nearby.map((x) => <a key={x.hotel} href={`${BASE}${clinicPath(x)}`}><MapPin size={16} aria-hidden="true" />{x.hotel}</a>)}
          </div>
        </Band>
      )}

      <CtaPanel title={`${fill(ctaQ, c.hotel, dest)}?`}>
        <WaButton placement="hotel-cta" ctx="hotel" hotel={c.hotel}>{ctaBtn}</WaButton>
        <CallButton placement="hotel-cta" />
      </CtaPanel>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
