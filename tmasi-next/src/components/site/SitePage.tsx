import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import About from "@/components/About";
import RelaxBanner from "@/components/RelaxBanner";
import CoreValues from "@/components/CoreValues";
import MissionVision from "@/components/MissionVision";
import WhyChoose from "@/components/WhyChoose";
import Services from "@/components/Services";
import QuoteSection from "@/components/QuoteSection";
import WorldMap from "@/components/WorldMap";
import Blog from "@/components/Blog";
import { AboutPage, BlogPage, ContactPage, GroupPage, LeaderPage, OfficePage, PostPage, ServicesPage } from "@/components/pages/InnerPages";
import { SiteProvider } from "./SiteProvider";
import { findRoute, getContent, getPosts, type Lang, type Route } from "@/lib/site";

// Renders any v3 page: finds the route for the address, gives the page its language's words, and
// picks the template. Every language shares the same templates.

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <RelaxBanner />
      <CoreValues />
      <MissionVision />
      <WhyChoose />
      <Services />
      <QuoteSection />
      <WorldMap />
      <Blog />
    </>
  );
}

function Template({ route }: { route: Route }) {
  const n = Number(route.ref);
  switch (route.key) {
    case "home": return <HomePage />;
    case "about": return <AboutPage />;
    case "leader": return <LeaderPage index={n} />;
    case "services": return <ServicesPage />;
    case "group": return <GroupPage index={n} />;
    case "contact": return <ContactPage />;
    case "office": return <OfficePage index={n} />;
    case "blog": return <BlogPage />;
    case "post": {
      const post = getPosts(route.lang).find((p) => p.key === route.ref);
      return post ? <PostPage post={post} /> : null;
    }
  }
}

export function SitePage({ lang, slug }: { lang: Lang; slug?: string[] }) {
  const route = findRoute(lang, slug || []);
  if (!route) notFound();
  const content = getContent(lang, route.id);
  return (
    <SiteProvider value={content}>
      <Header />
      <main><Template route={route} /></main>
      <Footer />
    </SiteProvider>
  );
}

// Titles and descriptions: the live page's own, kept as they are. Pages the live site does not have
// get the page's own heading. Some live pages carry a title in another language (German on the Polish
// home, about, services and contact pages and on the Spanish about page, English on the Spanish
// blog); by decision those take the page's own heading instead (the menu word for Contact, whose
// heading belongs to its form).
const WRONG_LANGUAGE_TITLE = new Set(["pl:home", "pl:about", "pl:services", "pl:contact", "es:about", "es:blog"]);
const stripFlag = (t: string) => t.replace(/^[\u{1F1E6}-\u{1F1FF}]{2}\s*/u, "");

export function siteMetadata(lang: Lang, slug?: string[]): Metadata {
  const route = findRoute(lang, slug || []);
  if (!route) return {};
  const { live, ui } = getContent(lang, route.id);
  const meta = live.meta as Record<string, { title: string; description: string }>;
  const brand = (t: string) => `${t} | TMASI Global`;
  const n = Number(route.ref);
  let title = "";
  let description = "";
  switch (route.key) {
    case "home": case "about": case "services": case "contact": case "blog":
      title = meta[route.key]?.title || "";
      description = meta[route.key]?.description || "";
      if (WRONG_LANGUAGE_TITLE.has(`${lang}:${route.key}`)) {
        const own: Record<string, string> = {
          home: live.home.hero.title.map((s) => s.t).join(""),
          about: live.about.heading,
          services: live.services.heading,
          contact: live.shell.nav[3] || "",
          blog: (live as { blog?: { heading: string } }).blog?.heading || ui.latestNews,
        };
        title = brand(own[route.key]);
      }
      if (!title && route.key === "blog") title = brand(ui.latestNews);
      break;
    case "leader":
      title = live.leaders[n].meta.title;
      description = live.leaders[n].meta.description;
      break;
    case "group": {
      const g = live.services.groups[n];
      title = brand(g.title);
      description = g.items.map((i) => ("title" in i && i.title) || i.text).join(", ");
      break;
    }
    case "office": {
      const o = live.contact.offices[n];
      title = brand(stripFlag(o.name));
      description = o.lines.join(" · ");
      break;
    }
    case "post": {
      const p = getPosts(lang).find((x) => x.key === route.ref);
      title = p?.meta.title || "";
      description = p?.meta.description || "";
      break;
    }
  }
  return { title, description: description.slice(0, 300), robots: "noindex, nofollow" };
}
