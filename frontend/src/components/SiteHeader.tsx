import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { useT } from "../locale";
import LanguageSwitch from "./LanguageSwitch";

export default function SiteHeader() {
  const { user, signOut, playStoreUrl } = useAuth();
  const t = useT();
  return (
    <header className="sticky top-0 z-40">
      <a className="skip-link" href="#main">
        {t.skipToContent}
      </a>
      <div className="mx-auto max-w-3xl px-4 pt-3">
        <div className="glass flex items-center justify-between gap-2 rounded-full px-3 py-2">
          <Link to="/" className="flex min-w-0 items-center gap-2 no-underline">
            <img
              src="/aac-logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0"
            />
            <span className="truncate text-sm font-semibold text-ink">AAC Sinhala</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <LanguageSwitch />
            {user ? (
              <button
                type="button"
                className="min-h-10 rounded-full px-3 text-sm font-semibold text-ink"
                onClick={() => void signOut()}
              >
                {t.signOut}
              </button>
            ) : (
              <Link to="/" className="min-h-10 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white no-underline">
                {t.join}
              </Link>
            )}
          </div>
        </div>
        <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-2 text-xs font-semibold text-ink/70 sm:text-sm">
          <Link to="/" className="text-ink/70 no-underline hover:text-ink">
            {t.join}
          </Link>
          <Link to="/smart-aac" className="text-ink/70 no-underline hover:text-ink">
            {t.caseStudy}
          </Link>
          <Link to="/gallery" className="text-ink/70 no-underline hover:text-ink">
            {t.gallery}
          </Link>
          <Link to="/feedback" className="text-ink/70 no-underline hover:text-ink">
            {t.feedback}
          </Link>
          {playStoreUrl ? (
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-clay no-underline hover:text-clay-dark"
            >
              {t.getOnGooglePlay}
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
