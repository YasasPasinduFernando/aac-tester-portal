import { useEffect, useState } from "react";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { useT } from "../locale";

interface AdminPayload {
  error?: string;
  admin?: string;
  stats?: {
    totalRequests: number;
    pendingGroupJoins: number;
    pendingPlayJoins: number;
    completedOnboardingFlows: number;
    verifiedMemberships: number;
    needsAttention: number;
    feedbackCount: number;
    googleSignups: number;
    emailSignups: number;
  };
  testers?: Array<{
    email: string;
    status: string;
    requested_at: string;
    last_activity_at: string | null;
    group_join_started_at: string | null;
    play_join_started_at: string | null;
    feedback_submitted: number;
    membership_verified: number;
    signup_method?: "google" | "email";
    authenticated?: boolean;
    authenticated_at?: string | null;
    display_name?: string | null;
  }>;
}

interface FeedbackPayload {
  feedback?: Array<{
    id: string;
    email: string;
    feedback_type: string;
    message: string;
    created_at: string;
    screenshotAttached: boolean;
  }>;
}

function adminHeaders(): HeadersInit {
  const headers: HeadersInit = { "X-Requested-With": "AACSinhalaPortal" };
  if (import.meta.env.DEV) {
    const localEmail = window.localStorage.getItem("aac-admin-dev-email");
    if (localEmail) headers["X-Admin-Dev-Email"] = localEmail;
  }
  return headers;
}

export default function AdminPage() {
  const t = useT();
  const [data, setData] = useState<AdminPayload | null>(null);
  const [feedback, setFeedback] = useState<FeedbackPayload["feedback"]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers = adminHeaders();
        const [statsRes, feedbackRes] = await Promise.all([
          fetch("/api/admin/stats", { headers }),
          fetch("/api/admin/feedback", { headers }),
        ]);
        const payload = (await statsRes.json()) as AdminPayload;
        const feedbackPayload = (await feedbackRes.json()) as FeedbackPayload;
        if (cancelled) return;
        if (!statsRes.ok) {
          setError(t.adminProtected);
          return;
        }
        setData(payload);
        setFeedback(feedbackPayload.feedback ?? []);
      } catch {
        if (!cancelled) setError(t.adminProtected);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [t.adminProtected]);

  async function exportCsv() {
    const response = await fetch("/api/admin/export.csv", { headers: adminHeaders() });
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aac-tester-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-5xl text-ink">{t.adminTitle}</h1>
            <p className="mt-3 max-w-2xl text-ink/75">{t.adminLead}</p>
          </div>
          {data?.stats ? (
            <button
              type="button"
              className="rounded-full bg-ink px-5 py-3 font-semibold text-sand hover:bg-ink-soft"
              onClick={() => void exportCsv()}
            >
              {t.adminExportCsv}
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="glass mt-8 rounded-3xl p-6 text-clay-dark" role="alert">
            {error}
          </p>
        ) : null}
        {data?.stats ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label={t.adminTotalRequests} value={data.stats.totalRequests} />
            <Stat label={t.adminGoogleSignups} value={data.stats.googleSignups} />
            <Stat label={t.adminEmailSignups} value={data.stats.emailSignups} />
            <Stat label={t.adminFeedbackCount} value={data.stats.feedbackCount} />
            <Stat label={t.adminPendingGroup} value={data.stats.pendingGroupJoins} />
            <Stat label={t.adminPendingPlay} value={data.stats.pendingPlayJoins} />
            <Stat label={t.adminCompletedFlows} value={data.stats.completedOnboardingFlows} />
            <Stat label={t.adminNeedsAttention} value={data.stats.needsAttention} />
          </div>
        ) : null}
        {data?.stats ? (
          <p className="mt-4 text-sm text-ink/60">
            {t.adminVerifiedMemberships} {data.stats.verifiedMemberships}. {t.adminVerifiedHint}
          </p>
        ) : null}
        {data?.testers ? (
          <section className="mt-12 overflow-x-auto">
            <h2 className="text-2xl font-semibold">{t.adminRegistrants}</h2>
            <table className="mt-4 min-w-full text-left text-sm">
              <caption className="sr-only">{t.adminTesterRequests}</caption>
              <thead>
                <tr className="border-b border-ink/15">
                  <th className="py-3 pr-4">{t.adminColEmail}</th>
                  <th className="py-3 pr-4">{t.adminColSignup}</th>
                  <th className="py-3 pr-4">{t.adminColStatus}</th>
                  <th className="py-3 pr-4">{t.adminColRequested}</th>
                  <th className="py-3 pr-4">{t.adminColLastActivity}</th>
                  <th className="py-3 pr-4">{t.adminColGroup}</th>
                  <th className="py-3 pr-4">{t.adminColMembership}</th>
                </tr>
              </thead>
              <tbody>
                {data.testers.map((row) => (
                  <tr key={row.email} className="border-b border-ink/10">
                    <td className="py-3 pr-4">{row.email}</td>
                    <td className="py-3 pr-4">
                      {row.signup_method === "google" ? t.adminSignupGoogle : t.adminSignupEmail}
                    </td>
                    <td className="py-3 pr-4">{row.status}</td>
                    <td className="py-3 pr-4">{row.requested_at}</td>
                    <td className="py-3 pr-4">{row.last_activity_at ?? "—"}</td>
                    <td className="py-3 pr-4">{row.group_join_started_at ? t.adminOpened : "—"}</td>
                    <td className="py-3 pr-4">
                      {row.membership_verified ? t.adminVerified : t.adminNotVerified}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{t.feedback}</h2>
          {feedback && feedback.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {feedback.map((row) => (
                <li key={row.id} className="glass rounded-[1.25rem] p-4">
                  <p className="text-sm font-semibold text-ink">
                    {row.email} · {row.feedback_type}
                  </p>
                  <p className="mt-1 text-xs text-ink/55">{row.created_at}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{row.message}</p>
                  {row.screenshotAttached ? (
                    <p className="mt-2 text-xs font-semibold text-ink/60">{t.adminScreenshotAttached}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink/60">{t.adminNoFeedback}</p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-3xl p-5">
      <p className="text-sm text-ink/70">{label}</p>
      <p className="display mt-2 text-4xl">{value}</p>
    </div>
  );
}
