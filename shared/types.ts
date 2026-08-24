export type TesterStatus =
  | "requested"
  | "group_pending"
  | "play_pending"
  | "completed"
  | "needs_attention";

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
  verificationUnavailable: "Membership verification unavailable",
  readyToTest: "You're ready to test AAC Sinhala",
  installHint: "Open Google Play and install AAC-Sinhala.",
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
