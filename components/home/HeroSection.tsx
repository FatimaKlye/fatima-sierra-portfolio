import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download, Mail } from "lucide-react";
import { CERTIFICATES, EDUCATION } from "@/components/about/aboutData";
import { CONTACT_EMAIL, RESUME_URL, SOCIAL_LINKS } from "@/components/contact/contactData";
import { EXPERIENCE_HIGHLIGHTS } from "@/components/experience/experienceData";
import EditorialMotion from "@/components/motion/EditorialMotion";
import TechIcon from "@/components/skills/TechIcon";
import { PREVIEW_SKILLS, SKILL_GROUPS } from "@/components/skills/skillsData";
import AboutPreview from "./about/AboutPreview";
import CredentialsTeaser from "./CredentialsTeaser";
import GithubActivity from "./GithubActivity";
import PreviewHeader from "./PreviewHeader";
import ProjectList from "./ProjectList";
import Recommendations from "./Recommendations";
import SkillIndex from "./SkillIndex";
import { getGithubContributions } from "./githubContributions";
import styles from "./HeroSection.module.css";
import editorialStyles from "./HomeEditorial.module.css";

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
const GITHUB_LINK = SOCIAL_LINKS.find((link) => link.id === "github");
const LINKEDIN_LINK = SOCIAL_LINKS.find((link) => link.id === "linkedin");
const EMAIL_LINK = SOCIAL_LINKS.find((link) => link.id === "email");

/**
 * The homepage answers a recruiter's first questions in order: who, what stack,
 * what was built (with my part in it), then the supporting record. Each section
 * is a short preview that links to the dedicated page with the complete content.
 */
