import { REFERENCES, REFERENCES_CONTENT } from "./aboutData";
import styles from "@/app/about/AboutPage.module.css";

export default function ReferencesSection() {
  return (
    <section className={styles.section} aria-labelledby="references-heading">
      <div className={styles.sectionContainer}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>{REFERENCES_CONTENT.eyebrow}</p>
          <h2 id="references-heading" className={styles.sectionTitle}>
            {REFERENCES_CONTENT.title}
          </h2>
          <p className={styles.sectionIntro}>{REFERENCES_CONTENT.intro}</p>
        </header>

        {REFERENCES.length === 0 ? (
          <div className={styles.referencesFallback}>
            <p>{REFERENCES_CONTENT.fallbackMessage}</p>
          </div>
        ) : (
          <div className={styles.recordGrid}>
            {REFERENCES.map((reference) => (
              <article key={reference.name} className={styles.recordCard}>
                <p className={styles.recordInstitution}>{reference.name}</p>
                <p className={styles.recordTitle}>{reference.title}</p>
                <p className={styles.recordYears}>{reference.organization}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
