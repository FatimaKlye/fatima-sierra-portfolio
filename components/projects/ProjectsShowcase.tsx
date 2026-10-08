import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { PROJECTS } from "@/components/projects/projectsData";
import { getProjectDetailBySlug } from "@/data/projectDetailsData";
import ProjectsIndex, { type ProjectIndexItem } from "./ProjectsIndex";
import styles from "./ProjectsShowcase.module.css";

type ShowcaseMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
  frame: "browser" | "plain";
  caption?: string;
  /** True for the illustrated previews used where no public screenshot exists. */
  illustrated?: boolean;
};

/** Merge the carousel record with its case study; every field comes from verified data. */
export const SHOWCASE_PROJECTS = PROJECTS.map((project) => {
  const detail = getProjectDetailBySlug(project.slug);
  const fallback = project.screenshots?.[0] ?? { src: project.image, alt: project.imageAlt };

  const media: ShowcaseMedia = detail?.hero
    ? { ...detail.hero }
    : { src: fallback.src, alt: fallback.alt, width: 960, height: 720, frame: "plain", illustrated: true };
  const secondary = detail?.gallery.find((item) => item.src !== media.src);

  const stack = Array.from(
    new Set([...(detail?.stack.flatMap((group) => group.items) ?? []), ...project.technologies])
  ).slice(0, 8);

  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    tagline: detail?.tagline,
    summary: detail?.summary ?? project.description,
    role: detail?.role,
    period: detail?.period,
    status: detail?.status,
    highlights: detail?.features.slice(0, 3).map((feature) => feature.title) ?? [],
    stack,
    media,
    secondary,
    liveUrl: detail?.links.liveUrl,
    repoUrl: detail?.links.repoUrl ?? project.repoUrl ?? project.externalUrl,
  };
});

export const INDEX_ITEMS: ProjectIndexItem[] = SHOWCASE_PROJECTS.map((project) => ({
  slug: project.slug,
  title: project.title,
  category: project.category,
  period: project.period,
  image: { src: project.media.src, alt: project.media.alt },
}));

function Frame({ media, sizes }: { media: ShowcaseMedia; sizes: string }) {
  const image = (
    <span className={styles.frameImage} style={{ aspectRatio: `${media.width} / ${media.height}` }}>
      <Image src={media.src} alt={media.alt} fill sizes={sizes} />
    </span>
  );

  if (media.frame === "browser") {
    return (
      <span className={styles.browser}>
        <span className={styles.browserBar} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {image}
      </span>
    );
  }

  // Never upscale small exports (e.g. the 416px app preview) past their natural width.
  return (
    <span className={styles.plain} style={{ "--frame-max": `${media.width}px` } as CSSProperties}>
      {image}
    </span>
  );
}

export default function ProjectsShowcase() {
  const total = String(SHOWCASE_PROJECTS.length).padStart(2, "0");

  return (
    <>
      <section className={styles.indexSection} aria-labelledby="project-index-title">
        <div className={styles.container}>
          <h2 id="project-index-title" className={styles.kicker} data-reveal>
            Index — hover to preview, select to open the case study
          </h2>
          <ProjectsIndex items={INDEX_ITEMS} />
        </div>
      </section>

      <div className={styles.chapters}>
        {SHOWCASE_PROJECTS.map((project, index) => {
          const number = String(index + 1).padStart(2, "0");
          const titleId = `project-${project.slug}-title`;

          return (
            <article className={styles.chapter} id={project.slug} key={project.slug} aria-labelledby={titleId}>
              <div className={styles.chapterInner}>
                <div className={styles.chapterMedia}>
                  <span className={styles.chapterNumber} aria-hidden="true">{number}</span>
                  <Link
                    className={styles.mediaLink}
                    href={`/projects/${project.slug}`}
                    aria-label={`Open the ${project.title} case study`}
                    data-reveal
                  >
                    <span className={styles.mediaParallax} data-parallax="4">
                      <Frame media={project.media} sizes="(max-width: 900px) 92vw, 58vw" />
                    </span>
                  </Link>
                  {project.secondary && (
                    <figure className={styles.secondary} data-reveal>
                      <span className={styles.secondaryFrame} data-parallax="9">
                        <Image
                          src={project.secondary.src}
                          alt={project.secondary.alt}
                          width={project.secondary.width}
                          height={project.secondary.height}
                          sizes="(max-width: 900px) 40vw, 16vw"
                        />
                      </span>
                    </figure>
                  )}
                  {project.media.illustrated && <p className={styles.mediaNote}>Illustrated preview</p>}
                </div>

                <div className={styles.chapterCopy}>
                  <p className={styles.chapterMeta} data-reveal>
                    <span>{number} / {total}</span>
                    <span>{project.category}</span>
                  </p>
                  <h2 id={titleId} className={styles.chapterTitle} data-reveal>
                    {project.title}
                  </h2>
                  {project.tagline && (
                    <p className={styles.chapterTagline} data-reveal>{project.tagline}</p>
                  )}
                  <p className={styles.chapterSummary} data-reveal>{project.summary}</p>

                  {(project.role || project.period || project.status) && (
                    <dl className={styles.facts} data-stagger>
                      {project.role && (
                        <div>
                          <dt>Role</dt>
                          <dd>{project.role}</dd>
                        </div>
                      )}
                      {project.period && (
                        <div>
                          <dt>Period</dt>
                          <dd>{project.period}</dd>
                        </div>
                      )}
                      {project.status && (
                        <div>
                          <dt>Status</dt>
                          <dd>{project.status}</dd>
                        </div>
                      )}
                    </dl>
                  )}

                  {project.highlights.length > 0 && (
                    <ul className={styles.highlights} aria-label={`${project.title} highlights`} data-stagger>
                      {project.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  )}

                  <p className={styles.stack} data-reveal>
                    <span className={styles.srOnly}>Built with: </span>
                    {project.stack.join(" · ")}
                  </p>

                  <div className={styles.actions} data-reveal>
                    <Link className="ui-btn ui-btn--primary" href={`/projects/${project.slug}`}>
                      Read the Case Study
                    </Link>
                    {project.liveUrl && (
                      <a
                        className="ui-btn ui-btn--secondary"
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit the live ${project.title} site (opens in a new tab)`}
                      >
                        Live Site
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        className="ui-btn ui-btn--secondary"
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View the ${project.title} repository on GitHub (opens in a new tab)`}
                      >
                        Repository
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
