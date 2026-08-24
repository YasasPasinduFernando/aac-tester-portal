import { describe, expect, it } from "vitest";
import { decideCleanup, runCleanup } from "../src/cleanup";
import type { TesterRecord } from "../src/store";

function tester(patch: Partial<TesterRecord>): TesterRecord {
  return {
    id: "1",
    email: "stale@example.com",
    status: "eligible",
    requested_at: "2026-01-01T00:00:00.000Z",
    last_verified_at: "2026-01-02T00:00:00.000Z",
    last_download_check_at: null,
    last_website_activity_at: "2026-01-03T00:00:00.000Z",
    installed_confirmed_at: null,
    removed_at: null,
    error_message: null,
    ...patch,
  };
}

const now = new Date("2026-08-24T00:00:00.000Z");

describe("cleanup logic", () => {
  it("does nothing when auto-removal is disabled", () => {
    const decision = decideCleanup({
      tester: tester({}),
      now,
      inactivityDays: 90,
      enableAutoRemoval: false,
      stillMember: true,
    });
    expect(decision.action).toBe("none");
  });

  it("does not remove a tester merely because they have not visited the website", () => {
    const decision = decideCleanup({
      tester: tester({
        last_website_activity_at: "2026-01-01T00:00:00.000Z",
        last_verified_at: now.toISOString(),
        installed_confirmed_at: null,
      }),
      now,
      inactivityDays: 90,
      enableAutoRemoval: true,
      stillMember: true,
    });
    expect(decision.action).toBe("none");
  });

  it("marks a tester removed only when Google confirms they left the group", () => {
    const decision = decideCleanup({
      tester: tester({ status: "eligible" }),
      now,
      inactivityDays: 90,
      enableAutoRemoval: false,
      stillMember: false,
    });
    expect(decision.action).toBe("mark_removed");
  });

  it("never claims a Play download happened", async () => {
    const removed: string[] = [];
    await runCleanup({
      testers: [tester({ last_download_check_at: null })],
      now,
      inactivityDays: 90,
      enableAutoRemoval: false,
      checkMember: async () => true,
      removeMember: async (email) => {
        removed.push(email);
        return true;
      },
      markRemoved: async () => undefined,
    });
    expect(removed).toHaveLength(0);
  });
});
