/* Green = WhatsApp, red = call and emergency (the user, 2026-09-23). */
import { ArrowRight, Phone } from "lucide-react";
import { WhatsAppGlyph } from "./Icon";
import { telHref, waHref, type WaContext } from "@/lib/wa";
import { PHONE } from "@/data/facts";
import type { EventName } from "@/lib/track";

type Common = { className?: string; placement: string; small?: boolean; block?: boolean };

export function WaButton({ children, ctx = "homepage", hotel, destination, className = "", placement, small, block }: Common & {
  children: React.ReactNode; ctx?: WaContext; hotel?: string; destination?: string;
}) {
  const ev: EventName = ctx === "insurance" ? "whatsapp_insurance_click" : "whatsapp_medical_click";
  return (
    <a href={waHref(ctx, { hotel, destination })} target="_blank" rel="noopener" data-ev={ev} data-placement={placement}
      className={`btn btn-wa ${small ? "btn-sm" : ""} ${block ? "btn-block" : ""} ${className}`}>
      <WhatsAppGlyph size={small ? 18 : 20} />
      <span>{children}</span>
    </a>
  );
}

export function CallButton({ placement, small, iconOnly, className = "" }: Common & { iconOnly?: boolean }) {
  return (
    <a href={telHref} data-ev="phone_click" data-placement={placement}
      className={`btn btn-call ${small || iconOnly ? "btn-sm" : ""} ${iconOnly ? "btn-icon" : ""} ${className}`}
      aria-label={iconOnly ? `Call ${PHONE.display}` : undefined}>
      <Phone size={18} aria-hidden="true" />
      {!iconOnly && <span>{PHONE.display}</span>}
    </a>
  );
}

export function LinkButton({ href, children, placement, ev, className = "" }: {
  href: string; children: React.ReactNode; placement: string; ev?: EventName; className?: string;
}) {
  return (
    <a href={href} data-ev={ev} data-placement={placement} className={`btn btn-secondary ${className}`}>
      <span>{children}</span>
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

export function TextLink({ href, children, placement, ev }: { href: string; children: React.ReactNode; placement: string; ev?: EventName }) {
  return (
    <a href={href} data-ev={ev} data-placement={placement} className="link">
      <span>{children}</span>
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}
