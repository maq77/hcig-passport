import { Montserrat } from "next/font/google";
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
});
