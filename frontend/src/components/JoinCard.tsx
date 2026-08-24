import { useEffect, useId, useState, type FormEvent } from "react";
import { isValidEmail, normalizeEmail } from "@shared/email";
import { USER_MESSAGES } from "@shared/types";

interface AccessResponse {
  outcome: "continue" | "invalid_email" | "rate_limited" | "unavailable";
  message: string;
  detail?: string;
  membershipVerified: boolean;
  membershipVerification: "verified" | "not_member" | "unavailable";
  groupJoinUrl: string | null;
  playJoinUrl: string | null;
  playStoreUrl: string | null;
  groupJoinStarted: boolean;
  playJoinStarted: boolean;
}

interface SessionState {
  email: string;
  submitted: boolean;
  groupOpened: boolean;
  playOpened: boolean;
  installOpened: boolean;
  membershipVerified: boolean;
  result: AccessResponse | null;
}

const SESSION_KEY = "aac-tester-onboarding";

function readSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

function writeSession(state: SessionState) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

function emptySession(): SessionState {
  return {
    email: "",
    submitted: false,
    groupOpened: false,
    playOpened: false,
    installOpened: false,
    membershipVerified: false,
    result: null,
  };
}

function initialSession(): SessionState {
  return readSession() ?? emptySession();
}

