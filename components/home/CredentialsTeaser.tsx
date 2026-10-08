"use client";

import { useState } from "react";
import Link from "next/link";
import type { CertificateRecord } from "@/components/about/aboutData";
import CertificateModal from "./CertificateModal";
import styles from "./CredentialsTeaser.module.css";

export default function CredentialsTeaser({
  certificates,
}: {
  certificates: CertificateRecord[];
}) {
  const [activeCertificate, setActiveCertificate] = useState<CertificateRecord | null>(null);

  return (
    <>
      <div className={styles.header}>
        <p className={styles.eyebrow} id="credentials-title">05 — Certifications</p>
        <Link href="/certifications" className="ui-btn ui-btn--secondary ui-btn--sm">
          View All Certifications
        </Link>
      </div>

      <div className={styles.grid}>
        {certificates.map((certificate) => (
          <article className={styles.card} key={certificate.id}>
            <button
              type="button"
              className={styles.cardTrigger}
              onClick={() => setActiveCertificate(certificate)}
              aria-label={`View certificate: ${certificate.title}`}
            >
              <div className={styles.previewFrame}>
                <img
                  className={styles.previewImage}
                  src={certificate.previewImage ?? certificate.fileUrl}
                  alt={certificate.previewAlt}
                  loading="lazy"
                />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{certificate.title}</h3>
                <p className={styles.cardIssuer}>{certificate.issuer}</p>
                <span className={styles.viewAction}>
                  <span className="ui-btn ui-btn--secondary ui-btn--sm">View Certificate</span>
                </span>
              </div>
            </button>
          </article>
        ))}
      </div>

      <CertificateModal certificate={activeCertificate} onClose={() => setActiveCertificate(null)} />
    </>
  );
}
