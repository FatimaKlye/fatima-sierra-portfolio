import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectProblemSolution({ project }: { project: ProjectDetail }) {
  const { problemAndSolution } = project;

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="problem-solution-title">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Problem &amp; Solution</p>
          <h2 id="problem-solution-title" className={styles.sectionTitle}>
            The Challenge and the Approach
          </h2>
        </header>

        <div className={styles.splitGrid}>
          <div className={`${styles.splitCard} ${styles.problemCard}`}>
            <h3 className={styles.splitCardTitle}>The Problem</h3>
            <p className={styles.splitCardText}>{problemAndSolution.problem}</p>
          </div>
          <div className={`${styles.splitCard} ${styles.solutionCard}`}>
            <h3 className={styles.splitCardTitle}>The Solution</h3>
            <p className={styles.splitCardText}>{problemAndSolution.solution}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
