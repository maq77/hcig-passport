export function Banner({ text, tone = "error", style }: { text: string; tone?: "error" | "info"; style?: React.CSSProperties }) {
  if (tone === "info") {
    return (
      <div role="status" style={{ padding: "12px 14px", borderRadius: 14, background: "#E3F4F4", color: "#00585B", fontSize: 13, lineHeight: 1.45, ...style }}>
        {text}
      </div>
    );
  }
  return (
    <div role="alert" style={{ padding: "12px 14px", borderRadius: 14, background: "#FDECEA", color: "#8A1C12", fontSize: 13, lineHeight: 1.45, display: "flex", gap: 10, alignItems: "flex-start", ...style }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
      <span>{text}</span>
    </div>
  );
}
