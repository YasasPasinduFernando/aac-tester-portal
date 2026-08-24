import { deriveStatus, type TesterStatus } from "../../shared/types";

export interface TesterRecord {
  id: string;
  email: string;
  status: TesterStatus;
  requested_at: string;
  group_join_started_at: string | null;
  play_join_started_at: string | null;
  feedback_submitted: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
  membership_verified: number;
  membership_verified_at: string | null;
  notes: string | null;
}

export interface FeedbackRecord {
  id: string;
  email: string;
  feedback_type: string;
  message: string;
  screenshot_key: string | null;
  created_at: string;
}

export interface AdminStats {
  totalRequests: number;
  pendingGroupJoins: number;
  pendingPlayJoins: number;
  completedOnboardingFlows: number;
  verifiedMemberships: number;
  needsAttention: number;
  feedbackCount: number;
}

export interface Store {
  getTester(email: string): Promise<TesterRecord | null>;
  upsertTester(record: TesterRecord): Promise<void>;
  updateTester(email: string, patch: Partial<TesterRecord>): Promise<void>;
  listTesters(): Promise<TesterRecord[]>;
  insertFeedback(record: FeedbackRecord): Promise<void>;
  countFeedbackByEmailSince(email: string, sinceIso: string): Promise<number>;
  countFeedback(): Promise<number>;
  adminStats(): Promise<AdminStats>;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function emptyTester(email: string, now: Date): TesterRecord {
  const iso = now.toISOString();
  return {
    id: newId(),
    email,
    status: "requested",
    requested_at: iso,
    group_join_started_at: null,
    play_join_started_at: null,
    feedback_submitted: 0,
    last_activity_at: iso,
    created_at: iso,
    updated_at: iso,
    membership_verified: 0,
    membership_verified_at: null,
    notes: null,
  };
}

export function refreshStatus(record: TesterRecord, needsAttention = false): TesterRecord {
  return {
    ...record,
    status: deriveStatus({
      groupJoinStartedAt: record.group_join_started_at,
      playJoinStartedAt: record.play_join_started_at,
      membershipVerified: record.membership_verified === 1,
      needsAttention,
    }),
  };
}

export function d1Store(db: D1Database): Store {
  return {
    async getTester(email) {
      return db
        .prepare("SELECT * FROM tester_requests WHERE email = ?")
        .bind(email)
        .first<TesterRecord>();
    },

    async upsertTester(record) {
      await db
        .prepare(
          `INSERT INTO tester_requests (
            id, email, status, requested_at, group_join_started_at, play_join_started_at,
            feedback_submitted, last_activity_at, created_at, updated_at,
            membership_verified, membership_verified_at, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            status = excluded.status,
            group_join_started_at = COALESCE(tester_requests.group_join_started_at, excluded.group_join_started_at),
            play_join_started_at = COALESCE(tester_requests.play_join_started_at, excluded.play_join_started_at),
            feedback_submitted = MAX(tester_requests.feedback_submitted, excluded.feedback_submitted),
            last_activity_at = excluded.last_activity_at,
            updated_at = excluded.updated_at,
            membership_verified = MAX(tester_requests.membership_verified, excluded.membership_verified),
            membership_verified_at = COALESCE(excluded.membership_verified_at, tester_requests.membership_verified_at),
            notes = excluded.notes`,
        )
        .bind(
          record.id,
          record.email,
          record.status,
          record.requested_at,
          record.group_join_started_at,
          record.play_join_started_at,
          record.feedback_submitted,
          record.last_activity_at,
          record.created_at,
          record.updated_at,
          record.membership_verified,
          record.membership_verified_at,
          record.notes,
        )
        .run();
    },

    async updateTester(email, patch) {
      const current = await this.getTester(email);
      if (!current) return;
      const merged = { ...current, ...patch };
      const next = {
        ...merged,
        status: deriveStatus({
          groupJoinStartedAt: merged.group_join_started_at,
          playJoinStartedAt: merged.play_join_started_at,
          membershipVerified: merged.membership_verified === 1,
          needsAttention: patch.status === "needs_attention",
        }),
      };
      await db
        .prepare(
          `UPDATE tester_requests SET
            status = ?, group_join_started_at = ?, play_join_started_at = ?,
            feedback_submitted = ?, last_activity_at = ?, updated_at = ?,
            membership_verified = ?, membership_verified_at = ?, notes = ?
           WHERE email = ?`,
        )
        .bind(
          next.status,
          next.group_join_started_at,
          next.play_join_started_at,
          next.feedback_submitted,
          next.last_activity_at,
          next.updated_at,
          next.membership_verified,
          next.membership_verified_at,
          next.notes,
          email,
        )
        .run();
    },

    async listTesters() {
      const result = await db
        .prepare("SELECT * FROM tester_requests ORDER BY requested_at DESC")
        .all<TesterRecord>();
      return result.results ?? [];
    },

    async insertFeedback(record) {
      await db
        .prepare(
          `INSERT INTO feedback (id, email, feedback_type, message, screenshot_key, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          record.id,
          record.email,
          record.feedback_type,
          record.message,
          record.screenshot_key,
          record.created_at,
        )
        .run();
    },

    async countFeedbackByEmailSince(email, sinceIso) {
      const row = await db
        .prepare(
          "SELECT COUNT(*) as count FROM feedback WHERE email = ? AND created_at >= ?",
        )
        .bind(email, sinceIso)
        .first<{ count: number }>();
      return row?.count ?? 0;
    },

    async countFeedback() {
      const row = await db
        .prepare("SELECT COUNT(*) as count FROM feedback")
        .first<{ count: number }>();
      return row?.count ?? 0;
    },

    async adminStats() {
      const counts = await db
        .prepare(
          `SELECT
            COUNT(*) as totalRequests,
            SUM(CASE WHEN group_join_started_at IS NULL THEN 1 ELSE 0 END) as pendingGroupJoins,
            SUM(CASE WHEN play_join_started_at IS NULL THEN 1 ELSE 0 END) as pendingPlayJoins,
            SUM(CASE WHEN group_join_started_at IS NOT NULL AND play_join_started_at IS NOT NULL THEN 1 ELSE 0 END) as completedOnboardingFlows,
            SUM(CASE WHEN membership_verified = 1 THEN 1 ELSE 0 END) as verifiedMemberships,
            SUM(CASE WHEN status = 'needs_attention' THEN 1 ELSE 0 END) as needsAttention
           FROM tester_requests`,
        )
        .first<{
          totalRequests: number;
          pendingGroupJoins: number;
          pendingPlayJoins: number;
          completedOnboardingFlows: number;
          verifiedMemberships: number;
          needsAttention: number;
        }>();

      return {
        totalRequests: counts?.totalRequests ?? 0,
        pendingGroupJoins: counts?.pendingGroupJoins ?? 0,
        pendingPlayJoins: counts?.pendingPlayJoins ?? 0,
        completedOnboardingFlows: counts?.completedOnboardingFlows ?? 0,
        verifiedMemberships: counts?.verifiedMemberships ?? 0,
        needsAttention: counts?.needsAttention ?? 0,
        feedbackCount: await this.countFeedback(),
      };
    },
  };
}
