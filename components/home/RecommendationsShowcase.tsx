"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type SVGProps } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import RecommendationForm from "./RecommendationForm";
import styles from "./Recommendations.module.css";

/** What the browser receives for one collaborator (see Recommendations.tsx). */
export type ShowcaseEntry = {
  id: string;
  name: string;
  initials: string;
  role: string;
  organization: string;
  team?: string;
  relationship: string;
  context?: string;
  /** Present only once the writer has approved the wording. */
  quote: string | null;
  highlight?: string;
  date?: { label: string; iso: string };
  photo?: { src: string; alt: string };
  linkedin?: string;
};

type WordPart = { text: string; accent: boolean };

/** Splits text into words, marking the parts that fall inside `highlight`. */
function tokenize(text: string, highlight?: string): WordPart[][] {
  const start = highlight ? text.indexOf(highlight) : -1;
  const end = start + (highlight?.length ?? 0);
  return Array.from(text.matchAll(/\S+/g), (match) => {
    const from = match.index;
    const to = from + match[0].length;
    if (start < 0 || to <= start || from >= end) return [{ text: match[0], accent: false }];
    const a = Math.max(from, start);
    const b = Math.min(to, end);
    return [
      { text: text.slice(from, a), accent: false },
      { text: text.slice(a, b), accent: true },
      { text: text.slice(b, to), accent: false },
    ].filter((part) => part.text);
  });
}

/** Each word sits in a clipping mask so it can slide up into place. */
function Words({ text, highlight }: { text: string; highlight?: string }) {
  const words = tokenize(text, highlight);
  return words.map((parts, i) => (
    <Fragment key={i}>
      <span className={styles.wordMask}>
        <span className={styles.word} data-rec-word>
          {parts.map((part, j) =>
            part.accent ? (
              <mark className={styles.accent} key={j}>
                {part.text}
              </mark>
            ) : (
              <Fragment key={j}>{part.text}</Fragment>
            )
          )}
        </span>
      </span>
      {i < words.length - 1 && " "}
    </Fragment>
  ));
}

/** Opening sentence, then the rest, so the quote reads as lead and body. */
function splitLead(quote: string) {
  const match = quote.match(/^.+?[.!?](?=\s|$)/);
  if (!match || match[0].length >= quote.length - 1) return { lead: quote, body: "" };
  return { lead: match[0], body: quote.slice(match[0].length).trim() };
}

