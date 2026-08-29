import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CASE_STUDY, type CaseStudyCopy } from "@shared/case-study-copy";
import { isLocale, UI_COPY, type Locale, type UiCopy } from "@shared/ui-copy";

const STORAGE_KEY = "aac-lang";

function detectLocale(): Locale {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const language of languages) {
    const code = language.toLowerCase();
    if (code.startsWith("si")) return "si";
    if (code.startsWith("ta")) return "ta";
  }
  return "en";
}

interface LocaleContextValue {
  locale: Locale;
  t: UiCopy;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return detectLocale();
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  useEffect(() => {
    const copy = UI_COPY[locale];
    document.documentElement.lang = locale;
    document.title = copy.siteTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", copy.siteDescription);
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      t: UI_COPY[locale],
      setLocale: setLocaleState,
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): UiCopy {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useT must be used within LocaleProvider");
  return value.t;
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}

export function useCaseStudy(): CaseStudyCopy {
  const { locale } = useLocale();
  return CASE_STUDY[locale];
}
