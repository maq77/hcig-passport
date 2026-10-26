"use client";
// Hero B ("Night Network"), approved by the owner. The day/night switch changes ONLY the hero (his answer 2026-10-26);
// every section below is always day, and the hero's foot melts into the day page in both modes.
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { HERO } from "@/content/home.mjs";
import { asset, href } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { SheetLink } from "@/components/ui/Sheet";
import { Header } from "./Header";

const STORE = "hcig-theme";
const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function HeroB() {
  const [night, setNight] = useState(false);
  const [sw, setSw] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const stageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -50]);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORE) === "night") setNight(true);
    } catch {}
  }, []);

  const toggle = () => {
    setSw(true);
    setNight((n) => {
      try { localStorage.setItem(STORE, n ? "day" : "night"); } catch {}
      return !n;
    });
  };

  const words = HERO.h1.text.split(" ");
  const vars = { "--flows-n": `url('${asset("flows-night")}')`, "--flows-d": `url('${asset("flows-day")}')` } as CSSProperties;

  return (
    <section ref={ref} className={`hero ${night ? "theme-night" : "theme-day"}${sw ? " sw" : ""}`} style={vars}>
      <div className="in">
        <motion.div className="bg" style={{ y: stageY }}>
          <div className="stage">
            <img className="th-d" src={asset("earth-night")} alt="" width={1376} height={768} fetchPriority="high" />
            <img className="th-l" src={asset("earth-day")} alt="" width={2048} height={1143} />
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
        <Header night={night} onTheme={toggle} />
        <motion.div className="body" style={{ y: copyY }}>
          <div className="copy">
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
          <div className="seals seals-row f" style={d(1400)}>
            <div className="plates">
              <span className="plate"><img src={asset("dmwv")} alt="German Medical Wellness Association (DMWV)" width={310} height={281} /></span>
              <span className="plate plate-w"><img src={asset("gha")} alt="Global Healthcare Accreditation (GHA)" width={391} height={235} /></span>
            </div>
            <p>{HERO.partner.text}</p>
          </div>
        </motion.div>
      </div>
      <div className="hero-melt" aria-hidden="true" />
    </section>
  );
}
