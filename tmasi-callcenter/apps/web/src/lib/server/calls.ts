import { eq } from "drizzle-orm";
import { z } from "zod";
import { calls, getDb } from "@tc/db";
import { HttpError } from "./http.ts";

const uuid = z.string().uuid();

export async function requireCall(callId: string) {
  if (!uuid.safeParse(callId).success) throw new HttpError(400, "callId must be a UUID");
  const db = await getDb();
  const [row] = await db.select().from(calls).where(eq(calls.id, callId));
  if (!row) throw new HttpError(404, "Unknown call");
  return row;
}

export const isUuid = (s: unknown): s is string => typeof s === "string" && uuid.safeParse(s).success;
