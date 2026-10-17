"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { Maximize2, X } from "lucide-react";
import type { ProjectMedia } from "@/data/projectDetailsData";
import MediaFrame from "./MediaFrame";
import { Redactions } from "./PhoneMockup";
import styles from "./ProjectDetails.module.css";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type ZoomableMediaProps = {
  media: ProjectMedia;
  sizes: string;
};

/** A real screenshot in its frame that opens full size in a lightbox. */
export default function ZoomableMedia({ media, sizes }: ZoomableMediaProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lightbox: focus management, keyboard support, scroll lock and an entrance tween.
  useEffect(() => {
    if (!open) {
      return;
    }

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const dialog = dialogRef.current;
    if (dialog && !prefersReducedMotion()) {
      gsap.fromTo(dialog, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(
        dialog.querySelector("[data-lightbox-figure]"),
        { y: 24, scale: 0.97 },
        { y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
      );
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      } else if (event.key === "Tab") {
        // The close button is the only control, so focus stays on it.
        event.preventDefault();
        closeRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  const caption = media.label && media.caption ? `${media.label} — ${media.caption}` : (media.caption ?? media.alt);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.zoomTrigger}
        data-frame={media.frame}
        aria-label={`Open larger preview: ${media.alt}`}
        onClick={() => setOpen(true)}
      >
        <MediaFrame media={media} sizes={sizes} />
        <span className={styles.zoomHint} aria-hidden="true">
          <Maximize2 size={15} />
          Expand
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={dialogRef}
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`Preview: ${caption}`}
            onClick={() => setOpen(false)}
          >
            <figure
              className={styles.lightboxFigure}
              data-lightbox-figure
              onClick={(event) => event.stopPropagation()}
            >
              <span className={styles.lightboxMedia}>
                <Image
                  className={styles.lightboxImage}
                  src={media.src}
                  alt={media.alt}
                  width={media.width}
                  height={media.height}
                  sizes="100vw"
                  quality={88}
                />
                <Redactions regions={media.redact} />
              </span>
              <figcaption>{caption}</figcaption>
            </figure>

            <button
              ref={closeRef}
              type="button"
              className={`${styles.lightboxBtn} ${styles.lightboxClose}`}
              aria-label="Close preview"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
              }}
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
