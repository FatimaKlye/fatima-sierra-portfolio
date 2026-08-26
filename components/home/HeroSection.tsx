"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HERO_CONTENT, CORE_KNOWLEDGE, EDUCATION } from "@/components/about/aboutData";
import { CERTIFICATES } from "@/components/certificates/certificatesData";
import { PROJECTS, type Project } from "@/components/projects/projectsData";
import styles from "./HeroSection.module.css";

const HERO_SCROLL_DISTANCE = 700;
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type DragState = {
  active: boolean;
  startX: number;
  startY: number;
  x: number;
  y: number;
};

const INITIAL_DRAG: DragState = {
  active: false,
  startX: 0,
  startY: 0,
  x: 0,
  y: 0,
};

const rosterRows = CORE_KNOWLEDGE.slice(0, 5).map((item, index) => ({
  label: `Focus ${String(index + 1).padStart(2, "0")}`,
  name: item.title,
  count: String(index + 1).padStart(2, "0"),
}));

const dateRows = [
  {
    date: "2023-Present",
    title: "Bachelor of Science in Information Technology",
    type: "Education",
    place: EDUCATION[0]?.institution ?? "National University - Dasmarinas",
  },
  ...CERTIFICATES.slice(0, 2).map((certificate) => ({
    date: certificate.dateAwarded,
    title: certificate.title,
    type: certificate.credentialName,
    place: certificate.issuer,
  })),
  {
    date: "April 23, 2025",
    title: "Modern Web + AI (UI/UX)",
    type: "Certificate of Completion",
    place: "NU Dasmarinas Computer Society",
  },
];

function projectHref(project: Project) {
  return project.externalUrl ?? `/projects/${project.slug}`;
}

