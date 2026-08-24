import { describe, expect, it } from "vitest";
import { submitFeedback } from "../src/feedback";
import { MemoryStore } from "./helpers";

describe("feedback submission", () => {
  it("stores private feedback without exposing it", async () => {
    const store = new MemoryStore();
    await store.upsertTester({
      id: "1",
      email: "caregiver@example.com",
      status: "requested",
      requested_at: "2026-08-24T10:00:00.000Z",
      group_join_started_at: null,
      play_join_started_at: null,
      feedback_submitted: 0,
      last_activity_at: "2026-08-24T10:00:00.000Z",
      created_at: "2026-08-24T10:00:00.000Z",
      updated_at: "2026-08-24T10:00:00.000Z",
      membership_verified: 0,
      membership_verified_at: null,
      notes: null,
    });
    const result = await submitFeedback({
      data: {
        email: "caregiver@example.com",
        feedbackType: "Accessibility",
        message: "The symbol for water is hard to find.",
      },
      now: new Date("2026-08-24T10:00:00.000Z"),
      store,
    });
    expect(result.ok).toBe(true);
    expect(store.feedback).toHaveLength(1);
    expect(store.feedback[0]?.email).toBe("caregiver@example.com");
    expect(result.message).toContain("saved privately");
    expect(store.testers.get("caregiver@example.com")?.feedback_submitted).toBe(1);
  });

  it("rejects short messages and invalid types", async () => {
    const store = new MemoryStore();
    const short = await submitFeedback({
      data: { email: "a@example.com", feedbackType: "Bug", message: "too short" },
      now: new Date(),
      store,
    });
    expect(short.ok).toBe(false);
    const type = await submitFeedback({
      data: { email: "a@example.com", feedbackType: "Praise", message: "This is a longer message." },
      now: new Date(),
      store,
    });
    expect(type.ok).toBe(false);
  });

  it("stores screenshots only when a bucket is provided", async () => {
    const store = new MemoryStore();
    const stored: string[] = [];
    const bucket = {
      put: async (key: string) => {
        stored.push(key);
      },
    } as unknown as R2Bucket;

    const skipped = await submitFeedback({
      data: {
        email: "a@example.com",
        feedbackType: "Bug",
        message: "The back button is too small on my phone.",
        screenshot: { bytes: new Uint8Array([1, 2, 3]), contentType: "image/png" },
      },
      now: new Date(),
      store,
    });
    expect(skipped.ok).toBe(true);
    expect(skipped.screenshotStored).toBe(false);

    const withBucket = await submitFeedback({
      data: {
        email: "a@example.com",
        feedbackType: "Bug",
        message: "The back button is too small on my phone.",
        screenshot: { bytes: new Uint8Array([1, 2, 3]), contentType: "image/png" },
      },
      now: new Date(),
      store,
      bucket,
    });
    expect(withBucket.screenshotStored).toBe(true);
    expect(stored).toHaveLength(1);
  });
});
