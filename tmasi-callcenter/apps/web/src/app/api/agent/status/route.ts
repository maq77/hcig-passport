import { eq } from "drizzle-orm";
import { agentVersions, getDb } from "@tc/db";
import { readAgentId } from "../../../../lib/server/agent-id.ts";
import { handle, json } from "../../../../lib/server/http.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Is the agent set up, and which version is live. Used by the pill on the start screen. */
export const GET = handle(async () => {
  let ready = false;
  try {
    readAgentId();
    ready = true;
  } catch {
    ready = false;
  }
  let version: string | null = null;
  try {
    const db = await getDb();
    const [row] = await db.select({ semver: agentVersions.semver }).from(agentVersions).where(eq(agentVersions.status, "live"));
    version = row?.semver ?? null;
  } catch {
    version = null;
  }
  return json({ ready, version });
});
