import type { Metadata } from "next";
import Link from "next/link";
import {
  CAPABILITIES,
  CORE_KNOWLEDGE,
  LEARNING_EXPOSURE,
  PROFESSIONAL_SKILLS,
} from "@/components/about/aboutData";
import PageHero from "@/components/editorial/PageHero";
import EditorialMotion from "@/components/motion/EditorialMotion";
import SkillsExplorer from "@/components/skills/SkillsExplorer";
import { ALL_SKILLS, SKILL_GROUPS } from "@/components/skills/skillsData";
import styles from "@/components/skills/Skills.module.css";

export const metadata: Metadata = {
  title: "Skills | Fatima Sierra",
  description:
    "The languages, frameworks, tools and practices Fatima Klye M. Sierra uses to build responsive web and mobile applications — Next.js, React, TypeScript, Flutter, Supabase and more.",
};

const pad = (value: number) => String(value).padStart(2, "0");

export default function SkillsPage() {
  return (
    <EditorialMotion>
      <main>
        <PageHero
          label="Skills"
          eyebrow="Technical expertise"
          index={pad(ALL_SKILLS.length)}
          title={<>A toolkit for <em>working products.</em></>}
          intro="The languages, frameworks and tools I reach for — and the practices around them. Select any technology to see the projects where I actually used it."
          meta={[
            { label: "Technologies", value: pad(ALL_SKILLS.length) },
            { label: "Categories", value: pad(SKILL_GROUPS.length) },
            { label: "Core areas", value: pad(CORE_KNOWLEDGE.length) },
          ]}
        />

        <section className={styles.section} aria-labelledby="toolkit-title">
          <div className={styles.container}>
            <header className={styles.head}>
              <p className={styles.kicker} data-reveal>01 — Toolkit</p>
              <h2 id="toolkit-title" className={styles.title} data-reveal>
                Languages, frameworks <em>&amp; tools.</em>
              </h2>
            </header>
            <SkillsExplorer groups={SKILL_GROUPS} />
          </div>
        </section>

        <section className={`${styles.section} ${styles.surface}`} aria-labelledby="capabilities-title">
          <div className={styles.container}>
            <header className={styles.head}>
              <p className={styles.kicker} data-reveal>02 — Capabilities</p>
              <h2 id="capabilities-title" className={styles.title} data-reveal>
                What I can <em>take on.</em>
              </h2>
            </header>
            <ol className={styles.verbs}>
              {CAPABILITIES.map((capability) => (
                <li className={styles.verbRow} key={capability.id} data-reveal>
                  <span className={styles.verb}>{capability.verb}</span>
                  <div>
                    <h3 className={styles.verbTitle}>{capability.title}</h3>
                    <p className={styles.verbText}>{capability.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="knowledge-title">
          <div className={styles.container}>
            <header className={styles.head}>
              <p className={styles.kicker} data-reveal>03 — Knowledge areas</p>
              <h2 id="knowledge-title" className={styles.title} data-reveal>
                The practice <em>around the code.</em>
              </h2>
            </header>
            <ol className={styles.knowledge} data-stagger>
              {CORE_KNOWLEDGE.map((item, index) => (
                <li className={styles.knowledgeItem} key={item.title}>
                  <span className={styles.knowledgeIndex} aria-hidden="true">{pad(index + 1)}</span>
                  <h3 className={styles.knowledgeTitle}>{item.title}</h3>
                  <p className={styles.knowledgeText}>{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${styles.section} ${styles.surface}`} aria-labelledby="growing-title">
          <div className={`${styles.container} ${styles.growing}`}>
            <div>
              <p className={styles.kicker} data-reveal>04 — Still learning</p>
              <h2 id="growing-title" className={styles.title} data-reveal>
                Always adding <em>to the recipe.</em>
              </h2>
              <p className={styles.growingIntro} data-reveal>
                Concepts I&apos;ve explored through workshops, webinars and training — each one backed by a
                certificate.
              </p>
              <Link className={styles.textLink} href="/certifications" data-reveal>
                See the certificates <span aria-hidden="true">→</span>
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
      </main>
    </EditorialMotion>
  );
}
