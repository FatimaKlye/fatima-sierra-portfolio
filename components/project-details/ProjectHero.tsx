import Link from "next/link";
import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectHero({ project }: { project: ProjectDetail }) {
  return (
    <section className={styles.hero} aria-labelledby="project-hero-title">
      <div className={styles.container}>
        <div className={styles.backRow}>
          <Link href="/projects" className={styles.backLink}>
            <span className={styles.backArrow} aria-hidden="true">
              ←
            </span>
            Back to All Projects
          </Link>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.category}>{project.category}</p>
            <h1 id="project-hero-title" className={styles.title}>
              {project.title}
            </h1>
            <p className={styles.summary}>{project.summary}</p>

            <ul className={styles.tagList} aria-label="Technologies used">
              {project.technologies.map((tech) => (
                <li key={tech} className={styles.tag}>
                  {tech}
                </li>
              ))}
            </ul>

            <div className={styles.metaRow}>
              <div className={styles.metaCard}>
                <p className={styles.metaLabel}>Status</p>
                <p className={styles.metaValue}>{project.status}</p>
              </div>
              <div className={styles.metaCard}>
                <p className={styles.metaLabel}>My Role</p>
                <p className={styles.metaValue}>{project.role}</p>
              </div>
            </div>
          </div>

          <div className={styles.heroImageFrame}>
            <img
              className={styles.heroImage}
              src={project.heroImage.src}
              alt={project.heroImage.alt}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
