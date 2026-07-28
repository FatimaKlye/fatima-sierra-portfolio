import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectSkills({ project }: { project: ProjectDetail }) {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="skills-title">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Skills &amp; Lessons Learned</p>
          <h2 id="skills-title" className={styles.sectionTitle}>
            What This Project Taught Me
          </h2>
        </header>

        <div className={styles.skillGrid}>
          {project.skills.map((skill) => (
            <span key={skill} className={styles.skillPill}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
