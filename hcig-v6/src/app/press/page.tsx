import type { Metadata } from "next";
import { PRESS_PAGE } from "@/content/pages.mjs";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { PressBody } from "@/components/site/Press";
import { ClosingBand } from "@/components/home/Lower";

export const metadata: Metadata = { title: { absolute: PRESS_PAGE.meta.title }, description: PRESS_PAGE.lead.text };

export default function PressPage() {
  const P = PRESS_PAGE;
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: "Home", path: "/" }, { label: P.title.text, path: "/press/" }]}
          title={P.title.text}
          lead={P.lead.text}
          image="moment-itic-stage"
          imageAlt="HCIG on stage at ITIC Global"
        />
        <PressBody />
        <ClosingBand />
      </main>
    </Shell>
  );
}
