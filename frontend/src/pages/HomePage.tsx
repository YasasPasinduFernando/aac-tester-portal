import { AppPhoneCluster } from "../components/AppScreenCards";
import FieldCards from "../components/FieldCards";
import JoinCard from "../components/JoinCard";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-lg px-4 pb-2 pt-6 sm:pt-10">
        <JoinCard />
      </main>
      <section className="mx-auto max-w-3xl px-4" aria-label="The app">
        <p className="text-center text-sm font-semibold text-ink/60">The app</p>
        <div className="mt-3">
          <AppPhoneCluster compact />
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <FieldCards />
      </div>
      <SiteFooter />
    </div>
  );
}
