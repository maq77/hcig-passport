/* Their blog. Irina's five articles (2026-11-25) open on this site; the two posts of their old site follow,
   linked to their live articles. */
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
          <ArticleCards items={list} withOld feature />
        </div>
      </section>
    </>
  );
}
