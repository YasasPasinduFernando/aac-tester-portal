import { FIELD_EXPOSURE_SHOTS } from "../content/smart-aac";
import { useCaseStudy, useT } from "../locale";

export default function FieldCards() {
  const t = useT();
  const copy = useCaseStudy();
  return (
    <section id="field" className="mt-10">
      <p className="text-center text-sm font-semibold text-ink/60">{t.fieldExposure}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {FIELD_EXPOSURE_SHOTS.map((shot) => {
          const text = copy.fieldCards[shot.id];
          return (
            <figure key={shot.src} className="glass overflow-hidden rounded-[1.5rem]">
              <img src={shot.src} alt={text.alt} className="aspect-[4/3] w-full object-cover object-center" />
              <figcaption className="px-4 py-3 text-sm font-semibold text-ink">{text.title}</figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
