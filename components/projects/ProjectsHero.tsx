"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Shot } from "./ShowcaseFrames";
import { PROJECT_STATS, SHOWCASE_PROJECTS, pad, type ShowcaseProject } from "./showcaseData";
import styles from "./ProjectsPage.module.css";

const subscribeNoop = () => () => undefined;
const TITLE = ["Selected", "work,"];
const TITLE_ACCENT = ["case", "by", "case."];

/** Layered real screens for one project; data-depth drives the cursor parallax in ProjectsMotion. */
function StageComposition({ project, priority }: { project: ShowcaseProject; priority: boolean }) {
  const [first, second, third] = project.screens;

  if (project.layout === "night") {
    return (
      <span className={styles.stageNight}>
        <span className={styles.stageGlow} aria-hidden="true" />
        {third && (
          <span className={`${styles.stagePhone} ${styles.stagePhoneRight}`} data-depth="10">
            <Shot media={third} sizes="(max-width: 1023px) 26vw, 12vw" decorative />
          </span>
        )}
        {second && (
          <span className={`${styles.stagePhone} ${styles.stagePhoneLeft}`} data-depth="10">
            <Shot media={second} sizes="(max-width: 1023px) 26vw, 12vw" decorative />
          </span>
        )}
        <span className={`${styles.stagePhone} ${styles.stagePhoneCenter}`} data-depth="22">
          <Shot media={first} sizes="(max-width: 1023px) 30vw, 14vw" priority={priority} decorative />
        </span>
      </span>
    );
  }

  // ITSO pairs its home page with the admin dashboard; the others use their second gallery screen.
  const companion = project.layout === "track" ? (project.screens[3] ?? second) : second;

  return (
    <span className={styles.stageScreens} data-layout={project.layout}>
      <span className={styles.stageMain} data-depth="10">
        <Shot media={first} sizes="(max-width: 1023px) 86vw, 46vw" priority={priority} decorative />
      </span>
      {companion && (
        <span className={styles.stageSecond} data-depth="26">
          <Shot media={companion} sizes="(max-width: 1023px) 46vw, 24vw" decorative />
        </span>
      )}
      {!companion && project.tagline && (
        <span className={styles.stageQuote} data-depth="30">
          “{project.tagline}”
        </span>
      )}
    </span>
  );
}

/**
 * The page opening doubles as the project index: hovering or focusing a row stages
 * that project's real screens, and the stage cycles on its own until the visitor
 * takes over. Every row and the stage open the case study.
 */
export default function ProjectsHero() {
  const projects = SHOWCASE_PROJECTS;
  const total = pad(projects.length);
  const heroRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Arriving from the homepage skill index ("/projects?tech=React") highlights the projects
  // built with that tool. Read after hydration; the server renders the plain index.
  const search = useSyncExternalStore(subscribeNoop, () => window.location.search, () => "");
  const requested = new URLSearchParams(search).get("tech");
  const tech = !dismissed && requested && projects.some((project) => project.skills.includes(requested)) ? requested : null;
  const matchCount = tech ? projects.filter((project) => project.skills.includes(tech)).length : 0;

  // A highlight stages its first match until the visitor picks something else.
  const shown = tech && !interacted ? projects.findIndex((project) => project.skills.includes(tech)) : active;
  const current = projects[shown];
  // The progress bar's CSS animation is the timer: its end advances the stage, and
  // reduced-motion visitors (animation: none) simply never auto-advance.
  const cycling = !tech && !interacted;

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), { threshold: 0.15 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const select = (index: number) => {
    setInteracted(true);
    setActive(index);
  };

  const clearHighlight = () => {
    setDismissed(true);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
  };

  return (
    <header
      ref={heroRef}
      className={styles.hero}
      id="intro"
      data-nav-label="Intro"
      data-nav-intro
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <nav className={styles.crumbs} aria-label="Breadcrumb" data-hero-in>
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-current="page">Projects</li>
            </ol>
          </nav>

          <h1 className={styles.heroTitle} aria-label="Selected work, case by case.">
            {TITLE.map((word) => (
              <Fragment key={word}>
                <span className={styles.mask} aria-hidden="true">
                  <span data-hero-word>{word}</span>
                </span>{" "}
              </Fragment>
            ))}
            <em>
              {TITLE_ACCENT.map((word, index) => (
                <Fragment key={word}>
                  <span className={styles.mask} aria-hidden="true">
                    <span data-hero-word>{word}</span>
                  </span>
                  {index < TITLE_ACCENT.length - 1 ? " " : null}
                </Fragment>
              ))}
            </em>
          </h1>

          <p className={styles.heroIntro} data-hero-in>
            A fire station, a campus office, a beauty-shop prototype and a rental business — each one started with a
            practical need. Preview a project, then open its case study.
          </p>
        </div>

        <div
          className={styles.stageWrap}
          data-hero-stage
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          {/* Rows below are the keyboard and screen-reader path; the stage is a pointer shortcut to the same link. */}
          <Link
            href={current.href}
            className={styles.stage}
            data-open-case
            data-cursor="Open case"
            data-stage
            tabIndex={-1}
            aria-hidden="true"
          >
            {projects.map((project, index) => (
              <span key={project.slug} className={styles.stageLayer} data-active={index === shown} data-tone={project.layout}>
                <StageComposition project={project} priority={index === 0} />
              </span>
            ))}
          </Link>

          <p className={styles.stageCaption}>
            <span className={styles.roller} aria-hidden="true">
              <span style={{ transform: `translateY(${-shown * 100}%)` }}>
                {projects.map((project) => (
                  <span key={project.slug}>{project.number}</span>
                ))}
              </span>
            </span>
            <span className={styles.stageTotal} aria-hidden="true">
              / {total}
            </span>
            <span className={styles.stageName}>
              <span className={styles.srOnly}>Previewing </span>
              {current.title}
            </span>
            <span className={styles.stageKind}>{current.period ?? current.kind}</span>
          </p>
        </div>

        <div
          className={styles.heroIndex}
          data-hero-in
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          {tech && (
            <p className={styles.filter} role="status">
              <span>
                Built with <strong>{tech}</strong>
              </span>
              <span className={styles.filterCount}>
                {pad(matchCount)} of {total}
              </span>
              <button type="button" className={styles.filterClear} onClick={clearHighlight}>
                Show all
              </button>
            </p>
          )}

          <ol className={styles.rows}>
            {projects.map((project, index) => {
              const matched = tech ? project.skills.includes(tech) : false;
              const order = tech ? projects.filter((entry, at) => at < index && entry.skills.includes(tech)).length : 0;
              const className = [
                styles.row,
                index === shown && styles.rowActive,
                tech && (matched ? styles.rowMatch : styles.rowMuted),
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <li key={project.slug}>
                  <Link
                    className={className}
                    href={project.href}
                    data-open-case
                    style={matched ? ({ "--match-order": order } as CSSProperties) : undefined}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") select(index);
                    }}
                    onFocus={() => select(index)}
                  >
                    <span className={styles.rowNumber}>{project.number}</span>
                    <span className={styles.rowTitle}>{project.title}</span>
                    <span className={styles.rowKind}>{project.kind}</span>
                    <ArrowUpRight className={styles.rowArrow} size={18} aria-hidden="true" />
                    {cycling && index === shown && (
                      <span
                        key={shown}
                        className={styles.rowProgress}
                        style={{ animationPlayState: paused || offscreen ? "paused" : "running" }}
                        onAnimationEnd={() => setActive((shown + 1) % projects.length)}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <dl className={styles.stats} data-hero-in>
        {PROJECT_STATS.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
