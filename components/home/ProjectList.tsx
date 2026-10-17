import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS } from "@/components/projects/projectsData";
import { getProjectDetailBySlug } from "@/data/projectDetailsData";
import styles from "./ProjectList.module.css";

/** The one project the homepage leads with; every other project lives on /projects. */
const FEATURED_SLUG = "ignis-safe-website";

/**
 * Homepage featured project. Every line is read from the verified case-study data:
 * what it is, my role, the part I built, the stack, its status and its links.
 */
export default function ProjectList() {
  const project = PROJECTS.find((entry) => entry.slug === FEATURED_SLUG);

  if (!project) {
    return null;
  }

  const detail = getProjectDetailBySlug(project.slug);
  const caseStudy = `/projects/${project.slug}`;
  const role = detail?.roles?.[0] ?? detail?.role;
  const built = detail?.contributions?.find((entry) => entry.area === "Development")?.text;
  const liveUrl = detail?.links.liveUrl;
  const codeUrl = detail?.links.repoUrl ?? project.repoUrl ?? project.externalUrl;
  const hero = detail?.hero;

  return (
    <article className={styles.featured} aria-labelledby="featured-project-title" data-reveal>
      <Link className={styles.media} href={caseStudy} tabIndex={-1} aria-hidden="true">
        <Image
          src={hero?.src ?? project.image}
          alt={hero?.alt ?? project.imageAlt}
          fill
          sizes="(max-width: 960px) 100vw, 640px"
          className={styles.image}
        />
      </Link>

      <div className={styles.body}>
        <p className={styles.meta}>
          <span className={styles.index}>Featured</span>
          <span>{project.category}</span>
        </p>
        <h3 id="featured-project-title" className={styles.title}>
          <Link href={caseStudy}>{project.title}</Link>
        </h3>
        <p className={styles.summary}>{project.description}</p>

        <dl className={styles.facts}>
          {role && (
            <div>
              <dt>My role</dt>
              <dd>
                {role}
                {detail?.period && <span className={styles.period}> · {detail.period}</span>}
              </dd>
            </div>
          )}
          {built && (
            <div>
              <dt>I built</dt>
              <dd>{built}</dd>
            </div>
          )}
          <div>
            <dt>Stack</dt>
            <dd>
              <ul className={styles.stack} aria-label={`${project.title} technologies`}>
                {project.technologies.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </dd>
          </div>
          {detail?.status && (
            <div>
              <dt>Status</dt>
              <dd className={styles.status}>{detail.status}</dd>
            </div>
          )}
        </dl>

        <div className={styles.links}>
          <Link className="ui-btn ui-btn--primary ui-btn--sm" href={caseStudy} aria-label={`${project.title} case study`}>
            Case Study <ArrowRight size={15} aria-hidden="true" />
          </Link>
          {liveUrl && (
            <a
              className="ui-btn ui-btn--secondary ui-btn--sm"
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} live site (opens in a new tab)`}
            >
              Live Site <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          )}
          {codeUrl && (
            <a
              className="ui-btn ui-btn--secondary ui-btn--sm"
              href={codeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} source code on GitHub (opens in a new tab)`}
            >
              Code <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
