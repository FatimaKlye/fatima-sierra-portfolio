import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "@/components/projects/projectsData";
import { getProjectDetailBySlug, type ProjectDetail, type ProjectMedia } from "@/data/projectDetailsData";
import styles from "./ProjectList.module.css";

/** Real phone screenshots side by side; the lead screen stands taller in the middle. */
function PhoneScreens({ lead, companions }: { lead: ProjectMedia; companions: ProjectMedia[] }) {
  const [left, right] = companions;
  const row = [left, lead, right].filter((screen): screen is ProjectMedia => Boolean(screen));

  return (
    <span className={styles.phones}>
      {row.map((screen) => {
        const isLead = screen === lead;
        return (
          <span className={isLead ? `${styles.phone} ${styles.phoneLead}` : styles.phone} key={screen.src}>
            <Image src={screen.src} alt={isLead ? screen.alt : ""} fill sizes="180px" className={styles.phoneImage} />
          </span>
        );
      })}
    </span>
  );
}

function ProjectVisual({ project, detail, featured }: { project: Project; detail?: ProjectDetail; featured: boolean }) {
  const hero = detail?.hero;

  if (hero?.frame === "phone") {
    return <PhoneScreens lead={hero} companions={(detail?.heroCompanions ?? []).slice(0, 2)} />;
  }

  return (
    <Image
      src={hero?.src ?? project.image}
      alt={hero?.alt ?? project.imageAlt}
      fill
      sizes={featured ? "(max-width: 820px) 100vw, 640px" : "(max-width: 820px) 100vw, 600px"}
      className={styles.image}
    />
  );
}

/**
 * Homepage project index. Every line is read from the verified case-study data:
 * what it is, my role, the part I built, the stack, its status and its links.
 * Rows without a verified role or contribution simply leave that line out.
 */
export default function ProjectList() {
  return (
    <ol className={styles.list}>
      {PROJECTS.map((project, index) => {
        const detail = getProjectDetailBySlug(project.slug);
        const featured = index === 0;
        const caseStudy = `/projects/${project.slug}`;
        const role = detail?.roles?.[0] ?? detail?.role;
        const built = detail?.contributions?.find((entry) => entry.area === "Development")?.text;
        const liveUrl = detail?.links.liveUrl;
        const codeUrl = detail?.links.repoUrl ?? project.repoUrl ?? project.externalUrl;

        return (
          <li className={featured ? `${styles.item} ${styles.featured}` : styles.item} key={project.id} data-reveal>
            <Link
              className={styles.media}
              href={caseStudy}
              tabIndex={-1}
              aria-hidden="true"
              data-phone={detail?.hero?.frame === "phone" ? "" : undefined}
            >
              <ProjectVisual project={project} detail={detail} featured={featured} />
            </Link>

            <div className={styles.body}>
              <p className={styles.meta}>
                <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                <span>{project.category}</span>
              </p>
              <h3 className={styles.title}>
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
          </li>
        );
      })}
    </ol>
  );
}
