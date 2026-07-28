"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Project } from "./projectsData";
import styles from "./SelectedProjects.module.css";

const MAX_TILT_DEGREES = 6;

export default function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const card = cardRef.current;
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width;
    const offsetY = (event.clientY - bounds.top) / bounds.height;

    const rotateY = (offsetX - 0.5) * MAX_TILT_DEGREES;
    const rotateX = (0.5 - offsetY) * MAX_TILT_DEGREES;

    card.style.setProperty("--tilt-x", `${rotateX}deg`);
    card.style.setProperty("--tilt-y", `${rotateY}deg`);
    card.style.setProperty("--glow-x", `${offsetX * 100}%`);
    card.style.setProperty("--glow-y", `${offsetY * 100}%`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <article
      ref={cardRef}
      className={styles.card}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <span className={styles.cardGlow} aria-hidden="true" />

      <div className={styles.imageFrame}>
        <img
          className={styles.image}
          src={project.image}
          alt={project.imageAlt}
          loading="lazy"
        />
      </div>

      <div className={styles.cardBody}>
        <p className={styles.category}>{project.category}</p>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        <p className={styles.description}>{project.description}</p>

        <ul className={styles.tagList} aria-label="Technologies used">
          {project.technologies.map((tech) => (
            <li key={tech} className={styles.tag}>
              {tech}
            </li>
          ))}
        </ul>

        <Link
          className={styles.projectLink}
          href={`/projects/${project.slug}`}
          aria-label={`View project details for ${project.title}`}
        >
          View Project Details
          <span className={styles.linkArrow} aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
