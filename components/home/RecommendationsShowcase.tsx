"use client";

import {
  Fragment,
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
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2, X } from "lucide-react";
import RecommendationForm from "./RecommendationForm";
import styles from "./Recommendations.module.css";

/** One published testimonial, as the browser receives it (see Recommendations.tsx). */
export type Testimonial = {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Project, team or organisation, shown as "IGNIS SAFE | SIQUILE DYNAMICS". */
  affiliation: string[];
  /** The full quotation, one string per paragraph. */
  paragraphs: string[];
  /** Opening whole sentences of a long quote; the full text opens in a dialog. */
  excerpt?: string[];
  /** Phrases that appear verbatim in the quote, subtly emphasised. */
  highlights: string[];
  /** Set when the quote is an English translation, e.g. "Filipino and English". */
  translatedFrom?: string;
  photo?: { src: string; alt: string };
  linkedin?: string;
};

type Part = { text: string; accent: boolean };

/** Splits the quote into plain runs and the phrases to emphasise. */
function emphasize(text: string, phrases: string[]): Part[] {
  const ranges = phrases
    .map((phrase) => [text.indexOf(phrase), text.indexOf(phrase) + phrase.length] as const)
    .filter(([start]) => start >= 0)
    .sort((a, b) => a[0] - b[0]);
  const parts: Part[] = [];
  let at = 0;
  for (const [start, end] of ranges) {
    if (start < at) continue; // overlaps the previous phrase
    if (start > at) parts.push({ text: text.slice(at, start), accent: false });
    parts.push({ text: text.slice(start, end), accent: true });
    at = end;
  }
  if (at < text.length) parts.push({ text: text.slice(at), accent: false });
  return parts;
}

function Paragraphs({ paragraphs, highlights }: { paragraphs: string[]; highlights: string[] }) {
  return paragraphs.map((paragraph, p) => (
    <p data-rec-quote key={p}>
      {emphasize(paragraph, highlights).map((part, i) =>
        part.accent ? (
          <mark className={styles.highlight} key={i}>
            {part.text}
          </mark>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        )
      )}
    </p>
  ));
}

/** Decorative opening quote mark. */
function QuoteMark({ className }: { className: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 120 96" focusable="false">
        <path d="M6 90V56C6 26 20 8 48 2l4 12C36 20 28 32 28 48h20v42Z" />
        <path d="M68 90V56C68 26 82 8 110 2l4 12C98 20 90 32 90 48h20v42Z" />
      </svg>
    </span>
  );
}

/** Approved headshot if there is one, otherwise a monogram. */
function Avatar({ testimonial }: { testimonial: Testimonial }) {
  if (testimonial.photo) {
    return (
      <span className={styles.avatar}>
        <Image src={testimonial.photo.src} alt={testimonial.photo.alt} fill sizes="48px" />
      </span>
    );
  }
  return (
    <span className={styles.avatar} aria-hidden="true">
      {testimonial.initials}
    </span>
  );
}

