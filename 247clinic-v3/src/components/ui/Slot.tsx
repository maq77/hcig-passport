/* Server-side: a design slot that becomes the user's design as soon as the file
   exists in public/slots (docs/247clinic-v3-design-slots.md). */
import fs from "node:fs";
import path from "node:path";
import { asset } from "@/data/facts";
import { DesignSlot } from "./Bits";

export function slotFile(file: string): string | null {
  return fs.existsSync(path.join(process.cwd(), "public", "slots", file)) ? asset(`/slots/${file}`) : null;
}

export function Slot({ file, purpose, px, alt = "", className = "", ratio }: {
  file: string; purpose: string; px: string; alt?: string; className?: string; ratio?: string;
}) {
  const src = slotFile(file);
  if (src) {
    const [w, h] = px.split(" x ").map(Number);
    return <img className={`slot-img ${className}`} src={src} alt={alt} width={w} height={h} loading="lazy" style={ratio ? { aspectRatio: ratio } : undefined} />;
  }
  return <DesignSlot purpose={purpose} px={px} className={className} />;
}
