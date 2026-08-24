import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

interface GuideShotProps {
  src: string;
  alt: string;
  caption: string;
  hint?: string;
  dark?: boolean;
}

export default function GuideShot({ src, alt, caption, hint, dark = false }: GuideShotProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setOpen(false);
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  const lightbox = open
    ? createPortal(
        <div
          className="group-join-overlay fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[min(100dvh,52rem)] w-full max-w-4xl overflow-hidden rounded-[1.5rem] bg-ink shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p id={titleId} className="text-sm font-semibold text-sand">
                {caption}
              </p>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-lg text-sand hover:bg-white/10"
                onClick={() => setOpen(false)}
                aria-label="Close screenshot"
              >
                ×
              </button>
            </div>
            <div className="max-h-[min(calc(100dvh-5rem),46rem)] overflow-auto bg-white">
              <img src={src} alt={alt} className="h-auto w-full" />
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <figure className={`overflow-hidden rounded-2xl ${dark ? "bg-ink-soft" : "bg-mist/40"}`}>
        <button
          type="button"
          className="block w-full text-left"
          onClick={() => setOpen(true)}
          aria-label={`Enlarge screenshot: ${caption}`}
        >
          <img
            src={src}
            alt={alt}
            className="h-auto w-full max-h-64 bg-white object-contain object-top sm:max-h-80"
          />
        </button>
        <figcaption className={`px-4 py-3 ${dark ? "text-sand" : "text-ink"}`}>
          <p className="text-sm font-semibold">{caption}</p>
          {hint ? <p className={`mt-1 text-sm ${dark ? "text-sand/75" : "text-ink/70"}`}>{hint}</p> : null}
          <p className={`mt-1 text-xs ${dark ? "text-sand/55" : "text-ink/50"}`}>Tap the picture to enlarge</p>
        </figcaption>
      </figure>
      {lightbox}
    </>
  );
}
