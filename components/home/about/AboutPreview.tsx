import Link from "next/link";
import EditorialMotion from "@/components/motion/EditorialMotion";
import AboutTitle from "./AboutTitle";
import KitchenToCode from "./KitchenToCode";
import { MEDALS, PREVIEW_STORY, PROJECT_COUNT } from "./aboutStoryData";
import styles from "./AboutPreview.module.css";

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/**
 * Homepage About Me feature: the shared headline and Fatima's story in her own
 * words beside the kitchen → code composition, the section's interactive centrepiece.
 * Links to the full /about story.
 */
export default function AboutPreview({ eyebrow }: { eyebrow: string }) {
  return (
    <section className={styles.section} id="about" aria-labelledby="about-title" data-nav-label="About">
      <EditorialMotion className={styles.layout}>
        <header className={styles.head}>
          <p className={styles.eyebrow} data-reveal>{eyebrow}</p>
          <AboutTitle as="h2" styles={styles} />
        </header>

        <div className={styles.stageArea}>
          <KitchenToCode />
        </div>

        <div className={styles.story} data-stagger>
          <p className={styles.storyText}>
            {PREVIEW_STORY.opening}
            {PREVIEW_STORY.kitchen}
            {PREVIEW_STORY.body}
            <em>{PREVIEW_STORY.highlight}</em>.
          </p>

          <dl className={styles.ledger}>
            <div data-side="kitchen">
              <dt>Then</dt>
              <dd>{MEDALS.length ? MEDALS.map((medal) => medal.label).join(" · ") : "The kitchen"}</dd>
            </div>
            <div data-side="code">
              <dt>Now</dt>
              <dd>Web &amp; mobile apps · {PROJECT_COUNT} projects</dd>
            </div>
          </dl>

          <div className={styles.storyFoot}>
            <Link className={`ui-btn ui-btn--primary ${styles.cta}`} href="/about" data-magnetic>
              <span className={styles.ctaLabel}>
                <span>Explore My Story</span>
                <span aria-hidden="true">Explore My Story</span>
              </span>
              <span className={styles.ctaIcon} aria-hidden="true">
                <Arrow />
                <Arrow />
              </span>
            </Link>
          </div>
        </div>
      </EditorialMotion>
    </section>
  );
}
