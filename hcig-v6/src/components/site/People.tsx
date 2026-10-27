"use client";
// Leadership: black and white studio portraits as one set; the CEO card carries his quote. On the About page a short
// row of the board links to the full Leadership page.
import { CEO } from "@/content/home.mjs";
import { ABOUT_PAGE, LEADERSHIP } from "@/content/pages.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";

type Person = { name: string; roles: string[]; img?: string; quote?: boolean };
const initials = (n: string) => n.replace(/^(Dr\.|Mr\.)\s*/, "").split(" ").map((w) => w[0]).slice(0, 2).join("");

function Portrait({ p }: { p: Person }) {
  return (
    <figure className="pp-photo">
      {p.img ? <img src={asset(p.img)} alt={p.name} loading="lazy" /> : <span className="pp-mono" aria-hidden="true">{initials(p.name)}</span>}
    </figure>
  );
}

export function LeadershipGrid() {
  const people = LEADERSHIP.people as Person[];
  const ceo = people.find((p) => p.quote) as Person;
  const rest = people.filter((p) => !p.quote);
  return (
    <section className="sec lead-sec" aria-label={LEADERSHIP.title}>
      <div className="wrap">
        <Reveal className="pp-feature">
          <Portrait p={ceo} />
          <figure className="pp-quote">
            <span className="pp-q" aria-hidden="true"><Icon name="quote" size={40} /></span>
            <blockquote><p>{CEO.quote}</p></blockquote>
            <figcaption><b>{ceo.name}</b>{ceo.roles.map((r) => <span key={r}>{r}</span>)}</figcaption>
          </figure>
        </Reveal>
        <Stagger className="pp-grid" gap={0.08}>
          {rest.map((p) => (
            <Item as="article" className="pp-card" key={p.name}>
              <Portrait p={p} />
              <div className="pp-meta"><h3>{p.name}</h3>{p.roles.map((r) => <p key={r}>{r}</p>)}</div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/** The board on the About page, as the live About page shows it: Chairman, CEO, Board Member. */
export function BoardTeaser() {
  const people = (LEADERSHIP.people as Person[]).filter((p) => ["Dr. Mostafa Elshakankery", "Dr. Amr Abbass", "Mr. Mohsen Mohamed"].includes(p.name));
  return (
    <section className="sec board-sec band-soft" aria-labelledby="board-h">
      <div className="wrap">
        <SectionHead id="board-h" title={ABOUT_PAGE.boardTitle} />
        <Stagger className="pp-grid pp-three" gap={0.1}>
          {people.map((p) => (
            <Item as="article" className="pp-card" key={p.name}>
              <a className="pp-link" href={href("/about/leadership/")} aria-label={`${p.name}, ${p.roles.join(", ")}`}>
                <Portrait p={p} />
                <div className="pp-meta"><h3>{p.name}</h3>{p.roles.map((r) => <p key={r}>{r}</p>)}</div>
                <span className="pp-go" aria-hidden="true"><Icon name="arrow" size={16} /></span>
              </a>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
