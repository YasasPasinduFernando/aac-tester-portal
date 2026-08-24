export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-sand">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <p className="display text-4xl text-foam">AAC Sinhala</p>
          <p className="sinhala mt-2 text-sand/80">සන්නිවේදන සහාය — a closed testing portal.</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Project</p>
          <ul className="mt-3 space-y-2 text-sand/85">
            <li>
              <a className="text-sand hover:text-white" href="/#about-aac">
                What is AAC?
              </a>
            </li>
            <li>
              <a className="text-sand hover:text-white" href="/feedback">
                Feedback
              </a>
            </li>
            <li>
              <a className="text-sand hover:text-white" href="/#join">
                Join the beta
              </a>
            </li>
          </ul>
        </div>
        <div className="text-sm leading-6 text-sand/80">
          <p>Package: lk.aac.sinhala_tamil_english</p>
          <p className="mt-2">
            This website stores tester email addresses to manage closed-test access. It never asks for Google
            passwords. It is not a medical device and does not provide a diagnosis.
          </p>
        </div>
      </div>
    </footer>
  );
}
