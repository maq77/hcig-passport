import { handle, json } from "../../../lib/server/http.ts";
import { DEFAULT_LANG, pickPersona } from "../../../lib/server/personas.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The woman and the man persona of one line language, for the voice buttons: GET /api/personas?lang=de */
export const GET = handle(async (req: Request) => {
  const lang = new URL(req.url).searchParams.get("lang") || DEFAULT_LANG;
  const f = pickPersona(lang, "female");
  const m = pickPersona(lang, "male");
  return json({
    ok: true,
    lang,
    female: { label: f.label, displayName: f.display_name },
    male: { label: m.label, displayName: m.display_name },
  });
});
