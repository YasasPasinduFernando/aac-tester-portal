import { parseEmailInput } from "../../shared/email";
import {
  bothJoinLinksOpened,
  resolveGroupJoinUrl,
  USER_MESSAGES,
  type AccessOutcome,
  type TesterStatus,
} from "../../shared/types";
import type { RateLimitStore } from "./rate-limit";
import { emptyTester, refreshStatus, type Store, type TesterRecord } from "./store";

export interface AccessResult {
  outcome: AccessOutcome;
  status: TesterStatus | null;
  message: string;
  detail: string;
  membershipVerified: boolean;
  membershipVerification: "verified" | "unavailable";
  groupJoinUrl: string | null;
  playJoinUrl: string | null;
  groupJoinStarted: boolean;
  playJoinStarted: boolean;
  bothLinksOpened: boolean;
  duplicate: boolean;
}

const REQUEST_LIMIT = 5;
const REQUEST_WINDOW_MS = 15 * 60 * 1000;

export async function requestAccess(input: {
  email: unknown;
  ipHash: string;
  now: Date;
  store: Store;
  rateLimit: RateLimitStore;
  groupEmail: string;
  groupJoinUrl?: string;
  playJoinUrl: string | null;
  membershipVerified?: boolean;
}): Promise<AccessResult> {
  const allowed = await input.rateLimit.consume(
    `tester:${input.ipHash}`,
    REQUEST_LIMIT,
    REQUEST_WINDOW_MS,
    input.now.getTime(),
  );
  if (!allowed) {
    return emptyResult("rate_limited", USER_MESSAGES.rateLimited);
  }

  const email = parseEmailInput(input.email);
  if (!email) {
    return emptyResult("invalid_email", USER_MESSAGES.invalidEmail);
  }

  const existing = await input.store.getTester(email);
  const iso = input.now.toISOString();
  const verified = existing?.membership_verified === 1 || input.membershipVerified === true;

  const record: TesterRecord = refreshStatus({
    ...(existing ?? emptyTester(email, input.now)),
    last_activity_at: iso,
    updated_at: iso,
    membership_verified: verified ? 1 : (existing?.membership_verified ?? 0),
    membership_verified_at: verified
      ? (existing?.membership_verified_at ?? iso)
      : existing?.membership_verified_at ?? null,
    notes: verified ? null : "Membership verification unavailable",
  });

  await input.store.upsertTester(record);

  return {
    outcome: "continue",
    status: record.status,
    message: USER_MESSAGES.almostReady,
    detail: USER_MESSAGES.sameAccount,
    membershipVerified: verified,
    membershipVerification: verified ? "verified" : "unavailable",
    groupJoinUrl: resolveGroupJoinUrl(input.groupJoinUrl, input.groupEmail),
    playJoinUrl: input.playJoinUrl,
    groupJoinStarted: Boolean(record.group_join_started_at),
    playJoinStarted: Boolean(record.play_join_started_at),
    bothLinksOpened: bothJoinLinksOpened(
      record.group_join_started_at,
      record.play_join_started_at,
    ),
    duplicate: Boolean(existing),
  };
}

export async function recordJoinEvent(input: {
  email: unknown;
  event: unknown;
  now: Date;
  store: Store;
}): Promise<{ ok: boolean; message: string; record: TesterRecord | null }> {
  const email = parseEmailInput(input.email);
  if (!email) {
    return { ok: false, message: USER_MESSAGES.invalidEmail, record: null };
  }
  const event = String(input.event ?? "");
  if (event !== "group_join" && event !== "play_join") {
    return { ok: false, message: "Unknown event.", record: null };
  }

  const existing = await input.store.getTester(email);
  if (!existing) {
    return { ok: false, message: USER_MESSAGES.invalidEmail, record: null };
  }

  const iso = input.now.toISOString();
  const patch: Partial<TesterRecord> = {
    last_activity_at: iso,
    updated_at: iso,
  };
  if (event === "group_join" && !existing.group_join_started_at) {
    patch.group_join_started_at = iso;
  }
  if (event === "play_join" && !existing.play_join_started_at) {
    patch.play_join_started_at = iso;
  }

  await input.store.updateTester(email, patch);
  const record = await input.store.getTester(email);
  return { ok: true, message: "Recorded.", record };
}

function emptyResult(outcome: AccessOutcome, message: string): AccessResult {
  return {
    outcome,
    status: null,
    message,
    detail: message,
    membershipVerified: false,
    membershipVerification: "unavailable",
    groupJoinUrl: null,
    playJoinUrl: null,
    groupJoinStarted: false,
    playJoinStarted: false,
    bothLinksOpened: false,
    duplicate: false,
  };
}
