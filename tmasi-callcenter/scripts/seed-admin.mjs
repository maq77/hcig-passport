// npm run seed:admin: create or update the admin user. ADMIN_EMAIL and ADMIN_PASSWORD from env or args:
//   npm run seed:admin -- you@example.com "password" ["Display name"]
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { getDb, closeDb, users, lockHolder, dataDir, pgDir } from "@tc/db";
import { join } from "node:path";

const [aEmail, aPass, aName] = process.argv.slice(2);
const email = (process.env.ADMIN_EMAIL ?? aEmail ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? aPass ?? "";
const displayName = process.env.ADMIN_NAME ?? aName ?? email.split("@")[0];

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (env) or pass them as arguments.");
  process.exit(1);
}
const holder = lockHolder(join(dataDir(), "pg.lock"));
if (holder !== null) {
  console.error(`The database folder (${pgDir()}) is in use by process ${holder}. Stop it and run again.`);
  process.exit(1);
}

const pwHash = await argon2.hash(password, { type: argon2.argon2id });
const db = await getDb();
const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
if (existing) {
  await db.update(users).set({ pwHash, role: "admin", displayName }).where(eq(users.id, existing.id));
  console.log(`Updated admin ${email}`);
} else {
  await db.insert(users).values({ email, pwHash, role: "admin", displayName });
  console.log(`Created admin ${email}`);
}
await closeDb();
