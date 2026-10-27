import type { Metadata } from "next";
import { MARITIME_PAGE } from "@/content/maritime.mjs";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { MaritimeBody } from "@/components/site/MaritimePage";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/content/home.mjs";

// SEO title and description as the manager wrote them (src/content/manager/maritime-seo.md)
export const metadata: Metadata = { title: { absolute: MARITIME_PAGE.meta.title }, description: MARITIME_PAGE.meta.description };

export default function MaritimePage() {
  const M = MARITIME_PAGE;
  return (
    <Shell>
      <main id="main">
        <PageHero
          tone="cover"
          crumbs={[{ label: T.home, path: "/" }, { label: T.maritime, path: "/maritime-cruise-healthcare/" }]}
          eyebrow={M.intro.kicker}
          title={M.meta.h1}
          lead={M.intro.paras[0]}
          image="mar-deck"
          imageAlt={T.alt.deck}
          actions={<>
            <a className="btn" href="#capabilities">{M.intro.ctas[0]}<Icon name="arrow" /></a>
            <a className="btn2" href="#maritime-form">{M.intro.ctas[1]}</a>
          </>}
          note={M.intro.tagline}
        />
        <MaritimeBody />
      </main>
    </Shell>
  );
}
