import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { SMART_AAC_GALLERY } from "../content/smart-aac";
import { useCaseStudy, useT } from "../locale";

export default function GalleryPage() {
  const t = useT();
  const copy = useCaseStudy();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-10 pt-8">
        <h1 className="display text-4xl text-ink">{t.gallery}</h1>
        <p className="mt-3 text-ink/75">{copy.galleryPageLead}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {SMART_AAC_GALLERY.map((item) => (
            <figure key={item.src} className="glass overflow-hidden rounded-[1.5rem]">
              <img
                src={item.src}
                alt={copy.gallery[item.id].alt}
                className="aspect-[4/3] w-full object-cover object-top"
              />
              <figcaption className="px-4 py-3 text-sm text-ink/80">
                <span className="block text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {copy.groups[item.group]}
                </span>
                {copy.gallery[item.id].caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
