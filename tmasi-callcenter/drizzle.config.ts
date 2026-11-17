import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  driver: "pglite",
  schema: "./packages/db/src/schema.ts",
  out: "./packages/db/drizzle",
  dbCredentials: { url: process.env.DATA_DIR ? `${process.env.DATA_DIR}/pg` : "./data/pg" },
});
