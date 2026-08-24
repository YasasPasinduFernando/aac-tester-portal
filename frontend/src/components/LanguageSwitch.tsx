import { LOCALES, LOCALE_LABELS } from "@shared/ui-copy";
import { useLocale } from "../locale";

export default function LanguageSwitch() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div className="flex shrink-0 rounded-full bg-mist/60 p-0.5" role="group" aria-label={t.language}>
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            className={`min-h-9 min-w-9 rounded-full px-2 text-[11px] font-semibold touch-manipulation ${
              active ? "bg-white text-ink shadow-sm" : "text-ink/60"
            }`}
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={code === "en" ? "English" : code === "si" ? "සිංහල" : "தமிழ்"}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
