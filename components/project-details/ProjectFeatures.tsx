import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectFeatures({ project }: { project: ProjectDetail }) {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="features-title">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Key Features</p>
          <h2 id="features-title" className={styles.sectionTitle}>
            What the System Delivers
          </h2>
        </header>

        <div className={styles.featureGrid}>
          {project.features.map((feature, index) => (
            <div key={feature.title} className={styles.featureCard}>
              <span className={styles.featureIcon} aria-hidden="true">
                {index + 1}
              </span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
