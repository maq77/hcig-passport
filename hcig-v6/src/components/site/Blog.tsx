"use client";
// Blog: the newest post as a feature, the rest as a grid; each post as an editorial article with its photo, the
// dateline, the text word for word, and three more posts. NewsArticle schema on every post.
import { POSTS } from "@/content/blog.mjs";
import { UI, T } from "@/content/home.mjs";
import { asset, href, SITE, abs, absAsset } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import { Rail } from "@/components/ui/Rail";

export type Post = { n: number; slug: string; title: string; dateline: string; img: string | null; alt: string; excerpt: string; blocks: { t: string; x: string }[] };
const all = POSTS as Post[];
export const postPath = (p: Post) => `/blog/${p.slug}/`;

// His pick C1 (2026-10-27): portrait editorial. An open 4:5 photo with rounded corners (the newest posts are portrait
// photos, so nothing is cut), the place and a Helma title under it, no box. "row" is the small version beside a post.
function Card({ p, row = false }: { p: Post; row?: boolean }) {
  return (
    <a className={`pc${row ? " pc-row" : ""}`} href={href(postPath(p))}>
      <figure className="pc-im">{p.img ? <img src={asset(p.img)} alt={p.alt} loading="lazy" /> : null}</figure>
      <div className="pc-body">
        <p className="pc-place"><Icon name="pin" size={13} />{p.dateline}</p>
        <h3>{p.title}</h3>
        {row ? null : <span className="pc-read">{UI.readMore.text}<Icon name="arrow" size={14} /></span>}
      </div>
    </a>
  );
}

export function BlogIndex() {
  return (
    <section className="sec blog-sec" aria-label={T.blog}>
      <div className="wrap">
        <Stagger className="pc-grid" gap={0.06}>
          {all.map((p) => <Item as="article" key={p.n}><Card p={p} /></Item>)}
        </Stagger>
      </div>
    </section>
  );
}

export function PostBody({ slug }: { slug: string }) {
  const p = all.find((x) => x.slug === slug) as Post;
  const more = all.filter((x) => x !== p).slice(0, 3);
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: p.title,
    image: p.img ? [absAsset(p.img)] : undefined,
    dateline: p.dateline,
    publisher: { "@type": "Organization", name: "Healthcare International Group", url: SITE + "/" },
    mainEntityOfPage: abs(postPath(p)),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="sec post-sec" aria-label={p.title}>
        <div className="wrap post-grid">
          <article className="post">
            <div className="post-text">
              {p.blocks.map((b, i) =>
                b.t === "h" ? <h2 key={i} className="post-h">{b.x}</h2>
                : b.t === "li" ? <p key={i} className="post-li"><span className="mv-check" aria-hidden="true"><Icon name="check" size={13} /></span>{b.x}</p>
                : <p key={i} className={i === 0 ? "post-lead" : undefined}>{i === 0 ? <><b>{p.dateline}.</b> {b.x}</> : b.x}</p>,
              )}
            </div>
            <a className="post-back" href={href("/blog/")}><Icon name="arrow" size={16} className="flip-x" />{T.blog}</a>
          </article>
          <aside className="post-aside" aria-label={T.blog}>
            {more.map((m) => <Card key={m.n} p={m} row />)}
          </aside>
        </div>
      </section>
    </>
  );
}

export function MoreNews({ title, cta }: { title: string; cta?: string }) {
  return (
    <section className="sec blog-more band-soft" aria-labelledby="bm-h">
      <div className="wrap">
        <SectionHead id="bm-h" title={title} />
        <Rail className="pc-grid news-grid" label={title} auto={4500} gap={0.08}>
          {all.slice(0, 3).map((p) => <Item as="article" key={p.n}><Card p={p} /></Item>)}
        </Rail>
        {cta ? <Reveal className="care-more"><a className="btn2 care-more-btn" href={href("/blog/")}>{cta}<Icon name="arrow" /></a></Reveal> : null}
      </div>
    </section>
  );
}
