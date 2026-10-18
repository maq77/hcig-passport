# Contract: leads, consent and tracking events

## `POST /api/lead.php`

Form-encoded or JSON. One endpoint, three kinds.

| Field | enquiry | kit | newsletter | Rule |
|---|---|---|---|---|
| `type` | yes | yes | yes | `enquiry`, `kit`, `newsletter` |
| `name` | yes | yes | no | 2 to 120 characters |
| `company` | yes | yes | no | 2 to 160 characters |
| `email` | yes | yes | yes | Valid address |
| `phone` | optional | no | no | Digits, spaces, `+` |
| `partnerType` | optional | yes | optional | One of the six partner-type ids |
| `message` | optional | no | no | Up to 2,000 characters |
| `page`, `lang`, `source` | yes | yes | yes | Set by the page; `source` from UTM parameters |
| `website` | empty | empty | empty | Honeypot: anything here is dropped silently |
| `t` | yes | yes | yes | Milliseconds since the form rendered; under 2,500 is dropped |

Responses: `200 {"ok":true}` (kit adds `"kit":"/kit/<type>-<lang>.pdf"`), `400 {"ok":false,"field":"email"}`,
`429 {"ok":false,"retry":60}` (more than 5 posts a minute from one address), `500 {"ok":false}`. Messages shown to the
visitor are site words, approved like any new copy.

On success, in this order: email to partner@healthcareig.com (Reply-To the visitor; envelope sender
`website@healthcareig.com`); one CSV line in `~/hcig-private/leads.csv` (outside `public_html`); a `lead` event to the
HCIG tracking hub with no personal data (`site`, `leadType`, `partnerType`, `page`, `lang`, `source`); for `kit`, an
email with the PDF link; for `newsletter`, Brevo's double opt-in call. Config (Brevo key, hub token, addresses) is read
from `~/hcig-private/lead-config.php`. Nothing secret is in git.

## Consent

- Banner on first visit, every visitor: Accept all, Reject, Settings (Analytics, Marketing). Necessary storage only
  until a choice is made. The site works fully on Reject.
- Stored as first-party cookie `hcig_consent` = `v1|a=<0/1>|m=<0/1>|<unix time>`, 6 months; "Cookie settings" link in
  the footer reopens it.
- Google Consent Mode v2: default `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` = denied;
  updated on choice. Analytics = GA4 and Yandex Metrika (loaded only after a yes). Marketing = Google Ads and LinkedIn
  Insight (loaded only after a yes). Script ids never `gtag` or `ym` (use `hcig-*-init`).
- The HCIG hub counter runs in anonymous mode (no identifier stored) until analytics consent.

## Events

| Event | Fires when | Parameters | Sent to |
|---|---|---|---|
| `generate_lead` | Lead endpoint answers ok for `enquiry` | `partner_type`, `page`, `lang` | GA4 conversion, Ads conversion, LinkedIn, hub |
| `kit_download` | Kit form ok and the PDF link opens | `partner_type`, `lang` | GA4 conversion, Ads conversion, LinkedIn, hub |
| `sign_up` | Newsletter form ok | `lang`, `page` | GA4, hub |
| `contact_click` | Tap on a phone number or the partner email | `method` (`phone`, `email`), `location` | GA4, hub |
| `chat_open` | The JotForm agent opens | `page` | GA4 |
| `video_play` | Hero film or a testimonial starts | `video`, `page` | GA4 |
| `brand_click` | A link to a brand's own site | `brand` | GA4 (shows what HCIG sends each brand) |
| `language_switch` | Language menu used | `from`, `to` | GA4 |
| QR arrival | Event page opened with `utm_source=qr` | UTM fields | GA4, hub |

Conversion tracking is verified end to end (a test lead seen in GA4 DebugView, Ads, LinkedIn and the hub) before any
paid campaign starts.
