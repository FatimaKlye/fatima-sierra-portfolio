import Link from "next/link";
import {
  EDUCATION,
  HERO_CONTENT,
  LEARNING_EXPOSURE,
  TECHNOLOGY_GROUPS,
} from "./aboutData";
import { CursorCard } from "@/components/ui/CursorCard";
import styles from "@/app/about/AboutPage.module.css";

const FEATURED_SKILLS = [
  ...(TECHNOLOGY_GROUPS.find((group) => group.id === "frontend")?.items.slice(0, 4) ?? []),
  ...(TECHNOLOGY_GROUPS.find((group) => group.id === "mobile")?.items ?? []),
];

const FEATURED_INTERESTS = LEARNING_EXPOSURE.slice(0, 4);

// Hover-preview content for the About Me intro paragraph. Purely decorative
// UI flavor (not resume facts) — image paths are isolated here for easy swaps.
const INTRO_HOVER_TERMS = {
  interfaceDevelopment: {
    image: "/assets/projects/beautiverse/hero.svg",
    description: "Designing clean interfaces that are simple to use.",
  },
  databaseIntegration: {
    image: "/assets/projects/itso-id-tracker/screen-dashboard.svg",
    description: "Connecting features to structured, reliable data.",
  },
  applicationTesting: {
    image: "/assets/projects/focusit/focusit-screenshot.png",
    description: "Testing features to catch issues before launch.",
  },
  systemDocumentation: {
    image: "/assets/projects/itso-id-tracker/screen-detail.svg",
    description: "Writing clear docs so systems stay easy to maintain.",
  },
  aiAssistedDevelopment: {
    image: "/assets/projects/maddy-cassy/screenshot-1.webp",
    description: "Using AI tools to build and iterate faster.",
  },
} as const;

export default function AboutIntroSection() {
  const currentEducation = EDUCATION[0];

  return (
    <section className={styles.section} aria-labelledby="about-intro-heading">
      <div className={styles.sectionContainer}>
        <Link className={styles.introBackLink} href="/">
          <span aria-hidden="true">←</span> Back to Home
        </Link>

        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>{HERO_CONTENT.eyebrow}</p>
          <h1 id="about-intro-heading" className={styles.sectionTitle}>
            Developer mindset. <em>User-first thinking.</em>
          </h1>
          <p className={styles.storySubtitle}>{HERO_CONTENT.tagline}</p>
        </header>

        <div className={styles.introBody}>
          <div className={styles.introCopy}>
            <p>
              I develop responsive web and mobile applications that transform ideas and
              real-world requirements into functional digital systems. My work includes{" "}
              <CursorCard {...INTRO_HOVER_TERMS.interfaceDevelopment}>
                interface development
              </CursorCard>
              ,{" "}
              <CursorCard {...INTRO_HOVER_TERMS.databaseIntegration}>
                database integration
              </CursorCard>
              ,{" "}
              <CursorCard {...INTRO_HOVER_TERMS.applicationTesting}>
                application testing
              </CursorCard>
              ,{" "}
              <CursorCard {...INTRO_HOVER_TERMS.systemDocumentation}>
                system documentation
              </CursorCard>
              , and{" "}
              <CursorCard {...INTRO_HOVER_TERMS.aiAssistedDevelopment}>
                AI-assisted development
              </CursorCard>
              .
            </p>
            {HERO_CONTENT.introParagraphs.slice(1).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <div className={styles.introSubBlock}>
              <h3 className={styles.knowledgeSubheadingCompact}>Skills &amp; Tools I Reach For</h3>
              <ul className={styles.skillsList}>
                {FEATURED_SKILLS.map((skill) => (
                  <li key={skill.name} className={styles.skillItemCompact}>
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.introSubBlock}>
              <h3 className={styles.knowledgeSubheadingCompact}>Currently Exploring</h3>
              <ul className={styles.learningTagList}>
                {FEATURED_INTERESTS.map((item) => (
                  <li key={item} className={styles.learningTagCompact}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <dl className={styles.introMeta}>
            <div>
              <dt>Location</dt>
              <dd>{currentEducation.location}</dd>
            </div>
            <div>
              <dt>Education</dt>
              <dd>{currentEducation.detail}</dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>{HERO_CONTENT.statusLabel}</dd>
            </div>
            <div>
              <dt>Approach</dt>
              <dd>Clear, purposeful, and easy to use — built one tested step at a time.</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
