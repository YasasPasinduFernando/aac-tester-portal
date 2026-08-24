import type { AdminStats, FeedbackRecord, Store, TesterRecord } from "../src/store";

export class MemoryStore implements Store {
  testers = new Map<string, TesterRecord>();
  feedback: FeedbackRecord[] = [];

  async getTester(email: string): Promise<TesterRecord | null> {
    return this.testers.get(email) ?? null;
  }

  async upsertTester(record: TesterRecord): Promise<void> {
    this.testers.set(record.email, { ...record });
  }

  async updateTester(email: string, patch: Partial<TesterRecord>): Promise<void> {
    const current = this.testers.get(email);
    if (!current) return;
    this.testers.set(email, { ...current, ...patch });
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

  async adminStats(): Promise<AdminStats> {
    const testers = [...this.testers.values()];
    return {
      totalRequests: testers.length,
      currentTesterCount: testers.filter((row) =>
        ["member", "eligible", "invited"].includes(row.status),
      ).length,
      pendingRequests: testers.filter((row) => row.status === "requested").length,
      activeTesters: testers.filter((row) => ["member", "eligible"].includes(row.status)).length,
      removedTesters: testers.filter((row) => row.status === "removed").length,
      recentErrors: testers
        .filter((row) => row.status === "error" || row.error_message)
        .slice(0, 25)
        .map((row) => ({
          id: row.id,
          email: row.email,
          error_message: row.error_message,
          requested_at: row.requested_at,
          last_verified_at: row.last_verified_at,
        })),
    };
  }
}