export default function JoinCard() {
  const emailId = useId();
  const errorId = useId();
  const statusId = useId();
  const [saved] = useState(initialSession);
  const [email, setEmail] = useState(saved.email);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [result, setResult] = useState<AccessResponse | null>(saved.result);
  const [groupOpened, setGroupOpened] = useState(saved.groupOpened);
  const [playOpened, setPlayOpened] = useState(saved.playOpened);
  const [installOpened, setInstallOpened] = useState(saved.installOpened);
  const [membershipVerified, setMembershipVerified] = useState(saved.membershipVerified);

  useEffect(() => {
    if (!email) return;
    writeSession({
      email,
      submitted: Boolean(result),
      groupOpened,
      playOpened,
      installOpened,
      membershipVerified,
      result,
    });
  }, [email, result, groupOpened, playOpened, installOpened, membershipVerified]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setError(USER_MESSAGES.invalidEmail);
      setResult(null);
      return;
    }
    setError("");
    setCheckMessage("");
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
      setEmail(normalized);
      setResult(payload);
      setGroupOpened(payload.groupJoinStarted);
      setPlayOpened(payload.playJoinStarted);
      setMembershipVerified(payload.membershipVerified);
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

  async function openPlayTest() {
    if (!result?.playJoinUrl) return;
    setPlayOpened(true);
    void recordEvent("play_join");
    window.open(result.playJoinUrl, "_blank", "noopener,noreferrer");
  }

  function openInstall() {
    if (!result?.playStoreUrl) return;
    setInstallOpened(true);
    window.open(result.playStoreUrl, "_blank", "noopener,noreferrer");
  }

  async function checkAccess() {
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setError(USER_MESSAGES.invalidEmail);
      return;
    }
    setChecking(true);
    setCheckMessage("");
    try {
      const response = await fetch("/api/testers/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "AACSinhalaPortal",
        },
        body: JSON.stringify({ email: normalized }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        membershipVerified: boolean;
        membershipVerification: "verified" | "not_member" | "unavailable";
        message: string;
        playJoinUrl: string | null;
        playStoreUrl: string | null;
        groupJoinUrl: string | null;
      };
      setMembershipVerified(payload.membershipVerified);
      setCheckMessage(payload.message);
      if (payload.ok && result) {
        setResult({
          ...result,
          membershipVerified: payload.membershipVerified,
          membershipVerification: payload.membershipVerification,
          playJoinUrl: payload.playJoinUrl ?? result.playJoinUrl,
          playStoreUrl: payload.playStoreUrl ?? result.playStoreUrl,
          groupJoinUrl: payload.groupJoinUrl ?? result.groupJoinUrl,
        });
      }
    } catch {
      setCheckMessage(USER_MESSAGES.checkAccessUnavailable);
      setMembershipVerified(false);
    } finally {
      setChecking(false);
    }
  }

  const submitted = result?.outcome === "continue";
  const ready = membershipVerified;

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
              className="mt-2 w-full rounded-2xl border border-ink/15 bg-foam px-4 py-3.5 text-base text-ink shadow-inner outline-none"
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
            className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-clay px-6 text-base font-semibold text-white hover:bg-clay-dark disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            disabled={loading}
          >
            {loading ? "Saving your request…" : "Get Test Access"}
          </button>
        </form>

        <div id={statusId} className="mt-8 space-y-5" aria-live="polite">
          {submitted ? (
            <>
              <div>
                <p className="display text-3xl text-ink">{ready ? USER_MESSAGES.ready : USER_MESSAGES.almostReady}</p>
                <p className="mt-2 text-ink/80">{USER_MESSAGES.afterGroup}</p>
              </div>

              <ol className="grid gap-3 sm:grid-cols-3" aria-label="Onboarding steps">
                <li className={`rounded-2xl px-4 py-4 text-center text-sm font-semibold ${groupOpened || ready ? "bg-teal text-white" : "bg-mist/70 text-ink"}`}>
                  1 → Join Tester Group
                </li>
                <li className={`rounded-2xl px-4 py-4 text-center text-sm font-semibold ${playOpened || ready ? "bg-teal text-white" : "bg-mist/70 text-ink"}`}>
                  2 → Join Google Play Test
                </li>
                <li className={`rounded-2xl px-4 py-4 text-center text-sm font-semibold ${installOpened ? "bg-teal text-white" : "bg-mist/70 text-ink"}`}>
                  3 → Install AAC-Sinhala
                </li>
              </ol>

              <article className="rounded-3xl bg-ink px-6 py-6 text-sand">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">1 → Join Tester Group</p>
                <h3 className="display mt-2 text-3xl text-foam">Join Tester Group</h3>
                <p className="mt-3 text-sand/85">{USER_MESSAGES.joinGroupHint}</p>
                <ExternalButton
                  className="mt-5 min-h-14 w-full bg-gold text-ink hover:bg-sand sm:w-auto"
                  onClick={() => void openGroup()}
                  label="Join Tester Group"
                />
              </article>

              <div className="rounded-3xl border border-ink/10 bg-foam px-6 py-5">
                <p className="font-semibold text-ink">Already joined the group?</p>
                <button
                  type="button"
                  className="mt-3 inline-flex min-h-14 w-full items-center justify-center rounded-full border-2 border-teal px-6 font-semibold text-teal hover:bg-teal hover:text-white sm:w-auto"
                  onClick={() => void checkAccess()}
                  disabled={checking}
                >
                  {checking ? "Checking…" : "Check My Access"}
                </button>
                {checkMessage ? (
                  <p className={`mt-3 text-sm ${ready ? "text-teal-dark" : "text-ink/80"}`} role="status">
                    {checkMessage}
                  </p>
                ) : null}
              </div>

              {ready ? (
                <p className="display text-3xl text-teal">{USER_MESSAGES.ready}</p>
              ) : null}

              <article className="rounded-3xl border border-ink/10 bg-foam px-6 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">2 → Join Google Play Test</p>
                <h3 className="display mt-2 text-3xl text-ink">Join Google Play Test</h3>
                <p className="mt-3 text-ink/80">
                  After joining the tester group, open the Google Play test and choose Join the test.
                </p>
                {result.playJoinUrl ? (
                  <ExternalButton
                    className="mt-5 min-h-14 w-full bg-clay text-white hover:bg-clay-dark sm:w-auto"
                    onClick={() => void openPlayTest()}
                    label="Join Google Play Test"
                  />
                ) : (
                  <p className="mt-5 text-sm text-clay-dark">The Play test link is not configured yet.</p>
                )}
                <p className="mt-4 text-sm text-ink/70">{USER_MESSAGES.deviceAccount}</p>
              </article>

              <article className="rounded-3xl bg-teal px-6 py-6 text-sand">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">3 → Install AAC-Sinhala</p>
                <h3 className="display mt-2 text-3xl text-foam">Install AAC-Sinhala</h3>
                <p className="mt-3 text-sand/90">{USER_MESSAGES.installHint}</p>
                {result.playStoreUrl ? (
                  <ExternalButton
                    className="mt-5 min-h-14 w-full bg-foam text-teal-dark hover:bg-sand sm:w-auto"
                    onClick={openInstall}
                    label="Install AAC-Sinhala"
                  />
                ) : null}
              </article>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ExternalButton({
  className,
  onClick,
  label,
}: {
  className: string;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 text-base font-semibold ${className}`}
      onClick={onClick}
      aria-label={`${label} (opens in a new tab)`}
    >
      <span>{label}</span>
      <span aria-hidden="true" className="text-lg leading-none">
        ↗
      </span>
    </button>
  );
}
