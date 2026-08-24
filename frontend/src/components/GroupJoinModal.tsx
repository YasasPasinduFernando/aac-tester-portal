import { useEffect, useId, useRef } from "react";
import { GUIDE_SHOTS, USER_MESSAGES } from "@shared/types";

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
        className="group-join-modal glass w-full max-w-md overflow-hidden rounded-[1.75rem] text-ink shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <h3 id={titleId} className="display text-3xl">
              Tap Join group
            </h3>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-xl text-ink/70 hover:bg-mist/60"
              onClick={onClose}
              aria-label="Close join instructions"
            >
              ×
            </button>
          </div>
          <p id={descId} className="mt-3 text-sm font-semibold text-ink">
            {USER_MESSAGES.playStoreEveryone}
          </p>
          <p className="mt-1 break-all text-base font-semibold text-clay">{email}</p>
          <img
            src={GUIDE_SHOTS.joinGroup.src}
            alt={GUIDE_SHOTS.joinGroup.alt}
            className="mt-4 h-auto w-full rounded-2xl bg-white"
          />
          <p className="mt-3 text-sm text-ink/70">{USER_MESSAGES.lookForJoinGroup}</p>
        </div>
        <div className="border-t border-ink/10 px-5 py-4 sm:px-6">
          <button
            ref={primaryRef}
            type="button"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-clay px-6 font-semibold text-white hover:bg-clay-dark"
            onClick={onOpenGroup}
            aria-label="Open Tester Group in a new tab"
          >
            Open Tester Group
            <span aria-hidden="true">↗</span>
          </button>
          <p className="mt-2 text-center text-sm text-ink/60">{USER_MESSAGES.groupsNewTabHint}</p>
        </div>
      </div>
    </div>
  );
}
