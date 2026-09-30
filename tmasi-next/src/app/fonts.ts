import { Bebas_Neue, Montserrat } from "next/font/google";
import localFont from "next/font/local";

// Shared by every language's root layout.
export const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const bigNoodle = localFont({
  src: "../../public/fonts/bignoodletitlingrusbydaymarius.ttf",
  variable: "--font-bignoodle",
  // No automatic Arial stand-in: it has the Polish letters Big Noodle lacks, so it would catch them before
  // Bebas Neue (below) and show a small, off-style letter. The font is tiny and preloaded anyway.
  adjustFontFallback: false,
});

// Big Noodle has no ą ć ę ń ś ź ż (it covers ł and ó). Bebas Neue, the closest condensed capital face, fills
// only those letters, so Polish titles stay one look. Not preloaded: the browser fetches it only when a
// page needs one of those letters.
export const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin-ext"],
  variable: "--font-bebas",
  preload: false,
});
