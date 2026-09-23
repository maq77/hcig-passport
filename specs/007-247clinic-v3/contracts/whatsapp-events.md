# Contract: WhatsApp, phone and tracking events

## Numbers (stated by the user, 2026-09-23)

- WhatsApp and phone: **+20 122 222 8247**
- WhatsApp link: `https://wa.me/201222228247?text={encoded message}`
- Call link: `tel:+201222228247`

## Which message each action sends

| Where | Context key (data-model.md) | Event |
|---|---|---|
| Header, floating, sticky bar, home hero, home section CTAs | `homepage` | `whatsapp_medical_click` |
| Insurance section and page ("Check Your Insurance on WhatsApp", "Check Your Insurance", "Check Cashless Treatment", "Send Your Insurance Details on WhatsApp", all brief labels) | `insurance` | `whatsapp_insurance_click` |
| Hotel clinic page, "WhatsApp This Clinic" on a clinic card | `hotel` with the hotel name | `whatsapp_medical_click` |
| Destination page | `destination` with the destination name | `whatsapp_medical_click` |
| Contact page, other inner pages | `general` | `whatsapp_medical_click` |
| B2B pages | `general` (a B2B line is not in the brief; listed in gaps) | `whatsapp_medical_click` |

## Events (brief section 37, exact names)

| Event | When | Parameters |
|---|---|---|
| `whatsapp_medical_click` | any medical WhatsApp link | `placement`, `page`, `hotel`, `destination` |
| `whatsapp_insurance_click` | insurance WhatsApp link | `placement`, `page` |
| `phone_click` | any `tel:` link | `placement`, `page` |
| `clinic_view` | hotel clinic page load | `hotel`, `destination` |
| `clinic_directions_click` | Directions link | `hotel`, `destination` |
| `b2b_form_submit` | B2B form handed off | `form` (`hotel` or `insurer` or `general`) |
| `find_clinic_click` | a Find Your Clinic button | `placement`, `page` |

`placement` values: `header`, `hero`, `section-{id}`, `floating`, `sticky`, `card`, `footer`.

Delivery: HCIG first-party tracker now; GA4 through Consent Mode when an ID exists.
Every link works with tracking blocked (plain `href`, events are fire-and-forget).
