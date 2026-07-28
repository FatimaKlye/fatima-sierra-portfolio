import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectContribution({ project }: { project: ProjectDetail }) {
  return (
    <section className={styles.section} aria-labelledby="contribution-title">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>My Contribution</p>
          <h2 id="contribution-title" className={styles.sectionTitle}>
            What I Personally Worked On
          </h2>
        </header>

        <ul className={styles.list}>
          {project.contributions.map((item) => (
            <li key={item} className={styles.listItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
