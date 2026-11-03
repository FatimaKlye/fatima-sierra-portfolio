"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { CERTIFICATE_FILTERS, type CertificateCategory } from "@/components/about/aboutData";
import type { ExhibitCertificate } from "./beyondData";
import styles from "./Beyond.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

type Filter = "all" | CertificateCategory;

/**
 * Every certificate on one sheet, filterable by kind, each at its true proportions. Selecting one
 * opens the shared certificate viewer on top; this sheet stays open underneath, so Escape and
 * focus belong to the viewer until it closes.
 */
export default function CertificateArchive({
  open,
  certificates,
  viewerOpen,
  onClose,
  onOpenCertificate,
}: {
  open: boolean;
  certificates: ExhibitCertificate[];
  viewerOpen: boolean;
  onClose: () => void;
  onOpenCertificate: (certificate: ExhibitCertificate) => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus in on open, and back to the opener on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => opener?.focus();
  }, [open]);

  // Escape, the focus trap and the scroll lock step aside while the viewer is on top
  // (the viewer clears the lock when it closes, so it is re-applied here).
  useEffect(() => {
    if (!open || viewerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not(:disabled), [tabindex]:not([tabindex='-1'])"),
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
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, viewerOpen]);

  if (!open) return null;

  const countFor = (id: Filter) =>
    id === "all" ? certificates.length : certificates.filter((certificate) => certificate.category === id).length;
  const shown = certificates
    .map((certificate, index) => ({ certificate, number: index + 1 }))
    .filter(({ certificate }) => filter === "all" || certificate.category === filter);

  return createPortal(
    <div className={styles.archiveOverlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.archive}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.archiveHead}>
          <div>
            <p className={styles.archiveKicker}>The archive</p>
            <h2 id={titleId} className={styles.archiveTitle}>
              All certifications <span>{pad(certificates.length)}</span>
            </h2>
          </div>
          <button ref={closeRef} type="button" className={styles.archiveClose} onClick={onClose} aria-label="Close the archive">
            <X size={18} strokeWidth={1.75} />
          </button>
        </header>

        <div className={styles.archiveFilters} role="group" aria-label="Filter certificates">
          {CERTIFICATE_FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={styles.archiveFilter}
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
              <span>{pad(countFor(option.id))}</span>
            </button>
          ))}
        </div>

        <div className={styles.archiveBody}>
          <ol key={filter} className={styles.archiveGrid}>
            {shown.map(({ certificate, number }, index) => (
              <li key={certificate.id} style={{ "--i": index } as CSSProperties}>
                <button
                  type="button"
                  className={styles.archiveItem}
                  onClick={() => onOpenCertificate(certificate)}
                  aria-label={`View full certificate: ${certificate.title}`}
                >
                  <span className={styles.archiveImage} style={{ "--r": certificate.width / certificate.height } as CSSProperties}>
                    <Image
                      src={certificate.image}
                      alt={certificate.previewAlt}
                      fill
                      sizes="(max-width: 640px) 92vw, (max-width: 1000px) 46vw, 360px"
                    />
                  </span>
                  <span className={styles.archiveLabel}>
                    <span className={styles.archiveNumber} aria-hidden="true">
                      {pad(number)}
                    </span>
                    <span>
                      <span className={styles.archiveItemTitle}>{certificate.title}</span>
                      <span className={styles.archiveItemMeta}>
                        {certificate.issuer}
                        {certificate.date ? ` · ${certificate.date}` : ""}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <footer className={styles.archiveFoot}>
          <p>Select a certificate to see it at full size, with the original file one tap away.</p>
          <Link className="ui-btn ui-btn--secondary ui-btn--sm" href="/certifications">
            Open the certifications page
            <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
