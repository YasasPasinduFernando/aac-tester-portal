import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { signInWithGoogle, signOut, toClientPayload } from "../src/auth";
import type { Env } from "../src/env";
import {
  clearSessionCookieHeader,
  createSessionToken,
  readCookie,
  readSessionToken,
  sessionCookieHeader,
  SESSION_COOKIE,
  verifyGoogleIdToken,
} from "../src/google-auth";
import { MemoryRateLimitStore } from "../src/rate-limit";
import { requestAccess } from "../src/testers";
import { MemoryStore } from "./helpers";

const CLIENT_ID = "test-client.apps.googleusercontent.com";
const SESSION_SECRET = "test-session-secret-please-change";
const GROUP = "https://groups.google.com/g/aac-sinhala-testers";
const PLAY = "https://play.google.com/apps/testing/lk.aac.sinhala_tamil_english";
const STORE = "https://play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english";

function env(): Env {
  return {
    DB: {} as D1Database,
    ASSETS: {} as Fetcher,
    GOOGLE_GROUP_EMAIL: "aac-sinhala-testers@googlegroups.com",
    GOOGLE_GROUP_JOIN_URL: GROUP,
    PLAY_TEST_JOIN_URL: PLAY,
    PLAY_STORE_URL: STORE,
    TESTER_INACTIVITY_DAYS: "90",
    ALLOWED_ORIGINS: "https://aac.yasaboy.com",
    ENVIRONMENT: "test",
    RATE_LIMIT_SALT: "salt",
    GOOGLE_CLIENT_ID: CLIENT_ID,
    SESSION_SECRET,
  };
}

async function googleJwt(
  claims: Record<string, unknown>,
  privateKey: CryptoKey,
  kid: string,
  now = new Date(),
) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid, typ: "JWT" })
    .setIssuer("https://accounts.google.com")
    .setAudience(CLIENT_ID)
    .setSubject(typeof claims.sub === "string" ? claims.sub : "sub-1")
    .setIssuedAt(now)
    .setExpirationTime(Math.floor(now.getTime() / 1000) + 120)
    .sign(privateKey);
}

async function testKeys() {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const jwk = await exportJWK(publicKey);
  jwk.kid = "test-kid";
  jwk.alg = "RS256";
  return {
    privateKey,
    jwks: createLocalJWKSet({ keys: [jwk] }),
  };
}

