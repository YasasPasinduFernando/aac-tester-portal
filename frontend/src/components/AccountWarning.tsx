import { useT } from "../locale";

export function PlayAccountChip({ email }: { email: string }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-ink/10 bg-foam px-4 py-3">
      <p className="text-xs font-semibold text-ink/60">{t.playStoreEmailLabel}</p>
      <p className="mt-0.5 break-all text-base font-semibold text-ink">{email}</p>
    </div>
  );
}

export function VerifiedAccountCard({
  email,
  displayName,
  avatarUrl,
  authMethod = "google",
  onSwitch,
}: {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  authMethod?: "google" | "email";
  onSwitch: () => void;
}) {
  const t = useT();
  const verifiedLabel = authMethod === "email" ? t.emailRegistered : t.googleVerified;
  return (
    <div className="rounded-2xl border border-teal/25 bg-foam px-4 py-3">
      <p className="text-sm font-semibold text-teal-dark">✓ {verifiedLabel}</p>
      <div className="mt-2 flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          {displayName ? <p className="truncate text-sm text-ink/70">{displayName}</p> : null}
          <p className="text-xs font-semibold text-ink/60">{t.playStoreEmailLabel}</p>
          <p className="break-all text-sm font-semibold leading-snug text-ink">{email}</p>
        </div>
      </div>
      <button
        type="button"
        className="mt-2 text-sm font-semibold text-clay"
        onClick={onSwitch}
      >
        {t.useDifferentAccount}
      </button>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="currentColor" d="M12 3.1 1.8 20.8h20.4L12 3.1zm0 4.7 7.2 12.4H4.8L12 7.8z" />
      <rect x="11.15" y="10.2" width="1.7" height="5.2" rx="0.4" fill="currentColor" />
      <rect x="11.15" y="16.4" width="1.7" height="1.7" rx="0.4" fill="currentColor" />
    </svg>
  );
}

export function AccountMismatchWarning({ email }: { email: string }) {
  const t = useT();
  return (
    <div
      className="rounded-2xl border border-amber-400/80 bg-amber-50 px-3 py-3 text-ink"
      role="note"
      aria-label={t.accountWarning}
    >
      <p className="flex items-start gap-2 text-sm font-bold leading-snug">
        <WarningIcon />
        <span>{t.playAccountImportant}</span>
      </p>
      <p className="mt-2 break-all text-base font-semibold">{email}</p>
      <p className="mt-2 text-sm leading-snug text-ink/80">{t.switchIfAnotherAccount}</p>
    </div>
  );
}

export function WrongAccountHelp() {
  const t = useT();
  return (
    <div className="text-sm text-ink/75">
      <p className="font-semibold text-ink">{t.wrongAccountHeading}</p>
      <p className="mt-1 leading-snug">{t.wrongAccountHelp}</p>
    </div>
  );
}
