import type { Metadata } from "next";
import { POSTS } from "@/content/blog.mjs";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { BlogIndex } from "@/components/site/Blog";
import { ClosingBand } from "@/components/home/Lower";

// the live blog's title, kept
export const metadata: Metadata = { title: { absolute: "HCIG Blog | Insights on Medical Tourism & Wellness in Egypt" }, description: (POSTS as { excerpt: string }[])[0].excerpt };

export default function BlogPage() {
  return (
    <Shell>
      <main id="main">
        <PageHero crumbs={[{ label: "Home", path: "/" }, { label: "Blog", path: "/blog/" }]} title="Blog" />
        <BlogIndex />
        <ClosingBand />
      </main>
    </Shell>
  );
}
