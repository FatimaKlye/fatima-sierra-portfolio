"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import RecommendationForm from "./RecommendationForm";
import styles from "./Recommendations.module.css";

/** One approved testimonial, as the browser receives it (see Recommendations.tsx). */
export type Testimonial = {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Project, team or organisation, shown as "IGNIS SAFE | SIQUILE DYNAMICS". */
  affiliation: string[];
  quote: string;
  /** Phrases that appear verbatim in `quote`, subtly emphasised. */
  highlights: string[];
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

/** Decorative opening quote; its outline draws in, then fills. */
function QuoteMark() {
  return (
    <svg viewBox="0 0 120 96" focusable="false">
      <path data-rec-mark d="M6 90V56C6 26 20 8 48 2l4 12C36 20 28 32 28 48h20v42Z" />
      <path data-rec-mark d="M68 90V56C68 26 82 8 110 2l4 12C98 20 90 32 90 48h20v42Z" />
    </svg>
  );
}

/** Approved headshot if there is one, otherwise a monogram. */
function Avatar({ testimonial }: { testimonial: Testimonial }) {
  if (testimonial.photo) {
    return (
      <span className={styles.avatar}>
        <Image src={testimonial.photo.src} alt={testimonial.photo.alt} fill sizes="56px" />
      </span>
    );
  }
  return (
    <span className={styles.avatar} aria-hidden="true">
      {testimonial.initials}
    </span>
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
      const move = (event: PointerEvent) => {
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

const pad = (value: number) => String(value).padStart(2, "0");
const allowsMotion = () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

/**
 * "Kind words": a centred editorial testimonial. The quotation is the
 * centrepiece, with the author credited beneath it; arrows appear only when
 * there is more than one approved testimonial. With none, only the heading and
 * the share invite render. Everything is visible without JS or with reduced
 * motion; GSAP only sets start states after hydration.
 */
export default function RecommendationsShowcase({ number, testimonials }: { number: string; testimonials: Testimonial[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const busy = useRef(false);
  const turned = useRef(false);

  const total = testimonials.length;
  const current = testimonials[index];
  const hasControls = total > 1;

  // Heading, quotation mark and invite: one entrance as the section scrolls in.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 78%", once: true } })
        .fromTo(
          q("[data-rec-fade]"),
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.1, clearProps: "transform,opacity,visibility" }
        );

      const marks = Array.from(root.querySelectorAll<SVGPathElement>("[data-rec-mark]"));
      if (marks.length) {
        const lengths = marks.map((path) => path.getTotalLength());
        tl.fromTo(
          markRef.current,
          { scale: 0.6, rotation: -14, autoAlpha: 0 },
          { scale: 1, rotation: 0, autoAlpha: 1, duration: 1.1, ease: "back.out(1.8)", clearProps: "transform,opacity,visibility" },
          0.2
        )
          .fromTo(
            marks,
            { strokeDasharray: (i: number) => lengths[i], strokeDashoffset: (i: number) => lengths[i], fillOpacity: 0 },
            { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.12, clearProps: "strokeDasharray,strokeDashoffset" },
            0.2
          )
          .to(marks, { fillOpacity: 1, duration: 0.5, ease: "power1.out", clearProps: "fillOpacity" }, 1.05);
      }

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

  // Quote and author: revealed on scroll the first time, straight away after a page turn.
  useLayoutEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);
    const turn = turned.current;
    const q = gsap.utils.selector(figure);
    const trigger = () => (turn ? undefined : { trigger: figure, start: "top 82%", once: true });
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Masked lines rise into place, then the emphasised phrases are underlined.
      // autoSplit re-splits (and re-syncs the animation) after font loads and resizes.
      SplitText.create(q("[data-rec-quote]"), {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap
            .timeline({ scrollTrigger: trigger() })
            .from(self.lines, { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.08 }, turn ? 0 : 0.3)
            .fromTo(
              q("mark"),
              { backgroundSize: "0% 100%" },
              { backgroundSize: "100% 100%", duration: 0.9, ease: "power2.inOut", stagger: 0.2 },
              turn ? 0.5 : 0.95
            ),
      });

      gsap
        .timeline({
          scrollTrigger: trigger(),
          onComplete: () => {
            busy.current = false;
          },
        })
        .fromTo(
          q("[data-rec-rise]"),
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.08, clearProps: "transform,opacity,visibility" },
          turn ? 0.35 : 0.9
        );

      if (turn) {
        gsap.fromTo(
          markRef.current,
          { scale: 0.82, rotation: -10 },
          { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(2)", clearProps: "transform" }
        );
      }
    });

    return () => {
      mm.revert();
      busy.current = false;
    };
  }, [index]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (busy.current || total < 2) return;
      const next = (index + dir + total) % total;
      const figure = figureRef.current;
      turned.current = true;
      if (!figure || !allowsMotion()) {
        setIndex(next);
        return;
      }
      busy.current = true;
      gsap.to(figure, { autoAlpha: 0, y: -14, duration: 0.4, ease: "power2.in", onComplete: () => setIndex(next) });
    },
    [index, total]
  );

  const onControlsKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") go(1);
    else if (event.key === "ArrowLeft") go(-1);
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

        {current && (
          <div className={styles.stage}>
            {/* Outside the keyed figure so it stays put across page turns. */}
            <span ref={markRef} className={styles.mark} aria-hidden="true">
              <QuoteMark />
            </span>

            <figure ref={figureRef} key={current.id} className={styles.figure}>
              <blockquote className={styles.quote}>
                <p data-rec-quote>
                  {emphasize(current.quote, current.highlights).map((part, i) =>
                    part.accent ? (
                      <mark className={styles.highlight} key={i}>
                        {part.text}
                      </mark>
                    ) : (
                      <Fragment key={i}>{part.text}</Fragment>
                    )
                  )}
                </p>
              </blockquote>

              <figcaption className={styles.author}>
                <span className={styles.rule} data-rec-rise aria-hidden="true" />
                <span className={styles.person} data-rec-rise>
                  <Avatar testimonial={current} />
                  <span className={styles.details}>
                    <strong className={styles.name}>{current.name}</strong>
                    <span className={styles.role}>{current.role}</span>
                    {current.affiliation.length > 0 && (
                      <span className={styles.affiliation}>
                        {current.affiliation.map((part, i) => (
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
                {current.linkedin && (
                  <a className={styles.linkedin} href={current.linkedin} target="_blank" rel="noopener noreferrer" data-rec-rise>
                    LinkedIn <ArrowUpRight size={14} aria-hidden="true" />
                    <span className={styles.srOnly}> profile of {current.name} (opens in a new tab)</span>
                  </a>
                )}
              </figcaption>
            </figure>

            {hasControls && (
              <div className={styles.controls} role="group" aria-label="Browse testimonials" onKeyDown={onControlsKey}>
                <button type="button" className={styles.navButton} onClick={() => go(-1)} aria-label="Previous testimonial">
                  <ArrowLeft size={18} aria-hidden="true" />
                </button>
                <p className={styles.count} aria-live="polite">
                  <span className={styles.srOnly}>Testimonial </span>
                  <strong>{pad(index + 1)}</strong>
                  <span aria-hidden="true"> / </span>
                  <span className={styles.srOnly}> of </span>
                  {pad(total)}
                  <span className={styles.srOnly}>: {current.name}</span>
                </p>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navNext}`}
                  onClick={() => go(1)}
                  aria-label="Next testimonial"
                >
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className={styles.invite} data-rec-invite>
          <ShareButton onClick={() => setFormOpen(true)} />
        </div>
      </div>

      <RecommendationForm open={formOpen} onClose={() => setFormOpen(false)} />
    </section>
  );
}
