import type { ProjectStackGroup } from "@/data/projectDetailsData";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

export default function ProjectStack({ stack, number }: { stack: ProjectStackGroup[]; number: string }) {
  return (
    <section className={styles.stack} id="stack" aria-labelledby="stack-title" data-nav-label="Tech stack">
      <div className={`${styles.container} ${styles.stackGrid}`}>
        <SectionHead id="stack-title" number={number} eyebrow="Technology stack" title="Built with" />

        <ul className={styles.stackList} data-stagger>
          {stack.map((group) => (
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
    </section>
  );
}
