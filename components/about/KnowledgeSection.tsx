import {
  CORE_KNOWLEDGE,
  KNOWLEDGE_CONTENT,
  LEARNING_EXPOSURE,
  PROFESSIONAL_SKILLS,
} from "./aboutData";
import styles from "@/app/about/AboutPage.module.css";

export default function KnowledgeSection() {
  return (
    <section className={styles.section} aria-labelledby="knowledge-heading">
      <div className={styles.sectionContainer}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>{KNOWLEDGE_CONTENT.eyebrow}</p>
          <h2 id="knowledge-heading" className={styles.sectionTitle}>
            {KNOWLEDGE_CONTENT.title}
          </h2>
          <p className={styles.sectionIntro}>{KNOWLEDGE_CONTENT.intro}</p>
        </header>

        <div className={styles.knowledgeGrid}>
          {CORE_KNOWLEDGE.map((item) => (
            <article key={item.title} className={styles.knowledgeCard}>
              <h3 className={styles.knowledgeCardTitle}>{item.title}</h3>
              <p className={styles.knowledgeCardDesc}>{item.description}</p>
            </article>
          ))}
        </div>

        <div className={styles.knowledgeSubBlock}>
          <h3 className={styles.knowledgeSubheading}>
            Additional Technical Learning Exposure
          </h3>
          <p className={styles.knowledgeSubnote}>
            Areas I have been introduced to through training and coursework,
            shown separately from my core practical skills above.
          </p>
          <ul className={styles.learningTagList}>
            {LEARNING_EXPOSURE.map((item) => (
              <li key={item} className={styles.learningTag}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.knowledgeSubBlock}>
          <h3 className={styles.knowledgeSubheading}>
            Professional Skills
          </h3>
          <ul className={styles.skillsList}>
            {PROFESSIONAL_SKILLS.map((skill) => (
              <li key={skill} className={styles.skillItem}>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
