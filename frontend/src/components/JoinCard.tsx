import { useId, useState, type FormEvent } from "react";
import { isValidEmail, normalizeEmail } from "@shared/email";
import { USER_MESSAGES } from "@shared/types";

interface AccessResponse {
  outcome: "ready" | "pending" | "invalid_email" | "rate_limited" | "unavailable";
  message: string;
  detail?: string;
  membershipConfirmed: boolean;
  playJoinUrl: string | null;
}

export default function JoinCard() {
  const emailId = useId();
  const errorId = useId();
  const statusId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AccessResponse | null>(null);
  const [confirmNote, setConfirmNote] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setConfirmNote("");
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
      if (payload.outcome === "invalid_email") {
        setError(payload.message);
      }
    } catch {
      setResult({
        outcome: "unavailable",
        message: USER_MESSAGES.unavailable,
        detail: USER_MESSAGES.pendingBody,
        membershipConfirmed: false,
        playJoinUrl: null,
      });
    } finally {
      setLoading(false);
    }
  }

  async function confirmInstall() {
    const normalized = normalizeEmail(email);
    const response = await fetch("/api/testers/confirm-install", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "AACSinhalaPortal",
      },
      body: JSON.stringify({ email: normalized }),
    });
    const payload = (await response.json()) as { message: string };
    setConfirmNote(payload.message);
  }

  const ready = result?.outcome === "ready" && result.membershipConfirmed;

  return (
    <section id="join" className="scroll-mt-28" aria-labelledby="join-title">
      <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Closed testing</p>
        <h2 id="join-title" className="display mt-3 text-4xl text-ink sm:text-5xl">
          Join the AAC Sinhala Beta
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-ink/80">
          Enter the Google account you use on your Android device. We&apos;ll help you join the closed testing
          program.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor={emailId} className="block text-sm font-semibold text-ink">
              Google account email
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
            {loading ? "Checking access…" : "Get Test Access"}
          </button>
        </form>

        <div id={statusId} className="mt-8" aria-live="polite">
          {result && !error ? (
            <div className="rounded-3xl bg-ink px-6 py-6 text-sand">
              <p className="display text-3xl text-foam">{ready ? USER_MESSAGES.ready : result.message}</p>
              <p className="mt-3 text-sand/85">{result.detail}</p>
              {result.playJoinUrl ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-5 font-semibold text-ink no-underline hover:bg-sand"
                    href={result.playJoinUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open Google Play
                  </a>
                  <p className="text-sm text-sand/80">Use the same Google account on your Android device.</p>
                </div>
              ) : null}
              {ready ? (
                <button
                  type="button"
                  className="mt-5 text-left text-sm font-medium text-gold underline-offset-4 hover:underline"
                  onClick={() => void confirmInstall()}
                >
                  I installed the app on my device
                </button>
              ) : null}
              {confirmNote ? <p className="mt-3 text-sm text-sand/80">{confirmNote}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
