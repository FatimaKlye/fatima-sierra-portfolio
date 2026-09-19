import Image from "next/image";
import Link from "next/link";
import {
  CERTIFICATES,
  CORE_KNOWLEDGE,
  EDUCATION,
  HERO_CONTENT,
  TECHNOLOGY_GROUPS,
} from "@/components/about/aboutData";
import { SOCIAL_LINKS } from "@/components/contact/contactData";
import { PROJECTS } from "@/components/projects/projectsData";
import SocialFlipButton, { type SocialFlipItem } from "@/components/ui/SocialFlipButton";
import ContactCTA from "./ContactCTA";
import CredentialsTeaser from "./CredentialsTeaser";
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

const CAPABILITY_GROUPS = [
  {
    title: "Web Development",
    items: TECHNOLOGY_GROUPS.find((group) => group.id === "frontend")?.items ?? [],
    description: CORE_KNOWLEDGE.find((item) => item.title === "Web Application Development")?.description,
  },
  {
    title: "Mobile Development",
    items: TECHNOLOGY_GROUPS.find((group) => group.id === "mobile")?.items ?? [],
    description: CORE_KNOWLEDGE.find((item) => item.title === "Mobile Application Development")?.description,
  },
  {
    title: "Backend & Tools",
    items: [
      ...(TECHNOLOGY_GROUPS.find((group) => group.id === "backend-database")?.items ?? []),
      ...(TECHNOLOGY_GROUPS.find((group) => group.id === "tools")?.items ?? []),
    ].slice(0, 6),
    description: CORE_KNOWLEDGE.find((item) => item.title === "Database Integration")?.description,
  },
];

const JOURNEY_CREDENTIALS = CERTIFICATES.filter(
  (certificate) => certificate.featured && certificate.date,
).slice(0, 3);
const TEASER_CREDENTIAL_IDS = ["html-and-css", "databases", "modern-web-ai-uiux"];
const TEASER_CREDENTIALS = TEASER_CREDENTIAL_IDS.flatMap((id) => {
  const certificate = CERTIFICATES.find((entry) => entry.id === id);
  return certificate ? [certificate] : [];
});
const PROFESSIONAL_LINKS = ["linkedin", "github", "email"].flatMap((id) => {
  const link = SOCIAL_LINKS.find((item) => item.id === id);
  return link ? [link] : [];
});
const LINKEDIN_URL = SOCIAL_LINKS.find((link) => link.id === "linkedin")?.href;

const SOCIAL_FLIP_ITEMS: SocialFlipItem[] = PROFESSIONAL_LINKS.map((link) => ({
  id: link.id,
  label: link.label,
  letter: link.label.charAt(0),
  iconSrc: link.icon,
  href: link.id === "email" ? `mailto:${link.handle}` : link.href,
  external: link.id !== "email",
}));

const FOOTER_NAV_LINKS = [
  { href: "/about", label: "about" },
  { href: "#projects", label: "projects" },
  { href: "#skills", label: "skills" },
  { href: "#contact", label: "contact" },
];

