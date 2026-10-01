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
import { jsonLdText, pageMetadata } from "@/lib/seo";

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
      {/* What the page is, for search engines and AI answers (lib/seo.ts). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(route) }} />
      <Header />
      {/* Keyed by page, so a move to another page replays the short fade-in (globals.css, .page-in). */}
      <main key={route.id} className="page-in"><Template route={route} /></main>
      <Footer />
    </SiteProvider>
  );
}

// Title, description, canonical, hreflang, Open Graph and robots: see lib/seo.ts.
export function siteMetadata(lang: Lang, slug?: string[]): Metadata {
  const route = findRoute(lang, slug || []);
  return route ? pageMetadata(route) : {};
}
