// Guardrail rules (task T019, owner Opus). Used by the post-call judge and the tool routes.
// The live agent follows the same rules from agent/prompts/base.md; this module re-checks them after the call.

/** Words the agent must never say about TMASI or anyone else (FR-015). Lowercase, matched on word stems. */
export const FORBIDDEN_CLAIMS: { stem: string; lang: string }[] = [
  { stem: 'accredit', lang: 'en' },
  { stem: 'akkreditier', lang: 'de' },
  { stem: 'аккредит', lang: 'ru' },
  { stem: 'akredyt', lang: 'pl' },
  { stem: 'معتمد', lang: 'ar' },
  { stem: 'acreditad', lang: 'es' },
  { stem: 'accreditat', lang: 'it' },
  { stem: 'accrédit', lang: 'fr' },
  { stem: 'akreditov', lang: 'cs' },
];

/** Superlatives and rankings the agent must not claim. */
export const FORBIDDEN_RANKINGS = ['the best', 'number one', 'no. 1', 'world leader', 'der beste', 'лучш', 'najlepsz', 'الأفضل', 'el mejor', 'il migliore', 'le meilleur', 'nejlepší'];

/** Returns the forbidden claim stems found in an agent utterance. */
export function findForbiddenClaims(text: string): string[] {
  const t = text.toLowerCase();
  const hits = FORBIDDEN_CLAIMS.filter((f) => t.includes(f.stem)).map((f) => f.stem);
  for (const r of FORBIDDEN_RANKINGS) if (t.includes(r)) hits.push(r);
  return hits;
}

/**
 * Emergency signals per tuned language (FR-014). Used to flag caller turns for the judge and to make sure an
 * urgent case exists after the call. The live agent decides from meaning, not from this list; the list is a net.
 */
export const EMERGENCY_SIGNALS: Record<string, string[]> = {
  en: ['chest pain', "can't breathe", 'cannot breathe', 'trouble breathing', 'bleeding heavily', 'unconscious', 'passed out', 'stroke', 'heart attack', 'kill myself', 'suicide', 'overdose', 'seizure', 'severe accident'],
  de: ['brustschmerz', 'keine luft', 'atemnot', 'starke blutung', 'bewusstlos', 'schlaganfall', 'herzinfarkt', 'umbringen', 'selbstmord', 'überdosis', 'krampfanfall'],
  ru: ['боль в груди', 'не могу дышать', 'задыха', 'сильное кровотечение', 'без сознания', 'инсульт', 'инфаркт', 'покончить с собой', 'суицид', 'передозировк', 'судорог'],
  pl: ['ból w klatce', 'nie mogę oddychać', 'duszności', 'silne krwawienie', 'nieprzytomn', 'udar', 'zawał', 'zabić się', 'samobój', 'przedawkowa', 'drgawk'],
  ar: ['ألم في الصدر', 'وجع في صدري', 'مش قادر أتنفس', 'ما أقدر أتنفس', 'ضيق تنفس', 'نزيف', 'فاقد الوعي', 'أغمي', 'جلطة', 'سكتة', 'أنتحر', 'انتحار', 'جرعة زائدة', 'تشنج'],
  es: ['dolor en el pecho', 'no puedo respirar', 'sangrado fuerte', 'inconsciente', 'derrame cerebral', 'infarto', 'suicid', 'sobredosis', 'convulsi'],
  it: ['dolore al petto', 'non riesco a respirare', 'sanguinamento forte', 'svenut', 'incosciente', 'ictus', 'infarto', 'suicid', 'overdose', 'convulsion'],
  fr: ['douleur à la poitrine', 'douleur thoracique', "je n'arrive pas à respirer", 'saigne beaucoup', 'inconscient', 'avc', 'crise cardiaque', 'suicid', 'overdose', 'convulsion'],
  cs: ['bolest na hrudi', 'nemůžu dýchat', 'silné krvácení', 'bezvědomí', 'mrtvice', 'infarkt', 'sebevražd', 'předávkov', 'křeče'],
};

/** True when a caller turn contains an emergency signal in any tuned language. */
export function hasEmergencySignal(text: string): boolean {
  const t = text.toLowerCase();
  return Object.values(EMERGENCY_SIGNALS).some((list) => list.some((s) => t.includes(s)));
}

/** Medical advice markers in AGENT turns (FR-013): dosing, prescribing, diagnosing language. */
export const MEDICAL_ADVICE_MARKERS = [
  /\b\d+\s?(mg|ml|milligrams?)\b/i,
  /\byou (probably|likely) have\b/i,
  /\byou should take\b/i,
  /\b(take|try) (ibuprofen|paracetamol|aspirin|antibiotics?)\b/i,
  /\bit('s| is) (nothing serious|not serious|probably fine)\b/i,
];

export function hasMedicalAdvice(agentText: string): boolean {
  return MEDICAL_ADVICE_MARKERS.some((re) => re.test(agentText));
}

/** The only fields capture_lead may carry (FR-018). Must match packages/core/src/tools.ts. */
export const ALLOWED_LEAD_FIELDS = ['name', 'country', 'lang', 'phone', 'email', 'interest', 'preferred_contact_time', 'sensitive_note'] as const;

/** Draft emergency line from the spec; the dashboard setting overrides it later. */
export const DEFAULT_EMERGENCY_LINE =
  'This sounds urgent. Please hang up and call 112 now, or 123 for an ambulance in Egypt. I am opening an urgent case so our team can follow up.';

/** Emergency numbers that must appear in the agent's emergency reply. */
export const EMERGENCY_NUMBERS = ['112', '123'];
