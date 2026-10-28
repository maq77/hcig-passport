"use client";
// Hero B ("Night Network"), approved by the owner. The day/night switch changes ONLY the hero (his answer 2026-10-26);
// every section below is always day, and the hero's foot melts into the day page in both modes.
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { HERO, T } from "@/content/home.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { SheetLink } from "@/components/ui/Sheet";
import { useTheme } from "./Theme";
import { HeroFilm } from "@/components/site/Film";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

// the partners' names (the same in every language) and "Official Partner" carry the heavier weight
const STRONG = /(Official Partner|Global Healthcare Accreditation™ \(GHA\)|German Medical Wellness Association \(DMWV\))/;
const strong = (t: string) => t.split(STRONG).map((x, i) => (i % 2 ? <b key={i}>{x}</b> : x));

export function HeroB() {
  const { night, sw } = useTheme();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const stageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -50]);

  const words = HERO.h1.text.split(" ");
  const vars = { "--flows-n": `url('${asset("flows-night")}')`, "--flows-d": `url('${asset("flows-day")}')` } as CSSProperties;

  return (
    <section ref={ref} className={`hero ${night ? "theme-night" : "theme-day"}${sw ? " sw" : ""}`} style={vars}>
      <div className="in">
        <motion.div className="bg" style={{ y: stageY }}>
          <div className="stage">
            <img className="th-d" src={asset("earth-night")} alt="" width={1376} height={768} fetchPriority="low" decoding="async" />
            {/* day is the default theme, so the day Earth is the first image a visitor sees: it loads first */}
            <img className="th-l" src={asset("earth-day")} alt="" width={2048} height={1143} fetchPriority="high" />
            <div className="flow fl-n" />
            <div className="flow fl-d" />
            <span className="hub hub-n" style={{ left: "73.8%", top: "61.2%" }} />
            <span className="hub hub-d" style={{ left: "75.4%", top: "59.9%" }} />
          </div>
        </motion.div>
        <div className="shades">
          <div className="th-d"><div className="shade shade-n" /></div>
          <div className="th-l"><div className="shade shade-d" /></div>
        </div>
        <div className="fx" aria-hidden="true"><div className="band" /><div className="flare" /></div>
        <motion.div className="body" style={{ y: copyY }}>
          <div className="copy">
            {/* Irina, 2026-10-28 (his pick K2): the GHA and DMWV partnership opens the hero, seals large, the live
                sentence in bold with the partners' names heavier, a turquoise rule under it */}
            <div className="cred f" style={d(150)}>
              <div className="plates">
                <span className="plate"><img src={asset("dmwv")} alt={T.alt.dmwv} width={310} height={281} /></span>
                <span className="plate plate-w"><img src={asset("gha")} alt={T.alt.ghaLogo} width={391} height={235} /></span>
              </div>
              <p>{strong(HERO.partner.text)}</p>
            </div>
            <h1 className="h1 rise" aria-label={HERO.h1.text}>
              {words.map((w, i) => (
                <span key={i}>
                  <span className={`w${i >= HERO.h1.accentFrom ? " acc" : ""}`} aria-hidden="true">
                    <span style={{ "--i": i } as CSSProperties}>{w}</span>
                  </span>{" "}
                </span>
              ))}
            </h1>
            <p className="sub f" style={d(850)}>{HERO.sub.text}</p>
            <p className="lead f" style={d(1000)}>{HERO.lead.text}</p>
            <div className="f" style={d(1150)}>
              <div className="ctas">
                <SheetLink className="btn">{HERO.ctaPrimary.text}<Icon name="arrow" /></SheetLink>
                <a href={href("/partner/")} className="btn2">{HERO.ctaSecondary.text}</a>
              </div>
            </div>
          </div>
        </motion.div>
        <HeroFilm />
      </div>
      <div className="hero-melt" aria-hidden="true" />
    </section>
  );
}
