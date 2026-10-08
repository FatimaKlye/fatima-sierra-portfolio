import type { Metadata } from "next";
import Link from "next/link";
import {
  ACHIEVEMENTS,
  CERTIFICATES,
  CERTIFICATE_FILTERS,
  EDUCATION,
  LEADERSHIP,
} from "@/components/about/aboutData";
import PageHero from "@/components/editorial/PageHero";
import { DEVELOPMENT_ROLES } from "@/components/experience/experienceData";
import EditorialMotion from "@/components/motion/EditorialMotion";
import styles from "@/components/experience/Experience.module.css";

export const metadata: Metadata = {
  title: "Experience | Fatima Sierra",
  description:
    "The development roles, education, leadership and recognition of Fatima Klye M. Sierra, BS Information Technology student and web & mobile developer.",
};

const pad = (value: number) => String(value).padStart(2, "0");

const VISIBLE_LEADERSHIP = LEADERSHIP.filter((entry) => !entry.hidden);

/** Leadership roles grouped by organisation, keeping first-seen order. */
const LEADERSHIP_BY_ORG = VISIBLE_LEADERSHIP.reduce<{ organization: string; years: string; roles: string[] }[]>(
  (groups, entry) => {
    const group = groups.find((item) => item.organization === entry.organization);
    if (group) group.roles.push(entry.role);
    else groups.push({ organization: entry.organization, years: entry.years, roles: [entry.role] });
    return groups;
  },
  []
);

const CERTIFICATE_COUNTS = CERTIFICATE_FILTERS.filter((filter) => filter.id !== "all").map((filter) => ({
  label: filter.label,
  count: CERTIFICATES.filter((certificate) => certificate.category === filter.id).length,
}));

const PROFESSIONAL_CERTIFICATES = CERTIFICATES.filter((certificate) => certificate.category === "professional");

