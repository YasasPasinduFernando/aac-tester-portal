import Reveal from "./Reveal";

const FIELD_SHOTS = [
  {
    src: "/images/field/pragathi.webp",
    alt: "Pragathi Child Intervention Centre sign in Sinhala, English, and Tamil",
    title: "Pragathi",
    body: "Child Intervention Centre — a place AAC Sinhala is being shaped with real families.",
  },
  {
    src: "/images/field/field-exposure.webp",
    alt: "Field exposure session showing AAC Sinhala being tried on a phone",
    title: "Field exposure",
    body: "Trying the app with practitioners so the boards stay simple and useful.",
  },
] as const;

export default function FieldCards() {
  return (
    <section id="field" className="scroll-mt-28">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">In the field</p>
        <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">Pragathi and field visits.</h2>
      </Reveal>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {FIELD_SHOTS.map((shot, index) => (
          <Reveal key={shot.src} delayMs={index * 80}>
            <article className="glass overflow-hidden rounded-[1.75rem]">
              <img src={shot.src} alt={shot.alt} className="h-64 w-full object-cover object-center sm:h-72" />
              <div className="px-5 py-4">
                <h3 className="text-lg font-semibold text-ink">{shot.title}</h3>
                <p className="mt-1 text-sm text-ink/70">{shot.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
