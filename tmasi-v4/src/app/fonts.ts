import { Bebas_Neue, Montserrat } from "next/font/google";
import localFont from "next/font/local";

// Copied from v3 (tmasi-next/src/app/fonts.ts). TMASI guideline: Big Noodle Titling for headlines
// (web use permission stated by Mohamed), Montserrat for text.
export const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

export const bigNoodle = localFont({
  src: "../../public/fonts/bignoodletitlingrusbydaymarius.ttf",
  variable: "--font-bignoodle",
  // v3 trap: the automatic Arial stand-in would catch letters before Bebas Neue. Keep it off.
  adjustFontFallback: false,
});

export const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin-ext"],
  variable: "--font-bebas",
  preload: false,
});
