"use client";
// Blog: the newest post as a feature, the rest as a grid; each post as an editorial article with its photo, the
// dateline, the text word for word, and three more posts. NewsArticle schema on every post.
import { POSTS } from "@/content/blog.mjs";
import { SITE_URL } from "@/content/pages.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";

export type Post = { n: number; slug: string; title: string; dateline: string; img: string | null; alt: string; excerpt: string; blocks: { t: string; x: string }[] };
const all = POSTS as Post[];
export const postPath = (p: Post) => `/blog/${p.slug}/`;
const firstLine = (p: Post) => p.excerpt || (p.blocks.find((b) => b.t === "p")?.x ?? "");

function Card({ p, big = false }: { p: Post; big?: boolean }) {
  return (
    <a className={`bc${big ? " bc-big" : ""}`} href={href(postPath(p))}>
      <figure className="bc-im">{p.img ? <img src={asset(p.img)} alt={p.alt} loading="lazy" /> : null}</figure>
      <div className="bc-body">
        <p className="bc-place"><Icon name="pin" size={14} />{p.dateline}</p>
        <h3>{p.title}</h3>
        {big ? <p className="bc-ex">{firstLine(p)}</p> : null}
        <span className="bc-go" aria-hidden="true"><Icon name="arrow" size={16} /></span>
      </div>
    </a>
  );
}

export function BlogIndex() {
  const [first, ...rest] = all;
  return (
    <section className="sec blog-sec" aria-label="Blog">
      <div className="wrap">
        <Reveal className="bc-feature"><Card p={first} big /></Reveal>
        <Stagger className="bc-grid" gap={0.06}>
          {rest.map((p) => <Item as="article" key={p.n}><Card p={p} /></Item>)}
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
    image: p.img ? [SITE_URL + asset(p.img).replace(/^\/hcig\/v6/, "")] : undefined,
    dateline: p.dateline,
    publisher: { "@type": "Organization", name: "Healthcare International Group", url: SITE_URL },
    mainEntityOfPage: SITE_URL + postPath(p),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="sec post-sec" aria-label={p.title}>
        <div className="wrap post-grid">
          <article className="post">
            {p.img ? <Reveal className="post-im"><img src={asset(p.img)} alt={p.alt} /></Reveal> : null}
            <div className="post-text">
              {p.blocks.map((b, i) =>
                b.t === "h" ? <h2 key={i} className="post-h">{b.x}</h2>
                : b.t === "li" ? <p key={i} className="post-li"><span className="mv-check" aria-hidden="true"><Icon name="check" size={13} /></span>{b.x}</p>
                : <p key={i} className={i === 0 ? "post-lead" : undefined}>{i === 0 ? <><b>{p.dateline}.</b> {b.x}</> : b.x}</p>,
              )}
            </div>
            <a className="post-back" href={href("/blog/")}><Icon name="arrow" size={16} className="flip-x" />Blog</a>
          </article>
          <aside className="post-aside" aria-label="Blog">
            {more.map((m) => <Card key={m.n} p={m} />)}
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
        <Stagger className="bc-grid news-grid" gap={0.08}>
          {all.slice(0, 3).map((p, i) => <Item as="article" key={p.n} className={i === 0 ? "news-lead" : undefined}><Card p={p} big={i === 0} /></Item>)}
        </Stagger>
        {cta ? <Reveal className="care-more"><a className="btn2 care-more-btn" href={href("/blog/")}>{cta}<Icon name="arrow" /></a></Reveal> : null}
      </div>
    </section>
  );
}
