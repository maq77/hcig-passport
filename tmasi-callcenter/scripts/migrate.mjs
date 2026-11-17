// Generates migrations from the Drizzle schema (no-op when nothing changed), then applies them.
// Refuses to run while another process (the dev server) holds the data folder.
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/pglite/migrator";
import { getDb, closeDb, dataDir, lockHolder, pgDir } from "@tc/db";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const holder = lockHolder(join(dataDir(), "pg.lock"));
if (holder !== null) {
  console.error(
    `Cannot migrate: the database folder (${pgDir()}) is in use by process ${holder}, probably the dev server. ` +
      `Stop it and run "npm run migrate" again.`,
  );
  process.exit(1);
}

const gen = spawnSync(process.execPath, [join(root, "node_modules", "drizzle-kit", "bin.cjs"), "generate"], { cwd: root, stdio: "inherit" });
if (gen.status !== 0) {
  console.error("drizzle-kit generate failed");
  process.exit(gen.status ?? 1);
}

const db = await getDb();
await migrate(db, { migrationsFolder: join(root, "packages", "db", "drizzle") });
console.log(`Migrations applied to ${pgDir()}`);
await closeDb();
