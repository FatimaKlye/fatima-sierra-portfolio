import type { ProjectDetail } from "@/data/projectDetailsData";
import ProjectChallenges from "./ProjectChallenges";
import ProjectEcosystem from "./ProjectEcosystem";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

/** Technologies grouped by purpose, plus how the system fits together and the technical problems solved. */
export default function ProjectStack({ project, number }: { project: ProjectDetail; number: string }) {
  const challenges = project.challenges ?? [];

  return (
    <section className={styles.stack} id="stack" aria-labelledby="stack-title" data-nav-label="Tech stack">
      <div className={styles.container}>
        <div className={styles.stackGrid}>
          <SectionHead id="stack-title" number={number} eyebrow="Tech stack" title="What we used" />

          <ul className={styles.stackList} data-stagger>
            {project.stack.map((group) => (
              <li key={group.label} className={styles.stackRow}>
                <span className={styles.stackLabel}>{group.label}</span>
                <span className={styles.stackItems}>
                  {group.items.map((item) => (
                    <span key={item} className={styles.stackItem}>
                      {item}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {project.ecosystem && <ProjectEcosystem ecosystem={project.ecosystem} currentSlug={project.slug} />}

        {challenges.length > 0 && <ProjectChallenges challenges={challenges} />}
      </div>
    </section>
  );
}
