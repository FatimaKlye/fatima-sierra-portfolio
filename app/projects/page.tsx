import type { Metadata } from "next";
import Link from "next/link";
import ProjectChapters from "@/components/projects/ProjectChapters";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsMotion from "@/components/projects/ProjectsMotion";
import styles from "@/components/projects/ProjectsPage.module.css";

export const metadata: Metadata = {
  title: "Projects | Fatima Sierra",
  description:
    "Web and mobile projects by Fatima Klye M. Sierra — public-safety platforms, campus systems and commerce apps built with Next.js, React, Flutter and Supabase.",
};

export default function ProjectsPage() {
  return (
    <ProjectsMotion>
      <main>
        <ProjectsHero />

        <ProjectChapters />

        <section className={styles.closing} id="work-together" aria-labelledby="projects-closing-title" data-nav-label="Work together">
          <div className={styles.closingInner}>
            <p className={styles.closingKicker} data-reveal>
              Next project
            </p>
            <h2 id="projects-closing-title" className={styles.closingTitle}>
              <span className={styles.mask}>
                <span data-word>Have a problem</span>
              </span>{" "}
              <em>
                <span className={styles.mask}>
                  <span data-word>worth building for?</span>
                </span>
              </em>
            </h2>
            <div className={styles.closingActions} data-reveal>
              <span className={styles.magnet} data-magnetic>
                <Link className="ui-btn ui-btn--light ui-btn--lg" href="/contact">
                  Let&apos;s Work Together
                </Link>
              </span>
              <Link className="ui-btn ui-btn--ghost-light ui-btn--lg" href="/skills">
                See the Toolkit
              </Link>
            </div>
          </div>
        </section>
      </main>
    </ProjectsMotion>
  );
}
