import Image from "next/image";
import Link from "next/link";
import { CAPABILITIES, CERTIFICATES, EDUCATION, HERO_CONTENT } from "@/components/about/aboutData";
import { SOCIAL_LINKS } from "@/components/contact/contactData";
import { EXPERIENCE_HIGHLIGHTS } from "@/components/experience/experienceData";
import { PROJECTS } from "@/components/projects/projectsData";
import TechIcon from "@/components/skills/TechIcon";
import { PREVIEW_SKILLS } from "@/components/skills/skillsData";
import AboutPreview from "./about/AboutPreview";
import CredentialsTeaser from "./CredentialsTeaser";
import PreviewHeader from "./PreviewHeader";
import WorkGallery from "./WorkGallery";
import { getGithubContributions } from "./githubContributions";
import styles from "./HeroSection.module.css";
import editorialStyles from "./HomeEditorial.module.css";

const CONTRIBUTION_LEVEL_COLORS = [
  "rgba(166, 61, 104, 0.08)",
  "var(--color-soft-blush)",
  "var(--color-secondary)",
  "var(--color-primary-hover)",
  "var(--color-primary)",
];

const TEASER_CREDENTIAL_IDS = ["html-and-css", "databases", "modern-web-ai-uiux"];
const TEASER_CREDENTIALS = TEASER_CREDENTIAL_IDS.flatMap((id) => {
  const certificate = CERTIFICATES.find((entry) => entry.id === id);
  return certificate ? [certificate] : [];
});
const CONTACT_LINK_IDS = ["linkedin", "github", "instagram", "facebook"];
const CONTACT_LINKS = CONTACT_LINK_IDS.flatMap((id) => {
  const link = SOCIAL_LINKS.find((item) => item.id === id);
  return link ? [link] : [];
});
const LINKEDIN_URL = SOCIAL_LINKS.find((link) => link.id === "linkedin")?.href;

/**
 * The homepage is a set of highlights: each section is a short preview that
 * links to the dedicated page holding the complete content.
 */
