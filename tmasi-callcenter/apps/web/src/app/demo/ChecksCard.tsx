import { card, h2s } from "./shared.tsx";

export interface LiveCheck {
  label: string;
  state: string;
  done: boolean;
}

export function ChecksCard({ checks, bare }: { checks: LiveCheck[]; bare?: boolean }) {
  const list = checks.map((c) => (
    <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
      <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: "50%", background: c.done ? "#E3F4F4" : "#EEF2F4", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.done ? "#00797B" : "#98A2B3"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <span style={{ flex: 1 }}>{c.label}</span>
      <span style={{ fontSize: 12, color: "#5B6474", textAlign: "right" }}>{c.state}</span>
    </div>
  ));
  if (bare) return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{list}</div>;
  return (
    <div style={card({ display: "flex", flexDirection: "column", gap: 10 })}>
      <h2 style={h2s}>Checks so far</h2>
      {list}
    </div>
  );
}
