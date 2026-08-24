import { bothJoinLinksOpened } from "../../shared/types";
import { refreshStatus, type TesterRecord } from "./store";

export interface MaintenanceDecision {
  email: string;
  action: "none" | "needs_attention" | "recalculate";
  reason: string;
  nextStatus: TesterRecord["status"];
}

/**
 * Maintenance never removes people from Google Groups or Play.
 * Clicks are not treated as membership or download proof.
 */
export function decideMaintenance(input: {
  tester: TesterRecord;
  now: Date;
  inactivityDays: number;
}): MaintenanceDecision {
  const { tester } = input;
  const stale = isStale(tester, input.now, input.inactivityDays);
  const next = refreshStatus(tester, stale && tester.membership_verified !== 1);

  if (stale && tester.status !== "needs_attention" && tester.membership_verified !== 1) {
    return {
      email: tester.email,
      action: "needs_attention",
      reason: "No recorded onboarding activity within the inactivity window. Not removed from Google Groups.",
      nextStatus: next.status,
    };
  }

  if (next.status !== tester.status) {
    return {
      email: tester.email,
      action: "recalculate",
      reason: "Status refreshed from recorded events only.",
      nextStatus: next.status,
    };
  }

  return {
    email: tester.email,
    action: "none",
    reason: bothJoinLinksOpened(tester.group_join_started_at, tester.play_join_started_at)
      ? "Both join links were opened. That is not proof of group or Play membership."
      : "No maintenance action.",
    nextStatus: tester.status,
  };
}

function isStale(tester: TesterRecord, now: Date, days: number): boolean {
  const anchor =
    tester.last_activity_at ||
    tester.play_join_started_at ||
    tester.group_join_started_at ||
    tester.requested_at;
  const then = Date.parse(anchor);
  if (Number.isNaN(then)) return false;
  return now.getTime() - then >= days * 24 * 60 * 60 * 1000;
}

export async function runMaintenance(input: {
  testers: TesterRecord[];
  now: Date;
  inactivityDays: number;
  applyStatus: (email: string, status: TesterRecord["status"], updatedAt: string) => Promise<void>;
}): Promise<MaintenanceDecision[]> {
  const decisions: MaintenanceDecision[] = [];
  const iso = input.now.toISOString();
  for (const tester of input.testers) {
    const decision = decideMaintenance({
      tester,
      now: input.now,
      inactivityDays: input.inactivityDays,
    });
    decisions.push(decision);
    if (decision.action !== "none") {
      await input.applyStatus(tester.email, decision.nextStatus, iso);
    }
  }
  return decisions;
}
