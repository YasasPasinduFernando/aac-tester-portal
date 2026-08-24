import { useEffect, useId, useRef } from "react";
import { GUIDE_SHOTS, USER_MESSAGES } from "@shared/types";
import { AccountMismatchWarning } from "./AccountWarning";

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
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

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
        tabIndex={-1}
        className="group-join-modal glass flex max-h-[min(100dvh,36rem)] w-full max-w-md flex-col overflow-hidden rounded-t-[1.5rem] text-ink shadow-2xl outline-none sm:rounded-[1.75rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <h3 id={titleId} className="text-xl font-semibold">
              Tap Join group
            </h3>
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-ink/15 text-xl text-ink/70"
              onClick={onClose}
              aria-label="Close join instructions"
            >
              ×
            </button>
          </div>
          <p id={descId} className="sr-only">
            {USER_MESSAGES.playAccountImportant}
          </p>
          <div className="mt-3">
            <AccountMismatchWarning email={email} />
          </div>
          <img
            src={GUIDE_SHOTS.joinGroup.src}
            alt={GUIDE_SHOTS.joinGroup.alt}
            className="mt-3 h-auto w-full rounded-xl bg-white"
          />
          <p className="mt-2 text-sm text-ink/70">{USER_MESSAGES.lookForJoinGroup}</p>
        </div>
        <div className="shrink-0 border-t border-ink/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          <button
            type="button"
            className="inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-clay px-6 font-semibold text-white hover:bg-clay-dark"
            onClick={onOpenGroup}
            aria-label="Open Tester Group in a new tab"
          >
            Open Tester Group
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}
