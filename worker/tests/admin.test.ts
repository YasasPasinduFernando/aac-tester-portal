import { describe, expect, it } from "vitest";
import { authenticateAdmin } from "../src/admin";
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
    await store.upsertTester({
      id: "1",
      email: "hidden-tester@example.com",
      status: "requested",
      requested_at: "2026-08-24T10:00:00.000Z",
      last_verified_at: null,
      last_download_check_at: null,
      last_website_activity_at: null,
      installed_confirmed_at: null,
      removed_at: null,
      error_message: null,
    });
    const stats = await store.adminStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.pendingRequests).toBe(1);
  });
});
