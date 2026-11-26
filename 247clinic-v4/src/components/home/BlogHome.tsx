/* Home blog section, option A from the canvas (his pick 2026-11-26, canvas RkDD9ApNssoYWFynGXCoNY): one lead story
   with its cover, date, title, red subtitle and Read More; the other four as a list with square thumbnails; "View All
   Articles" as an outlined pill beside the heading on desktop and a full-width button under the list on phones.
   Sits after Destinations, before the FAQ (his pick). Words: Irina's article titles, the brief's "Our Blog" and
   "Read More", and one interface label. */
import { ArrowRight } from "lucide-react";
import { articles } from "@/content/load";
import { THEIRS } from "@/content/brief";
import { asset, BASE } from "@/data/facts";
import { Words } from "@/components/ui/Bits";

const ALL = "View All Articles";
/* The lead story is the one the canvas showed first. */
const LEAD = "pharmacy-or-doctor-in-egypt";

export function BlogHome() {
  const list = articles();
  const lead = list.find((a) => a.slug === LEAD) ?? list[0];
  const rest = list.filter((a) => a !== lead).slice(0, 4);
  const href = (slug: string) => `${BASE}/blog/${slug}`;
  return (
    <section className="section bg-surface blog-home" aria-labelledby="blog-home-h">
      <div className="container">
        <div className="bh-head">
          <div className="bh-title">
            <span className="bh-rule rv" aria-hidden="true" />
            <h2 id="blog-home-h" className="h2 rv hw"><Words text={THEIRS.blog} /></h2>
          </div>
          <a className="bh-all bh-all-top rv" href={`${BASE}/blog`}>{ALL}<ArrowRight size={18} aria-hidden="true" /></a>
        </div>

        <div className="bh-grid">
          <a className="bh-lead rv" href={href(lead.slug)}>
            <span className="bh-lead-img"><img src={asset(lead.cover)} alt="" width={1600} height={893} loading="lazy" /></span>
            <span className="bh-lead-body">
              <time className="bh-date" dateTime={lead.date}>{lead.day} {lead.month}</time>
              <span className="bh-lead-title">{lead.title}</span>
              <span className="bh-lead-sub">{lead.subtitle}</span>
              <span className="bh-more">{THEIRS.readMore}<ArrowRight size={18} aria-hidden="true" /></span>
            </span>
          </a>

          <ul className="bh-list">
            {rest.map((a, i) => (
              <li key={a.slug} className="rv" style={{ ["--d" as string]: `${120 + i * 90}ms` }}>
                <a className="bh-row" href={href(a.slug)}>
                  <span className="bh-thumb"><img src={asset(a.cover)} alt="" width={1600} height={893} loading="lazy" /></span>
                  <span className="bh-row-body">
                    <span className="bh-row-title">{a.title}</span>
                    <span className="bh-row-sub">{a.subtitle}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <a className="bh-all bh-all-foot rv" href={`${BASE}/blog`}>{ALL}<ArrowRight size={18} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
