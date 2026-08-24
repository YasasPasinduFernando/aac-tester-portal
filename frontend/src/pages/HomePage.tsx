import JoinCard from "../components/JoinCard";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { AppPhoneCluster } from "../components/AppScreenCards";
import FieldCards from "../components/FieldCards";
import { useAuth } from "../auth";

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-8 pt-10">
        <JoinCard />
        {!user ? (
          <section id="app" className="mt-14" aria-label="App preview">
            <p className="text-center text-sm font-semibold text-ink/60">The app</p>
            <div className="mt-4">
              <AppPhoneCluster compact />
            </div>
          </section>
        ) : null}
        <FieldCards />
      </main>
      <SiteFooter />
    </div>
  );
}
