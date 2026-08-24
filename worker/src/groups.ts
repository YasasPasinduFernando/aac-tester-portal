export type GroupAction = "check" | "invite" | "remove";

export type GroupCode =
  | "MEMBER"
  | "INVITED"
  | "PENDING"
  | "NOT_MEMBER"
  | "ADDED"
  | "ALREADY_MEMBER"
  | "MUTATION_UNAVAILABLE"
  | "AUTH_FAILURE"
  | "GROUP_FAILURE"
  | "INVALID_EMAIL"
  | "TEMPORARY_FAILURE";

export interface GroupBridgeResult {
  ok: boolean;
  code: GroupCode;
  isMember: boolean;
  role: string | null;
  mutated: boolean;
}

export interface GroupBridge {
  check(email: string): Promise<GroupBridgeResult>;
  invite(email: string): Promise<GroupBridgeResult>;
  remove(email: string): Promise<GroupBridgeResult>;
}

interface AppsScriptResponse {
  ok?: boolean;
  code?: string;
  isMember?: boolean;
  role?: string | null;
  mutated?: boolean;
}

function normalizeResult(payload: AppsScriptResponse, fallback: GroupCode): GroupBridgeResult {
  const code = (payload.code as GroupCode) || fallback;
  return {
    ok: Boolean(payload.ok),
    code,
    isMember: Boolean(payload.isMember),
    role: payload.role ?? null,
    mutated: Boolean(payload.mutated),
  };
}

export function createAppsScriptBridge(options: {
  url: string;
  sharedSecret: string;
  groupEmail: string;
  enableAdminDirectory: boolean;
  fetchImpl?: typeof fetch;
}): GroupBridge {
  const fetchImpl = options.fetchImpl ?? fetch;

  async function call(action: GroupAction, email: string): Promise<GroupBridgeResult> {
    if (!options.url || !options.sharedSecret) {
      return {
        ok: false,
        code: "AUTH_FAILURE",
        isMember: false,
        role: null,
        mutated: false,
      };
    }

    try {
      const response = await fetchImpl(options.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          email,
          groupEmail: options.groupEmail,
          enableAdminDirectory: options.enableAdminDirectory,
          sharedSecret: options.sharedSecret,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        return {
          ok: false,
          code: "AUTH_FAILURE",
          isMember: false,
          role: null,
          mutated: false,
        };
      }

      if (response.status >= 500) {
        return {
          ok: false,
          code: "TEMPORARY_FAILURE",
          isMember: false,
          role: null,
          mutated: false,
        };
      }

      const payload = (await response.json()) as AppsScriptResponse;
      return normalizeResult(payload, "GROUP_FAILURE");
    } catch {
      return {
        ok: false,
        code: "TEMPORARY_FAILURE",
        isMember: false,
        role: null,
        mutated: false,
      };
    }
  }

  return {
    check: (email) => call("check", email),
    invite: (email) => call("invite", email),
    remove: (email) => call("remove", email),
  };
}

export function mapGroupToStatus(result: GroupBridgeResult): {
  status: "member" | "eligible" | "invited" | "requested" | "error";
  confirmed: boolean;
} {
  if (result.isMember || result.code === "MEMBER" || result.code === "ALREADY_MEMBER") {
    const invited = result.role === "INVITED" || result.role === "PENDING" || result.code === "INVITED" || result.code === "PENDING";
    if (invited) return { status: "invited", confirmed: true };
    return { status: "eligible", confirmed: true };
  }
  if (result.code === "ADDED" || result.code === "INVITED") {
    return { status: "invited", confirmed: true };
  }
  if (result.code === "MUTATION_UNAVAILABLE" || result.code === "NOT_MEMBER") {
    return { status: "requested", confirmed: false };
  }
  if (result.code === "AUTH_FAILURE" || result.code === "GROUP_FAILURE" || result.code === "TEMPORARY_FAILURE") {
    return { status: "error", confirmed: false };
  }
  return { status: "requested", confirmed: false };
}