describe("Google ID token verification", () => {
  it("accepts a verified Google account", async () => {
    const { privateKey, jwks } = await testKeys();
    const credential = await googleJwt(
      {
        sub: "google-sub-1",
        email: "Kamal123@gmail.com",
        email_verified: true,
        name: "Kamal",
        picture: "https://lh3.googleusercontent.com/a/test",
        nonce: "abc",
      },
      privateKey,
      "test-kid",
    );
    const result = await verifyGoogleIdToken({
      credential,
      clientId: CLIENT_ID,
      nonce: "abc",
      jwks,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.identity.email).toBe("kamal123@gmail.com");
      expect(result.identity.subjectId).toBe("google-sub-1");
      expect(result.identity.displayName).toBe("Kamal");
    }
  });

  it("rejects a forged or invalid token", async () => {
    const result = await verifyGoogleIdToken({
      credential: "not-a-jwt",
      clientId: CLIENT_ID,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("invalid");
  });

  it("rejects a token without an email", async () => {
    const { privateKey, jwks } = await testKeys();
    const credential = await googleJwt(
      { sub: "google-sub-2", email_verified: true },
      privateKey,
      "test-kid",
    );
    const result = await verifyGoogleIdToken({ credential, clientId: CLIENT_ID, jwks });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("missing_email");
  });
});

describe("portal session", () => {
  it("persists the authenticated Google account in a signed cookie", async () => {
    const token = await createSessionToken(
      {
        email: "kamal123@gmail.com",
        subjectId: "google-sub-1",
        displayName: "Kamal",
        avatarUrl: null,
      },
      SESSION_SECRET,
    );
    const session = await readSessionToken(token, SESSION_SECRET);
    expect(session?.email).toBe("kamal123@gmail.com");
    expect(session?.subjectId).toBe("google-sub-1");
    const header = sessionCookieHeader(token, true);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Lax");
    expect(header).toContain("Secure");
    const request = new Request("https://aac.yasaboy.com/", { headers: { Cookie: header } });
    expect(readCookie(request, SESSION_COOKIE)).toBe(token);
  });

  it("clears the session cookie on logout", async () => {
    const response = await signOut(new Request("https://aac.yasaboy.com/api/auth/logout", { method: "POST" }));
    const cookie = response.headers.get("Set-Cookie") ?? "";
    expect(cookie).toContain(`${SESSION_COOKIE}=`);
    expect(cookie).toContain("Max-Age=0");
    expect(clearSessionCookieHeader(true)).toContain("Max-Age=0");
    const body = (await response.json()) as { authenticated: boolean };
    expect(body.authenticated).toBe(false);
  });
});

describe("authenticated tester records", () => {
  it("creates a tester record from Google Sign-In", async () => {
    const { privateKey, jwks } = await testKeys();
    const store = new MemoryStore();
    const now = new Date("2026-08-24T13:00:00.000Z");
    const credential = await googleJwt(
      {
        sub: "google-sub-1",
        email: "kamal123@gmail.com",
        email_verified: true,
        name: "Kamal",
      },
      privateKey,
      "test-kid",
      now,
    );
    const response = await signInWithGoogle({
      credential,
      env: env(),
      store,
      rateLimit: new MemoryRateLimitStore(),
      ipHash: "ip-1",
      now,
      request: new Request("https://aac.yasaboy.com/api/auth/google", { method: "POST" }),
      jwks,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      authenticated: boolean;
      email: string;
      playJoinUrl: string | null;
    };
    expect(body.authenticated).toBe(true);
    expect(body.email).toBe("kamal123@gmail.com");
    expect(body.playJoinUrl).toBeNull();
    const row = store.testers.get("kamal123@gmail.com");
    expect(row?.google_subject_id).toBe("google-sub-1");
    expect(row?.authenticated_at).toBeTruthy();
    expect(row?.status).toBe("requested");
  });

  it("upserts a duplicate authenticated account", async () => {
    const { privateKey, jwks } = await testKeys();
    const store = new MemoryStore();
    const now = new Date("2026-08-24T13:00:00.000Z");
    const credential = await googleJwt(
      { sub: "google-sub-1", email: "kamal123@gmail.com", email_verified: true },
      privateKey,
      "test-kid",
      now,
    );
    const input = {
      credential,
      env: env(),
      store,
      rateLimit: new MemoryRateLimitStore(),
      ipHash: "ip-1",
      now,
      request: new Request("https://aac.yasaboy.com/api/auth/google", { method: "POST" }),
      jwks,
    };
    await signInWithGoogle(input);
    const second = await signInWithGoogle({ ...input, now: new Date("2026-08-24T13:01:00.000Z") });
    const body = (await second.json()) as { duplicate: boolean };
    expect(store.testers.size).toBe(1);
    expect(body.duplicate).toBe(true);
  });

  it("rate limits repeated Google sign-in attempts", async () => {
    const rateLimit = new MemoryRateLimitStore();
    const store = new MemoryStore();
    for (let i = 0; i < 8; i += 1) {
      const response = await signInWithGoogle({
        credential: "bad",
        env: env(),
        store,
        rateLimit,
        ipHash: "same",
        now: new Date("2026-08-24T13:00:00.000Z"),
        request: new Request("https://aac.yasaboy.com/api/auth/google", { method: "POST" }),
      });
      expect(response.status).not.toBe(429);
    }
    const blocked = await signInWithGoogle({
      credential: "bad",
      env: env(),
      store,
      rateLimit,
      ipHash: "same",
      now: new Date("2026-08-24T13:00:00.000Z"),
      request: new Request("https://aac.yasaboy.com/api/auth/google", { method: "POST" }),
    });
    expect(blocked.status).toBe(429);
  });
});

describe("Play and install visibility", () => {
  it("hides Play links until membership is verified", async () => {
    const hidden = toClientPayload(
      { email: "kamal123@gmail.com", displayName: null, avatarUrl: null },
      {
        outcome: "continue",
        status: "requested",
        message: "x",
        detail: "x",
        membershipVerified: false,
        membershipVerification: "unavailable",
        groupJoinUrl: GROUP,
        playJoinUrl: PLAY,
        playStoreUrl: STORE,
        groupJoinStarted: true,
        playJoinStarted: false,
        bothLinksOpened: false,
        duplicate: false,
      },
    );
    expect(hidden.playJoinUrl).toBeNull();
    expect(hidden.playStoreUrl).toBeNull();
    expect(hidden.groupJoinUrl).toBe(GROUP);
  });

  it("shows Play and install links only after membership verification", async () => {
    const shown = toClientPayload(
      { email: "kamal123@gmail.com", displayName: null, avatarUrl: null },
      {
        outcome: "continue",
        status: "completed",
        message: "x",
        detail: "x",
        membershipVerified: true,
        membershipVerification: "verified",
        groupJoinUrl: GROUP,
        playJoinUrl: PLAY,
        playStoreUrl: STORE,
        groupJoinStarted: true,
        playJoinStarted: false,
        bothLinksOpened: false,
        duplicate: true,
      },
    );
    expect(shown.playJoinUrl).toBe(PLAY);
    expect(shown.playStoreUrl).toBe(STORE);
    expect(JSON.stringify(shown)).not.toContain("localhost");
    expect(JSON.stringify(shown)).not.toContain("127.0.0.1");
  });

  it("does not mark completed from Google Sign-In alone", async () => {
    const store = new MemoryStore();
    const result = await requestAccess({
      email: "kamal123@gmail.com",
      ipHash: "ip",
      now: new Date("2026-08-24T13:00:00.000Z"),
      store,
      rateLimit: new MemoryRateLimitStore(),
      groupEmail: "aac-sinhala-testers@googlegroups.com",
      groupJoinUrl: GROUP,
      playJoinUrl: PLAY,
      playStoreUrl: STORE,
      google: {
        email: "kamal123@gmail.com",
        subjectId: "google-sub-1",
        displayName: "Kamal",
        avatarUrl: null,
      },
    });
    expect(result.membershipVerified).toBe(false);
    expect(result.status).not.toBe("completed");
  });
});
