import type { Metadata } from "next";
import EditorialMotion from "@/components/motion/EditorialMotion";
import BeyondTheCode from "@/components/skills/beyond/BeyondTheCode";
import PracticeIndex from "@/components/skills/PracticeIndex";
import SkillsHero from "@/components/skills/SkillsHero";
import SkillsPointer from "@/components/skills/SkillsPointer";
import StackConstellation from "@/components/skills/StackConstellation";
import { PRACTICE_AREAS, SKILL_PROJECTS, STACK_SIDES } from "@/components/skills/skillsData";
import styles from "@/components/skills/Skills.module.css";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/skills",
  title: "Skills | Fatima Sierra",
  description:
    "The languages, frameworks, tools and practices Fatima Klye M. Sierra uses to build responsive web and mobile applications — Next.js, React, TypeScript, Flutter, Supabase and more.",
});

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
                Three areas I build in, each shown with real screens from the projects, and five practices that
                keep the work usable, tested and easy to hand over.
              </p>
            </header>
            <PracticeIndex areas={PRACTICE_AREAS} />
          </div>
        </section>

        <section className={`${styles.section} ${styles.surface}`} id="beyond-the-code" aria-labelledby="beyond-title" data-nav-label="Beyond the code">
          <div className={styles.container}>
            <header className={styles.splitHead}>
              <div>
                <p className={styles.kicker} data-reveal>03 — Beyond the code</p>
                <h2 id="beyond-title" className={styles.title} data-reveal>
                  What I&apos;ve learned <em>beyond the code.</em>
                </h2>
              </div>
              <p className={styles.headNote} data-reveal>
                The certificates that record my structured learning, the topics they introduced me to — marked
                honestly as exposure or practice — and how I work with the people around me.
              </p>
            </header>

            <BeyondTheCode />
          </div>
        </section>

        <SkillsPointer />
      </main>
    </EditorialMotion>
  );
}
