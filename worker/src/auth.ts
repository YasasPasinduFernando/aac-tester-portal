import { playStepsUnlocked, USER_MESSAGES } from "../../shared/types";
import type { Env } from "./env";
import { playJoinUrl, playStoreUrl } from "./env";
import {
  clearSessionCookieHeader,
  createSessionToken,
  sessionCookieHeader,
  sessionFromRequest,
  verifyGoogleIdToken,
  type GoogleIdentity,
  type PortalSession,
} from "./google-auth";
import { jsonResponse } from "./headers";
import type { RateLimitStore } from "./rate-limit";
import type { Store, TesterRecord } from "./store";
import { requestAccess, type AccessResult } from "./testers";

const AUTH_LIMIT = 8;
const AUTH_WINDOW_MS = 15 * 60 * 1000;

export interface AuthClientPayload {
  authenticated: boolean;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  membershipVerified: boolean;
  membershipVerification: AccessResult["membershipVerification"] | null;
  status: AccessResult["status"];
  groupJoinUrl: string | null;
  playJoinUrl: string | null;
  playStoreUrl: string | null;
  groupJoinStarted: boolean;
  playJoinStarted: boolean;
  duplicate: boolean;
  message?: string;
}

export function authConfig(env: Env): { googleClientId: string | null; configured: boolean } {
  const googleClientId = env.GOOGLE_CLIENT_ID?.trim() || null;
  return { googleClientId, configured: Boolean(googleClientId && env.SESSION_SECRET) };
}

export async function signInWithGoogle(input: {
  credential: unknown;
  nonce?: unknown;
  env: Env;
  store: Store;
  rateLimit: RateLimitStore;
  ipHash: string;
  now: Date;
  request: Request;
  jwks?: Parameters<typeof verifyGoogleIdToken>[0]["jwks"];
}): Promise<Response> {
  const configured = authConfig(input.env);
  if (!configured.googleClientId || !input.env.SESSION_SECRET) {
    return jsonResponse(
      { ok: false, error: "unavailable", message: USER_MESSAGES.googleSignInUnavailable },
      { status: 503 },
    );
  }

  const allowed = await input.rateLimit.consume(
    `auth:${input.ipHash}`,
    AUTH_LIMIT,
    AUTH_WINDOW_MS,
    input.now.getTime(),
  );
  if (!allowed) {
    return jsonResponse(
      { ok: false, error: "rate_limited", message: USER_MESSAGES.rateLimited },
      { status: 429 },
    );
  }

  const credential = typeof input.credential === "string" ? input.credential : "";
  const nonce = typeof input.nonce === "string" ? input.nonce : undefined;
  const verified = await verifyGoogleIdToken({
    credential,
    clientId: configured.googleClientId,
    nonce,
    jwks: input.jwks,
    now: input.now,
  });
  if (!verified.ok) {
    const message =
      verified.error === "missing_email"
        ? USER_MESSAGES.googleMissingEmail
        : USER_MESSAGES.googleSignInFailed;
    return jsonResponse({ ok: false, error: verified.error, message }, { status: 401 });
  }

  const identity = verified.identity;
  const access = await requestAccess({
    email: identity.email,
    ipHash: input.ipHash,
    now: input.now,
    store: input.store,
    rateLimit: input.rateLimit,
    groupEmail: input.env.GOOGLE_GROUP_EMAIL,
    groupJoinUrl: input.env.GOOGLE_GROUP_JOIN_URL,
    playJoinUrl: playJoinUrl(input.env),
    playStoreUrl: playStoreUrl(input.env),
    skipRateLimit: true,
    google: identity,
  });

  const token = await createSessionToken(
    {
      email: identity.email,
      subjectId: identity.subjectId,
      displayName: identity.displayName,
      avatarUrl: identity.avatarUrl,
    },
    input.env.SESSION_SECRET,
    input.now,
  );
  const secure = new URL(input.request.url).protocol === "https:";
  return jsonResponse(
    { ok: true, ...toClientPayload(identity, access) },
    { headers: { "Set-Cookie": sessionCookieHeader(token, secure) } },
  );
}

export async function currentAuth(input: {
  request: Request;
  env: Env;
  store: Store;
}): Promise<Response> {
  const session = await sessionFromRequest(input.request, input.env.SESSION_SECRET);
  if (!session) {
    return jsonResponse(emptyClientPayload());
  }
  const record =
    (await input.store.getTesterBySubject(session.subjectId)) ??
    (await input.store.getTester(session.email));
  return jsonResponse(toClientPayload(session, accessFromRecord(record, input.env)));
}

export async function signOut(request: Request): Promise<Response> {
  const secure = new URL(request.url).protocol === "https:";
  return jsonResponse(
    { ok: true, ...emptyClientPayload() },
    { headers: { "Set-Cookie": clearSessionCookieHeader(secure) } },
  );
}

export async function requireTesterSession(
  request: Request,
  env: Env,
): Promise<PortalSession | Response> {
  const session = await sessionFromRequest(request, env.SESSION_SECRET);
  if (!session) {
    return jsonResponse(
      { ok: false, error: "unauthenticated", message: USER_MESSAGES.signInRequired },
      { status: 401 },
    );
  }
  return session;
}

function accessFromRecord(record: TesterRecord | null, env: Env): AccessResult {
  const verified = record?.membership_verified === 1;
  return {
    outcome: "continue",
    status: record?.status ?? null,
    message: verified ? USER_MESSAGES.ready : USER_MESSAGES.almostReady,
    detail: USER_MESSAGES.sameAccountGroupsAndPlay,
    membershipVerified: verified,
    membershipVerification: verified ? "verified" : "unavailable",
    groupJoinUrl: env.GOOGLE_GROUP_JOIN_URL || null,
    playJoinUrl: playJoinUrl(env),
    playStoreUrl: playStoreUrl(env),
    groupJoinStarted: Boolean(record?.group_join_started_at),
    playJoinStarted: Boolean(record?.play_join_started_at),
    bothLinksOpened: Boolean(record?.group_join_started_at && record?.play_join_started_at),
    duplicate: Boolean(record),
  };
}

export function toClientPayload(
  identity: Pick<GoogleIdentity, "email" | "displayName" | "avatarUrl">,
  access: AccessResult,
): AuthClientPayload {
  const play = playStepsUnlocked(access.membershipVerified)
    ? { playJoinUrl: access.playJoinUrl, playStoreUrl: access.playStoreUrl }
    : { playJoinUrl: null, playStoreUrl: null };
  return {
    authenticated: true,
    email: identity.email,
    displayName: identity.displayName,
    avatarUrl: identity.avatarUrl,
    membershipVerified: access.membershipVerified,
    membershipVerification: access.membershipVerification,
    status: access.status,
    groupJoinUrl: access.groupJoinUrl,
    ...play,
    groupJoinStarted: access.groupJoinStarted,
    playJoinStarted: access.playJoinStarted,
    duplicate: access.duplicate,
  };
}

export function emptyClientPayload(): AuthClientPayload {
  return {
    authenticated: false,
    email: null,
    displayName: null,
    avatarUrl: null,
    membershipVerified: false,
    membershipVerification: null,
    status: null,
    groupJoinUrl: null,
    playJoinUrl: null,
    playStoreUrl: null,
    groupJoinStarted: false,
    playJoinStarted: false,
    duplicate: false,
  };
}
