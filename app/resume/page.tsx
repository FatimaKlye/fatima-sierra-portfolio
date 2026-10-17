import type { Metadata } from "next";
import Link from "next/link";
import { RESUME_URL } from "@/components/contact/contactData";
import styles from "./Resume.module.css";

export const metadata: Metadata = {
  title: "Resume | Fatima Sierra",
  description:
    "Resume of Fatima Klye M. Sierra — web and mobile developer working with Next.js, React, TypeScript, Flutter and Supabase.",
};

export default function ResumePage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Resume</p>
            <h1 className={styles.title}>Fatima Klye M. Sierra</h1>
            <p className={styles.intro}>
              Web &amp; mobile developer — experience, projects, skills and education on one page.
            </p>
          </div>
          <div className={styles.actions}>
            <a className="ui-btn ui-btn--primary" href={RESUME_URL} download>
              Download PDF
            </a>
            <a className="ui-btn ui-btn--secondary" href={RESUME_URL} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          </div>
        </header>

        <div className={styles.viewer}>
          <iframe className={styles.pdf} src={RESUME_URL} title="Fatima Klye M. Sierra resume" />
        </div>

        <p className={styles.note}>
          Preview not showing? Use <strong>Download PDF</strong> above, or{" "}
          <Link href="/contact">get in touch</Link> and I&apos;ll send it over.
        </p>
      </div>
    </main>
  );
}
