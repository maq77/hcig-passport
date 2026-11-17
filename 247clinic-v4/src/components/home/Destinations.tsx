/* Destinations as the way in (spec 015 Amendment 1, the Bvlgari pattern): the clinic map leaves the home
   for /our-clinics, and the home shows the six destinations as photo tiles, each with its name and its
   clinic count from clinics.ts, each opening its destination page. The photos are atmosphere only (sea,
   architecture, light), so their alt is empty and the name is the text. The tiles are shared: each
   destination page shows the other five, and /our-clinics shows all six. */
import { section } from "@/content/load";
import { asset, BASE } from "@/data/facts";
import { DESTINATIONS, clinicsIn, type DestinationId } from "@/data/clinics";
import { ROUTES } from "@/data/nav";
import { Head } from "@/components/ui/Bits";
import { TextLink } from "@/components/ui/Buttons";

/* One order everywhere (the owner's pick): Marsa Alam, Hurghada, Sahl Hasheesh, Soma Bay, El Quseir, North Coast.
   Desktop is a 12-column bento (6/3/3 then 3/3/6); phone and tablet a plain 2-column grid, no carousel. */
const ORDER: DestinationId[] = ["marsa-alam", "hurghada", "sahl-hasheesh", "soma-bay", "el-quseir", "north-coast"];
const SPAN: Record<DestinationId, number> = { "marsa-alam": 6, hurghada: 3, "sahl-hasheesh": 3, "soma-bay": 3, "el-quseir": 3, "north-coast": 6 };

export function DestTiles({ except }: { except?: DestinationId }) {
  const list = ORDER.filter((id) => id !== except).map((id) => DESTINATIONS.find((d) => d.id === id)!);
  return (
    <ul className={`dest-grid${except ? " five" : ""}`} aria-label="Destinations">
      {list.map((d, k) => {
        const count = clinicsIn(d.id).length;
        return (
          <li key={d.id} className={`rv${except ? "" : ` dest-s${SPAN[d.id]}`}`} style={{ ["--d" as string]: `${(k % 3) * 80}ms` }}>
            <a className="dest" href={`${BASE}/${d.id}`}>
              <span className="dest-media">
                <span className="dest-pic">
                  <img src={asset(`/img/dest-${d.id}-cover-1200.webp`)} srcSet={`${asset(`/img/dest-${d.id}-cover-800.webp`)} 800w, ${asset(`/img/dest-${d.id}-cover-1200.webp`)} 1200w`} sizes="(min-width: 900px) 40vw, 50vw" alt="" width={1200} height={960} loading="lazy" />
                </span>
              </span>
              <span className="dest-cap">
                <span className="dest-name">{d.name}</span>
                <span className="dest-ct">
                  <span className="dest-n"><b className="num">{count}</b><span>{count === 1 ? "Clinic" : "Clinics"}</span></span>
                  <span className="dest-go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
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
