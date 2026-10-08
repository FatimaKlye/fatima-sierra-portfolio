import Image from "next/image";
import Link from "next/link";
import { ACHIEVEMENTS, HERO_CONTENT } from "@/components/about/aboutData";
import EditorialMotion from "@/components/motion/EditorialMotion";
import AboutOpening from "./AboutOpening";
import RecipeToCode from "./RecipeToCode";
import {
  COLLEGE,
  DEANS_LIST,
  HOME_ECONOMICS_AWARDS,
  IT_SPECIALIST_CERTS,
  KITCHEN_PHOTO,
  MARQUEE_WORDS,
  MEDALS,
  PHOTOGRAPHER_ROLE,
  PROJECT_PLATES,
  SENIOR_HIGH,
  SENIOR_HIGH_HONORS,
  SERVICE_ROLES,
  TEAM_SKILLS,
} from "./aboutStoryData";
import styles from "./AboutStory.module.css";

const KITCHEN_VALUES = ["Patience", "Precision", "Creativity", "Problem-solving"];

const MEDAL_ICONS = [
  // Cooking pot
  <path key="pot" d="M5 10h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-5zM3 10h18M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2" />,
  // Bread loaf
  <path key="loaf" d="M5 19v-8a3 3 0 0 1-1-2.2C4 6.7 7.6 5 12 5s8 1.7 8 3.8a3 3 0 0 1-1 2.2v8H5zM9 9l1 2M13 9l1 2" />,
];

const deansListYears = DEANS_LIST?.years.match(/\d{4}–\d{4}/)?.[0];

