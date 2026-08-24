import { Link, NavLink } from "react-router-dom";

const links = [
  { href: "/#join", label: "Join" },
  { href: "/#app", label: "App" },
  { href: "/feedback", label: "Feedback" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="glass flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-sand" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-clay" />
              <span className="mx-0.5 h-2 w-2 rounded-full bg-teal" />
              <span className="h-2 w-2 rounded-full bg-gold" />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-wide text-ink">AAC Sinhala</span>
              <span className="sinhala block text-xs text-ink/70">හඬක් සොයන ළමයින්ට</span>
            </span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-ink/80 hover:text-ink">
                {link.label}
              </a>
            ))}
            <NavLink
              to="/#join"
              className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-clay-dark"
            >
              Join the Beta Test
            </NavLink>
          </nav>
          <a
            href="/#join"
            className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white no-underline md:hidden"
          >
            Join beta
          </a>
        </div>
      </div>
    </header>
  );
}
