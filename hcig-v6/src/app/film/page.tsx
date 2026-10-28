import type { Metadata } from "next";
import { FILM, HERO, T } from "@/content/home.mjs";
import { href } from "@/lib/site";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { FilmStage } from "@/components/site/Film";
import { ClosingBand } from "@/components/home/Lower";
import { SheetLink } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: { absolute: FILM.meta.text }, description: `${FILM.line.text} ${HERO.lead.text}` };

export default function FilmPage() {
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: T.home, path: "/" }, { label: FILM.title.text, path: "/film/" }]}
          title={FILM.title.text}
          lead={FILM.line.text}
          actions={<>
            <SheetLink className="btn">{HERO.ctaPrimary.text}<Icon name="arrow" /></SheetLink>
            <a className="btn2" href={href("/partner/")}>{HERO.ctaSecondary.text}</a>
          </>}
          aside={<FilmStage />}
        />
        <ClosingBand />
      </main>
    </Shell>
  );
}
