/** "A coordinator will contact you soon." in the call language. Key is the base language (ar-EG and ar-AE both use ar). */
const SAY_SOON: Record<string, string> = {
  en: "A coordinator will contact you soon.",
  de: "Ein Koordinator wird sich bald bei Ihnen melden.",
  ru: "Координатор свяжется с вами в ближайшее время.",
  pl: "Koordynator skontaktuje się z Państwem wkrótce.",
  ar: "سيتواصل معك أحد المنسقين قريباً.",
  es: "Un coordinador se pondrá en contacto con usted pronto.",
  it: "Un coordinatore la contatterà presto.",
  fr: "Un coordinateur vous contactera bientôt.",
  cs: "Brzy se vám ozve koordinátor.",
};

export function baseLang(tag: string | null | undefined): string {
  return (tag ?? "en").split(/[-_]/)[0]!.toLowerCase();
}

export function saySoon(lang: string | null | undefined): string {
  return SAY_SOON[baseLang(lang)] ?? SAY_SOON.en!;
}

export const SAY_FAILED = "Sorry, I could not save that. Please carry on.";
