// Content and addresses for every page of TMASI v3, in every language.
// Words come from src/content/live/<lang>.json (extracted word for word from tmasi.net, see
// scripts/extract-live-content.py) plus src/content/ui.ts (the few labels v3 adds).
// Addresses follow specs/008-tmasi-website/pages-plan.md: every live address that is already clean
// stays; new pages get clean addresses in their own language.

import en from "@/content/live/en.json";
import de from "@/content/live/de.json";
import pl from "@/content/live/pl.json";
import es from "@/content/live/es.json";
import draftsJson from "@/content/live/drafts.json";
import imageSizes from "@/content/live/image-sizes.json";
import { QUOTE_THANKS, UI, type Lang, type Ui } from "@/content/ui";

export type { Lang, Ui };
export const LANGS: Lang[] = ["en", "de", "pl", "es"];

export type Live = typeof en;
const LIVE: Record<Lang, Live> = { en, de: de as unknown as Live, pl: pl as unknown as Live, es: es as unknown as Live };

export { BASE_PATH, asset } from "@/lib/asset";

export const HTML_LANG: Record<Lang, string> = { en: "en", de: "de", pl: "pl", es: "es" };
const PREFIX: Record<Lang, string> = { en: "", de: "/de", pl: "/pl", es: "/es" };

// First path segment of each section, per language: the live addresses.
const SECTION: Record<Lang, { about: string; services: string; contact: string; blog: string }> = {
  en: { about: "about", services: "services", contact: "contacts", blog: "blog" },
  de: { about: "uber-uns", services: "leistungen", contact: "kontakt", blog: "blog" },
  pl: { about: "o-nas", services: "usługi", contact: "kontakt", blog: "blog" },
  es: { about: "sobre-nosotros", services: "servicios", contact: "contacto", blog: "blog" },
};

// Offices in the order of the live contacts page: Egypt, Germany, UAE, Spain, USA.
const OFFICE_SLUGS: Record<Lang, string[]> = {
  en: ["egypt", "germany", "united-arab-emirates", "spain", "usa"],
  de: ["aegypten", "deutschland", "vereinigte-arabische-emirate", "spanien", "usa"],
  pl: ["egipt", "niemcy", "zjednoczone-emiraty-arabskie", "hiszpania", "usa"],
  es: ["egipto", "alemania", "emiratos-arabes-unidos", "espana", "estados-unidos"],
};

// The five service groups that get their own page (the sixth, Additional Services, stays on the overview).
export const GROUP_PAGES = 5;
const EN_GROUP_SLUGS = ["medical-assistance", "elite-medical-concierge", "travel-assistance", "medical-tourism", "insurance-assistance"];
// Dr. Ahmed Nouh ("dr-ahmed-nouh") removed, card and page, at Mohamed's request on 2026-09-30.
const LEADER_SLUGS = ["dr-amr-abbass"];
const EN_POST_SLUGS: Record<string, string> = {
  news1: "egypt-healthcare-authority-agreement-africa-health-excon-2025",
  news2: "uniglobal-global-insurance-conference-barcelona",
  news3: "itic-global-venice-2025-exhibitor",
  news4: "itic-global-venice-2025-on-stage",
  news5: "hansa-medica-group-partnership-grand-egyptian-museum",
  news6: "itic-global-2026-istanbul-official-sponsor",
};

const TRANSLIT: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss", ł: "l", Ł: "l", æ: "ae", ø: "o" };
export function slugify(s: string, max = 80): string {
  let t = s.replace(/[äöüßłŁæø]/g, (c) => TRANSLIT[c] ?? c);
  t = t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  t = t.replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (t.length > max) t = t.slice(0, max).replace(/-[^-]*$/, "");
  return t;
}

// ---------------------------------------------------------------------------------------------
// News posts: live posts plus the translated drafts, newest first.

// size: an image's own [width, height] (scripts/image-sizes.py), so it can be shown whole.
export type Block = { p?: string; quote?: string; h?: string; li?: string; img?: string; alt?: string; cls?: string; size?: [number, number] };
export type Post = {
  key: string; // news1..news6, the same story in every language
  slug: string;
  title: string;
  date: string; // the post page's own dateline
  cardDate: string; // the blog card's dateline
  excerpt: string;
  image: string;
  body: Block[];
  meta: { title: string; description: string };
  draft?: boolean;
};

type RawPost = { source: string; title: string; date: string; body: Block[]; meta: { title: string; description: string }; draft?: boolean };
const DRAFTS = draftsJson as unknown as Partial<Record<Lang, RawPost[]>>;
const SIZES = imageSizes as unknown as Record<string, [number, number]>;
const newsKey = (source: string) => (source.match(/news(\d)/) || [])[0] || source;

