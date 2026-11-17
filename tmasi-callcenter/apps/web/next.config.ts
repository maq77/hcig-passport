import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import { resolve } from "node:path";

// One .env.local for the whole monorepo, at tmasi-callcenter/.env.local.
// Next only reads .env files from apps/web, so load the monorepo root here before anything else runs.
loadEnvConfig(resolve(import.meta.dirname, "..", ".."), process.env.NODE_ENV !== "production", console, true);

const config: NextConfig = {
  transpilePackages: ["@tc/core", "@tc/db", "@tc/voice", "@tc/llm", "@tc/kb", "@tc/evals"],
  serverExternalPackages: ["@electric-sql/pglite", "@huggingface/transformers", "argon2", "onnxruntime-node", "sharp"],
};

export default config;
