import type { Metadata } from "next";
import { NETWORK_PAGE } from "@/content/pages.mjs";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { NetworkBody } from "@/components/site/GroupPages";
import { Insurers, ClosingBand } from "@/components/home/Lower";
import { T } from "@/content/home.mjs";

export const metadata: Metadata = { title: { absolute: NETWORK_PAGE.meta.title }, description: NETWORK_PAGE.lead.text };

export default function NetworkPage() {
  const N = NETWORK_PAGE;
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: T.home, path: "/" }, { label: N.title.text, path: "/network/" }]}
          title={N.title.text}
          lead={N.lead.text}
          image="traveller-centre"
          imageAlt={T.alt.airport}
        />
        <NetworkBody />
        <Insurers />
        <ClosingBand />
      </main>
    </Shell>
  );
}