/** Name, role and project; shared by the carousel cards and the full-text dialog. */
function Credit({ testimonial, focusable = true }: { testimonial: Testimonial; focusable?: boolean }) {
  return (
    <figcaption className={styles.author}>
      <span className={styles.person}>
        <Avatar testimonial={testimonial} />
        <span className={styles.details}>
          <strong className={styles.name}>{testimonial.name}</strong>
          <span className={styles.role}>{testimonial.role}</span>
          {testimonial.affiliation.length > 0 && (
            <span className={styles.affiliation}>
              {testimonial.affiliation.map((part, i) => (
                <Fragment key={part}>
                  {i > 0 && (
                    <>
                      <span className={styles.srOnly}>, </span>
                      <span className={styles.divider} aria-hidden="true" />
                    </>
                  )}
                  {part}
                </Fragment>
              ))}
            </span>
          )}
        </span>
      </span>
      {(testimonial.translatedFrom || testimonial.linkedin) && (
        <span className={styles.meta}>
          {testimonial.translatedFrom && <span className={styles.note}>Translated from {testimonial.translatedFrom}</span>}
          {testimonial.linkedin && (
            <a
              className={styles.linkedin}
              href={testimonial.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={focusable ? undefined : -1}
            >
              LinkedIn <ArrowUpRight size={14} aria-hidden="true" />
              <span className={styles.srOnly}> profile of {testimonial.name} (opens in a new tab)</span>
            </a>
          )}
        </span>
      )}
    </figcaption>
  );
}

/** "Worked with me?" — a pill whose fill grows out of the arrow and leans toward the pointer. */
function ShareButton({ onClick }: { onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = ref.current;
    if (!button) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
      const x = gsap.quickTo(button, "x", { duration: 0.6, ease: "power3.out" });
      const y = gsap.quickTo(button, "y", { duration: 0.6, ease: "power3.out" });
      const move = (event: globalThis.PointerEvent) => {
        const box = button.getBoundingClientRect();
        x((event.clientX - box.left - box.width / 2) * 0.16);
        y((event.clientY - box.top - box.height / 2) * 0.32);
      };
      const leave = () => {
        x(0);
        y(0);
      };
      button.addEventListener("pointermove", move);
      button.addEventListener("pointerleave", leave);
      return () => {
        button.removeEventListener("pointermove", move);
        button.removeEventListener("pointerleave", leave);
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <button ref={ref} type="button" className={styles.share} onClick={onClick} aria-haspopup="dialog">
      <span className={styles.shareFill} aria-hidden="true" />
      <span className={styles.shareLabel}>
        Worked with me? <strong>Share a few words</strong>
      </span>
      <span className={styles.shareIcon} aria-hidden="true">
        <ArrowUpRight size={18} strokeWidth={2.2} />
      </span>
    </button>
  );
}

/**
 * "Read full recommendation": a native modal dialog (focus trap, Escape and an
 * inert page come with showModal). Clicking the backdrop closes it too.
 */
function FullQuoteDialog({ testimonial, onClose }: { testimonial: Testimonial | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !testimonial) return;
    dialog.showModal();
    // React's autoFocus fires before the dialog opens, so move focus here instead.
    closeRef.current?.focus({ preventScroll: true });
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        dialog.querySelector("[data-rec-panel]"),
        { y: 32, scale: 0.97, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.65, ease: "expo.out", clearProps: "transform,opacity" }
      );
      gsap.fromTo(
        dialog.querySelectorAll("[data-rec-quote], figcaption"),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.07, delay: 0.12, clearProps: "transform,opacity" }
      );
    });

    return () => {
      mm.revert();
      root.style.overflow = previous;
      if (dialog.open) dialog.close();
    };
  }, [testimonial]);

  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="rec-dialog-title"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={onBackdrop}
    >
      {testimonial && (
        <div className={styles.panel} data-rec-panel>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close recommendation">
            <X size={18} aria-hidden="true" />
          </button>
          <p className={styles.eyebrow} id="rec-dialog-title">
            Recommendation from {testimonial.name}
          </p>
          <figure className={styles.panelFigure}>
            <QuoteMark className={styles.panelMark} />
            <blockquote className={styles.panelQuote}>
              <Paragraphs paragraphs={testimonial.paragraphs} highlights={testimonial.highlights} />
            </blockquote>
            <Credit testimonial={testimonial} />
          </figure>
        </div>
      )}
    </dialog>
  );
}

const pad = (value: number) => String(value).padStart(2, "0");
const allowsMotion = () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

/** How far (px) a pointer must travel sideways before it counts as a drag. */
const DRAG_START = 8;

/**
 * "Kind words": an editorial carousel. The active recommendation sits centred
 * at full emphasis; its neighbours rest beside it, smaller and quieter, and
 * clicking one brings it forward. Arrows, the indicators, arrow keys, swipes
 * and mouse drags all move between them; nothing autoplays.
 *
 * The track's position is the CSS variable --rec-index (plus --rec-drag while
 * dragging), so the server-rendered page is already laid out correctly; GSAP
 * only tweens those two numbers. With one testimonial there are no controls,
 * and with none only the heading and the share invite render.
 */
