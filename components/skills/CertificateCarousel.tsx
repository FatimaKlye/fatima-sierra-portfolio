"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import CertificateModal from "@/components/home/CertificateModal";
import type { CertificateRecord } from "@/components/about/aboutData";
import styles from "./CertificateCarousel.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/** Pixels the mouse must travel before a press becomes a drag (keeps clicks working). */
const DRAG_THRESHOLD = 6;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const nearestIndex = (offsets: number[], position: number) =>
  offsets.reduce(
    (best, offset, index) => (Math.abs(offset - position) < Math.abs(offsets[best] - position) ? index : best),
    0,
  );

/**
 * Horizontal certificate rail. Native scroll-snap handles trackpad and touch;
 * mouse dragging, arrows and the keyboard are layered on top. Two certificates
 * fill the view on desktop, fewer on smaller screens (see the CSS).
 */
export default function CertificateCarousel({ certificates }: { certificates: CertificateRecord[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const thumbX = useRef<((value: number) => void) | null>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0, suppressClick: false });

  const [activeCertificate, setActiveCertificate] = useState<CertificateRecord | null>(null);
  const [range, setRange] = useState({ first: 0, last: 0 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const total = certificates.length;

  /** Scroll offsets at which each slide sits flush with the start of the track. */
  const slideOffsets = useCallback(() => {
    const track = trackRef.current;
    if (!track) return [];
    const slides = Array.from(track.children) as HTMLElement[];
    const origin = slides[0]?.offsetLeft ?? 0;
    const max = track.scrollWidth - track.clientWidth;
    return slides.map((slide) => Math.min(slide.offsetLeft - origin, max));
  }, []);

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const max = track.scrollWidth - track.clientWidth;
    const left = track.scrollLeft;
    const progress = max > 0 ? left / max : 0;
    const visible = track.scrollWidth > 0 ? Math.min(track.clientWidth / track.scrollWidth, 1) : 1;

    if (thumbRef.current) {
      thumbRef.current.style.width = `${visible * 100}%`;
      thumbX.current?.(visible < 1 ? (progress * (1 - visible) * 100) / visible : 0);
    }

    // First and last fully visible slides, for the "01–02 / 16" counter.
    const slides = Array.from(track.children) as HTMLElement[];
    const origin = slides[0]?.offsetLeft ?? 0;
    const viewStart = left - 2;
    const viewEnd = left + track.clientWidth + 2;
    let first = -1;
    let last = -1;
    slides.forEach((slide, index) => {
      const start = slide.offsetLeft - origin;
      if (start >= viewStart && start + slide.offsetWidth <= viewEnd) {
        if (first === -1) first = index;
        last = index;
      }
    });
    if (first === -1) {
      // A slide wider than the view (very narrow screens): use the nearest one.
      first = last = nearestIndex(slideOffsets(), left);
    }

    setRange((current) => (current.first === first && current.last === last ? current : { first, last }));
    setAtStart(left <= 2);
    setAtEnd(left >= max - 2);
  }, [slideOffsets]);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    thumbX.current = gsap.quickTo(thumb, "xPercent", {
      duration: prefersReducedMotion() ? 0 : 0.6,
      ease: "power3.out",
    });

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    track.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(track);

    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", schedule);
      observer.disconnect();
      thumbX.current = null;
    };
  }, [update]);

  const scrollToIndex = useCallback(
    (index: number, onDone?: () => void) => {
      const track = trackRef.current;
      if (!track) return;
      const offsets = slideOffsets();
      const target = offsets[Math.max(0, Math.min(index, offsets.length - 1))] ?? 0;

      if (onDone) {
        let finished = false;
        const done = () => {
          if (finished) return;
          finished = true;
          track.removeEventListener("scrollend", done);
          onDone();
        };
        track.addEventListener("scrollend", done);
        // Fallback for browsers without `scrollend`, or when no scroll was needed.
        window.setTimeout(done, 900);
      }

      track.scrollTo({ left: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    },
    [slideOffsets],
  );

  /** Move one "page" — as many certificates as are currently fully visible. */
  const go = useCallback(
    (direction: 1 | -1) => {
      const perView = Math.max(1, range.last - range.first + 1);
      const next = Math.max(0, Math.min(range.first + direction * perView, total - 1));
      scrollToIndex(next);
    },
    [range, scrollToIndex, total],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  // Mouse drag. Touch and trackpads already scroll natively, so only mice are handled here.
  const handlePointerDown = (event: PointerEvent<HTMLUListElement>) => {
    const track = trackRef.current;
    if (!track || event.pointerType !== "mouse" || event.button !== 0) return;
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startLeft: track.scrollLeft,
      suppressClick: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const track = trackRef.current;
    const state = drag.current;
    if (!track || !state.active) return;

    const dx = event.clientX - state.startX;
    if (!state.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      state.moved = true;
      // Capture only once it is a real drag, so plain clicks still reach the slide buttons.
      track.setPointerCapture(event.pointerId);
      track.dataset.dragging = "true";
    }
    track.scrollLeft = state.startLeft - dx;
  };

  const endDrag = (event: PointerEvent<HTMLUListElement>) => {
    const track = trackRef.current;
    const state = drag.current;
    if (!track || !state.active) return;
    state.active = false;
    if (!state.moved) return;

    state.suppressClick = true;
    window.setTimeout(() => {
      drag.current.suppressClick = false;
    }, 0);
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);

    // Settle on the nearest slide; a deliberate flick always advances at least one.
    const dx = event.clientX - state.startX;
    const offsets = slideOffsets();
    const startIndex = nearestIndex(offsets, state.startLeft);
    let target = nearestIndex(offsets, track.scrollLeft);
    if (target === startIndex && Math.abs(dx) > 40) target = startIndex + (dx < 0 ? 1 : -1);

    // Snap stays off until the glide finishes, otherwise it fights the smooth scroll.
    scrollToIndex(target, () => {
      delete track.dataset.dragging;
    });
  };

  const handleClickCapture = (event: MouseEvent<HTMLUListElement>) => {
    if (drag.current.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const counter =
    range.last > range.first ? `${pad(range.first + 1)}–${pad(range.last + 1)}` : pad(range.first + 1);

  return (
    <div className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="Certificates">
      <ul
        ref={trackRef}
        className={styles.track}
        tabIndex={0}
        aria-label="Certificates, use the arrow keys to browse"
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
        data-stagger
      >
        {certificates.map((record, index) => {
          const imageSrc = record.fileType === "image" ? record.fileUrl : record.previewImage;

          return (
            <li
              key={record.id}
              className={styles.slide}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${total}`}
            >
              <button
                type="button"
                className={styles.frame}
                onClick={() => setActiveCertificate(record)}
                aria-label={`Preview certificate: ${record.title}`}
              >
                <span className={styles.imageWrap}>
                  {imageSrc && (
                    <Image
                      className={styles.image}
                      src={imageSrc}
                      alt={record.previewAlt}
                      fill
                      sizes="(max-width: 640px) 86vw, (max-width: 1024px) 64vw, 620px"
                      draggable={false}
                    />
                  )}
                </span>
                <span className={styles.hint} aria-hidden="true">
                  <Maximize2 size={13} strokeWidth={2} />
                  Preview
                </span>
              </button>

              <div className={styles.meta}>
                <span className={styles.index} aria-hidden="true">{pad(index + 1)}</span>
                <div className={styles.metaText}>
                  <p className={styles.type}>{record.type}</p>
                  <h3 className={styles.title}>{record.title}</h3>
                  <p className={styles.issuer}>{record.issuer}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.controls}>
        <div className={styles.progress} aria-hidden="true">
          <span ref={thumbRef} className={styles.thumb} />
        </div>
        <p className={styles.counter} aria-hidden="true">
          <span>{counter}</span> / {pad(total)}
        </p>
        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => go(-1)}
            disabled={atStart}
            aria-label="Previous certificates"
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => go(1)}
            disabled={atEnd}
            aria-label="Next certificates"
          >
            <ArrowRight size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <CertificateModal certificate={activeCertificate} onClose={() => setActiveCertificate(null)} />
    </div>
  );
}
