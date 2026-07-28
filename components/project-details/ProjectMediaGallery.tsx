"use client";

import { useState } from "react";
import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

export default function ProjectMediaGallery({ project }: { project: ProjectDetail }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex !== null ? project.gallery[activeIndex] : null;

  return (
    <section className={styles.section} aria-labelledby="media-title">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Screenshots &amp; Video</p>
          <h2 id="media-title" className={styles.sectionTitle}>
            See It In Action
          </h2>
        </header>

        <div className={styles.galleryGrid}>
          {project.gallery.map((item, index) => (
            <div key={item.src} className={styles.galleryItem}>
              <img className={styles.galleryImage} src={item.src} alt={item.alt} loading="lazy" />
              <button
                type="button"
                className={styles.galleryButton}
                aria-label={`Open larger preview of ${item.alt}`}
                onClick={() => setActiveIndex(index)}
              />
            </div>
          ))}
        </div>

        {project.video && (
          <div className={styles.videoWrapper} style={{ marginTop: 24 }}>
            <video
              className={styles.video}
              controls
              poster={project.video.poster}
              preload="metadata"
            >
              <source src={project.video.src} />
            </video>
          </div>
        )}
      </div>

      {activeImage && (
        <div
          className={styles.lightboxOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.alt}
          onClick={() => setActiveIndex(null)}
        >
          <figure
            className={styles.lightboxFigure}
            onClick={(event) => event.stopPropagation()}
          >
            <img className={styles.lightboxImage} src={activeImage.src} alt={activeImage.alt} />
            <button
              type="button"
              className={styles.lightboxClose}
              aria-label="Close preview"
              onClick={() => setActiveIndex(null)}
            >
              ×
            </button>
          </figure>
        </div>
      )}
    </section>
  );
}
