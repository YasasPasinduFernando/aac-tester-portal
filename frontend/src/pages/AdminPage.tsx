import { useEffect, useState } from "react";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

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
          setError("Admin access is protected by Cloudflare Access.");
          return;
        }
        setData(payload);
        setFeedback(feedbackPayload.feedback ?? []);
      } catch {
        if (!cancelled) setError("Admin access is protected by Cloudflare Access.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

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
            <h1 className="display text-5xl text-ink">Tester admin</h1>
            <p className="mt-3 max-w-2xl text-ink/75">
              Protected by Cloudflare Access. Emails stay on this page. Google Sign-In and typed
              email both create tester rows. Link clicks are recorded events, not Google membership
              or Play download proof.
            </p>
          </div>
          {data?.stats ? (
            <button
              type="button"
              className="rounded-full bg-ink px-5 py-3 font-semibold text-sand hover:bg-ink-soft"
              onClick={() => void exportCsv()}
            >
              Export CSV
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
            <Stat label="Total tester requests" value={data.stats.totalRequests} />
            <Stat label="Google signups" value={data.stats.googleSignups} />
            <Stat label="Email signups" value={data.stats.emailSignups} />
            <Stat label="Feedback count" value={data.stats.feedbackCount} />
            <Stat label="Pending group joins" value={data.stats.pendingGroupJoins} />
            <Stat label="Pending Play joins" value={data.stats.pendingPlayJoins} />
            <Stat label="Completed onboarding flows" value={data.stats.completedOnboardingFlows} />
            <Stat label="Needs attention" value={data.stats.needsAttention} />
          </div>
        ) : null}
        {data?.stats ? (
          <p className="mt-4 text-sm text-ink/60">
            Verified Google Group memberships: {data.stats.verifiedMemberships}. If this is 0,
            membership verification is unavailable for the consumer group.
          </p>
        ) : null}
        {data?.testers ? (
          <section className="mt-12 overflow-x-auto">
            <h2 className="text-2xl font-semibold">Registrants</h2>
            <table className="mt-4 min-w-full text-left text-sm">
              <caption className="sr-only">Tester requests</caption>
              <thead>
                <tr className="border-b border-ink/15">
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Signup</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Requested</th>
                  <th className="py-3 pr-4">Last activity</th>
                  <th className="py-3 pr-4">Group</th>
                  <th className="py-3 pr-4">Membership</th>
                </tr>
              </thead>
              <tbody>
                {data.testers.map((row) => (
                  <tr key={row.email} className="border-b border-ink/10">
                    <td className="py-3 pr-4">{row.email}</td>
                    <td className="py-3 pr-4">{row.signup_method === "google" ? "Google" : "Email"}</td>
                    <td className="py-3 pr-4">{row.status}</td>
                    <td className="py-3 pr-4">{row.requested_at}</td>
                    <td className="py-3 pr-4">{row.last_activity_at ?? "—"}</td>
                    <td className="py-3 pr-4">{row.group_join_started_at ? "Opened" : "—"}</td>
                    <td className="py-3 pr-4">{row.membership_verified ? "Verified" : "Not verified"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Feedback</h2>
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
                    <p className="mt-2 text-xs font-semibold text-ink/60">Screenshot attached</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink/60">No feedback yet.</p>
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
