import { fmtClock, nativeName } from "../../lib/test-line-ui.ts";
import type { LangEvent } from "./useTestLine.ts";
import { ARABIC_STACK, hasArabic } from "./shared.tsx";

export function LanguageTimeline({ events, voiceChanged, phone }: { events: LangEvent[]; voiceChanged: boolean; phone?: boolean }) {
  const switched = events.length > 1;
  const label = !switched ? null : phone ? (voiceChanged ? "voice changed" : "same voice") : voiceChanged ? "Voice changed on request" : "Same voice, same name";
  return (
    <div style={{ width: "100%", maxWidth: phone ? undefined : 760, display: "flex", flexDirection: "column", gap: 8, alignItems: phone ? "center" : undefined }}>
      {phone ? null : <span style={{ fontSize: 12, color: "#5B6474" }}>Languages in this call</span>}
      <div style={{ display: "flex", alignItems: "center", gap: phone ? 6 : 10, flexWrap: "wrap", justifyContent: phone ? "center" : undefined }}>
        {events.map((e, i) => {
          const newest = i === events.length - 1 && switched;
          const name = nativeName(e.lang);
          return (
            <span key={`${e.lang}-${i}`} style={{ display: "contents" }}>
              {i > 0 ? <span aria-hidden="true" style={{ width: phone ? 16 : 26, height: 2, borderRadius: 2, background: "#BFE3E3" }} /> : null}
              <span
                className={newest ? "chipnew" : undefined}
                dir="ltr"
                style={{
                  padding: phone ? "5px 10px" : "7px 12px",
                  borderRadius: phone ? 10 : 12,
                  background: newest ? "#009A9C" : phone ? "#FFFFFF" : "#F1F5F6",
                  border: phone && !newest ? "1px solid #E4EAED" : undefined,
                  color: newest ? "#FFFFFF" : undefined,
                  fontWeight: newest ? 600 : undefined,
                  fontSize: phone ? 12 : 13,
                  ...(hasArabic(name) ? { fontFamily: ARABIC_STACK } : {}),
                }}
              >
                {name}
                {phone ? null : (
                  <>
                    {" "}
                    <span style={{ color: newest ? undefined : "#5B6474", fontWeight: newest ? 400 : undefined, opacity: newest ? 0.85 : undefined }}>{fmtClock(e.atS)}</span>
                  </>
                )}
              </span>
            </span>
          );
        })}
        {label ? <span style={{ fontSize: phone ? 11 : 12, color: "#00666A", fontWeight: 600 }}>{label}</span> : null}
      </div>
    </div>
  );
}
