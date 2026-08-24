import { useState } from "react";
import { TESTER_GROUP_EMAIL, TESTER_GROUP_SEARCH_NAME, USER_MESSAGES } from "@shared/types";

export default function CopyGroupName() {
  const [copied, setCopied] = useState(false);

  async function copyName() {
    try {
      await navigator.clipboard.writeText(TESTER_GROUP_EMAIL);
    } catch {
      const field = document.createElement("textarea");
      field.value = TESTER_GROUP_EMAIL;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-foam px-3 py-3">
      <p className="text-sm text-ink/80">{USER_MESSAGES.searchGroupHint}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="min-w-0 flex-1 break-all text-sm font-semibold text-ink">{TESTER_GROUP_SEARCH_NAME}</p>
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-ink/15 text-ink"
          onClick={() => void copyName()}
          aria-label={USER_MESSAGES.copyGroupName}
        >
          {copied ? (
            <span className="text-xs font-semibold text-teal-dark" aria-hidden="true">
              ✓
            </span>
          ) : (
            <CopyIcon />
          )}
        </button>
      </div>
      {copied ? (
        <p className="mt-1 text-xs font-semibold text-teal-dark" role="status">
          {USER_MESSAGES.groupNameCopied}
        </p>
      ) : null}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9 3h9a2 2 0 0 1 2 2v11h-2V5H9V3zm-4 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm0 2v12h9V9H5z"
      />
    </svg>
  );
}
