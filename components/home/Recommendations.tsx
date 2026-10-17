"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { PUBLISHED_RECOMMENDATIONS } from "./recommendationsData";
import styles from "./Recommendations.module.css";

/**
 * Homepage social proof: genuine, permission-given recommendations in a
 * horizontal band (scroll, swipe, drag or arrow keys). With none published
 * yet it shows a short, truthful placeholder instead of filler quotes.
 */
export default function Recommendations({ number }: { number: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);

  // Mouse drag-to-scroll; touch and trackpads already scroll natively.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (event.pointerType !== "mouse" || !track || track.scrollWidth <= track.clientWidth) return;
    drag.current = { x: event.clientX, scroll: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
    track.dataset.dragging = "";
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!drag.current || !track) return;
    track.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!drag.current || !track) return;
    drag.current = null;
    track.releasePointerCapture(event.pointerId);
    delete track.dataset.dragging;
  };

  const hasRecommendations = PUBLISHED_RECOMMENDATIONS.length > 0;

  return (
    <section className={styles.section} id="recommendations" aria-labelledby="recommendations-title" data-nav-label="Recommendations">
      <header className={styles.header}>
        <p className={styles.number}>{number}</p>
        <h2 id="recommendations-title" className={styles.title}>
          The people I&apos;ve <em>worked with.</em>
        </h2>
        <p className={styles.intro}>Feedback from mentors, instructors, and teammates I&apos;ve collaborated with.</p>
      </header>

      {hasRecommendations ? (
        <div
          ref={trackRef}
          className={styles.track}
          tabIndex={0}
          role="region"
          aria-label="Recommendations — scroll sideways for more"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {PUBLISHED_RECOMMENDATIONS.map((entry) => (
            <figure className={styles.quote} key={entry.id}>
              <p className={styles.relationship}>{entry.relationship}</p>
              <blockquote className={styles.text}>
                <p>{entry.quote}</p>
              </blockquote>
              <figcaption className={styles.person}>
                <span>
                  <strong>{entry.name}</strong>
                  <small>{entry.role}</small>
                </span>
                {entry.photo && (
                  <Image className={styles.avatar} src={entry.photo} alt="" width={52} height={52} draggable={false} />
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>
            This space is reserved for recommendations from the instructors, advisers and teammates I&apos;ve worked
            with — each one shared here with their permission.
          </p>
          <Link className="ui-btn ui-btn--secondary ui-btn--sm" href="/contact">
            Worked with me? Share a few words
          </Link>
        </div>
      )}
    </section>
  );
}
