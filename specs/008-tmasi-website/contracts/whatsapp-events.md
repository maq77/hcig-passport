# Contract: Tracking Events & Communication Channels

Specifies event triggers, communication touchpoints, and analytics telemetry for TMASI Global v2 and v3.

## 1. Sofia Interactive Assistant

The site uses Sofia, an embedded JotForm AI conversational agent.

- Desktop Display: Anchored bottom-right corner.
- Mobile Display: Minimized trigger badge. Must not obscure primary navigation, emergency contact pills, or cookie consent banners.
- Script Source: `https://form.jotform.com/static/feedback2.js`.
- Event Hook: `sofia_chat_opened`, `sofia_interaction_started`.

## 2. Direct Emergency Call Touchpoints

Direct telephone links trigger dedicated analytics conversions.

| Element | Target Number | Event Name | Payload |
|---|---|---|---|
| Header Call Button | `+20 2 2414 4444` | `phone_click_header` | `{ location: "header", channel: "voice" }` |
| Emergency Banner Pill | `+20 100 000 0000` | `phone_click_emergency` | `{ location: "emergency_strip", channel: "hotline" }` |
| Office Local Line | Respective office number | `phone_click_office` | `{ location: "office_card", office_id: "{id}" }` |

## 3. WhatsApp Direct Routing

Where visitors initiate WhatsApp communication:

- Universal URL Format:
  `https://wa.me/{number}?text={encoded_message}`
- Localized Prefilled Messages:
  - English: `Hello TMASI Global, I require assistance for a patient.`
  - German: `Guten Tag TMASI Global, ich benötige Unterstützung für einen Patienten.`
  - Polish: `Dzień dobry TMASI Global, potrzebuję pomocy medycznej.`
  - Spanish: `Hola TMASI Global, requiero asistencia médica para un paciente.`
- Event Tracking:
  - Event Name: `whatsapp_click`
  - Parameters: `{ language: "{lang}", page: "{page_slug}", source: "{source_placement}" }`

## 4. Institutional Quote Request Form

For travel insurers, tour operators, and corporate partners:

- Form Fields: Company Name, Contact Name, Corporate Email, Phone Number, Service Required, Country of Origin, Destination.
- Client-Side Validation: Real-time validation without third-party form builders.
- Event Trigger: `partner_quote_requested`.
