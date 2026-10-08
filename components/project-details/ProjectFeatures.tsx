"use client";

import type { CSSProperties, PointerEvent } from "react";
import type { ProjectFeature } from "@/data/projectDetailsData";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

/** Column spans (out of 6) per card so every row of the bento grid fills exactly. */
const SPANS: Record<number, number[]> = {
  1: [6],
  2: [3, 3],
  3: [4, 2, 6],
  4: [4, 2, 2, 4],
  5: [4, 2, 2, 2, 2],
  6: [4, 2, 2, 4, 3, 3],
};

const TONES = [styles.tonePrimary, styles.tonePaper, styles.toneBlush, styles.tonePlum, styles.toneCream, styles.tonePaper];

const pad = (value: number) => String(value).padStart(2, "0");

export default function ProjectFeatures({ features, number }: { features: ProjectFeature[]; number: string }) {
  const spans = SPANS[features.length] ?? features.map(() => 2);

  // Soft light that follows the pointer across a card.
  const handlePointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>("[data-glow]");
    if (!card) {
      return;
    }
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <section className={styles.features} aria-labelledby="features-title">
      <div className={styles.container}>
        <SectionHead id="features-title" number={number} eyebrow="Key features" title="What it does" />

        <ul className={styles.bento} data-stagger onPointerMove={handlePointerMove}>
          {features.map((feature, featureIndex) => {
            const span = spans[featureIndex] ?? 2;

            return (
              <li
                key={feature.title}
                className={`${styles.featureCard} ${TONES[featureIndex % TONES.length]}`}
                style={{ "--span": span } as CSSProperties}
                data-wide={span >= 4 ? "true" : undefined}
                data-glow
              >
                <span className={styles.featureNum} aria-hidden="true">
                  {pad(featureIndex + 1)}
                </span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureText}>{feature.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
