import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { Shot } from "./ShowcaseFrames";
import { SHOWCASE_PROJECTS, pad, type ShowcaseProject } from "./showcaseData";
import styles from "./ProjectsPage.module.css";

const TOTAL = pad(SHOWCASE_PROJECTS.length);

/** Each word sits in a clipped mask so ProjectsMotion can slide it up. */
function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className={styles.mask}>
            <span data-word>{word}</span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

function Head({ project, titleId }: { project: ShowcaseProject; titleId: string }) {
  return (
    <div className={styles.head}>
      <p className={styles.headMeta} data-reveal>
        <span className={styles.headNumber} aria-hidden="true">
          {project.number}
          <span className={styles.headTotal}>/ {TOTAL}</span>
        </span>
        <span>{project.category}</span>
      </p>
      <h2 id={titleId} className={styles.headTitle}>
        <Words text={project.title} />
      </h2>
      {project.tagline && project.layout !== "spread" && (
        <p className={styles.headTagline} data-reveal>
          {project.tagline}
        </p>
      )}
    </div>
  );
}

function Facts({ project }: { project: ShowcaseProject }) {
  const facts = [
    { label: project.roles.length > 1 ? "Roles" : "Role", value: project.roles.join(" · ") },
    { label: "Period", value: project.period },
    { label: "Status", value: project.status },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  if (!facts.length) return null;

  return (
    <dl className={styles.facts} data-stagger>
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Actions({ project }: { project: ShowcaseProject }) {
  return (
    <div className={styles.actions} data-reveal>
      <span className={styles.magnet} data-magnetic>
        <Link className={`ui-btn ui-btn--primary ${styles.caseButton}`} href={project.href} data-open-case>
          Open the Case Study
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </span>
      {project.apkUrl && (
        <a
          className="ui-btn ui-btn--secondary"
          href={project.apkUrl}
          type="application/vnd.android.package-archive"
          download
          aria-label={`Download the ${project.title} APK for Android${project.apkSize ? ` (${project.apkSize})` : ""}`}
        >
          <Download size={16} aria-hidden="true" />
          Download APK
        </a>
      )}
      {project.liveUrl && (
        <a
          className="ui-btn ui-btn--secondary"
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit the live ${project.title} (opens in a new tab)`}
        >
          Live Site
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      )}
      {project.repoUrl && (
        <a
          className={styles.textLink}
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View the ${project.title} repository on GitHub (opens in a new tab)`}
        >
          Repository
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function Body({ project, children }: { project: ShowcaseProject; children?: ReactNode }) {
  return (
    <div className={styles.body}>
      <p className={styles.summary} data-reveal>
        {project.summary}
      </p>

      {project.contribution && (
        <p className={styles.part} data-reveal>
          <span>My part</span>
          {project.contribution}
        </p>
      )}

      <Facts project={project} />

      {project.highlights.length > 0 && (
        <ul className={styles.highlights} aria-label={`${project.title} highlights`} data-stagger>
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      )}

      <p className={styles.stack} data-reveal>
        <span className={styles.srOnly}>Built with: </span>
        {project.stack.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </p>

      <Actions project={project} />
      {children}
    </div>
  );
}

/** Pointer shortcut to the case study; the "Open the Case Study" button is the keyboard path. */
function MediaLink({ project, className, children }: { project: ShowcaseProject; className?: string; children: ReactNode }) {
  return (
    <Link
      href={project.href}
      className={[styles.mediaLink, className].filter(Boolean).join(" ")}
      data-open-case
      data-cursor="Open case"
      tabIndex={-1}
      aria-hidden="true"
    >
      {children}
    </Link>
  );
}

type LayoutProps = { project: ShowcaseProject; titleId: string };

/* A wide, cinematic screen that unclips as it scrolls in. */
function Cinema({ project, titleId }: LayoutProps) {
  const [main, second] = project.screens;
  return (
    <>
      <div className={styles.container}>
        <Head project={project} titleId={titleId} />
      </div>
      <div className={styles.cinemaMedia}>
        <MediaLink project={project} className={styles.cinemaFrame}>
          <span className={styles.clip} data-clip>
            <Shot media={main} sizes="(max-width: 900px) 100vw, 1320px" />
          </span>
        </MediaLink>
        {second && (
          <figure className={styles.cinemaSecond}>
            <span data-parallax="12">
              <Shot media={second} sizes="(max-width: 900px) 56vw, 420px" />
            </span>
            {second.label && <figcaption>{second.label}</figcaption>}
          </figure>
        )}
      </div>
      <div className={`${styles.container} ${styles.cinemaBody}`}>
        <Body project={project}>
          {project.slug === "ignis-safe-website" && (
            <a className={styles.next} href="#ignis-safe-mobile">
              <ArrowDown size={14} aria-hidden="true" />
              One system with the IGNIS SAFE mobile app
            </a>
          )}
        </Body>
      </div>
    </>
  );
}

/* A night band: the app's phones fanned in perspective, tilting toward the cursor. */
function Night({ project, titleId }: LayoutProps) {
  const [center, left, right] = project.screens;
  return (
    <div className={`${styles.container} ${styles.nightGrid}`}>
      <div className={styles.nightCopy}>
        <Head project={project} titleId={titleId} />
        <Body project={project} />
      </div>
      <MediaLink project={project} className={styles.nightPhones}>
        <span className={styles.nightHalo} aria-hidden="true" />
        <span className={styles.tilt} data-tilt>
          {left && (
            <span className={`${styles.nightPhone} ${styles.nightPhoneLeft}`}>
              <span data-parallax="10">
                <Shot media={left} sizes="(max-width: 900px) 34vw, 220px" decorative />
              </span>
            </span>
          )}
          {right && (
            <span className={`${styles.nightPhone} ${styles.nightPhoneRight}`}>
              <span data-parallax="6">
                <Shot media={right} sizes="(max-width: 900px) 34vw, 220px" decorative />
              </span>
            </span>
          )}
          <span className={`${styles.nightPhone} ${styles.nightPhoneCenter}`}>
            <Shot media={center} sizes="(max-width: 900px) 46vw, 280px" />
          </span>
        </span>
      </MediaLink>
    </div>
  );
}

/* A horizontal gallery: the screens travel sideways as the page scrolls. */
function Track({ project, titleId }: LayoutProps) {
  return (
    <>
      <div className={`${styles.container} ${styles.trackTop}`}>
        <Head project={project} titleId={titleId} />
        <Body project={project} />
      </div>
      <div className={styles.trackViewport} data-track tabIndex={0} role="region" aria-label={`${project.title} screens`}>
        <ol className={styles.trackRail} data-track-rail>
          {project.screens.map((media, index) => (
            <li key={media.src} className={styles.trackItem}>
              <MediaLink project={project}>
                <Shot media={media} sizes="(max-width: 900px) 82vw, 640px" />
              </MediaLink>
              <p className={styles.trackCaption}>
                <span>{pad(index + 1)}</span>
                {media.label}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

/* Two dashboards stacked in 3D; hovering brings the one behind to the front. */
function Stack({ project, titleId }: LayoutProps) {
  const [front, back] = project.screens;
  return (
    <div className={`${styles.container} ${styles.stackGrid}`}>
      <MediaLink project={project} className={styles.stackMedia}>
        <span className={styles.tilt} data-tilt>
          {back && (
            <span className={styles.stackBack}>
              <Shot media={back} sizes="(max-width: 900px) 80vw, 560px" />
            </span>
          )}
          <span className={styles.stackFront}>
            <Shot media={front} sizes="(max-width: 900px) 86vw, 640px" />
          </span>
        </span>
        {back && (
          <span className={styles.stackHint}>
            {front.label} <i /> {back.label}
          </span>
        )}
      </MediaLink>
      <div className={styles.stackCopy}>
        <Head project={project} titleId={titleId} />
        <Body project={project} />
      </div>
    </div>
  );
}

/* An editorial spread: the tagline set large, the live site bleeding off the page edge. */
function Spread({ project, titleId }: LayoutProps) {
  return (
    <>
      {project.tagline && (
        <div className={styles.container}>
          <p className={styles.spreadQuote}>
            <Words text={project.tagline} />
          </p>
        </div>
      )}
      <div className={`${styles.container} ${styles.spreadGrid}`}>
        <div className={styles.spreadCopy}>
          <Head project={project} titleId={titleId} />
          <Body project={project} />
        </div>
        <MediaLink project={project} className={styles.spreadMedia}>
          <span className={styles.clip} data-clip="side">
            <Shot media={project.hero} sizes="(max-width: 900px) 100vw, 60vw" />
          </span>
        </MediaLink>
      </div>
    </>
  );
}

const LAYOUTS = { cinema: Cinema, night: Night, track: Track, stack: Stack, spread: Spread };

export default function ProjectChapters() {
  return (
    <div className={styles.chapters}>
      {SHOWCASE_PROJECTS.map((project) => {
        const titleId = `project-${project.slug}-title`;
        const Layout = LAYOUTS[project.layout];
        return (
          <article
            key={project.slug}
            id={project.slug}
            className={styles.chapter}
            data-layout={project.layout}
            aria-labelledby={titleId}
            data-nav-label={project.title}
          >
            <Layout project={project} titleId={titleId} />
          </article>
        );
      })}
    </div>
  );
}
