import type { Metadata } from "next";
import { CTA, GROUP, T } from "@/content/home.mjs";
import { GROUP_PAGE } from "@/content/pages.mjs";
import { href } from "@/lib/site";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { BrandGrid, MedParkPlaces } from "@/components/site/GroupPages";
import { Premises } from "@/components/home/Premises";
import { ClosingBand } from "@/components/home/Lower";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: { absolute: GROUP_PAGE.meta.title }, description: `${GROUP.line.text}: ${(GROUP.brands as { name: string }[]).map((b) => b.name.replace(/ \(.*\)$/, "")).join(", ")}.` };

export default function GroupPage() {
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: T.home, path: "/" }, { label: GROUP_PAGE.title, path: "/group/" }]}
          title={GROUP_PAGE.title}
          lead={GROUP_PAGE.line}
          image="about-hub"
          imageAlt={T.alt.hub}
          actions={<a className="btn" href={href("/partner/")}>{CTA.primary}<Icon name="arrow" /></a>}
        />
        <BrandGrid />
        <Premises />
        <MedParkPlaces />
        <ClosingBand />
      </main>
    </Shell>
  );
}
