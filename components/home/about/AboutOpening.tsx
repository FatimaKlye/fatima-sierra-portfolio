import { HERO_CONTENT } from "@/components/about/aboutData";
import AboutCollage from "./AboutCollage";
import AboutTitle from "./AboutTitle";
import { ABOUT_PORTRAIT, COLLAGE_PHOTOS, COLLEGE, MEDALS, SENIOR_HIGH } from "./aboutStoryData";
import styles from "./AboutStory.module.css";

/**
 * "From cooking to coding" opening of the full /about story: title, lead, facts
 * and the arched portrait. The homepage uses AboutPreview, which shares the title.
 */
export default function AboutOpening({ eyebrow }: { eyebrow: string }) {
  return (
    <div className={`${styles.container} ${styles.opening}`} id="intro" data-nav-label="Intro" data-nav-intro="">
      <div className={styles.openingCopy}>
        <p className={styles.eyebrow} data-reveal>{eyebrow}</p>
        <AboutTitle as="h1" />

        <p className={styles.lead} data-reveal>
          I&apos;m Fatima — a {HERO_CONTENT.statusLabel} who learned to build things in a kitchen first. The
          patience and precision I picked up at the stove now go into every screen I design, build, and test.
        </p>

        <dl className={styles.facts} data-stagger>
          <div>
            <dt>Started in</dt>
            <dd>Home Economics · {SENIOR_HIGH.institution}</dd>
          </div>
          <div>
            <dt>Studying</dt>
            <dd>
              {COLLEGE.detail.replace("Bachelor of Science in", "BS")} · {COLLEGE.institution}
            </dd>
          </div>
          <div>
            <dt>Building</dt>
            <dd>Web &amp; mobile applications</dd>
          </div>
        </dl>
      </div>

      <AboutCollage primary={ABOUT_PORTRAIT} photos={COLLAGE_PHOTOS}>
        <svg className={styles.journeyLine} viewBox="0 0 400 520" fill="none" aria-hidden="true">
          <path
            data-draw
            d="M30 430C4 330 4 200 30 130S150-6 250 8s110 22 122 56"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        {MEDALS.length > 0 && (
          <div className={styles.stickerRecipe}>
            <span className={styles.stickerKicker}>Before the code</span>
            <strong>Gold Medalist</strong>
            <span>{MEDALS.map((medal) => medal.label).join(" · ")}</span>
          </div>
        )}
      </AboutCollage>
    </div>
  );
}