export default function AboutStory() {
  return (
    <section className={styles.about} aria-labelledby="about-title">
      <EditorialMotion>
        <AboutOpening headingLevel={1} eyebrow="About me" variant="full" />

        {/* Marquee: kitchen and code verbs, alternating ------------------- */}
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[0, 1].map((copy) => (
              <ul className={styles.marqueeList} key={copy}>
                {MARQUEE_WORDS.map((item) => (
                  <li className={item.side === "kitchen" ? styles.marqueeKitchen : styles.marqueeCode} key={item.word}>
                    {item.side === "code" ? `${item.word.toLowerCase()}()` : item.word}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        {/* The method: recipe → code --------------------------------------- */}
        <div className={`${styles.container} ${styles.method}`}>
          <div className={styles.methodCopy} data-reveal>
            <p className={styles.eyebrow}>The method</p>
            <h2 className={styles.blockTitle}>
              A recipe is just a program <em>you can taste.</em>
            </h2>
            <p className={styles.body}>
              Cooking taught me patience, precision, and the quiet satisfaction of building something from scratch —
              habits I needed again the moment I opened a code editor.
            </p>
          </div>
          <div data-reveal>
            <RecipeToCode />
          </div>
        </div>

        {/* Chapter 01: the kitchen ----------------------------------------- */}
        <article className={`${styles.container} ${styles.chapter}`} aria-labelledby="chapter-kitchen">
          <header className={styles.chapterMeta}>
            <span className={styles.chapterNumber} aria-hidden="true">01</span>
            <p className={styles.chapterYears}>{SENIOR_HIGH.years}</p>
            <p className={styles.chapterPlace}>
              {SENIOR_HIGH.institution}
              <br />
              {SENIOR_HIGH.detail}
            </p>
          </header>

          <div className={styles.chapterBody}>
            <h2 id="chapter-kitchen" className={styles.chapterTitle} data-reveal>
              The kitchen <em>came first.</em>
            </h2>
            <p className={styles.body} data-reveal>
              Long before code editors, my hands were busy with flour, knives, and recipe cards. I loved following a
              process step by step until it became something real.
            </p>

            <div className={styles.kitchenGrid}>
              <ul className={styles.medals} data-stagger>
                {MEDALS.map((medal, index) => (
                  <li className={styles.medal} key={medal.title}>
                    <div className={styles.medalSeal} aria-hidden="true">
                      <svg className={styles.medalRing} viewBox="0 0 120 120" data-spin="50">
                        <defs>
                          <path id={`medal-ring-${index}`} d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
                        </defs>
                        <text>
                          <textPath href={`#medal-ring-${index}`} textLength="284" lengthAdjust="spacing">
                            GOLD MEDALIST · NC II PASSER ·
                          </textPath>
                        </text>
                      </svg>
                      <svg
                        className={styles.medalIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {MEDAL_ICONS[index % MEDAL_ICONS.length]}
                      </svg>
                    </div>
                    <p className={styles.medalLabel}>{medal.label}</p>
                    <p className={styles.medalNote}>Passer · Gold Medalist</p>
                  </li>
                ))}
              </ul>

              <ul className={styles.honors} data-stagger>
                {SENIOR_HIGH_HONORS && (
                  <li>
                    <strong>{SENIOR_HIGH_HONORS.title}</strong>
                    <span>{SENIOR_HIGH_HONORS.institution}</span>
                  </li>
                )}
                {HOME_ECONOMICS_AWARDS.map((award) => (
                  <li key={award.role}>
                    <strong>{award.role}</strong>
                    <span>{award.organization}</span>
                  </li>
                ))}
              </ul>
            </div>

            {KITCHEN_PHOTO && (
              <div data-reveal>
                <figure className={styles.kitchenPhoto}>
                  <div className={styles.kitchenPhotoFrame}>
                    <Image src={KITCHEN_PHOTO.src} alt={KITCHEN_PHOTO.alt} fill sizes="(max-width: 820px) 80vw, 28vw" />
                  </div>
                </figure>
              </div>
            )}
          </div>
        </article>

        {/* Chapter 02: choosing IT ----------------------------------------- */}
        <article className={`${styles.container} ${styles.chapter}`} aria-labelledby="chapter-switch">
          <header className={styles.chapterMeta}>
            <span className={styles.chapterNumber} aria-hidden="true">02</span>
            <p className={styles.chapterYears}>{COLLEGE.years}</p>
            <p className={styles.chapterPlace}>
              {COLLEGE.institution}
              <br />
              {COLLEGE.location}
            </p>
          </header>

          <div className={styles.chapterBody}>
            <h2 id="chapter-switch" className={styles.chapterTitle} data-reveal>
              Then I got curious <em>about screens.</em>
            </h2>
            <p className={styles.body} data-reveal>
              I started noticing how apps worked, how websites were put together, and how a single tap could make a
              screen respond. When it was time to choose a college course, I chose Information Technology.
            </p>

            <div className={styles.switchGrid}>
              <blockquote className={styles.pullQuote} data-reveal>
                <p>
                  It wasn&apos;t leaving cooking behind — just choosing <em>a new set of tools</em> to keep creating.
                </p>
              </blockquote>

              <div className={styles.ticketShadow} data-reveal>
              <div className={styles.ticket}>
                <p className={styles.ticketHead}>
                  <span>Order ticket</span>
                  <span>{COLLEGE.years}</span>
                </p>
                <p className={styles.ticketTitle}>{COLLEGE.detail}</p>
                <p className={styles.ticketSub}>{COLLEGE.institution}</p>
                <dl className={styles.ticketItems}>
                  {DEANS_LIST && (
                    <div>
                      <dt>Dean&apos;s Lister / First Honor</dt>
                      <dd>{deansListYears ? `AY ${deansListYears}` : DEANS_LIST.years}</dd>
                    </div>
                  )}
                  {IT_SPECIALIST_CERTS.map((cert) => (
                    <div key={cert.id}>
                      <dt>IT Specialist — {cert.title}</dt>
                      <dd>{cert.year}</dd>
                    </div>
                  ))}
                </dl>
                <p className={styles.ticketFoot}>
                  <span>Status</span>
                  <strong>Still cooking</strong>
                </p>
              </div>
              </div>
            </div>
          </div>
        </article>

        {/* Chapter 03: building ------------------------------------------- */}
        <article className={`${styles.container} ${styles.chapter}`} aria-labelledby="chapter-build">
          <header className={styles.chapterMeta}>
            <span className={styles.chapterNumber} aria-hidden="true">03</span>
            <p className={styles.chapterYears}>Today</p>
            <p className={styles.chapterPlace}>{HERO_CONTENT.statusLabel}</p>
          </header>

          <div className={styles.chapterBody}>
            <h2 id="chapter-build" className={styles.chapterTitle} data-reveal>
              Now I build <em>for real people.</em>
            </h2>
            <p className={styles.body} data-reveal>
              Plan it, build it, taste-test, adjust, repeat. The same recipe now goes into responsive web and mobile
              applications — from interface design to database integration and testing.
            </p>

            <ul className={styles.plates}>
              {PROJECT_PLATES.map((plate, index) => {
                const isDevice = plate.slug === "ignis-safe-mobile";
                return (
                  <li className={`${styles.plate} ${styles[`plate${index + 1}`]}`} key={plate.slug} data-reveal>
                    <Link className={styles.plateLink} href={`/projects/${plate.slug}`}>
                      <span className={styles.plateMedia} data-parallax={index === 1 ? 9 : 4}>
                        <span className={isDevice ? styles.plateDevice : styles.plateBrowser}>
                          {!isDevice && (
                            <span className={styles.browserBar} aria-hidden="true">
                              <i />
                              <i />
                              <i />
                            </span>
                          )}
                          <span className={styles.plateImage}>
                            <Image src={plate.src} alt={plate.alt} fill sizes={plate.sizes} />
                          </span>
                        </span>
                      </span>
                      <span className={styles.plateCaption}>
                        <strong>{plate.title}</strong>
                        <span>{plate.category}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link className={`ui-btn ui-btn--secondary ${styles.inlineCta}`} href="/projects" data-reveal>
              See Every Project
            </Link>
          </div>
        </article>

        {/* Beyond the code ------------------------------------------------- */}
        <div className={`${styles.container} ${styles.table}`}>
          <h2 className={styles.blockTitle} data-reveal>
            What I bring <em>to the table.</em>
          </h2>
          <div className={styles.tableCols} data-stagger>
            <div>
              <p className={styles.tableLabel}>Carried over from the kitchen</p>
              <ul className={styles.tableList}>
                {KITCHEN_VALUES.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className={styles.tableLabel}>Sharpened in teams</p>
              <ul className={styles.tableList}>
                {TEAM_SKILLS.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className={styles.tableLabel}>Away from the keyboard</p>
              <ul className={`${styles.tableList} ${styles.tableListDetail}`}>
                <li>
                  Cooking &amp; baking
                  <span>Cookery and Bread &amp; Pastry Production NC II</span>
                </li>
                {PHOTOGRAPHER_ROLE && (
                  <li>
                    Behind the camera
                    <span>
                      {PHOTOGRAPHER_ROLE.role}, {PHOTOGRAPHER_ROLE.organization}
                    </span>
                  </li>
                )}
                {SERVICE_ROLES.length > 0 && (
                  <li>
                    Student service
                    {SERVICE_ROLES.map((role) => (
                      <span key={role.role}>
                        {role.role}, {role.organization}
                      </span>
                    ))}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Recognition: every verified honour, oldest first --------------- */}
        <div className={`${styles.container} ${styles.roll}`}>
          <header className={styles.rollHead}>
            <p className={styles.eyebrow} data-reveal>Recognition</p>
            <h2 className={styles.blockTitle} data-reveal>
              Honours <em>along the way.</em>
            </h2>
          </header>
          <ol className={styles.rollList} data-stagger>
            {ACHIEVEMENTS.map((achievement) => (
              <li className={styles.rollItem} key={`${achievement.institution}-${achievement.title}`}>
                <span className={styles.rollYears}>{achievement.years}</span>
                <strong className={styles.rollTitle}>{achievement.title}</strong>
                <span className={styles.rollPlace}>{achievement.institution}</span>
              </li>
            ))}
          </ol>
          <Link className={`ui-btn ui-btn--secondary ${styles.inlineCta}`} href="/experience" data-reveal>
            Follow the Full Journey
          </Link>
        </div>

        {/* Finale: approach + what's next ----------------------------------- */}
        <div className={styles.finale}>
          <div className={styles.finaleInner}>
            <p className={styles.finaleEyebrow} data-reveal>What&apos;s next</p>
            <h2 className={styles.finaleTitle} data-reveal>
              Good digital products should feel <em>clear, purposeful,</em> and easy to use.
            </h2>
            <p className={styles.finaleBody} data-reveal>
              I&apos;m looking for opportunities where I can keep growing, keep building, and keep making something
              good.
            </p>
            <div className={styles.finaleActions} data-reveal>
              <Link className="ui-btn ui-btn--light" href="/projects">
                See My Projects
              </Link>
              <Link className="ui-btn ui-btn--ghost-light" href="/contact">
                Let&apos;s Work Together
              </Link>
            </div>
          </div>
        </div>
      </EditorialMotion>
    </section>
  );
}
