import { Fragment, type CSSProperties } from "react";

// A live heading as segments: plain text plus its highlighted part, exactly as tmasi.net marks it.
export type Seg = { t: string; accent?: boolean };

export function Segs({ segs, accentClass, accentStyle }: { segs: Seg[]; accentClass?: string; accentStyle?: CSSProperties }) {
  return (
    <>
      {segs.map((s, i) =>
        s.accent ? (
          <strong key={i} className={accentClass} style={accentStyle}>{s.t}</strong>
        ) : (
          <Fragment key={i}>{s.t}</Fragment>
        )
      )}
    </>
  );
}

export const plain = (segs: Seg[]) => segs.map((s) => s.t).join("");

/** Split a heading into lines right after the given phrases (line breaks that follow meaning). */
export function splitLines(segs: Seg[], breaks: string[]): Seg[][] {
  const lines: Seg[][] = [[]];
  for (const seg of segs) {
    if (seg.accent) {
      lines[lines.length - 1].push(seg);
      continue;
    }
    let rest = seg.t;
    for (;;) {
      const hits = breaks.map((b) => ({ b, i: rest.indexOf(b) })).filter((h) => h.i >= 0).sort((a, b) => a.i - b.i);
      if (!hits.length) break;
      const cut = hits[0].i + hits[0].b.length;
      lines[lines.length - 1].push({ t: rest.slice(0, cut) });
      lines.push([]);
      rest = rest.slice(cut).replace(/^\s+/, "");
    }
    if (rest) lines[lines.length - 1].push({ t: rest });
  }
  return lines.filter((l) => l.length);
}
