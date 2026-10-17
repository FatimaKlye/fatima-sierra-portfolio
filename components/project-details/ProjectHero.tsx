import { Fragment } from "react";
import Link from "next/link";
import type { ProjectDetail } from "@/data/projectDetailsData";
import MediaFrame from "./MediaFrame";
import PhoneMockup from "./PhoneMockup";
import ProjectLinks from "./ProjectLinks";
import styles from "./ProjectDetails.module.css";

type ProjectHeroProps = {
  project: ProjectDetail;
  index: number;
  total: number;
};

const pad = (value: number) => String(value).padStart(2, "0");

/** Each word sits in a clipped mask so GSAP can slide it up on load. */
function SplitTitle({ text }: { text: string }) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, wordIndex) => (
        <Fragment key={`${word}-${wordIndex}`}>
          <span className={styles.word}>
            <span className={styles.wordInner} data-word>
              {word}
            </span>
          </span>
          {wordIndex < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

export default function ProjectHero({ project, index, total }: ProjectHeroProps) {
  const roles = project.roles ?? (project.role ? [project.role] : []);
  const technologies = project.stack.flatMap((group) => group.items);
  const facts = [
    { label: "Period", value: project.period },
    { label: "Organization", value: project.organization },
    { label: "Status", value: project.status },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  return (
    <header className={styles.hero} id="intro" aria-labelledby="project-title" data-nav-label="Intro" data-nav-intro>
      {/* Text-only heroes already show the index inside their panel. */}
      {project.hero && (
        <span className={styles.heroNumeral} aria-hidden="true">
          {pad(index + 1)}
        </span>
      )}

      <div className={styles.container}>
        <nav className={styles.crumbs} aria-label="Project navigation" data-intro>
          <Link href="/projects" className={`ui-btn ui-btn--secondary ui-btn--sm ${styles.backLink}`}>
            Back to Projects
          </Link>
          <span className={styles.crumbCount}>
            Project {pad(index + 1)} <span aria-hidden="true">/</span>
            <span className={styles.srOnly}> of </span> {pad(total)}
          </span>
        </nav>

        <div className={styles.heroTop}>
          <p className={styles.heroCategory} data-intro>
            {project.category}
          </p>
          <h1 id="project-title" className={styles.title}>
            <SplitTitle text={project.title} />
          </h1>
          {project.fullName ? (
            <p className={styles.heroFullName} data-intro>
              <span className={styles.heroFullNameLabel}>Full project name</span>
              {project.fullName}
            </p>
          ) : (
            <p className={styles.tagline} data-intro>
              {project.tagline}
            </p>
          )}
        </div>

        <div className={styles.heroBody}>
          <div className={styles.heroAside} data-intro>
            <dl className={styles.glance}>
              <div className={styles.glanceRow}>
                <dt>Purpose</dt>
                <dd className={styles.purpose}>{project.purpose}</dd>
              </div>
              {roles.length > 0 && (
                <div className={styles.glanceRow}>
                  <dt>My role</dt>
                  <dd>
                    <ul className={styles.roleTags}>
                      {roles.map((role) => (
                        <li key={role}>{role}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              {technologies.length > 0 && (
                <div className={styles.glanceRow}>
                  <dt>Tech stack</dt>
                  <dd>
                    <ul className={styles.techChips}>
                      {technologies.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>

            {facts.length > 0 && (
              <dl className={styles.heroFacts}>
                {facts.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <ProjectLinks links={project.links} apkSize={project.download?.size} />
          </div>

          <div className={styles.heroVisual} data-intro-visual>
            <span className={styles.heroGlow} aria-hidden="true" />
            {project.hero?.frame === "phone" ? (
              <div className={styles.phoneStack}>
                {project.heroCompanions?.slice(0, 2).map((media, companionIndex) => (
                  <div
                    key={media.src}
                    className={`${styles.phoneStackItem} ${companionIndex === 0 ? styles.phoneBackLeft : styles.phoneBackRight}`}
                    data-parallax={companionIndex === 0 ? 9 : 12}
                  >
                    <PhoneMockup media={media} sizes="(min-width: 1024px) 15vw, 34vw" decorative />
                  </div>
                ))}
                <div className={`${styles.phoneStackItem} ${styles.phoneFront}`} data-parallax="4">
                  <PhoneMockup media={project.hero} priority sizes="(min-width: 1024px) 20vw, 52vw" />
                </div>
              </div>
            ) : project.hero ? (
              <div data-parallax="5">
                <MediaFrame
                  media={project.hero}
                  priority
                  sizes="(min-width: 1440px) 760px, (min-width: 1024px) 56vw, 100vw"
                />
              </div>
            ) : (
              <div className={styles.typePanel} data-parallax="5">
                <span className={styles.typeIndex} aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <ul className={styles.typeStack} aria-label="Technologies used">
                  {technologies.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
