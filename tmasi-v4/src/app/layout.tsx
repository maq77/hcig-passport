import type { Metadata } from "next";
import home from "@/content/home.en.json";
import { bebas, bigNoodle, montserrat } from "./fonts";
import "./globals.css";

// TMASI v4 home preview (spec 009). Never indexed (FR-023): the go-live spec flips this.
export const metadata: Metadata = {
  title: home.head.title,
  description: home.head.description,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${bigNoodle.variable} ${bebas.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
