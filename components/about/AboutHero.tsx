import Image from "next/image";
import Link from "next/link";
import { HERO_CONTENT } from "./aboutData";
import styles from "@/app/about/AboutPage.module.css";

export default function AboutHero() {
  return (
    <section className={styles.heroSection} aria-labelledby="about-heading">
      <div className={styles.heroGridPattern} aria-hidden="true" />
      <div className={styles.heroDecorOrbOne} aria-hidden="true" />
      <div className={styles.heroDecorOrbTwo} aria-hidden="true" />

      <div className={styles.heroContainer}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>{HERO_CONTENT.eyebrow}</p>
            <h1 id="about-heading" className={styles.heroName}>
              {HERO_CONTENT.name}
            </h1>

            <span className={styles.heroStatusBadge}>
              {HERO_CONTENT.statusLabel}
            </span>

            <p className={styles.heroTagline}>{HERO_CONTENT.tagline}</p>

            {HERO_CONTENT.introParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className={styles.heroIntro}>
                {paragraph}
              </p>
            ))}

            <div className={styles.heroActions}>
              <Link
                className={styles.heroPrimaryButton}
                href={HERO_CONTENT.buttons.primary.href}
              >
                {HERO_CONTENT.buttons.primary.label}
                <span aria-hidden="true">↗</span>
              </Link>

              <a
                className={styles.heroSecondaryButton}
                href={HERO_CONTENT.buttons.secondary.href}
                target="_blank"
                rel="noreferrer"
              >
                {HERO_CONTENT.buttons.secondary.label}
              </a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroPortraitGlow} aria-hidden="true" />
            <div className={styles.heroPortraitFrame}>
              <Image
                className={styles.heroPortraitImage}
                src={HERO_CONTENT.portrait.src}
                alt={HERO_CONTENT.portrait.alt}
                fill
                priority
                sizes="(max-width: 900px) 88vw, 46vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
