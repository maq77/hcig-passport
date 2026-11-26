/* One article (Irina's five, 2026-11-25; his ask 2026-11-26: "add these articles and generate images for them").
   Words come from content/247clinic/en/blog-articles.json exactly. The title before the colon is the h1, the
   part after it the red line under it. "## " blocks are her bold sub-headings; **...** sentences are bold.
   The page ends with the other articles; the footer's help band carries the call to action. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, type Article } from "@/content/load";
import { THEIRS } from "@/content/brief";
import { asset } from "@/data/facts";
import { PageHero, pageMeta } from "@/components/page/Page";
import { ArticleCards } from "@/components/page/ArticleCards";

export const dynamicParams = false;
export function generateStaticParams() {
  return articles().map((a) => ({ slug: a.slug }));
}

type P = { params: Promise<{ slug: string }> };
const find = (slug: string) => articles().find((a) => a.slug === slug);

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const a = find((await params).slug);
  if (!a) return {};
  const base = pageMeta(a.title, a.metaDescription, `/blog/${a.slug}`);
  /* Her SEO title is the whole title tag (no second brand suffix). */
  return { ...base, title: { absolute: a.seoTitle }, openGraph: { ...base.openGraph, title: a.seoTitle, type: "article", images: [{ url: asset(`/img/blog/og/${a.slug}.jpg`), width: 1200, height: 630 }] } };
}

/* "**bold** rest" -> nodes */
function Inline({ text }: { text: string }) {
  const parts = text.split("**");
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</>;
}

function Body({ a }: { a: Article }) {
  return (
    <div className="article-body">
      {a.blocks.map((b, i) =>
        b.startsWith("## ")
          ? <h2 key={i} className="rv">{b.slice(3)}</h2>
          : <p key={i} className={`rv ${b.startsWith("**") && b.endsWith("**") ? "is-key" : ""}`}><Inline text={b} /></p>,
      )}
    </div>
  );
}

export default async function ArticlePage({ params }: P) {
  const a = find((await params).slug);
  if (!a) notFound();
  const others = articles().filter((x) => x.slug !== a.slug);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: `${a.title} ${a.subtitle}`,
    description: a.metaDescription,
    datePublished: a.date,
    dateModified: a.date,
    mainEntityOfPage: `https://www.247clinic.net/blog/${a.slug}`,
    author: { "@type": "Organization", "@id": "https://www.247clinic.net/#org", name: "24/7 Clinic", url: "https://www.247clinic.net" },
    publisher: { "@id": "https://www.247clinic.net/#org" },
    image: `https://www.247clinic.net/img/blog/og/${a.slug}.jpg`,
    inLanguage: "en",
  };
  return (
    <>
      <PageHero eyebrow={THEIRS.blog} title={a.title} sub={a.subtitle} img={a.cover} pos="50% 50%"
        trail={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: a.title, path: `/blog/${a.slug}` }]}>
        <time className="article-date" dateTime={a.date}>{a.day} {a.month}</time>
      </PageHero>
      <section className="section article-wrap" aria-label={a.title}>
        <div className="container">
          <article>
            <Body a={a} />
          </article>
        </div>
      </section>
      <section className="section bg-surface" aria-labelledby="more-h">
        <div className="container">
          <div className="head"><h2 id="more-h" className="h2 rv">{THEIRS.blog}</h2></div>
          <ArticleCards items={others} />
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
