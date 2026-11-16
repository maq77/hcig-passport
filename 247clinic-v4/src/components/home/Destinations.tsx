/* Destinations as the way in (spec 015 Amendment 1, the Bvlgari pattern): the clinic map leaves the home
   for /our-clinics, and the home shows the six destinations as photo tiles, each with its name and its
   clinic count from clinics.ts, each opening its destination page. The photos are atmosphere only (sea,
   architecture, light), so their alt is empty and the name is the text. */
import { section } from "@/content/load";
import { asset, BASE } from "@/data/facts";
import { DESTINATIONS, clinicsIn } from "@/data/clinics";
import { ROUTES } from "@/data/nav";
import { Head } from "@/components/ui/Bits";
import { TextLink } from "@/components/ui/Buttons";

export function Destinations() {
  const s = section("home", "find-a-clinic");
  return (
    <section className="section bg-surface dests" aria-labelledby="dest-h">
      <div className="container">
        <div className="head-row">
          <Head eyebrow="Destinations" id="dest-h" title={s.heading} />
          <div className="rv head-link"><TextLink href={`${BASE}${ROUTES.clinics}`} placement="destinations">{s.ctas[0].label}</TextLink></div>
        </div>
        <ul className="dest-grid">
          {DESTINATIONS.map((d, k) => {
            const count = clinicsIn(d.id).length;
            return (
              <li key={d.id} className="rv" style={{ ["--d" as string]: `${(k % 3) * 80}ms` }}>
                <a className="dest" href={`${BASE}/${d.id}`}>
                  <span className="dest-media">
                    <span className="dest-pic">
                      <img src={asset(`/img/dest-${d.id}-1200.webp`)} alt="" width={1200} height={805} loading="lazy" />
                    </span>
                  </span>
                  <span className="dest-meta">
                    <span className="dest-name">{d.name}</span>
                    <span className="dest-n"><b className="num">{count}</b><span>{count === 1 ? "Clinic" : "Clinics"}</span></span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
