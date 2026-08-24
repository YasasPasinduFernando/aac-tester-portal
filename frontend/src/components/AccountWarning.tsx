import { USER_MESSAGES } from "@shared/types";

export function PlayAccountChip({
  email,
  dark = false,
}: {
  email: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ${dark ? "bg-white/10" : "border border-ink/10 bg-foam"}`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-[0.16em] ${dark ? "text-gold" : "text-ink/60"}`}
      >
        {USER_MESSAGES.playStoreEmailLabel}
      </p>
      <p className={`mt-1 break-all text-base font-semibold sm:text-lg ${dark ? "text-foam" : "text-ink"}`}>
        {email}
      </p>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3.1 1.8 20.8h20.4L12 3.1zm0 4.7 7.2 12.4H4.8L12 7.8z"
      />
      <rect x="11.15" y="10.2" width="1.7" height="5.2" rx="0.4" fill="currentColor" />
      <rect x="11.15" y="16.4" width="1.7" height="1.7" rx="0.4" fill="currentColor" />
    </svg>
  );
}

export function AccountMismatchWarning({ email }: { email: string }) {
  return (
    <div
      className="rounded-2xl border border-amber-400/70 bg-amber-50 px-4 py-4 text-ink"
      role="note"
      aria-label="Google account warning"
    >
      <p className="flex items-start gap-2 text-sm font-bold leading-snug sm:text-base">
        <WarningIcon />
        <span>{USER_MESSAGES.playAccountImportant}</span>
      </p>
      <p className="mt-3 text-sm text-ink/80">{USER_MESSAGES.beforeJoiningSignedIn}</p>
      <p className="mt-1 break-all text-base font-semibold text-ink sm:text-lg">{email}</p>
      <p className="mt-3 text-sm leading-snug text-ink/80">{USER_MESSAGES.switchIfAnotherAccount}</p>
    </div>
  );
}

export function WrongAccountHelp() {
  return (
    <div className="text-sm text-ink/75">
      <p className="font-semibold text-ink">{USER_MESSAGES.wrongAccountHeading}</p>
      <p className="mt-1 leading-snug">{USER_MESSAGES.wrongAccountHelp}</p>
    </div>
  );
}
