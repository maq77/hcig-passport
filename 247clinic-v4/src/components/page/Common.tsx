/* Blocks several inner pages share. Words from the brief's content files only. */
import { ArrowUpRight, MapPin, Navigation } from "lucide-react";
import { section } from "@/content/load";
import { BRIEF, THEIRS } from "@/content/brief";
import { asset, BASE } from "@/data/facts";
import { CLINICS, DESTINATIONS, clinicPath, type Clinic, type DestinationId } from "@/data/clinics";
import { INSURERS } from "@/data/media";
import { waHref } from "@/lib/wa";
import { WhatsAppGlyph } from "@/components/ui/Icon";
import { Marquee } from "@/components/ui/Marquee";
import { ClinicFinder } from "@/components/home/ClinicFinder";
import { iconFor } from "./Page";
import { DetailCard } from "@/components/ui/DetailCard";
import { DetailBody, OpenMark } from "./Detail";
import { WaButton } from "@/components/ui/Buttons";

/* The WhatsApp button inside an opened service card. */
function WaLink() { return <WaButton placement="service-card">{BRIEF.waUs}</WaButton>; }

/* By title, so a new or reordered service keeps its own photo. */
const SVC_IMG: [RegExp, string][] = [[/urgent/i, "svc-urgent"], [/injur/i, "svc-injuries"], [/diagnos/i, "svc-diagnostics"], [/prescription|delivery/i, "svc-delivery"], [/iv |wellness|aesthetic|medication/i, "svc-iv"], [/specialist/i, "svc-specialist"], [/room/i, "svc-room-visit"]];
const imgFor = (t: string) => SVC_IMG.find(([re]) => re.test(t))?.[1] ?? "svc-urgent";

/* The six medical services of brief 17, each with its photo. A list of conditions
   becomes small chips (easy to scan); a sentence stays a sentence. */
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

