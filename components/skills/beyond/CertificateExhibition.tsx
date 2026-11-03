"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { topicsForCertificate, type ExhibitCertificate } from "./beyondData";
import styles from "./Beyond.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/** Horizontal travel (px) that turns a press into a swipe. */
const SWIPE_DISTANCE = 40;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Circular distance from the active certificate: -2…2 sit on the stage, the rest wait offstage. */
function offsetFrom(index: number, active: number, total: number) {
  let offset = (((index - active) % total) + total) % total;
  if (offset > total / 2) offset -= total;
  return offset;
}

/**
 * The certificate exhibition: the active certificate front and centre at its real proportions,
 * neighbours receding in perspective on either side, a museum label beneath, and a contact-sheet
 * strip of all sixteen. Arrows, the keyboard, swipes, the strip and the neighbours all navigate;
 * the active certificate opens full size.
 */
export default function CertificateExhibition({
  certificates,
  onOpen,
  onShowTopic,
}: {
  certificates: ExhibitCertificate[];
  onOpen: (certificate: ExhibitCertificate) => void;
  onShowTopic: (title: string) => void;
}) {
  const total = certificates.length;
  const [active, setActive] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLOListElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);

  const current = certificates[active];
  const topics = topicsForCertificate(current.id);

  const go = useCallback((direction: 1 | -1) => setActive((index) => (index + direction + total) % total), [total]);

  // The deck is dealt out from a stack the first time it scrolls into view. Presentation only,
  // so it is written to the stage directly rather than kept in React state.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const spread = () => {
      stage.dataset.spread = "true";
    };
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      spread();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        spread();
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Keep the active thumbnail centred in the strip without scrolling the page.
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    strip.scrollTo({
      left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [active]);

  // A gentle tilt toward the pointer on the active certificate (fine pointers only).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const mm = gsap.matchMedia();
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      let target: HTMLElement | null = null;
      let rotateX: ((value: number) => void) | null = null;
      let rotateY: ((value: number) => void) | null = null;

      const bind = () => {
        const next = stage.querySelector<HTMLElement>('[data-offset="0"] [data-tilt]');
        if (next === target) return;
        target = next;
        if (next) gsap.set(next, { transformPerspective: 900 });
        rotateX = next ? gsap.quickTo(next, "rotationX", { duration: 0.6, ease: "power3.out" }) : null;
        rotateY = next ? gsap.quickTo(next, "rotationY", { duration: 0.6, ease: "power3.out" }) : null;
      };
      const move = (event: globalThis.PointerEvent) => {
        bind();
        if (!target) return;
        const box = target.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        const inside = Math.abs(x) <= 0.5 && Math.abs(y) <= 0.5;
        rotateY?.(inside ? x * 7 : 0);
        rotateX?.(inside ? -y * 7 : 0);
      };
      const leave = () => {
        rotateX?.(0);
        rotateY?.(0);
      };

      stage.addEventListener("pointermove", move);
      stage.addEventListener("pointerleave", leave);
      return () => {
        stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerleave", leave);
        if (target) gsap.set(target, { clearProps: "transform" });
      };
    });
    return () => mm.revert();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    swipe.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
    // The release would otherwise land as a click on whichever certificate is under it.
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className={styles.exhibit}>
      <div
        ref={stageRef}
        className={styles.stage}
        role="group"
        aria-roledescription="carousel"
        aria-label="Certificate exhibition. Use the left and right arrow keys to browse."
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          swipe.current = null;
        }}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {certificates.map((certificate, index) => {
          const offset = offsetFrom(index, active, total);
          if (Math.abs(offset) > 2) return null;
          const isActive = offset === 0;

          return (
            <button
              key={certificate.id}
              type="button"
              className={styles.plate}
              data-offset={offset}
              style={{ "--d": offset, "--r": certificate.width / certificate.height } as CSSProperties}
              onClick={() => (isActive ? onOpen(certificate) : setActive(index))}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={isActive ? undefined : true}
              aria-label={isActive ? `View full certificate: ${certificate.title}` : undefined}
            >
              <span className={styles.plateInner} data-tilt>
                <Image
                  className={styles.plateImage}
                  src={certificate.image}
                  alt={isActive ? certificate.previewAlt : ""}
                  fill
                  quality={85}
                  sizes="(max-width: 640px) 82vw, (max-width: 1100px) 64vw, 760px"
                  draggable={false}
                />
                {isActive && (
                  <span className={styles.plateHint} aria-hidden="true">
                    <Maximize2 size={15} strokeWidth={1.75} />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className={styles.srOnly} aria-live="polite">
        Certificate {active + 1} of {total}: {current.title}
      </p>

      <div className={styles.label}>
        <div className={styles.progress} aria-hidden="true">
          <span style={{ transform: `scaleX(${(active + 1) / total})` }} />
        </div>

        <p className={styles.counter} aria-hidden="true">
          <span className={styles.counterMask}>
            <span key={active} className={styles.counterNow}>
              {pad(active + 1)}
            </span>
          </span>
          <span className={styles.counterTotal}>/ {pad(total)}</span>
        </p>

        <div key={current.id} className={styles.labelBody}>
          <p className={styles.labelType}>{current.type}</p>
          <h4 className={styles.labelTitle}>{current.title}</h4>
          <dl className={styles.labelMeta}>
            <div>
              <dt>Issued by</dt>
              <dd>{current.issuer}</dd>
            </div>
            {current.date && (
              <div>
                <dt>Date</dt>
                <dd>{current.date}</dd>
              </div>
            )}
            {current.credentialId && (
              <div>
                <dt>Credential ID</dt>
                <dd>{current.credentialId}</dd>
              </div>
            )}
          </dl>
          {topics.length > 0 && (
            <p className={styles.labelTopics}>
              <span>Introduced</span>
              {topics.map((topic) => (
                <button key={topic} type="button" className={styles.topicLink} onClick={() => onShowTopic(topic)}>
                  {topic}
                </button>
              ))}
            </p>
          )}
        </div>

        <div className={styles.labelActions}>
          <button type="button" className="ui-btn ui-btn--primary ui-btn--sm" onClick={() => onOpen(current)}>
            <Maximize2 size={15} strokeWidth={1.75} aria-hidden="true" />
            View full certificate
          </button>
          <div className={styles.arrows}>
            <button type="button" className={styles.arrow} onClick={() => go(-1)} aria-label="Previous certificate">
              <ArrowLeft size={18} strokeWidth={1.75} />
            </button>
            <button type="button" className={styles.arrow} onClick={() => go(1)} aria-label="Next certificate">
              <ArrowRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      <ol ref={stripRef} className={styles.strip} aria-label="All certificates">
        {certificates.map((certificate, index) => (
          <li key={certificate.id}>
            <button
              type="button"
              className={styles.thumb}
              style={{ "--r": certificate.width / certificate.height } as CSSProperties}
              onClick={() => setActive(index)}
              aria-current={index === active ? "true" : undefined}
              aria-label={`Show certificate ${index + 1}: ${certificate.title}`}
            >
              <Image src={certificate.image} alt="" fill sizes="104px" draggable={false} />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
