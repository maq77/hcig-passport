// The blog for server pages. Cards get only what a card shows (no article text), so the long posts never travel to the
// browser as JavaScript (the home used to carry all fifteen articles, about 120 KB, to show three cards).
import { POSTS } from "@/content/blog.mjs";
import type { Post } from "@/components/site/Blog";

export type PostCard = Omit<Post, "blocks">;
const all = POSTS as Post[];
export const postCards = (n?: number): PostCard[] => all.slice(0, n ?? all.length).map(({ blocks: _b, ...c }) => c);
export const postBySlug = (slug: string) => all.find((p) => p.slug === slug) as Post;
export const moreCards = (slug: string, n = 3): PostCard[] => postCards().filter((p) => p.slug !== slug).slice(0, n);
