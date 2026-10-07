// Words v3 adds on top of the live tmasi.net text, per language.
// English: approved by Mohamed on 2026-09-28. German, Polish, Spanish: translated by Claude, to be
// cross-checked by Gemini (Mohamed's decision for now). Where the live site already says it, the
// live words are used instead (see site.ts): button labels, "Read more", "Blog", the quote sentence.

export type Lang = "en" | "de" | "pl" | "es";

export type Ui = {
  langName: string;
  stats: [string, string, string, string];
  hubsTitle: string;
  /** His two lines for the hubs map (approved 2026-10-07). */
  hubsGuests: string;
  hubsCare: string;
  quickLinks: string;
  viewDetails: string;
  viewAllNews: string;
  readMore: string;
  latestNews: string;
  showMore: string;
  showLess: string;
  partnerTitle: string;
  partnerText: string;
  getInTouch: string;
  thankYou: string;
  sending: string;
  errorBefore: string;
  errorAfter: string;
  messageReceived: string;
  close: string;
  openMenu: string;
  closeMenu: string;
  onSocial: string;
  copyright: string;
  poweredBy: string;
  language: string;
};

export const UI: Record<Lang, Ui> = {
  en: {
    langName: "English",
    stats: ["Cases Handled", "Medical Repatriations", "Operational Desk", "Global Hubs"],
    hubsTitle: "Global Operational Hubs",
    hubsGuests: "Guests from anywhere",
    hubsCare: "Medical care and a holiday, anywhere in the world",
    quickLinks: "Quick Links",
    viewDetails: "View Details",
    viewAllNews: "View All News",
    readMore: "Read more",
    latestNews: "Latest News & Updates",
    showMore: "Show More",
    showLess: "Show Less",
    partnerTitle: "Ready to partner with TMASI Global?",
    partnerText: "Join our network of international insurers, corporations, and travel agencies today.",
    getInTouch: "Get in Touch",
    thankYou: "Thank you!",
    sending: "Sending",
    errorBefore: "Something went wrong. Please try again, or",
    errorAfter: "on WhatsApp.",
    messageReceived: "We have received your message.",
    close: "Close",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    onSocial: "TMASI Global on",
    copyright: "TMASI Global. Part of Healthcare International Group.",
    poweredBy: "Powered by",
    language: "Language",
  },
  de: {
    langName: "Deutsch",
    stats: ["Betreute Fälle", "Medizinische Rückführungen", "Einsatzzentrale", "Globale Standorte"],
    hubsTitle: "Globale Einsatzzentralen",
    hubsGuests: "Gäste von überall",
    hubsCare: "Medizinische Versorgung und Urlaub, überall auf der Welt",
    quickLinks: "Schnellzugriff",
    viewDetails: "Details ansehen",
    viewAllNews: "Alle Neuigkeiten",
    readMore: "Weiterlesen",
    latestNews: "Neuigkeiten & Updates",
    showMore: "Mehr anzeigen",
    showLess: "Weniger anzeigen",
    partnerTitle: "Bereit für eine Partnerschaft mit TMASI Global?",
    partnerText: "Werden Sie noch heute Teil unseres Netzwerks aus internationalen Versicherern, Unternehmen und Reisebüros.",
    getInTouch: "Kontakt aufnehmen",
    thankYou: "Vielen Dank!",
    sending: "Wird gesendet",
    errorBefore: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder",
    errorAfter: "über WhatsApp.",
    messageReceived: "Wir haben Ihre Nachricht erhalten.",
    close: "Schließen",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    onSocial: "TMASI Global auf",
    copyright: "TMASI Global. Teil der Healthcare International Group.",
    poweredBy: "Powered by",
    language: "Sprache",
  },
  pl: {
    langName: "Polski",
    stats: ["Obsłużone sprawy", "Repatriacje medyczne", "Centrum operacyjne", "Globalne biura"],
    hubsTitle: "Globalne centra operacyjne",
    hubsGuests: "Goście z całego świata",
    hubsCare: "Opieka medyczna i wakacje, w dowolnym miejscu na świecie",
    quickLinks: "Szybkie linki",
    viewDetails: "Zobacz szczegóły",
    viewAllNews: "Wszystkie aktualności",
    readMore: "Czytaj więcej",
    latestNews: "Najnowsze wiadomości i aktualności",
    showMore: "Pokaż więcej",
    showLess: "Pokaż mniej",
    partnerTitle: "Gotowi na współpracę z TMASI Global?",
    partnerText: "Dołącz już dziś do naszej sieci międzynarodowych ubezpieczycieli, firm i biur podróży.",
    getInTouch: "Skontaktuj się",
    thankYou: "Dziękujemy!",
    sending: "Wysyłanie",
    errorBefore: "Coś poszło nie tak. Spróbuj ponownie lub",
    errorAfter: "przez WhatsApp.",
    messageReceived: "Otrzymaliśmy Twoją wiadomość.",
    close: "Zamknij",
    openMenu: "Otwórz menu",
    closeMenu: "Zamknij menu",
    onSocial: "TMASI Global na",
    copyright: "TMASI Global. Część Healthcare International Group.",
    poweredBy: "Powered by",
    language: "Język",
  },
  es: {
    langName: "Español",
    stats: ["Casos atendidos", "Repatriaciones médicas", "Centro de operaciones", "Sedes globales"],
    hubsTitle: "Centros operativos globales",
    hubsGuests: "Huéspedes de cualquier lugar",
    hubsCare: "Atención médica y vacaciones, en cualquier lugar del mundo",
    quickLinks: "Enlaces rápidos",
    viewDetails: "Ver detalles",
    viewAllNews: "Ver todas las noticias",
    readMore: "Leer más",
    latestNews: "Últimas Noticias y Actualizaciones",
    showMore: "Mostrar más",
    showLess: "Mostrar menos",
    partnerTitle: "¿Listo para asociarse con TMASI Global?",
    partnerText: "Únase hoy a nuestra red de aseguradoras internacionales, empresas y agencias de viajes.",
    getInTouch: "Contáctenos",
    thankYou: "¡Gracias!",
    sending: "Enviando",
    errorBefore: "Algo salió mal. Inténtelo de nuevo o",
    errorAfter: "por WhatsApp.",
    messageReceived: "Hemos recibido su mensaje.",
    close: "Cerrar",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    onSocial: "TMASI Global en",
    copyright: "TMASI Global. Parte de Healthcare International Group.",
    poweredBy: "Powered by",
    language: "Idioma",
  },
};

// The thank-you sentence after a quote request: each language's own live words, lifted from its
// "Request My Free Quote" paragraph (only the first letter capitalised).
export const QUOTE_THANKS: Record<Lang, string> = {
  en: "Our team will get in touch with a customized solution to support your tourists on the move.",
  de: "Unser Team meldet sich mit einer individuell zugeschnittenen Lösung zur optimalen Betreuung Ihrer Reisenden.",
  pl: "Nasz zespół skontaktuje się z Tobą, oferując indywidualnie dopasowane rozwiązanie dla optymalnej opieki nad podróżnymi.",
  es: "Nuestro equipo se pondrá en contacto con usted con una solución personalizada para brindar el mejor apoyo a sus viajeros.",
};
