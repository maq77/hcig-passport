// One section template, two outputs. Every section is a function (ctx) => HTML string.
//   ctx.mode "canvas": Claude Design board markup ({{holes}}, onClick="{{fn}}", <sc-if>), state lives in the board's DCLogic.
//   ctx.mode "site":   plain HTML for the Next.js site; behaviour comes from src/runtime via data attributes.
// Same structure and class names in both, so the site copies the approved canvas exactly.

export function bind(ctx) {
  const canvas = ctx.mode === "canvas";
  return {
    canvas,
    // A class or attribute value that the board computes; the site gets its static default.
    hole: (name, siteValue = "") => (canvas ? `{{${name}}}` : siteValue),
    // A click action.
    on: (action) => (canvas ? `onClick="{{${action}}}"` : `data-action="${action}"`),
    // A block shown only when a state is on (menus, drawers). The site starts it hidden.
    when: (name, html, startOpen = false) =>
      canvas
        ? `<sc-if value="{{${name}}}" hint-placeholder-val="{{ ${startOpen} }}">${html}</sc-if>`
        : `<div data-when="${name}"${startOpen ? "" : " hidden"}>${html}</div>`,
    asset: (key) => ctx.asset(key),
    href: (path) => (canvas ? "#" : ctx.href(path)),
  };
}

// Escape text for HTML. Every content string passes through this.
export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Hairline icons (stroke 1.25 at 24 px, aria-hidden). One set for the whole site.
const P = {
  arrow: '<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9M12 3c-2.6 2.6-3.8 5.6-3.8 9s1.2 6.4 3.8 9"/>',
  chevron: '<path d="M7 10l5 5 5-5"/>',
  menu: '<path d="M4 9h16M4 15h16"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  facebook: '<path d="M14.5 3.5h-2a4 4 0 0 0-4 4v3h-2.5v3.5H8.5v6.5H12v-6.5h2.6l.6-3.5H12V8a1 1 0 0 1 1-1h2.5z"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M8 10.5v6M8 7.6v.1M11.5 16.5v-6M11.5 13c0-1.6 1-2.6 2.4-2.6s2.1 1 2.1 2.6v3.5"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7v.1"/>',
  headset: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19c0 1.4-1.6 2.5-4 2.5h-2"/>',
  telemed: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M10 10h4M12 8v4"/>',
  hotel: '<path d="M3.5 21V8.5L12 3.5l8.5 5V21"/><path d="M9.5 21v-5h5v5M8 11.5h2M14 11.5h2"/>',
  cross: '<path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6z"/>',
  hospital: '<rect x="4" y="3.5" width="16" height="17" rx="1.5"/><path d="M12 7v6M9 10h6M9.5 20.5v-4h5v4"/>',
  ambulance: '<path d="M3 16.5V8a1 1 0 0 1 1-1h10v9.5M14 10h4l3 3.2v3.3h-7"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/><path d="M8.5 9.5v3M7 11h3"/>',
  pill: '<path d="M10.5 20.5a5 5 0 0 1-7-7l7-7a5 5 0 0 1 7 7z"/><path d="M7 10l7 7"/>',
  plane: '<path d="M21 4.5c-.8-.8-2.2-.6-3 .2L14.5 8 6 6 4.5 7.5l6.5 3.5-3.5 3.5-3-.5L3 15.5l3.5 1.5 1.5 3.5 1.5-1.5-.5-3 3.5-3.5 3.5 6.5L18 17l-2-8.5 3.3-3.5c.8-.8 1-2.2.2-3z"/>',
  shield: '<path d="M12 3.5l7 3v5.5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6.5z"/><path d="M9 12l2 2 4-4"/>',
  language: '<path d="M3.5 5.5h9M8 3.5v2M5.5 5.5c.6 3 2.6 5.4 5.2 6.8M10.5 5.5c-.8 3.5-3 6.4-6 8"/><path d="M12.5 20.5l4-9 4 9M14 17.5h5"/>',
  leaf: '<path d="M5 19c0-8 5-13.5 14.5-14 0 9.5-5.5 14-14.5 14z"/><path d="M5 19l8.5-8.5"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5V3h6v1.5M9 11.5l2 2 4-4M9 17h6"/>',
  ownership: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20.5v-.5a7 7 0 0 1 9.5-6.5M15 18.5l2 2 4-4.5"/>',
  network: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><circle cx="12" cy="13" r="2"/><path d="M12 7v4M10.4 14.3l-4 2.5M13.6 14.3l4 2.5"/>',
  speed: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4.5-5.5"/><circle cx="12" cy="16" r="1.2"/>',
  standard: '<circle cx="12" cy="9" r="5.5"/><path d="M9 13.8L7.8 21l4.2-2.2 4.2 2.2-1.2-7.2"/><path d="M10 9l1.4 1.4L14 7.8"/>',
  growth: '<path d="M4 20.5h16M5.5 16l4.5-4.5 3 3 6-6.5M15 8h4.5v4.5"/>',
  control: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  embassy: '<path d="M3 20.5h18M5 20.5V10M19 20.5V10M9.5 20.5V10M14.5 20.5V10M3 10l9-6 9 6"/>',
  corporate: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18M11 13v2h2v-2"/>',
  speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  muted: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  play: '<path d="M8.5 5.5v13l10.5-6.5z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  phone: '<path d="M5.5 4h3.5l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3.5a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 4 5.5 1.5 1.5 0 0 1 5.5 4z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6 8.5-6"/>',
  whatsapp: '<path d="M20 12a8 8 0 0 1-11.7 7.1L4 20.5l1.4-4.2A8 8 0 1 1 20 12z"/><path d="M9.2 8.8c-.4 1 0 2.6 1.6 4.3 1.6 1.6 3.3 2 4.3 1.6l.6-1.4-1.9-1-.9.7a4.3 4.3 0 0 1-2-2l.7-.9-1-1.9z"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  traveller: '<circle cx="9.5" cy="4.5" r="2"/><path d="M9.5 7.5v6M6.5 21l3-7.5 3 7.5M9.5 9.5l-3 3"/><rect x="14" y="11" width="6" height="8" rx="1"/><path d="M16 11V9h2v2M15.5 19v2M18.5 19v2"/>',
  up: '<path d="M7 17L17 7M9 7h8v8"/>',
};
export const icon = (name, size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
