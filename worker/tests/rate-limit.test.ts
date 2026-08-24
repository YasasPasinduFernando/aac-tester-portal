import { describe, expect, it } from "vitest";
import { MemoryRateLimitStore } from "../src/rate-limit";

describe("rate limiting", () => {
  it("allows requests under the limit and blocks afterwards", async () => {
    const store = new MemoryRateLimitStore();
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) {
      expect(await store.consume("ip:1", 3, 60_000, now)).toBe(true);
    }
    expect(await store.consume("ip:1", 3, 60_000, now)).toBe(false);
  });

  it("resets after the window", async () => {
    const store = new MemoryRateLimitStore();
    expect(await store.consume("ip:1", 1, 60_000, 0)).toBe(true);
    expect(await store.consume("ip:1", 1, 60_000, 1)).toBe(false);
    expect(await store.consume("ip:1", 1, 60_000, 60_000)).toBe(true);
  });
});
