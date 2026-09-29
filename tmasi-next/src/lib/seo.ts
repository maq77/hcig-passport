// Search and answer-engine signals for every v3 page: title, description, canonical, hreflang,
// Open Graph, robots and one JSON-LD graph. Every word comes from the live site through site.ts.
// Where a live page carries a title or description in another language, or another page's, the
// page's own heading and first lines stand in. Nothing here writes new copy.

import type { Metadata } from "next";
import { alternates, BASE_PATH, getContent, getPosts, LANGS, ROUTES, type Lang, type Route } from "./site";

/** The site's real address. Canonicals, hreflang, Open Graph and the sitemap all point here. */
export const SITE_URL = (process.env.SITE_URL || "https://tmasi.net").replace(/\/+$/, "");
/** The HCIG Work preview sits under a base path and must never be indexed. At go-live the base path
 *  is empty and the same pages become indexable with nothing else to change. */
export const IS_PREVIEW = BASE_PATH !== "";

const BRAND = "TMASI Global";
const OG_IMAGE = { path: "/img/og-image.jpg", width: 1200, height: 630 }; // the live site's own
const LOGO = "/img/logo.PNG"; // the logo the live site's schema names
const OG_LOCALE: Record<Lang, string> = { en: "en_US", de: "de_DE", pl: "pl_PL", es: "es_ES" };
const OFFICE_COUNTRY = ["EG", "DE", "AE", "ES", "US"]; // offices in live order: Egypt, Germany, UAE, Spain, USA
// The profiles the live footer links to (SocialLinks.tsx), as clean profile addresses.
const SAME_AS = [
  "https://www.facebook.com/profile.php?id=61573860486176",
  "https://www.instagram.com/tmasi_global/",
  "https://www.linkedin.com/company/tmasi-gmbh/",
];

export const abs = (path: string) => SITE_URL + encodeURI(path);
const fixSpelling = (t: string) => t.replace(/^Uber uns$/, "Über uns");
const stripFlag = (t: string) => t.replace(/^[\u{1F1E6}-\u{1F1FF}]{2}\s*/u, "");
const brand = (t: string) => `${t} | ${BRAND}`;
const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** Cuts text to a search snippet at a word boundary. */
function clamp(text: string, max = 158) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.·|-]+$/, "") + "…";
}

type Meta = { title: string; description: string };
const liveOf = (lang: Lang) => getContent(lang).live;
const sectionMeta = (lang: Lang, key: string): Meta | undefined =>
  (liveOf(lang).meta as Record<string, Meta>)[key];

/** True when a live meta text is a copy of the English (or, for Polish and Spanish, the German) one:
 *  the live site left those pages' meta untranslated. */
function copied(lang: Lang, value: string | undefined, of: (l: Lang) => string | undefined) {
  if (!value || lang === "en") return false;
  const from: Lang[] = lang === "de" ? ["en"] : ["en", "de"];
  return from.some((l) => of(l) === value);
}

// ---------------------------------------------------------------------------------------------
// Title, description and share image per page.

export type PageSeo = { title: string; description: string; image?: string; article?: boolean };

