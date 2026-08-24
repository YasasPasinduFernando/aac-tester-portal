import { authenticateAdmin } from "./admin";
import { runMaintenance } from "./cleanup";
import { inactivityDays, playJoinUrl, type Env } from "./env";
import { submitFeedback } from "./feedback";
import { createAppsScriptBridge } from "./groups";
import { jsonResponse, withSecurityHeaders } from "./headers";
import { d1RateLimitStore } from "./rate-limit";
import { corsHeaders, hashIp, isAllowedOrigin, rejectCsrf, requestOrigin } from "./security";
import { d1Store } from "./store";
import { recordJoinEvent, requestAccess } from "./testers";

const MAX_JSON_BYTES = 32_768;

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const response = await handleRequest(request, env);
    return withSecurityHeaders(response, request);
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await runScheduledMaintenance(env);
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
            message: "Please try again in a moment.",
          },
          { status: 503, headers: cors },
        );
      }
    }
    if (url.pathname === "/api/testers/event" && request.method === "POST") {
      try {
        return withCors(await handleTesterEvent(request, env), cors);
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
    if (url.pathname === "/api/admin/export.csv" && request.method === "GET") {
      return withCors(await handleAdminExport(request, env), cors);
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

async function optionalMembershipVerified(env: Env, email: string): Promise<boolean> {
  if (!env.APPS_SCRIPT_URL || !env.APPS_SCRIPT_SHARED_SECRET) return false;
  try {
    const groups = createAppsScriptBridge({
      url: env.APPS_SCRIPT_URL,
      sharedSecret: env.APPS_SCRIPT_SHARED_SECRET,
      groupEmail: env.GOOGLE_GROUP_EMAIL,
      enableAdminDirectory: false,
    });
    const result = await groups.check(email);
    return result.isMember === true;
  } catch {
    return false;
  }
}

async function handleTesterRequest(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = typeof body.email === "string" ? body.email : "";
  const membershipVerified = await optionalMembershipVerified(env, email);
  const result = await requestAccess({
    email: body.email,
    ipHash: await hashIp(env, request),
    now: new Date(),
    store: d1Store(env.DB),
    rateLimit: d1RateLimitStore(env.DB),
    groupEmail: env.GOOGLE_GROUP_EMAIL,
    groupJoinUrl: env.GOOGLE_GROUP_JOIN_URL,
    playJoinUrl: playJoinUrl(env),
    membershipVerified,
  });

  const status =
    result.outcome === "invalid_email" ? 400 : result.outcome === "rate_limited" ? 429 : 200;

  return jsonResponse(result, { status });
}

async function handleTesterEvent(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const result = await recordJoinEvent({
    email: body.email,
    event: body.event,
    now: new Date(),
    store: d1Store(env.DB),
  });
  return jsonResponse(
    {
      ok: result.ok,
      message: result.message,
      status: result.record?.status ?? null,
      groupJoinStarted: Boolean(result.record?.group_join_started_at),
      playJoinStarted: Boolean(result.record?.play_join_started_at),
      membershipVerified: result.record?.membership_verified === 1,
    },
    { status: result.ok ? 200 : 400 },
  );
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

async function requireAdmin(request: Request, env: Env) {
  return authenticateAdmin({
    request,
    teamDomain: env.CF_ACCESS_TEAM_DOMAIN,
    audience: env.CF_ACCESS_AUD,
    environment: env.ENVIRONMENT,
  });
}

async function handleAdminStats(request: Request, env: Env): Promise<Response> {
  const identity = await requireAdmin(request, env);
  if (!identity) {
    return jsonResponse({ error: "unauthorized" }, { status: 401 });
  }
  const store = d1Store(env.DB);
  const stats = await store.adminStats();
  const testers = await store.listTesters();
  return jsonResponse({
    admin: identity.email,
    stats,
    testers,
  });
}

async function handleAdminExport(request: Request, env: Env): Promise<Response> {
  const identity = await requireAdmin(request, env);
  if (!identity) {
    return jsonResponse({ error: "unauthorized" }, { status: 401 });
  }
  const testers = await d1Store(env.DB).listTesters();
  const header = [
    "email",
    "status",
    "requested_at",
    "group_join_started_at",
    "play_join_started_at",
    "feedback_submitted",
    "membership_verified",
    "last_activity_at",
  ];
  const lines = [
    header.join(","),
    ...testers.map((row) =>
      [
        csv(row.email),
        csv(row.status),
        csv(row.requested_at),
        csv(row.group_join_started_at ?? ""),
        csv(row.play_join_started_at ?? ""),
        row.feedback_submitted,
        row.membership_verified,
        csv(row.last_activity_at ?? ""),
      ].join(","),
    ),
  ];
  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=aac-tester-requests.csv",
      "Cache-Control": "no-store",
    },
  });
}

function csv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll("\"", "\"\"")}"`;
  return value;
}

export async function runScheduledMaintenance(env: Env): Promise<void> {
  const store = d1Store(env.DB);
  const testers = await store.listTesters();
  await runMaintenance({
    testers,
    now: new Date(),
    inactivityDays: inactivityDays(env),
    async applyStatus(email, status, updatedAt) {
      await store.updateTester(email, { status, updated_at: updatedAt });
    },
  });
}
