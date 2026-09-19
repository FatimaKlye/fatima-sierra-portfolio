"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { CertificateRecord } from "@/components/about/aboutData";
import styles from "./CertificateModal.module.css";

export default function CertificateModal({
  certificate,
  onClose,
}: {
  certificate: CertificateRecord | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!certificate) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [certificate, onClose]);

  if (!certificate) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={certificate.title}
      onClick={onClose}
    >
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <h3 className={styles.title}>{certificate.title}</h3>
            <p className={styles.issuer}>{certificate.issuer}</p>
          </div>
          <button type="button" className={styles.close} aria-label="Close certificate" onClick={onClose}>
            ×
          </button>
        </header>

        <div className={styles.body}>
          {certificate.fileType === "image" ? (
            <img className={styles.image} src={certificate.fileUrl} alt={certificate.previewAlt} />
          ) : (
            <iframe className={styles.pdf} src={certificate.fileUrl} title={certificate.title} />
          )}
        </div>

        <a
          className={styles.newTabLink}
          href={certificate.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in a new tab
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>,
    document.body,
  );
}