export function pageSeo(route: Route): PageSeo {
  const { lang } = route;
  const { live, ui } = getContent(lang, route.id);
  const n = Number(route.ref);
  const nav = live.shell.nav.map(fixSpelling);

  switch (route.key) {
    case "home": case "about": case "services": case "contact": case "blog": {
      const key = route.key;
      const meta = sectionMeta(lang, key);
      const posts = getPosts(lang);
      const own: Record<typeof key, Meta> = {
        home: { title: brand(live.home.hero.title.map((s) => s.t).join("")), description: live.home.hero.text },
        about: { title: brand(live.about.heading), description: live.about.lines.join(" ") },
        services: {
          title: brand(live.services.heading),
          description: `${live.services.sub} ${live.services.groups.map((g) => g.title).join(", ")}.`,
        },
        contact: { title: brand(nav[3] || ""), description: live.contact.offices.map((o) => o.lines[0]).join(" · ") },
        blog: {
          title: brand((live as { blog?: { heading: string } }).blog?.heading || ui.latestNews),
          description: posts.slice(0, 3).map((p) => p.title).join(" · "),
        },
      };
      const titleCopied = copied(lang, meta?.title, (l) => sectionMeta(l, key)?.title);
      const descCopied = copied(lang, meta?.description, (l) => sectionMeta(l, key)?.description);
      return {
        title: meta?.title && !titleCopied ? meta.title : own[key].title,
        description: clamp(meta?.description && !descCopied ? meta.description : own[key].description),
      };
    }
    case "leader": {
      const l = live.leaders[n];
      const role = live.about.board?.members?.[n]?.role;
      const isCopy = copied(lang, l.meta.title, (x) => liveOf(x).leaders[n]?.meta.title);
      return {
        title: isCopy ? brand(role ? `${l.name}, ${role}` : l.name) : l.meta.title,
        description: clamp(isCopy ? l.paragraphs[0] : l.meta.description),
        image: l.image,
      };
    }
    case "group": {
      const g = live.services.groups[n];
      return { title: brand(g.title), description: clamp(g.items.map((i) => ("title" in i && i.title) || i.text).join(", ")) };
    }
    case "office": {
      const o = live.contact.offices[n];
      return { title: brand(stripFlag(o.name)), description: clamp(o.lines.join(" · ")) };
    }
    case "post": {
      const p = getPosts(lang).find((x) => x.key === route.ref)!;
      // A post's meta title must open like its own headline. Otherwise it belongs to another page or
      // another language (on the live site: news 1 carries the About title, the Spanish posts English).
      const matches = norm(p.meta.title).slice(0, 24) === norm(p.title).slice(0, 24);
      const firstP = p.body.find((b) => b.p)?.p || p.excerpt;
      return {
        title: matches ? p.meta.title : p.title,
        description: clamp(matches && p.meta.description ? p.meta.description : firstP),
        image: p.image,
        article: true,
      };
    }
  }
}

// ---------------------------------------------------------------------------------------------
// <head>: title, description, canonical, hreflang, Open Graph, Twitter, robots.

export function pageMetadata(route: Route): Metadata {
  const s = pageSeo(route);
  const url = abs(route.path);
  const langs = alternates(route.id);
  const languages: Record<string, string> = {};
  for (const l of LANGS) if (langs[l]) languages[l] = abs(langs[l]!);
  if (langs.en) languages["x-default"] = abs(langs.en);
  const image = s.image
    ? { url: abs(s.image), alt: s.title }
    : { url: abs(OG_IMAGE.path), width: OG_IMAGE.width, height: OG_IMAGE.height, alt: BRAND };
  return {
    metadataBase: new URL(SITE_URL),
    title: s.title,
    description: s.description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: s.article ? "article" : "website",
      url,
      siteName: BRAND,
      title: s.title,
      description: s.description,
      locale: OG_LOCALE[route.lang],
      alternateLocale: LANGS.filter((l) => l !== route.lang && langs[l]).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: { card: "summary_large_image", title: s.title, description: s.description, images: [image.url] },
    robots: IS_PREVIEW
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

// ---------------------------------------------------------------------------------------------
// JSON-LD: one graph per page. The organisation, the website and the main menu on every page; the
// page itself with its breadcrumb; and what the page is about (a person, a service, an office, a post).

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const NAV_ID = (lang: Lang) => `${SITE_URL}/#navigation-${lang}`;
const personId = (i: number) => `${SITE_URL}/#person-${["amr-abbass", "ahmed-nouh"][i]}`;
const pathOf = (lang: Lang, id: string) => ROUTES.find((r) => r.lang === lang && r.id === id)?.path;

function organization(lang: Lang) {
  const live = liveOf(lang);
  const offices = live.contact.offices;
  const paths = offices.map((_, i) => pathOf(lang, `office:${i}`));
  return {
    "@type": "MedicalOrganization",
    "@id": ORG_ID,
    name: BRAND,
    alternateName: ["TMASI", "Travel Medical Assistance Services International"],
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: abs(LOGO) },
    image: abs(OG_IMAGE.path),
    description: sectionMeta("en", "home")?.description,
    founder: { "@id": personId(0) },
    // The head office line the live footer and the live schema lead with (also the WhatsApp number).
    email: live.shell.offices[0]?.email,
    telephone: live.shell.offices[0]?.tel,
    address: offices.map((o, i) => ({
      "@type": "PostalAddress",
      streetAddress: o.lines[o.lines.length - 1],
      addressLocality: o.lines[0].split(",")[0].trim(),
      addressCountry: OFFICE_COUNTRY[i],
    })),
    contactPoint: offices.map((o, i) => ({
      "@type": "ContactPoint",
      contactType: "customer support",
      name: stripFlag(o.name),
      telephone: o.tel?.[0],
      email: o.email?.[0],
      areaServed: OFFICE_COUNTRY[i],
      url: paths[i] ? abs(paths[i]!) : undefined,
    })),
    areaServed: "Worldwide",
    knowsAbout: live.services.groups.map((g) => g.title),
    sameAs: SAME_AS,
  };
}

function website() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: `${SITE_URL}/`,
    name: BRAND,
    inLanguage: LANGS,
    publisher: { "@id": ORG_ID },
  };
}

