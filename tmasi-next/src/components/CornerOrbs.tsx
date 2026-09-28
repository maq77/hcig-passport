"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

// Quarter-visible circles anchored on two corners of a section: a soft navy disc, a fine teal ring,
// an outer hairline ring, and a teal dot that travels along the ring as the visitor scrolls
// (a flight-path hint). Motion follows the scroll only; nothing moves on its own.

type Corner = "top-right" | "bottom-left";

function Orb({ corner, drift, orbit }: { corner: Corner; drift: MotionValue<number>; orbit: MotionValue<number> }) {
  const anchor = corner === "top-right" ? "right-0 top-0" : "left-0 bottom-0";
  const ring = "absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full";
  return (
    <motion.div style={{ y: drift }} className={`absolute ${anchor}`}>
      <div className={`${ring} h-[340px] w-[340px] bg-[#0F205C]/[0.035] md:h-[560px] md:w-[560px]`} />
      <div className={`${ring} h-[460px] w-[460px] border border-[#009A9C]/25 md:h-[760px] md:w-[760px]`} />
      <div className={`${ring} h-[580px] w-[580px] border border-[#0F205C]/[0.06] md:h-[980px] md:w-[980px]`} />
      <motion.div style={{ rotate: orbit }} className={`${ring} h-[460px] w-[460px] md:h-[760px] md:w-[760px]`}>
        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#009A9C] shadow-[0_0_0_6px_rgba(0,154,156,0.14)]" />
      </motion.div>
    </motion.div>
  );
}

export default function CornerOrbs() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Top-right shows the lower-left quarter of its circle (180 to 270 degrees), bottom-left the upper-right (0 to 90).
  const driftDown = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-36, 36]);
  const driftUp = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [36, -36]);
  const orbitTopRight = useTransform(scrollYProgress, [0, 1], reduce ? [225, 225] : [196, 262]);
  const orbitBottomLeft = useTransform(scrollYProgress, [0, 1], reduce ? [45, 45] : [12, 80]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <Orb corner="top-right" drift={driftDown} orbit={orbitTopRight} />
      <Orb corner="bottom-left" drift={driftUp} orbit={orbitBottomLeft} />
    </div>
  );
}
