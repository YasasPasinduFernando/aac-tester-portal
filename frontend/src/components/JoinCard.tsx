import { useId, useState, type FormEvent } from "react";
import { isValidEmail, normalizeEmail } from "@shared/email";
import { USER_MESSAGES } from "@shared/types";

interface AccessResponse {
  outcome: "continue" | "invalid_email" | "rate_limited" | "unavailable";
  message: string;
  detail?: string;
  membershipVerified: boolean;
  membershipVerification: "verified" | "unavailable";
  groupJoinUrl: string | null;
  playJoinUrl: string | null;
  groupJoinStarted: boolean;
  playJoinStarted: boolean;
  bothLinksOpened: boolean;
}

export default function JoinCard() {
  const emailId = useId();
  const errorId = useId();
  const statusId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AccessResponse | null>(null);
  const [groupOpened, setGroupOpened] = useState(false);
  const [playOpened, setPlayOpened] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setError(USER_MESSAGES.invalidEmail);
      setResult(null);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/testers/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "AACSinhalaPortal",
        },
        body: JSON.stringify({ email: normalized }),
      });
      const payload = (await response.json()) as AccessResponse;
      setResult(payload);
      setGroupOpened(payload.groupJoinStarted);
      setPlayOpened(payload.playJoinStarted);
      if (payload.outcome === "invalid_email" || payload.outcome === "rate_limited") {
        setError(payload.message);
      }
    } catch {
      setError("Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function recordEvent(eventName: "group_join" | "play_join") {
    const normalized = normalizeEmail(email);
    await fetch("/api/testers/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "AACSinhalaPortal",
      },
      body: JSON.stringify({ email: normalized, event: eventName }),
    });
  }

  async function openGroup() {
    if (!result?.groupJoinUrl) return;
    setGroupOpened(true);
    void recordEvent("group_join");
    window.open(result.groupJoinUrl, "_blank", "noopener,noreferrer");
  }

  async function openPlay() {
    if (!result?.playJoinUrl) return;
    setPlayOpened(true);
    void recordEvent("play_join");
    window.open(result.playJoinUrl, "_blank", "noopener,noreferrer");
  }

  const submitted = result?.outcome === "continue";
  const showStep2 = submitted && groupOpened;
  const showReady = submitted && groupOpened && playOpened;

  return (
    <section id="join" className="scroll-mt-28" aria-labelledby="join-title">
      <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Closed testing</p>
        <h2 id="join-title" className="display mt-3 text-4xl text-ink sm:text-5xl">
          Join the AAC Sinhala Beta
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-ink/80">
          Help us test a communication-support app designed to make AAC more accessible for children and families.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor={emailId} className="block text-sm font-semibold text-ink">
              Your Google account email
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="mt-2 w-full rounded-2xl border border-ink/15 bg-foam px-4 py-3 text-base text-ink shadow-inner outline-none"
              placeholder="you@gmail.com"
            />
            {error ? (
              <p id={errorId} className="mt-2 text-sm font-medium text-clay-dark" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-clay px-6 text-base font-semibold text-white hover:bg-clay-dark disabled:cursor-wait disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Saving your request…" : "Get Test Access"}
          </button>
        </form>

        <div id={statusId} className="mt-8 space-y-5" aria-live="polite">
          {submitted ? (
            <>
              <div>
                <p className="display text-3xl text-ink">{USER_MESSAGES.almostReady}</p>
                <p className="mt-2 text-ink/80">{USER_MESSAGES.sameAccount}</p>
              </div>

              <ol className="grid gap-3 sm:grid-cols-2" aria-label="Onboarding steps">
                <li className={`rounded-2xl px-4 py-3 text-sm font-semibold ${groupOpened ? "bg-teal text-white" : "bg-mist/70 text-ink"}`}>
                  1. Join Tester Group
                </li>
                <li className={`rounded-2xl px-4 py-3 text-sm font-semibold ${playOpened ? "bg-teal text-white" : "bg-mist/70 text-ink"}`}>
                  2. Join Google Play Test
                </li>
              </ol>

              <article className="rounded-3xl bg-ink px-6 py-6 text-sand">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Step 1 — Join the AAC Sinhala Tester Group</p>
                <h3 className="display mt-2 text-3xl text-foam">Join the Tester Group</h3>
                <p className="mt-3 text-sand/85">
                  Join the AAC Sinhala tester group using the same Google account you will use on Google Play.
                </p>
                <button
                  type="button"
                  className="mt-5 inline-flex min-h-12 items-center rounded-full bg-gold px-5 font-semibold text-ink hover:bg-sand"
                  onClick={() => void openGroup()}
                >
                  Join Tester Group
                </button>
              </article>

              {showStep2 ? (
                <article className="rounded-3xl border border-ink/10 bg-foam px-6 py-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Step 2 — Join the Google Play Test</p>
                  <h3 className="display mt-2 text-3xl text-ink">Join the Google Play Test</h3>
                  <p className="mt-3 text-ink/80">
                    After joining the tester group, open the Google Play test link and choose Join the test.
                  </p>
                  {result.playJoinUrl ? (
                    <button
                      type="button"
                      className="mt-5 inline-flex min-h-12 items-center rounded-full bg-clay px-5 font-semibold text-white hover:bg-clay-dark"
                      onClick={() => void openPlay()}
                    >
                      Join on Google Play
                    </button>
                  ) : (
                    <p className="mt-5 text-sm text-clay-dark">
                      The Play test link is not configured yet. Please try again later.
                    </p>
                  )}
                  <p className="mt-4 text-sm text-ink/70">{USER_MESSAGES.deviceAccount}</p>
                </article>
              ) : null}

              {showReady ? (
                <article className="rounded-3xl bg-teal px-6 py-6 text-sand">
                  <h3 className="display text-3xl text-foam">{USER_MESSAGES.readyToTest}</h3>
                  <p className="mt-3 text-sand/90">{USER_MESSAGES.installHint}</p>
                  {result.playJoinUrl ? (
                    <button
                      type="button"
                      className="mt-5 inline-flex min-h-12 items-center rounded-full bg-foam px-5 font-semibold text-teal-dark hover:bg-sand"
                      onClick={() => void openPlay()}
                    >
                      Open Google Play
                    </button>
                  ) : null}
                </article>
              ) : null}

              <p className="text-sm text-ink/60">
                {result.membershipVerified
                  ? "Google Groups confirmed this email is already a member."
                  : USER_MESSAGES.verificationUnavailable}
                . Opening a link is recorded as a step, not as proof that Google added you.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
