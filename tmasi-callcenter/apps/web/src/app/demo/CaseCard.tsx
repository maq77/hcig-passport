import { caseProgress, maskContact, type CaseFields } from "../../lib/test-line-ui.ts";

const WAIT = "#9DB1E0";

export function CaseCard({ fields, phone }: { fields: CaseFields; phone?: boolean }) {
  const { filled, total } = caseProgress(fields);
  if (phone) {
    const rows: [string, string | null][] = [
      ["Name", fields.name],
      ["Country", fields.country],
      ["Need", fields.need],
      ["Dates", fields.dates],
      ["Contact", fields.contact ? maskContact(fields.contact) : null],
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ color: "#5B6474" }}>{k}</span>
            {v ? (
              <span dir="auto" style={{ fontWeight: 500, textAlign: "right" }}>
                {v}
              </span>
            ) : (
              <span style={{ color: "#98A2B3" }}>waiting</span>
            )}
          </div>
        ))}
      </div>
    );
  }
  const need = [fields.need, fields.dates].filter(Boolean).join(", ");
  const rows: [string, string | null, string][] = [
    ["Type", fields.type, "Waiting for the first detail"],
    ["Name", fields.name, "Waiting for a name"],
    ["Country", fields.country, "Waiting for a country"],
    ["Need", need || null, "Waiting for what they need"],
    ["Contact", fields.contact ? maskContact(fields.contact) : null, "Waiting for phone or email"],
  ];
  return (
    <div style={{ background: "#0F205C", color: "#FFFFFF", borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Case</h2>
        <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,.14)", fontSize: 12 }}>{fields.created ? "Created" : `Forming · ${filled} of ${total}`}</span>
      </div>
      {rows.map(([k, v, w], i) => (
        <div key={`${k}-${v ?? ""}`} className="tick" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, fontSize: 13, animationDelay: `${i * 0.12}s` }}>
          <span style={{ color: "#C9D3EA" }}>{k}</span>
          <span dir="auto" style={{ fontWeight: 500, color: v ? "#FFFFFF" : WAIT, textAlign: "right" }}>
            {v ?? w}
          </span>
        </div>
      ))}
    </div>
  );
}
