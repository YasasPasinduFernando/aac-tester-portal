import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

interface PhoneFrameProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  enlarge?: boolean;
}

export default function PhoneFrame({
  src,
  alt,
  size = "md",
  className = "",
  enlarge = true,
}: PhoneFrameProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const width =
    size === "sm" ? "w-[7.5rem] sm:w-[9rem]" : size === "lg" ? "w-[11.5rem] sm:w-[14rem]" : "w-[9.5rem] sm:w-[11.5rem]";

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

  const frame = (
    <div className={`iphone ${width} ${className}`.trim()}>
      <span className="iphone-side iphone-side-left" aria-hidden="true" />
      <span className="iphone-side iphone-side-right" aria-hidden="true" />
      <div className="iphone-bezel">
        <span className="iphone-island" aria-hidden="true" />
        <div className="iphone-screen">
          <img src={src} alt={alt} className="h-full w-full object-cover object-top" />
        </div>
        <span className="iphone-home" aria-hidden="true" />
      </div>
    </div>
  );

  const lightbox = open
    ? createPortal(
        <div
          className="group-join-overlay fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[min(100dvh,52rem)] items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <p id={titleId} className="sr-only">
              {alt}
            </p>
            <PhoneFrame src={src} alt={alt} size="lg" enlarge={false} className="!w-[min(18rem,72vw)]" />
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-lg text-sand hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label="Close app screenshot"
            >
              ×
            </button>
          </div>
        </div>,
        document.body,
      )
    : null;

  if (!enlarge) return frame;

  return (
    <>
      <button
        type="button"
        className="block self-end rounded-[2rem] text-left"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge app screenshot: ${alt}`}
      >
        {frame}
      </button>
      {lightbox}
    </>
  );
}
