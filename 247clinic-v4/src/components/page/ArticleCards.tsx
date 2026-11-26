/* The blog's article cards (the site's .post card: cover, date plate, title, Read More). Irina's articles open
   on this site; the two older posts of their old site stay as outside links after them. */
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Article } from "@/content/load";
import { THEIRS } from "@/content/brief";
import { asset, BASE } from "@/data/facts";
import { POSTS } from "@/data/media";
import { SnapRow } from "@/components/ui/SnapRow";

type Card = { href: string; out: boolean; img: string; day: string; month: string; title: string; sub?: string };

export function ArticleCards({ items, withOld, feature }: { items: Article[]; withOld?: boolean; feature?: boolean }) {
  const cards: Card[] = [
    ...items.map((a) => ({ href: `${BASE}/blog/${a.slug}`, out: false, img: a.cover, day: a.day, month: a.month, title: a.title, sub: a.subtitle })),
    ...(withOld ? POSTS.map((p) => ({ href: p.href, out: true, img: p.img, day: p.day, month: p.month, title: p.title })) : []),
  ];
  return (
    <SnapRow className={`posts-row article-cards ${feature ? "feature-first" : ""}`} gridFrom={768} label={THEIRS.blog} labels={{ prev: "Previous", next: "Next" }}>
      {cards.map((c, i) => (
        <li key={c.href} className="rv" style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
          <a className="post card" href={c.href} {...(c.out ? { target: "_blank", rel: "noopener" } : {})}>
            <span className="post-img"><img src={asset(c.img)} alt="" width={1600} height={893} loading="lazy" /></span>
            <span className="post-date"><b>{c.day}</b><span>{c.month}</span></span>
            <span className="post-body">
              <h3>{c.title}</h3>
              {c.sub && <span className="post-sub">{c.sub}</span>}
              <span className="link"><span>{THEIRS.readMore}</span>{c.out ? <ArrowUpRight size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}</span>
            </span>
          </a>
        </li>
      ))}
    </SnapRow>
  );
}
