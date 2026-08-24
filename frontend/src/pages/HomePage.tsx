import JoinCard from "../components/JoinCard";
import Reveal from "../components/Reveal";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import AppScreenCards, { AppPhoneCluster } from "../components/AppScreenCards";
import FieldCards from "../components/FieldCards";
import { USER_MESSAGES } from "@shared/types";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main">
        <Hero />
        <div className="mx-auto max-w-6xl space-y-20 px-4 py-16">
          <JoinCard />
          <AppScreenCards />
          <FieldCards />
          <FeedbackTeaser />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-sand">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b3d6e] via-[#1565c0] to-[#1a8bb8]" aria-hidden="true" />
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:pb-16 lg:pt-24">
        <div>
          <p className="sinhala text-sm font-medium tracking-[0.18em] text-gold uppercase">සංවෘත පරීක්ෂණය</p>
          <h1 className="display mt-4 text-5xl text-foam sm:text-7xl">AAC Sinhala</h1>
          <p className="mt-4 max-w-xl text-lg text-sand/90 sm:text-xl">
            Picture cards that help children communicate. Join the closed Google Play test.
          </p>
          <p className="mt-5 max-w-xl rounded-2xl bg-white/12 px-4 py-3 text-sm font-semibold text-foam sm:text-base">
            {USER_MESSAGES.playStoreEveryone}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#join"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-clay px-6 font-semibold text-white no-underline hover:bg-clay-dark"
            >
              Join the beta
            </a>
            <a
              href="#app"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-sand/30 bg-white/10 px-6 font-semibold text-sand no-underline hover:bg-white/16"
            >
              See the app
            </a>
          </div>
          <div className="mt-8 lg:hidden">
            <AppPhoneCluster compact />
          </div>
        </div>
        <div className="hidden lg:block">
          <AppPhoneCluster />
        </div>
      </div>
    </section>
  );
}

function FeedbackTeaser() {
  return (
    <Reveal>
      <section id="feedback" className="scroll-mt-28 rounded-[2rem] bg-ink px-6 py-10 text-sand sm:px-10">
        <h2 className="display text-3xl text-foam sm:text-4xl">Found a problem?</h2>
        <p className="mt-3 max-w-xl text-sand/85">Send private feedback after you install. Use your Play Store Gmail.</p>
        <a
          href="/feedback"
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-foam px-6 font-semibold text-ink no-underline hover:bg-sand"
        >
          Open feedback
        </a>
      </section>
    </Reveal>
  );
}
