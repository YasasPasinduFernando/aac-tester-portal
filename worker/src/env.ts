export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  FEEDBACK_BUCKET?: R2Bucket;
  PLAY_TEST_JOIN_URL: string;
  GOOGLE_GROUP_EMAIL: string;
  APPS_SCRIPT_URL: string;
  APPS_SCRIPT_SHARED_SECRET: string;
  ENABLE_AUTO_REMOVAL: string;
  TESTER_INACTIVITY_DAYS: string;
  ALLOWED_ORIGINS: string;
  ENVIRONMENT: string;
  ENABLE_ADMIN_DIRECTORY: string;
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

export function isProduction(env: Env): boolean {
  return (env.ENVIRONMENT ?? "production") !== "development";
}

export function autoRemovalEnabled(env: Env): boolean {
  return (env.ENABLE_AUTO_REMOVAL ?? "false").toLowerCase() === "true";
}

export function inactivityDays(env: Env): number {
  const parsed = Number.parseInt(env.TESTER_INACTIVITY_DAYS || "90", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 90;
}
