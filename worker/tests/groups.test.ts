import { describe, expect, it } from "vitest";
import { createAppsScriptBridge, mapGroupToStatus } from "../src/groups";

describe("Google Groups bridge", () => {
  it("maps already-member results to a confirmed eligible status", () => {
    const mapped = mapGroupToStatus({
      ok: true,
      code: "ALREADY_MEMBER",
      isMember: true,
      role: "MEMBER",
      mutated: false,
    });
    expect(mapped).toEqual({ status: "eligible", confirmed: true });
  });

  it("does not confirm membership when Apps Script reports mutation unavailable", () => {
    const mapped = mapGroupToStatus({
      ok: false,
      code: "MUTATION_UNAVAILABLE",
      isMember: false,
      role: null,
      mutated: false,
    });
    expect(mapped.confirmed).toBe(false);
    expect(mapped.status).toBe("requested");
  });

  it("sends the shared secret only in the server-side JSON body", async () => {
    const calls: RequestInit[] = [];
    const bridge = createAppsScriptBridge({
      url: "https://script.google.com/macros/s/example/exec",
      sharedSecret: "server-only-secret",
      groupEmail: "aac-sinhala-testers@googlegroups.com",
      enableAdminDirectory: false,
      fetchImpl: (async (_url, init) => {
        calls.push(init ?? {});
        return new Response(
          JSON.stringify({ ok: true, code: "MEMBER", isMember: true, mutated: false }),
        );
      }) as typeof fetch,
    });

    await bridge.check("tester@example.com");
    const body = JSON.parse(String(calls[0]?.body));
    expect(body.sharedSecret).toBe("server-only-secret");
    expect(JSON.stringify(calls[0]?.headers ?? {})).not.toContain("Bearer");
  });
});
