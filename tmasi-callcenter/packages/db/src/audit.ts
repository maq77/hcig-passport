import { getDb } from "./client.ts";
import { auditLog } from "./schema.ts";

/** Append one row to audit_log. actor null means the system or the agent. */
export async function writeAudit(
  actor: string | null,
  action: string,
  entity: string,
  id: string | null,
  before: unknown,
  after: unknown,
): Promise<void> {
  const db = await getDb();
  await db.insert(auditLog).values({
    actorUserId: actor,
    action,
    entity,
    entityId: id,
    before: before ?? null,
    after: after ?? null,
  });
}
