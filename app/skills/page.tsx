import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CERTIFICATES, LEARNING_EXPOSURE, PROFESSIONAL_SKILLS } from "@/components/about/aboutData";
import EditorialMotion from "@/components/motion/EditorialMotion";
import CertificateCarousel from "@/components/skills/CertificateCarousel";
import PracticeIndex from "@/components/skills/PracticeIndex";
import SkillsHero from "@/components/skills/SkillsHero";
import SkillsPointer from "@/components/skills/SkillsPointer";
import StackConstellation from "@/components/skills/StackConstellation";
import { PRACTICE_AREAS, SKILL_PROJECTS, STACK_SIDES } from "@/components/skills/skillsData";
import styles from "@/components/skills/Skills.module.css";

export const metadata: Metadata = {
  title: "Skills | Fatima Sierra",
  description:
    "The languages, frameworks, tools and practices Fatima Klye M. Sierra uses to build responsive web and mobile applications — Next.js, React, TypeScript, Flutter, Supabase and more.",
};

// Featured certifications lead the rail; the rest follow in their existing order.
const CAROUSEL_CERTIFICATES = [
  ...CERTIFICATES.filter((certificate) => certificate.featured),
  ...CERTIFICATES.filter((certificate) => !certificate.featured),
];

const PROJECT_IMAGES = Object.fromEntries(SKILL_PROJECTS.map((project) => [project.slug, project.image]));

export default function SkillsPage() {
  return (
    <EditorialMotion>
      <main className={styles.page}>
        <SkillsHero />

        <section className={`${styles.section} ${styles.stage}`} id="stack" aria-labelledby="stack-title" data-nav-label="Core stack">
          <div className={styles.container}>
            <header className={styles.splitHead}>
              <div>
                <p className={styles.kicker} data-reveal>01 — Core stack</p>
                <h2 id="stack-title" className={styles.title} data-reveal>
                  Every tool, <em>wired to the work.</em>
                </h2>
              </div>
              <p className={styles.headNote} data-reveal>
                Each line joins a technology to a project whose stack lists it. Hover, tap or tab through a
                technology to see how I use it — or point at a project to trace what it was built with.
              </p>
            </header>
            <StackConstellation sides={STACK_SIDES} projects={SKILL_PROJECTS} initial="React" />
          </div>
        </section>

        <section className={styles.section} id="practice" aria-labelledby="practice-title" data-nav-label="In practice">
          <div className={styles.container}>
            <header className={styles.splitHead}>
              <div>
                <p className={styles.kicker} data-reveal>02 — In practice</p>
                <h2 id="practice-title" className={styles.title} data-reveal>
                  What the stack <em>turns into.</em>
                </h2>
              </div>
              <p className={styles.headNote} data-reveal>
                Three areas I build in, and five practices that keep the work usable, tested and easy to hand
                over.
              </p>
            </header>
            <PracticeIndex areas={PRACTICE_AREAS} images={PROJECT_IMAGES} />
          </div>
        </section>

        <section className={`${styles.section} ${styles.surface}`} id="still-learning" aria-labelledby="growing-title" data-nav-label="Still learning">
          <div className={styles.container}>
            <header className={styles.splitHead}>
              <div>
                <p className={styles.kicker} data-reveal>03 — Still learning</p>
                <h2 id="growing-title" className={styles.title} data-reveal>
                  Always adding <em>to the recipe.</em>
                </h2>
              </div>
              <p className={styles.headNote} data-reveal>
                Concepts I&apos;ve explored through workshops, webinars and training — each one backed by a
                certificate. Drag, swipe or use the arrows to browse; select one to see it up close.
              </p>
            </header>

            <CertificateCarousel certificates={CAROUSEL_CERTIFICATES} />

            <div className={styles.viewAll} data-reveal>
              <Link className="ui-btn ui-btn--secondary" href="/certifications" data-magnetic>
                View All Certifications
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.growingLists}>
              <div>
                <h3 className={styles.listLabel}>Technical exposure</h3>
                <ul className={styles.pills} data-stagger>
                  {LEARNING_EXPOSURE.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={styles.listLabel}>Professional skills</h3>
                <ul className={styles.pills} data-stagger>
                  {PROFESSIONAL_SKILLS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <SkillsPointer />
      </main>
    </EditorialMotion>
  );
}
