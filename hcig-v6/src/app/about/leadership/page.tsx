import type { Metadata } from "next";
import { ABOUT, CEO } from "@/content/home.mjs";
import { LEADERSHIP } from "@/content/pages.mjs";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { LeadershipGrid } from "@/components/site/People";
import { MissionVision } from "@/components/home/Middle";
import { ClosingBand } from "@/components/home/Lower";

export const metadata: Metadata = { title: LEADERSHIP.meta.title, description: CEO.quote };

export default function LeadershipPage() {
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: "Home", path: "/" }, { label: ABOUT.heading, path: "/about/" }, { label: LEADERSHIP.title, path: "/about/leadership/" }]}
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
