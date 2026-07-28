import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectOverview({ project }: { project: ProjectDetail }) {
  const { overview } = project;

  const cards = [
    { label: "What It Is", text: overview.whatItIs },
    { label: "Who It's For", text: overview.createdFor },
    { label: "The Problem", text: overview.problem },
    { label: "Why It Was Needed", text: overview.whyNeeded },
  ];

  return (
    <section className={styles.section} aria-labelledby="overview-title">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Project Overview</p>
          <h2 id="overview-title" className={styles.sectionTitle}>
            Understanding the Project
          </h2>
        </header>

        <div className={styles.overviewGrid}>
          {cards.map((card) => (
            <div key={card.label} className={styles.overviewCard}>
              <p className={styles.overviewCardLabel}>{card.label}</p>
              <p className={styles.overviewCardText}>{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
