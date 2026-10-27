import type { Metadata } from "next";
import { POSTS } from "@/content/blog.mjs";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { PostBody, type Post } from "@/components/site/Blog";
import { ClosingBand } from "@/components/home/Lower";
import { T } from "@/content/home.mjs";

const all = POSTS as Post[];
const find = (slug: string) => all.find((p) => p.slug === slug) as Post;

export const dynamicParams = false;
export function generateStaticParams() {
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = find(slug);
  return { title: `${p.title} | HCIG`, description: p.excerpt || p.blocks[0]?.x };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = find(slug);
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: T.home, path: "/" }, { label: T.blog, path: "/blog/" }, { label: p.title, path: `/blog/${p.slug}/` }]}
          tone="cover"
          size="post"
          eyebrow={p.dateline}
          title={p.title}
          image={p.img ?? undefined}
          imageAlt={p.alt}
        />
        <PostBody slug={slug} />
        <ClosingBand />
      </main>
    </Shell>
  );
}
