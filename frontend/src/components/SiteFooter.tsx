export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-ink text-sand">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="display text-3xl text-foam">AAC Sinhala</p>
          <p className="sinhala mt-2 text-sm text-sand/80">සන්නිවේදන සහාය</p>
        </div>
        <ul className="space-y-2 text-sand/85">
          <li>
            <a className="text-sand hover:text-white" href="/#join">
              Join the beta
            </a>
          </li>
          <li>
            <a className="text-sand hover:text-white" href="/feedback">
              Feedback
            </a>
          </li>
        </ul>
        <p className="text-sm leading-6 text-sand/80">
          Use your Play Store Gmail. This site never asks for Google passwords.
        </p>
      </div>
    </footer>
  );
}
