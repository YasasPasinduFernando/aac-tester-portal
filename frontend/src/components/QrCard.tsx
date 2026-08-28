import { useT } from "../locale";

export default function QrCard() {
  const t = useT();
  return (
    <section id="qr" className="mt-10">
      <p className="text-center text-sm font-semibold text-ink/60">{t.downloadTheQr}</p>
      <div className="glass mx-auto mt-3 max-w-sm rounded-[1.5rem] p-5 text-center">
        <img
          src="/qr/aac-portal.png"
          alt="QR code for https://aac.yasaboy.com/"
          width={220}
          height={220}
          className="mx-auto h-44 w-44 rounded-xl bg-white p-2"
        />
        <p className="mt-3 text-sm text-ink/75">{t.qrLead}</p>
        <a
          href="/qr/aac-portal.png"
          download="aac-yasaboy-qr.png"
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-clay px-5 text-sm font-semibold text-white no-underline"
        >
          {t.downloadTheQr}
        </a>
      </div>
    </section>
  );
}
