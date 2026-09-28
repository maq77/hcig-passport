import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
  light?: boolean;
  id?: string;
};

// The one section heading on the TMASI home: teal rule, Big Noodle title, optional line under it.
export default function SectionHead({ title, sub, align = "center", light = false, id }: Props) {
  return (
    <div className={`lx-head${align === "left" ? " lx-head--left" : ""}`}>
      <h2 id={id} className={`lx-title${light ? " lx-title--light" : ""}`}>{title}</h2>
      {sub && <p className="lx-sub">{sub}</p>}
    </div>
  );
}
