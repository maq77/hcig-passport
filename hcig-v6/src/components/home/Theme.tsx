"use client";
// The hero's day/night state, shared with the header (which sits outside the page frame so it can stay fixed on screen).
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORE = "hcig-theme";
type T = { night: boolean; sw: boolean; toggle: () => void };
const Ctx = createContext<T>({ night: false, sw: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [night, setNight] = useState(false);
  const [sw, setSw] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(STORE) === "night") setNight(true);
    } catch {}
  }, []);
  const toggle = () => {
    setSw(true);
    setNight((n) => {
      try { localStorage.setItem(STORE, n ? "day" : "night"); } catch {}
      return !n;
    });
  };
  return <Ctx.Provider value={{ night, sw, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