export default function RecommendationsShowcase({ number, testimonials }: { number: string; testimonials: Testimonial[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const [index, setIndex] = useState(0);
  const [reading, setReading] = useState<Testimonial | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const revealed = useRef(false);
  const drag = useRef<{ id: number; x: number; y: number; dx: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);

  const total = testimonials.length;
  const current = testimonials[index];
  const hasControls = total > 1;

  /** Slides the track to `to` (clamped), easing out of any drag offset. */
  const settle = useCallback(
    (to: number) => {
      const track = trackRef.current;
      const next = Math.max(0, Math.min(total - 1, to));
      setIndex(next);
      if (!track) return;
      const vars = { "--rec-index": next, "--rec-drag": "0px" };
      if (allowsMotion()) gsap.to(track, { ...vars, duration: 0.95, ease: "expo.out", overwrite: true });
      else gsap.set(track, vars);
    },
    [total]
  );

  /** Previous / next wrap around, so both arrows always respond. */
  const step = useCallback((dir: 1 | -1) => settle((index + dir + total) % total), [index, total, settle]);

  // Heading, cards and invite: one entrance as the section scrolls in.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 78%", once: true } })
        .fromTo(
          q("[data-rec-fade]"),
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.1, clearProps: "transform,opacity,visibility" }
        )
        .fromTo(
          q("[data-rec-card]"),
          { y: 48, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", stagger: 0.12, clearProps: "transform,opacity,visibility" },
          0.15
        )
        .fromTo(
          q("[data-rec-controls]"),
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", clearProps: "transform,opacity,visibility" },
          0.55
        );

      const invite = q("[data-rec-invite]")[0];
      gsap.fromTo(
        invite,
        { y: 16, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: invite, start: "top 92%", once: true },
        }
      );
    });

    return () => mm.revert();
  }, []);

  // The active quotation rises line by line: on scroll the first time, then
  // each time another testimonial is brought forward. One-shot, never looping.
  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[index];
    if (!card) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);
    const first = !revealed.current;
    revealed.current = true;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const split = SplitText.create(card.querySelectorAll("[data-rec-quote]"), { type: "lines", mask: "lines" });
      gsap
        .timeline({
          scrollTrigger: first ? { trigger: card, start: "top 80%", once: true } : undefined,
          onComplete: () => split.revert(),
        })
        .from(split.lines, { yPercent: 105, duration: 1, ease: "power4.out", stagger: 0.06 }, first ? 0.45 : 0.12)
        .fromTo(
          card.querySelectorAll("mark"),
          { backgroundSize: "0% 100%" },
          { backgroundSize: "100% 100%", duration: 0.8, ease: "power2.inOut", stagger: 0.15 },
          first ? 1 : 0.5
        );
      return () => split.revert();
    });

    return () => mm.revert();
  }, [index]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: total - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") step(event.key === "ArrowRight" ? 1 : -1);
    else settle(keys[event.key]);
  };

  // Drag / swipe. Vertical movement is left to page scrolling (touch-action: pan-y);
  // a sideways one follows the pointer, with resistance past either end.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!hasControls || (event.pointerType === "mouse" && event.button !== 0)) return;
    if ((event.target as HTMLElement).closest("button, a")) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, active: false };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const track = trackRef.current;
    if (!state || state.id !== event.pointerId || !track) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (!state.active) {
      if (Math.abs(dx) < DRAG_START || Math.abs(dx) < Math.abs(dy)) return;
      state.active = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // The pointer already ended; the drag still settles on pointerup.
      }
      window.getSelection()?.removeAllRanges();
      gsap.killTweensOf(track);
      setDragging(true);
    }
    const pastEnd = (index === 0 && dx > 0) || (index === total - 1 && dx < 0);
    state.dx = dx;
    gsap.set(track, { "--rec-drag": `${pastEnd ? dx * 0.3 : dx}px` });
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    drag.current = null;
    if (!state?.active || state.id !== event.pointerId) return;
    setDragging(false);
    // The click that follows pointerup (if any) arrives in this same task; touch
    // swipes often send none, so the flag must not outlive it and eat a later tap.
    suppressClick.current = event.type === "pointerup";
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
    const threshold = Math.min(90, event.currentTarget.offsetWidth * 0.12);
    const dir = event.type === "pointercancel" ? 0 : state.dx < -threshold ? 1 : state.dx > threshold ? -1 : 0;
    settle(index + dir);
  };

  // A mouse drag ends with a click on whatever is under the pointer; swallow it.
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <section
      ref={rootRef}
      className={styles.section}
      id="recommendations"
      aria-labelledby="recommendations-title"
      data-nav-label="Recommendations"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow} data-rec-fade>
            {number}
          </p>
          <h2 id="recommendations-title" className={styles.title} data-rec-fade>
            What people say about <span>working with me.</span>
          </h2>
        </header>
      </div>

      {current && (
        <div
          className={styles.stage}
          {...(hasControls && {
            role: "region",
            "aria-roledescription": "carousel",
            "aria-label": "Recommendations, use the arrow keys to browse",
            tabIndex: 0,
            onKeyDown,
          })}
        >
          <div
            className={styles.viewport}
            data-dragging={dragging || undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
          >
            <ol ref={trackRef} className={styles.track} data-single={!hasControls || undefined}>
              {testimonials.map((testimonial, i) => {
                const active = i === index;
                return (
                  <li
                    key={testimonial.id}
                    className={styles.slide}
                    data-active={active}
                    aria-hidden={!active || undefined}
                    {...(hasControls && { "aria-roledescription": "slide", "aria-label": `${i + 1} of ${total}` })}
                    onClick={active ? undefined : () => settle(i)}
                  >
                    <figure className={styles.card} data-rec-card>
                      <QuoteMark className={styles.mark} />
                      <blockquote className={styles.quote}>
                        <Paragraphs paragraphs={testimonial.excerpt ?? testimonial.paragraphs} highlights={testimonial.highlights} />
                      </blockquote>
                      {testimonial.excerpt && (
                        <button
                          type="button"
                          className={styles.readMore}
                          onClick={() => setReading(testimonial)}
                          aria-haspopup="dialog"
                          tabIndex={active ? undefined : -1}
                        >
                          Read full recommendation
                          <Maximize2 size={14} strokeWidth={2.2} aria-hidden="true" />
                        </button>
                      )}
                      <Credit testimonial={testimonial} focusable={active} />
                    </figure>
                  </li>
                );
              })}
            </ol>
          </div>

          {hasControls && (
            <div className={styles.controls} data-rec-controls>
              <button type="button" className={styles.navButton} onClick={() => step(-1)} aria-label="Previous recommendation">
                <ArrowLeft size={18} aria-hidden="true" />
              </button>

              <div className={styles.position}>
                <p className={styles.count} aria-live="polite">
                  <span className={styles.srOnly}>Recommendation </span>
                  <strong>{pad(index + 1)}</strong>
                  <span aria-hidden="true"> / </span>
                  <span className={styles.srOnly}> of </span>
                  {pad(total)}
                  <span className={styles.srOnly}>, from {current.name}</span>
                </p>
                <div className={styles.dots} role="group" aria-label="Choose a recommendation">
                  {testimonials.map((testimonial, i) => (
                    <button
                      key={testimonial.id}
                      type="button"
                      className={styles.dot}
                      onClick={() => settle(i)}
                      aria-label={`Recommendation from ${testimonial.name}`}
                      aria-current={i === index || undefined}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={`${styles.navButton} ${styles.navNext}`}
                onClick={() => step(1)}
                aria-label="Next recommendation"
              >
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className={styles.inner}>
        <div className={styles.invite} data-rec-invite>
          <ShareButton onClick={() => setFormOpen(true)} />
        </div>
      </div>

      <FullQuoteDialog testimonial={reading} onClose={() => setReading(null)} />
      <RecommendationForm open={formOpen} onClose={() => setFormOpen(false)} />
    </section>
  );
}
