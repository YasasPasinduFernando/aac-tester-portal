import type { TesterRecord } from "./store";

export interface CleanupDecision {
  email: string;
  action: "none" | "mark_removed" | "review" | "attempt_remove";
  reason: string;
}

/**
 * Cleanup is conservative by design.
 * Google Play does not report individual download events, so this never treats
 * "did not visit the website" as proof that a tester should be removed.
 */
export function decideCleanup(input: {
  tester: TesterRecord;
  now: Date;
  inactivityDays: number;
  enableAutoRemoval: boolean;
  stillMember: boolean | null;
}): CleanupDecision {
  const { tester } = input;

  if (input.stillMember === false && tester.status !== "removed") {
    return {
      email: tester.email,
      action: "mark_removed",
      reason: "Google Groups reported that this address is no longer a member.",
    };
  }

  if (!input.enableAutoRemoval) {
    return {
      email: tester.email,
      action: "none",
      reason: "Automatic removal is disabled.",
    };
  }

  const hasInstallSignal = Boolean(tester.installed_confirmed_at);
  const hasRecentVerification = isRecent(
    tester.last_verified_at,
    input.now,
    input.inactivityDays,
  );
  const hasRecentWebsite = isRecent(
    tester.last_website_activity_at,
    input.now,
    input.inactivityDays,
  );

  // Website absence alone is never enough. Require no install confirmation
  // AND stale verification before even flagging a record.
  if (hasInstallSignal || hasRecentVerification) {
    return {
      email: tester.email,
      action: "none",
      reason: "Observable participation or recent membership verification exists.",
    };
  }

  if (tester.status === "requested" && !hasRecentWebsite) {
    return {
      email: tester.email,
      action: "review",
      reason: "Stale request with no confirmed membership. Left for admin review; not removed from Google Groups.",
    };
  }

  if (input.stillMember && tester.status === "eligible") {
    return {
      email: tester.email,
      action: "attempt_remove",
      reason: "Auto-removal enabled, no install confirmation, and membership is stale. Mutation still depends on Workspace Admin SDK support.",
    };
  }

  return {
    email: tester.email,
    action: "none",
    reason: "No cleanup action.",
  };
}

function isRecent(value: string | null, now: Date, days: number): boolean {
  if (!value) return false;
  const then = Date.parse(value);
  if (Number.isNaN(then)) return false;
  return now.getTime() - then < days * 24 * 60 * 60 * 1000;
}

export async function runCleanup(input: {
  testers: TesterRecord[];
  now: Date;
  inactivityDays: number;
  enableAutoRemoval: boolean;
  checkMember: (email: string) => Promise<boolean | null>;
  removeMember: (email: string) => Promise<boolean>;
  markRemoved: (email: string, errorMessage: string | null) => Promise<void>;
}): Promise<CleanupDecision[]> {
  const decisions: CleanupDecision[] = [];
  for (const tester of input.testers) {
    const stillMember = await input.checkMember(tester.email);
    const decision = decideCleanup({
      tester,
      now: input.now,
      inactivityDays: input.inactivityDays,
      enableAutoRemoval: input.enableAutoRemoval,
      stillMember,
    });
    decisions.push(decision);

    if (decision.action === "mark_removed") {
      await input.markRemoved(tester.email, null);
    } else if (decision.action === "attempt_remove") {
      const removed = await input.removeMember(tester.email);
      if (removed) {
        await input.markRemoved(tester.email, null);
      }
    }
  }
  return decisions;
}
