import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { isValidEmail, normalizeEmail } from "@shared/email";
import { alreadyJoinedPrompt, USER_MESSAGES } from "@shared/types";
import { AccountMismatchWarning, PlayAccountChip, WrongAccountHelp } from "./AccountWarning";
import GroupJoinModal from "./GroupJoinModal";

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
  accessChecked: boolean;
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
    accessChecked: false,
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
  const [accessChecked, setAccessChecked] = useState(saved.accessChecked);
  const [membershipState, setMembershipState] = useState<
    "verified" | "not_member" | "unavailable" | null
  >(saved.accessChecked ? (saved.result?.membershipVerification ?? null) : saved.membershipVerified ? "verified" : null);
  const [showGroupHelp, setShowGroupHelp] = useState(false);
  const joinGroupButtonRef = useRef<HTMLButtonElement>(null);
  const checkAccessRef = useRef<HTMLDivElement>(null);
  const lockedEmail = saved.submitted && saved.result?.outcome === "continue" ? saved.email : "";
  const [requestEmail, setRequestEmail] = useState(lockedEmail);

  useEffect(() => {
    if (!email) return;
    writeSession({
      email,
      submitted: Boolean(result),
      groupOpened,
      playOpened,
      installOpened,
      membershipVerified,
      accessChecked,
      result,
    });
  }, [email, result, groupOpened, playOpened, installOpened, membershipVerified, accessChecked]);

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
      if (payload.outcome === "continue") setRequestEmail(normalized);
      setGroupOpened(payload.groupJoinStarted);
      setPlayOpened(payload.playJoinStarted);
      setMembershipVerified(payload.membershipVerified);
      if (payload.membershipVerified) {
        setMembershipState("verified");
        setAccessChecked(true);
      } else {
        setMembershipState(null);
        setAccessChecked(false);
      }
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
    const account = requestEmail || normalizeEmail(email);
    await fetch("/api/testers/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "AACSinhalaPortal",
      },
      body: JSON.stringify({ email: account, event: eventName }),
    });
  }

  function confirmOpenGroup() {
    if (!result?.groupJoinUrl) return;
    setGroupOpened(true);
    setShowGroupHelp(false);
    void recordEvent("group_join");
    window.open(result.groupJoinUrl, "_blank", "noopener,noreferrer");
    window.requestAnimationFrame(() => {
      checkAccessRef.current?.scrollIntoView({ block: "nearest" });
      joinGroupButtonRef.current?.focus();
    });
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
    const account = requestEmail || normalizeEmail(email);
    if (!isValidEmail(account)) {
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
        body: JSON.stringify({ email: account }),
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
      setMembershipState(payload.membershipVerification);
      setAccessChecked(true);
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
      setMembershipState("unavailable");
      setAccessChecked(true);
      setCheckMessage(USER_MESSAGES.checkAccessUnavailable);
      setMembershipVerified(false);
    } finally {
      setChecking(false);
    }
  }

  const submitted = result?.outcome === "continue";
  const accountEmail = requestEmail || normalizeEmail(email);
  const ready = membershipVerified;
  const notMember = membershipState === "not_member";
  const showPlay = ready;
  const emailDirty = submitted && normalizeEmail(email) !== normalizeEmail(requestEmail);

  return (
    <section id="join" className="scroll-mt-24" aria-labelledby="join-title">
      <h1 id="join-title" className="display text-center text-4xl text-ink sm:text-5xl">
        Join AAC Sinhala
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-base font-semibold text-ink">
        {USER_MESSAGES.playStoreEveryone}
      </p>

      <div className="glass mt-8 rounded-[1.75rem] p-5 sm:p-7">
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor={emailId} className="block text-sm font-semibold text-ink">
              {USER_MESSAGES.playStoreEmailLabel}
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${errorId} ${emailId}-hint` : `${emailId}-hint`}
              className="mt-2 w-full rounded-2xl border border-ink/15 bg-foam px-4 py-3.5 text-base text-ink shadow-inner outline-none"
              placeholder="you@gmail.com"
            />
            <p id={`${emailId}-hint`} className="mt-2 text-sm text-ink/70">
              {USER_MESSAGES.playStoreEmailHint}
            </p>
            {error ? (
              <p id={errorId} className="mt-2 text-sm font-medium text-clay-dark" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          {!submitted || emailDirty ? (
            <button
              type="submit"
              className="inline-flex min-h-14 w-full touch-manipulation items-center justify-center rounded-full bg-clay px-6 text-base font-semibold text-white hover:bg-clay-dark disabled:cursor-wait disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Saving…" : submitted ? "Update email" : "Continue"}
            </button>
          ) : null}
        </form>

        <div id={statusId} className={submitted ? "mt-6 space-y-4" : undefined} aria-live="polite">
          {submitted ? (
            <>
              <PlayAccountChip email={accountEmail} />

              <div className="rounded-2xl border border-ink/10 bg-white px-4 py-5 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Step 1</p>
                <h2 className="display mt-1 text-3xl text-ink">{USER_MESSAGES.joinGroupModalTitle}</h2>
                <div className="mt-4">
                  <AccountMismatchWarning email={accountEmail} />
                </div>
                <button
                  ref={joinGroupButtonRef}
                  type="button"
                  className="mt-4 inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-clay px-5 text-base font-semibold text-white hover:bg-clay-dark"
                  onClick={() => setShowGroupHelp(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showGroupHelp}
                >
                  Open Tester Group
                  <span aria-hidden="true">↗</span>
                </button>
                <p className="mt-2 text-center text-sm text-ink/60">{USER_MESSAGES.groupsNewTabHint}</p>
                <div className="mt-4 border-t border-ink/10 pt-4">
                  <WrongAccountHelp />
                </div>
              </div>

              <div ref={checkAccessRef} id="check-access" className="rounded-2xl border border-ink/10 bg-foam px-4 py-5 sm:px-5">
                <p className="text-sm font-semibold text-ink">{alreadyJoinedPrompt(accountEmail)}</p>
                {ready ? (
                  <div className="mt-3" role="status">
                    <p className="text-base font-semibold text-teal-dark">✓ {USER_MESSAGES.inTheGroup}</p>
                    <p className="mt-1 break-all text-base font-semibold text-ink">{accountEmail}</p>
                  </div>
                ) : notMember ? (
                  <div className="mt-3 space-y-3" role="status">
                    <p className="text-sm text-ink/80">
                      {USER_MESSAGES.checkAccessNotDetected} {USER_MESSAGES.checkAccessRetry}
                    </p>
                    <WrongAccountHelp />
                  </div>
                ) : checkMessage ? (
                  <p className="mt-3 text-sm text-ink/80" role="status">
                    {checkMessage}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-ink/70">{USER_MESSAGES.afterJoinCheck}</p>
                )}
                {!ready ? (
                  <button
                    type="button"
                    className="mt-4 inline-flex min-h-14 w-full touch-manipulation items-center justify-center rounded-full border-2 border-clay px-5 font-semibold text-clay hover:bg-clay hover:text-white disabled:opacity-60"
                    onClick={() => void checkAccess()}
                    disabled={checking || emailDirty}
                  >
                    {checking ? "Checking…" : "Check My Access"}
                  </button>
                ) : null}
              </div>

              {showPlay && result.playJoinUrl ? (
                <div className="rounded-2xl border border-ink/10 bg-foam px-4 py-5 sm:px-5">
                  <p className="text-sm font-semibold text-ink">{USER_MESSAGES.nextPlayTest}</p>
                  <p className="mt-2 text-sm text-ink/70">{USER_MESSAGES.deviceAccount}</p>
                  <ExternalButton
                    className="mt-4 min-h-14 w-full bg-clay text-white hover:bg-clay-dark"
                    onClick={() => void openPlayTest()}
                    label="Join Google Play Test"
                  />
                  {result.playStoreUrl ? (
                    <ExternalButton
                      className="mt-3 min-h-14 w-full border-2 border-ink/15 bg-white text-ink hover:bg-mist/60"
                      onClick={openInstall}
                      label="Install AAC-Sinhala"
                    />
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <GroupJoinModal
        open={showGroupHelp}
        email={accountEmail}
        onClose={() => setShowGroupHelp(false)}
        onOpenGroup={confirmOpenGroup}
      />
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
      className={`inline-flex touch-manipulation items-center justify-center gap-2 rounded-full px-6 text-base font-semibold ${className}`}
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
