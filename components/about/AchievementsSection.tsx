import { ACHIEVEMENTS, ACHIEVEMENTS_CONTENT } from "./aboutData";
import styles from "@/app/about/AboutPage.module.css";

export default function AchievementsSection() {
  return (
    <section className={styles.section} aria-labelledby="achievements-heading">
      <div className={styles.sectionContainer}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>{ACHIEVEMENTS_CONTENT.eyebrow}</p>
          <h2 id="achievements-heading" className={styles.sectionTitle}>
            {ACHIEVEMENTS_CONTENT.title}
          </h2>
          <p className={styles.sectionIntro}>{ACHIEVEMENTS_CONTENT.intro}</p>
        </header>

        <div className={styles.recordGrid}>
          {ACHIEVEMENTS.map((achievement) => (
            <article
              key={`${achievement.institution}-${achievement.title}`}
              className={styles.recordCard}
            >
              <p className={styles.recordInstitution}>{achievement.institution}</p>
              <p className={styles.recordTitle}>{achievement.title}</p>
              <p className={styles.recordYears}>{achievement.years}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
