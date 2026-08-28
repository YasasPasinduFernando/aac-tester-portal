import { useT } from "../locale";

export default function ContactCard() {
  const t = useT();
  return (
    <section id="contact" className="mt-10 scroll-mt-24">
      <p className="text-center text-sm font-semibold text-ink/60">{t.contact}</p>
      <div className="glass mx-auto mt-3 max-w-lg rounded-[1.5rem] p-5 text-sm text-ink">
        <p className="text-base font-semibold">{t.contactName}</p>
        <p className="mt-1 text-ink/70">{t.contactLocation}</p>
        <p className="mt-3">
          <a className="font-semibold text-clay" href="mailto:yasas@yasaboy.com">
            yasas@yasaboy.com
          </a>
        </p>
        <p className="mt-1">
          <a className="font-semibold text-clay" href="tel:+94776905654">
            +94 77 690 5654
          </a>
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
          <a
            className="text-clay"
            href="https://www.linkedin.com/in/yasas-pasindu-fernando"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="text-clay"
            href="https://github.com/YasasPasinduFernando"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="text-clay"
            href="https://portfolio.yasaboy.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            portfolio.yasaboy.com
          </a>
        </p>
      </div>
    </section>
  );
}
