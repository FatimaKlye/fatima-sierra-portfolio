import Link from "next/link";
import EditorialMotion from "@/components/motion/EditorialMotion";
import AboutTitle from "./AboutTitle";
import { PREVIEW_STORY, STORY_LOOP, type StoryPhrase } from "./aboutStoryData";
import styles from "./AboutStory.module.css";

const TONE_CLASS = { kitchen: styles.storyKitchen, code: styles.storyCode, mark: styles.storyMark };

/** Each word in its own span so EditorialMotion's data-ink can brighten them in reading order. */
function InkWords({ text }: { text: string }) {
  return text.split(/(\s+)/).map((token, index) =>
    token.trim() ? (
      <span key={index} data-ink-word>
        {token}
      </span>
    ) : (
      token
    )
  );
}

function Phrases({ phrases }: { phrases: StoryPhrase[] }) {
  return phrases.map((phrase, index) => {
    const className = phrase.step ? styles.storyStep : phrase.tone && TONE_CLASS[phrase.tone];
    if (!className) return <InkWords key={index} text={phrase.text} />;

    return (
      <span
        key={index}
        className={className}
        data-step={phrase.step}
        data-mark={phrase.step || phrase.tone === "mark" ? "" : undefined}
      >
        <InkWords text={phrase.text} />
      </span>
    );
  });
}

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/**
 * Homepage About Me highlight: the shared headline, Fatima's story in her own
 * words, and a kitchen → code margin note. Links to the full /about story.
 */
export default function AboutPreview({ eyebrow }: { eyebrow: string }) {
  return (
    <section className={`${styles.about} ${styles.preview}`} id="about" aria-labelledby="about-title" data-nav-label="About">
      <EditorialMotion>
        <div className={`${styles.container} ${styles.storyLayout}`}>
          <header className={styles.storyHead}>
            <p className={styles.eyebrow} data-reveal>{eyebrow}</p>
            <AboutTitle as="h2" />
          </header>

          <div className={styles.story} data-ink>
            <p className={styles.storyLead}>
              <Phrases phrases={PREVIEW_STORY.lead} />
            </p>
            <p className={styles.storyBody}>
              <Phrases phrases={PREVIEW_STORY.body} />
            </p>
            <p className={styles.storyClose}>
              <Phrases phrases={PREVIEW_STORY.close} />
            </p>

            <div className={styles.storyFoot} data-reveal>
              <Link className={`ui-btn ui-btn--primary ${styles.storyCta}`} href="/about" data-magnetic>
                <span className={styles.ctaLabel}>
                  <span>Explore My Story</span>
                  <span aria-hidden="true">Explore My Story</span>
                </span>
                <span className={styles.ctaIcon} aria-hidden="true">
                  <Arrow />
                  <Arrow />
                </span>
              </Link>
              <span className={styles.storySign}>— Fatima</span>
            </div>
          </div>

          {/* A visual gloss on the story's three step phrases; the paragraph already says it in words. */}
          <div className={styles.loop} aria-hidden="true">
            <p className={styles.loopHead}>
              <span>Kitchen</span>
              <span>Code</span>
            </p>
            <ol className={styles.loopList} data-stagger>
              {STORY_LOOP.map((step) => (
                <li className={styles.loopRow} data-step={step.id} key={step.id}>
                  <span className={styles.loopKitchen}>{step.kitchen}</span>
                  <span className={styles.loopLine} />
                  <span className={styles.loopCode}>{step.code}</span>
                </li>
              ))}
            </ol>
            <p className={styles.loopRepeat}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
                <path d="M18 3.5v3.6h-3.6" />
              </svg>
              repeat until it&apos;s right
            </p>
          </div>
        </div>
      </EditorialMotion>
    </section>
  );
}
