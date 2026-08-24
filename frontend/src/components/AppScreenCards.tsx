import PhoneFrame from "./PhoneFrame";

export const APP_SCREENS = [
  {
    src: "/images/app/home.webp",
    alt: "AAC Sinhala home screen with message composer and categories",
    title: "Home",
    body: "Choose a category, build a message, and speak it aloud.",
  },
  {
    src: "/images/app/cards.webp",
    alt: "AAC Sinhala picture cards for everyday words",
    title: "Picture cards",
    body: "Large, easy-to-tap cards for books, food, play, and more.",
  },
  {
    src: "/images/app/emotion.webp",
    alt: "AAC Sinhala emotion camera screen",
    title: "Emotion camera",
    body: "A calm camera view for supportive expression cues.",
  },
  {
    src: "/images/app/settings.webp",
    alt: "AAC Sinhala settings and category preferences",
    title: "Settings",
    body: "Language and category choices for home and school.",
  },
] as const;

export function AppPhoneCluster({ compact = false }: { compact?: boolean }) {
  const [left, center, right] = [APP_SCREENS[2], APP_SCREENS[0], APP_SCREENS[1]];
  return (
    <div
      className={`flex items-end justify-center gap-5 sm:gap-6 ${compact ? "py-2" : "py-4"}`}
      aria-label="AAC Sinhala app screens in iPhone frames"
    >
      <PhoneFrame src={left.src} alt={left.alt} size="sm" className="hidden -rotate-3 md:block" />
      <PhoneFrame src={center.src} alt={center.alt} size="lg" className="z-10" />
      <PhoneFrame src={right.src} alt={right.alt} size="sm" className="hidden rotate-3 md:block" />
    </div>
  );
}
