"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/components/projects/projectsData";
import { PerspectiveCarousel } from "./PerspectiveCarousel";
import styles from "./ProjectShowcaseCarousel.module.css";

type ProjectShowcaseCarouselProps = {
  projects: Project[];
};

type Breakpoint = {
  maxWidth: number;
  slideWidth: number;
  height: number;
};

const BREAKPOINTS: Breakpoint[] = [
  { maxWidth: 480, slideWidth: 180, height: 315 },
  { maxWidth: 640, slideWidth: 220, height: 350 },
  { maxWidth: 900, slideWidth: 280, height: 400 },
  { maxWidth: 1200, slideWidth: 340, height: 450 },
  { maxWidth: Infinity, slideWidth: 420, height: 510 },
];

function getBreakpoint(width: number): Breakpoint {
  return BREAKPOINTS.find((breakpoint) => width <= breakpoint.maxWidth) ?? BREAKPOINTS[BREAKPOINTS.length - 1];
}

function useCarouselSize() {
  const [size, setSize] = React.useState<Breakpoint>(BREAKPOINTS[BREAKPOINTS.length - 1]);

  React.useEffect(() => {
    const updateSize = () => setSize(getBreakpoint(window.innerWidth));
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

export default function ProjectShowcaseCarousel({ projects }: ProjectShowcaseCarouselProps) {
  const { slideWidth, height } = useCarouselSize();
  const router = useRouter();

  const items = React.useMemo(
    () =>
      projects.map((project) => {
        const preview = project.screenshots?.[0];
        return {
          src: preview?.src ?? project.image,
          alt: preview?.alt ?? project.imageAlt,
          title: project.title,
          actionLabel: "View case study",
        };
      }),
    [projects]
  );

  // Warm the case-study routes so the click feels instant.
  React.useEffect(() => {
    projects.forEach((project) => router.prefetch(`/projects/${project.slug}`));
  }, [projects, router]);

  const openProject = React.useCallback(
    (index: number) => {
      const project = projects[index];
      if (project) {
        router.push(`/projects/${project.slug}`);
      }
    },
    [projects, router]
  );

  return (
    <div className={styles.carouselWrap} style={{ height }}>
      <PerspectiveCarousel
        items={items}
        loop
        onActiveClick={openProject}
        slideWidth={slideWidth}
        className={styles.carousel}
        imageClassName={styles.carouselImage}
        labelClassName={styles.carouselLabel}
        controlsClassName={styles.carouselControls}
      />
    </div>
  );
}
