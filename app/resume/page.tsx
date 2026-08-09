import type { Metadata } from "next";
import styles from "@/app/about/AboutPage.module.css";

export const metadata: Metadata = {
  title: "Resume | Fatima Sierra",
  description:
    "Download the resume of Fatima Klye M. Sierra, a web and mobile developer building purposeful, reliable digital solutions.",
};

export default function ResumePage() {
  return (
    <main>
      <section className={styles.section} aria-labelledby="resume-heading">
        <div className={styles.sectionContainer}>
          <header className={styles.sectionHeader} style={{ marginBottom: 0 }}>
            <p className={styles.sectionEyebrow}>RESUME</p>
            <h1 id="resume-heading" className={styles.sectionTitle}>
              Fatima Klye M. Sierra
            </h1>
            <p className={styles.sectionIntro}>
              A summary of my experience, skills, and education as a web and
              mobile developer. Download the full resume for the complete
              picture.
            </p>
          </header>
        </div>
      </section>
    </main>
  );
}
