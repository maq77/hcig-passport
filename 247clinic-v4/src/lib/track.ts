/* Conversion events with the brief's names (section 37). Fire and forget: every
   link works with tracking blocked. Delegated from one listener in <Tracker />,
   so links only carry data attributes: data-ev, data-placement. */

export type EventName =
  | "whatsapp_medical_click"
  | "whatsapp_insurance_click"
  | "phone_click"
  | "clinic_view"
  | "clinic_directions_click"
  | "b2b_form_submit"
  | "find_clinic_click";

type Params = Record<string, string | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    hcigTrack?: (name: string, params: Params) => void;
  }
}

export function track(name: EventName, params: Params = {}) {
  try {
    const p = { page: typeof location !== "undefined" ? location.pathname : "", ...params };
    window.hcigTrack?.(name, p);
    window.gtag?.("event", name, p);
    (window.dataLayer ||= []).push({ event: name, ...p });
  } catch {
    /* tracking never blocks a patient */
  }
}
