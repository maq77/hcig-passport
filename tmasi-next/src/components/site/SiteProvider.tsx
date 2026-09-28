"use client";

import { createContext, useContext } from "react";
import type { SiteContent } from "@/lib/site";

// One language's words and links, for every client component on the page.
const SiteCtx = createContext<SiteContent | null>(null);

export function SiteProvider({ value, children }: { value: SiteContent; children: React.ReactNode }) {
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSite(): SiteContent {
  const v = useContext(SiteCtx);
  if (!v) throw new Error("useSite() outside <SiteProvider>");
  return v;
}
