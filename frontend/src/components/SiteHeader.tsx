import { Link } from "react-router-dom";
import { USER_MESSAGES } from "@shared/types";
import { useAuth } from "../auth";

export default function SiteHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <div className="glass flex items-center justify-between gap-3 rounded-full px-4 py-2.5">
          <Link to="/" className="flex min-w-0 items-center gap-2 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-gold" />
            </span>
            <span className="text-sm font-semibold text-ink">AAC Sinhala</span>
          </Link>
          {user ? (
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink hover:bg-mist/60"
              onClick={() => void signOut()}
            >
              {USER_MESSAGES.signOut}
            </button>
          ) : (
            <a
              href="/#join"
              className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-clay-dark"
            >
              Join
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
