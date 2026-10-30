// The home, in the live site's order (owner, 2026-10-26), with the maritime block and the CEO quote added.
import { HeroB } from "@/components/home/HeroB";
import { About } from "@/components/home/About";
import { Premises } from "@/components/home/Premises";
import { Built, MissionVision, OurHealthcare, SystemWorks, Why } from "@/components/home/Middle";
import { CeoQuote, ClosingBand, Impact, Insurers, Maritime, Testimonials, WhoWeWorkWith } from "@/components/home/Lower";
import { Shell } from "@/components/site/Shell";
import { MoreNews } from "@/components/site/Blog";
import { postCards } from "@/lib/posts";
import { FilmBand } from "@/components/site/Film";
import { SilkDivider } from "@/components/ui/Silk";
import { CONTACT, GROUP, HERO, NEWS, SOCIAL_LINKS, UI } from "@/content/home.mjs";
import { SITE, abs, absAsset } from "@/lib/site";

const brands = GROUP.brands as { name: string; url: string }[];
const ORG = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "MedicalOrganization"],
      "@id": `${SITE}/#org`,
      name: "Healthcare International Group",
      alternateName: "HCIG",
      url: `${SITE}/`,
      logo: absAsset("logo-h-black"),
      description: HERO.lead.text,
      email: CONTACT.email,
      telephone: CONTACT.whatsapp,
      address: [
        { "@type": "PostalAddress", streetAddress: "123 Hassan ElMaamoun St., Sixth Floor, Suite 604, Nasr City", addressLocality: "Cairo", addressCountry: "EG" },
        { "@type": "PostalAddress", streetAddress: "2251 Drew St, Suite A", addressLocality: "Clearwater", addressRegion: "FL", postalCode: "33765", addressCountry: "US" },
      ],
      // owner 2026-10-30: the five countries are our main hubs; we operate globally and serve patients everywhere
      areaServed: { "@type": "Place", name: "Worldwide" },
      subOrganization: brands.map((b) => ({ "@type": "MedicalOrganization", name: b.name, ...(b.url ? { url: b.url } : {}) })),
      sameAs: SOCIAL_LINKS.map((x) => x.url),
    },
    { "@type": "WebSite", "@id": `${SITE}/#website`, url: abs("/"), name: "Healthcare International Group (HCIG)", publisher: { "@id": `${SITE}/#org` }, inLanguage: process.env.NEXT_PUBLIC_LANG ?? "en" },
  ],
};

export default function Home() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }} />
      <HeroB />
      <main id="main">
        <About />
        <FilmBand />
        <Premises />
        <MissionVision />
        <Why />
        <Built />
        <SystemWorks />
        <OurHealthcare more />
        <SilkDivider />
        <Maritime />
        <Testimonials />
        <CeoQuote />
        <Insurers />
        <WhoWeWorkWith />
        <Impact />
        <MoreNews title={NEWS.heading.text} cta={UI.allNews.text} posts={postCards(3)} />
        <ClosingBand />
      </main>
    </Shell>
  );
}
