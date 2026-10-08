"use client";

import { useEffect, useId, useRef } from "react";
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
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Keep the latest handler without re-running the open/close effect on every parent render.
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!certificate) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      // Keep keyboard focus inside the dialog.
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>("a[href], button, iframe, [tabindex]:not([tabindex='-1'])")
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      opener?.focus();
    };
  }, [certificate]);

  if (!certificate) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 id={titleId} className={styles.title}>{certificate.title}</h2>
            <p className={styles.issuer}>
              {certificate.issuer}
              {certificate.date ? ` · ${certificate.date}` : ""}
            </p>
          </div>
          <button ref={closeRef} type="button" className={styles.close} aria-label="Close certificate" onClick={onClose}>
            ×
          </button>
        </header>

        <div className={styles.body}>
          {certificate.fileType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- full-size certificate scan, shown as-is
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
