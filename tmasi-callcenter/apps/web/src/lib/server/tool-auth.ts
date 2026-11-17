import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dataDir } from "@tc/db";
import { HttpError } from "./http.ts";

let cached: { dir: string; secret: string } | null = null;

/** Secret for tool tokens: AUTH_SECRET, else a random one kept in <data>/tool-secret (created on first use). */
function secret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const dir = dataDir();
  if (cached?.dir === dir) return cached.secret;
  const f = join(dir, "tool-secret");
  let s: string;
  if (existsSync(f)) s = readFileSync(f, "utf8").trim();
  else {
    mkdirSync(dir, { recursive: true });
    s = randomBytes(32).toString("hex");
    writeFileSync(f, s + "\n");
  }
  cached = { dir, secret: s };
  return s;
}

/** Per-call tool token: HMAC of the call id. Unforgeable without the secret, valid only for that call. */
export function mintToolToken(callId: string): string {
  return createHmac("sha256", secret()).update(`tool:${callId}`).digest("hex");
}

export function verifyToolToken(callId: string, token: unknown): boolean {
  if (typeof token !== "string" || token.length === 0) return false;
  const want = Buffer.from(mintToolToken(callId));
  const got = Buffer.from(token);
  return want.length === got.length && timingSafeEqual(want, got);
}

/** Throws HttpError 403 when the token does not belong to the call. */
export function requireToolToken(callId: unknown, token: unknown): string {
  if (typeof callId !== "string" || callId.length === 0) throw new HttpError(400, "callId is required");
  if (!verifyToolToken(callId, token)) throw new HttpError(403, "Invalid tool token", { say: "Sorry, I could not save that. Please carry on." });
  return callId;
}
