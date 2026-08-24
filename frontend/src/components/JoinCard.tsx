import { useRef, useState } from "react";
import { alreadyJoinedPrompt, playStepsUnlocked, USER_MESSAGES } from "@shared/types";
import { useAuth } from "../auth";
import { AccountMismatchWarning, PlayAccountChip, VerifiedAccountCard, WrongAccountHelp } from "./AccountWarning";
import { AppPhoneCluster } from "./AppScreenCards";
import GoogleSignIn from "./GoogleSignIn";
import GroupJoinModal from "./GroupJoinModal";

export default function JoinCard() {
  const { ready, user, refresh, switchAccount } = useAuth();
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [checkState, setCheckState] = useState<
    "verified" | "not_member" | "unavailable" | null
  >(null);
  const [showGroupHelp, setShowGroupHelp] = useState(false);
  const joinGroupButtonRef = useRef<HTMLButtonElement>(null);
  const checkAccessRef = useRef<HTMLDivElement>(null);

  async function recordEvent(eventName: "group_join" | "play_join") {
    await fetch("/api/testers/event", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "AACSinhalaPortal",
      },
      body: JSON.stringify({ event: eventName }),
    });
  }

  function confirmOpenGroup() {
    if (!user?.groupJoinUrl) return;
    setShowGroupHelp(false);
    void recordEvent("group_join");
    window.open(user.groupJoinUrl, "_blank", "noopener,noreferrer");
    window.requestAnimationFrame(() => {
      checkAccessRef.current?.scrollIntoView({ block: "nearest" });
      joinGroupButtonRef.current?.focus();
    });
  }

  async function checkAccess() {
    setChecking(true);
    setCheckMessage("");
    try {
      const response = await fetch("/api/testers/access", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "AACSinhalaPortal",
        },
        body: "{}",
      });
      const payload = (await response.json()) as {
        ok: boolean;
        membershipVerified: boolean;
        membershipVerification: "verified" | "not_member" | "unavailable";
        message: string;
        playJoinUrl: string | null;
        playStoreUrl: string | null;
      };
      setCheckState(payload.membershipVerification);
      setCheckMessage(payload.message);
      await refresh();
    } catch {
      setCheckState("unavailable");
      setCheckMessage(USER_MESSAGES.checkAccessUnavailable);
    } finally {
      setChecking(false);
    }
  }

  function openPlayTest() {
    if (!user?.playJoinUrl) return;
    void recordEvent("play_join");
    window.open(user.playJoinUrl, "_blank", "noopener,noreferrer");
  }

  function openInstall() {
    if (!user?.playStoreUrl) return;
    window.open(user.playStoreUrl, "_blank", "noopener,noreferrer");
  }

  const verified = Boolean(user?.membershipVerified);
  const showPlay = playStepsUnlocked(verified);
  const notMember = !verified && checkState === "not_member";

  return (
    <section id="join" className="scroll-mt-24" aria-labelledby="join-title">
      <h1 id="join-title" className="display text-center text-4xl text-ink sm:text-5xl">
        {USER_MESSAGES.joinBetaTitle}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-base font-semibold text-ink">
        {USER_MESSAGES.joinBetaSubtitle}
      </p>

      <div className="glass mt-8 rounded-[1.75rem] p-5 sm:p-7">
        {!ready ? (
          <p className="text-center text-sm text-ink/70">Loading…</p>
        ) : !user ? (
          <>
            <p className="text-center text-sm text-ink/75">{USER_MESSAGES.sameAccountGroupsAndPlay}</p>
            <GoogleSignIn />
          </>
        ) : (
          <div className="space-y-4">
            <VerifiedAccountCard
              email={user.email}
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
            />
            <div className="flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                className="font-semibold text-clay hover:text-clay-dark"
                onClick={() => void switchAccount()}
              >
                {USER_MESSAGES.useDifferentAccount}
              </button>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-white px-4 py-5 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Step 1</p>
              <h2 className="display mt-1 text-3xl text-ink">{USER_MESSAGES.joinGroupModalTitle}</h2>
              <p className="mt-2 text-sm text-ink/80">{USER_MESSAGES.useThisSameAccountForGroup}</p>
              <div className="mt-3">
                <PlayAccountChip email={user.email} />
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">{USER_MESSAGES.groupsSignedInWarning}</p>
              <div className="mt-4">
                <AccountMismatchWarning email={user.email} />
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
              <p className="text-sm font-semibold text-ink">{alreadyJoinedPrompt(user.email)}</p>
              {verified ? (
                <div className="mt-3" role="status">
                  <p className="text-base font-semibold text-teal-dark">✓ {USER_MESSAGES.inTheGroup}</p>
                  <p className="mt-1 break-all text-base font-semibold text-ink">{user.email}</p>
                </div>
              ) : notMember ? (
                <div className="mt-3 space-y-3" role="status">
                  <p className="text-sm text-ink/80">{USER_MESSAGES.checkAccessNotMember}</p>
                  <p className="text-sm text-ink/80">
                    Make sure you joined the group with:
                    <span className="mt-1 block break-all font-semibold text-ink">{user.email}</span>
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
              {!verified ? (
                <button
                  type="button"
                  className="mt-4 inline-flex min-h-14 w-full touch-manipulation items-center justify-center rounded-full border-2 border-clay px-5 font-semibold text-clay hover:bg-clay hover:text-white disabled:opacity-60"
                  onClick={() => void checkAccess()}
                  disabled={checking}
                >
                  {checking ? "Checking…" : "Check My Access"}
                </button>
              ) : null}
            </div>

            {showPlay && user.playJoinUrl ? (
              <div className="rounded-2xl border border-ink/10 bg-foam px-4 py-5 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Step 2</p>
                <h2 className="display mt-1 text-3xl text-ink">{USER_MESSAGES.nextPlayTest}</h2>
                <p className="mt-2 text-sm text-ink/80">{USER_MESSAGES.joinPlayTestHint}</p>
                <div className="mt-3">
                  <PlayAccountChip email={user.email} />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{USER_MESSAGES.playUsingSame}</p>
                <ExternalButton
                  className="mt-4 min-h-14 w-full bg-clay text-white hover:bg-clay-dark"
                  onClick={openPlayTest}
                  label="Join Google Play Test"
                />
              </div>
            ) : null}

            {showPlay && user.playStoreUrl ? (
              <div className="rounded-2xl border border-ink/10 bg-white px-4 py-5 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Step 3</p>
                <h2 className="display mt-1 text-3xl text-ink">{USER_MESSAGES.installTitle}</h2>
                <p className="mt-2 text-sm text-ink/80">{USER_MESSAGES.installHint}</p>
                <ExternalButton
                  className="mt-4 min-h-14 w-full border-2 border-ink/15 bg-foam text-ink hover:bg-mist/60"
                  onClick={openInstall}
                  label="Install AAC-Sinhala"
                />
              </div>
            ) : null}

            {showPlay ? (
              <div className="rounded-2xl border border-ink/10 bg-foam px-4 py-5 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Step 4</p>
                <h2 className="display mt-1 text-3xl text-ink">{USER_MESSAGES.startTestingTitle}</h2>
                <p className="mt-2 text-sm text-ink/80">{USER_MESSAGES.startTestingHint}</p>
                <div className="mt-5">
                  <AppPhoneCluster compact />
                </div>
                <p className="mt-6 text-sm font-semibold text-ink">{USER_MESSAGES.feedbackPrompt}</p>
                <a
                  href="/feedback"
                  className="mt-3 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-teal px-5 text-base font-semibold text-white no-underline hover:bg-teal-dark"
                >
                  {USER_MESSAGES.sendFeedback}
                </a>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {user ? (
        <GroupJoinModal
          open={showGroupHelp}
          email={user.email}
          onClose={() => setShowGroupHelp(false)}
          onOpenGroup={confirmOpenGroup}
        />
      ) : null}
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
