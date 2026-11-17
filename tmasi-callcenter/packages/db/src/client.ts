import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.ts";
import { acquireLock } from "./lock.ts";

/** Monorepo root: packages/db/src -> three levels up. */
export const MONOREPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** DATA_DIR (a folder that holds pg/, kb/, recordings/) or <monorepo>/data. */
export function dataDir(): string {
  return process.env.DATA_DIR ? resolve(process.env.DATA_DIR) : join(MONOREPO_ROOT, "data");
}

export function pgDir(): string {
  return join(dataDir(), "pg");
}

export type Db = PgliteDatabase<typeof schema>;
interface Cache {
  client: PGlite;
  db: Db;
}

// One PGlite instance per process, kept on globalThis so Next dev hot reloads do not open it twice.
const KEY = Symbol.for("tc.db");
const g = globalThis as unknown as Record<symbol, Cache | Promise<Cache> | undefined>;

async function open(): Promise<Cache> {
  const dir = pgDir();
  acquireLock(join(dataDir(), "pg.lock"));
  mkdirSync(dirname(dir), { recursive: true });
  const client = await PGlite.create({ dataDir: dir, extensions: { vector } });
  await client.exec("CREATE EXTENSION IF NOT EXISTS vector");
  return { client, db: drizzle({ client, schema }) };
}

/** Lazy singleton. Await it once per request or script. */
export async function getDb(): Promise<Db> {
  let c = g[KEY];
  if (!c) {
    c = open();
    g[KEY] = c;
  }
  return (await c).db;
}

export async function getClient(): Promise<PGlite> {
  await getDb();
  return (await g[KEY]!).client;
}

export async function closeDb(): Promise<void> {
  const c = g[KEY];
  if (!c) return;
  g[KEY] = undefined;
  await (await c).client.close();
}

export function dbExists(): boolean {
  return existsSync(pgDir());
}
