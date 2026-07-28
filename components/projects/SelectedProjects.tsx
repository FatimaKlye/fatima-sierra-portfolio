import { PROJECTS } from "./projectsData";
import ProjectCard from "./ProjectCard";
import styles from "./SelectedProjects.module.css";

export default function SelectedProjects() {
  return (
    <section
      className={styles.section}
      aria-labelledby="selected-projects-heading"
    >
      <div className={styles.glowOne} aria-hidden="true" />
      <div className={styles.glowTwo} aria-hidden="true" />

      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>FEATURED PROJECTS</p>
          <h2 id="selected-projects-heading" className={styles.title}>
            Selected Digital Solutions
          </h2>
          <p className={styles.intro}>
          A curated selection of web and mobile systems designed to solve practical problems and deliver purposeful user experiences.
          </p>
        </header>

        <div className={styles.grid}>
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
