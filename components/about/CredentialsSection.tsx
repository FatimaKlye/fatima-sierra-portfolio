"use client";

import { useMemo, useState } from "react";
import {
  CERTIFICATES,
  CERTIFICATE_FILTERS,
  CREDENTIALS_CONTENT,
  type CertificateCategory,
  type CertificateRecord,
} from "./aboutData";
import styles from "@/app/about/AboutPage.module.css";

const INITIAL_LEARNING_RECORD_COUNT = 6;

function CertificatePreview({ record }: { record: CertificateRecord }) {
  const imageSrc =
    record.fileType === "image" ? record.fileUrl : record.previewImage;

  if (!imageSrc) {
    return null;
  }

  return (
    <div className={styles.certPreviewFrame}>
      <img
        className={styles.certPreviewImage}
        src={imageSrc}
        alt={record.previewAlt}
        loading="lazy"
      />
    </div>
  );
}

function CertificateCard({ record }: { record: CertificateRecord }) {
  return (
    <article className={styles.certCard}>
      <CertificatePreview record={record} />

      <div className={styles.certBody}>
        <h3 className={styles.certTitle}>{record.title}</h3>
        <p className={styles.certType}>{record.type}</p>

        <dl className={styles.certMetaList}>
          <div className={styles.certMetaRow}>
            <dt>Issuer</dt>
            <dd>{record.issuer}</dd>
          </div>
          {record.date && (
            <div className={styles.certMetaRow}>
              <dt>Date</dt>
              <dd>{record.date}</dd>
            </div>
          )}
          {record.credentialId && (
            <div className={styles.certMetaRow}>
              <dt>Credential ID</dt>
              <dd>{record.credentialId}</dd>
            </div>
          )}
          {record.controlNumber && (
            <div className={styles.certMetaRow}>
              <dt>Control No.</dt>
              <dd>{record.controlNumber}</dd>
            </div>
          )}
          {record.certificateNumber && (
            <div className={styles.certMetaRow}>
              <dt>Certificate No.</dt>
              <dd>{record.certificateNumber}</dd>
            </div>
          )}
          {record.expiration && (
            <div className={styles.certMetaRow}>
              <dt>Expiration</dt>
              <dd>{record.expiration}</dd>
            </div>
          )}
          {record.location && (
            <div className={styles.certMetaRow}>
              <dt>Location</dt>
              <dd>{record.location}</dd>
            </div>
          )}
          {record.platform && (
            <div className={styles.certMetaRow}>
              <dt>Platform</dt>
              <dd>{record.platform}</dd>
            </div>
          )}
          {record.duration && (
            <div className={styles.certMetaRow}>
              <dt>Duration</dt>
              <dd>{record.duration}</dd>
            </div>
          )}
          {record.focus && (
            <div className={styles.certMetaRow}>
              <dt>Focus</dt>
              <dd>{record.focus}</dd>
            </div>
          )}
        </dl>

        <a
          className={styles.certLink}
          href={record.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View credential for ${record.title} (opens in a new tab)`}
        >
          View Credential
          <span className={styles.linkArrow} aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </article>
  );
}

export default function CredentialsSection() {
  const [activeFilter, setActiveFilter] = useState<"all" | CertificateCategory>(
    "all",
  );
  const [expanded, setExpanded] = useState(false);

  const featured = useMemo(
    () => CERTIFICATES.filter((cert) => cert.category === "professional"),
    [],
  );

  const learningRecords = useMemo(
    () => CERTIFICATES.filter((cert) => cert.category !== "professional"),
    [],
  );

  const filteredFeatured =
    activeFilter === "all" || activeFilter === "professional" ? featured : [];

  const filteredLearning =
    activeFilter === "all"
      ? learningRecords
      : learningRecords.filter((cert) => cert.category === activeFilter);

  const isCollapsible = activeFilter === "all";
  const visibleLearning =
    isCollapsible && !expanded
      ? filteredLearning.slice(0, INITIAL_LEARNING_RECORD_COUNT)
      : filteredLearning;

  const canToggle = isCollapsible && filteredLearning.length > INITIAL_LEARNING_RECORD_COUNT;

  return (
    <section className={styles.section} aria-labelledby="credentials-heading">
      <div className={styles.sectionContainer}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>{CREDENTIALS_CONTENT.eyebrow}</p>
          <h2 id="credentials-heading" className={styles.sectionTitle}>
            {CREDENTIALS_CONTENT.title}
          </h2>
          <p className={styles.sectionIntro}>{CREDENTIALS_CONTENT.intro}</p>
        </header>

        <div className={styles.filterRow} role="group" aria-label="Filter credentials">
          {CERTIFICATE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`${styles.filterButton}${
                activeFilter === filter.id ? ` ${styles.filterButtonActive}` : ""
              }`}
              aria-pressed={activeFilter === filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setExpanded(false);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {filteredFeatured.length > 0 && (
          <div className={styles.featuredGrid}>
            {filteredFeatured.map((record) => (
              <CertificateCard key={record.id} record={record} />
            ))}
          </div>
        )}

        {visibleLearning.length > 0 && (
          <div className={styles.certGrid}>
            {visibleLearning.map((record) => (
              <CertificateCard key={record.id} record={record} />
            ))}
          </div>
        )}

        {canToggle && (
          <div className={styles.viewAllRow}>
            <button
              type="button"
              className={styles.viewAllButton}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Show Fewer" : "View All Credentials"}
              <span className={styles.linkArrow} aria-hidden="true">
                →
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
