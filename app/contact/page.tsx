import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/app/about/AboutPage.module.css";
import PortfolioChatbot from "@/components/chatbot/PortfolioChatbot";

export const metadata: Metadata = {
  title: "Contact | Fatima Sierra",
  description:
    "Get in touch with Fatima Klye M. Sierra, a web and mobile developer open to new opportunities.",
};

export default function ContactPage() {
  return (
    <main>
      <section className={styles.section} aria-labelledby="contact-heading">
        <div className={styles.sectionContainer}>
          <header className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>GET IN TOUCH</p>
            <h1 id="contact-heading" className={styles.sectionTitle}>
              Let&apos;s build something together
            </h1>
            <span className={styles.heroStatusBadge}>
              Open to opportunities
            </span>
            <p className={styles.sectionIntro}>
              I&apos;m open to collaborations, freelance work, and new roles.
              Reach out through GitHub for now &mdash; additional contact
              details are on the way.
            </p>
          </header>

          <div className={styles.heroActions} style={{ justifyContent: "center" }}>
            <a
              className={styles.heroPrimaryButton}
              href="https://github.com/FatimaKlye"
              target="_blank"
              rel="noreferrer"
            >
              Visit GitHub
              <span aria-hidden="true">â†—</span>
            </a>

            <Link className={styles.heroSecondaryButton} href="/projects">
              See my work
            </Link>
          </div>
        </div>
      </section>
      <PortfolioChatbot />
    </main>
  );
}