export default async function HeroSection() {
  const currentEducation = EDUCATION[0];
  const githubLink = SOCIAL_LINKS.find((item) => item.id === "github");
  const githubUsername = githubLink?.handle.replace(/^@/, "") ?? "";
  const githubContributions = githubUsername ? await getGithubContributions(githubUsername) : null;
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.home} data-home-page>
      <section className={styles.hero} aria-labelledby="home-hero-title">
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
              <Link className={styles.secondaryButton} href="/about">
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

      <section className={editorialStyles.section} id="projects" aria-labelledby="projects-title">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <WorkGallery projects={PROJECTS} />
        </div>
      </section>

      <section className={editorialStyles.section} id="skills" aria-labelledby="skills-title">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <header className={editorialStyles.sectionHeader}>
            <p className={editorialStyles.sectionNumber}>02 — Capabilities</p>
            <div>
              <h2 id="skills-title" className={editorialStyles.sectionTitle}>A focused toolkit for <em>working products.</em></h2>
              <p className={editorialStyles.sectionIntro}>The technologies and practices I use to turn real requirements into responsive, maintainable experiences.</p>
            </div>
          </header>
          <div className={editorialStyles.capabilityList}>
            {CAPABILITY_GROUPS.map((group, index) => (
              <article className={editorialStyles.capabilityRow} key={group.title}>
                <span className={editorialStyles.capabilityIndex}>0{index + 1}</span>
                <h3 className={editorialStyles.capabilityTitle}>{group.title}</h3>
                <div>
                  <p className={editorialStyles.capabilityDescription}>{group.description}</p>
                  <ul className={editorialStyles.capabilityTags}>{group.items.map((item) => <li key={item.name}>{item.name}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${editorialStyles.section} ${editorialStyles.surfaceSection}`} id="experience" aria-labelledby="journey-title">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <header className={editorialStyles.sectionHeader}>
            <p className={editorialStyles.sectionNumber}>03 — Journey</p>
            <div>
              <h2 id="journey-title" className={editorialStyles.sectionTitle}>Learning through <em>building.</em></h2>
              <p className={editorialStyles.sectionIntro}>Education and focused technical learning that continue to shape how I approach product work.</p>
            </div>
          </header>
          <div className={editorialStyles.timeline}>
            {EDUCATION.slice(0, 2).map((entry) => (
              <article className={editorialStyles.timelineRow} key={entry.institution}>
                <p className={editorialStyles.timelineDate}>{entry.years}</p>
                <p className={editorialStyles.timelineType}>Education</p>
                <div><h3 className={editorialStyles.timelineTitle}>{entry.institution}</h3><p className={editorialStyles.timelineDetail}>{entry.detail || entry.location}</p></div>
              </article>
            ))}
            {JOURNEY_CREDENTIALS.map((entry) => (
              <article className={editorialStyles.timelineRow} key={entry.id}>
                <p className={editorialStyles.timelineDate}>{entry.date}</p>
                <p className={editorialStyles.timelineType}>{entry.type}</p>
                <div><h3 className={editorialStyles.timelineTitle}>{entry.title}</h3><p className={editorialStyles.timelineDetail}>{entry.issuer}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={editorialStyles.approach} aria-labelledby="approach-title">
        <div className={editorialStyles.approachInner}>
          <p className={editorialStyles.eyebrow}>04 — My approach</p>
          <h2 id="approach-title" className={editorialStyles.approachTitle}>Good digital products should feel <em>clear, purposeful,</em> and easy to use.</h2>
        </div>
      </section>

      <section className={`${editorialStyles.section} ${editorialStyles.surfaceSection}`} aria-labelledby="credentials-title">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <CredentialsTeaser certificates={TEASER_CREDENTIALS} />
        </div>
      </section>

      <section className={editorialStyles.section} id="github" aria-labelledby="github-title">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <div className={editorialStyles.githubHeader}>
            <p className={editorialStyles.eyebrow} id="github-title">06 — GitHub evidence</p>
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
        <div className={`${editorialStyles.container} ${editorialStyles.contactInner} mx-auto w-full`}>
          <div>
            <p className={editorialStyles.eyebrow}>07 — Let&apos;s connect</p>
            <h2 id="contact-title" className={editorialStyles.contactTitle}>Have an opportunity or <em>project in mind?</em></h2>
          </div>
          <div className={editorialStyles.contactCopy}>
            <p>I&apos;m open to internship opportunities where I can contribute, learn, and continue developing practical web and mobile solutions.</p>
            <div className={editorialStyles.contactActions}>
              <ContactCTA />
              <SocialFlipButton items={SOCIAL_FLIP_ITEMS} className={editorialStyles.contactSocials} />
            </div>
          </div>
        </div>
      </section>

      <footer className={editorialStyles.footer}>
        <div className={editorialStyles.footerGrid}>
          <div><Link className={editorialStyles.footerBrand} href="/">Fatima Sierra</Link><p className={editorialStyles.footerDescription}>Web &amp; Mobile Developer creating purposeful digital experiences.</p></div>
          <div><p className={editorialStyles.footerLabel}>Navigate</p><nav>{FOOTER_NAV_LINKS.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav></div>
          <div><p className={editorialStyles.footerLabel}>Connect</p><nav>{PROFESSIONAL_LINKS.map((link) => <a href={link.href} target="_blank" rel="noreferrer" key={link.id}>{link.label}</a>)}</nav></div>
          <div><p className={editorialStyles.footerLabel}>Education</p><p className={editorialStyles.footerEducation}>{currentEducation.detail}<br />Mobile &amp; Web Applications</p></div>
        </div>
        <div className={editorialStyles.footerBottom}><span>© 2026 Fatima Sierra</span><span>Designed &amp; developed by Fatima Sierra</span></div>
      </footer>
    </div>
  );
}
