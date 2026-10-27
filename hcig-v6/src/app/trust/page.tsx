import type { Metadata } from "next";
import { TRUST_PAGE } from "@/content/pages.mjs";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { TrustBody } from "@/components/site/GroupPages";
import { Insurers, Testimonials, ClosingBand } from "@/components/home/Lower";

export const metadata: Metadata = { title: { absolute: TRUST_PAGE.meta.title }, description: TRUST_PAGE.partnership.text };

export default function TrustPage() {
  const T = TRUST_PAGE;
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: "Home", path: "/" }, { label: T.title.text, path: "/trust/" }]}
          title={T.title.text}
          lead={T.lead.text}
          image="svc-accreditation"
          imageAlt="Healthcare professionals at a GHA accreditation event"
        />
        <TrustBody />
        <Insurers />
        <Testimonials />
        <ClosingBand />
      </main>
    </Shell>
  );
}
