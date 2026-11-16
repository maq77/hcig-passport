/* Blocks several inner pages share. Words from the brief's content files only. */
import { ArrowUpRight, Check, Navigation, Plus } from "lucide-react";
import { section } from "@/content/load";
import { BRIEF, THEIRS } from "@/content/brief";
import { asset, BASE } from "@/data/facts";
import { CLINICS, DESTINATIONS, clinicPath, type Clinic, type DestinationId } from "@/data/clinics";
import { INSURERS } from "@/data/media";
import { waHref } from "@/lib/wa";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { Marquee } from "@/components/ui/Marquee";
import { ClinicFinder } from "@/components/home/ClinicFinder";
import { DetailCard } from "@/components/ui/DetailCard";
import { DetailBody, OpenMark } from "./Detail";
import { WaButton } from "@/components/ui/Buttons";

/* The WhatsApp button inside an opened service card. */
function WaLink() { return <WaButton placement="service-card">{BRIEF.waUs}</WaButton>; }

/* By title, so a new or reordered service keeps its own photo. */
const SVC_IMG: [RegExp, string][] = [[/urgent/i, "svc-urgent"], [/injur/i, "svc-injuries"], [/diagnos/i, "svc-diagnostics"], [/prescription|delivery/i, "svc-delivery"], [/iv |wellness|aesthetic|medication/i, "svc-iv"], [/specialist/i, "svc-specialist"], [/room/i, "svc-room-visit"]];
const imgFor = (t: string) => SVC_IMG.find(([re]) => re.test(t))?.[1] ?? "svc-urgent";

/* The home card's short line for a service (already approved words), and the full points
   from the Services page; used by the opening cards (the user, 2026-11-12). */
const HOME_KEY: [RegExp, RegExp][] = [[/urgent/i, /urgent/i], [/injur/i, /injur/i], [/diagnos/i, /diagnos/i], [/prescription/i, /prescription/i], [/iv |wellness/i, /iv therapy/i], [/specialist/i, /specialist/i], [/room/i, /room/i]];
export function serviceDetail(title: string) {
  const svc = section("medical-services", "medical-services").items;
  const home = section("home", "medical-services").items;
  const k = HOME_KEY.find(([a]) => a.test(title));
  const h = k ? home.find((x) => k[1].test(x.title)) : undefined;
  const s = k ? svc.find((x) => k[0].test(x.title)) : undefined;
  const isList = (t?: string | null) => !!t && !/\.$/.test(t.trim());
  const quick = h?.text ? (isList(h.text) ? h.text.split(/,\s*/).slice(0, 2).join(", ") : h.text) : s?.text ?? "";
  const points = s?.text && isList(s.text) ? s.text.split(/,\s*/) : [];
  const text = s?.text && !isList(s.text) ? s.text : (h?.text && !isList(h.text) ? h.text : null);
  return { quick, points, text, img: `/slots/${imgFor(title)}.webp` };
}

/* The medical services; Dental Care and Beauty & Wellness stay secondary (brief 17, 29).
   v6: the Services page speaks the home's language (photo cards with a Calisto numeral in the corner,
   2 x 3 on phones, three columns on desktop, IV Therapy as the solid ink panel 07). Every card opens into
   all its points. `compact` (destination and hotel pages) is one numbered hairline list: the title and its
   short line, each row opening the same card. */
