import { lazy, Suspense, useState } from "react";
import { CHAT_SUGGESTIONS } from "@shared/chatbot";
import { useLocale } from "../locale";
import AssistantPanel from "./AssistantPanel";

const AvatarScene = lazy(() => import("./AvatarScene"));

const TIP_KEY = "aac-ask-tip-dismissed";

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    const ok = Boolean(gl);
    const lose = gl?.getExtension?.("WEBGL_lose_context");
    lose?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

function tipWasDismissed(): boolean {
  try {
    return window.localStorage.getItem(TIP_KEY) === "1";
  } catch {
    return false;
  }
}

export default function AssistantHost() {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [tipVisible, setTipVisible] = useState(() => !tipWasDismissed());
  const [webgl] = useState(() => {
    if (typeof window === "undefined") return false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !reduced && canUseWebGL();
  });
  const prompt = CHAT_SUGGESTIONS[locale][0];

  function dismissTip() {
    setTipVisible(false);
    try {
      window.localStorage.setItem(TIP_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="assistant-host">
      {open ? (
        <AssistantPanel onClose={() => setOpen(false)} />
      ) : (
        <>
          {tipVisible ? (
            <div className="assistant-tip">
              <button
                type="button"
                className="assistant-tip-ask"
                onClick={() => setOpen(true)}
              >
                <span className="assistant-tip-q">{prompt}</span>
                <span className="assistant-tip-hint">{t.chatTapToAsk}</span>
              </button>
              <button
                type="button"
                className="assistant-tip-x"
                onClick={dismissTip}
                aria-label={t.chatDismissTip}
              >
                ×
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="assistant-dock"
            onClick={() => setOpen(true)}
            aria-label={t.chatTitle}
          >
            {webgl ? (
              <Suspense fallback={<div className="assistant-dock-fallback" />}>
                <AvatarScene mood="idle" variant="dock" />
              </Suspense>
            ) : (
              <img src="/aac-logo.png" alt="" className="h-full w-full object-contain p-5" />
            )}
          </button>
        </>
      )}
      <button
        type="button"
        className="assistant-fab"
        aria-expanded={open}
        aria-controls="assistant-title"
        aria-label={open ? t.chatClose : t.chatTitle}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? t.chatClose : t.chatTitle}
      </button>
    </div>
  );
}
