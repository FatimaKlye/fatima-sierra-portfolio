"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { RESUME_URL } from "@/components/contact/contactData";
import styles from "./ResumeModal.module.css";

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
          <div className={styles.actions}>
            {/* Many mobile browsers can't render a PDF in a frame, so the file is always one tap away. */}
            <a className="ui-btn ui-btn--primary ui-btn--sm" href={RESUME_URL} download>
              Download PDF
            </a>
            <a
              className={`ui-btn ui-btn--secondary ui-btn--sm ${styles.openLink}`}
              href={RESUME_URL}
              target="_blank"
              rel="noreferrer"
            >
              Open in new tab
            </a>
            <button
              ref={closeRef}
              type="button"
              className={styles.close}
              aria-label="Close resume preview"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </header>

        <div className={styles.body}>
          <iframe
            className={styles.pdf}
            src={RESUME_URL}
            title="Fatima Klye M. Sierra resume preview"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
