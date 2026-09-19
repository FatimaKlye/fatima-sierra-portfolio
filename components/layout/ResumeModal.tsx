"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./ResumeModal.module.css";

const RESUME_PDF_URL = "/assets/resume/Fatima-Klye-Sierra-Resume-2026.pdf";

export default function ResumeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Resume preview"
      onClick={onClose}
    >
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Resume</p>
            <h3 className={styles.title}>Fatima Klye M. Sierra</h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label="Close resume preview"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className={styles.body}>
          <iframe
            className={styles.pdf}
            src={RESUME_PDF_URL}
            title="Fatima Klye M. Sierra resume preview"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
