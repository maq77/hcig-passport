/* Their blog: Irina's five articles (2026-11-25). The two 2023 posts of the old site are not carried over (his pick
   2026-11-26); their old addresses 301 to /blog (deploy/web.config). */
import { THEIRS } from "@/content/brief";
import { articles } from "@/content/load";
import { ArticleCards } from "@/components/page/ArticleCards";
import { PageHero, pageMeta } from "@/components/page/Page";

export const metadata = pageMeta(THEIRS.blog, THEIRS.about, "/blog");

export default function Blog() {
  const list = articles();
  return (
    <>
      <PageHero title={THEIRS.blog} img={list[0]?.cover ?? "/img/post-red-sea.webp"} pos="50% 40%"
        trail={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
      <section className="section bg-surface" aria-label={THEIRS.blog}>
        <div className="container">
          <ArticleCards items={list} feature />
        </div>
      </section>
    </>
  );
}