function projectButtonLabel(project: Project) {
  return project.buttonLabel ? `${project.buttonLabel} →` : "Open Case Study →";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const [portalProgress, setPortalProgress] = useState(1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [drag, setDrag] = useState<DragState>(INITIAL_DRAG);

  const selectedProject = PROJECTS[activeProject] ?? PROJECTS[0];
  const releaseProgress = useMemo(
    () => `${String(activeProject + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}`,
    [activeProject],
  );

  useEffect(() => {
    const media = window.matchMedia(MOTION_QUERY);

    const updateReducedMotion = () => {
      setReduceMotion(media.matches);
      if (media.matches) {
        setPortalProgress(1);
      }
    };

    updateReducedMotion();
    media.addEventListener("change", updateReducedMotion);

    return () => media.removeEventListener("change", updateReducedMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const updatePortalProgress = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      setPortalProgress(clamp(-rect.top / HERO_SCROLL_DISTANCE, 0, 1));
    };

    updatePortalProgress();
    window.addEventListener("scroll", updatePortalProgress, { passive: true });
    window.addEventListener("resize", updatePortalProgress);

    return () => {
      window.removeEventListener("scroll", updatePortalProgress);
      window.removeEventListener("resize", updatePortalProgress);
    };
  }, [reduceMotion]);

  const showNextProject = () => {
    setActiveProject((current) => (current + 1) % PROJECTS.length);
  };

  const showPreviousProject = () => {
    setActiveProject((current) => (current - 1 + PROJECTS.length) % PROJECTS.length);
  };

  const handleDeckKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextProject();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousProject();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      x: 0,
      y: 0,
    });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.active || reduceMotion) return;

    setDrag((current) => ({
      ...current,
      x: event.clientX - current.startX,
      y: event.clientY - current.startY,
    }));
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.active) return;

    const width = deckRef.current?.getBoundingClientRect().width ?? 1;
    const shouldThrow = Math.abs(drag.x) > width * 0.1;

    if (shouldThrow) {
      if (drag.x < 0) {
        showNextProject();
      } else {
        showPreviousProject();
      }
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    setDrag(INITIAL_DRAG);
  };

  return (
    <>
      <section
        ref={heroRef}
        className={styles.portalHero}
        aria-labelledby="home-heading"
        style={{ "--portal-progress": portalProgress } as CSSProperties}
      >
        <div className={styles.portalStage}>
          <Image
            className={styles.portalImage}
            src={HERO_CONTENT.portrait.src}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
          />
          <div className={styles.portalTone} aria-hidden="true" />
          <div className={styles.portalVeil} aria-hidden="true" />
          <div className={`${styles.portalPanel} ${styles.portalPanelLeft}`} aria-hidden="true" />
          <div className={`${styles.portalPanel} ${styles.portalPanelRight}`} aria-hidden="true" />
          <span className={`${styles.portalDot} ${styles.portalDotOne}`} aria-hidden="true" />
          <span className={`${styles.portalDot} ${styles.portalDotTwo}`} aria-hidden="true" />

          <div className={styles.portalMetaTop} aria-hidden="true">
            Web & Mobile Developer
          </div>
          <div className={styles.portalMetaBottom} aria-hidden="true">
            Portfolio / 2026
          </div>

          <div className={styles.portalCopy}>
            <p className={styles.eyebrow}>Portfolio Catalogue</p>
            <h1 id="home-heading" className={styles.portalTitle}>
              <span>FATIMA</span>
              <span>SIERRA</span>
            </h1>
            <p className={styles.portalLead}>{HERO_CONTENT.tagline}</p>
          </div>
        </div>
      </section>

      <section className={styles.statementFold} aria-labelledby="statement-heading">
        <div className={styles.statementInner}>
          <div>
            <p className={styles.eyebrow}>Statement</p>
            <h2 id="statement-heading" className={styles.statementTitle}>
              I build practical systems where <span>interface clarity</span>,
              database structure, and responsive behavior carry the experience.
            </h2>
          </div>
          <p className={styles.indexNumber} aria-hidden="true">
            01
          </p>
          <Image
            className={styles.statementImage}
            src={HERO_CONTENT.portrait.src}
            alt=""
            aria-hidden="true"
            width={430}
            height={430}
          />
        </div>
      </section>

      <section className={styles.releases} aria-labelledby="releases-heading">
        <div className={styles.releasesInner}>
          <div className={styles.releaseCopy}>
            <p className={styles.eyebrow}>Selected Releases</p>
            <h2 id="releases-heading">A working catalogue of portfolio systems.</h2>
            <p>
              Browse project cards from the portfolio. Unverified FOCUSIT details
              remain explicitly marked pending confirmation.
            </p>
            <div className={styles.releaseActions}>
              <Link className={styles.primaryButton} href="/projects">
                View All Projects
              </Link>
              <a
                className={styles.secondaryButton}
                href={projectHref(selectedProject)}
                target={selectedProject.externalUrl ? selectedProject.target : undefined}
                rel={selectedProject.externalUrl ? selectedProject.rel : undefined}
              >
                {projectButtonLabel(selectedProject)}
              </a>
            </div>
          </div>

          <div className={styles.deckWrap}>
            <div
              ref={deckRef}
              className={styles.deck}
              tabIndex={0}
              role="group"
              aria-label="Project catalogue deck. Use left and right arrow keys to change the top project."
              onKeyDown={handleDeckKeyDown}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            >
              {PROJECTS.map((project, index) => {
                const stackPosition =
                  (index - activeProject + PROJECTS.length) % PROJECTS.length;
                const isTopCard = stackPosition === 0;
                const dragRotation = drag.x / 22;
                const inlineStyle = {
                  "--stack-index": stackPosition,
                  "--drag-x": isTopCard ? `${drag.x}px` : "0px",
                  "--drag-y": isTopCard ? `${drag.y}px` : "0px",
                  "--drag-rotate": isTopCard ? `${dragRotation}deg` : "0deg",
                  zIndex: PROJECTS.length - stackPosition,
                } as CSSProperties;

                return (
                  <article
                    key={project.id}
                    className={`${styles.deckCard}${isTopCard ? ` ${styles.deckCardActive}` : ""}${
                      drag.active && isTopCard ? ` ${styles.deckCardDragging}` : ""
                    }`}
                    style={inlineStyle}
                    aria-hidden={!isTopCard}
                  >
                    <div className={styles.deckImageFrame}>
                      <Image
                        src={project.image}
                        alt={project.imageAlt}
                        fill
                        sizes="(max-width: 900px) 80vw, 36vw"
                      />
                    </div>
                    <div className={styles.deckCardBody}>
                      <p>{project.category}</p>
                      <h3>{project.title}</h3>
                      <span>{project.technologies.join(" / ")}</span>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className={styles.deckHint}>
              <span>Drag sleeve or use arrow keys</span>
              <strong>{releaseProgress}</strong>
            </div>
            <div className={styles.progressDots} aria-hidden="true">
              {PROJECTS.map((project, index) => (
                <span
                  key={project.id}
                  className={index === activeProject ? styles.progressDotActive : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.rosterSection} aria-labelledby="roster-heading">
        <div className={styles.roster}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Roster</p>
            <h2 id="roster-heading">Core capability rows</h2>
          </div>
          <div className={styles.rosterRows}>
            {rosterRows.map((row) => (
              <div className={styles.rosterRow} key={row.name}>
                <span>{row.label}</span>
                <strong>{row.name}</strong>
                <em>{row.count}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.datesSection} aria-labelledby="dates-heading">
        <div className={styles.dates}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Dates</p>
            <h2 id="dates-heading">Verified education and credential markers</h2>
          </div>
          <div className={styles.dateTable}>
            <div className={styles.dateHead} aria-hidden="true">
              <span>Date</span>
              <span>Record</span>
              <span>Type</span>
              <span>Source</span>
            </div>
            {dateRows.map((row) => (
              <div className={styles.dateRow} key={`${row.date}-${row.title}`}>
                <strong>{row.date}</strong>
                <span>{row.title}</span>
                <span>{row.type}</span>
                <span>{row.place}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closeSection} aria-labelledby="close-heading">
        <div className={styles.closeInner}>
          <div className={styles.closeTop}>
            <div>
              <p className={styles.eyebrow}>Close</p>
              <h2 id="close-heading">Available for practical web and mobile work.</h2>
              <p>For opportunities, project details, or verified references, use the contact page.</p>
            </div>
            <div className={styles.closeActions}>
              <Link className={styles.primaryButton} href="/contact">
                Contact
              </Link>
              <a
                className={styles.secondaryButton}
                href="/assets/resume/fatima-sierra-resume.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Resume
              </a>
            </div>
          </div>
        </div>
        <p className={styles.closeWordmark} aria-hidden="true">
          SIERRA
        </p>
      </section>
    </>
  );
}
