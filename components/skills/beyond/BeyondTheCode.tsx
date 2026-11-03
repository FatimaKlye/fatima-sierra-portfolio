"use client";

import { useCallback, useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import CertificateModal from "@/components/home/CertificateModal";
import type { CertificateRecord } from "@/components/about/aboutData";
import CertificateArchive from "./CertificateArchive";
import CertificateExhibition from "./CertificateExhibition";
import LearningIndex, { topicId } from "./LearningIndex";
import SkillsTypeset from "./SkillsTypeset";
import { EXHIBIT_CERTIFICATES, EXPOSURE_TOPICS, SKILL_NOTES_LIST } from "./beyondData";
import styles from "./Beyond.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/** The same head opens each chapter, so the three read as one sequence. */
function ChapterHead({
  id,
  numeral,
  title,
  lede,
  aside,
}: {
  id: string;
  numeral: string;
  title: string;
  lede: string;
  aside: ReactNode;
}) {
  return (
    <header className={styles.chapterHead} data-reveal>
      <span className={styles.chapterNumeral} aria-hidden="true">
        {numeral}
      </span>
      <div className={styles.chapterText}>
        <h3 id={id} className={styles.chapterTitle}>
          {title}
        </h3>
        <p className={styles.chapterLede}>{lede}</p>
      </div>
      <div className={styles.chapterAside}>{aside}</div>
    </header>
  );
}

/**
 * "Beyond the code": certificates as the evidence, the topics they introduced, and how I work
 * with people. One certificate viewer and one archive serve all three chapters, so a topic can
 * open its certificate and a certificate can point back to its topic.
 */
export default function BeyondTheCode() {
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const showTopic = useCallback((title: string) => {
    setOpenTopic(title);
    window.requestAnimationFrame(() => {
      const row = document.getElementById(topicId(title));
      if (!row) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      row.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      document.getElementById(`${topicId(title)}-button`)?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <div className={styles.beyond}>
      <section className={styles.chapter} aria-labelledby="beyond-certifications">
        <ChapterHead
          id="beyond-certifications"
          numeral="3.1"
          title="Certifications"
          lede="Evidence of structured learning."
          aside={
            <button type="button" className="ui-btn ui-btn--secondary ui-btn--sm" onClick={() => setArchiveOpen(true)} data-magnetic>
              View all certifications
              <span className={styles.chapterCount}>{pad(EXHIBIT_CERTIFICATES.length)}</span>
              <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
            </button>
          }
        />
        <CertificateExhibition certificates={EXHIBIT_CERTIFICATES} onOpen={setCertificate} onShowTopic={showTopic} />
      </section>

      <section className={styles.chapter} aria-labelledby="beyond-exposure">
        <ChapterHead
          id="beyond-exposure"
          numeral="3.2"
          title="Technical exposure"
          lede="Topics and technologies I've explored."
          aside={<p className={styles.chapterMeta}>{pad(EXPOSURE_TOPICS.length)} topics</p>}
        />
        <LearningIndex
          topics={EXPOSURE_TOPICS}
          openTopic={openTopic}
          onToggle={setOpenTopic}
          onOpenCertificate={setCertificate}
        />
      </section>

      <section className={styles.chapter} aria-labelledby="beyond-skills">
        <ChapterHead
          id="beyond-skills"
          numeral="3.3"
          title="Professional skills"
          lede="How I approach teamwork, communication and responsibilities."
          aside={<p className={styles.chapterMeta}>{pad(SKILL_NOTES_LIST.length)} strengths</p>}
        />
        <SkillsTypeset skills={SKILL_NOTES_LIST} />
      </section>

      <CertificateArchive
        open={archiveOpen}
        certificates={EXHIBIT_CERTIFICATES}
        viewerOpen={certificate !== null}
        onClose={() => setArchiveOpen(false)}
        onOpenCertificate={setCertificate}
      />
      <CertificateModal certificate={certificate} onClose={() => setCertificate(null)} />
    </div>
  );
}
