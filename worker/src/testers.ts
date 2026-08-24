import { parseEmailInput } from "../../shared/email";
import {
  bothJoinLinksOpened,
  resolveGroupJoinUrl,
  USER_MESSAGES,
  type AccessOutcome,
  type MembershipVerification,
  type TesterStatus,
} from "../../shared/types";
import type { GroupBridge } from "./groups";
import type { RateLimitStore } from "./rate-limit";
import { emptyTester, refreshStatus, type Store, type TesterRecord } from "./store";

export interface AccessResult {
  outcome: AccessOutcome;
  status: TesterStatus | null;
  message: string;
  detail: string;
  membershipVerified: boolean;
  membershipVerification: MembershipVerification;
  groupJoinUrl: string | null;
  playJoinUrl: string | null;
  playStoreUrl: string | null;
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
  playStoreUrl?: string | null;
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
    playStoreUrl: input.playStoreUrl ?? null,
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

export interface AccessCheckResult {
  ok: boolean;
  membershipVerified: boolean;
  membershipVerification: MembershipVerification;
  message: string;
  status: TesterStatus | null;
  groupJoinUrl: string | null;
  playJoinUrl: string | null;
  playStoreUrl: string | null;
}

export async function checkAccess(input: {
  email: unknown;
  now: Date;
  store: Store;
  groups: GroupBridge | null;
  groupEmail: string;
  groupJoinUrl?: string;
  playJoinUrl: string | null;
  playStoreUrl?: string | null;
}): Promise<AccessCheckResult> {
  const email = parseEmailInput(input.email);
  if (!email) {
    return {
      ok: false,
      membershipVerified: false,
      membershipVerification: "unavailable",
      message: USER_MESSAGES.invalidEmail,
      status: null,
      groupJoinUrl: null,
      playJoinUrl: null,
      playStoreUrl: null,
    };
  }

  const existing = await input.store.getTester(email);
  const iso = input.now.toISOString();
  if (existing) {
    await input.store.updateTester(email, {
      last_activity_at: iso,
      updated_at: iso,
    });
  }

  if (!input.groups) {
    return {
      ok: true,
      membershipVerified: false,
      membershipVerification: "unavailable",
      message: USER_MESSAGES.checkAccessUnavailable,
      status: existing?.status ?? null,
      groupJoinUrl: resolveGroupJoinUrl(input.groupJoinUrl, input.groupEmail),
      playJoinUrl: input.playJoinUrl,
      playStoreUrl: input.playStoreUrl ?? null,
    };
  }

  const result = await input.groups.check(email);
  if (result.code === "AUTH_FAILURE" || result.code === "TEMPORARY_FAILURE" || result.code === "GROUP_FAILURE") {
    return {
      ok: true,
      membershipVerified: false,
      membershipVerification: "unavailable",
      message: USER_MESSAGES.checkAccessUnavailable,
      status: existing?.status ?? null,
      groupJoinUrl: resolveGroupJoinUrl(input.groupJoinUrl, input.groupEmail),
      playJoinUrl: input.playJoinUrl,
      playStoreUrl: input.playStoreUrl ?? null,
    };
  }

  if (result.isMember) {
    if (existing) {
      await input.store.updateTester(email, {
        membership_verified: 1,
        membership_verified_at: iso,
        notes: null,
        last_activity_at: iso,
        updated_at: iso,
      });
    }
    return {
      ok: true,
      membershipVerified: true,
      membershipVerification: "verified",
      message: USER_MESSAGES.ready,
      status: "completed",
      groupJoinUrl: resolveGroupJoinUrl(input.groupJoinUrl, input.groupEmail),
      playJoinUrl: input.playJoinUrl,
      playStoreUrl: input.playStoreUrl ?? null,
    };
  }

  if (existing) {
    await input.store.updateTester(email, {
      membership_verified: 0,
      notes: "not_member",
      last_activity_at: iso,
      updated_at: iso,
    });
  }

  return {
    ok: true,
    membershipVerified: false,
    membershipVerification: "not_member",
    message: USER_MESSAGES.checkAccessNotMember,
    status: existing?.status ?? null,
    groupJoinUrl: resolveGroupJoinUrl(input.groupJoinUrl, input.groupEmail),
    playJoinUrl: input.playJoinUrl,
    playStoreUrl: input.playStoreUrl ?? null,
  };
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
    playStoreUrl: null,
    groupJoinStarted: false,
    playJoinStarted: false,
    bothLinksOpened: false,
    duplicate: false,
  };
}
