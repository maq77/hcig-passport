import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const p = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@tc/core": p("./packages/core/src/index.ts"),
      "@tc/db": p("./packages/db/src/index.ts"),
      "@tc/voice": p("./packages/voice/src/index.ts"),
      "@tc/llm": p("./packages/llm/src/index.ts"),
      "@tc/kb": p("./packages/kb/src/index.ts"),
      "@tc/evals": p("./packages/evals/src/index.ts"),
    },
  },
  // each DB test file starts its own embedded Postgres and runs migrations; under a full parallel run that can pass 10 s
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node", hookTimeout: 60000, testTimeout: 30000 },
});
