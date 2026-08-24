export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  FEEDBACK_BUCKET?: R2Bucket;
  PLAY_TEST_JOIN_URL?: string;
  GOOGLE_GROUP_EMAIL: string;
  GOOGLE_GROUP_JOIN_URL?: string;
  APPS_SCRIPT_URL?: string;
  APPS_SCRIPT_SHARED_SECRET?: string;
  TESTER_INACTIVITY_DAYS: string;
  ALLOWED_ORIGINS: string;
  ENVIRONMENT: string;
  RATE_LIMIT_SALT: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
}

export function parseAllowedOrigins(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function inactivityDays(env: Env): number {
  const parsed = Number.parseInt(env.TESTER_INACTIVITY_DAYS || "90", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 90;
}

export function playJoinUrl(env: Env): string | null {
  const value = env.PLAY_TEST_JOIN_URL?.trim();
  return value ? value : null;
}
