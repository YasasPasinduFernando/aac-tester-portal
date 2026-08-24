const FIELD_SHOTS = [
  {
    src: "/images/field/pragathi.webp",
    alt: "Pragathi Child Intervention Centre sign in Sinhala, English, and Tamil",
    title: "Pragathi",
  },
  {
    src: "/images/field/field-exposure.webp",
    alt: "Field exposure session showing AAC Sinhala being tried on a phone",
    title: "Field visit",
  },
] as const;

export default function FieldCards() {
  return (
    <section id="field" className="mt-10">
      <p className="text-center text-sm font-semibold text-ink/60">Field visit</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {FIELD_SHOTS.map((shot) => (
          <figure key={shot.src} className="glass overflow-hidden rounded-[1.5rem]">
            <img src={shot.src} alt={shot.alt} className="aspect-[4/3] w-full object-cover object-center" />
            <figcaption className="px-4 py-3 text-sm font-semibold text-ink">{shot.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
