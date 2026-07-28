import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectChallenges({ project }: { project: ProjectDetail }) {
  return (
    <section className={styles.section} aria-labelledby="challenges-title">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Challenges &amp; Solutions</p>
          <h2 id="challenges-title" className={styles.sectionTitle}>
            Working Through the Hard Parts
          </h2>
        </header>

        <div className={styles.challengeGrid}>
          {project.challenges.map((item) => (
            <div key={item.challenge} className={styles.challengeCard}>
              <div>
                <p className={`${styles.challengeLabel} ${styles.challengeLabelProblem}`}>
                  Challenge
                </p>
                <p className={styles.challengeText}>{item.challenge}</p>
              </div>
              <div>
                <p className={`${styles.challengeLabel} ${styles.challengeLabelSolution}`}>
                  Solution
                </p>
                <p className={styles.challengeText}>{item.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
