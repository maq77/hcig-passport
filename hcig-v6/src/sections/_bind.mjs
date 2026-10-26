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
};
export const icon = (name, size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
