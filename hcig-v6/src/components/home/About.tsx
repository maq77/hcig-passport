"use client";
// About Us. The TMASI v3 About pattern: shared header, a Dim Gray depth band (his answer 2026-10-26, no pure black)
// with the statement and the resort-clinic image, two paragraphs, three facts, and the counters panel.
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ABOUT } from "@/content/home.mjs";
import { asset } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { CountUp, Item, Reveal, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import type { IconName } from "@/lib/icons";

const FACT_ICONS: IconName[] = ["speed", "ownership", "network"];

export function About() {
  const [first, second, third] = ABOUT.paras;
  const st = ABOUT.statement.text.split(". ");
  const band = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: band, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);

  return (
    <section className="sec about" aria-labelledby="about-h">
      <div className="wrap">
        <SectionHead id="about-h" title={ABOUT.heading} lead={first} className="about-head" />
        <Reveal className="about-band" ref={band}>
          <div className="about-band-copy">
            <div className="about-signal" aria-hidden="true">
              <span className="nd"><Icon name="cross" size={22} /></span><span className="ln" />
              <span className="nd"><Icon name="hospital" size={22} /></span><span className="ln" />
              <span className="nd"><Icon name="globe" size={22} /></span>
            </div>
            <p className="about-statement">
              {st[0]}. <span className="acc">{st.slice(1).join(". ")}</span>
            </p>
          </div>
          <figure className="about-band-photo">
            <motion.img
              style={{ y: imgY }}
              src={asset("about-band")}
              alt="A doctor walking with a guest through the medical reception of a Red Sea resort"
              loading="lazy"
            />
          </figure>
        </Reveal>
        <Stagger className="about-text">
          <Item as="div"><p>{second}</p></Item>
          <Item as="div"><p>{third}</p></Item>
        </Stagger>
        <Reveal as="p" className="about-ensure">{ABOUT.ensureIntro}</Reveal>
        <Stagger as="ul" className="about-facts" gap={0.12}>
          {ABOUT.ensure.map((e: string, i: number) => (
            <Item as="li" key={e}>
              <span className="ico" aria-hidden="true"><Icon name={FACT_ICONS[i]} size={24} /></span>
              <p>{e}</p>
            </Item>
          ))}
        </Stagger>
        <Reveal className="about-panel">
          <p>{ABOUT.closing}</p>
          <div className="about-stats">
            {ABOUT.stats.map((s: { n: number; suffix: string; label: string }) => (
              <div className="stat" key={s.label}>
                <b><CountUp to={s.n} /><em>{s.suffix}</em></b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
