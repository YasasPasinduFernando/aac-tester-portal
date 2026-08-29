import { useId, useState, type FormEvent } from "react";
import { FEEDBACK_TYPES } from "@shared/types";
import { isValidEmail, normalizeEmail } from "@shared/email";
import { localizeApiMessage } from "@shared/ui-copy";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../auth";
import { PlayAccountChip } from "../components/AccountWarning";
import { useT } from "../locale";

export default function FeedbackPage() {
  const t = useT();
  const { user } = useAuth();
  const emailId = useId();
  const typeId = useId();
  const messageId = useId();
  const screenshotId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState<(typeof FEEDBACK_TYPES)[number]>("Bug");
  const [message, setMessage] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSuccess("");
    const accountEmail = user?.email || normalizeEmail(email);
    if (!isValidEmail(accountEmail)) {
      setError(t.invalidEmailUi);
      return;
    }
    if (message.trim().length < 10) {
      setError(t.messageTooShort);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const body = new FormData();
      body.set("email", accountEmail);
      body.set("feedbackType", feedbackType);
      body.set("message", message.trim());
      if (screenshot) body.set("screenshot", screenshot);
      const response = await fetch("/api/feedback", {
        method: "POST",
        credentials: "include",
        headers: { "X-Requested-With": "AACSinhalaPortal" },
        body,
      });
      const payload = (await response.json()) as { ok: boolean; message: string };
      if (!payload.ok) {
        setError(localizeApiMessage(payload.message, t) || t.tryAgain);
      } else {
        setSuccess(t.feedbackThanks);
        setMessage("");
        setScreenshot(null);
      }
    } catch {
      setError(t.tryAgain);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-lg px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
        <h1 className="display text-3xl text-ink">{t.feedback}</h1>
        <p className="mt-3 max-w-md text-base text-ink/80">
          {t.feedbackPrompt} {t.sameAccountGroupsAndPlay}
        </p>

        <form className="glass mt-6 space-y-5 rounded-[1.5rem] p-4 sm:p-8" onSubmit={onSubmit} noValidate>
          {user ? (
            <PlayAccountChip email={user.email} />
          ) : (
          <div>
            <label htmlFor={emailId} className="block text-sm font-semibold">
              {t.playStoreEmailLabel}
            </label>
            <input
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink/15 bg-foam px-4 py-3"
              autoComplete="email"
            />
          </div>
          )}
          <div>
            <label htmlFor={typeId} className="block text-sm font-semibold">
              {t.feedbackType}
            </label>
            <select
              id={typeId}
              value={feedbackType}
              onChange={(event) =>
                setFeedbackType(event.target.value as (typeof FEEDBACK_TYPES)[number])
              }
              className="mt-2 w-full rounded-2xl border border-ink/15 bg-foam px-4 py-3"
            >
              {FEEDBACK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {
                    {
                      Bug: t.feedbackTypeBug,
                      Suggestion: t.feedbackTypeSuggestion,
                      Usability: t.feedbackTypeUsability,
                      Accessibility: t.feedbackTypeAccessibility,
                      Other: t.feedbackTypeOther,
                    }[type]
                  }
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={messageId} className="block text-sm font-semibold">
              {t.messageLabel}
            </label>
            <textarea
              id={messageId}
              required
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink/15 bg-foam px-4 py-3"
              aria-describedby={error ? errorId : undefined}
            />
          </div>
          <div>
            <label htmlFor={screenshotId} className="block text-sm font-semibold">
              {t.screenshotOptional}
            </label>
            <input
              id={screenshotId}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setScreenshot(event.target.files?.[0] ?? null)}
              className="mt-2 w-full text-sm"
            />
          </div>
          {error ? (
            <p id={errorId} className="text-sm font-medium text-clay-dark" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm font-medium text-teal-dark" role="status">
              {success}
            </p>
          ) : null}
          <button
            type="submit"
            className="inline-flex min-h-14 w-full touch-manipulation items-center justify-center rounded-full bg-teal px-6 font-semibold text-white hover:bg-teal-dark disabled:opacity-70"
            disabled={loading}
          >
            {loading ? t.sending : t.sendFeedbackBtn}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
