import type { ProjectDetail } from "@/data/projectDetailsData";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

export default function ProjectRole({ project, number }: { project: ProjectDetail; number: string }) {
  const contributions = project.contributions ?? [];
  const context = [project.organization, project.period].filter(Boolean).join(" · ");

  return (
    <section className={styles.role} id="role" aria-labelledby="role-title" data-nav-label="My role">
      <div className={`${styles.container} ${styles.roleGrid}`}>
        <div className={styles.roleLead}>
          <SectionHead id="role-title" number={number} eyebrow="My contribution" title="What I did on this project" />

          {(project.role || context) && (
            <div className={styles.roleCard} data-reveal>
              {project.role && <p className={styles.roleName}>{project.role}</p>}
              {context && <p className={styles.roleContext}>{context}</p>}
            </div>
          )}
        </div>

        <ol className={styles.roleList} data-stagger>
          {contributions.map((item, itemIndex) => (
            <li key={item} className={styles.roleItem}>
              <span className={styles.roleNum} aria-hidden="true">
                {pad(itemIndex + 1)}
              </span>
              <p>{item}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
