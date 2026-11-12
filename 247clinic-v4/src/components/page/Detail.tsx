/* What an opening card shows (server side): photo, kicker, title, words, ticked points,
   an optional note and closing line, and the buttons. Used inside DetailCard. */
import { Check, Info } from "lucide-react";
import { asset } from "@/data/facts";

export function DetailBody({ img, pos, kicker, title, text, points, note, closing, children }: {
  img: string; pos?: string; kicker?: string; title: string; text?: string | null; points?: string[];
  note?: string; closing?: string; children?: React.ReactNode;
}) {
  return (
    <>
      <div className="dc-media"><img src={asset(img)} alt="" loading="lazy" style={pos ? { objectPosition: pos } : undefined} /></div>
      <div className="dc-body">
        {kicker && <span className="dc-k">{kicker}</span>}
        <h3 className="dc-title">{title}</h3>
        {text && <p className="dc-text">{text}</p>}
        {points && points.length > 0 && (
          <ul className={`dc-pts ${points.length > 4 ? "two" : ""}`}>
            {points.map((p) => <li key={p}><Check size={19} strokeWidth={2.4} aria-hidden="true" /><span>{p}</span></li>)}
          </ul>
        )}
        {note && <p className="dc-note"><Info size={18} aria-hidden="true" /><span>{note}</span></p>}
        {closing && <p className="dc-closing">{closing}</p>}
        {children && <div className="dc-cta">{children}</div>}
      </div>
    </>
  );
}

/* The small "Open" mark on a card that opens. */
export function OpenMark({ label }: { label: string }) {
  return (
    <span className="dc-open"><i aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></i>{label}</span>
  );
}
