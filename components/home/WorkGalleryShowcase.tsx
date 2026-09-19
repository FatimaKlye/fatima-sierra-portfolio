"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Project } from "@/components/projects/projectsData";
import styles from "./WorkGallery.module.css";

const AUTOPLAY_INTERVAL_MS = 4500;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getPrimaryImage(project: Project) {
  return project.screenshots?.[0] ?? { src: project.image, alt: project.imageAlt };
}

export default function WorkGalleryShowcase({ projects }: { projects: Project[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hovering = useRef(false);
  const focused = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion() || projects.length <= 1) return;

    const id = window.setInterval(() => {
      if (hovering.current || focused.current) return;
      setActiveIndex((current) => (current + 1) % projects.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [projects.length]);

  return (
    <div className={styles.gallery} aria-label="Project gallery">
      {projects.map((project, index) => {
        const isActive = index === activeIndex;
        const image = getPrimaryImage(project);
        const href = project.externalUrl ?? `/projects/${project.slug}`;

        return (
          <Link
            key={project.id}
            href={href}
            target={project.target}
            rel={project.rel}
            className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
            onMouseEnter={() => {
              hovering.current = true;
              setActiveIndex(index);
            }}
            onMouseLeave={() => {
              hovering.current = false;
            }}
            onFocus={() => {
              focused.current = true;
              setActiveIndex(index);
            }}
            onBlur={() => {
              focused.current = false;
            }}
          >
            <span className={styles.cardImageWrap}>
              <img
                className={styles.cardImage}
                src={image.src}
                alt={image.alt}
                loading="lazy"
              />
              <span className={styles.cardOverlay}>
                <span className={styles.cardDescription}>{project.description}</span>
              </span>
            </span>

            <span className={styles.cardMeta}>
              <span className={styles.cardTitle}>{project.title}</span>
              <span className={styles.cardCategory}>{project.category}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
