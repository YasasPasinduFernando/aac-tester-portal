import { describe, expect, it } from "vitest";
import { decideMaintenance, runMaintenance } from "../src/cleanup";
import type { TesterRecord } from "../src/store";

function tester(patch: Partial<TesterRecord>): TesterRecord {
  return {
    id: "1",
    email: "stale@example.com",
    status: "requested",
    requested_at: "2026-01-01T00:00:00.000Z",
    group_join_started_at: null,
    play_join_started_at: null,
    feedback_submitted: 0,
    last_activity_at: "2026-01-03T00:00:00.000Z",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-03T00:00:00.000Z",
    membership_verified: 0,
    membership_verified_at: null,
    notes: null,
    google_email: null,
    google_subject_id: null,
    display_name: null,
    avatar_url: null,
    authenticated_at: null,
    ...patch,
  };
}

const now = new Date("2026-08-24T00:00:00.000Z");

describe("maintenance logic", () => {
  it("marks stale requests as needs_attention without removing anyone from Google Groups", () => {
    const decision = decideMaintenance({
      tester: tester({}),
      now,
      inactivityDays: 90,
    });
    expect(decision.action).toBe("needs_attention");
    expect(decision.nextStatus).toBe("needs_attention");
    expect(decision.reason).toContain("Not removed from Google Groups");
  });

  it("does not treat opened links as Play download proof", () => {
    const decision = decideMaintenance({
      tester: tester({
        status: "play_pending",
        group_join_started_at: now.toISOString(),
        play_join_started_at: now.toISOString(),
        last_activity_at: now.toISOString(),
      }),
      now,
      inactivityDays: 90,
    });
    expect(decision.action).toBe("none");
    expect(decision.reason).toContain("not proof");
  });

  it("never calls a Google Group removal path", async () => {
    const applied: string[] = [];
    await runMaintenance({
      testers: [tester({})],
      now,
      inactivityDays: 90,
      applyStatus: async (email, status) => {
        applied.push(`${email}:${status}`);
      },
    });
    expect(applied).toEqual(["stale@example.com:needs_attention"]);
  });
});
