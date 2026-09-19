import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/components/projects/projectsData";
import styles from "./WorkGallery.module.css";

type WorkGalleryProps = {
  projects: Project[];
  heading?: "h1" | "h2";
  eyebrow?: string;
  title?: string;
  intro?: string;
};

function ProjectHeading({
  level,
  children,
}: {
  level: "h1" | "h2";
  children: React.ReactNode;
}) {
  return level === "h1" ? (
    <h1 className={styles.heading}>{children}</h1>
  ) : (
    <h2 className={styles.heading}>{children}</h2>
  );
}

export default function WorkGallery({
  projects,
  heading = "h2",
  eyebrow = "01 — Selected projects",
  title = "Systems built for real people.",
  intro = "A closer look at the web and mobile systems I've helped design, build, and refine. Each project starts with a practical need and ends with a clearer way to get something done.",
}: WorkGalleryProps) {
  return (
    <div className={`${styles.workGallery} w-full`}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <ProjectHeading level={heading}>{title}</ProjectHeading>
          <p className={styles.intro}>{intro}</p>
          <p className={styles.countLine}>
            <span>{String(projects.length).padStart(2, "0")} selected projects</span>
            <span aria-hidden="true">/</span>
            <span>Web · mobile · data-backed systems</span>
          </p>
        </div>

        <Link className={styles.viewMoreButton} href={heading === "h1" ? "/#projects" : "/projects"}>
          {heading === "h1" ? "Back to Home" : "View All Projects"}
          <span className={styles.arrow} aria-hidden="true">↗</span>
        </Link>
      </header>

      <div className={styles.projectList}>
        {projects.map((project, index) => {
          const image = project.screenshots?.[0] ?? {
            src: project.image,
            alt: project.imageAlt,
          };

          return (
            <article className={styles.projectRow} key={project.id}>
              <div className={styles.projectMedia}>
                <Link
                  href={`/projects/${project.slug}`}
                  className={styles.projectMediaLink}
                  aria-label={`Open case study for ${project.title}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 700px) 100vw, 60vw"
                    className={styles.projectImage}
                    priority={index === 0}
                  />
                </Link>
              </div>

              <div className={styles.projectCopy}>
                <div className={styles.projectTopline}>
                  <span className={styles.projectNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.projectCategory}>{project.category}</span>
                </div>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDescription}>{project.description}</p>

                <ul className={styles.techList} aria-label={`${project.title} technologies`}>
                  {project.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>

                <Link className={styles.projectLink} href={`/projects/${project.slug}`}>
                  Read case study
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
