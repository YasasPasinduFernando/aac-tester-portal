import { describe, expect, it } from "vitest";
import {
  alreadyJoinedPrompt,
  GROUP_JOIN_WALKTHROUGH,
  GUIDE_SHOTS,
  playStepsUnlocked,
  USER_MESSAGES,
} from "./types";

describe("tester group join copy", () => {
  it("labels the signed-in identity as Your Google Play account", () => {
    expect(USER_MESSAGES.playStoreEmailLabel).toBe("Your Google Play account");
    expect(USER_MESSAGES.accountEnteredLabel).toBe("Your Google Play account");
  });

  it("uses the exact same-account message", () => {
    expect(USER_MESSAGES.sameAccountGroupsAndPlay).toBe(
      "Use the same Google account for the tester group and Google Play.",
    );
  });

  it("asks testers to switch Google Groups to the authenticated account", () => {
    expect(USER_MESSAGES.authenticatedAccountIs).toBe("The account you authenticated with is:");
    expect(USER_MESSAGES.whenJoiningExactAccount).toBe(
      "When you join the tester group, make sure Google Groups is signed in with this exact account.",
    );
    expect(USER_MESSAGES.switchIfAnotherAccount).toBe(
      "If another Google account is active in Google Groups, switch to the account shown above before tapping Join group.",
    );
  });

  it("helps testers who joined with the wrong account", () => {
    expect(USER_MESSAGES.wrongAccountHeading).toBe("Using the wrong Google account?");
    expect(USER_MESSAGES.checkAccessUnavailable).toBe(
      "Membership verification is currently unavailable.",
    );
    expect(USER_MESSAGES.checkAccessNotMember).toBe(
      "We couldn't find this Google account in the tester group yet.",
    );
  });

  it("asks if they already joined with the entered email", () => {
    expect(alreadyJoinedPrompt("tester@gmail.com")).toBe("Already joined with tester@gmail.com?");
  });

  it("does not claim membership from opening the group or signing in", () => {
    expect(USER_MESSAGES.inTheGroup).toBe("You're in the tester group");
    expect(USER_MESSAGES.inTheGroup.toLowerCase()).not.toContain("you have joined");
    expect(playStepsUnlocked(false)).toBe(false);
    expect(playStepsUnlocked(true)).toBe(true);
  });

  it("keeps Google Sign-In and feedback copy", () => {
    expect(USER_MESSAGES.joinBetaTitle).toBe("Join the AAC Sinhala Beta");
    expect(USER_MESSAGES.joinBetaSubtitle).toBe(
      "Use the Google account you use on your Android device.",
    );
    expect(USER_MESSAGES.feedbackPrompt).toBe("Found a bug or have a suggestion?");
    expect(USER_MESSAGES.sendFeedback).toBe("Send Feedback");
    expect(USER_MESSAGES.useDifferentAccount).toBe("Use a different Google account");
    expect(USER_MESSAGES.signOut).toBe("Sign out");
  });

  it("walks through join, account check, and return", () => {
    expect(GROUP_JOIN_WALKTHROUGH).toEqual([
      "Open the tester group",
      'Tap "Join group"',
      "Come back and tap Check My Access",
    ]);
  });

  it("keeps production copy free of localhost URLs", () => {
    const blob = JSON.stringify(USER_MESSAGES);
    expect(blob).not.toContain("localhost");
    expect(blob).not.toContain("127.0.0.1");
    expect(blob).not.toContain(":5173");
    expect(blob).not.toContain(":4173");
  });

  it("points testers at the three onboarding screenshots", () => {
    expect(GUIDE_SHOTS.joinGroup.src).toBe("/images/guides/join-group.png");
    expect(GUIDE_SHOTS.becomeTester.src).toBe("/images/guides/become-tester.png");
    expect(GUIDE_SHOTS.installApp.src).toBe("/images/guides/install-app.png");
  });
});