function navigation(lang: Lang) {
  const live = liveOf(lang);
  const ids = ["home", "about", "services", "contact", "blog"];
  const items = ids
    .map((id, i) => ({ name: fixSpelling(live.shell.nav[i] || ""), path: pathOf(lang, id) }))
    .filter((x) => x.name && x.path);
  return {
    "@type": "ItemList",
    "@id": NAV_ID(lang),
    name: "Main navigation",
    itemListElement: items.map((x, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: x.name,
      url: abs(x.path!),
    })),
  };
}

function breadcrumb(route: Route, pageName: string) {
  const live = liveOf(route.lang);
  const nav = live.shell.nav.map(fixSpelling);
  const section: Partial<Record<Route["key"], [string, number]>> = {
    about: ["about", 1], leader: ["about", 1], services: ["services", 2], group: ["services", 2],
    contact: ["contact", 3], office: ["contact", 3], blog: ["blog", 4], post: ["blog", 4],
  };
  const crumbs: { name: string; path: string }[] = [{ name: nav[0], path: pathOf(route.lang, "home")! }];
  const s = section[route.key];
  if (s) crumbs.push({ name: nav[s[1]], path: pathOf(route.lang, s[0])! });
  if (!["home", "about", "services", "contact", "blog"].includes(route.key)) crumbs.push({ name: pageName, path: route.path });
  return {
    "@type": "BreadcrumbList",
    "@id": `${abs(route.path)}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

const PAGE_TYPE: Record<Route["key"], string> = {
  home: "WebPage", about: "AboutPage", leader: "ProfilePage", services: "CollectionPage", group: "WebPage",
  contact: "ContactPage", office: "WebPage", blog: "CollectionPage", post: "WebPage",
};

export function pageJsonLd(route: Route) {
  const { lang } = route;
  const live = liveOf(lang);
  const s = pageSeo(route);
  const url = abs(route.path);
  const n = Number(route.ref);
  const pageId = `${url}#webpage`;
  const graph: Record<string, unknown>[] = [organization(lang), website(), navigation(lang)];
  const page: Record<string, unknown> = {
    "@type": PAGE_TYPE[route.key],
    "@id": pageId,
    url,
    name: s.title,
    description: s.description,
    inLanguage: lang,
    isPartOf: { "@id": SITE_ID },
    primaryImageOfPage: { "@type": "ImageObject", url: abs(s.image || OG_IMAGE.path) },
  };
  let pageName = s.title;

  switch (route.key) {
    case "home": case "about": case "contact":
      page.about = { "@id": ORG_ID };
      if (route.key !== "home") page.mainEntity = { "@id": ORG_ID };
      break;
    case "leader": {
      const l = live.leaders[n];
      pageName = l.name;
      const person = {
        "@type": "Person",
        "@id": personId(n),
        name: l.name,
        jobTitle: live.about.board?.members?.[n]?.role,
        image: abs(l.image),
        description: clamp(l.paragraphs[0]),
        worksFor: { "@id": ORG_ID },
        url,
      };
      graph.push(person);
      page.mainEntity = { "@id": personId(n) };
      break;
    }
    case "services": {
      page.mainEntity = {
        "@type": "ItemList",
        itemListElement: live.services.groups.map((g, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: { "@type": "Service", name: g.title, url: pathOf(lang, `group:${i}`) ? abs(pathOf(lang, `group:${i}`)!) : undefined, provider: { "@id": ORG_ID } },
        })),
      };
      break;
    }
    case "group": {
      const g = live.services.groups[n];
      pageName = g.title;
      const service = {
        "@type": "Service",
        "@id": `${url}#service`,
        name: g.title,
        serviceType: g.title,
        description: s.description,
        provider: { "@id": ORG_ID },
        url,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: g.title,
          itemListElement: g.items.map((it) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: ("title" in it && it.title) || it.text },
          })),
        },
      };
      graph.push(service);
      page.mainEntity = { "@id": `${url}#service` };
      break;
    }
    case "office": {
      const o = live.contact.offices[n];
      pageName = stripFlag(o.name);
      const office = {
        "@type": "MedicalOrganization",
        "@id": `${url}#office`,
        name: `${BRAND}, ${stripFlag(o.name)}`,
        parentOrganization: { "@id": ORG_ID },
        url,
        telephone: o.tel?.[0],
        email: o.email?.[0],
        address: {
          "@type": "PostalAddress",
          streetAddress: o.lines[o.lines.length - 1],
          addressLocality: o.lines[0].split(",")[0].trim(),
          addressCountry: OFFICE_COUNTRY[n],
        },
        hasMap: `https://www.google.com/maps?q=${encodeURIComponent(o.lines[o.lines.length - 1])}`,
      };
      graph.push(office);
      page.mainEntity = { "@id": `${url}#office` };
      break;
    }
    case "blog": {
      const posts = getPosts(lang);
      page.mainEntity = {
        "@type": "ItemList",
        itemListElement: posts.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: abs(pathOf(lang, `post:${p.key}`)!),
          name: p.title,
        })),
      };
      break;
    }
    case "post": {
      const p = getPosts(lang).find((x) => x.key === route.ref)!;
      pageName = p.title;
      const images = [...new Set(p.body.filter((b) => b.img).map((b) => abs(b.img!)))];
      const article = {
        "@type": "NewsArticle",
        "@id": `${url}#article`,
        headline: p.title.length > 110 ? clamp(p.title, 110) : p.title,
        description: s.description,
        image: images.length ? images : [abs(OG_IMAGE.path)],
        inLanguage: lang,
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
        mainEntityOfPage: { "@id": pageId },
        isPartOf: { "@id": SITE_ID },
      };
      graph.push(article);
      page.mainEntity = { "@id": `${url}#article` };
      break;
    }
  }

  if (route.key !== "home") {
    const crumbs = breadcrumb(route, pageName);
    graph.push(crumbs);
    page.breadcrumb = { "@id": crumbs["@id"] };
  }
  graph.push(page);
  return { "@context": "https://schema.org", "@graph": graph };
}

/** The graph as a safe <script> body: "<" escaped so no text in it can close the tag. */
export const jsonLdText = (route: Route) => JSON.stringify(pageJsonLd(route)).replace(/</g, "\\u003c");
