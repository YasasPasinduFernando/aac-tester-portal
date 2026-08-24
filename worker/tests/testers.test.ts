import { describe, expect, it } from "vitest";
import { MemoryRateLimitStore } from "../src/rate-limit";
import type { GroupBridge, GroupBridgeResult } from "../src/groups";
import { requestAccess } from "../src/testers";
import { MemoryStore } from "./helpers";

const PLAY = "https://play.google.com/apps/testing/lk.aac.sinhala_tamil_english";

function bridge(result: Partial<GroupBridgeResult>, invite?: Partial<GroupBridgeResult>): GroupBridge {
  const checkResult: GroupBridgeResult = {
    ok: true,
    code: "NOT_MEMBER",
    isMember: false,
    role: null,
    mutated: false,
    ...result,
  };
  const inviteResult: GroupBridgeResult = {
    ok: false,
    code: "MUTATION_UNAVAILABLE",
    isMember: false,
    role: null,
    mutated: false,
    ...invite,
  };
  return {
    check: async () => checkResult,
    invite: async () => inviteResult,
    remove: async () => inviteResult,
  };
}

async function run(options: {
  email?: unknown;
  store?: MemoryStore;
  groups?: GroupBridge;
  rateLimit?: MemoryRateLimitStore;
  ipHash?: string;
}) {
  return requestAccess({
    email: options.email ?? "tester@example.com",
    ipHash: options.ipHash ?? "abc",
    now: new Date("2026-08-24T10:00:00.000Z"),
    store: options.store ?? new MemoryStore(),
    rateLimit: options.rateLimit ?? new MemoryRateLimitStore(),
    groups: options.groups ?? bridge({}),
    playJoinUrl: PLAY,
  });
}

describe("tester access flow", () => {
  it("rejects invalid email before calling Google", async () => {
    const result = await run({ email: "not-valid" });
    expect(result.outcome).toBe("invalid_email");
    expect(result.membershipConfirmed).toBe(false);
    expect(result.playJoinUrl).toBeNull();
  });

  it("treats an existing member as success", async () => {
    const result = await run({
      groups: bridge({ ok: true, code: "MEMBER", isMember: true, role: "MEMBER" }),
    });
    expect(result.outcome).toBe("ready");
    expect(result.membershipConfirmed).toBe(true);
    expect(result.status).toBe("eligible");
    expect(result.playJoinUrl).toBe(PLAY);
    expect(result.message).toBe("You're ready!");
  });

  it("treats a confirmed invitation as success", async () => {
    const result = await run({
      groups: bridge(
        { ok: true, code: "NOT_MEMBER", isMember: false },
        { ok: true, code: "ADDED", isMember: true, mutated: true, role: "MEMBER" },
      ),
    });
    expect(result.outcome).toBe("ready");
    expect(result.membershipConfirmed).toBe(true);
    expect(result.status).toBe("eligible");
  });

  it("does not claim success when mutation is unavailable", async () => {
    const store = new MemoryStore();
    const result = await run({
      store,
      groups: bridge(
        { code: "NOT_MEMBER", isMember: false },
        { ok: false, code: "MUTATION_UNAVAILABLE", mutated: false },
      ),
    });
    expect(result.outcome).toBe("pending");
    expect(result.membershipConfirmed).toBe(false);
    expect(result.message).toContain("request has been received");
    expect(store.testers.get("tester@example.com")?.status).toBe("requested");
  });

  it("upserts duplicate requests instead of creating a second row", async () => {
    const store = new MemoryStore();
    const groups = bridge(
      { code: "NOT_MEMBER", isMember: false },
      { ok: false, code: "MUTATION_UNAVAILABLE" },
    );
    await run({ store, groups });
    await run({ store, groups });
    expect(store.testers.size).toBe(1);
    expect(store.testers.get("tester@example.com")?.status).toBe("requested");
  });

  it("returns a friendly message when Google integration fails", async () => {
    const result = await run({
      groups: bridge(
        { ok: false, code: "AUTH_FAILURE", isMember: false },
        { ok: false, code: "AUTH_FAILURE", isMember: false },
      ),
    });
    expect(result.outcome).toBe("unavailable");
    expect(result.membershipConfirmed).toBe(false);
    expect(result.message).toContain("request has been received");
    expect(JSON.stringify(result).includes("stack")).toBe(false);
  });

  it("rate limits repeated requests from the same client", async () => {
    const rateLimit = new MemoryRateLimitStore();
    const groups = bridge({});
    for (let i = 0; i < 5; i += 1) {
      const result = await run({ rateLimit, groups, ipHash: "same" });
      expect(result.outcome).not.toBe("rate_limited");
    }
    const blocked = await run({ rateLimit, groups, ipHash: "same" });
    expect(blocked.outcome).toBe("rate_limited");
  });
});
