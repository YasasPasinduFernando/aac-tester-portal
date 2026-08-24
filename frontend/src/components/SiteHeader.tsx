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
      <div className="mx-auto max-w-lg px-4 pt-3">
        <div className="glass flex items-center justify-between gap-3 rounded-full px-3 py-2">
          <Link to="/" className="flex min-w-0 items-center gap-2 no-underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-gold" />
            </span>
            <span className="text-sm font-semibold text-ink">AAC Sinhala</span>
          </Link>
          {user ? (
            <button
              type="button"
              className="min-h-10 rounded-full px-3 text-sm font-semibold text-ink"
              onClick={() => void signOut()}
            >
              {USER_MESSAGES.signOut}
            </button>
          ) : (
            <Link to="/" className="min-h-10 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white no-underline">
              Join
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
