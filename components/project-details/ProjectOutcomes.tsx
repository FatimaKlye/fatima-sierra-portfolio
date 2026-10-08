import { Check } from "lucide-react";
import type { ProjectDetail } from "@/data/projectDetailsData";
import ProjectLinks from "./ProjectLinks";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

export default function ProjectOutcomes({ project, number }: { project: ProjectDetail; number: string }) {
  const outcomes = project.outcomes ?? [];
  const stats = outcomes.filter((outcome) => outcome.stat);
  const statements = outcomes.filter((outcome) => !outcome.stat);
  const hasLinks = Boolean(
    project.links.liveUrl || project.links.videoUrl || project.links.repoUrl || project.links.apkUrl
  );

  return (
    <section className={styles.outcomes} aria-labelledby="outcomes-title">
      <div className={styles.container}>
        <SectionHead id="outcomes-title" number={number} eyebrow="Outcomes" title="Where it landed" tone="onDark" />

        {stats.length > 0 && (
          <ul className={styles.stats} data-stagger>
            {stats.map((outcome) => (
              <li key={outcome.label} className={styles.stat}>
                <span className={styles.statValue}>{outcome.stat}</span>
                <span className={styles.statLabel}>{outcome.label}</span>
                {outcome.detail && <span className={styles.statDetail}>{outcome.detail}</span>}
              </li>
            ))}
          </ul>
        )}

        {statements.length > 0 && (
          <ul className={styles.statements} data-stagger>
            {statements.map((outcome) => (
              <li key={outcome.label}>
                <span className={styles.statementIcon} aria-hidden="true">
                  <Check size={18} />
                </span>
                <span>{outcome.label}</span>
              </li>
            ))}
          </ul>
        )}

        {hasLinks && (
          <div className={styles.outcomeLinks} data-reveal>
            <p className={styles.outcomeLinksLabel}>Explore the project</p>
            <ProjectLinks links={project.links} tone="onDark" apkSize={project.download?.size} />
          </div>
        )}
      </div>
    </section>
  );
}
