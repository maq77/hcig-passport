import { SPARK, median, sparkPoints, sparkY } from "../../lib/test-line-ui.ts";
import { card, h2s } from "./shared.tsx";

export function ReplySpeed({ latenciesMs }: { latenciesMs: number[] }) {
  const secs = latenciesMs.map((m) => m / 1000);
  const med = median(secs);
  const pts = sparkPoints(secs.slice(-12));
  const target = sparkY(SPARK.targetS);
  return (
    <div style={card()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <h2 style={h2s}>Reply speed</h2>
        {med != null ? <span style={{ fontSize: 26, fontWeight: 600, color: "#00797B" }}>{med.toFixed(1)} s</span> : <span style={{ fontSize: 13, color: "#5B6474" }}>Waiting for the first reply</span>}
      </div>
      <svg viewBox="0 0 300 70" width="100%" height="70" role="img" aria-label="Reply speed per turn against the 1 second target" style={{ marginTop: 8 }}>
        <line x1="0" y1={target} x2="300" y2={target} stroke="#B42318" strokeOpacity=".35" strokeDasharray="4 4" />
        {pts.length > 1 ? <polyline key={pts.length} className="draw" fill="none" stroke="#009A9C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pts.map((p) => `${p.x},${p.y}`).join(" ")} /> : null}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#009A9C" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5B6474" }}>
        <span>{secs.length ? `Median of ${secs.length} ${secs.length === 1 ? "reply" : "replies"}` : "No replies yet"}</span>
        <span>Dashed: 1.0 s target</span>
      </div>
    </div>
  );
}
