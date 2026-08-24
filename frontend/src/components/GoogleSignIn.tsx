import { useEffect, useId, useRef, useState } from "react";
import { USER_MESSAGES } from "@shared/types";
import { useAuth } from "../auth";

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

export default function GoogleSignIn() {
  const { googleClientId, configured, error, signInWithCredential } = useAuth();
  const hostRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef(randomNonce());
  const [status, setStatus] = useState("");
  const statusId = useId();

  useEffect(() => {
    if (!configured || !googleClientId) return;
    const clientId = googleClientId;
    let cancelled = false;

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
        hostRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(hostRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "left",
          width: Math.min(400, Math.max(280, Math.floor(hostRef.current.clientWidth) || 320)),
        });
      } catch {
        if (!cancelled) setStatus(USER_MESSAGES.googleSignInFailed);
      }
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, [configured, googleClientId, signInWithCredential]);

  return (
    <div className="mt-6">
      {!configured ? (
        <p className="rounded-2xl border border-ink/10 bg-foam px-4 py-3 text-sm text-ink/80" role="status">
          {USER_MESSAGES.googleSignInUnavailable}
        </p>
      ) : (
        <div
          ref={hostRef}
          className="flex min-h-14 w-full justify-center"
          aria-label="Continue with Google"
        />
      )}
      {error || status ? (
        <p id={statusId} className="mt-3 text-sm font-medium text-clay-dark" role="alert">
          {error || status}
        </p>
      ) : null}
    </div>
  );
}