export function ServiceList({ compact }: { compact?: boolean }) {
  const s = section("medical-services", "medical-services");
  /* The medical services; Dental Care and Beauty & Wellness stay secondary (brief 17, 29). */
  const main = s.items.filter((it) => !/dental|beauty/i.test(it.title));
  if (!compact) {
    /* Services page: photo, title and a short line; the card opens into all its points. */
    return (
      <ul className="svc-rows">
        {main.map((it, i) => {
          const Ico = iconFor(it.title);
          const det = serviceDetail(it.title);
          return (
            <li key={it.title} className={`svc-cell rv ${i === 0 ? "svc-wide-first" : ""} ${i === main.length - 1 ? "svc-wide-last" : ""}`} style={{ ["--d" as string]: `${(i % 2) * 80}ms` }}>
              <DetailCard label={it.title} trigger={
                <span className="svc-row svc-row-open">
                  <span className="svc-row-img"><img src={asset(det.img)} alt="" width={1200} height={800} loading="lazy" /></span>
                  <span className="svc-row-body">
                    <span className="svc-row-head"><span className="tile-ico" aria-hidden="true"><Ico size={20} /></span><h3>{it.title}</h3></span>
                    <span className="svc-row-quick">{det.quick}</span>
                    <OpenMark label="Open" />
                  </span>
                </span>
              }>
                <DetailBody img={det.img} kicker="What we treat" title={it.title} text={det.text ?? det.quick} points={det.points}>
                  <WaLink />
                </DetailBody>
              </DetailCard>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <ul className={`svc-rows ${compact ? "compact" : ""}`}>
      {main.map((it, i) => {
        const Ico = iconFor(it.title);
        const list = it.text && !/\.$/.test(it.text.trim()) ? it.text.split(/,\s*/) : null;
        return (
          <li key={it.title} className={`svc-row rv ${i === 0 ? "svc-wide-first" : ""} ${i === main.length - 1 ? "svc-wide-last" : ""}`} style={{ ["--d" as string]: `${(i % 2) * 80}ms` }}>
            <span className="svc-row-img"><img src={asset(`/slots/${imgFor(it.title)}.webp`)} alt="" width={1200} height={800} loading="lazy" /></span>
            <div className="svc-row-body">
              <div className="svc-row-head">
                <span className="tile-ico" aria-hidden="true"><Ico size={20} /></span>
                <h3>{it.title}</h3>
              </div>
              {!compact && (list
                ? <ul className="svc-chips">{list.map((x) => <li key={x}>{x}</li>)}</ul>
                : <p>{it.text}</p>)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export const destName = (id: DestinationId) => DESTINATIONS.find((d) => d.id === id)?.name ?? "";
export const dirHref = (c: Clinic) =>
  c.coord === "placeholder"
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.hotel} ${destName(c.destination)} Egypt`)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;

/* Clinic cards: hotel, destination, WhatsApp This Clinic, Directions, View Clinic (brief 19). */
export function ClinicCards({ list }: { list: Clinic[] }) {
  const f = section("find-a-clinic", "find-a-clinic");
  const [waLabel, viewLabel] = [f.ctas[0].label, f.ctas[1].label];
  return (
    <ul className="clinic-cards">
      {list.map((c, i) => (
        <li key={c.hotel} className="rv" style={{ ["--d" as string]: `${(i % 3) * 60}ms` }}>
          <article className="clinic-card">
            <div className="clinic-card-top">
              <span className="tile-ico" aria-hidden="true"><MapPin size={20} /></span>
              <div>
                <h3><a href={`${BASE}${clinicPath(c)}`}>{c.hotel}</a></h3>
                <span className="dest">{destName(c.destination)}</span>
              </div>
            </div>
            <div className="cl-actions">
              <a className="cl-wa" href={waHref("hotel", { hotel: c.hotel })} target="_blank" rel="noopener" data-ev="whatsapp_medical_click" data-placement="clinic-card">
                <WhatsAppGlyph size={16} /><span>{waLabel}</span>
              </a>
              <a className="cl-sec" href={dirHref(c)} target="_blank" rel="noopener" data-ev="clinic_directions_click" data-placement="clinic-card">
                <Navigation size={15} aria-hidden="true" /><span>Directions</span>
              </a>
              <a className="cl-more" href={`${BASE}${clinicPath(c)}`}><span>{viewLabel}</span><ArrowUpRight size={15} aria-hidden="true" /></a>
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
      labels={{ all: THEIRS.all, waClinic: f.ctas[0].label, directions: "Directions", clinics: BRIEF.hotelClinics, mapLabel: home.heading, showOnMap: "Show on map", moreDetails: f.ctas[1].label }}
    />
  );
}

/* Destination links with their clinic counts. */
export function DestLinks({ except }: { except?: DestinationId }) {
  return (
    <div className="dest-links">
      {DESTINATIONS.filter((d) => d.id !== except).map((d) => (
        <a key={d.id} href={`${BASE}/${d.id}`}>
          <MapPin size={16} aria-hidden="true" />{d.name}<span className="n">{CLINICS.filter((c) => c.destination === d.id).length}</span>
        </a>
      ))}
    </div>
  );
}

/* The insurer logos, as on the home. */
export function InsurerBand() {
  const half = Math.ceil(INSURERS.length / 2);
  return (
    <div className="band rv">
      <span className="band-label">{BRIEF.insurancePartners}</span>
      <Marquee label={BRIEF.insurancePartners}>
        {INSURERS.slice(0, half).map((l) => <li key={l.name} className="logo-tile"><img src={asset(l.src)} alt={l.name} width={l.w} height={l.h} loading="lazy" /></li>)}
      </Marquee>
      <Marquee label={BRIEF.insurancePartners} direction="right">
        {INSURERS.slice(half).map((l) => <li key={l.name} className="logo-tile"><img src={asset(l.src)} alt={l.name} width={l.w} height={l.h} loading="lazy" /></li>)}
      </Marquee>
    </div>
  );
}
