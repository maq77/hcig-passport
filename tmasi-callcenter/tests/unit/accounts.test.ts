// Two ElevenLabs accounts: active account, manual switch, automatic switch when credits run low.
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

const dir = mkdtempSync(join(tmpdir(), "tc-acc-"));
process.env.DATA_DIR = dir;
process.env.ELEVENLABS_API_KEY = "key-one";
process.env.ELEVENLABS_API_KEY_2 = "key-two";
delete process.env.ELEVENLABS_ACTIVE_KEY;

const acc = await import("../../apps/web/src/lib/server/accounts.ts");

/** A fake subscription endpoint: credits left per key. */
const fakeFetch = (left: Record<string, number>) =>
  (async (_url: string, init?: { headers?: Record<string, string> }) => {
    const key = init?.headers?.["xi-api-key"] ?? "";
    return new Response(JSON.stringify({ character_count: 10_000 - (left[key] ?? 0), character_limit: 10_000 }), { status: 200 });
  }) as unknown as typeof fetch;

const writeAgent = (name: string) => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), JSON.stringify({ agentId: `agent_${name}` }));
};

beforeEach(() => {
  rmSync(join(dir, "active-account.json"), { force: true });
  rmSync(join(dir, "agent.json"), { force: true });
  rmSync(join(dir, "agent-2.json"), { force: true });
  acc.clearCreditCache();
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("accounts", () => {
  it("defaults to account 1 and follows a manual switch", async () => {
    expect(acc.activeAccount()).toBe("1");
    await acc.setActiveAccount("2", "test");
    expect(acc.activeAccount()).toBe("2");
  });

  it("stays on account 1 while it has enough credits", async () => {
    writeAgent("agent.json");
    writeAgent("agent-2.json");
    const r = await acc.accountForNewCall(fakeFetch({ "key-one": 4539, "key-two": 10_000 }));
    expect(r).toEqual({ account: "1", switched: false });
  });

  it("switches to account 2 when account 1 runs low, and remembers it", async () => {
    writeAgent("agent.json");
    writeAgent("agent-2.json");
    const r = await acc.accountForNewCall(fakeFetch({ "key-one": 900, "key-two": 10_000 }));
    expect(r.account).toBe("2");
    expect(r.switched).toBe(true);
    expect(acc.activeAccount()).toBe("2");
  });

  it("does not switch when account 2 has no agent or too few credits", async () => {
    writeAgent("agent.json");
    expect((await acc.accountForNewCall(fakeFetch({ "key-one": 900, "key-two": 10_000 }))).account).toBe("1");
    acc.clearCreditCache();
    writeAgent("agent-2.json");
    expect((await acc.accountForNewCall(fakeFetch({ "key-one": 900, "key-two": 500 }))).account).toBe("1");
  });

  it("finds each account's agent file", () => {
    writeAgent("agent.json");
    writeAgent("agent-2.json");
    expect(acc.agentIdFor("1")).toBe("agent_agent.json");
    expect(acc.agentIdFor("2")).toBe("agent_agent-2.json");
  });
});
