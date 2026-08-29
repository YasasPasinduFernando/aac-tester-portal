import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "../auth";
import { useT } from "../locale";

const GIS_SRC = "https://accounts.google.com/gsi/client";

function loadGis(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("gis")), { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("gis"));
    document.head.appendChild(script);
  });
}

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function buttonWidth(host: HTMLElement): number {
  const width = Math.floor(host.getBoundingClientRect().width);
  return Math.min(400, Math.max(240, width || 320));
}

export default function GoogleSignIn() {
  const t = useT();
  const { googleClientId, configured, error, signInWithCredential } = useAuth();
  const hostRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef(randomNonce());
  const [status, setStatus] = useState("");
  const [buttonReady, setButtonReady] = useState(false);
  const statusId = useId();

  useEffect(() => {
    if (!configured || !googleClientId) return;
    const clientId = googleClientId;
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    async function start() {
      try {
        await loadGis();
        if (cancelled || !hostRef.current || !window.google?.accounts.id) return;
        const nonce = nonceRef.current;
        window.google.accounts.id.initialize({
          client_id: clientId,
          nonce,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: "popup",
          context: "signin",
          callback: (response) => {
            void signInWithCredential(response.credential, nonce);
          },
        });

        let lastWidth = 0;
        function draw() {
          if (cancelled || !hostRef.current || !window.google?.accounts.id) return;
          const width = buttonWidth(hostRef.current);
          if (Math.abs(width - lastWidth) < 8 && hostRef.current.childElementCount > 0) return;
          lastWidth = width;
          hostRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(hostRef.current, {
            theme: "filled_blue",
            size: "large",
            type: "standard",
            shape: "pill",
            text: "continue_with",
            logo_alignment: "left",
            width,
          });
          setButtonReady(Boolean(hostRef.current.querySelector("iframe, div[role='button'], button")));
        }

        draw();
        observer = new ResizeObserver(() => draw());
        observer.observe(hostRef.current);
        window.setTimeout(() => {
          if (!cancelled) setButtonReady(true);
        }, 1200);
      } catch {
        if (!cancelled) setStatus(t.googleSignInFailed);
      }
    }

    void start();
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [configured, googleClientId, signInWithCredential, t.googleSignInFailed]);

  return (
    <div className="mt-6">
      {!configured ? (
        <p className="rounded-2xl border border-ink/10 bg-foam px-4 py-3 text-sm text-ink/80" role="status">
          {t.googleSignInUnavailable}
        </p>
      ) : (
        <div className="relative min-h-14 w-full">
          {!buttonReady ? (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-ink/60">
              {t.loadingGoogle}
            </p>
          ) : null}
          <div
            ref={hostRef}
            className="flex min-h-14 w-full justify-center overflow-hidden"
            aria-label={t.continueWithGoogleAria}
          />
        </div>
      )}
      {error || status ? (
        <p id={statusId} className="mt-3 text-sm font-medium text-clay-dark" role="alert">
          {error ? t.googleSignInFailed : status}
        </p>
      ) : null}
    </div>
  );
}
