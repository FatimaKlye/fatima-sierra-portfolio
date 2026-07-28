import Link from "next/link";
import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectNavigation({
  previous,
  next,
}: {
  previous: ProjectDetail | null;
  next: ProjectDetail | null;
}) {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-label="Project navigation">
      <div className={styles.container}>
        <div className={styles.navGrid}>
          {previous ? (
            <Link href={`/projects/${previous.slug}`} className={styles.navCard}>
              <p className={styles.navLabel}>
                <span className={`${styles.navArrow} ${styles.navArrowPrev}`} aria-hidden="true">
                  ←
                </span>{" "}
                Previous Project
              </p>
              <p className={styles.navTitle}>{previous.title}</p>
            </Link>
          ) : (
            <span />
          )}

          <Link href="/projects" className={`${styles.navCard} ${styles.navCardCenter}`}>
            <p className={styles.navLabel}>All Projects</p>
            <p className={styles.navTitle}>Back to All Projects</p>
          </Link>

          {next ? (
            <Link href={`/projects/${next.slug}`} className={`${styles.navCard} ${styles.navNext}`}>
              <p className={styles.navLabel}>
                Next Project{" "}
                <span className={`${styles.navArrow} ${styles.navArrowNext}`} aria-hidden="true">
                  →
                </span>
              </p>
              <p className={styles.navTitle}>{next.title}</p>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </section>
  );
}