export default async function HeroSection() {
  const college = EDUCATION[0];
  const githubUsername = GITHUB_LINK?.handle.replace(/^@/, "") ?? "";
  const githubContributions = githubUsername ? await getGithubContributions(githubUsername) : null;

  return (
    <div className={styles.home} data-home-page>
      <section className={styles.hero} id="home" aria-labelledby="home-hero-title" data-nav-label="Intro" data-nav-intro>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.statusDot} aria-hidden="true" />
              Open to internships &amp; junior developer roles
            </p>
            <h1 id="home-hero-title" className={styles.heroTitle}>
              <span className={styles.titleLine}>I create</span>{" "}
              <em>
                <span className={styles.titleLine}>web &amp; mobile</span>{" "}
                <span className={styles.titleLine}>apps.</span>
              </em>
            </h1>
            <p className={styles.heroLead}>
              A BS Information Technology student at {college.institution}, developing web and mobile applications
              using Next.js, React, Flutter, and Supabase. My work includes <strong>IGNIS SAFE</strong>, a fire safety
              learning application and web management system developed for the BFP Dasmariñas City Fire Station.
            </p>

            <div className={styles.actions}>
              <Link className="ui-btn ui-btn--primary" href="#projects">
                View Projects <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a className="ui-btn ui-btn--secondary" href={RESUME_URL} download>
                Download Resume <Download size={16} aria-hidden="true" />
              </a>
            </div>

            <ul className={styles.quickLinks} aria-label="Profiles and contact">
              {GITHUB_LINK && (
                <li>
                  <a href={GITHUB_LINK.href} target="_blank" rel="noreferrer" aria-label="GitHub profile (opens in a new tab)">
                    GitHub <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </li>
              )}
              {LINKEDIN_LINK && (
                <li>
                  <a href={LINKEDIN_LINK.href} target="_blank" rel="noreferrer" aria-label="LinkedIn profile (opens in a new tab)">
                    LinkedIn <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </li>
              )}
              {EMAIL_LINK && (
                <li>
                  <a href={EMAIL_LINK.href} target="_blank" rel="noreferrer" aria-label={`Email ${CONTACT_EMAIL} (opens Gmail in a new tab)`}>
                    <Mail size={14} aria-hidden="true" /> Email
                  </a>
                </li>
              )}
            </ul>

            <div className={styles.stack}>
              <p className={styles.stackLabel}>Core stack</p>
              <ul className={styles.stackList}>
                {PREVIEW_SKILLS.map((skill) => (
                  <li key={skill.name}>
                    <TechIcon tech={skill} size={18} fallbackClassName={styles.stackFallback} />
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.portraitComposition}>
            <div className={styles.portraitFrame}>
              <Image
                src="/assets/profile/profile_picture.jpg"
                alt="Professional portrait of Fatima Klye M. Sierra"
                fill
                priority
                sizes="(max-width: 820px) 80vw, 420px"
                className={styles.portraitImage}
              />
            </div>
            <dl className={styles.portraitCaption}>
              <div>
                <dt>Name</dt>
                <dd>Fatima Klye M. Sierra</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{college.location}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className={editorialStyles.section} id="projects" aria-labelledby="projects-title" data-nav-label="Projects">
        <EditorialMotion className={`${editorialStyles.container} mx-auto w-full`}>
          <PreviewHeader
            number="01 — Projects"
            headingId="projects-title"
            title={<>Featured project, <em>and what I built.</em></>}
            intro="A quick look at my strongest work. Open the case study for the problem, my contributions and the stack, or browse every project under All Projects."
            href="/projects"
            linkLabel="All Projects"
          />
          <ProjectList />
        </EditorialMotion>
      </section>

      <section className={`${editorialStyles.section} ${editorialStyles.surfaceSection}`} id="skills" aria-labelledby="skills-title" data-nav-label="Skills">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <PreviewHeader
            number="02 — Skills"
            headingId="skills-title"
            title={<>The tools <em>I build with.</em></>}
            intro="Grouped by where they fit. The count shows how many of my projects on this site use each one — select a tool to see where."
            href="/skills"
            linkLabel="All Skills"
          />
          <SkillIndex groups={SKILL_GROUPS} />
        </div>
      </section>

      <section className={editorialStyles.section} id="experience" aria-labelledby="experience-title" data-nav-label="Experience">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <PreviewHeader
            number="03 — Experience & Education"
            headingId="experience-title"
            title={<>Building, studying, <em>growing.</em></>}
            intro="Project roles, studies and recognition — the full record is on the Experience page."
            href="/experience"
            linkLabel="Full Experience"
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

      <AboutPreview eyebrow="04 — About me" />

      <section className={`${editorialStyles.section} ${editorialStyles.surfaceSection}`} id="credentials" aria-labelledby="credentials-title" data-nav-label="Certifications">
        <div className={`${editorialStyles.container} mx-auto w-full`}>
          <CredentialsTeaser certificates={TEASER_CREDENTIALS} />
        </div>
      </section>

      {GITHUB_LINK && (
        <section className={editorialStyles.section} id="github" aria-labelledby="github-title" data-nav-label="GitHub">
          <div className={`${editorialStyles.container} mx-auto w-full`}>
            <GithubActivity
              number="06 — GitHub activity"
              headingId="github-title"
              handle={GITHUB_LINK.handle}
              profileHref={GITHUB_LINK.href}
              initialData={githubContributions}
            />
          </div>
        </section>
      )}

      <Recommendations number="07 — Recommendations" />

      <section className={`${editorialStyles.section} ${editorialStyles.contactSection}`} id="contact" aria-labelledby="contact-title" data-nav-label="Contact">
        <div className={`${editorialStyles.container} ${editorialStyles.contactInner}`}>
          <div className={editorialStyles.contactCopy}>
            <p className={editorialStyles.sectionNumber}>08 — Contact</p>
            <h2 id="contact-title" className={editorialStyles.contactTitle}>
              Hiring for web or mobile? <em>Let&apos;s talk.</em>
            </h2>
          </div>
          <div className={editorialStyles.contactActions}>
            <p className={editorialStyles.contactLead}>
              I&apos;m open to internships and junior roles, and happy to walk through any project on this site.
            </p>
            {EMAIL_LINK && (
              <a className={editorialStyles.contactEmail} href={EMAIL_LINK.href} target="_blank" rel="noreferrer">
                <Mail size={18} aria-hidden="true" />
                {CONTACT_EMAIL}
              </a>
            )}
            <div className={editorialStyles.contactButtons}>
              <Link className="ui-btn ui-btn--primary" href="/contact">
                Send a Message
              </Link>
              <a className="ui-btn ui-btn--secondary" href={RESUME_URL} download>
                Download Resume
              </a>
            </div>
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
