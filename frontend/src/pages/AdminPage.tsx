import { useEffect, useState } from "react";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

interface AdminPayload {
  error?: string;
  admin?: string;
  stats?: {
    totalRequests: number;
    currentTesterCount: number;
    pendingRequests: number;
    activeTesters: number;
    removedTesters: number;
    recentErrors: Array<{
      id: string;
      email: string;
      error_message: string | null;
      requested_at: string;
    }>;
  };
  testers?: Array<{
    email: string;
    status: string;
    requested_at: string;
    last_verified_at: string | null;
    error_message: string | null;
  }>;
}

export default function AdminPage() {
  const [data, setData] = useState<AdminPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const headers: HeadersInit = { "X-Requested-With": "AACSinhalaPortal" };
        if (import.meta.env.DEV) {
          const localEmail = window.localStorage.getItem("aac-admin-dev-email");
          if (localEmail) headers["X-Admin-Dev-Email"] = localEmail;
        }
        const response = await fetch("/api/admin/stats", { headers });
        const payload = (await response.json()) as AdminPayload;
        if (cancelled) return;
        if (!response.ok) {
          setError("Admin access is protected by Cloudflare Access.");
          return;
        }
        setData(payload);
      } catch {
        if (!cancelled) setError("Admin access is protected by Cloudflare Access.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="display text-5xl text-ink">Tester admin</h1>
        <p className="mt-3 max-w-2xl text-ink/75">
          This page is not public. In production it must sit behind Cloudflare Access. Tester emails are shown only
          here so pending people can be added to the Google Group by hand when the Groups API cannot mutate
          membership.
        </p>
        {error ? (
          <p className="glass mt-8 rounded-3xl p-6 text-clay-dark" role="alert">
            {error}
          </p>
        ) : null}
        {data?.stats ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Total requests" value={data.stats.totalRequests} />
            <Stat label="Current testers" value={data.stats.currentTesterCount} />
            <Stat label="Pending" value={data.stats.pendingRequests} />
            <Stat label="Active testers" value={data.stats.activeTesters} />
            <Stat label="Removed" value={data.stats.removedTesters} />
          </div>
        ) : null}
        {data?.stats?.recentErrors?.length ? (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold">Recent errors</h2>
            <ul className="mt-4 space-y-2">
              {data.stats.recentErrors.map((row) => (
                <li key={row.id} className="rounded-2xl bg-foam px-4 py-3 text-sm">
                  <span className="font-medium">{row.email}</span>
                  <span className="mx-2 text-ink/50">{row.error_message}</span>
                  <time dateTime={row.requested_at}>{row.requested_at}</time>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {data?.testers ? (
          <section className="mt-12 overflow-x-auto">
            <h2 className="text-2xl font-semibold">Requests</h2>
            <table className="mt-4 min-w-full text-left text-sm">
              <caption className="sr-only">Tester requests</caption>
              <thead>
                <tr className="border-b border-ink/15">
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Requested</th>
                  <th className="py-3 pr-4">Last verified</th>
                </tr>
              </thead>
              <tbody>
                {data.testers.map((row) => (
                  <tr key={row.email} className="border-b border-ink/10">
                    <td className="py-3 pr-4">{row.email}</td>
                    <td className="py-3 pr-4">{row.status}</td>
                    <td className="py-3 pr-4">{row.requested_at}</td>
                    <td className="py-3 pr-4">{row.last_verified_at ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
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