/** Four-point sparkle, the same motif as the hero and the fairy-dust cursor. */
function Sparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Oversized opening quote. Drawn as an outline while the words are still in review. */
function QuoteMark({ hollow }: { hollow: boolean }) {
  return (
    <span className={hollow ? `${styles.mark} ${styles.markHollow}` : styles.mark} data-rec-depth="14" aria-hidden="true">
      <svg viewBox="0 0 120 96" focusable="false">
        <path data-rec-mark d="M6 90V56C6 26 20 8 48 2l4 12C36 20 28 32 28 48h20v42Z" />
        <path data-rec-mark d="M68 90V56C68 26 82 8 110 2l4 12C98 20 90 32 90 48h20v42Z" />
      </svg>
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
 * "The people I've worked with": an asymmetric editorial spread. A record-label
 * portrait on a burgundy slab faces the featured words; with several approved
 * recommendations, arrows page between them. Everything is visible without JS
 * or with reduced motion; GSAP only sets start states after hydration.
 */
export default function RecommendationsShowcase({ number, entries }: { number: string; entries: ShowcaseEntry[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const busy = useRef(false);
  const direction = useRef<1 | -1>(1);
  const firstPaint = useRef(true);

  const total = entries.length;
  const entry = entries[index];
  const hasControls = total > 1;

  // Scroll entrance, scroll-linked spin/parallax and pointer depth.
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        wide: "(min-width: 821px)",
        fine: "(pointer: fine)",
      },
      (context) => {
        const { motion, wide, fine } = context.conditions as Record<string, boolean>;
        if (!motion) return;

        gsap
          .timeline({ scrollTrigger: { trigger: root, start: "top 78%", once: true } })
          .fromTo(
            q("[data-rec-title]"),
            { yPercent: 118 },
            { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.08, clearProps: "transform" }
          )
          .fromTo(
            q("[data-rec-fade]"),
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.1, clearProps: "transform,opacity,visibility" },
            0.3
          );

        const marks = Array.from(root.querySelectorAll<SVGPathElement>("[data-rec-mark]"));
        const lengths = marks.map((path) => path.getTotalLength());

        gsap
          .timeline({ scrollTrigger: { trigger: stage, start: "top 80%", once: true } })
          .fromTo(
            q("[data-rec-slab]"),
            { scaleX: 0, transformOrigin: "0% 50%" },
            { scaleX: 1, duration: 1.2, ease: "expo.out", clearProps: "transform" }
          )
          .fromTo(
            q("[data-rec-disc]"),
            { clipPath: "circle(0% at 50% 50%)", rotation: -120 },
            { clipPath: "circle(50% at 50% 50%)", rotation: 0, duration: 1.5, ease: "expo.out", clearProps: "clipPath,transform" },
            0.15
          )
          .fromTo(
            marks,
            { strokeDasharray: (i: number) => lengths[i], strokeDashoffset: (i: number) => lengths[i], fillOpacity: 0 },
            { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut", stagger: 0.15, clearProps: "strokeDasharray,strokeDashoffset" },
            0.25
          )
          .to(marks, { fillOpacity: 1, duration: 0.6, ease: "power1.out", clearProps: "fillOpacity" }, 1.25)
          .fromTo(
            q("[data-rec-word]"),
            { yPercent: 110 },
            { yPercent: 0, duration: 0.95, ease: "power4.out", stagger: 0.012, clearProps: "transform" },
            0.4
          )
          .fromTo(
            q("[data-rec-rise]"),
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.07, clearProps: "transform,opacity,visibility" },
            0.7
          )
          .fromTo(
            q("[data-rec-sparkle]"),
            { scale: 0, rotation: -90 },
            { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(2.2)", stagger: 0.12 },
            0.9
          );

        const orbit = root.querySelector<SVGCircleElement>("[data-rec-orbit]");
        if (orbit) {
          const length = orbit.getTotalLength();
          gsap.fromTo(
            orbit,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: { trigger: stage, start: "top 85%", end: "center 45%", scrub: 0.8 },
            }
          );
        }

        // The record keeps turning slowly as the page scrolls past.
        gsap.to(q("[data-rec-spin]"), {
          rotation: 160,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.8 },
        });

        if (wide) {
          gsap.fromTo(
            q("[data-rec-portrait]"),
            { yPercent: 5 },
            { yPercent: -5, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 0.6 } }
          );
        }

        if (!fine) return;

        // Decorative layers drift with the pointer at different depths.
        const layers = (q("[data-rec-depth]") as HTMLElement[]).map((element) => ({
          depth: Number(element.dataset.recDepth) || 10,
          x: gsap.quickTo(element, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(element, "y", { duration: 0.9, ease: "power3.out" }),
        }));
        const move = (event: PointerEvent) => {
          const box = stage.getBoundingClientRect();
          const nx = (event.clientX - box.left) / box.width - 0.5;
          const ny = (event.clientY - box.top) / box.height - 0.5;
          layers.forEach((layer) => {
            layer.x(nx * layer.depth);
            layer.y(ny * layer.depth);
          });
        };
        const leave = () =>
          layers.forEach((layer) => {
            layer.x(0);
            layer.y(0);
          });
        stage.addEventListener("pointermove", move);
        stage.addEventListener("pointerleave", leave);
        return () => {
          stage.removeEventListener("pointermove", move);
          stage.removeEventListener("pointerleave", leave);
        };
      }
    );

    return () => mm.revert();
  }, []);

  // Incoming recommendation after a page turn (the outgoing half runs in `go`).
  useLayoutEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    const stage = stageRef.current;
    if (!stage || !allowsMotion()) {
      busy.current = false;
      return;
    }
    const q = gsap.utils.selector(stage);
    const dir = direction.current;
    const tl = gsap
      .timeline({
        onComplete: () => {
          busy.current = false;
        },
      })
      .fromTo(
        q("[data-rec-disc]"),
        { rotation: -dir * 90, scale: 0.86, autoAlpha: 0 },
        { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.95, ease: "expo.out", clearProps: "transform,opacity,visibility" }
      )
      .fromTo(
        q("[data-rec-word]"),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.8, ease: "power4.out", stagger: 0.01, clearProps: "transform" },
        0.1
      )
      .fromTo(
        q("[data-rec-rise]"),
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.05, clearProps: "transform,opacity,visibility" },
        0.3
      );
    return () => {
      tl.kill();
      busy.current = false;
    };
  }, [index]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (busy.current || total < 2) return;
      const next = (index + dir + total) % total;
      const stage = stageRef.current;
      direction.current = dir;
      if (!stage || !allowsMotion()) {
        setIndex(next);
        return;
      }
      busy.current = true;
      const q = gsap.utils.selector(stage);
      gsap
        .timeline({ onComplete: () => setIndex(next) })
        .to(q("[data-rec-word]"), { yPercent: -110, duration: 0.4, ease: "power2.in", stagger: 0.004 }, 0)
        .to(q("[data-rec-rise]"), { y: -12, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0)
        .to(q("[data-rec-disc]"), { rotation: dir * 90, scale: 0.86, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 0);
    },
    [index, total]
  );

  const onControlsKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") go(1);
    else if (event.key === "ArrowLeft") go(-1);
  };

  const [firstName, ...restOfName] = entry.name.split(" ");
  const { lead, body } = entry.quote ? splitLead(entry.quote) : { lead: "", body: "" };
  const project = entry.team ? `${entry.organization} — ${entry.team}` : entry.organization;

  const ledger = (
    <dl className={styles.ledger} data-rec-rise>
      <div>
        <dt>Project</dt>
        <dd>{entry.organization}</dd>
      </div>
      {entry.team && (
        <div>
          <dt>Team</dt>
          <dd>{entry.team}</dd>
        </div>
      )}
      {entry.date && (
        <div>
          <dt>Written</dt>
          <dd>
            <time dateTime={entry.date.iso}>{entry.date.label}</time>
          </dd>
        </div>
      )}
    </dl>
  );

  const linkedin = entry.linkedin && (
    <a className={styles.linkedin} href={entry.linkedin} target="_blank" rel="noopener noreferrer" data-rec-rise>
      LinkedIn <ArrowUpRight size={14} aria-hidden="true" />
      <span className={styles.srOnly}> profile of {entry.name} (opens in a new tab)</span>
    </a>
  );

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
          <p className={styles.number} data-rec-fade>
            {number}
          </p>
          <h2 id="recommendations-title" className={styles.title}>
            <span className={styles.titleLine}>
              <span className={styles.titleMask}>
                <span data-rec-title>The people</span>
              </span>{" "}
              <span className={styles.titleMask}>
                <span data-rec-title>I&apos;ve</span>
              </span>
            </span>
            <span className={`${styles.titleLine} ${styles.titleAccent}`}>
              <span className={styles.titleMask}>
                <span data-rec-title>worked with.</span>
              </span>
            </span>
          </h2>
          <div className={styles.aside} data-rec-fade>
            <p className={styles.intro}>
              Words from the teammates, instructors and leaders I&apos;ve built things with, each shared here with their
              permission.
            </p>
            <ShareButton onClick={() => setFormOpen(true)} />
          </div>
        </header>

        <div ref={stageRef} className={styles.stage}>
          <div className={styles.portrait} data-rec-portrait>
            <svg className={styles.orbit} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
              <circle data-rec-orbit cx="50" cy="50" r="49" />
            </svg>

            <div className={styles.slab} data-rec-slab data-rec-depth="-10" aria-hidden="true">
              <span className={styles.slabVertical}>{project}</span>
              <span className={styles.slabCaption}>
                <span>{entry.quote ? "Recommendation" : "Featured collaborator"}</span>
                <span>No. {pad(index + 1)}</span>
              </span>
              <span className={styles.slabNumber}>{pad(index + 1)}</span>
            </div>

            <div className={styles.disc} data-rec-disc>
              <div className={styles.discSpin} data-rec-spin>
                {entry.photo ? (
                  <span className={`${styles.discLabel} ${styles.discPhoto}`}>
                    <Image src={entry.photo.src} alt={entry.photo.alt} fill sizes="(max-width: 820px) 50vw, 22vw" />
                  </span>
                ) : (
                  <span className={styles.discLabel} aria-hidden="true">
                    <span className={styles.discInitials}>{entry.initials}</span>
                    <span className={styles.discLabelText}>{entry.organization}</span>
                  </span>
                )}
              </div>
              <span className={styles.sheen} aria-hidden="true" />
            </div>

            <span className={`${styles.sparkle} ${styles.sparkleOne}`} data-rec-depth="26" aria-hidden="true">
              <span data-rec-sparkle>
                <Sparkle />
              </span>
            </span>
            <span className={`${styles.sparkle} ${styles.sparkleTwo}`} data-rec-depth="-18" aria-hidden="true">
              <span data-rec-sparkle>
                <Sparkle />
              </span>
            </span>
            <span className={`${styles.sparkle} ${styles.sparkleThree}`} data-rec-depth="34" aria-hidden="true">
              <span data-rec-sparkle>
                <Sparkle />
              </span>
            </span>
          </div>

          <div className={styles.featureCol}>
            {/* Outside the keyed figure so the mark keeps its pointer drift across page turns. */}
            <div className={styles.featureHead}>
              <QuoteMark hollow={!entry.quote} />
              <div className={styles.eyebrows} data-rec-rise>
                <p className={styles.eyebrow}>{entry.quote ? entry.relationship : "Featured collaborator"}</p>
                {!entry.quote && <p className={styles.eyebrowSub}>{entry.relationship}</p>}
              </div>
            </div>

            <figure className={styles.feature} key={entry.id}>
              {entry.quote ? (
                <>
                  <blockquote className={styles.quote}>
                    <p className={styles.lead}>
                      <Words text={lead} highlight={entry.highlight} />
                    </p>
                    {body && (
                      <p className={styles.body}>
                        <Words text={body} highlight={entry.highlight} />
                      </p>
                    )}
                  </blockquote>
                  <figcaption className={styles.credit}>
                    <span className={styles.who} data-rec-rise>
                      <strong>{entry.name}</strong>
                      <span>{entry.role}</span>
                    </span>
                    {ledger}
                    {linkedin}
                  </figcaption>
                </>
              ) : (
                <>
                  <p className={styles.spotName}>
                    <Words text={firstName} />
                    {restOfName.length > 0 && (
                      <span className={styles.spotNameRest}>
                        <Words text={restOfName.join(" ")} />
                      </span>
                    )}
                  </p>
                  <p className={styles.spotRole} data-rec-rise>
                    {entry.role}
                  </p>
                  {entry.context && (
                    <p className={styles.spotContext} data-rec-rise>
                      {entry.context}
                    </p>
                  )}
                  <figcaption className={styles.credit}>
                    {ledger}
                    {linkedin}
                    <p className={styles.pending} data-rec-rise>
                      <span className={styles.pendingDot} aria-hidden="true" />
                      Recommendation in review. It will appear here once {firstName} has approved the wording.
                    </p>
                  </figcaption>
                </>
              )}
            </figure>

            {hasControls && (
              <div className={styles.controls} role="group" aria-label="Browse recommendations" onKeyDown={onControlsKey}>
                <button type="button" className={styles.navButton} onClick={() => go(-1)} aria-label="Previous recommendation">
                  <ArrowLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navNext}`}
                  onClick={() => go(1)}
                  aria-label="Next recommendation"
                >
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <span className={styles.progress} aria-hidden="true">
                  <span style={{ transform: `scaleX(${(index + 1) / total})` }} />
                </span>
                <p className={styles.count} aria-live="polite">
                  <span className={styles.srOnly}>Recommendation </span>
                  <strong>{pad(index + 1)}</strong>
                  <span aria-hidden="true"> / </span>
                  <span className={styles.srOnly}> of </span>
                  {pad(total)}
                  <span className={styles.srOnly}>: {entry.name}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <RecommendationForm open={formOpen} onClose={() => setFormOpen(false)} />
    </section>
  );
}