export default async function HeroSection() {
  const currentEducation = EDUCATION[0];
  const githubLink = SOCIAL_LINKS.find((item) => item.id === "github");
  const githubUsername = githubLink?.handle.replace(/^@/, "") ?? "";
  const githubContributions = githubUsername ? await getGithubContributions(githubUsername) : null;
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.home} data-home-page>
      <section className={styles.hero} id="home" aria-labelledby="home-hero-title">
        <div className={styles.technicalGrid} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={`${styles.heroCopy} ${styles.reveal}`}>
            <p className={styles.eyebrow}>Web &amp; Mobile Developer</p>
            <h1 id="home-hero-title">
              Designing and building <em>purposeful digital experiences.</em>
            </h1>
            <p className={styles.heroLead}>
              I create practical web and mobile applications with a focus on thoughtful interfaces,
              reliable functionality, and user-centered experiences.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} href="#projects">
                View Projects
              </Link>
              <Link className={styles.secondaryButton} href="#about">
                About Me
              </Link>
            </div>
            <dl className={styles.heroMeta}>
              <div><dt>Location</dt><dd>{currentEducation.location}</dd></div>
              <div><dt>Focus</dt><dd>{HERO_CONTENT.statusLabel}</dd></div>
            </dl>
          </div>

          <div className={`${styles.portraitComposition} ${styles.reveal}`}>
            <div className={styles.circleOne} aria-hidden="true" />
            <div className={styles.circleTwo} aria-hidden="true" />
            <div className={styles.circleThree} aria-hidden="true" />
            <div className={styles.codeGeometry} aria-hidden="true"><span>&lt;/&gt;</span></div>
            <div className={styles.portraitFrame}>
              <Image
                src="/assets/profile/profile_picture.jpg"
                alt="Professional portrait of Fatima Klye M. Sierra"
                fill
                priority
                sizes="(max-width: 820px) 88vw, 46vw"
                className={styles.portraitImage}
              />
            </div>
            <a
              className={styles.portraitLabel}
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open Fatima Klye M. Sierra on LinkedIn in a new tab"
            >
              FATIMA KLYE M. SIERRA
            </a>
          </div>
        </div>
      </section>

      <AboutPreview />

      <section className={editorialStyles.section} id="projects" aria-labelledby="projects-title">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <WorkGallery projects={PROJECTS} />
        </div>
      </section>

      <section className={editorialStyles.section} id="skills" aria-labelledby="skills-title">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <PreviewHeader
            number="03 — Skills"
            headingId="skills-title"
            title={<>A focused toolkit for <em>working products.</em></>}
            intro="The core technologies I use to turn real requirements into responsive, maintainable web and mobile apps."
            href="/skills"
            linkLabel="View All Skills"
          />
          <ul className={editorialStyles.toolStrip} aria-label="Main technologies">
            {PREVIEW_SKILLS.map((skill) => (
              <li className={editorialStyles.toolItem} key={skill.name}>
                <span className={editorialStyles.toolIcon}>
                  <TechIcon tech={skill} size={30} fallbackClassName={editorialStyles.toolFallback} />
                </span>
                <span className={editorialStyles.toolName}>{skill.name}</span>
              </li>
            ))}
          </ul>
          <p className={editorialStyles.verbLine}>
            {CAPABILITIES.map((capability) => (
              <span key={capability.id}>{capability.verb}.</span>
            ))}
          </p>
        </div>
      </section>

      <section className={`${editorialStyles.section} ${editorialStyles.surfaceSection}`} id="experience" aria-labelledby="experience-title">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <PreviewHeader
            number="04 — Experience & Education"
            headingId="experience-title"
            title={<>Building, studying, <em>growing.</em></>}
            intro="The roles, studies and recognition that shaped how I approach product work."
            href="/experience"
            linkLabel="View Full Journey"
          />
          <div className={editorialStyles.timeline}>
            {EXPERIENCE_HIGHLIGHTS.map((entry) => (
              <article className={editorialStyles.timelineRow} key={entry.type}>
                <p className={editorialStyles.timelineDate}>{entry.date}</p>
                <p className={editorialStyles.timelineType}>{entry.type}</p>
                <div>
                  <h3 className={editorialStyles.timelineTitle}>{entry.title}</h3>
                  <p className={editorialStyles.timelineDetail}>{entry.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${editorialStyles.section} ${editorialStyles.surfaceSection}`} aria-labelledby="credentials-title">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <CredentialsTeaser certificates={TEASER_CREDENTIALS} />
        </div>
      </section>

      <section className={`${editorialStyles.section} ${editorialStyles.githubSection}`} id="github" aria-labelledby="github-title">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <div className={editorialStyles.githubHeader}>
            <p className={editorialStyles.eyebrow} id="github-title">06 — GitHub activity</p>
            {githubLink && (
              <a className={editorialStyles.githubHandle} href={githubLink.href} target="_blank" rel="noreferrer" aria-label={`Open ${githubLink.handle} on GitHub in a new tab`}>
                {githubLink.handle}<span className={editorialStyles.externalArrow} aria-hidden="true">↗</span>
              </a>
            )}
          </div>

          {githubContributions ? (
            <div className={editorialStyles.githubBody}>
              <div className={editorialStyles.githubGridScroll}>
                <div className={editorialStyles.githubGrid} role="img" aria-label={`GitHub contribution graph: ${githubContributions.totalLastYear} contributions in ${currentYear}`}>
                  {githubContributions.weeks.map((week, weekIndex) => (
                    <div className={editorialStyles.githubWeek} key={weekIndex}>
                      {week.map((day, dayIndex) => day ? (
                        <span className={editorialStyles.githubDay} key={day.date} style={{ backgroundColor: CONTRIBUTION_LEVEL_COLORS[day.level] ?? CONTRIBUTION_LEVEL_COLORS[0] }} title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`} />
                      ) : (
                        <span className={`${editorialStyles.githubDay} ${editorialStyles.githubDayEmpty}`} key={`empty-${weekIndex}-${dayIndex}`} aria-hidden="true" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <p className={editorialStyles.githubCount}><strong>{githubContributions.totalLastYear.toLocaleString()}</strong> contributions in {currentYear}</p>
            </div>
          ) : (
            <p className={editorialStyles.githubFallback}>Activity graph is temporarily unavailable — view the profile directly on GitHub.</p>
          )}
        </div>
      </section>

      <section className={`${editorialStyles.section} ${editorialStyles.contactSection}`} id="contact" aria-labelledby="contact-title">
        <div className={`${editorialStyles.container} ${editorialStyles.contactInner}`}>
          <div className={editorialStyles.contactCopy}>
            <p className={editorialStyles.sectionNumber}>07 — Contact</p>
            <h2 id="contact-title" className={editorialStyles.contactTitle}>
              Have something in mind? <em>Let&apos;s talk.</em>
            </h2>
          </div>
          <div className={editorialStyles.contactActions}>
            <p className={editorialStyles.contactLead}>
              I&apos;m open to internships and new roles, and always happy to talk about web and mobile work.
            </p>
            <Link className={styles.primaryButton} href="/contact">
              Start a Conversation <span aria-hidden="true">→</span>
            </Link>
            <ul className={editorialStyles.contactLinksRow} aria-label="Social links">
              {CONTACT_LINKS.map((link) => (
                <li key={link.id}>
                  <a href={link.href} target="_blank" rel="noreferrer" aria-label={`${link.label} (opens in a new tab)`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
