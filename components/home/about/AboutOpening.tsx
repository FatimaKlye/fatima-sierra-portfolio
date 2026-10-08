import Image from "next/image";
import Link from "next/link";
import { HERO_CONTENT } from "@/components/about/aboutData";
import { ABOUT_PORTRAIT, COLLEGE, MEDALS, SENIOR_HIGH } from "./aboutStoryData";
import styles from "./AboutStory.module.css";

function TitleWord({ children, className }: { children: string; className?: string }) {
  return (
    <span className={styles.mask}>
      <span className={className ? `${styles.word} ${className}` : styles.word} data-word>
        {children}
      </span>
    </span>
  );
}

type AboutOpeningProps = {
  /** h1 on the dedicated /about page, h2 inside the homepage. */
  headingLevel: 1 | 2;
  eyebrow: string;
  /** "preview" swaps the fact row for a link to the full story. */
  variant: "full" | "preview";
};

/**
 * "From cooking to coding" opening: title, lead and the arched portrait.
 * Shared by the homepage preview and the full /about story so both stay identical.
 */
export default function AboutOpening({ headingLevel, eyebrow, variant }: AboutOpeningProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className={`${styles.container} ${styles.opening}`}>
      <div className={styles.openingCopy}>
        <p className={styles.eyebrow} data-reveal>{eyebrow}</p>
        <Heading id="about-title" className={styles.title}>
          <span className={styles.titleLine}>
            <TitleWord>From</TitleWord> <TitleWord className={styles.kitchenWord}>cooking</TitleWord>
          </span>{" "}
          <span className={`${styles.titleLine} ${styles.titleLineIndent}`}>
            <TitleWord>to</TitleWord> <TitleWord className={styles.codeWord}>coding.</TitleWord>
            <span className={styles.caret} aria-hidden="true" />
          </span>
        </Heading>

        <p className={styles.lead} data-reveal>
          I&apos;m Fatima — a {HERO_CONTENT.statusLabel} who learned to build things in a kitchen first. The
          patience and precision I picked up at the stove now go into every screen I design, build, and test.
        </p>

        {variant === "full" ? (
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
        ) : (
          <Link className={`ui-btn ui-btn--primary ${styles.inlineCta}`} href="/about" data-reveal>
            Explore My Story
          </Link>
        )}
      </div>

      <div className={styles.openingVisual}>
        <svg className={styles.journeyLine} viewBox="0 0 400 520" fill="none" aria-hidden="true">
          <path
            data-draw
            d="M30 430C4 330 4 200 30 130S150-6 250 8s110 22 122 56"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        <div className={styles.portraitArch}>
          <div className={styles.portraitInner} data-parallax="5">
            <Image
              src={ABOUT_PORTRAIT.src}
              alt={ABOUT_PORTRAIT.alt}
              fill
              sizes="(max-width: 820px) 78vw, 32vw"
              className={styles.portraitImage}
            />
          </div>
        </div>

        {MEDALS.length > 0 && (
          <div className={styles.stickerRecipe}>
            <span className={styles.stickerKicker}>Before the code</span>
            <strong>Gold Medalist</strong>
            <span>{MEDALS.map((medal) => medal.label).join(" · ")}</span>
          </div>
        )}

        <div className={styles.stickerCode} aria-hidden="true">
          <span className={styles.tok_tag}>&lt;Developer</span>{" "}
          <span className={styles.tok_fn}>focus</span>=<span className={styles.tok_string}>&quot;web · mobile&quot;</span>{" "}
          <span className={styles.tok_tag}>/&gt;</span>
        </div>
      </div>
    </div>
  );
}
