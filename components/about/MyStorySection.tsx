import { existsSync } from "fs";
import path from "path";
import Image from "next/image";
import { MY_STORY_CONTENT, STORY_CHAPTERS } from "./aboutData";
import styles from "@/app/about/AboutPage.module.css";

function hasImage(imagePath?: string) {
  if (!imagePath) return false;
  return existsSync(path.join(process.cwd(), "public", imagePath));
}

export default function MyStorySection() {
  return (
    <section className={styles.section} aria-labelledby="my-story-heading">
      <div className={styles.sectionContainer}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>{MY_STORY_CONTENT.eyebrow}</p>
          <h2 id="my-story-heading" className={styles.sectionTitle}>
            {MY_STORY_CONTENT.title}
          </h2>
          <p className={styles.storySubtitle}>{MY_STORY_CONTENT.subtitle}</p>
          <p className={styles.sectionIntro}>{MY_STORY_CONTENT.intro}</p>
        </header>

        <div className={styles.storyChapterList}>
          {STORY_CHAPTERS.map((chapter) => {
            const imageReady = hasImage(chapter.image);

            return (
              <article className={styles.storyChapter} key={chapter.id}>
                <div className={styles.storyImageWrap}>
                  <div className={styles.storyImageGlow} aria-hidden="true" />
                  <div className={styles.storyImageFrame}>
                    {imageReady && chapter.image ? (
                      <Image
                        className={styles.storyImage}
                        src={chapter.image}
                        alt={chapter.imageAlt}
                        fill
                        sizes="(max-width: 980px) 88vw, 38vw"
                        style={{
                          objectPosition: chapter.imagePosition ?? "center",
                        }}
                      />
                    ) : (
                      <div className={styles.storyImagePlaceholder}>
                        <span
                          className={styles.storyImagePlaceholderIcon}
                          aria-hidden="true"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <circle cx="9" cy="11" r="2" />
                            <path d="M21 16l-4.5-4.5a2 2 0 0 0-2.8 0L7 18" />
                          </svg>
                        </span>
                        <p className={styles.storyImagePlaceholderLabel}>
                          {chapter.imagePlaceholderLabel}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.storyTextWrap}>
                  <div className={styles.storyChapterMeta}>
                    <span className={styles.storyChapterNumber} aria-hidden="true">
                      {chapter.number}
                    </span>
                    <span className={styles.storyKicker}>{chapter.kicker}</span>
                  </div>
                  <h3 className={styles.storyChapterTitle}>{chapter.title}</h3>
                  <p className={styles.storyParagraph}>{chapter.paragraph}</p>
                  <ul className={styles.storyTagList}>
                    {chapter.tags.map((tag) => (
                      <li key={tag} className={styles.storyTag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        <p className={styles.storyClosing}>“{MY_STORY_CONTENT.closing}”</p>
      </div>
    </section>
  );
}
