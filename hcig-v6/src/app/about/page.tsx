import type { Metadata } from "next";
import { ABOUT, HERO, T } from "@/content/home.mjs";
import { ABOUT_PAGE } from "@/content/pages.mjs";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { BoardTeaser } from "@/components/site/People";
import { About } from "@/components/home/About";
import { MissionVision, OurHealthcare, Why } from "@/components/home/Middle";
import { ClosingBand, Insurers } from "@/components/home/Lower";
import { SheetLink } from "@/components/ui/Sheet";
import { FilmBand } from "@/components/site/Film";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: ABOUT_PAGE.meta.title, description: ABOUT.paras[0] };

export default function AboutPage() {
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: T.home, path: "/" }, { label: ABOUT.heading, path: "/about/" }]}
          eyebrow={ABOUT_PAGE.eyebrow}
          title={ABOUT_PAGE.title}
          lead={ABOUT.paras[0]}
          image="about-hub"
          imageAlt={T.alt.hubAmbulance}
          actions={<SheetLink className="btn">{HERO.ctaPrimary.text}<Icon name="arrow" /></SheetLink>}
          note={ABOUT_PAGE.note}
        />
        <About page />
        <FilmBand />
        <BoardTeaser />
        <MissionVision />
        <Why />
        <OurHealthcare />
        <Insurers />
        <ClosingBand />
      </main>
    </Shell>
  );
}
