// UI checks of /demo with every API mocked (no ElevenLabs, no Anthropic, no database).
import { expect, test, type Page } from "@playwright/test";

test.use({
  baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3017",
  // optional: run with an already installed Chromium when the bundled one is missing
  ...(process.env.E2E_CHROMIUM ? { launchOptions: { executablePath: process.env.E2E_CHROMIUM, args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] } } : {}),
});

const CALL_ID = "0197c0a0-0000-7000-8000-000000000001";
const sizes = [
  { name: "360", width: 360, height: 780 },
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
];

async function mock(page: Page) {
  await page.route("**/api/agent/status", (r) => r.fulfill({ json: { ready: true, version: "0.1.0" } }));
  await page.route("**/api/personas?*", (r) => r.fulfill({ json: { ok: true, female: { label: "EN_F", displayName: "Emma" }, male: { label: "EN_M", displayName: "James" } } }));
  await page.route("**/api/calls?*", (r) =>
    r.fulfill({
      json: {
        ok: true,
        calls: [{ id: CALL_ID, status: "imported", startedAt: new Date().toISOString(), durationS: 192, langsSeen: ["en", "ar"], hasCase: true, contactName: "Sara", interest: "Check-up in Hurghada", gapCount: 1 }],
      },
    }),
  );
  await page.route(`**/api/calls/${CALL_ID}`, (r) =>
    r.fulfill({
      json: {
        call: { id: CALL_ID, durationS: 192, csat: 5, langsSeen: ["en", "ar"], langDetected: "ar", recordingPath: null, startedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
        turns: [
          { idx: 0, role: "agent", text: "Hello, I'm Emma, the AI assistant of TMASI Global.", lang: "en", latencyMs: 600 },
          { idx: 1, role: "caller", text: "Yes, that's fine. I'm Sara.", lang: "en", latencyMs: null },
          { idx: 2, role: "caller", text: "عايزة أعمل check-up في الغردقة", lang: "ar", latencyMs: null },
          { idx: 3, role: "agent", text: "تمام يا سارة، فريقنا في الغردقة يقدر يرتّب لك check-up كامل.", lang: "ar", latencyMs: 800 },
        ],
        notes: [{ key: "dates", value: "Next month" }],
        contact: { name: "Sara", phoneE164: "+491701234521", email: null, country: "Germany" },
        case: { status: "new", interest: "Check-up in Hurghada", summaryEn: null },
        gaps: [{ id: "g1", question: "How much is a check-up?" }],
        judge: {
          status: "ok",
          result: {
            summary_en: "Sara from Germany wants a check-up in Hurghada next month.",
            summary_caller_lang: "سارة من ألمانيا عايزة تعمل check-up في الغردقة.",
            caller_main_lang: "ar",
            judge: { ai_disclosed: true, consent_asked: true, recording_consent: false, fact_ok: true, policy_ok: true, lang_ok: true, memory_ok: false, pass: false },
          },
        },
        personaStart: { label: "EN_F", displayName: "Emma" },
        personaEnd: { label: "EN_F", displayName: "Emma" },
        hasRecording: false,
      },
    }),
  );
}

for (const s of sizes) {
  test.describe(`viewport ${s.name}`, () => {
    test.use({ viewport: { width: s.width, height: s.height }, permissions: ["microphone"] });

    test("start screen", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" && !/favicon/i.test(m.text())) errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(String(e)));
      await mock(page);
      await page.goto("/demo");
      await expect(page.getByRole("button", { name: "Start call" })).toBeVisible();
      await expect(page.getByText("Agent ready · v0.1.0")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Things to try" })).toBeVisible();
      for (const t of ["Ask what TMASI does and where the offices are.", "Switch language during the call, for example from English to Arabic.", 'Say "Can I speak to a man?" to change the voice.', "Leave your name and phone, then listen for the read-back.", "Ask a price: it should offer a coordinator, never guess."]) {
        await expect(page.getByText(t)).toBeVisible();
      }
      await expect(page.getByRole("button", { name: "Woman · Emma" })).toHaveAttribute("aria-pressed", "true");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await page.screenshot({ path: `tests/e2e/screens/start-${s.name}.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    test("after screen from a recent call", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" && !/favicon/i.test(m.text())) errors.push(m.text());
      });
      await mock(page);
      await page.goto("/demo");
      await page.getByRole("button", { name: /Sara · Check-up in Hurghada/ }).click();
      await expect(page.getByText("Call ended · 03:12")).toBeVisible();
      await expect(page.getByText("No recording kept: the caller did not agree to recording.")).toBeVisible();
      await expect(page.getByText("+49 ··· ··· 21")).toBeVisible();
      await expect(page.getByText("Needs review").first()).toBeVisible();
      await expect(page.getByText('"How much is a check-up?"')).toBeVisible();
      await expect(page.getByRole("button", { name: "Start a new call" })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await page.waitForTimeout(900);
      await page.screenshot({ path: `tests/e2e/screens/after-${s.name}.png`, fullPage: true });
      expect(errors).toEqual([]);
    });
  });
}
