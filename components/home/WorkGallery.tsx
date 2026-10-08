import type { Project } from "@/components/projects/projectsData";
import ProjectShowcaseCarousel from "./ProjectShowcaseCarousel";
import styles from "./WorkGallery.module.css";

type WorkGalleryProps = {
  projects: Project[];
  eyebrow?: string;
  title?: string;
  intro?: string;
};

export default function WorkGallery({
  projects,
  eyebrow = "01 — Selected projects",
  title = "Systems built for real people.",
  intro = "A closer look at the web and mobile systems I've helped design, build, and refine. Each project starts with a practical need and ends with a clearer way to get something done.",
}: WorkGalleryProps) {
  return (
    <div className={`${styles.workGallery} w-full`}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 className={styles.heading}>{title}</h2>
          <p className={styles.intro}>{intro}</p>
          <p className={styles.countLine}>
            <span>{String(projects.length).padStart(2, "0")} selected projects</span>
            <span aria-hidden="true">/</span>
            <span>Web · mobile · data-backed systems</span>
          </p>
        </div>

        <a className={styles.viewMoreButton} href="#project-carousel">
          View All Projects
          <span className={styles.arrow} aria-hidden="true">↗</span>
        </a>
      </header>

      <div id="project-carousel">
        <ProjectShowcaseCarousel projects={projects} />
      </div>
    </div>
  );
}
