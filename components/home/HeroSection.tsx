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

const CONTRIBUTION_LEVEL_COLORS = [
  "rgba(166, 61, 104, 0.08)",
  "#F6DDE7",
  "#C982A2",
  "#B85078",
  "#A63D68",
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
            <p className={styles.portraitLabel}>Interface development · Reliable systems</p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.projectsSection}`} id="projects" aria-labelledby="projects-title">
        <div className={`${styles.sectionInner} ${styles.reveal}`}>
          <WorkGallery projects={PROJECTS} />
        </div>
      </section>

      <section className={styles.section} id="skills" aria-labelledby="skills-title">
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeading} ${styles.reveal}`}>
            <p className={styles.eyebrow}>Capabilities</p>
            <h2 id="skills-title">Tools I use to turn ideas into <em>working products.</em></h2>
          </div>
          <div className={styles.capabilityGrid}>
            {CAPABILITY_GROUPS.map((group, index) => (
              <article className={`${styles.capability} ${styles.reveal}`} key={group.title}>
                <span className={styles.capabilityIndex}>0{index + 1}</span>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <ul>{group.items.map((item) => <li key={item.name}>{item.name}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.journeySection}`} id="experience" aria-labelledby="journey-title">
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeading} ${styles.reveal}`}>
            <p className={styles.eyebrow}>Journey</p>
            <h2 id="journey-title">Learning through <em>building.</em></h2>
          </div>
          <div className={styles.timeline}>
            {EDUCATION.slice(0, 2).map((entry) => (
              <article className={`${styles.timelineRow} ${styles.reveal}`} key={entry.institution}>
                <p className={styles.timelineDate}>{entry.years}</p>
                <div><p className={styles.timelineType}>Education</p><h3>{entry.institution}</h3><p>{entry.detail || entry.location}</p></div>
              </article>
            ))}
            {JOURNEY_CREDENTIALS.map((entry) => (
              <article className={`${styles.timelineRow} ${styles.reveal}`} key={entry.id}>
                <p className={styles.timelineDate}>{entry.date}</p>
                <div><p className={styles.timelineType}>{entry.type}</p><h3>{entry.title}</h3><p>{entry.issuer}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.approach} aria-labelledby="approach-title">
        <div className={styles.approachDecoration} aria-hidden="true" />
        <div className={`${styles.approachInner} ${styles.reveal}`}>
          <p className={styles.approachEyebrow}>My Approach</p>
          <h2 id="approach-title">Good digital products should feel <em>clear, purposeful,</em> and easy to use.</h2>
        </div>
      </section>

      <section className={`${styles.section} ${styles.credentialsSection}`} aria-labelledby="credentials-title">
        <div className={`${styles.sectionInner} ${styles.reveal}`}>
          <CredentialsTeaser certificates={TEASER_CREDENTIALS} />
        </div>
      </section>

      <section className={styles.section} id="github" aria-labelledby="github-title">
        <div className={styles.sectionInner}>
          <div className={`${styles.githubHeader} ${styles.reveal}`}>
            <p className={styles.eyebrow} id="github-title">07 — GitHub</p>
            {githubLink && (
              <a
                className={styles.githubHandle}
                href={githubLink.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${githubLink.handle} on GitHub in a new tab`}
              >
                {githubLink.handle}
                <span className={styles.externalArrow} aria-hidden="true">↗</span>
              </a>
            )}
          </div>

          {githubContributions ? (
            <div className={`${styles.githubBody} ${styles.reveal}`}>
              <div className={styles.githubGridScroll}>
                <div
                  className={styles.githubGrid}
                  role="img"
                  aria-label={`GitHub contribution graph: ${githubContributions.totalLastYear} contributions in ${currentYear}`}
                >
                  {githubContributions.weeks.map((week, weekIndex) => (
                    <div className={styles.githubWeek} key={weekIndex}>
                      {week.map((day, dayIndex) =>
                        day ? (
                          <span
                            className={styles.githubDay}
                            key={day.date}
                            style={{ backgroundColor: CONTRIBUTION_LEVEL_COLORS[day.level] ?? CONTRIBUTION_LEVEL_COLORS[0] }}
                            title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                          />
                        ) : (
                          <span
                            className={`${styles.githubDay} ${styles.githubDayEmpty}`}
                            key={`empty-${weekIndex}-${dayIndex}`}
                            aria-hidden="true"
                          />
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <p className={styles.githubCount}>
                <strong>{githubContributions.totalLastYear.toLocaleString()}</strong> contributions in {currentYear}
              </p>
            </div>
          ) : (
            <p className={`${styles.githubFallback} ${styles.reveal}`}>
              Activity graph is temporarily unavailable — view the profile directly on GitHub.
            </p>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.contactSection}`} id="contact" aria-labelledby="contact-title">
        <div className={`${styles.contactInner} ${styles.reveal}`}>
          <div>
            <p className={styles.eyebrow}>Let&apos;s Connect</p>
            <h2 id="contact-title">Have an opportunity or <em>project in mind?</em></h2>
          </div>
          <div className={styles.contactCopy}>
            <p>I&apos;m open to internship opportunities where I can contribute, learn, and continue developing practical web and mobile solutions.</p>
            <div className={styles.contactActions}>
              <ContactCTA />
              <SocialFlipButton items={SOCIAL_FLIP_ITEMS} className={styles.contactSocials} />
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div><Link className={styles.footerBrand} href="/">Fatima Sierra</Link><p>Web &amp; Mobile Developer creating purposeful digital experiences.</p></div>
          <div><p className={styles.footerLabel}>Navigate</p><nav>{FOOTER_NAV_LINKS.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav></div>
          <div><p className={styles.footerLabel}>Connect</p><nav>{PROFESSIONAL_LINKS.map((link) => <a href={link.href} target="_blank" rel="noreferrer" key={link.id}>{link.label}</a>)}</nav></div>
          <div><p className={styles.footerLabel}>Education</p><p>{currentEducation.detail}<br />Mobile &amp; Web Applications</p></div>
        </div>
        <div className={styles.footerBottom}><span>© 2026 Fatima Sierra</span><span>Designed &amp; developed by Fatima Sierra</span></div>
      </footer>
    </div>
  );
}
