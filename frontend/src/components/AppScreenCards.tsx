import type { UiCopy } from "@shared/ui-copy";
import { useT } from "../locale";
import PhoneFrame from "./PhoneFrame";

const SCREEN_SRC = {
  home: "/images/app/home.webp",
  cards: "/images/app/cards.webp",
  emotion: "/images/app/emotion.webp",
  settings: "/images/app/settings.webp",
} as const;

function appScreens(t: UiCopy) {
  return [
    { src: SCREEN_SRC.home, alt: t.appHomeAlt, title: t.appHomeTitle, body: t.appHomeBody },
    { src: SCREEN_SRC.cards, alt: t.appCardsAlt, title: t.appCardsTitle, body: t.appCardsBody },
    { src: SCREEN_SRC.emotion, alt: t.appEmotionAlt, title: t.appEmotionTitle, body: t.appEmotionBody },
    { src: SCREEN_SRC.settings, alt: t.appSettingsAlt, title: t.appSettingsTitle, body: t.appSettingsBody },
  ];
}

export function AppPhoneCluster({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const screens = appScreens(t);
  const [left, center, right] = [screens[2], screens[0], screens[1]];
  return (
    <div
      className={`relative flex items-end justify-center pb-8 ${compact ? "min-h-[14.5rem] sm:min-h-[16rem]" : "min-h-[18rem] sm:min-h-[26rem]"}`}
      aria-label={t.appScreensAria}
    >
      <PhoneFrame src={left.src} alt={left.alt} size="sm" className="translate-y-4 -rotate-6 opacity-90 sm:translate-y-6" />
      <PhoneFrame
        src={center.src}
        alt={center.alt}
        size="lg"
        className="z-10 -mx-3 -translate-y-1 sm:-mx-6 sm:-translate-y-2"
      />
      <PhoneFrame src={right.src} alt={right.alt} size="sm" className="translate-y-4 rotate-6 opacity-90 sm:translate-y-6" />
    </div>
  );
}
