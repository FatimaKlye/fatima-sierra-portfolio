"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { ProjectMedia } from "@/data/projectDetailsData";
import MediaFrame from "./MediaFrame";
import { Redactions } from "./PhoneMockup";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type ProjectGalleryProps = {
  items: ProjectMedia[];
  number: string;
};

export default function ProjectGallery({ items, number }: ProjectGalleryProps) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousActive = useRef(active);

  const total = items.length;
  const current = items[active] ?? items[0];
  // Phone screenshots get a handset stage with a screen list instead of the browser thumbnails.
  const isDevice = total > 0 && items.every((item) => item.frame === "phone");

  const step = useCallback((delta: number) => setActive((index) => (index + delta + total) % total), [total]);

  // Crossfade the stage whenever the visitor picks another screen.
  useEffect(() => {
    if (previousActive.current === active) {
      return;
    }
    previousActive.current = active;

    const stage = stageRef.current;
    if (!stage || prefersReducedMotion()) {
      return;
    }

    const tween = gsap.fromTo(
      stage,
      { opacity: 0, y: 14, scale: 0.985 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", clearProps: "transform" }
    );
    return () => {
      tween.kill();
    };
  }, [active]);

  // Subtle 3D tilt that follows a fine pointer; skipped for touch and reduced motion.
  useEffect(() => {
    const element = tiltRef.current;
    const canTilt = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    ).matches;
    if (!element || !canTilt) {
      return;
    }

    gsap.set(element, { transformPerspective: 1100 });
    const rotateX = gsap.quickTo(element, "rotationX", { duration: 0.7, ease: "power3.out" });
    const rotateY = gsap.quickTo(element, "rotationY", { duration: 0.7, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 6);
      rotateX(-((event.clientY - rect.top) / rect.height - 0.5) * 6);
    };
    const onLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);

    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      gsap.set(element, { clearProps: "transform" });
    };
  }, []);

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
      } else if (event.key === "ArrowRight" && total > 1) {
        step(1);
      } else if (event.key === "ArrowLeft" && total > 1) {
        step(-1);
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled])"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open, step, total]);

  if (!current) {
    return null;
  }

  const stage = (
    <div className={`${styles.galleryStage} ${isDevice ? styles.deviceStage : ""}`}>
      {isDevice && <span className={styles.deviceHalo} aria-hidden="true" />}
      <div ref={stageRef} className={styles.galleryStageInner}>
        <div ref={tiltRef} className={styles.galleryTilt}>
          <button
            ref={triggerRef}
            type="button"
            className={styles.galleryOpen}
            style={{ width: `min(100%, ${isDevice ? 320 : current.frame === "plain" ? 440 : 1100}px)` }}
            aria-label={`Open larger preview: ${current.alt}`}
            onClick={() => setOpen(true)}
          >
            <MediaFrame
              media={current}
              sizes={isDevice ? "320px" : "(min-width: 1440px) 1100px, (min-width: 1024px) 78vw, 100vw"}
            />
            <span className={styles.galleryExpand} aria-hidden="true">
              <Maximize2 size={15} />
              Expand
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className={styles.gallery} aria-labelledby="gallery-title">
      <div className={styles.container}>
        <SectionHead
          id="gallery-title"
          number={number}
          eyebrow="Screens"
          title={isDevice ? "Inside the app" : "See it in action"}
          tone="onDark"
        />

        {isDevice ? (
          <div className={styles.deviceLayout}>
            {stage}
            <div className={styles.screenPanel}>
              <p className={styles.srOnly} aria-live="polite">
                Screen {active + 1} of {total}: {current.label ?? current.alt}
              </p>
              <ol className={styles.screenList} data-stagger>
                {items.map((item, itemIndex) => (
                  <li key={item.src}>
                    <button
                      type="button"
                      className={styles.screenItem}
                      aria-pressed={itemIndex === active}
                      onClick={() => setActive(itemIndex)}
                    >
                      <span className={styles.screenIndex}>{String(itemIndex + 1).padStart(2, "0")}</span>
                      <span className={styles.screenCopy}>
                        <span className={styles.screenLabel}>{item.label ?? `Screen ${itemIndex + 1}`}</span>
                        {item.caption && <span className={styles.screenCaption}>{item.caption}</span>}
                      </span>
                      <span className={styles.screenThumb} aria-hidden="true">
                        <Image src={item.src} alt="" width={item.width} height={item.height} sizes="48px" quality={60} />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className={styles.screenNav}>
                <button type="button" className={styles.screenNavBtn} aria-label="Previous screen" onClick={() => step(-1)}>
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <span className={styles.galleryCount} aria-hidden="true">
                  {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                <button type="button" className={styles.screenNavBtn} aria-label="Next screen" onClick={() => step(1)}>
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {stage}
            <div className={styles.galleryBar}>
              <p className={styles.galleryCaption} aria-live="polite">
                <span className={styles.galleryCount}>
                  {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                {current.caption ?? current.alt}
              </p>

              {total > 1 && (
                <ul className={styles.thumbs}>
                  {items.map((item, itemIndex) => (
                    <li key={item.src}>
                      <button
                        type="button"
                        className={styles.thumb}
                        aria-pressed={itemIndex === active}
                        aria-label={`Show screen ${itemIndex + 1} of ${total}: ${item.caption ?? item.alt}`}
                        onClick={() => setActive(itemIndex)}
                      >
                        <Image
                          src={item.src}
                          alt=""
                          width={item.width}
                          height={item.height}
                          sizes="120px"
                          quality={60}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {open &&
        createPortal(
          <div
            ref={dialogRef}
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`Preview: ${current.caption ?? current.alt}`}
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
                  src={current.src}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  sizes="100vw"
                  quality={88}
                />
                <Redactions regions={current.redact} />
              </span>
              <figcaption>
                {current.label && current.caption ? `${current.label} — ${current.caption}` : (current.caption ?? current.alt)}
              </figcaption>
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

            {total > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.lightboxBtn} ${styles.lightboxPrev}`}
                  aria-label="Previous screen"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(-1);
                  }}
                >
                  <ChevronLeft size={24} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${styles.lightboxBtn} ${styles.lightboxNext}`}
                  aria-label="Next screen"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(1);
                  }}
                >
                  <ChevronRight size={24} aria-hidden="true" />
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </section>
  );
}
