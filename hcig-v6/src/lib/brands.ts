// Brand page helpers, shared by server routes and client components (no "use client" here).
import { GROUP } from "@/content/home.mjs";
import { BRANDS } from "@/content/brands.mjs";

export type Brand = (typeof BRANDS)[number] & {
  img?: string; alt?: string; notice?: string; post?: number; medpark?: boolean;
  places?: { name: string; addr: string }[]; founder?: { name: string; role: string; img: string };
};
export type GroupBrand = { short: string; name: string; line: string; url: string; logo: string };
export type Point = { t: string; x?: string; items?: string[] };
export type Line = { title: string; img: string; path: string };
export type Who = { title: string; path: string };
export type Post = { n: number; slug: string; title: string; dateline: string; img: string | null };

export const brandBySlug = (slug: string) => (BRANDS as Brand[]).find((b) => b.slug === slug) as Brand;
export const groupOf = (b: Brand) => (GROUP.brands as GroupBrand[]).find((g) => g.short === b.key) as GroupBrand;
export const brandPath = (b: { slug: string }) => `/group/${b.slug}/`;

