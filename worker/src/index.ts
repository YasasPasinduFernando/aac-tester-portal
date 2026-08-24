import { authenticateAdmin } from "./admin";
import { runCleanup } from "./cleanup";
import { autoRemovalEnabled, inactivityDays, type Env } from "./env";
import { submitFeedback } from "./feedback";
import { createAppsScriptBridge } from "./groups";
import { jsonResponse, withSecurityHeaders } from "./headers";
import { d1RateLimitStore } from "./rate-limit";
import { corsHeaders, hashIp, isAllowedOrigin, rejectCsrf, requestOrigin } from "./security";
import { d1Store } from "./store";
import { confirmInstall, requestAccess } from "./testers";

const MAX_JSON_BYTES = 32_768;

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const response = await handleRequest(request, env);
    return withSecurityHeaders(response, request);
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await runScheduledCleanup(env);
  },
};

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = requestOrigin(request);
  const cors = isAllowedOrigin(env, origin) ? corsHeaders(origin) : {};

  if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    return new Response(null, { status: 204, headers: cors });
  }

  if (url.pathname.startsWith("/api/")) {
    const csrf = rejectCsrf(env, request);
    if (csrf) return csrf;

    if (url.pathname === "/api/health" && request.method === "GET") {
      return jsonResponse({ ok: true, service: "aac-tester-portal" }, { headers: cors });
    }
    if (url.pathname === "/api/testers/request" && request.method === "POST") {
      try {
        return withCors(await handleTesterRequest(request, env), cors);
      } catch {
        return jsonResponse(
          {
            outcome: "unavailable",
            message: "Your request has been received. Please continue with Google Play.",
          },
          { status: 200, headers: cors },
        );
      }
    }
    if (url.pathname === "/api/testers/confirm-install" && request.method === "POST") {
      try {
        return withCors(await handleConfirmInstall(request, env), cors);
      } catch {
        return jsonResponse({ ok: false, message: "Please try again in a moment." }, { status: 503, headers: cors });
      }
    }
    if (url.pathname === "/api/feedback" && request.method === "POST") {
      try {
        return withCors(await handleFeedback(request, env), cors);
      } catch {
        return jsonResponse({ ok: false, message: "Please try again in a moment." }, { status: 503, headers: cors });
      }
    }
    if (url.pathname === "/api/admin/stats" && request.method === "GET") {
      return withCors(await handleAdminStats(request, env), cors);
    }
    return jsonResponse({ error: "not_found" }, { status: 404, headers: cors });
  }

  if (
    (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) &&
    env.ENVIRONMENT !== "development"
  ) {
    const identity = await authenticateAdmin({
      request,
      teamDomain: env.CF_ACCESS_TEAM_DOMAIN,
      audience: env.CF_ACCESS_AUD,
      environment: env.ENVIRONMENT,
    });
    if (!identity) {
      return jsonResponse({ error: "unauthorized" }, { status: 401 });
    }
  }

  return env.ASSETS.fetch(request);
}

function withCors(response: Response, cors: HeadersInit): Response {
  const headers = new Headers(response.headers);
  const corsHeadersInit = new Headers(cors);
  corsHeadersInit.forEach((value, key) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("Content-Length") || "0");
  if (length > MAX_JSON_BYTES) {
    throw new Error("payload");
  }
  const payload = (await request.json()) as unknown;
  if (!payload || typeof payload !== "object") return {};
  return payload as Record<string, unknown>;
}

function groupsFromEnv(env: Env) {
  return createAppsScriptBridge({
    url: env.APPS_SCRIPT_URL,
    sharedSecret: env.APPS_SCRIPT_SHARED_SECRET,
    groupEmail: env.GOOGLE_GROUP_EMAIL,
    enableAdminDirectory: (env.ENABLE_ADMIN_DIRECTORY || "false").toLowerCase() === "true",
  });
}

async function handleTesterRequest(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const result = await requestAccess({
    email: body.email,
    ipHash: await hashIp(env, request),
    now: new Date(),
    store: d1Store(env.DB),
    rateLimit: d1RateLimitStore(env.DB),
    groups: groupsFromEnv(env),
    playJoinUrl: env.PLAY_TEST_JOIN_URL,
  });

  const status =
    result.outcome === "invalid_email" ? 400 : result.outcome === "rate_limited" ? 429 : 200;

  return jsonResponse(
    {
      outcome: result.outcome,
      status: result.status,
      message: result.message,
      detail: result.detail,
      membershipConfirmed: result.membershipConfirmed,
      playJoinUrl: result.playJoinUrl,
    },
    { status },
  );
}

async function handleConfirmInstall(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const result = await confirmInstall({
    email: body.email,
    now: new Date(),
    store: d1Store(env.DB),
  });
  return jsonResponse(result, { status: result.ok ? 200 : 400 });
}

async function handleFeedback(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get("Content-Type") || "";
  let email: unknown;
  let feedbackType: unknown;
  let message: unknown;
  let screenshot: { bytes: Uint8Array; contentType: string } | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    email = form.get("email");
    feedbackType = form.get("feedbackType");
    message = form.get("message");
    const file = form.get("screenshot");
    if (file instanceof File && file.size > 0) {
      screenshot = {
        bytes: new Uint8Array(await file.arrayBuffer()),
        contentType: file.type || "application/octet-stream",
      };
    }
  } else {
    const body = await readJson(request);
    email = body.email;
    feedbackType = body.feedbackType;
    message = body.message;
  }

  const result = await submitFeedback({
    data: { email, feedbackType, message, screenshot },
    now: new Date(),
    store: d1Store(env.DB),
    bucket: env.FEEDBACK_BUCKET,
  });
  return jsonResponse(result, { status: result.ok ? 200 : 400 });
}

async function handleAdminStats(request: Request, env: Env): Promise<Response> {
  const identity = await authenticateAdmin({
    request,
    teamDomain: env.CF_ACCESS_TEAM_DOMAIN,
    audience: env.CF_ACCESS_AUD,
    environment: env.ENVIRONMENT,
  });
  if (!identity) {
    return jsonResponse({ error: "unauthorized" }, { status: 401 });
  }
  const stats = await d1Store(env.DB).adminStats();
  const testers = await d1Store(env.DB).listTesters();
  return jsonResponse({
    admin: identity.email,
    stats,
    testers,
  });
}

export async function runScheduledCleanup(env: Env): Promise<void> {
  const store = d1Store(env.DB);
  const groups = groupsFromEnv(env);
  const testers = await store.listTesters();
  const now = new Date();

  await runCleanup({
    testers,
    now,
    inactivityDays: inactivityDays(env),
    enableAutoRemoval: autoRemovalEnabled(env),
    async checkMember(email) {
      const result = await groups.check(email);
      if (result.code === "TEMPORARY_FAILURE" || result.code === "AUTH_FAILURE") {
        return null;
      }
      await store.updateTester(email, { last_verified_at: now.toISOString() });
      return result.isMember;
    },
    async removeMember(email) {
      if (!autoRemovalEnabled(env)) return false;
      const result = await groups.remove(email);
      return result.ok && (result.code === "NOT_MEMBER" || Boolean(result.mutated));
    },
    async markRemoved(email, errorMessage) {
      await store.updateTester(email, {
        status: "removed",
        removed_at: now.toISOString(),
        error_message: errorMessage,
      });
    },
  });
}
