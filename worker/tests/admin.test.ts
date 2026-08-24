import { describe, expect, it } from "vitest";
import { authenticateAdmin } from "../src/admin";
import { emptyTester } from "../src/store";
import { MemoryStore } from "./helpers";

describe("admin authentication", () => {
  it("denies admin access without Cloudflare Access in production", async () => {
    const identity = await authenticateAdmin({
      request: new Request("https://aac.yasaboy.com/api/admin/stats"),
      environment: "production",
    });
    expect(identity).toBeNull();
  });

  it("does not accept a password header in production", async () => {
    const identity = await authenticateAdmin({
      request: new Request("https://aac.yasaboy.com/api/admin/stats", {
        headers: {
          Authorization: "Bearer hunter2",
          "X-Admin-Password": "admin",
          "X-Admin-Dev-Email": "owner@example.com",
        },
      }),
      environment: "production",
    });
    expect(identity).toBeNull();
  });

  it("allows a local development identity header only in development", async () => {
    const identity = await authenticateAdmin({
      request: new Request("http://localhost:8787/api/admin/stats", {
        headers: { "X-Admin-Dev-Email": "owner@example.com" },
      }),
      environment: "development",
    });
    expect(identity?.email).toBe("owner@example.com");
  });

  it("keeps tester emails in the admin payload only", async () => {
    const store = new MemoryStore();
    await store.upsertTester(emptyTester("hidden-tester@example.com", new Date("2026-08-24T10:00:00.000Z")));
    const stats = await store.adminStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.pendingGroupJoins).toBe(1);
    expect(stats.feedbackCount).toBe(0);
  });
});
