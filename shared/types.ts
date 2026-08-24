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
  playStoreEmailLabel: "Play Store Gmail",
  playStoreEmailHint:
    "Enter the same Gmail that is signed in on Google Play.",
  joinGroupHint: "Open the group and tap Join group. Use your Play Store account.",
  joinGroupModalTitle: "Join the AAC Sinhala Tester Group",
  joinGroupModalLead: "You're one step away from joining the AAC Sinhala beta.",
  playAccountImportant:
    "Please use the same Google account you use on Google Play to join the tester group.",
  playAccountShort: "Please use the same Google account you use on Google Play.",
  usePlayStoreAccount: "Use your Play Store account to join the group.",
  usePlayStoreAccountHeading: "Use your Play Store account",
  sameAccountPlayAndGroup:
    "Join the tester group and Google Play test with the same Google account.",
  accountEnteredLabel: "Account you entered",
  afterJoinCheck: "After joining, come back here and tap Check My Access.",
  groupsNewTabHint: "Google Groups will open in a new tab.",
  lookForJoinGroup: "Look for the 'Join group' button",
  alreadyJoined: "Already joined?",
  inTheGroup: "Tester group joined",
  nextPlayTest: "Next: Join the Google Play test",
  checkAccessNotDetected: "Your membership hasn't been detected yet.",
  checkAccessNotMember:
    "Your membership hasn't been detected yet. Make sure you joined the group with the same Google account you use on Google Play, then try again.",
  checkAccessRetry:
    "Make sure you joined the group with the same Google account you use on Google Play, then try again.",
  verificationUnavailable: "Membership verification unavailable",
  ready: "You're ready!",
  readyToTest: "You're ready to test AAC Sinhala",
  installHint: "Open Google Play and install AAC-Sinhala.",
  checkAccessUnavailable:
    "We can't confirm group membership automatically. Finish joining the Google Group, then continue to Google Play with the same account.",
  feedbackThanks: "Thank you. Your feedback was saved privately.",
} as const;

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
