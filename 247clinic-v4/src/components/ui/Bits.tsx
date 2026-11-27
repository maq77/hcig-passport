import { Fragment } from "react";
import { ImagePlus } from "lucide-react";

/* Section heading: our eyebrow (a UI label) + the brief's heading. */
/* Section headings rise word by word out of a soft blur (the user, 2026-11-12: "adding animation and motion for
   section heading ... takes its time so it feel more premium"). The words stay one sentence for readers and search. */
export function Words({ text }: { text: string }) {
  /* The word "|br|" in a heading starts a new line there (his ask 2026-11-27: "A Hospitality Advantage." on its own line). */
  const words = text.split(" ").filter(Boolean);
  return <>{words.map((w, i) => w === "|br|"
    ? <span key={i} className="line-break" aria-hidden="true" />
    : <Fragment key={i}><span className="w" style={{ ["--i" as string]: i }}><span>{w}</span></span>{i < words.length - 1 && words[i + 1] !== "|br|" ? " " : null}</Fragment>)}</>;
}

export function Head({ eyebrow, title, id, lead, center, as: As = "h2" }: {
  eyebrow?: string; title: string; id?: string; lead?: React.ReactNode; center?: boolean; as?: "h2" | "h1";
}) {
  return (
    <div className={`head ${center ? "center" : ""}`}>
      {eyebrow && <span className="eyebrow rv">{eyebrow}</span>}
      <As id={id} className="h2 rv hw"><Words text={title} /></As>
      {lead && <div className="lead rv" style={{ ["--d" as string]: "380ms" }}>{lead}</div>}
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
