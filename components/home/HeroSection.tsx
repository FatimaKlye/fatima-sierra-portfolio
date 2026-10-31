import Image from "next/image";
import Link from "next/link";
import type { ReactNode, SVGProps } from "react";
import { ArrowRight, ArrowUpRight, Download, Mail } from "lucide-react";
import { CERTIFICATES } from "@/components/about/aboutData";
import { CONTACT_EMAIL, RESUME_URL, SOCIAL_LINKS } from "@/components/contact/contactData";
import { EXPERIENCE_HIGHLIGHTS } from "@/components/experience/experienceData";
import EditorialMotion from "@/components/motion/EditorialMotion";
import TechIcon from "@/components/skills/TechIcon";
import { PREVIEW_SKILLS, SKILL_GROUPS } from "@/components/skills/skillsData";
import AboutPreview from "./about/AboutPreview";
import CredentialsTeaser from "./CredentialsTeaser";
import GithubActivity from "./GithubActivity";
import HeroMotion from "./HeroMotion";
import HeroVinyl from "./HeroVinyl";
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
/** Where I live — not the campus location in EDUCATION, which is Dasmariñas. */
const BASED_IN = "Cavite City";

/** One headline word inside a clipping mask, so HeroMotion can slide it up into place. */
function TitleWord({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={styles.wordMask}>
      <span className={className ? `${styles.word} ${className}` : styles.word} data-hero-word>
        {children}
      </span>
    </span>
  );
}

/** Four-point sparkle, the same motif as the site's fairy-dust cursor. */
function Sparkle({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <path
        d="M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * The homepage answers a recruiter's first questions in order: who, what stack,
 * what was built (with my part in it), then the supporting record. Each section
 * is a short preview that links to the dedicated page with the complete content.
 */
export default async function HeroSection() {
  const githubUsername = GITHUB_LINK?.handle.replace(/^@/, "") ?? "";
  const githubContributions = githubUsername ? await getGithubContributions(githubUsername) : null;

  return (
    <div className={styles.home} data-home-page>
      <section className={styles.hero} id="home" aria-labelledby="home-hero-title" data-nav-label="Intro" data-nav-intro>
        <HeroMotion className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.heroIntro}>
              <h1 id="home-hero-title" className={styles.heroTitle}>
                <span className={styles.titleLine}>
                  <TitleWord>I</TitleWord> <TitleWord>create</TitleWord>
                </span>{" "}
                <em>
                  <span className={styles.titleLine}>
                    <TitleWord>web</TitleWord> <TitleWord className={styles.amp}>&amp;</TitleWord>{" "}
                    <TitleWord>mobile</TitleWord>
                  </span>{" "}
                  <span className={styles.titleLine}>
                    <span className={styles.underlined}>
                      <TitleWord>apps.</TitleWord>
                      <svg className={styles.squiggle} viewBox="0 0 200 20" aria-hidden="true" focusable="false" data-hero-reveal="draw">
                        <path d="M4 13C30 5 52 17 82 11S140 4 166 10 190 13 196 9" pathLength={1} />
                      </svg>
                    </span>
                  </span>
                </em>
              </h1>
              <p className={styles.heroLead} data-hero-reveal="lead">
                I&apos;m a BSIT student at NU Dasmariñas, turning ideas into practical digital experiences. I
                develop{" "}
                <Link className={styles.leadLink} href="/projects/ignis-safe-website">
                  IGNIS SAFE
                </Link>
                , a fire safety learning and management platform for BFP Dasmariñas.
              </p>

              <div className={styles.actions}>
                <Link className="ui-btn ui-btn--primary" href="#projects" data-hero-reveal="action" data-magnetic="0.25">
                  View Projects <ArrowRight size={16} aria-hidden="true" className={styles.iconForward} />
                </Link>
                <a className="ui-btn ui-btn--secondary" href={RESUME_URL} download data-hero-reveal="action" data-magnetic="0.25">
                  Download Resume <Download size={16} aria-hidden="true" className={styles.iconDown} />
                </a>
              </div>

              <ul className={styles.quickLinks} aria-label="Profiles and contact">
                {GITHUB_LINK && (
                  <li data-hero-reveal="link">
                    <a href={GITHUB_LINK.href} target="_blank" rel="noreferrer" aria-label="GitHub profile (opens in a new tab)" data-magnetic>
                      GitHub <ArrowUpRight size={14} aria-hidden="true" className={styles.iconUpRight} />
                    </a>
                  </li>
                )}
                {LINKEDIN_LINK && (
                  <li data-hero-reveal="link">
                    <a href={LINKEDIN_LINK.href} target="_blank" rel="noreferrer" aria-label="LinkedIn profile (opens in a new tab)" data-magnetic>
                      LinkedIn <ArrowUpRight size={14} aria-hidden="true" className={styles.iconUpRight} />
                    </a>
                  </li>
                )}
                {EMAIL_LINK && (
                  <li data-hero-reveal="link">
                    <a href={EMAIL_LINK.href} target="_blank" rel="noreferrer" aria-label={`Email ${CONTACT_EMAIL} (opens Gmail in a new tab)`} data-magnetic>
                      <Mail size={14} aria-hidden="true" /> Email
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div className={styles.stack} data-hero-reveal="stack">
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

          {/* The portrait showcase: an arched frame layered with linework, an orbit, the record
              badge and an outlined name. Everything except the photo, the record (the music
              control) and the caption is decorative. */}
          <div className={styles.showcase}>
            <div className={styles.stage}>
              <div className={styles.glow} aria-hidden="true" />
              <svg
                className={styles.orbit}
                viewBox="0 0 600 240"
                aria-hidden="true"
                focusable="false"
                data-hero-reveal="deco"
                data-depth="0.6"
                data-drift="-14"
                data-turn="-8"
              >
                <ellipse cx="300" cy="120" rx="292" ry="104" />
                <circle cx="540" cy="61" r="5" />
              </svg>
              <div className={styles.archEcho} aria-hidden="true" data-hero-reveal="deco" data-depth="1.3" data-drift="6" />
              <div className={styles.arch} data-hero-reveal="portrait" data-depth="0.35">
                <div className={styles.archMedia} data-hero-media>
                  <Image
                    src="/assets/profile/profile_picture.jpg"
                    alt="Professional portrait of Fatima Klye M. Sierra"
                    fill
                    priority
                    sizes="(max-width: 760px) 90vw, 460px"
                    className={styles.portraitImage}
                  />
                </div>
              </div>
              <p className={styles.outlineName} aria-hidden="true" data-hero-reveal="deco" data-depth="-0.9" data-drift="-12">
                Sierra
              </p>
              <HeroVinyl />
              <span className={styles.sparkleA} data-hero-reveal="deco">
                <Sparkle data-float />
              </span>
              <span className={styles.sparkleB} data-hero-reveal="deco">
                <Sparkle data-float />
              </span>
            </div>
            <dl className={styles.portraitCaption} data-hero-reveal="caption">
              <div>
                <dt>Name</dt>
                <dd>Fatima Klye M. Sierra</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{BASED_IN}</dd>
              </div>
            </dl>
          </div>
        </HeroMotion>
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

      <Recommendations number="07 — Kind words" />

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
              I&apos;m open to software development internships where I can contribute to real projects, strengthen my
              development skills, and learn from experienced developers.
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
