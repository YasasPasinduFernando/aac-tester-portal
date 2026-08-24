import { describe, expect, it } from "vitest";
import { SECURITY_HEADERS } from "../src/headers";
import { playJoinUrl, playStoreUrl, type Env } from "../src/env";

describe("security headers for Google Identity Services", () => {
  it("allows the official Google Identity Services origins", () => {
    const csp = SECURITY_HEADERS["Content-Security-Policy"];
    expect(csp).toContain("https://accounts.google.com");
    expect(csp).toContain("frame-src https://accounts.google.com");
    expect(SECURITY_HEADERS["Cross-Origin-Opener-Policy"]).toBe("same-origin-allow-popups");
  });
});

describe("production Play URLs", () => {
  it("keeps official Play links and never localhost", () => {
    const env = {
      PLAY_TEST_JOIN_URL: "https://play.google.com/apps/testing/lk.aac.sinhala_tamil_english",
      PLAY_STORE_URL: "https://play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english",
    } as Env;
    expect(playJoinUrl(env)).toContain("play.google.com");
    expect(playStoreUrl(env)).toContain("play.google.com");
    expect(playJoinUrl(env)).not.toContain("localhost");
    expect(playStoreUrl(env)).not.toContain("5173");
  });
});
