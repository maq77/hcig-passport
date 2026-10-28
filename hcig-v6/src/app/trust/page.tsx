import type { Metadata } from "next";
import { TRUST_PAGE } from "@/content/pages.mjs";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { TrustBody } from "@/components/site/GroupPages";
import { postCards } from "@/lib/posts";
import { Insurers, Testimonials, ClosingBand } from "@/components/home/Lower";
import { T } from "@/content/home.mjs";

export const metadata: Metadata = { title: { absolute: TRUST_PAGE.meta.title }, description: TRUST_PAGE.partnership.text };

export default function TrustPage() {
  const TP = TRUST_PAGE;
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: T.home, path: "/" }, { label: TP.title.text, path: "/trust/" }]}
          title={TP.title.text}
          lead={TP.lead.text}
          image="svc-accreditation"
          imageAlt={T.alt.gha}
        />
        <TrustBody posts={postCards()} />
        <Insurers />
        <Testimonials />
        <ClosingBand />
      </main>
    </Shell>
  );
}
