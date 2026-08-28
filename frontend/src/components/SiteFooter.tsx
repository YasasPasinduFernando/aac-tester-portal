import { Link } from "react-router-dom";
import { useT } from "../locale";

export default function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-8 px-4 py-6 text-center text-xs text-ink/55">
      <p>{t.noPassword}</p>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-semibold">
        <Link to="/smart-aac" className="text-clay no-underline">
          {t.caseStudy}
        </Link>
        <Link to="/gallery" className="text-clay no-underline">
          {t.gallery}
        </Link>
        <Link to="/feedback" className="text-clay no-underline">
          {t.feedback}
        </Link>
        <a href="/#contact" className="text-clay no-underline">
          {t.contact}
        </a>
      </p>
    </footer>
  );
}
