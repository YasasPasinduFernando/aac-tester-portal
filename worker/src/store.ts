import type { TesterStatus } from "../../shared/types";

export interface TesterRecord {
  id: string;
  email: string;
  status: TesterStatus;
  requested_at: string;
  last_verified_at: string | null;
  last_download_check_at: string | null;
  last_website_activity_at: string | null;
  installed_confirmed_at: string | null;
  removed_at: string | null;
  error_message: string | null;
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
  currentTesterCount: number;
  pendingRequests: number;
  activeTesters: number;
  removedTesters: number;
  recentErrors: Array<{
    id: string;
    email: string;
    error_message: string | null;
    requested_at: string;
    last_verified_at: string | null;
  }>;
}

export interface Store {
  getTester(email: string): Promise<TesterRecord | null>;
  upsertTester(record: TesterRecord): Promise<void>;
  updateTester(email: string, patch: Partial<TesterRecord>): Promise<void>;
  listTesters(): Promise<TesterRecord[]>;
  insertFeedback(record: FeedbackRecord): Promise<void>;
  countFeedbackByEmailSince(email: string, sinceIso: string): Promise<number>;
  adminStats(): Promise<AdminStats>;
}

function nowIso(date: Date): string {
  return date.toISOString();
}

export function newId(): string {
  return crypto.randomUUID();
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
            id, email, status, requested_at, last_verified_at, last_download_check_at,
            last_website_activity_at, installed_confirmed_at, removed_at, error_message
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            status = excluded.status,
            last_verified_at = excluded.last_verified_at,
            last_download_check_at = excluded.last_download_check_at,
            last_website_activity_at = excluded.last_website_activity_at,
            installed_confirmed_at = COALESCE(excluded.installed_confirmed_at, tester_requests.installed_confirmed_at),
            removed_at = excluded.removed_at,
            error_message = excluded.error_message`,
        )
        .bind(
          record.id,
          record.email,
          record.status,
          record.requested_at,
          record.last_verified_at,
          record.last_download_check_at,
          record.last_website_activity_at,
          record.installed_confirmed_at,
          record.removed_at,
          record.error_message,
        )
        .run();
    },

    async updateTester(email, patch) {
      const current = await this.getTester(email);
      if (!current) return;
      const next = { ...current, ...patch };
      await db
        .prepare(
          `UPDATE tester_requests SET
            status = ?, last_verified_at = ?, last_download_check_at = ?,
            last_website_activity_at = ?, installed_confirmed_at = ?,
            removed_at = ?, error_message = ?
           WHERE email = ?`,
        )
        .bind(
          next.status,
          next.last_verified_at,
          next.last_download_check_at,
          next.last_website_activity_at,
          next.installed_confirmed_at,
          next.removed_at,
          next.error_message,
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

    async adminStats() {
      const counts = await db
        .prepare(
          `SELECT
            COUNT(*) as totalRequests,
            SUM(CASE WHEN status IN ('member', 'eligible', 'invited') THEN 1 ELSE 0 END) as currentTesterCount,
            SUM(CASE WHEN status = 'requested' THEN 1 ELSE 0 END) as pendingRequests,
            SUM(CASE WHEN status IN ('member', 'eligible') THEN 1 ELSE 0 END) as activeTesters,
            SUM(CASE WHEN status = 'removed' THEN 1 ELSE 0 END) as removedTesters
           FROM tester_requests`,
        )
        .first<{
          totalRequests: number;
          currentTesterCount: number;
          pendingRequests: number;
          activeTesters: number;
          removedTesters: number;
        }>();

      const errors = await db
        .prepare(
          `SELECT id, email, error_message, requested_at, last_verified_at
           FROM tester_requests
           WHERE status = 'error' OR error_message IS NOT NULL
           ORDER BY requested_at DESC
           LIMIT 25`,
        )
        .all<AdminStats["recentErrors"][number]>();

      return {
        totalRequests: counts?.totalRequests ?? 0,
        currentTesterCount: counts?.currentTesterCount ?? 0,
        pendingRequests: counts?.pendingRequests ?? 0,
        activeTesters: counts?.activeTesters ?? 0,
        removedTesters: counts?.removedTesters ?? 0,
        recentErrors: errors.results ?? [],
      };
    },
  };
}

export function touchActivity(record: TesterRecord, at: Date): TesterRecord {
  return { ...record, last_website_activity_at: nowIso(at) };
}
