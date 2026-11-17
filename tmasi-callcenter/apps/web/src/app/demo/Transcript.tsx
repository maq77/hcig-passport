"use client";

import { useEffect, useRef } from "react";
import { baseOf, nativeName } from "../../lib/test-line-ui.ts";
import { ARABIC_STACK, hasArabic } from "./shared.tsx";

export interface TItem {
  id: string | number;
  role: "agent" | "caller";
  text: string;
  lang: string;
  meta: string;
}

const AGENT = { bg: "#F1F5F6", fg: "#1D2939" };
const CALLER = { bg: "#009A9C", fg: "#FFFFFF" };

/** variant "live": language pills, switch dividers, entrance, follows the newest line. "after": meta line only. */
export function Transcript({ items, variant, persona, phone }: { items: TItem[]; variant: "live" | "after"; persona?: string; phone?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const live = variant === "live";

  useEffect(() => {
    const el = box.current;
    if (live && el && stick.current) el.scrollTop = el.scrollHeight;
  }, [items.length, live]);

  return (
    <div
      ref={box}
      onScroll={() => {
        const el = box.current;
        if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      }}
      style={{ display: "flex", flexDirection: "column", gap: live ? 12 : 12, maxHeight: live ? (phone ? undefined : 520) : undefined, overflowY: live ? "auto" : undefined, flex: live && phone ? 1 : undefined, minHeight: 0 }}
      role={live ? "log" : undefined}
      aria-label={live ? "Transcript" : undefined}
    >
      {items.length === 0 ? <p style={{ margin: 0, fontSize: 13, color: "#5B6474" }}>Nothing said yet.</p> : null}
      {items.map((l, i) => {
        const a = l.role === "agent";
        const col = a ? AGENT : CALLER;
        const prev = items[i - 1];
        const switched = live && prev && baseOf(prev.lang) !== baseOf(l.lang);
        return (
          <div key={l.id} style={{ display: "flex", flexDirection: "column", gap: live ? 6 : 5, alignItems: a ? "flex-start" : "flex-end" }}>
            {switched ? (
              <div style={{ alignSelf: "center", padding: "6px 12px", borderRadius: 999, background: "#E3F4F4", color: "#00666A", fontSize: 12, fontWeight: 600, textAlign: "center" }}>
                Caller switched to {nativeName(l.lang)} · {persona ?? "The assistant"} follows in the same voice
              </div>
            ) : null}
            <div
              className={live ? (a ? "inL" : "inR") : undefined}
              dir="auto"
              style={{
                maxWidth: phone ? "88%" : live ? "70%" : "72%",
                padding: live ? "12px 16px" : "11px 15px",
                borderRadius: live ? 18 : 16,
                background: col.bg,
                color: col.fg,
                fontSize: 14,
                lineHeight: 1.55,
                ...(hasArabic(l.text) ? { fontFamily: ARABIC_STACK } : {}),
              }}
            >
              {l.text}
            </div>
            {live ? (
              <div style={{ display: "flex", gap: 6, fontSize: 11, color: "#5B6474" }}>
                <span style={{ padding: "2px 8px", borderRadius: 999, background: "#EEF2F4" }}>{baseOf(l.lang).toUpperCase()}</span>
                <span>{l.meta}</span>
              </div>
            ) : (
              <span style={{ fontSize: 11, color: "#5B6474" }}>{l.meta}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