function buildPosts(lang: Lang): Post[] {
  const live = LIVE[lang];
  const raw: RawPost[] = [...((live as unknown as { posts: RawPost[] }).posts || []), ...(DRAFTS[lang] || [])];
  const cards = ((live as unknown as { blog?: { cards: { href: string; date: string; excerpt: string; image: string; title: string }[] } }).blog?.cards) || [];
  const byKey = new Map(cards.map((c) => [newsKey(c.href), c]));
  const posts = raw.map((r) => {
    const key = newsKey(r.source);
    const card = byKey.get(key);
    const firstP = r.body.find((b) => b.p)?.p || "";
    const firstImg = r.body.find((b) => b.img)?.img || "";
    return {
      key,
      slug: lang === "en" ? EN_POST_SLUGS[key] : slugify(r.title),
      title: r.title,
      date: r.date,
      cardDate: card?.date || r.date.replace(/\s[-–]\s/, " · "),
      excerpt: card?.excerpt || firstP,
      image: card?.image || firstImg,
      body: r.body.map((b) => (b.img && SIZES[b.img] ? { ...b, size: SIZES[b.img] } : b)),
      meta: r.meta,
      draft: r.draft,
    } satisfies Post;
  });
  return posts.sort((a, b) => Number(b.key.slice(4)) - Number(a.key.slice(4)));
}

const POSTS: Record<Lang, Post[]> = { en: buildPosts("en"), de: buildPosts("de"), pl: buildPosts("pl"), es: buildPosts("es") };
export const getPosts = (lang: Lang) => POSTS[lang];

// ---------------------------------------------------------------------------------------------
// Routes: every page in every language, with the same page's address in the other languages.

export type PageKey = "home" | "about" | "leader" | "services" | "group" | "contact" | "office" | "blog" | "post";
export type Route = { id: string; lang: Lang; key: PageKey; slug: string[]; path: string; ref?: number | string };

const pathOf = (lang: Lang, slug: string[]) => `${PREFIX[lang]}/${slug.length ? slug.join("/") + "/" : ""}`;

function groupSlug(lang: Lang, i: number) {
  return lang === "en" ? EN_GROUP_SLUGS[i] : slugify(LIVE[lang].services.groups[i].title);
}

function buildRoutes(): Route[] {
  const out: Route[] = [];
  for (const lang of LANGS) {
    const s = SECTION[lang];
    const add = (id: string, key: PageKey, slug: string[], ref?: number | string) =>
      out.push({ id, lang, key, slug, path: pathOf(lang, slug), ref });
    add("home", "home", []);
    add("about", "about", [s.about]);
    LEADER_SLUGS.forEach((l, i) => add(`leader:${i}`, "leader", [s.about, l], i));
    add("services", "services", [s.services]);
    for (let i = 0; i < GROUP_PAGES; i++) add(`group:${i}`, "group", [s.services, groupSlug(lang, i)], i);
    add("contact", "contact", [s.contact]);
    OFFICE_SLUGS[lang].forEach((o, i) => add(`office:${i}`, "office", [s.contact, o], i));
    if (POSTS[lang].length) {
      add("blog", "blog", [s.blog]);
      POSTS[lang].forEach((p) => add(`post:${p.key}`, "post", [s.blog, p.slug], p.key));
    }
  }
  return out;
}

export const ROUTES = buildRoutes();

export function findRoute(lang: Lang, slug: string[] = []): Route | undefined {
  const want = slug.map((x) => decodeURIComponent(x)).join("/");
  return ROUTES.find((r) => r.lang === lang && r.slug.join("/") === want);
}

/** The same page in every language that has it: { en: "/about/", de: "/de/uber-uns/", ... }. */
export function alternates(id: string): Partial<Record<Lang, string>> {
  const m: Partial<Record<Lang, string>> = {};
  for (const r of ROUTES) if (r.id === id) m[r.lang] = r.path;
  return m;
}

export const staticParams = (lang: Lang) => ROUTES.filter((r) => r.lang === lang).map((r) => ({ slug: r.slug }));

// ---------------------------------------------------------------------------------------------
// What a page's client components need: one language's words and the site's links in it.

export type Links = {
  home: string; about: string; services: string; contact: string; blog: string | null;
  groups: string[]; offices: string[]; leaders: string[]; posts: Record<string, string>;
};

function linksFor(lang: Lang): Links {
  const get = (id: string) => ROUTES.find((r) => r.lang === lang && r.id === id)?.path || "";
  const posts: Record<string, string> = {};
  for (const p of POSTS[lang]) posts[p.key] = get(`post:${p.key}`);
  return {
    home: get("home"), about: get("about"), services: get("services"), contact: get("contact"),
    blog: POSTS[lang].length ? get("blog") : null,
    groups: Array.from({ length: GROUP_PAGES }, (_, i) => get(`group:${i}`)),
    offices: OFFICE_SLUGS[lang].map((_, i) => get(`office:${i}`)),
    leaders: LEADER_SLUGS.map((_, i) => get(`leader:${i}`)),
    posts,
  };
}

export type PostCard = Omit<Post, "body">;
export type SiteContent = {
  lang: Lang;
  live: Live;
  ui: Ui;
  quoteThanks: string;
  links: Links;
  posts: PostCard[];
  alternates: Partial<Record<Lang, string>>;
};

export function getContent(lang: Lang, routeId = "home"): SiteContent {
  return {
    lang,
    live: LIVE[lang],
    ui: UI[lang],
    quoteThanks: QUOTE_THANKS[lang],
    links: linksFor(lang),
    posts: POSTS[lang].map(({ body: _body, ...card }) => card),
    alternates: alternates(routeId),
  };
}

export const LANG_NAMES: Record<Lang, string> = { en: UI.en.langName, de: UI.de.langName, pl: UI.pl.langName, es: UI.es.langName };
