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
        <p className={styles.eyebrow} id="credentials-title">06 — Certifications</p>
        <Link href="/credentials" className={styles.viewAllLink}>
          ALL CERTIFICATIONS
          <span aria-hidden="true">→</span>
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
                <span className={styles.viewLink}>
                  VIEW CERTIFICATE
                  <span aria-hidden="true">→</span>
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
