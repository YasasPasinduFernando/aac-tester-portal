import { describe, expect, it } from "vitest";
import { MemoryRateLimitStore } from "../src/rate-limit";
import { checkAccess, recordJoinEvent, requestAccess } from "../src/testers";
import type { GroupBridge, GroupBridgeResult } from "../src/groups";
import { MemoryStore } from "./helpers";

const PLAY = "https://play.google.com/apps/testing/lk.aac.sinhala_tamil_english";
const GROUP = "https://groups.google.com/g/aac-sinhala-testers";

async function run(options: {
  email?: unknown;
  store?: MemoryStore;
  rateLimit?: MemoryRateLimitStore;
  ipHash?: string;
  playJoinUrl?: string | null;
  membershipVerified?: boolean;
}) {
  return requestAccess({
    email: options.email ?? "tester@example.com",
    ipHash: options.ipHash ?? "abc",
    now: new Date("2026-08-24T10:00:00.000Z"),
    store: options.store ?? new MemoryStore(),
    rateLimit: options.rateLimit ?? new MemoryRateLimitStore(),
    groupEmail: "aac-sinhala-testers@googlegroups.com",
    groupJoinUrl: GROUP,
    playJoinUrl: options.playJoinUrl === undefined ? PLAY : options.playJoinUrl,
    playStoreUrl: "https://play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english",
    membershipVerified: options.membershipVerified,
  });
}

describe("tester access flow", () => {
  it("rejects invalid email", async () => {
    const result = await run({ email: "not-valid" });
    expect(result.outcome).toBe("invalid_email");
    expect(result.groupJoinUrl).toBeNull();
    expect(result.playJoinUrl).toBeNull();
    expect(result.playStoreUrl).toBeNull();
  });

  it("saves a valid email and returns self-service join links", async () => {
    const store = new MemoryStore();
    const result = await run({ store });
    expect(result.outcome).toBe("continue");
    expect(result.message).toBe("You're almost ready!");
    expect(result.groupJoinUrl).toBe(GROUP);
    expect(result.playJoinUrl).toBe(PLAY);
    expect(result.playStoreUrl).toBe(
      "https://play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english",
    );
    expect(result.membershipVerified).toBe(false);
    expect(result.membershipVerification).toBe("unavailable");
    expect(store.testers.get("tester@example.com")?.status).toBe("requested");
  });

  it("does not claim membership from a button or missing API", async () => {
    const result = await run({ membershipVerified: false });
    expect(result.membershipVerified).toBe(false);
    expect(JSON.stringify(result)).not.toContain("You have been added");
  });

  it("upserts duplicate emails into one row and lets them continue", async () => {
    const store = new MemoryStore();
    const first = await run({ store });
    const second = await run({ store });
    expect(store.testers.size).toBe(1);
    expect(second.duplicate).toBe(true);
    expect(first.status).toBe("requested");
    expect(second.groupJoinUrl).toBe(GROUP);
  });

  it("records group and Play link opens without marking completed", async () => {
    const store = new MemoryStore();
    await run({ store });
    const group = await recordJoinEvent({
      email: "tester@example.com",
      event: "group_join",
      now: new Date("2026-08-24T10:01:00.000Z"),
      store,
    });
    expect(group.record?.status).toBe("group_pending");
    const play = await recordJoinEvent({
      email: "tester@example.com",
      event: "play_join",
      now: new Date("2026-08-24T10:02:00.000Z"),
      store,
    });
    expect(play.record?.status).toBe("play_pending");
    expect(play.record?.status).not.toBe("completed");
  });

  it("marks completed only when membership is actually verified", async () => {
    const store = new MemoryStore();
    const result = await run({ store, membershipVerified: true });
    expect(result.membershipVerified).toBe(true);
    expect(result.status).toBe("completed");
  });

  it("rate limits repeated requests from the same client", async () => {
    const rateLimit = new MemoryRateLimitStore();
    for (let i = 0; i < 5; i += 1) {
      const result = await run({ rateLimit, ipHash: "same" });
      expect(result.outcome).not.toBe("rate_limited");
    }
    const blocked = await run({ rateLimit, ipHash: "same" });
    expect(blocked.outcome).toBe("rate_limited");
  });

  it("omits the Play URL when it is not configured", async () => {
    const result = await run({ playJoinUrl: null });
    expect(result.playJoinUrl).toBeNull();
    expect(result.groupJoinUrl).toBe(GROUP);
  });

  it("returns the official Google Groups page, not a localhost URL", async () => {
    const result = await run({});
    expect(result.groupJoinUrl).toBe("https://groups.google.com/g/aac-sinhala-testers");
    expect(JSON.stringify(result)).not.toContain("localhost");
  });
});

function groupsBridge(result: GroupBridgeResult): GroupBridge {
  return {
    check: async () => result,
    invite: async () => result,
    remove: async () => result,
  };
}

describe("Check My Access", () => {
  const now = new Date("2026-08-24T10:05:00.000Z");
  const STORE_URL = "https://play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english";

  it("does not claim success when membership verification is unavailable", async () => {
    const store = new MemoryStore();
    await run({ store });
    const result = await checkAccess({
      email: "tester@example.com",
      now,
      store,
      groups: null,
      groupEmail: "aac-sinhala-testers@googlegroups.com",
      groupJoinUrl: GROUP,
      playJoinUrl: PLAY,
      playStoreUrl: STORE_URL,
    });
    expect(result.membershipVerified).toBe(false);
    expect(result.membershipVerification).toBe("unavailable");
    expect(result.message).toContain("can't confirm group membership automatically");
    expect(JSON.stringify(result)).not.toContain("You have been added");
  });

  it("does not claim success when Google says the email is not a member", async () => {
    const store = new MemoryStore();
    await run({ store });
    const result = await checkAccess({
      email: "tester@example.com",
      now,
      store,
      groups: groupsBridge({
        ok: true,
        code: "NOT_MEMBER",
        isMember: false,
        role: null,
        mutated: false,
      }),
      groupEmail: "aac-sinhala-testers@googlegroups.com",
      groupJoinUrl: GROUP,
      playJoinUrl: PLAY,
      playStoreUrl: STORE_URL,
    });
    expect(result.membershipVerified).toBe(false);
    expect(result.membershipVerification).toBe("not_member");
    expect(result.message).toContain("hasn't been detected yet");
  });

  it("shows You're ready only when membership is verified", async () => {
    const store = new MemoryStore();
    await run({ store });
    const result = await checkAccess({
      email: "tester@example.com",
      now,
      store,
      groups: groupsBridge({
        ok: true,
        code: "MEMBER",
        isMember: true,
        role: "MEMBER",
        mutated: false,
      }),
      groupEmail: "aac-sinhala-testers@googlegroups.com",
      groupJoinUrl: GROUP,
      playJoinUrl: PLAY,
      playStoreUrl: STORE_URL,
    });
    expect(result.membershipVerified).toBe(true);
    expect(result.message).toBe("You're ready!");
    expect(result.playJoinUrl).toBe(PLAY);
    expect(result.playStoreUrl).toBe(STORE_URL);
    expect(store.testers.get("tester@example.com")?.membership_verified).toBe(1);
  });
});
