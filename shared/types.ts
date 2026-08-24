export type TesterStatus =
  | "requested"
  | "invited"
  | "member"
  | "eligible"
  | "removed"
  | "error";

export type AccessOutcome =
  | "ready"
  | "pending"
  | "invalid_email"
  | "rate_limited"
  | "unavailable";

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
  invalidEmail:
    "Please enter a valid Google account email address.",
  rateLimited:
    "Too many requests. Please wait a few minutes and try again.",
  ready:
    "You're ready!",
  readyBody:
    "Open Google Play and use the same Google account on your Android device.",
  pending:
    "Your request has been received. Please continue with Google Play.",
  pendingBody:
    "If you are not in the tester group yet, you may need to wait for an invitation before the Play page lets you join.",
  unavailable:
    "Your request has been received. Please continue with Google Play.",
  confirmInstall:
    "Thank you. We recorded that you installed the app on this Google account. This is self-reported and is not a Play Store download receipt.",
  feedbackThanks:
    "Thank you. Your feedback was saved privately.",
} as const;
