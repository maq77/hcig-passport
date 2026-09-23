/* WhatsApp and call links. Messages are the brief's own (sections 5 and 38),
   see specs/007-247clinic-v3/contracts/whatsapp-events.md. */
import { PHONE } from "@/data/facts";

export const WA_MESSAGES = {
  homepage: "Hello, I need medical assistance through the 24/7 Clinic website.",
  general: "Hello, I need medical assistance. I am currently staying at [Hotel Name / Location].",
  insurance: "Hello, I need medical assistance and would like to check whether my travel insurance can be used for cashless treatment.",
  hotel: "Hello, I am staying at [Hotel Name] and need medical assistance.",
  destination: "Hello, I am in [Destination] and need medical assistance.",
} as const;

export type WaContext = keyof typeof WA_MESSAGES;

export function waHref(ctx: WaContext = "homepage", fill?: { hotel?: string; destination?: string }) {
  let text: string = WA_MESSAGES[ctx];
  if (fill?.hotel) text = text.replace("[Hotel Name]", fill.hotel);
  if (fill?.destination) text = text.replace("[Destination]", fill.destination);
  return `https://wa.me/${PHONE.wa}?text=${encodeURIComponent(text)}`;
}

export const telHref = `tel:${PHONE.tel}`;
