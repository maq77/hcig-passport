// The frame every page shares: theme (the home hero's day and night), the fixed header outside the page container,
// the page itself, the footer and the contact sheet.
import type { ReactNode } from "react";
import { Header } from "@/components/home/Header";
import { ThemeProvider } from "@/components/home/Theme";
import { ContactSheet, Footer } from "@/components/home/Footer";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {/* the header sits outside the page frame: the frame is a CSS container, which would pin fixed elements to it */}
      <Header />
      <div className="page">
        {children}
        <Footer />
        <ContactSheet />
      </div>
    </ThemeProvider>
  );
}
