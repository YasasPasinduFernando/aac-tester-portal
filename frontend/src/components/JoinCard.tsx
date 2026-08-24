import { useRef, useState } from "react";
import { playStepsUnlocked } from "@shared/types";
import { useAuth } from "../auth";
import { useT } from "../locale";
import { AccountMismatchWarning, VerifiedAccountCard, WrongAccountHelp } from "./AccountWarning";
import CopyGroupName from "./CopyGroupName";
import GoogleSignIn from "./GoogleSignIn";
import GroupJoinModal from "./GroupJoinModal";

export default function JoinCard() {
  const t = useT();
  const { ready, user, refresh, switchAccount } = useAuth();
  const [checking, setChecking] = useState(false);
  const [checkState, setCheckState] = useState<"verified" | "not_member" | "unavailable" | null>(null);
  const [openedGroup, setOpenedGroup] = useState(false);
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
    setOpenedGroup(true);
    void recordEvent("group_join");
    window.open(user.groupJoinUrl, "_blank", "noopener,noreferrer");
    window.requestAnimationFrame(() => {
      checkAccessRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  async function checkAccess() {
    setChecking(true);
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
        membershipVerification: "verified" | "not_member" | "unavailable";
      };
      setCheckState(payload.membershipVerification);
      await refresh();
    } catch {
      setCheckState("unavailable");
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
  const groupStarted = openedGroup || Boolean(user?.groupJoinStarted);
  const step = verified ? 3 : groupStarted ? 2 : 1;
  const steps = [t.stepJoinGroup, t.stepCheckAccess, t.stepInstallApp];

  return (
    <section id="join" className="scroll-mt-20" aria-labelledby="join-title">
      <h1 id="join-title" className="display text-center text-[2rem] leading-none text-ink sm:text-4xl">
        {t.joinBetaTitle}
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-sm font-medium text-ink/80 sm:text-base">
        {t.joinBetaSubtitle}
      </p>

      <div className="glass mt-5 rounded-[1.5rem] p-4 sm:mt-8 sm:p-7">
        {!ready ? (
          <p className="text-center text-sm text-ink/70">{t.loading}</p>
        ) : !user ? (
          <>
            <ol className="mb-4 space-y-1 text-sm text-ink/80">
              <li>1. {t.continueWithGoogle}</li>
              <li>2. {t.joinTesterGroup}</li>
              <li>3. {t.joinPlayAndInstall}</li>
            </ol>
            <p className="text-center text-sm font-semibold text-ink">{t.sameAccountGroupsAndPlay}</p>
            <GoogleSignIn />
          </>
        ) : (
          <div className="space-y-4">
            <VerifiedAccountCard
              email={user.email}
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
              onSwitch={() => void switchAccount()}
            />
            <ol className="grid grid-cols-3 gap-1" aria-label={t.onboardingSteps}>
              {steps.map((label, index) => {
                const n = index + 1;
                const active = n === step;
                const done = n < step;
                return (
                  <li
                    key={label}
                    className={`rounded-full px-1 py-2 text-center text-[11px] font-semibold leading-tight sm:text-xs ${
                      active ? "bg-clay text-white" : done ? "bg-teal/15 text-teal-dark" : "bg-mist/50 text-ink/50"
                    }`}
                  >
                    {n}. {label}
                  </li>
                );
              })}
            </ol>

            {step === 1 ? (
              <div>
                <h2 className="text-lg font-semibold text-ink">{t.step1Title}</h2>
                <p className="mt-1 text-sm text-ink/80">{t.useThisSameAccountForGroup}</p>
                <div className="mt-3">
                  <AccountMismatchWarning email={user.email} />
                </div>
                <div className="mt-3">
                  <CopyGroupName />
                </div>
                <button
                  ref={joinGroupButtonRef}
                  type="button"
                  className="mt-4 inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-clay px-5 text-base font-semibold text-white hover:bg-clay-dark"
                  onClick={() => setShowGroupHelp(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showGroupHelp}
                >
                  {t.openTesterGroup}
                  <span aria-hidden="true">↗</span>
                </button>
                <p className="mt-2 text-center text-xs text-ink/60">{t.groupsNewTabHint}</p>
              </div>
            ) : null}

            {step === 2 ? (
              <div ref={checkAccessRef} id="check-access">
                <h2 className="text-lg font-semibold text-ink">{t.step2Title}</h2>
                <p className="mt-1 text-sm text-ink/80">{t.afterJoinCheck}</p>
                <div className="mt-3">
                  <CopyGroupName />
                </div>
                {notMember ? (
                  <div className="mt-3 space-y-3" role="status">
                    <p className="text-sm text-ink/80">{t.checkAccessNotMember}</p>
                    <p className="break-all text-sm font-semibold text-ink">{user.email}</p>
                    <WrongAccountHelp />
                  </div>
                ) : checkState === "unavailable" ? (
                  <p className="mt-3 text-sm text-ink/80" role="status">
                    {t.checkAccessUnavailable}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="mt-4 inline-flex min-h-14 w-full touch-manipulation items-center justify-center rounded-full bg-clay px-5 font-semibold text-white hover:bg-clay-dark disabled:opacity-60"
                  onClick={() => void checkAccess()}
                  disabled={checking}
                >
                  {checking ? t.checking : t.checkMyAccess}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full text-center text-sm font-semibold text-clay"
                  onClick={() => setShowGroupHelp(true)}
                >
                  {t.openTesterGroupAgain}
                </button>
              </div>
            ) : null}

            {step === 3 && showPlay ? (
              <div>
                <p className="text-base font-semibold text-teal-dark">✓ {t.inTheGroup}</p>
                <h2 className="mt-3 text-lg font-semibold text-ink">{t.step3Title}</h2>
                <p className="mt-1 text-sm text-ink/80">{t.playUsingSame}</p>
                {user.playJoinUrl ? (
                  <button
                    type="button"
                    className="mt-4 inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-clay px-5 text-base font-semibold text-white hover:bg-clay-dark"
                    onClick={openPlayTest}
                    aria-label={t.joinPlayAria}
                  >
                    {t.joinGooglePlayTest}
                    <span aria-hidden="true">↗</span>
                  </button>
                ) : null}
                {user.playStoreUrl ? (
                  <button
                    type="button"
                    className="mt-3 inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-full border-2 border-ink/15 bg-white px-5 text-base font-semibold text-ink"
                    onClick={openInstall}
                    aria-label={t.installAria}
                  >
                    {t.installApp}
                    <span aria-hidden="true">↗</span>
                  </button>
                ) : null}
                <a
                  href="/feedback"
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center text-sm font-semibold text-clay"
                >
                  {t.sendFeedback}
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
