import JoinCard from "../components/JoinCard";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-lg px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:pt-10">
        <JoinCard />
      </main>
      <SiteFooter />
    </div>
  );
}
