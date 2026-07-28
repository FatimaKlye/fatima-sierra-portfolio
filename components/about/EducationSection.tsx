import { EDUCATION, EDUCATION_CONTENT } from "./aboutData";
import styles from "@/app/about/AboutPage.module.css";

export default function EducationSection() {
  return (
    <section className={styles.section} aria-labelledby="education-heading">
      <div className={styles.sectionContainer}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>{EDUCATION_CONTENT.eyebrow}</p>
          <h2 id="education-heading" className={styles.sectionTitle}>
            {EDUCATION_CONTENT.title}
          </h2>
          <p className={styles.sectionIntro}>{EDUCATION_CONTENT.intro}</p>
        </header>

        <ol className={styles.educationTimeline}>
          {EDUCATION.map((entry) => (
            <li key={`${entry.institution}-${entry.years}`} className={styles.educationItem}>
              <span className={styles.educationDot} aria-hidden="true" />
              <div className={styles.educationBody}>
                <p className={styles.educationInstitution}>{entry.institution}</p>
                {entry.detail && (
                  <p className={styles.educationDetail}>{entry.detail}</p>
                )}
                <p className={styles.educationMeta}>
                  {entry.location} · {entry.years}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
