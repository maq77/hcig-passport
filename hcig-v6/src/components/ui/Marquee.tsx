import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

/** An endless row: the items, then a hidden copy for the loop. Pauses on hover and focus; a still, wrapped row
    under reduced motion. Pure CSS, so it runs before any script. */
export function Marquee({ children, duration = 60, reverse = false, label }: { children: ReactNode; duration?: number; reverse?: boolean; label?: string }) {
  const copy = Children.map(children, (c, i) =>
    isValidElement(c)
      ? cloneElement(c as ReactElement<Record<string, unknown>>, { key: `copy-${i}`, "aria-hidden": "true", tabIndex: -1 })
      : c,
  );
  return (
    <div className={`marquee${reverse ? " rev" : ""}`} style={{ ["--dur" as string]: `${duration}s` }} role={label ? "group" : undefined} aria-label={label}>
      <div className="marquee-track">
        {children}
        {copy}
      </div>
    </div>
  );
}