export function ServiceList({ compact }: { compact?: boolean }) {
  const s = section("medical-services", "medical-services");
  const main = s.items.filter((it) => !/dental|beauty/i.test(it.title));
  const card = (it: { title: string }, trigger: React.ReactNode) => {
    const det = serviceDetail(it.title);
    return (
      <DetailCard label={it.title} trigger={trigger}>
        <DetailBody img={det.img} kicker="What we treat" title={it.title} text={det.text ?? det.quick} points={det.points}>
          <WaLink />
        </DetailBody>
      </DetailCard>
    );
  };
  if (compact) {
    return (
      <ol className="svc-lines">
        {main.map((it, i) => (
          <li key={it.title} className="rv" style={{ ["--d" as string]: `${(i % 2) * 70}ms` }}>
            {card(it, (
              <span className="svc-line">
                <span className="svc-line-n num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="svc-line-t"><h3>{it.title}</h3><span>{serviceDetail(it.title).quick}</span></span>
                <span className="svc-line-o" aria-hidden="true"><Plus size={16} /></span>
              </span>
            ))}
          </li>
        ))}
      </ol>
    );
  }
  /* IV Therapy, Wellness & Aesthetic closes the list as the ink panel, as on the home. */
  const feature = main.find((it) => /iv /i.test(it.title));
  const six = main.filter((it) => it !== feature);
  return (
    <>
      <ul className="svc-grid">
        {six.map((it, i) => {
          const det = serviceDetail(it.title);
          return (
            <li key={it.title} className="rv" style={{ ["--d" as string]: `${(i % 3) * 70}ms` }}>
              {card(it, (
                <span className="svc">
                  <span className="svc-media">
                    <span className="svc-pic"><img src={asset(det.img)} alt="" width={1200} height={800} loading="lazy" /></span>
                    <span className="svc-n num" aria-hidden="true">0{i + 1}</span>
                  </span>
                  <span className="svc-body">
                    <h3>{it.title}</h3>
                    <span className="svc-quick">{det.quick}</span>
                    <OpenMark label="Open" />
                  </span>
                </span>
              ))}
            </li>
          );
        })}
      </ul>
      {feature && (
        <article className="svc-feature rv" aria-labelledby="svc-feature-h">
          <div className="svc-feature-copy">
            <span className="svc-feature-n num" aria-hidden="true">07</span>
            <h3 id="svc-feature-h">{feature.title}</h3>
            <ul className="svc-feature-list">
              {serviceDetail(feature.title).points.map((x) => (
                <li key={x}><Check size={16} aria-hidden="true" /><span>{x}</span></li>
              ))}
            </ul>
            <div><WaLink /></div>
          </div>
          <span className="svc-feature-media"><img className="svc-feature-img" src={asset("/slots/svc-iv.webp")} alt={feature.title} width={1200} height={800} loading="lazy" /></span>
        </article>
      )}
    </>
  );
}

export const destName = (id: DestinationId) => DESTINATIONS.find((d) => d.id === id)?.name ?? "";
export const dirHref = (c: Clinic) =>
  c.coord === "placeholder"
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.hotel} ${destName(c.destination)} Egypt`)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;

/* Clinic cards (brief 19), v6: hairline rows, the hotel name in Cormorant 24px, the destination in label
   type, then WhatsApp This Clinic, Directions and More details. No boxes. */
export function ClinicCards({ list }: { list: Clinic[] }) {
  const f = section("find-a-clinic", "find-a-clinic");
  const waLabel = f.ctas[0].label;
  return (
    <ul className="clinic-cards">
      {list.map((c, i) => (
        <li key={c.hotel} className="rv" style={{ ["--d" as string]: `${(i % 3) * 60}ms` }}>
          <article className="clinic-card">
            <div>
              <span className="label dest">{destName(c.destination)}</span>
              <h3><a href={`${BASE}${clinicPath(c)}`}>{c.hotel}</a></h3>
            </div>
            <div className="cl-actions">
              <a className="cl-wa" href={waHref("hotel", { hotel: c.hotel })} target="_blank" rel="noopener" data-ev="whatsapp_medical_click" data-placement="clinic-card">
                <WhatsAppGlyph size={16} /><span>{waLabel}</span>
              </a>
              <a className="cl-sec" href={dirHref(c)} target="_blank" rel="noopener" data-ev="clinic_directions_click" data-placement="clinic-card">
                <Navigation size={15} aria-hidden="true" /><span>Directions</span>
              </a>
              <a className="cl-more" href={`${BASE}${clinicPath(c)}`}><span>More details</span><ArrowUpRight size={15} aria-hidden="true" /></a>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

/* The map explorer from the home, for any list of clinics. */
export function Finder({ list = CLINICS }: { list?: Clinic[] }) {
  const f = section("find-a-clinic", "find-a-clinic");
  const home = section("home", "find-a-clinic");
  return (
    <ClinicFinder
      base={BASE}
      clinics={list.map((c) => ({ hotel: c.hotel, destination: c.destination, lat: c.lat, lng: c.lng, mappable: c.coord !== "placeholder", href: clinicPath(c) }))}
      labels={{ all: THEIRS.all, waClinic: f.ctas[0].label, directions: "Directions", clinics: BRIEF.hotelClinics, mapLabel: home.heading, showOnMap: "Show on map", moreDetails: "More details" }}
    />
  );
}

/* The insurer logos, as on the home. */
export function InsurerBand() {
  return (
    <div className="band ins2-band rv">
      <span className="band-label">{BRIEF.insurancePartners}</span>
      <Marquee label={BRIEF.insurancePartners} speed={18}>
        {INSURERS.map((l) => <li key={l.name} className="logo-tile"><img src={asset(l.src)} alt={l.name} width={l.w} height={l.h} loading="lazy" /></li>)}
      </Marquee>
    </div>
  );
}
