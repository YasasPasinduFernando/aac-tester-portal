import { describe, expect, it } from "vitest";
import { defaultGroupJoinUrl, deriveStatus, resolveGroupJoinUrl } from "../../shared/types";

describe("group and status helpers", () => {
  it("builds the official Google Groups URL from the group email", () => {
    expect(defaultGroupJoinUrl("aac-sinhala-testers@googlegroups.com")).toBe(
      "https://groups.google.com/g/aac-sinhala-testers",
    );
  });

  it("prefers a configured join URL", () => {
    expect(
      resolveGroupJoinUrl(
        "https://groups.google.com/g/aac-sinhala-testers",
        "aac-sinhala-testers@googlegroups.com",
      ),
    ).toBe("https://groups.google.com/g/aac-sinhala-testers");
  });

  it("does not mark completed from link clicks alone", () => {
    expect(
      deriveStatus({
        groupJoinStartedAt: "2026-08-24T10:00:00.000Z",
        playJoinStartedAt: "2026-08-24T10:01:00.000Z",
        membershipVerified: false,
      }),
    ).toBe("play_pending");
  });

  it("keeps the official group page URL rather than a fake auto-join link", () => {
    expect(defaultGroupJoinUrl("aac-sinhala-testers@googlegroups.com")).not.toMatch(/\/join$/);
    expect(defaultGroupJoinUrl("aac-sinhala-testers@googlegroups.com")).toBe(
      "https://groups.google.com/g/aac-sinhala-testers",
    );
  });
});
