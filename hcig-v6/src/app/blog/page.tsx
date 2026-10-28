import type { Metadata } from "next";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { BlogIndex } from "@/components/site/Blog";
import { postCards } from "@/lib/posts";
import { ClosingBand } from "@/components/home/Lower";
import { T } from "@/content/home.mjs";

// the live blog's title, kept
export const metadata: Metadata = { title: { absolute: T.blogMeta }, description: T.blogDesc };

export default function BlogPage() {
  return (
    <Shell>
      <main id="main">
        <PageHero crumbs={[{ label: T.home, path: "/" }, { label: T.blog, path: "/blog/" }]} title={T.blog} />
        <BlogIndex posts={postCards()} />
        <ClosingBand />
      </main>
    </Shell>
  );
}
