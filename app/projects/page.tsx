import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/editorial/PageHero";
import EditorialMotion from "@/components/motion/EditorialMotion";
import ProjectsShowcase, { SHOWCASE_PROJECTS } from "@/components/projects/ProjectsShowcase";
import styles from "@/components/projects/ProjectsShowcase.module.css";

export const metadata: Metadata = {
  title: "Projects | Fatima Sierra",
  description:
    "Web and mobile projects by Fatima Klye M. Sierra — public-safety platforms, campus systems and commerce apps built with Next.js, React, Flutter and Supabase.",
};

const count = (predicate: (project: (typeof SHOWCASE_PROJECTS)[number]) => boolean) =>
  String(SHOWCASE_PROJECTS.filter(predicate).length).padStart(2, "0");

export default function ProjectsPage() {
  return (
    <EditorialMotion>
      <main>
        <PageHero
          label="Projects"
          eyebrow="Selected work"
          index={String(SHOWCASE_PROJECTS.length).padStart(2, "0")}
          title={<>Systems built for <em>real people.</em></>}
          intro="Every project here started with a practical need — a fire station, a campus office, a small business — and ended with a clearer way to get something done. Open any of them for the full case study."
          meta={[
            { label: "Projects", value: String(SHOWCASE_PROJECTS.length).padStart(2, "0") },
            { label: "Web", value: count((project) => project.category.startsWith("Web")) },
            { label: "Mobile", value: count((project) => project.category.startsWith("Mobile")) },
            { label: "Live", value: count((project) => Boolean(project.liveUrl)) },
          ]}
        />

        <ProjectsShowcase />

        <section className={styles.closing} aria-labelledby="projects-closing-title">
          <h2 id="projects-closing-title" className={styles.closingTitle} data-reveal>
            Have a problem worth <em>building for?</em>
          </h2>
          <div className={styles.closingActions} data-reveal>
            <Link className="ui-btn ui-btn--light" href="/contact">
              Let&apos;s Work Together
            </Link>
            <Link className="ui-btn ui-btn--ghost-light" href="/skills">
              See the Toolkit
            </Link>
          </div>
        </section>
      </main>
    </EditorialMotion>
  );
}
