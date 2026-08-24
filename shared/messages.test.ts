import { describe, expect, it } from "vitest";
import { GROUP_JOIN_WALKTHROUGH, GUIDE_SHOTS, USER_MESSAGES } from "./types";

describe("tester group join copy", () => {
  it("tells everyone to use the Play Store account", () => {
    expect(USER_MESSAGES.playStoreEveryone).toBe(
      "Everyone must use the Google account they use on Google Play.",
    );
  });

  it("uses the exact Play Store account warning", () => {
    expect(USER_MESSAGES.playAccountImportant).toBe(
      "Please use the same Google account you use on Google Play to join the tester group.",
    );
  });

  it("tells testers to return and check access", () => {
    expect(USER_MESSAGES.afterJoinCheck).toBe(
      "After joining, come back here and tap Check My Access.",
    );
  });

  it("does not claim membership from opening the group", () => {
    expect(USER_MESSAGES.inTheGroup).toBe("Tester group joined");
    expect(USER_MESSAGES.checkAccessNotDetected).toBe("Your membership hasn't been detected yet.");
  });

  it("walks through join, account check, and return", () => {
    expect(GROUP_JOIN_WALKTHROUGH).toEqual([
      "Open the tester group",
      "Make sure you're signed in with the email above",
      'Tap "Join group"',
      "Return to this page",
      'Tap "Check My Access"',
    ]);
  });

  it("points testers at the three onboarding screenshots", () => {
    expect(GUIDE_SHOTS.joinGroup.src).toBe("/images/guides/join-group.png");
    expect(GUIDE_SHOTS.becomeTester.src).toBe("/images/guides/become-tester.png");
    expect(GUIDE_SHOTS.installApp.src).toBe("/images/guides/install-app.png");
    expect(GUIDE_SHOTS.joinGroup.caption).toBe("Tap Join group");
    expect(GUIDE_SHOTS.becomeTester.caption).toBe("Tap Become a tester");
    expect(GUIDE_SHOTS.installApp.caption).toBe("Tap Install");
  });
});
