import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectLinks({ project }: { project: ProjectDetail }) {
  const { links } = project;

  return (
    <section className={styles.section} aria-labelledby="links-title">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Project Links</p>
          <h2 id="links-title" className={styles.sectionTitle}>
            Explore Further
          </h2>
        </header>

        <div className={styles.linksRow}>
          <a
            className={styles.linkButton}
            href={links.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            View GitHub Repository
          </a>

          {links.liveUrl && (
            <a
              className={`${styles.linkButton} ${styles.linkButtonPrimary}`}
              href={links.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              View Live Project
            </a>
          )}

          {links.videoUrl && (
            <a
              className={styles.linkButton}
              href={links.videoUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Watch Demonstration
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
