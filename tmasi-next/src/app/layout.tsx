import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

const bigNoodle = localFont({
  src: "../../public/fonts/bignoodletitlingrusbydaymarius.ttf",
  variable: "--font-bignoodle",
});

export const metadata: Metadata = {
  title: "TMASI Global | Medical Tourism & Travel Assistance Worldwide",
  description: "TMASI Global. Your trusted partner for medical assistance, travel support, and tourism services worldwide. Offices in Egypt, Germany, Spain, and UAE. Expert help when you need it most.",
  robots: "noindex, nofollow",
  openGraph: {
    title: "TMASI Global | Medical, Travel & Tourism Assistance Worldwide",
    description: "TMASI Global provides expert medical, travel and tourism assistance across Egypt, Germany, Spain, UAE and USA. Decades of experience, one-call support, global reach.",
    url: "https://tmasi.net",
    siteName: "TMASI Global",
    images: [
      {
        url: "/tmasi/v3/img/logo.PNG",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TMASI Global | Medical, Travel & Tourism Assistance",
    description: "Expert medical, travel and tourism assistance across Egypt, Germany, Spain, UAE and USA.",
    images: ["/tmasi/v3/img/logo.PNG"],
  },
};

import SmoothScroll from "@/components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${bigNoodle.variable}`}>
      <body className="antialiased">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
