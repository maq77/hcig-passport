import type { Metadata } from "next";
import { ABOUT, CEO, T } from "@/content/home.mjs";
import { LEADERSHIP } from "@/content/pages.mjs";
import { Shell } from "@/components/site/Shell";
import { SITE, absAsset } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { LeadershipGrid } from "@/components/site/People";
import { MissionVision } from "@/components/home/Middle";
import { ClosingBand } from "@/components/home/Lower";

export const metadata: Metadata = { title: LEADERSHIP.meta.title, description: CEO.quote };

const PEOPLE_LD = {
  "@context": "https://schema.org",
  "@graph": (LEADERSHIP.people as { name: string; roles: string[]; img?: string }[]).map((p) => ({
    "@type": "Person",
    name: p.name,
    jobTitle: p.roles.join(", "),
    worksFor: { "@type": "Organization", "@id": `${SITE}/#org`, name: "Healthcare International Group" },
    ...(p.img ? { image: absAsset(p.img) } : {}),
  })),
};

export default function LeadershipPage() {
  return (
    <Shell>
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PEOPLE_LD) }} />
        <PageHero
          crumbs={[{ label: T.home, path: "/" }, { label: ABOUT.heading, path: "/about/" }, { label: LEADERSHIP.title, path: "/about/leadership/" }]}
          eyebrow={ABOUT.heading}
          title={LEADERSHIP.title}
          lead={ABOUT.paras[0]}
        />
        <LeadershipGrid />
        <MissionVision />
        <ClosingBand />
      </main>
    </Shell>
  );
}
