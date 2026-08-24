import { deriveStatus } from "../../shared/types";
import type { AdminStats, FeedbackRecord, Store, TesterRecord } from "../src/store";

export class MemoryStore implements Store {
  testers = new Map<string, TesterRecord>();
  feedback: FeedbackRecord[] = [];

  async getTester(email: string): Promise<TesterRecord | null> {
    return this.testers.get(email) ?? null;
  }

  async upsertTester(record: TesterRecord): Promise<void> {
    const existing = this.testers.get(record.email);
    if (!existing) {
      this.testers.set(record.email, { ...record });
      return;
    }
    this.testers.set(record.email, {
      ...existing,
      ...record,
      id: existing.id,
      requested_at: existing.requested_at,
      created_at: existing.created_at,
      group_join_started_at: existing.group_join_started_at ?? record.group_join_started_at,
      play_join_started_at: existing.play_join_started_at ?? record.play_join_started_at,
      feedback_submitted: Math.max(existing.feedback_submitted, record.feedback_submitted),
      membership_verified: Math.max(existing.membership_verified, record.membership_verified),
    });
  }

  async updateTester(email: string, patch: Partial<TesterRecord>): Promise<void> {
    const current = this.testers.get(email);
    if (!current) return;
    const merged = { ...current, ...patch };
    this.testers.set(email, {
      ...merged,
      status: deriveStatus({
        groupJoinStartedAt: merged.group_join_started_at,
        playJoinStartedAt: merged.play_join_started_at,
        membershipVerified: merged.membership_verified === 1,
        needsAttention: patch.status === "needs_attention",
      }),
    });
  }

  async listTesters(): Promise<TesterRecord[]> {
    return [...this.testers.values()].sort((a, b) => b.requested_at.localeCompare(a.requested_at));
  }

  async insertFeedback(record: FeedbackRecord): Promise<void> {
    this.feedback.push(record);
  }

  async countFeedbackByEmailSince(email: string, sinceIso: string): Promise<number> {
    return this.feedback.filter((row) => row.email === email && row.created_at >= sinceIso).length;
  }

  async countFeedback(): Promise<number> {
    return this.feedback.length;
  }

  async adminStats(): Promise<AdminStats> {
    const testers = [...this.testers.values()];
    return {
      totalRequests: testers.length,
      pendingGroupJoins: testers.filter((row) => !row.group_join_started_at).length,
      pendingPlayJoins: testers.filter((row) => !row.play_join_started_at).length,
      completedOnboardingFlows: testers.filter(
        (row) => row.group_join_started_at && row.play_join_started_at,
      ).length,
      verifiedMemberships: testers.filter((row) => row.membership_verified === 1).length,
      needsAttention: testers.filter((row) => row.status === "needs_attention").length,
      feedbackCount: this.feedback.length,
    };
  }
}
