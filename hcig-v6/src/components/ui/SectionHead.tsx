import type { ReactNode } from "react";
import { Reveal } from "./Motion";

/** ONE section header for every section, in the brand guideline's own motif: the Helma title between two black
    hairlines (guideline pages 1 to 25), then the lead. `start` keeps it left aligned inside a column, line to the right. */
export function SectionHead({ id, title, lead, eyebrow, tone, align, className = "" }: { id: string; title: ReactNode; lead?: ReactNode; eyebrow?: string; tone?: "ink"; align?: "start"; className?: string }) {
  return (
    <Reveal className={`sec-head${align === "start" ? " start" : ""}${tone === "ink" ? " on-ink" : ""} ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="h2" id={id}><span>{title}</span></h2>
      {lead ? <p className="lead">{lead}</p> : null}
    </Reveal>
  );
}
