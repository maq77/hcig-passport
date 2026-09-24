import { ImagePlus } from "lucide-react";

/* Section heading: our eyebrow (a UI label) + the brief's heading. */
export function Head({ eyebrow, title, id, lead, center, as: As = "h2" }: {
  eyebrow?: string; title: string; id?: string; lead?: React.ReactNode; center?: boolean; as?: "h2" | "h1";
}) {
  return (
    <div className={`head ${center ? "center" : ""}`}>
      {eyebrow && <span className="eyebrow rv">{eyebrow}</span>}
      <As id={id} className="h2 rv" style={{ ["--d" as string]: "60ms" }}>{title}</As>
      {lead && <div className="lead rv" style={{ ["--d" as string]: "120ms" }}>{lead}</div>}
    </div>
  );
}

/* Where the user's dedicated design goes (DESIGN.md section 4). Listed in
   docs/247clinic-v3-design-slots.md. */
export function DesignSlot({ purpose, px, className = "", style, file }: { purpose: string; px: string; className?: string; style?: React.CSSProperties; file?: string }) {
  return (
    <div className={`slot ${className}`} style={style} data-slot={file} role="img" aria-label={`Dedicated design: ${purpose}`}>
      <div className="slot-in" aria-hidden="true">
        <ImagePlus size={22} />
        <b>Dedicated design</b>
        <span>{purpose}, {px}</span>
      </div>
    </div>
  );
}
