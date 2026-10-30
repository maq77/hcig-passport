// Send a form to the lead endpoint on healthcareig.com (owner 2026-10-30: "Real sender now"). Every field with an id is
// sent with its label. The preview has no PHP, so it only shows the sent state. A sent form fires the "Request quote"
// Google Ads conversion, as the old site did. If the endpoint cannot be reached, the visitor's email app opens with the
// message filled in, so no lead is lost.
import { IS_PREVIEW, ROOT } from "@/lib/site";

const loaded = typeof performance !== "undefined" ? performance.now() : 0;
type W = Window & { gtag?: (...a: unknown[]) => void; ym?: (...a: unknown[]) => void };

export async function sendLead(form: HTMLFormElement, kind: string): Promise<boolean> {
  const fields: [string, string][] = [];
  for (const el of Array.from(form.elements) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[]) {
    if (!el.id || !("value" in el) || el.type === "submit") continue;
    const label = form.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() || el.id;
    fields.push([label, String(el.value || "").trim()]);
  }
  if (IS_PREVIEW) return true;
  const body = JSON.stringify({ kind, page: location.pathname, lang: document.documentElement.lang, t: Math.round(performance.now() - loaded), hp: (form.querySelector('input[name="website"]') as HTMLInputElement | null)?.value || "", fields });
  try {
    const r = await fetch(`${ROOT}/api/lead.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    const j = await r.json();
    if (!r.ok || !j.ok) throw new Error("lead");
    const w = window as W;
    w.gtag?.("event", "conversion", { send_to: "AW-17729597588/IFNNCKrYlMYbEJThkIZC" });
    w.gtag?.("event", "generate_lead", { form: kind });
    return true;
  } catch {
    const text = fields.map(([k, v]) => `${k}: ${v}`).join("\n");
    location.href = `mailto:partner@healthcareig.com?subject=${encodeURIComponent("HCIG website: " + kind)}&body=${encodeURIComponent(text)}`;
    return false;
  }
}
