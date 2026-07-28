import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectImpact({ project }: { project: ProjectDetail }) {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="impact-title">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Community &amp; User Impact</p>
          <h2 id="impact-title" className={styles.sectionTitle}>
            Who Benefits and How
          </h2>
        </header>

        <div className={styles.impactGrid}>
          {project.impact.map((item) => (
            <div key={item} className={styles.impactCard}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
