"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, Minus, Plus } from "lucide-react";
import type { CertificateRecord } from "@/components/about/aboutData";
import styles from "./CertificateModal.module.css";

const ZOOM_LEVELS = [1, 1.5, 2, 3];

/**
 * Browsers without a built-in PDF viewer (Android, older mobile browsers) download a
 * PDF instead of showing it in an iframe, so those get the rendered preview image.
 */
function canShowPdfInline() {
  return typeof navigator === "undefined" || navigator.pdfViewerEnabled !== false;
}

function fileNameFrom(url: string) {
  return decodeURIComponent(url.split("/").pop() ?? "certificate");
}

/**
 * The certificate itself plus its actions. PDFs use the browser's own viewer (zoom, scroll,
 * pages); images and PDF previews get zoom steps here, and the body scrolls to inspect.
 * Previewing never downloads: only "Download Certificate" carries the download attribute.
 */
function CertificateViewer({ certificate }: { certificate: CertificateRecord }) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = ZOOM_LEVELS[zoomIndex];
  const isMaxZoom = zoomIndex === ZOOM_LEVELS.length - 1;

  const isPdf = certificate.fileType === "pdf";
  const showPdfInline = isPdf && canShowPdfInline();
  const imageSrc = isPdf ? certificate.previewImage : certificate.fileUrl;
  const showImage = !showPdfInline && Boolean(imageSrc);

  return (
    <>
      <div className={styles.body}>
        {showPdfInline ? (
          <iframe className={styles.pdf} src={`${certificate.fileUrl}#view=FitH`} title={certificate.title} />
        ) : showImage ? (
          <div className={styles.imageCanvas} style={{ width: `${zoom * 100}%` }}>
            <button
              type="button"
              className={`${styles.imageToggle}${zoomIndex > 0 ? ` ${styles.imageToggleZoomed}` : ""}`}
              onClick={() => setZoomIndex(isMaxZoom ? 0 : zoomIndex + 1)}
              aria-label={isMaxZoom ? "Reset zoom" : "Zoom in"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- full-size certificate scan, shown as-is */}
              <img className={styles.image} src={imageSrc} alt={certificate.previewAlt} draggable={false} />
            </button>
          </div>
        ) : (
          <p className={styles.fallback}>
            This browser can&apos;t preview PDFs here. Use <strong>Open in a New Tab</strong> to view the certificate.
          </p>
        )}
      </div>

      <div className={styles.footer}>
        {showImage && (
          <div className={styles.zoomControls} role="group" aria-label="Zoom">
            <button
              type="button"
              className={styles.zoomButton}
              onClick={() => setZoomIndex(zoomIndex - 1)}
              disabled={zoomIndex === 0}
              aria-label="Zoom out"
            >
              <Minus size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.zoomValue}
              onClick={() => setZoomIndex(0)}
              disabled={zoomIndex === 0}
              aria-label={`Zoom ${Math.round(zoom * 100)}%, reset to fit`}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className={styles.zoomButton}
              onClick={() => setZoomIndex(zoomIndex + 1)}
              disabled={isMaxZoom}
              aria-label="Zoom in"
            >
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        )}

        <div className={styles.actions}>
          <a
            className="ui-btn ui-btn--secondary ui-btn--sm"
            href={certificate.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={15} aria-hidden="true" />
            Open in a New Tab
          </a>
          <a
            className="ui-btn ui-btn--primary ui-btn--sm"
            href={certificate.fileUrl}
            download={fileNameFrom(certificate.fileUrl)}
          >
            <Download size={15} aria-hidden="true" />
            Download Certificate
          </a>
        </div>
      </div>
    </>
  );
}

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
          dialogRef.current.querySelectorAll<HTMLElement>(
            "a[href], button:not(:disabled), iframe, [tabindex]:not([tabindex='-1'])"
          )
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

        {/* Keyed so zoom resets when a different certificate opens. */}
        <CertificateViewer key={certificate.id} certificate={certificate} />
      </div>
    </div>,
    document.body,
  );
}
