import { useT } from "../locale";

export default function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-8 px-4 py-6 text-center text-xs text-ink/55">
      <p>{t.noPassword}</p>
      <p className="mt-1">
        <a className="font-semibold text-clay" href="/feedback">
          {t.feedback}
        </a>
      </p>
    </footer>
  );
}
