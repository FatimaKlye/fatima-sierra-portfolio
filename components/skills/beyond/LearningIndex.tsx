"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ArrowUpRight, Maximize2, Plus } from "lucide-react";
import { certificateById, topicYear, type ExhibitCertificate, type ExposureTopic } from "./beyondData";
import styles from "./Beyond.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

export const topicId = (title: string) =>
  `topic-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

/**
 * Technical exposure as a numbered index. Each row opens to what the session covered and the
 * certificate behind it; on fine pointers the certificate also floats beside the cursor while
 * a row is hovered.
 */
export default function LearningIndex({
  topics,
  openTopic,
  onToggle,
  onOpenCertificate,
}: {
  topics: ExposureTopic[];
  openTopic: string | null;
  onToggle: (title: string | null) => void;
  onOpenCertificate: (certificate: ExhibitCertificate) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // One preview image per distinct certificate, stacked and cross-faded.
  const previews = Array.from(new Set(topics.map((topic) => topic.certificateIds[0]).filter(Boolean)))
    .map((id) => certificateById(id))
    .filter((certificate): certificate is ExhibitCertificate => Boolean(certificate));
  const hoveredPreview = hovered === null ? undefined : topics[hovered]?.certificateIds[0];

  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    // The preview is positioned against the index wrapper, which also holds the legend.
    const frame = list?.parentElement;
    if (!list || !preview || !frame) return;
    const mm = gsap.matchMedia();
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const x = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3.out" });
      const y = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3.out" });
      const move = (event: PointerEvent) => {
        const box = frame.getBoundingClientRect();
        const left = event.clientX - box.left;
        // Past the middle, the card trails on the cursor's left so it never runs off the page.
        const side = left > box.width * 0.55 ? "left" : "right";
        if (preview.dataset.side !== side) preview.dataset.side = side;
        x(left);
        y(event.clientY - box.top);
      };
      list.addEventListener("pointermove", move);
      return () => list.removeEventListener("pointermove", move);
    });
    return () => mm.revert();
  }, []);

  return (
    <div className={styles.index}>
      <ul className={styles.legend} aria-label="Legend">
        <li>
          <span className={styles.marker} data-level="introductory" aria-hidden="true" />
          <span>
            <strong>Introductory exposure</strong> — learned through orientations, webinars or a course; not yet used in my projects.
          </span>
        </li>
        <li>
          <span className={styles.marker} data-level="applied" aria-hidden="true" />
          <span>
            <strong>Now applied</strong> — started as training, now part of the stack I build with.
          </span>
        </li>
      </ul>

      <ol ref={listRef} className={styles.topics} onPointerLeave={() => setHovered(null)}>
        {topics.map((topic, index) => {
          const isOpen = openTopic === topic.title;
          const id = topicId(topic.title);
          const certificates = topic.certificateIds
            .map((certificateId) => certificateById(certificateId))
            .filter((certificate): certificate is ExhibitCertificate => Boolean(certificate));
          const year = topicYear(topic);

          return (
            <li key={topic.title} id={id} className={styles.topic} data-open={isOpen ? "true" : undefined}>
              <h4 className={styles.topicHeading}>
                <button
                  type="button"
                  id={`${id}-button`}
                  className={styles.topicButton}
                  aria-expanded={isOpen}
                  aria-controls={`${id}-panel`}
                  onClick={() => onToggle(isOpen ? null : topic.title)}
                  onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(index)}
                  onPointerLeave={(event) => event.pointerType === "mouse" && setHovered(null)}
                >
                  <span className={styles.topicNumber} aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  <span className={styles.marker} data-level={topic.level} aria-hidden="true" />
                  <span className={styles.topicTitle}>{topic.title}</span>
                  <span className={styles.topicFormat}>
                    <span className={styles.srOnly}>
                      {topic.level === "applied" ? "Now applied. " : "Introductory exposure. "}
                    </span>
                    {topic.format}
                    {year ? ` · ${year}` : ""}
                  </span>
                  <span className={styles.topicToggle} aria-hidden="true">
                    <Plus size={18} strokeWidth={1.5} />
                  </span>
                </button>
              </h4>

              <div
                id={`${id}-panel`}
                className={styles.topicPanel}
                role="region"
                aria-labelledby={`${id}-button`}
                inert={!isOpen}
              >
                <div className={styles.topicPanelInner}>
                  <p className={styles.topicNote}>{topic.note}</p>
                  <ul className={styles.topicCertificates}>
                    {certificates.map((certificate) => (
                      <li key={certificate.id}>
                        <button
                          type="button"
                          className={styles.topicCertificate}
                          onClick={() => onOpenCertificate(certificate)}
                        >
                          <span className={styles.topicCertificateThumb}>
                            <Image src={certificate.image} alt="" fill sizes="72px" />
                          </span>
                          <span>
                            <span className={styles.topicCertificateTitle}>{certificate.title}</span>
                            <span className={styles.topicCertificateMeta}>
                              {certificate.issuer}
                              {certificate.date ? ` · ${certificate.date}` : ""}
                            </span>
                          </span>
                          <Maximize2 size={14} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  {topic.link && (
                    <a className={styles.topicLinkOut} href={topic.link.href}>
                      {topic.link.label}
                      <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div ref={previewRef} className={styles.previewTrack} aria-hidden="true">
        <div className={styles.previewCard} data-visible={hoveredPreview ? "true" : undefined}>
          {previews.map((certificate) => (
            <span
              key={certificate.id}
              className={styles.previewImage}
              data-active={certificate.id === hoveredPreview ? "true" : undefined}
            >
              <Image src={certificate.image} alt="" fill sizes="260px" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
