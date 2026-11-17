import { ZodError } from "zod";
import { MissingApiKeyError } from "@tc/voice";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

/** Turn any thrown value into a JSON response. Never leaks stack traces. */
export function errorResponse(e: unknown): Response {
  if (e instanceof HttpError) return json({ ok: false, error: e.message, ...e.extra }, e.status);
  if (e instanceof MissingApiKeyError) return json({ ok: false, error: e.message, code: e.code }, 503);
  if (e instanceof ZodError) {
    const msg = e.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ");
    return json({ ok: false, error: msg, say: "Sorry, I could not save that. Please carry on." }, 400);
  }
  const message = e instanceof Error ? e.message : String(e);
  console.error("[api]", message);
  return json({ ok: false, error: message }, 500);
}

/** Parse a JSON object body. Throws HttpError 400 on bad JSON or a non-object. */
export async function readJsonObject(req: Request): Promise<Record<string, unknown>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "Body must be JSON");
  }
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) throw new HttpError(400, "Body must be a JSON object");
  return raw as Record<string, unknown>;
}

/** Wrap a handler so every error becomes a JSON response. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>): (...args: A) => Promise<Response> {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      return errorResponse(e);
    }
  };
}
