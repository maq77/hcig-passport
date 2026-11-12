/* Their blog (brief 30: not a priority). The two published posts, linked to their live
   articles, so the footer link never lands on a missing page. */
import { THEIRS } from "@/content/brief";
import { Posts } from "@/components/home/Sections";
import { PageHero, pageMeta } from "@/components/page/Page";

export const metadata = pageMeta(THEIRS.blog, THEIRS.about, "/blog");

export default function Blog() {
  return (
    <>
      <PageHero title={THEIRS.blog} img="/img/post-red-sea.webp" pos="50% 40%"
        trail={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
      <Posts noHead />
    </>
  );
}
