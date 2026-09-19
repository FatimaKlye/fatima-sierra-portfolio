import Link from "next/link";
import type { Project } from "@/components/projects/projectsData";
import WorkGalleryShowcase from "./WorkGalleryShowcase";
import styles from "./WorkGallery.module.css";

export default function WorkGallery({ projects }: { projects: Project[] }) {
  return (
    <>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow} id="projects-title">
            02 — Projects
          </p>
          <h2 className={styles.heading}>Work Gallery</h2>
          <p className={styles.intro}>
            A closer look at the web and mobile systems I&apos;ve helped design, build, and refine.
          </p>
        </div>

        <Link className={styles.viewMoreButton} href="/projects">
          View More Projects
          <span className={styles.arrow} aria-hidden="true">
            ↗
          </span>
        </Link>
      </div>

      <WorkGalleryShowcase projects={projects} />
    </>
  );
}