export default function ExperiencePage() {
  return (
    <EditorialMotion>
      <main>
        <PageHero
          label="Experience"
          eyebrow="The complete journey"
          index={pad(DEVELOPMENT_ROLES.length)}
          title={<>Building, studying, <em>growing.</em></>}
          intro="The development roles, schools, student service and recognition behind my work — every entry taken from my résumé and verified records."
          meta={[
            { label: "Dev roles", value: pad(DEVELOPMENT_ROLES.length) },
            { label: "Schools", value: pad(EDUCATION.length) },
            { label: "Honours", value: pad(ACHIEVEMENTS.length) },
            { label: "Certificates", value: pad(CERTIFICATES.length) },
          ]}
        />

        {/* 01 — Development experience ------------------------------------- */}
        <section className={styles.section} id="development" aria-labelledby="development-title" data-nav-label="Development">
          <div className={`${styles.container} ${styles.split}`}>
            <header className={styles.sideHead}>
              <p className={styles.kicker} data-reveal>01 — Development</p>
              <h2 id="development-title" className={styles.title} data-reveal>
                Where I&apos;ve <em>built.</em>
              </h2>
              <p className={styles.intro} data-reveal>
                Project roles at {DEVELOPMENT_ROLES[0]?.organization ?? "university"} — from analysing requirements to
                shipping and testing.
              </p>
            </header>

            <div className={styles.journey}>
              <span className={styles.journeyRail} aria-hidden="true">
                <span className={styles.journeyFill} data-grow />
              </span>
              <ol className={styles.journeyList}>
                {DEVELOPMENT_ROLES.map((role) => (
                  <li className={styles.journeyItem} key={role.slug} data-reveal>
                    <span className={styles.journeyDot} aria-hidden="true" />
                    <p className={styles.journeyPeriod}>{role.period}</p>
                    <h3 className={styles.journeyRole}>{role.role}</h3>
                    <p className={styles.journeyProject}>
                      <Link className="ui-btn ui-btn--secondary ui-btn--sm" href={`/projects/${role.slug}`}>
                        {role.project}
                      </Link>
                    </p>
                    <p className={styles.journeyMeta}>{role.category}</p>
                    <p className={styles.journeySummary}>{role.summary}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 02 — Education -------------------------------------------------- */}
        <section className={`${styles.section} ${styles.surface}`} id="education" aria-labelledby="education-title" data-nav-label="Education">
          <div className={styles.container}>
            <header className={styles.head}>
              <p className={styles.kicker} data-reveal>02 — Education</p>
              <h2 id="education-title" className={styles.title} data-reveal>
                Where I <em>studied.</em>
              </h2>
            </header>

            <ol className={styles.schools}>
              {EDUCATION.map((entry, index) => (
                <li className={styles.school} key={entry.institution} data-reveal>
                  <span className={styles.schoolIndex} aria-hidden="true">{pad(index + 1)}</span>
                  <p className={styles.schoolYears}>{entry.years}</p>
                  <h3 className={styles.schoolName}>{entry.institution}</h3>
                  <p className={styles.schoolDetail}>{entry.detail}</p>
                  <p className={styles.schoolPlace}>{entry.location}</p>
                </li>
              ))}
            </ol>
            <Link className={`ui-btn ui-btn--secondary ${styles.textLink}`} href="/about" data-reveal>
              Read How Cooking Led to Coding
            </Link>
          </div>
        </section>

        {/* 03 — Leadership & involvement ------------------------------------ */}
        <section className={styles.section} id="leadership" aria-labelledby="leadership-title" data-nav-label="Leadership">
          <div className={`${styles.container} ${styles.split}`}>
            <header className={styles.sideHead}>
              <p className={styles.kicker} data-reveal>03 — Leadership &amp; involvement</p>
              <h2 id="leadership-title" className={styles.title} data-reveal>
                Showing up <em>for others.</em>
              </h2>
              <p className={styles.intro} data-reveal>
                Student service and club roles that sharpened my communication, responsibility and coordination.
              </p>
            </header>

            <ul className={styles.rows} data-stagger>
              {LEADERSHIP_BY_ORG.map((group) => (
                <li className={styles.row} key={group.organization}>
                  <p className={styles.rowYears}>{group.years}</p>
                  <div>
                    <h3 className={styles.rowTitle}>{group.roles.join(" · ")}</h3>
                    <p className={styles.rowDetail}>{group.organization}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 04 — Recognition ------------------------------------------------- */}
        <section className={`${styles.section} ${styles.surface}`} id="recognition" aria-labelledby="recognition-title" data-nav-label="Recognition">
          <div className={`${styles.container} ${styles.split}`}>
            <header className={styles.sideHead}>
              <p className={styles.kicker} data-reveal>04 — Recognition</p>
              <h2 id="recognition-title" className={styles.title} data-reveal>
                Honours <em>along the way.</em>
              </h2>
            </header>

            <ul className={styles.rows} data-stagger>
              {ACHIEVEMENTS.map((achievement) => (
                <li className={styles.row} key={`${achievement.institution}-${achievement.title}`}>
                  <p className={styles.rowYears}>{achievement.years}</p>
                  <div>
                    <h3 className={styles.rowTitle}>{achievement.title}</h3>
                    <p className={styles.rowDetail}>{achievement.institution}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 05 — Certifications & professional development (kept separate from education) */}
        <section className={styles.credentials} id="certifications" aria-labelledby="credentials-summary-title" data-nav-label="Certifications">
          <div className={`${styles.container} ${styles.credentialsInner}`}>
            <div>
              <p className={styles.credentialsKicker} data-reveal>05 — Certifications &amp; professional development</p>
              <h2 id="credentials-summary-title" className={styles.credentialsTitle} data-reveal>
                {pad(CERTIFICATES.length)} certificates, <em>one habit:</em> keep learning.
              </h2>
              <ul className={styles.featuredCerts} data-stagger>
                {PROFESSIONAL_CERTIFICATES.map((certificate) => (
                  <li key={certificate.id}>
                    <strong>
                      {certificate.type} — {certificate.title}
                    </strong>
                    <span>
                      {certificate.issuer}
                      {certificate.date ? ` · ${certificate.date}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <Link className={`ui-btn ui-btn--light ${styles.credentialsLink}`} href="/certifications" data-reveal>
                Explore All Certifications
              </Link>
            </div>

            <dl className={styles.counts} data-stagger>
              {CERTIFICATE_COUNTS.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{pad(item.count)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </EditorialMotion>
  );
}
