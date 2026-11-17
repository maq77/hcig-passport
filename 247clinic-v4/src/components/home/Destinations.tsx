/* Destinations as the way in (ported from v6, spec 015 Amendment 1): the clinic map leaves the home for
   /our-clinics, and the home shows the six destinations as photo tiles, each with its name and its clinic
   count from clinics.ts, each opening its destination page. The photos are atmosphere only (sea,
   architecture, light), so their alt is empty and the name is the text. v3 keeps its own look. */
import { section } from "@/content/load";
import { asset, BASE } from "@/data/facts";
import { DESTINATIONS, clinicsIn, type DestinationId } from "@/data/clinics";
import { ROUTES } from "@/data/nav";
import { Head } from "@/components/ui/Bits";
import { TextLink } from "@/components/ui/Buttons";
import { SnapRow } from "@/components/ui/SnapRow";

export function DestTiles({ except }: { except?: DestinationId }) {
  return (
    <SnapRow className="dest-snap" gridFrom={640} label="Destinations" labels={{ prev: "Previous", next: "Next" }}>
      {DESTINATIONS.filter((d) => d.id !== except).map((d, k) => {
        const count = clinicsIn(d.id).length;
        return (
          <li key={d.id} className="rv" style={{ ["--d" as string]: `${(k % 3) * 80}ms` }}>
            <a className="dest" href={`${BASE}/${d.id}`}>
              <span className="dest-media">
                <span className="dest-pic">
                  <img src={asset(`/img/dest-${d.id}-cover-1200.webp`)} srcSet={`${asset(`/img/dest-${d.id}-cover-800.webp`)} 800w, ${asset(`/img/dest-${d.id}-cover-1200.webp`)} 1200w`} sizes="(min-width: 900px) 380px, (min-width: 640px) 46vw, 86vw" alt="" width={1200} height={960} loading="lazy" />
                </span>
              </span>
              <span className="dest-meta">
                <span className="sr-only">{d.name}</span>
                <span className="dest-n"><b>{count}</b><span>{count === 1 ? "Clinic" : "Clinics"}</span></span>
              </span>
            </a>
          </li>
        );
      })}
    </SnapRow>
  );
}

export function Destinations() {
  const s = section("home", "find-a-clinic");
  return (
    <section className="section bg-surface dests" aria-labelledby="dest-h">
      <div className="container">
        <div className="head-row">
          <Head eyebrow="Destinations" id="dest-h" title={s.heading} />
          <div className="rv head-link"><TextLink href={`${BASE}${ROUTES.clinics}`} placement="destinations">{s.ctas[0].label}</TextLink></div>
        </div>
        <DestTiles />
      </div>
    </section>
  );
}
