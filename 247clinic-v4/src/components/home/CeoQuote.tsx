/* The CEO's words (spec 015 Amendment 1). Approved for the group sites 2026-10-18 and placed on the 24/7
   home by his decision 2026-11-16 (logged in content/247clinic/approved-edits.json). His real studio
   portrait, never generated. An ivory band, centred: the round portrait in a 1px red ring that draws as a
   circle on view, the quote rising word by word through the clip mask, a 40px red rule drawing, then the
   name and title. One large hairline quotation mark sits behind the first line. Reduced motion: all still. */
import { asset } from "@/data/facts";
import { Words } from "@/components/ui/Bits";

export const CEO = {
  quote: "Success isn't measured only by the number of visitors a destination attracts. It's measured by how well those visitors are cared for when they need help the most.",
  name: "Dr. Amr Abbass",
  title: "CEO, Healthcare International Group",
  portrait: "/img/ceo-amr.webp",
} as const;

export function CeoQuote() {
  return (
    <section className="section ceo" aria-labelledby="ceo-name">
      <figure className="container ceo-in" data-inview>
        <div className="ceo-face">
          <span className="ceo-pic"><img src={asset(CEO.portrait)} alt={CEO.name} width={899} height={914} loading="lazy" /></span>
          <svg className="ceo-ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <circle cx="50" cy="50" r="49.5" pathLength={1} />
          </svg>
        </div>
        <blockquote className="ceo-q">
          <span className="ceo-mark" aria-hidden="true">&ldquo;</span>
          <p className="hw"><Words text={CEO.quote} /></p>
        </blockquote>
        <span className="rule ceo-rule" aria-hidden="true" />
        <figcaption className="ceo-who">
          <b id="ceo-name">{CEO.name}</b>
          <span className="label">{CEO.title}</span>
        </figcaption>
      </figure>
    </section>
  );
}
