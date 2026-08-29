import ContactCard from "../components/ContactCard";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { PORTFOLIO_MEDIA, SMART_AAC_GALLERY, SMART_AAC_STACK } from "../content/smart-aac";
import { useCaseStudy, useT } from "../locale";

export default function SmartAacPage() {
  const t = useT();
  const copy = useCaseStudy();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-10 pt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">{t.caseStudy}</p>
        <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">Smart AAC</h1>
        <p className="mt-3 text-ink/75">{copy.lead}</p>

        <div className="glass mt-6 overflow-hidden rounded-[1.5rem]">
          <img
            src="/images/smart-aac/ui-home.webp"
            alt={copy.heroAlt}
            className="aspect-[16/9] w-full object-cover object-top"
          />
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <Meta label={copy.metaThesis} value={copy.thesisValue} />
            <Meta label={copy.metaStack} value={copy.stackValue} />
            <Meta label={copy.metaLanguages} value={copy.languagesValue} />
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">{copy.journeyTitle}</h2>
          <div className="mt-4 grid gap-3">
            {copy.journey.map((step) => (
              <article key={step.id} className="glass rounded-[1.25rem] p-4">
                <h3 className="font-semibold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/75">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <article className="glass rounded-[1.25rem] p-5">
            <h2 className="text-xl font-semibold text-ink">{copy.whyTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">{copy.whyP1}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">{copy.whyP2}</p>
          </article>
          <article className="rounded-[1.25rem] border border-amber-400/80 bg-amber-50 p-5">
            <h2 className="text-xl font-semibold text-ink">{copy.trustTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink/80">
              {copy.boundaries.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">{copy.clinicalTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">{copy.clinicalLead}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {copy.clinical.map((point) => (
              <article key={point.id} className="glass rounded-[1.25rem] p-4">
                <h3 className="font-semibold text-ink">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{point.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="field-exposure" className="mt-10 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-ink">{t.fieldExposure}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">{copy.fieldLead}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SMART_AAC_GALLERY.filter((item) => item.group === "field" || item.group === "clinical")
              .slice(0, 4)
              .map((item) => (
                <figure key={item.src} className="glass overflow-hidden rounded-[1.25rem]">
                  <img
                    src={item.src}
                    alt={copy.gallery[item.id].alt}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="px-3 py-2 text-xs text-ink/70">
                    {copy.gallery[item.id].caption}
                  </figcaption>
                </figure>
              ))}
          </div>
          <video
            className="mt-4 w-full rounded-[1.25rem]"
            controls
            poster={PORTFOLIO_MEDIA.fieldPoster}
            src={PORTFOLIO_MEDIA.fieldVideo}
          >
            {copy.fieldVideoFallback}
          </video>
          <p className="mt-2 text-xs text-ink/60">{copy.fieldVideoNote}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">{copy.inActionTitle}</h2>
          <video
            className="mt-4 w-full rounded-[1.25rem]"
            controls
            poster={PORTFOLIO_MEDIA.introPoster}
            src={PORTFOLIO_MEDIA.introVideo}
          />
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">{copy.stackTitle}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {SMART_AAC_STACK.map((item) => (
              <span key={item} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <article className="glass rounded-[1.25rem] p-4">
              <h3 className="font-semibold text-ink">{copy.aiPipelineTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{copy.aiPipelineBody}</p>
            </article>
            <article className="glass rounded-[1.25rem] p-4">
              <h3 className="font-semibold text-ink">{copy.modelHonestyTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{copy.modelHonestyBody}</p>
            </article>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">{t.gallery}</h2>
          <p className="mt-2 text-sm text-ink/75">{copy.galleryLead}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SMART_AAC_GALLERY.map((item) => (
              <figure key={item.src} className="glass overflow-hidden rounded-[1.25rem]">
                <img
                  src={item.src}
                  alt={copy.gallery[item.id].alt}
                  className="aspect-[4/3] w-full object-cover object-top"
                />
                <figcaption className="px-3 py-2 text-xs text-ink/70">
                  {copy.gallery[item.id].caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">{copy.downloadsTitle}</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm font-semibold">
            <a className="text-clay" href={PORTFOLIO_MEDIA.thesis} target="_blank" rel="noopener noreferrer">
              {copy.thesisPdf}
            </a>
            <a className="text-clay" href={PORTFOLIO_MEDIA.eicon} target="_blank" rel="noopener noreferrer">
              {copy.eiconPdf}
            </a>
            <a className="text-clay" href={PORTFOLIO_MEDIA.github} target="_blank" rel="noopener noreferrer">
              {copy.openGithub}
            </a>
          </div>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          <article className="glass rounded-[1.25rem] p-4">
            <h2 className="font-semibold text-ink">{copy.lessonsTitle}</h2>
            <ul className="mt-2 space-y-2 text-sm text-ink/75">
              {copy.lessons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="glass rounded-[1.25rem] p-4">
            <h2 className="font-semibold text-ink">{copy.futureTitle}</h2>
            <ul className="mt-2 space-y-2 text-sm text-ink/75">
              {copy.future.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="glass mt-10 rounded-[1.25rem] p-5">
          <h2 className="font-semibold text-ink">{copy.paperTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">{copy.paperBody}</p>
        </section>

        <ContactCard />
      </main>
      <SiteFooter />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-ink/55">{label}</p>
      <p className="mt-1 text-sm font-medium leading-snug text-ink">{value}</p>
    </div>
  );
}
