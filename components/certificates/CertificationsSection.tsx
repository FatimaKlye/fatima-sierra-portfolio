import Link from "next/link";
import { CERTIFICATES } from "./certificatesData";
import styles from "./CertificationsSection.module.css";

export default function CertificationsSection() {
  return (
    <section
      className={styles.section}
      aria-labelledby="certifications-heading"
    >
      <div className={styles.glowOne} aria-hidden="true" />
      <div className={styles.glowTwo} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.layout}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>PROFESSIONAL DEVELOPMENT</p>
            <h2 id="certifications-heading" className={styles.title}>
              Certifications &amp; Credentials
            </h2>
            <p className={styles.intro}>
              Verified credentials that demonstrate my continued development
              in web technologies, databases, and software development.
            </p>

            <div className={styles.viewAllRow}>
              <Link href="/credentials" className={styles.viewAllButton}>
                View All Credentials
                <span className={styles.linkArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </header>

          <div className={styles.grid}>
            {CERTIFICATES.map((certificate) => (
              <article key={certificate.id} className={styles.card}>
                <span className={styles.cardGlow} aria-hidden="true" />

                <div className={styles.previewFrame}>
                  <img
                    className={styles.preview}
                    src={certificate.previewImage}
                    alt={certificate.previewAlt}
                    loading="lazy"
                  />
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{certificate.title}</h3>
                  <p className={styles.credentialName}>
                    {certificate.credentialName}
                  </p>

                  <dl className={styles.metaList}>
                    <div className={styles.metaRow}>
                      <dt>Issuer</dt>
                      <dd>{certificate.issuer}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Date Awarded</dt>
                      <dd>{certificate.dateAwarded}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Credential ID</dt>
                      <dd>{certificate.credentialId}</dd>
                    </div>
                  </dl>

                  <a
                    className={styles.certificateLink}
                    href={certificate.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View credential for ${certificate.title} (opens PDF in a new tab)`}
                  >
                    View Credential
                    <span className={styles.linkArrow} aria-hidden="true">
                      →
                    </span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
