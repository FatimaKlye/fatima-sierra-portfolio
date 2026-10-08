import type { CSSProperties } from "react";
import type { ProjectStep } from "@/data/projectDetailsData";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

type ProjectTimelineProps = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  steps: ProjectStep[];
  /** "journey" is a user-facing flow; "process" is how the project was built. */
  variant: "journey" | "process";
};

export default function ProjectTimeline({ id, number, eyebrow, title, steps, variant }: ProjectTimelineProps) {
  const sectionClass = variant === "process" ? `${styles.timeline} ${styles.timelineAlt}` : styles.timeline;

  return (
    <section
      className={sectionClass}
      id={variant}
      aria-labelledby={id}
      data-nav-label={variant === "process" ? "Development process" : "User journey"}
    >
      <div className={styles.container}>
        <SectionHead id={id} number={number} eyebrow={eyebrow} title={title} />

        <div className={styles.stepsWrap} style={{ "--steps": steps.length } as CSSProperties}>
          <span className={styles.stepLine} data-line aria-hidden="true" />
          <ol className={styles.steps} data-stagger>
            {steps.map((step, stepIndex) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepMarker} aria-hidden="true">
                  {stepIndex + 1}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                {step.description && <p className={styles.stepText}>{step.description}</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
