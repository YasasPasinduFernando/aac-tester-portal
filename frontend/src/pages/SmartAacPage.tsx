import ContactCard from "../components/ContactCard";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import {
  PORTFOLIO_MEDIA,
  SMART_AAC_BOUNDARIES,
  SMART_AAC_CLINICAL,
  SMART_AAC_GALLERY,
  SMART_AAC_JOURNEY,
  SMART_AAC_META,
  SMART_AAC_STACK,
} from "../content/smart-aac";
import { useT } from "../locale";

export default function SmartAacPage() {
  const t = useT();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-10 pt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">{t.caseStudy}</p>
        <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">Smart AAC</h1>
        <p className="mt-3 text-ink/75">
          Offline-first trilingual assistive communication for Sri Lanka, with on-device supportive
          facial expression recognition. Built as a final-year engineering system.
        </p>

        <div className="glass mt-6 overflow-hidden rounded-[1.5rem]">
          <img
            src="/images/smart-aac/ui-home.webp"
            alt="Smart AAC application interface"
            className="aspect-[16/9] w-full object-cover object-top"
          />
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <Meta label="Thesis" value={SMART_AAC_META.thesis} />
            <Meta label="Stack" value={SMART_AAC_META.stack} />
            <Meta label="Languages" value={SMART_AAC_META.languages} />
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">The journey</h2>
          <div className="mt-4 grid gap-3">
            {SMART_AAC_JOURNEY.map((step) => (
              <article key={step.title} className="glass rounded-[1.25rem] p-4">
                <h3 className="font-semibold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/75">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <article className="glass rounded-[1.25rem] p-5">
            <h2 className="text-xl font-semibold text-ink">Why it exists</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">
              Children with limited speech need a way to express everyday needs. In Sri Lanka that
              means Sinhala and Tamil as first-class languages, English where useful, offline use on
              ordinary phones, and a price families can actually afford.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">
              The technical contribution is integration: trilingual AAC plus cautious on-device
              facial expression recognition for observation support. It is not a novel emotion
              algorithm, and it is not a diagnostic system.
            </p>
          </article>
          <article className="rounded-[1.25rem] border border-amber-400/80 bg-amber-50 p-5">
            <h2 className="text-xl font-semibold text-ink">Trust boundaries</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink/80">
              {SMART_AAC_BOUNDARIES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">{SMART_AAC_CLINICAL.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">{SMART_AAC_CLINICAL.lead}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SMART_AAC_CLINICAL.points.map((point) => (
              <article key={point.title} className="glass rounded-[1.25rem] p-4">
                <h3 className="font-semibold text-ink">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{point.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="field-exposure" className="mt-10 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-ink">{t.fieldExposure}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">
            Understanding the context in which AAC support may be used. This visit was exploratory
            field exposure rather than a clinical trial or formal clinical validation study.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SMART_AAC_GALLERY.filter((item) => item.group === "Field exposure" || item.group === "Clinical")
              .slice(0, 4)
              .map((item) => (
                <figure key={item.src} className="glass overflow-hidden rounded-[1.25rem]">
                  <img src={item.src} alt={item.alt} className="aspect-[4/3] w-full object-cover" />
                  <figcaption className="px-3 py-2 text-xs text-ink/70">{item.caption}</figcaption>
                </figure>
              ))}
          </div>
          <video
            className="mt-4 w-full rounded-[1.25rem]"
            controls
            poster={PORTFOLIO_MEDIA.fieldPoster}
            src={PORTFOLIO_MEDIA.fieldVideo}
          >
            Privacy-redacted field-session recording. Faces are obscured; audio is omitted.
          </video>
          <p className="mt-2 text-xs text-ink/60">
            Field visit: Pragathi Child Intervention Centre. Video hosted from the public case study.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">Smart AAC in action</h2>
          <video
            className="mt-4 w-full rounded-[1.25rem]"
            controls
            poster={PORTFOLIO_MEDIA.introPoster}
            src={PORTFOLIO_MEDIA.introVideo}
          />
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">Technology stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {SMART_AAC_STACK.map((item) => (
              <span key={item} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <article className="glass rounded-[1.25rem] p-4">
              <h3 className="font-semibold text-ink">AI pipeline</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                On-device FER through TensorFlow Lite. EfficientNetB0 is primary; MobileNetV2 is the
                fallback. Gates include face detection, confidence checks, and explicit uncertain
                states.
              </p>
            </article>
            <article className="glass rounded-[1.25rem] p-4">
              <h3 className="font-semibold text-ink">Model honesty</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                Reported public-dataset test accuracy 52.9% (weighted F1 0.54). Useful only as a
                cautious supportive cue under caregiver supervision.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">{t.gallery}</h2>
          <p className="mt-2 text-sm text-ink/75">
            Figures, screenshots, clinical photos, and testing evidence. Nothing here was invented
            for the website.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SMART_AAC_GALLERY.map((item) => (
              <figure key={item.src} className="glass overflow-hidden rounded-[1.25rem]">
                <img src={item.src} alt={item.alt} className="aspect-[4/3] w-full object-cover object-top" />
                <figcaption className="px-3 py-2 text-xs text-ink/70">{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-ink">Downloads</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm font-semibold">
            <a className="text-clay" href={PORTFOLIO_MEDIA.thesis} target="_blank" rel="noopener noreferrer">
              Final thesis PDF
            </a>
            <a className="text-clay" href={PORTFOLIO_MEDIA.eicon} target="_blank" rel="noopener noreferrer">
              EICON camera-ready
            </a>
            <a className="text-clay" href={PORTFOLIO_MEDIA.github} target="_blank" rel="noopener noreferrer">
              Open GitHub
            </a>
          </div>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          <article className="glass rounded-[1.25rem] p-4">
            <h2 className="font-semibold text-ink">Lessons learned</h2>
            <ul className="mt-2 space-y-2 text-sm text-ink/75">
              <li>Mobile deployment constraints belong next to model accuracy from day one.</li>
              <li>Caregivers prefer simpler flows over multi-toggle sensory complexity.</li>
              <li>Uncertainty states are safer than forced emotion labels.</li>
              <li>Clinical pathways move on ethics timelines, not sprint boards.</li>
            </ul>
          </article>
          <article className="glass rounded-[1.25rem] p-4">
            <h2 className="font-semibold text-ink">Future work</h2>
            <ul className="mt-2 space-y-2 text-sm text-ink/75">
              <li>Ethical clearance and supervised pilot planning with clinical partners.</li>
              <li>Standardised usability work with therapists.</li>
              <li>Latency benchmarking on documented low/mid-range devices.</li>
              <li>Any Sri Lankan consented facial-expression data only under proper safeguarding.</li>
            </ul>
          </article>
        </section>

        <section className="glass mt-10 rounded-[1.25rem] p-5">
          <h2 className="font-semibold text-ink">Paper track</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">
            Trilingual Offline Smart AAC with On-Device Facial Expression Recognition for Autism in
            Sri Lanka. Venue: EICON 2026. Paper ID: FPC21. Full paper submitted; camera-ready
            manuscript prepared. Submission is not the same as acceptance.
          </p>
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
