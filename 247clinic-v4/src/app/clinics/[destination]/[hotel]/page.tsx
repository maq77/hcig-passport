/* Hotel clinic pages (brief 20): /clinics/{destination}/{hotel}-clinic, one per clinic.
   The brief's template with the hotel's own name; each part it lists (services,
   insurance, doctor availability, room visits, hospital care, map, WhatsApp) uses the
   brief's own lines for that subject.
   v6 (spec 015 section 5): a type-led hero on the destination's photo (never a picture of the named hotel).
   On desktop the sections run beside a sticky contact rail (WhatsApp This Clinic, call, Directions);
   on phones the same three actions sit in the hero. */
import { notFound } from "next/navigation";
import { BedDouble, Clock, Hospital, Info, Navigation } from "lucide-react";
import { section } from "@/content/load";
import { BASE, PHONE } from "@/data/facts";
import { CLINICS, clinicPath, slugify, type Clinic } from "@/data/clinics";
import { CallButton, LinkButton, WaButton } from "@/components/ui/Buttons";
import { Words } from "@/components/ui/Bits";
import { CtaPanel, PageHero, pageMeta } from "@/components/page/Page";
import { ClinicCards, destName, dirHref, ServiceList } from "@/components/page/Common";

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

/* A section of the main column: its heading, then its words. */
function Sec({ id, title, eyebrow, children }: { id: string; title?: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <section className="hc-sec" aria-labelledby={title ? id : undefined}>
      {title && (
        <div className="head">
          {eyebrow && <span className="eyebrow rv">{eyebrow}</span>}
          <h2 id={id} className="h2 rv hw"><Words text={title} /></h2>
        </div>
      )}
      {children}
    </section>
  );
}

/* WhatsApp This Clinic, call and Directions: in the hero on phones, in the rail on desktop. */
function Actions({ c, where, wa }: { c: Clinic; where: string; wa: string }) {
  return (
    <>
      <WaButton placement={where} ctx="hotel" hotel={c.hotel}>{wa}</WaButton>
      <CallButton placement={where} />
      <a className="btn btn-secondary" href={dirHref(c)} target="_blank" rel="noopener" data-ev="clinic_directions_click" data-placement={where}>
        <Navigation size={18} aria-hidden="true" /><span>Directions</span>
      </a>
    </>
  );
}

export default async function HotelClinic({ params }: P) {
  const c = find(await params);
  if (!c) notFound();
  const dest = destName(c.destination);
  const ins = section("insurance-cashless", "insurance-cashless-care");
  const faq = section("faq", "faq").items;
  const contact = section("contact", "contact");
  const waClinic = section("find-a-clinic", "find-a-clinic").ctas[0].label;
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
      <PageHero eyebrow={dest} title={fill(tpl.heading, c.hotel, dest)} line={fill(tpl.body[0], c.hotel, dest)} typeLed whole
        img={`/img/dest-${c.destination}-1200.webp`} pos="50% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "Find a Clinic", path: "/our-clinics" }, { name: dest, path: `/${c.destination}` }, { name: c.hotel, path: clinicPath(c) }]}>
        <Actions c={c} where="hotel-hero" wa={waClinic} />
      </PageHero>

      <div className="container hc-layout">
        <div className="hc-main">
          <Sec id="hc-services" title={svcT}>
            <p className="lead rv" style={{ marginBottom: 24 }}>{fill(tpl.body[1], c.hotel, dest)}</p>
            <ServiceList compact />
            <div className="cta-row mt-cta rv">
              <LinkButton href={`${BASE}/services`} placement="hotel-services">View All Medical Services</LinkButton>
            </div>
          </Sec>

          <Sec id="hc-facts">
            <ul className="tiles rows has-text">
              {facts.map(({ Ico, title, text }) => (
                <li key={title} className="tile rv">
                  <span className="tile-ico" aria-hidden="true"><Ico size={26} /></span>
                  <div className="tile-text"><h3>{title}</h3><p className="tile-p">{text}</p></div>
                </li>
              ))}
            </ul>
          </Sec>

          <Sec id="hc-insurance" title={insT}>
            <div className="pg-copy rv">
              <p className="pg-pull">{ins.body[3]}</p>
              <p className="pg-note"><Info size={18} aria-hidden="true" /><span>{ins.body[4]}</span></p>
            </div>
            <div className="cta-row mt-cta rv">
              <WaButton placement="hotel-insurance" ctx="insurance">{ins.ctas[0].label}</WaButton>
            </div>
          </Sec>

          <Sec id="hc-map" title={mapT}>
            <div className="pg-map rv">
              <iframe src={mapSrc} title={c.hotel} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </Sec>

          {nearby.length > 0 && (
            <Sec id="hc-nearby" title={dest} eyebrow="Hotel & Resort Clinics">
              <ClinicCards list={nearby} />
            </Sec>
          )}
        </div>

        <aside className="hc-rail" aria-label={c.hotel}>
          <div className="hc-rail-in">
            <span className="hc-rail-k">{dest}</span>
            <p className="hc-rail-h">{`${fill(ctaQ, c.hotel, dest)}?`}</p>
            <Actions c={c} where="hotel-rail" wa={waClinic} />
          </div>
        </aside>
      </div>

      <CtaPanel title={`${fill(ctaQ, c.hotel, dest)}?`}>
        <WaButton placement="hotel-cta" ctx="hotel" hotel={c.hotel}>{ctaBtn}</WaButton>
        <CallButton placement="hotel-cta" />
      </CtaPanel>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
