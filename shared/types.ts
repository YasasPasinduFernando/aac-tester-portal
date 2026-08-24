export type TesterStatus =
  | "requested"
  | "group_pending"
  | "play_pending"
  | "completed"
  | "needs_attention";

export type MembershipVerification = "verified" | "not_member" | "unavailable";

export type AccessOutcome = "continue" | "invalid_email" | "rate_limited" | "unavailable";

export type FeedbackType =
  | "Bug"
  | "Suggestion"
  | "Usability"
  | "Accessibility"
  | "Other";

export const FEEDBACK_TYPES: readonly FeedbackType[] = [
  "Bug",
  "Suggestion",
  "Usability",
  "Accessibility",
  "Other",
];

export const GUIDE_SHOTS = {
  joinGroup: {
    src: "/images/guides/join-group.png",
    alt: "Google Groups page with a yellow arrow pointing to the Join group button",
    caption: "Tap Join group",
    hint: "Look for the Join group button near the top of the Google Groups page. The yellow arrow shows where it is.",
  },
  becomeTester: {
    src: "/images/guides/become-tester.png",
    alt: "Google Play testing page for AAC-Sinhala with a Become a tester button",
    caption: "Tap Become a tester",
    hint: "Use the same Google account you used to join the tester group.",
  },
  installApp: {
    src: "/images/guides/install-app.png",
    alt: "Google Play listing for AAC-Sinhala with an Install button",
    caption: "Tap Install",
    hint: "Install AAC-Sinhala from Google Play on your Android phone.",
  },
} as const;

export const GROUP_JOIN_WALKTHROUGH = [
  "Open the tester group",
  'Tap "Join group"',
  "Come back and tap Check My Access",
] as const;

export const USER_MESSAGES = {
  invalidEmail: "Please enter a valid Google account email address.",
  rateLimited: "Too many requests. Please wait a few minutes and try again.",
  almostReady: "You're almost ready!",
  sameAccount: "Please use the same Google account that you registered with.",
  deviceAccount: "Use the same Play Store account on your Android device.",
  playStoreEveryone:
    "Everyone must use the Google account they use on Google Play.",
  playStoreEmailLabel: "Your Google Play account",
  playStoreEmailHint:
    "This is the Google account used on your Android device.",
  joinBetaTitle: "Join the AAC Sinhala Beta",
  joinBetaSubtitle: "Use the Google account you use on your Android device.",
  googleVerified: "Google account verified",
  googleSignInFailed: "Google sign-in didn't complete. Please try again.",
  googleSignInUnavailable: "Google Sign-In is not configured yet.",
  googleMissingEmail: "Google did not share an email for this account.",
  signInRequired: "Please continue with Google to keep going.",
  useDifferentAccount: "Use a different Google account",
  signOut: "Sign out",
  joinGroupHint: "Open the group and tap Join group. Use your Play Store account.",
  joinGroupModalTitle: "Join AAC Sinhala Testers",
  joinGroupModalLead: "You're one step away from joining the AAC Sinhala beta.",
  playAccountImportant: "Use the same Google account",
  playAccountShort: "Please use the same Google account you use on Google Play.",
  usePlayStoreAccount: "Use your Play Store account to join the group.",
  usePlayStoreAccountHeading: "Use your Play Store account",
  sameAccountPlayAndGroup:
    "Use this same account to join the tester group and Google Play test.",
  sameAccountGroupsAndPlay:
    "Use the same Google account for the tester group and Google Play.",
  accountEnteredLabel: "Your Google Play account",
  authenticatedAccountIs: "The account you authenticated with is:",
  whenJoiningExactAccount:
    "When you join the tester group, make sure Google Groups is signed in with this exact account.",
  groupsSignedInWarning:
    "Please make sure Google Groups is signed in with this same account.",
  useThisSameAccountForGroup:
    "Use this same Google account when joining the tester group.",
  beforeJoiningSignedIn:
    "Before joining, make sure Google Groups is signed in with:",
  switchIfAnotherAccount:
    "If another Google account is active in Google Groups, switch to the account shown above before tapping Join group.",
  afterJoinCheck: "After joining, come back here and tap Check My Access.",
  groupsNewTabHint: "Google Groups will open in a new tab. This page stays open.",
  lookForJoinGroup: "Look for the 'Join group' button",
  alreadyJoined: "Already joined?",
  inTheGroup: "You're in the tester group",
  nextPlayTest: "Join the Google Play test",
  joinPlayTestHint: "Now open the Google Play testing page using the same Google account.",
  playUsingSame: "Make sure Google Play is using the same account.",
  installTitle: "Install AAC-Sinhala",
  installHint: "Once you have joined the test, install AAC-Sinhala from Google Play.",
  startTestingTitle: "Start testing",
  startTestingHint: "Open AAC-Sinhala and try the communication features.",
  feedbackPrompt: "Found a bug or have a suggestion?",
  sendFeedback: "Send Feedback",
  wrongAccountHeading: "Using the wrong Google account?",
  wrongAccountHelp:
    "Go back to Google Groups, switch to the Google account shown above, and join the tester group again.",
  checkAccessNotDetected: "We couldn't find this Google account in the tester group yet.",
  checkAccessNotMember:
    "We couldn't find this Google account in the tester group yet.",
  checkAccessRetry:
    "Make sure you joined the group with the Google account shown above, then try again.",
  verificationUnavailable: "Membership verification unavailable",
  ready: "You're ready!",
  readyToTest: "You're ready to test AAC Sinhala",
  checkAccessUnavailable: "Membership verification is currently unavailable.",
  feedbackThanks: "Thank you. Your feedback was saved privately.",
  searchGroupHint:
    "If Google Groups is not signed in with this account, search for our tester group and join it.",
  copyGroupName: "Copy group name",
  groupNameCopied: "Copied",
} as const;

export const TESTER_GROUP_SEARCH_NAME = "aac-sinhala-testers";
export const TESTER_GROUP_EMAIL = "aac-sinhala-testers@googlegroups.com";

export function deriveStatus(input: {
  groupJoinStartedAt: string | null;
  playJoinStartedAt: string | null;
  membershipVerified: boolean;
  needsAttention?: boolean;
}): TesterStatus {
  if (input.membershipVerified) return "completed";
  if (input.needsAttention) return "needs_attention";
  if (input.playJoinStartedAt) return "play_pending";
  if (input.groupJoinStartedAt) return "group_pending";
  return "requested";
}

export function bothJoinLinksOpened(
  groupJoinStartedAt: string | null,
  playJoinStartedAt: string | null,
): boolean {
  return Boolean(groupJoinStartedAt && playJoinStartedAt);
}

export function alreadyJoinedPrompt(email: string): string {
  return `Already joined with ${email}?`;
}

export function playStepsUnlocked(membershipVerified: boolean): boolean {
  return membershipVerified === true;
}

export function defaultGroupJoinUrl(groupEmail: string): string {
  const local = groupEmail.split("@")[0]?.trim();
  if (!local) return "https://groups.google.com/";
  return `https://groups.google.com/g/${encodeURIComponent(local)}`;
}

export function resolveGroupJoinUrl(
  configured: string | undefined,
  groupEmail: string,
): string {
  const value = configured?.trim();
  return value ? value : defaultGroupJoinUrl(groupEmail);
}
