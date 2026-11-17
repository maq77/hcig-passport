import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "TMASI Call Center (local)" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
