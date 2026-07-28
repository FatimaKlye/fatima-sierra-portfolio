import { LEADERSHIP, LEADERSHIP_CONTENT } from "./aboutData";
import styles from "@/app/about/AboutPage.module.css";

export default function LeadershipSection() {
  const visibleRoles = LEADERSHIP.filter((role) => !role.hidden);

  return (
    <section className={styles.section} aria-labelledby="leadership-heading">
      <div className={styles.sectionContainer}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>{LEADERSHIP_CONTENT.eyebrow}</p>
          <h2 id="leadership-heading" className={styles.sectionTitle}>
            {LEADERSHIP_CONTENT.title}
          </h2>
          <p className={styles.sectionIntro}>{LEADERSHIP_CONTENT.intro}</p>
        </header>

        <div className={styles.recordGrid}>
          {visibleRoles.map((role) => (
            <article
              key={`${role.organization}-${role.role}`}
              className={styles.recordCard}
            >
              <p className={styles.recordInstitution}>{role.organization}</p>
              <p className={styles.recordTitle}>{role.role}</p>
              <p className={styles.recordYears}>{role.years}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
