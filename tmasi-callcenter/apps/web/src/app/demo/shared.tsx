"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

export const ARABIC_STACK = "var(--font-arabic), 'Noto Sans Arabic', var(--font-poppins), Poppins, sans-serif";
export const hasArabic = (s: string): boolean => /[\u0600-\u06FF]/.test(s);

function subscribe(query: string) {
  return (cb: () => void) => {
    const m = window.matchMedia(query);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  };
}
function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => subscribe(query)(cb),
    () => window.matchMedia(query).matches,
    () => false,
  );
}
/** Phone layout at 640 px and below, as in the phone boards. */
export const useIsPhone = () => useMedia("(max-width: 640px)");
export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

export function Brand({ icon, title, sub, phone }: { icon?: boolean; title: string; sub: string; phone?: boolean }) {
  if (phone) {
    return (
      <div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 11, color: "#5B6474" }}>{sub}</div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 10, background: "#0F205C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
          </svg>
        ) : null}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 17 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#5B6474" }}>{sub}</div>
      </div>
    </div>
  );
}

export const card = (extra?: CSSProperties): CSSProperties => ({ background: "#FFFFFF", borderRadius: 24, border: "1px solid #E4EAED", padding: 20, ...extra });
export const h2s: CSSProperties = { margin: 0, fontSize: 15, fontWeight: 600 };

export const MicIcon = ({ size = 20, color = "#344054", slash }: { size?: number; color?: string; slash?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
    <path d="M12 18v4" />
    {slash ? <path d="M3 3l18 18" /> : null}
  </svg>
);

export function Page({ className, children, style }: { className: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={`tl-root ${className}`} style={{ fontFamily: "var(--font-poppins), Poppins, system-ui, sans-serif", ...style }}>
      {children}
    </div>
  );
}

/** Calls fn every frame (or every 300 ms with reduced motion) while active. */
export function useFrame(active: boolean, reduced: boolean, fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return;
    if (reduced) {
      const t = setInterval(() => ref.current(), 300);
      return () => clearInterval(t);
    }
    let raf = 0;
    const loop = () => {
      ref.current();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);
}
