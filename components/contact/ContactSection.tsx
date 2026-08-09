import type { CSSProperties } from "react";
import { SOCIAL_LINKS } from "./contactData";
import styles from "./ContactSection.module.css";

export default function ContactSection() {
  return (
    <section className={styles.section} aria-labelledby="contact-heading">
      <div className={styles.banner}>
        <span className={styles.bannerDot} aria-hidden="true" />
        <p className={styles.bannerText}>
          <strong>Open to Internships &amp; Roles</strong>
          <span className={styles.bannerDivider} aria-hidden="true">
            &middot;
          </span>
          Available Immediately
        </p>
      </div>

      <div className={styles.glowOne} aria-hidden="true" />
      <div className={styles.glowTwo} aria-hidden="true" />

      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>GET IN TOUCH</p>
          <h2 id="contact-heading" className={styles.title}>
            Have a role, project, or opportunity in mind?
          </h2>
          <p className={styles.intro}>
            I&apos;m actively interviewing for internship and entry-level
            developer roles, and open to freelance builds. If you need
            someone who ships fast, communicates clearly, and sweats the
            details, let&apos;s talk &mdash; today.
          </p>

          <div className={styles.trustBadge}>
            <span className={styles.trustIcon} aria-hidden="true">
              ⚡
            </span>
            I respond to every inquiry within 24 hours.
          </div>

          <div className={styles.ctaRow}>
            <a
              className={styles.primaryButton}
              href="https://mail.google.com/mail/?view=cm&fs=1&to=fatimaklyesierra081005@gmail.com"
              target="_blank"
              rel="noreferrer"
            >
              Email Me Directly
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </header>

        <div
          className={styles.socialGrid}
          role="group"
          aria-label="Social and contact links"
        >
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.id}
              className={`${styles.socialButton} ${styles[social.id]}`}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${social.label}: ${social.handle} (opens in a new tab)`}
            >
              <span
                className={styles.socialIcon}
                style={{ "--icon": `url(${social.icon})` } as CSSProperties}
                aria-hidden="true"
              />
              <span className={styles.socialLabel}>
                <span className={styles.socialPlatform}>{social.label}</span>
                <span className={styles.socialHandle}>{social.handle}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
