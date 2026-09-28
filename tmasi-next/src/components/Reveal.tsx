"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  type?: "fade" | "rise" | "scale" | "slide-right";
}

export default function Reveal({ children, delay = 0, className = "", style, type = "rise" }: RevealProps) {
  // Visitors who ask for less motion get the content in place, with no entrance movement.
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <div className={className} style={style}>{children}</div>;
  }

  const getVariants = () => {
    switch (type) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        };
      case "slide-right":
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0 },
        };
      case "rise":
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        };
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1], // Spring-like ease out
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
