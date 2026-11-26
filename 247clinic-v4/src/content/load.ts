/* Build-time loader for the brief's content (content/247clinic/en/*.json).
   The words come from WEBSITE.docx and are rendered as they are. `devNotes`
   are instructions to us and are never returned. */
import fs from "node:fs";
import path from "node:path";

export type Item = { title: string; text: string | null };
export type Cta = { label: string; target: string };
export type Section = {
  id: string;
  briefSection: number;
  heading: string;
  subheading: string | null;
  body: string[];
  items: Item[];
  ctas: Cta[];
};

const ROOT = path.resolve(process.cwd(), "..", "content", "247clinic");

type Page = { sections: Omit<Section, never>[] } & Record<string, unknown>;

function read(page: string): Page {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "en", `${page}.json`), "utf8"));
}

export function section(page: string, id: string): Section {
  const s = read(page).sections.find((x) => x.id === id);
  if (!s) throw new Error(`content: ${page}#${id} not found`);
  const { id: sid, briefSection, heading, subheading, body, items, ctas } = s as Section;
  return { id: sid, briefSection, heading, subheading, body: body ?? [], items: items ?? [], ctas: ctas ?? [] };
}

export type Global = {
  nav: { title: string }[];
  footerOnly: { title: string }[];
  whatsapp: { floatingText: string; stickyText: string; prefill: Record<string, string> };
  finalMessage: string;
};

export function global(): Global {
  const g = read("global") as unknown as {
    nav: { title: string }[];
    footerOnly: { title: string }[];
    whatsapp: Global["whatsapp"];
    sections: Section[];
  };
  const msg = g.sections.find((s) => s.id === "final-website-message")?.body[0] ?? "";
  return { nav: g.nav, footerOnly: g.footerOnly, whatsapp: g.whatsapp, finalMessage: msg };
}

/* Their real guest reviews from the Google and Facebook pages (owner screenshots, 2026-11-18), quoted exactly, originals only. */
export type Review = { name: string; lang: string; text: string; source: "google" | "facebook"; country?: string };
export function reviews(): Review[] {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "reviews.json"), "utf8")).reviews;
}

/* Irina's articles (content/247clinic/en/blog-articles.json, 2026-11-25), words kept exactly.
   A block "## ..." is a sub-heading; **...** marks a sentence set in bold. */
export type Article = {
  slug: string; title: string; subtitle: string; seoTitle: string; metaDescription: string;
  date: string; day: string; month: string; cover: string; blocks: string[];
};
export function articles(): Article[] {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "en", "blog-articles.json"), "utf8")).articles;
}
