import { FIELD_EXPOSURE_SHOTS } from "../content/smart-aac";
import { useT } from "../locale";

export default function FieldCards() {
  const t = useT();
  return (
    <section id="field" className="mt-10">
      <p className="text-center text-sm font-semibold text-ink/60">{t.fieldExposure}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {FIELD_EXPOSURE_SHOTS.map((shot) => (
          <figure key={shot.src} className="glass overflow-hidden rounded-[1.5rem]">
            <img src={shot.src} alt={shot.alt} className="aspect-[4/3] w-full object-cover object-center" />
            <figcaption className="px-4 py-3 text-sm font-semibold text-ink">
              {shot.title === "Pragathi" ? t.fieldPragathi : shot.title === "Field visit" ? t.fieldVisit : shot.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
