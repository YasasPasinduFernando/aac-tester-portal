import { createRemoteJWKSet, jwtVerify, SignJWT, type JWTPayload, type JWTVerifyGetKey } from "jose";
import { normalizeEmail, parseEmailInput } from "../../shared/email";

export const SESSION_COOKIE = "aac_session";
export const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"] as const;
export const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const ID_TOKEN_MAX_AGE = 5 * 60;

export interface GoogleIdentity {
  email: string;
  subjectId: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export type AuthMethod = "google" | "email";

export const EMAIL_SUBJECT_PREFIX = "email:";

export interface PortalSession {
  email: string;
  subjectId: string;
  displayName: string | null;
  avatarUrl: string | null;
  authMethod?: AuthMethod;
}

export function emailSessionSubject(email: string): string {
  return `${EMAIL_SUBJECT_PREFIX}${email}`;
}

export function resolveAuthMethod(method: unknown, subjectId: string): AuthMethod {
  if (method === "email" || subjectId.startsWith(EMAIL_SUBJECT_PREFIX)) return "email";
  return "google";
}

export type GoogleVerifyError = "invalid" | "missing_email" | "unverified_email";

let remoteJwks: JWTVerifyGetKey | null = null;

function googleJwks(): JWTVerifyGetKey {
  remoteJwks ??= createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
  return remoteJwks;
}

export async function verifyGoogleIdToken(input: {
  credential: string;
  clientId: string;
  nonce?: string;
  jwks?: JWTVerifyGetKey;
  now?: Date;
}): Promise<{ ok: true; identity: GoogleIdentity } | { ok: false; error: GoogleVerifyError }> {
  const credential = input.credential.trim();
  if (!credential || !input.clientId) {
    return { ok: false, error: "invalid" };
  }

  try {
    const { payload } = await jwtVerify(credential, input.jwks ?? googleJwks(), {
      issuer: [...GOOGLE_ISSUERS],
      audience: input.clientId,
      currentDate: input.now,
      maxTokenAge: `${ID_TOKEN_MAX_AGE}s`,
    });
    if (input.nonce && payload.nonce !== input.nonce) {
      return { ok: false, error: "invalid" };
    }
    return identityFromPayload(payload);
  } catch {
    return { ok: false, error: "invalid" };
  }
}

function identityFromPayload(
  payload: JWTPayload,
): { ok: true; identity: GoogleIdentity } | { ok: false; error: GoogleVerifyError } {
  const subjectId = typeof payload.sub === "string" ? payload.sub.trim() : "";
  if (!subjectId) return { ok: false, error: "invalid" };

  const email = parseEmailInput(payload.email);
  if (!email) return { ok: false, error: "missing_email" };
  if (payload.email_verified !== true) return { ok: false, error: "unverified_email" };

  const displayName = typeof payload.name === "string" ? payload.name.trim() || null : null;
  const avatarUrl =
    typeof payload.picture === "string" && payload.picture.startsWith("https://")
      ? payload.picture
      : null;

  return {
    ok: true,
    identity: {
      email: normalizeEmail(email),
      subjectId,
      displayName,
      avatarUrl,
    },
  };
}

export async function createSessionToken(
  session: PortalSession,
  secret: string,
  now = new Date(),
): Promise<string> {
  const key = sessionSecretKey(secret);
  const authMethod = resolveAuthMethod(session.authMethod, session.subjectId);
  return new SignJWT({
    email: session.email,
    name: session.displayName,
    picture: session.avatarUrl,
    am: authMethod,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(session.subjectId)
    .setIssuedAt(now)
    .setExpirationTime(Math.floor(now.getTime() / 1000) + SESSION_TTL_SECONDS)
    .sign(key);
}

export async function readSessionToken(
  token: string,
  secret: string,
  now = new Date(),
): Promise<PortalSession | null> {
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecretKey(secret), {
      algorithms: ["HS256"],
      currentDate: now,
    });
    const email = parseEmailInput(payload.email);
    const subjectId = typeof payload.sub === "string" ? payload.sub : "";
    if (!email || !subjectId) return null;
    return {
      email,
      subjectId,
      displayName: typeof payload.name === "string" ? payload.name : null,
      avatarUrl: typeof payload.picture === "string" ? payload.picture : null,
      authMethod: resolveAuthMethod(payload.am, subjectId),
    };
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) {
      return decodeURIComponent(trimmed.slice(eq + 1));
    }
  }
  return null;
}

export async function sessionFromRequest(
  request: Request,
  secret: string | undefined,
): Promise<PortalSession | null> {
  if (!secret) return null;
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  return readSessionToken(token, secret);
}

export function sessionCookieHeader(token: string, secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookieHeader(secure: boolean): string {
  const parts = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

function sessionSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}
