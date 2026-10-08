import type { ProjectDetail } from "@/data/projectDetailsData";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

export default function ProjectOverview({ project, number }: { project: ProjectDetail; number: string }) {
  const { overview } = project;
  const rows = [
    { label: "Purpose", text: overview.purpose },
    { label: "Who it's for", text: overview.audience },
    { label: "What it solves", text: overview.solves },
  ].filter((row): row is { label: string; text: string } => Boolean(row.text));

  return (
    <section className={styles.overview} aria-labelledby="overview-title">
      <div className={`${styles.container} ${styles.overviewGrid}`}>
        <div className={styles.overviewLead}>
          <SectionHead id="overview-title" number={number} eyebrow="Overview" title="The project in brief" />
          <p className={styles.lead} data-reveal>
            {overview.what}
          </p>
        </div>

        {rows.length > 0 && (
          <dl className={styles.overviewList} data-stagger>
            {rows.map((row) => (
              <div key={row.label} className={styles.overviewRow}>
                <dt>{row.label}</dt>
                <dd>{row.text}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
