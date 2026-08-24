import { parseEmailInput } from "../../shared/email";
import { USER_MESSAGES, type AccessOutcome, type TesterStatus } from "../../shared/types";
import { mapGroupToStatus, type GroupBridge } from "./groups";
import { newId, type Store, type TesterRecord } from "./store";
import type { RateLimitStore } from "./rate-limit";

export interface AccessResult {
  outcome: AccessOutcome;
  status: TesterStatus | null;
  playJoinUrl: string | null;
  message: string;
  detail: string;
  membershipConfirmed: boolean;
}

const REQUEST_LIMIT = 5;
const REQUEST_WINDOW_MS = 15 * 60 * 1000;

export async function requestAccess(input: {
  email: unknown;
  ipHash: string;
  now: Date;
  store: Store;
  rateLimit: RateLimitStore;
  groups: GroupBridge;
  playJoinUrl: string;
}): Promise<AccessResult> {
  const allowed = await input.rateLimit.consume(
    `tester:${input.ipHash}`,
    REQUEST_LIMIT,
    REQUEST_WINDOW_MS,
    input.now.getTime(),
  );
  if (!allowed) {
    return {
      outcome: "rate_limited",
      status: null,
      playJoinUrl: null,
      message: USER_MESSAGES.rateLimited,
      detail: USER_MESSAGES.rateLimited,
      membershipConfirmed: false,
    };
  }

  const email = parseEmailInput(input.email);
  if (!email) {
    return {
      outcome: "invalid_email",
      status: null,
      playJoinUrl: null,
      message: USER_MESSAGES.invalidEmail,
      detail: USER_MESSAGES.invalidEmail,
      membershipConfirmed: false,
    };
  }

  const existing = await input.store.getTester(email);
  const requestedAt = existing?.requested_at ?? input.now.toISOString();
  const record: TesterRecord = {
    id: existing?.id ?? newId(),
    email,
    status: existing?.status ?? "requested",
    requested_at: requestedAt,
    last_verified_at: existing?.last_verified_at ?? null,
    last_download_check_at: existing?.last_download_check_at ?? null,
    last_website_activity_at: input.now.toISOString(),
    installed_confirmed_at: existing?.installed_confirmed_at ?? null,
    removed_at: existing?.removed_at ?? null,
    error_message: existing?.error_message ?? null,
  };

  const check = await input.groups.check(email);
  let mapped = mapGroupToStatus(check);
  let membershipConfirmed = mapped.confirmed && (mapped.status === "eligible" || mapped.status === "member" || mapped.status === "invited");

  if (!membershipConfirmed) {
    const invite = await input.groups.invite(email);
    mapped = mapGroupToStatus(invite);
    membershipConfirmed =
      mapped.confirmed &&
      (mapped.status === "eligible" || mapped.status === "member" || mapped.status === "invited");

    if (!membershipConfirmed && (invite.code === "AUTH_FAILURE" || invite.code === "TEMPORARY_FAILURE" || invite.code === "GROUP_FAILURE")) {
      record.status = existing?.status === "requested" ? "error" : (existing?.status ?? "error");
      record.error_message = invite.code;
      record.last_verified_at = input.now.toISOString();
      await input.store.upsertTester(record);
      return {
        outcome: "unavailable",
        status: record.status,
        playJoinUrl: input.playJoinUrl || null,
        message: USER_MESSAGES.unavailable,
        detail: USER_MESSAGES.pendingBody,
        membershipConfirmed: false,
      };
    }
  }

  record.status = membershipConfirmed
    ? mapped.status === "invited"
      ? "invited"
      : "eligible"
    : "requested";
  record.last_verified_at = input.now.toISOString();
  record.error_message = membershipConfirmed ? null : mapped.status === "error" ? check.code : null;
  await input.store.upsertTester(record);

  if (membershipConfirmed) {
    return {
      outcome: "ready",
      status: record.status,
      playJoinUrl: input.playJoinUrl || null,
      message: USER_MESSAGES.ready,
      detail: USER_MESSAGES.readyBody,
      membershipConfirmed: true,
    };
  }

  return {
    outcome: "pending",
    status: "requested",
    playJoinUrl: input.playJoinUrl || null,
    message: USER_MESSAGES.pending,
    detail: USER_MESSAGES.pendingBody,
    membershipConfirmed: false,
  };
}

export async function confirmInstall(input: {
  email: unknown;
  now: Date;
  store: Store;
}): Promise<{ ok: boolean; message: string }> {
  const email = parseEmailInput(input.email);
  if (!email) {
    return { ok: false, message: USER_MESSAGES.invalidEmail };
  }
  const existing = await input.store.getTester(email);
  if (!existing) {
    await input.store.upsertTester({
      id: newId(),
      email,
      status: "requested",
      requested_at: input.now.toISOString(),
      last_verified_at: null,
      last_download_check_at: input.now.toISOString(),
      last_website_activity_at: input.now.toISOString(),
      installed_confirmed_at: input.now.toISOString(),
      removed_at: null,
      error_message: null,
    });
  } else {
    await input.store.updateTester(email, {
      installed_confirmed_at: input.now.toISOString(),
      last_download_check_at: input.now.toISOString(),
      last_website_activity_at: input.now.toISOString(),
    });
  }
  return { ok: true, message: USER_MESSAGES.confirmInstall };
}
