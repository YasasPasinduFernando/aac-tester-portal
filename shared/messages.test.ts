import { describe, expect, it } from "vitest";
import {
  alreadyJoinedPrompt,
  GROUP_JOIN_WALKTHROUGH,
  GUIDE_SHOTS,
  USER_MESSAGES,
} from "./types";

describe("tester group join copy", () => {
  it("labels the email as the Google Play account", () => {
    expect(USER_MESSAGES.playStoreEmailLabel).toBe("Google Play account");
    expect(USER_MESSAGES.accountEnteredLabel).toBe("Google Play account");
  });

  it("tells everyone to use the Play Store account", () => {
    expect(USER_MESSAGES.playStoreEveryone).toBe(
      "Everyone must use the Google account they use on Google Play.",
    );
  });

  it("uses the exact Play Store account warning", () => {
    expect(USER_MESSAGES.playAccountImportant).toBe(
      "IMPORTANT: Use the same Google account you use on Google Play.",
    );
  });

  it("asks testers to switch Google Groups to the entered account", () => {
    expect(USER_MESSAGES.beforeJoiningSignedIn).toBe(
      "Before joining, make sure Google Groups is signed in with:",
    );
    expect(USER_MESSAGES.switchIfAnotherAccount).toBe(
      "If another Google account is currently active in your browser, switch to the account above before joining the group.",
    );
  });

  it("helps testers who joined with the wrong account", () => {
    expect(USER_MESSAGES.wrongAccountHeading).toBe("Using the wrong Google account?");
    expect(USER_MESSAGES.wrongAccountHelp).toBe(
      "Go back to Google Groups, switch to the Google account shown above, and join the tester group again.",
    );
  });

  it("asks if they already joined with the entered email", () => {
    expect(alreadyJoinedPrompt("tester@gmail.com")).toBe("Already joined with tester@gmail.com?");
  });

  it("tells testers to return and check access", () => {
    expect(USER_MESSAGES.afterJoinCheck).toBe(
      "After joining, come back here and tap Check My Access.",
    );
  });

  it("does not claim membership from opening the group", () => {
    expect(USER_MESSAGES.inTheGroup).toBe("Tester group joined");
    expect(USER_MESSAGES.checkAccessNotDetected).toBe("Your membership hasn't been detected yet.");
    expect(USER_MESSAGES.inTheGroup.toLowerCase()).not.toContain("you have joined");
  });

  it("walks through join, account check, and return", () => {
    expect(GROUP_JOIN_WALKTHROUGH).toEqual([
      "Open the tester group",
      'Tap "Join group"',
      "Come back and tap Check My Access",
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
