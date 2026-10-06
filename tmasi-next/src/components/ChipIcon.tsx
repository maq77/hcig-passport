import { asset } from "@/lib/asset";

// A line icon from an image file, painted in the one icon colour (2026-10-06: every icon navy, Mohamed's pick). The
// file is used as a stencil (CSS mask), so its own colour never shows; the colour comes from the surrounding text
// colour (`.lx-chip` sets navy). The icon files are single-colour line drawings on transparency, so nothing is lost.
export default function ChipIcon({ src, size = 30 }: { src: string; size?: number }) {
  const url = `url("${asset(src)}")`;
  return <span className="chip-icon" aria-hidden="true" style={{ width: size, height: size, WebkitMaskImage: url, maskImage: url }} />;
}
