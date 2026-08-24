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

export const USER_MESSAGES = {
  invalidEmail: "Please enter a valid Google account email address.",
  rateLimited: "Too many requests. Please wait a few minutes and try again.",
  almostReady: "You're almost ready!",
  sameAccount: "Please use the same Google account that you registered with.",
  deviceAccount: "Use the same Google account on your Android device.",
  joinGroupHint:
    "Open the group and tap Join group.",
  joinGroupModalTitle: "Join the tester group",
  joinGroupModalBody:
    "On the Google Groups page, tap 'Join group'.",
  afterGroup:
    "After joining the tester group, use the same Google account on Google Play.",
  checkAccessPrompt:
    "After joining, come back here and check your access.",
  inTheGroup: "You're in the tester group",
  verificationUnavailable: "Membership verification unavailable",
  ready: "You're ready!",
  readyToTest: "You're ready to test AAC Sinhala",
  installHint: "Open Google Play and install AAC-Sinhala.",
  checkAccessNotMember:
    "This Google account is not in the tester group yet. Open Tester Group, tap Join group, then try Check My Access again.",
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
