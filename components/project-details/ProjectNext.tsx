import Image from "next/image";
import Link from "next/link";
import type { ProjectDetail } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

type ProjectNextProps = {
  next: ProjectDetail | null;
  previous: ProjectDetail | null;
};

export default function ProjectNext({ next, previous }: ProjectNextProps) {
  return (
    <section className={styles.next} aria-label="More projects">
      <div className={styles.container}>
        {next && (
          <Link href={`/projects/${next.slug}`} className={styles.nextLink} data-reveal>
            <span className={styles.nextCopy}>
              <span className={styles.eyebrow}>Next project</span>
              <span className={styles.nextTitle}>{next.title}</span>
              <span className={styles.nextCategory}>{next.category}</span>
              <span className={`ui-btn ui-btn--primary ${styles.nextCta}`} aria-hidden="true">
                View Project
              </span>
            </span>

            {next.hero && (
              <span className={styles.nextThumb} aria-hidden="true">
                <Image
                  src={next.hero.src}
                  alt=""
                  width={next.hero.width}
                  height={next.hero.height}
                  sizes="(min-width: 1024px) 30vw, 70vw"
                  quality={70}
                />
              </span>
            )}
          </Link>
        )}

        <div className={styles.nextFoot} data-reveal>
          <Link href="/projects" className="ui-btn ui-btn--primary">
            Back to Projects
          </Link>
          {previous && (
            <Link href={`/projects/${previous.slug}`} className="ui-btn ui-btn--secondary">
              Previous: {previous.title}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
