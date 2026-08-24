import PhoneFrame from "./PhoneFrame";
import Reveal from "./Reveal";

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
      className={`relative flex items-end justify-center ${compact ? "min-h-[16rem]" : "min-h-[22rem] sm:min-h-[26rem]"}`}
      aria-label="AAC Sinhala app screens in iPhone frames"
    >
      <PhoneFrame
        src={left.src}
        alt={left.alt}
        size="sm"
        className="translate-y-6 -rotate-6 opacity-90"
      />
      <PhoneFrame
        src={center.src}
        alt={center.alt}
        size="lg"
        className="z-10 -mx-4 -translate-y-2 sm:-mx-6"
      />
      <PhoneFrame
        src={right.src}
        alt={right.alt}
        size="sm"
        className="translate-y-6 rotate-6 opacity-90"
      />
    </div>
  );
}

export default function AppScreenCards() {
  return (
    <section id="app" className="scroll-mt-28">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Inside the app</p>
        <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">AAC Sinhala on a phone.</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink/75">
          Real screens from the app, shown in iPhone-style frames so testers can see the boards, cards, and
          settings before they install.
        </p>
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {APP_SCREENS.map((screen, index) => (
          <Reveal key={screen.src} delayMs={index * 80}>
            <article className="glass flex h-full flex-col items-center rounded-[1.75rem] p-5">
              <PhoneFrame src={screen.src} alt={screen.alt} size="md" />
              <h3 className="mt-5 text-center text-lg font-semibold text-ink">{screen.title}</h3>
              <p className="mt-2 text-center text-sm text-ink/70">{screen.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
