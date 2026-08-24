import { parseEmailInput } from "../../shared/email";
import { FEEDBACK_TYPES, USER_MESSAGES, type FeedbackType } from "../../shared/types";
import { newId, type Store } from "./store";

const MAX_MESSAGE = 4000;
const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface FeedbackInput {
  email: unknown;
  feedbackType: unknown;
  message: unknown;
  screenshot?: { bytes: Uint8Array; contentType: string } | null;
}

export async function submitFeedback(input: {
  data: FeedbackInput;
  now: Date;
  store: Store;
  bucket?: R2Bucket;
}): Promise<{ ok: boolean; message: string; screenshotStored: boolean }> {
  const email = parseEmailInput(input.data.email);
  if (!email) {
    return { ok: false, message: USER_MESSAGES.invalidEmail, screenshotStored: false };
  }

  const feedbackType = String(input.data.feedbackType ?? "");
  if (!FEEDBACK_TYPES.includes(feedbackType as FeedbackType)) {
    return { ok: false, message: "Please choose a feedback type.", screenshotStored: false };
  }

  const message = typeof input.data.message === "string" ? input.data.message.trim() : "";
  if (message.length < 10) {
    return {
      ok: false,
      message: "Please include a short description (at least 10 characters).",
      screenshotStored: false,
    };
  }
  if (message.length > MAX_MESSAGE) {
    return { ok: false, message: "Please shorten your message.", screenshotStored: false };
  }

  const since = new Date(input.now.getTime() - 10 * 60 * 1000).toISOString();
  const recent = await input.store.countFeedbackByEmailSince(email, since);
  if (recent >= 5) {
    return { ok: false, message: USER_MESSAGES.rateLimited, screenshotStored: false };
  }

  let screenshotKey: string | null = null;
  let screenshotStored = false;
  const screenshot = input.data.screenshot;
  if (screenshot && screenshot.bytes.byteLength > 0) {
    if (screenshot.bytes.byteLength > MAX_SCREENSHOT_BYTES) {
      return {
        ok: false,
        message: "Screenshots must be 2 MB or smaller.",
        screenshotStored: false,
      };
    }
    if (!ALLOWED_TYPES.has(screenshot.contentType)) {
      return {
        ok: false,
        message: "Screenshots must be JPEG, PNG, or WebP.",
        screenshotStored: false,
      };
    }
    if (input.bucket) {
      screenshotKey = `feedback/${newId()}`;
      await input.bucket.put(screenshotKey, screenshot.bytes, {
        httpMetadata: { contentType: screenshot.contentType },
      });
      screenshotStored = true;
    }
  }

  await input.store.insertFeedback({
    id: newId(),
    email,
    feedback_type: feedbackType,
    message,
    screenshot_key: screenshotKey,
    created_at: input.now.toISOString(),
  });

  const tester = await input.store.getTester(email);
  if (tester) {
    await input.store.updateTester(email, {
      last_website_activity_at: input.now.toISOString(),
    });
  }

  return { ok: true, message: USER_MESSAGES.feedbackThanks, screenshotStored };
}
