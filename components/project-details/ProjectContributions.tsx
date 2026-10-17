import type { ProjectDetail } from "@/data/projectDetailsData";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/** My own work on the project, kept apart from what the product does (Key features). */
export default function ProjectContributions({ project, number }: { project: ProjectDetail; number: string }) {
  const contributions = project.contributions ?? [];
  const roles = project.roles ?? (project.role ? [project.role] : []);
  const context = [project.organization, project.period].filter(Boolean).join(" · ");

  return (
    <section
      className={styles.contrib}
      id="contributions"
      aria-labelledby="contributions-title"
      data-nav-label="My contributions"
    >
      <div className={`${styles.container} ${styles.contribGrid}`}>
        <div className={styles.contribLead}>
          <SectionHead
            id="contributions-title"
            number={number}
            eyebrow="My contributions"
            title="What I personally did"
            tone="onDark"
          />

          {roles.length > 0 && (
            <div className={styles.contribRole} data-reveal>
              <p className={styles.contribLabel}>My role</p>
              <p className={styles.contribRoleName}>
                {roles.map((role) => (
                  <span key={role}>{role}</span>
                ))}
              </p>
              {context && <p className={styles.contribRoleContext}>{context}</p>}
            </div>
          )}

          <p className={styles.contribNote} data-reveal>
            {project.teamNote ?? "Only my own work is listed here."} What the team built together is described under
            Solution.
          </p>

          {project.teamRole && (
            <p className={styles.contribTeamRole} data-reveal>
              <span className={styles.contribLabel}>Team role · organizational</span>
              {project.teamRole}
            </p>
          )}
        </div>

        <ol className={styles.contribList} data-stagger>
          {contributions.map((item, itemIndex) => (
            <li key={item.text} className={styles.contribItem}>
              <span className={styles.contribNum} aria-hidden="true">
                {pad(itemIndex + 1)}
              </span>
              <div className={styles.contribBody}>
                <span className={styles.contribArea}>{item.area}</span>
                <p className={styles.contribText}>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
