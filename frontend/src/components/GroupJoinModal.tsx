import { useEffect, useId, useRef } from "react";
import { GUIDE_SHOTS, GROUP_JOIN_WALKTHROUGH, USER_MESSAGES } from "@shared/types";
import GuideShot from "./GuideShot";

interface GroupJoinModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onOpenGroup: () => void;
}

export default function GroupJoinModal({ open, email, onClose, onOpenGroup }: GroupJoinModalProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    primaryRef.current?.focus();

    function focusables() {
      if (!dialogRef.current) return [];
      return Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="group-join-overlay fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="group-join-modal glass relative flex max-h-[min(100dvh,52rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] text-ink shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Guided step</p>
              <h3 id={titleId} className="display mt-2 text-[1.85rem] leading-none sm:text-3xl">
                {USER_MESSAGES.joinGroupModalTitle}
              </h3>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 text-xl text-ink/70 hover:bg-mist/60"
              onClick={onClose}
              aria-label="Close join instructions"
            >
              ×
            </button>
          </div>

          <p id={descId} className="mt-3 text-base text-ink/80 sm:text-lg">
            {USER_MESSAGES.joinGroupModalLead}
          </p>

          <div className="mt-5">
            <GuideShot
              src={GUIDE_SHOTS.joinGroup.src}
              alt={GUIDE_SHOTS.joinGroup.alt}
              caption={GUIDE_SHOTS.joinGroup.caption}
              hint={GUIDE_SHOTS.joinGroup.hint}
            />
          </div>

          <div
            className="mt-5 rounded-2xl border border-gold/40 bg-gold/15 px-4 py-4"
            role="note"
            aria-label="Important account warning"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-dark">Important</p>
            <p className="mt-2 text-base font-semibold text-ink">{USER_MESSAGES.playAccountImportant}</p>
            <p className="mt-3 inline-flex rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-gold">
              {USER_MESSAGES.usePlayStoreAccountHeading}
            </p>
            <p className="mt-2 text-sm font-medium text-ink/90">{USER_MESSAGES.usePlayStoreAccount}</p>
            <p className="mt-1 text-sm text-ink/80">{USER_MESSAGES.sameAccountPlayAndGroup}</p>
          </div>

          <div className="mt-4 rounded-2xl border border-ink/10 bg-foam px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
              {USER_MESSAGES.accountEnteredLabel}
            </p>
            <p className="mt-1 break-all text-lg font-semibold">{email}</p>
          </div>

          <ol className="mt-5 space-y-2" aria-label="How to join the tester group">
            {GROUP_JOIN_WALKTHROUGH.map((step, index) => (
              <li key={step} className="flex items-start gap-3 rounded-2xl bg-mist/45 px-3 py-2.5">
                <span
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="pt-0.5 text-sm font-medium text-ink sm:text-base">{step}</span>
              </li>
            ))}
          </ol>

          <p className="mt-4 text-sm text-ink/75">{USER_MESSAGES.afterJoinCheck}</p>
        </div>

        <div className="shrink-0 border-t border-ink/10 bg-foam/80 px-5 py-4 sm:px-7">
          <button
            ref={primaryRef}
            type="button"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gold px-6 text-base font-semibold text-ink hover:bg-sand"
            onClick={onOpenGroup}
            aria-label="Open Tester Group in a new tab"
          >
            <span>Open Tester Group</span>
            <ExternalLinkIcon />
          </button>
          <p className="mt-2 text-center text-sm text-ink/65">{USER_MESSAGES.groupsNewTabHint}</p>
          <button
            type="button"
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-ink/15 px-6 text-sm font-semibold text-ink/75 hover:bg-mist/50"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true" fill="none">
      <path
        d="M8 4H4.5A1.5 1.5 0 0 0 3 5.5v10A1.5 1.5 0 0 0 4.5 17h10A1.5 1.5 0 0 0 16 15.5V12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M11 3h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 10 17 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
