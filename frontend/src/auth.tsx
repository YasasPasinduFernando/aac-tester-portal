import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { USER_MESSAGES, type MembershipVerification, type TesterStatus } from "@shared/types";

export interface AuthUser {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  authMethod: "google" | "email";
  membershipVerified: boolean;
  membershipVerification: MembershipVerification | null;
  status: TesterStatus | null;
  groupJoinUrl: string | null;
  playJoinUrl: string | null;
  playStoreUrl: string | null;
  groupJoinStarted: boolean;
  playJoinStarted: boolean;
}

interface AuthResponse {
  ok?: boolean;
  authenticated?: boolean;
  authMethod?: "google" | "email" | null;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  membershipVerified?: boolean;
  membershipVerification?: MembershipVerification | null;
  status?: TesterStatus | null;
  groupJoinUrl?: string | null;
  playJoinUrl?: string | null;
  playStoreUrl?: string | null;
  groupJoinStarted?: boolean;
  playJoinStarted?: boolean;
  message?: string;
  error?: string;
  googleClientId?: string | null;
  configured?: boolean;
}

interface AuthContextValue {
  ready: boolean;
  user: AuthUser | null;
  googleClientId: string | null;
  configured: boolean;
  playStoreUrl: string | null;
  error: string;
  signInWithCredential: (credential: string, nonce?: string) => Promise<boolean>;
  signInWithEmail: (email: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  switchAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const headers: HeadersInit = { "X-Requested-With": "AACSinhalaPortal" };

function userFromPayload(payload: AuthResponse): AuthUser | null {
  if (!payload.authenticated || !payload.email) return null;
  return {
    email: payload.email,
    displayName: payload.displayName ?? null,
    avatarUrl: payload.avatarUrl ?? null,
    authMethod: payload.authMethod === "email" ? "email" : "google",
    membershipVerified: payload.membershipVerified === true,
    membershipVerification: payload.membershipVerification ?? null,
    status: payload.status ?? null,
    groupJoinUrl: payload.groupJoinUrl ?? null,
    playJoinUrl: payload.playJoinUrl ?? null,
    playStoreUrl: payload.playStoreUrl ?? null,
    groupJoinStarted: payload.groupJoinStarted === true,
    playJoinStarted: payload.playJoinStarted === true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [playStoreUrl, setPlayStoreUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loadToken, setLoadToken] = useState(0);

  const applyPayload = useCallback((config: AuthResponse, me: AuthResponse) => {
    setGoogleClientId(config.googleClientId ?? null);
    setConfigured(config.configured === true);
    setPlayStoreUrl(config.playStoreUrl ?? null);
    setUser(userFromPayload(me));
  }, []);

  const refresh = useCallback(async () => {
    setLoadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [configRes, meRes] = await Promise.all([
          fetch("/api/auth/config", { headers, credentials: "include" }),
          fetch("/api/auth/me", { headers, credentials: "include" }),
        ]);
        const config = (await configRes.json()) as AuthResponse;
        const me = (await meRes.json()) as AuthResponse;
        if (cancelled) return;
        applyPayload(config, me);
      } catch {
        if (!cancelled) setError(USER_MESSAGES.googleSignInFailed);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [applyPayload, loadToken]);

  const signInWithCredential = useCallback(async (credential: string, nonce?: string) => {
    setError("");
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        credentials: "include",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ credential, nonce }),
      });
      const payload = (await response.json()) as AuthResponse;
      if (!response.ok || payload.authenticated === false) {
        setError(payload.message || USER_MESSAGES.googleSignInFailed);
        setUser(null);
        return false;
      }
      setUser(userFromPayload(payload));
      return true;
    } catch {
      setError(USER_MESSAGES.googleSignInFailed);
      return false;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    setError("");
    try {
      const response = await fetch("/api/auth/email", {
        method: "POST",
        credentials: "include",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as AuthResponse;
      if (!response.ok || payload.authenticated === false) {
        setError(payload.message || USER_MESSAGES.invalidEmail);
        setUser(null);
        return false;
      }
      setUser(userFromPayload(payload));
      return true;
    } catch {
      setError(USER_MESSAGES.googleSignInFailed);
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError("");
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers,
    });
    window.google?.accounts.id.disableAutoSelect();
    setUser(null);
  }, []);

  const switchAccount = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const value = useMemo(
    () => ({
      ready,
      user,
      googleClientId,
      configured,
      playStoreUrl,
      error,
      signInWithCredential,
      signInWithEmail,
      refresh,
      signOut,
      switchAccount,
    }),
    [
      ready,
      user,
      googleClientId,
      configured,
      playStoreUrl,
      error,
      signInWithCredential,
      signInWithEmail,
      refresh,
      signOut,
      switchAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
