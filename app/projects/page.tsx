import type { Metadata } from "next";
import { PROJECTS } from "@/components/projects/projectsData";
import ProjectCard from "@/components/projects/ProjectCard";
import styles from "@/components/projects/SelectedProjects.module.css";

export const metadata: Metadata = {
  title: "Projects | Fatima Sierra",
  description:
    "A complete collection of web and mobile projects by Fatima Sierra, spanning public safety, education, campus systems, and community platforms.",
};

export default function ProjectsPage() {
  return (
    <main>
      <section className={styles.section} aria-label="All projects">
        <div className={styles.glowOne} aria-hidden="true" />
        <div className={styles.glowTwo} aria-hidden="true" />

        <div className={styles.container}>
          <div className={styles.grid}>
            {PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
