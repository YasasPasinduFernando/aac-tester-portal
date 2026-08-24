import JoinCard from "../components/JoinCard";
import Reveal from "../components/Reveal";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

const features = [
  {
    title: "Sinhala-first boards",
    body: "Everyday words and picture cards arranged for families who speak Sinhala at home and school.",
  },
  {
    title: "Clear, large targets",
    body: "Buttons and symbols are designed to be easy to see, easy to tap, and calm to scan.",
  },
  {
    title: "Shared family language",
    body: "The app family also includes English and Tamil vocabulary so caregivers can switch when needed.",
  },
  {
    title: "Built with classrooms in mind",
    body: "Teachers and therapists can try boards that resemble real routines: meals, play, feelings, and school.",
  },
];

const steps = [
  {
    step: "1",
    title: "Enter your Gmail",
    body: "Use the same Google account you use on Google Play and on the Android device that will install the app.",
  },
  {
    step: "2",
    title: "Join Tester Group",
    body: "A short guide opens first. Then open the group in a new tab, stay signed in with that Gmail, and tap Join group.",
  },
  {
    step: "3",
    title: "Check My Access",
    body: "Come back here and tap Check My Access. After you’re verified, join the Google Play test and install AAC-Sinhala.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main">
        <Hero />
        <div className="mx-auto max-w-6xl space-y-24 px-4 py-20">
          <WhatIsAac />
          <WhySinhala />
          <Features />
          <HowTestingWorks />
          <JoinCard />
          <FeedbackTeaser />
          <About />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden bg-ink text-sand">
      <div className="absolute inset-0" aria-hidden="true">
        <picture>
          <source srcSet="/images/hero-classroom.webp" type="image/webp" />
          <img
            src="/images/hero-classroom.jpg"
            alt=""
            className="blur-photo h-full w-full object-cover opacity-70"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/55 to-ink" />
        <div className="bg-grid absolute inset-0 opacity-60" />
      </div>
      <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-36">
        <p className="sinhala text-sm font-medium tracking-[0.18em] text-gold uppercase">
          සංවෘත පරීක්ෂණය
        </p>
        <h1 className="display mt-4 max-w-4xl text-6xl text-foam sm:text-8xl">AAC Sinhala</h1>
        <p className="mt-6 max-w-2xl text-xl text-sand sm:text-2xl">
          Communication support for children who need a voice.
        </p>
        <p className="mt-5 max-w-2xl text-base leading-7 text-sand/85 sm:text-lg">
          AAC Sinhala is an augmentative communication app being tested with families, teachers, and therapists.
          It is designed to help children with communication difficulties, including children with autism and
          other communication needs, share everyday words through pictures and language they already live with.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#join"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-clay px-6 font-semibold text-white no-underline hover:bg-clay-dark"
          >
            Join the Beta Test
          </a>
          <a
            href="#about-aac"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-sand/30 bg-white/10 px-6 font-semibold text-sand no-underline hover:bg-white/16"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

function WhatIsAac() {
  return (
    <Reveal>
      <section id="about-aac" className="scroll-mt-28 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">What is AAC?</p>
          <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">A way to communicate when speech is hard.</h2>
          <p className="mt-5 text-lg leading-8 text-ink/80">
            Augmentative and Alternative Communication (AAC) includes picture boards, symbols, and speech-generating
            apps. AAC does not replace a child. It gives them another way to ask, refuse, comment, and connect.
          </p>
          <p className="mt-4 text-lg leading-8 text-ink/80">
            AAC Sinhala focuses on that everyday need: a calm, readable board that can travel from home to classroom.
            It is a communication aid in testing, not a clinical diagnosis or treatment.
          </p>
        </div>
        <BlurPanel
          image="/images/section-communication.jpg"
          webp="/images/section-communication.webp"
          caption="Picture cards, speech bubbles, and Sinhala letterforms."
        />
      </section>
    </Reveal>
  );
}

function WhySinhala() {
  return (
    <Reveal>
      <section id="why" className="scroll-mt-28">
        <div className="glass-dark relative overflow-hidden rounded-[2rem] px-6 py-12 text-sand sm:px-12">
          <div className="absolute inset-0 opacity-30" aria-hidden="true">
            <picture>
              <source srcSet="/images/section-learning.webp" type="image/webp" />
              <img src="/images/section-learning.jpg" alt="" className="blur-photo h-full w-full object-cover" />
            </picture>
          </div>
          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Why AAC Sinhala?</p>
            <h2 className="display mt-3 text-4xl text-foam sm:text-5xl">Language should not be an extra barrier.</h2>
            <p className="mt-5 text-lg leading-8 text-sand/90">
              Many AAC tools start from English. Families in Sri Lanka often need Sinhala words, familiar objects, and
              school routines that match real life. AAC Sinhala is being built so children can point to the language
              they hear at home.
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-28">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Features</p>
        <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">Made for daily conversation.</h2>
      </Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {features.map((feature, index) => (
          <Reveal key={feature.title} delayMs={index * 80}>
            <article className="glass h-full rounded-3xl p-6">
              <h3 className="text-xl font-semibold text-ink">{feature.title}</h3>
              <p className="mt-3 text-ink/75">{feature.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function HowTestingWorks() {
  return (
    <section id="how" className="scroll-mt-28">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">How beta testing works</p>
        <h2 className="display mt-3 max-w-3xl text-4xl text-ink sm:text-5xl">
          A small, careful closed test on Google Play.
        </h2>
      </Reveal>
      <ol className="mt-10 grid gap-5 md:grid-cols-2">
        {steps.map((item, index) => (
          <Reveal key={item.step} delayMs={index * 70}>
            <li className="rounded-3xl border border-ink/10 bg-foam/80 p-6">
              <p className="display text-4xl text-clay">{item.step}</p>
              <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-ink/75">{item.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function FeedbackTeaser() {
  return (
    <Reveal>
      <section id="feedback" className="scroll-mt-28 rounded-[2rem] bg-teal px-6 py-12 text-sand sm:px-12">
        <h2 className="display text-4xl text-foam sm:text-5xl">Help us make it clearer.</h2>
        <p className="mt-4 max-w-2xl text-lg text-sand/90">
          Testers can report bugs, wording problems, missing symbols, and accessibility issues. Feedback stays
          private and is used to improve the app.
        </p>
        <a
          href="/feedback"
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-foam px-6 font-semibold text-teal-dark no-underline hover:bg-sand"
        >
          Open the feedback form
        </a>
      </section>
    </Reveal>
  );
}

function About() {
  return (
    <Reveal>
      <section id="about" className="scroll-mt-28 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">About the project</p>
        <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">A quiet tool for a loud need.</h2>
        <p className="mt-5 text-lg leading-8 text-ink/80">
          AAC Sinhala is an independent accessibility and education project. The closed test on Google Play is
          invite-based so we can learn from a small group of families and practitioners before a wider release.
        </p>
        <p className="mt-4 text-lg leading-8 text-ink/80">
          Android package: <code className="rounded bg-mist px-1.5 py-0.5">lk.aac.sinhala_tamil_english</code>
        </p>
      </section>
    </Reveal>
  );
}

function BlurPanel({
  image,
  webp,
  caption,
}: {
  image: string;
  webp: string;
  caption: string;
}) {
  return (
    <figure className="relative min-h-72 overflow-hidden rounded-[2rem]">
      <picture>
        <source srcSet={webp} type="image/webp" />
        <img src={image} alt="" className="blur-photo absolute inset-0 h-full w-full object-cover" />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-tr from-ink/50 via-transparent to-teal/20" />
      <figcaption className="absolute bottom-4 left-4 right-4 rounded-2xl bg-ink/70 px-4 py-3 text-sm text-sand">
        {caption}
      </figcaption>
    </figure>
  );
}
