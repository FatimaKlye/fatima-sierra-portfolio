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

/**
 * "From cooking to coding." — shared by the homepage preview and the /about
 * opening so the headline never drifts between the two.
 */
export default function AboutTitle({ as: Heading }: { as: "h1" | "h2" }) {
  return (
    <Heading id="about-title" className={styles.title}>
      <span className={styles.titleLine}>
        <TitleWord>From</TitleWord> <TitleWord className={styles.kitchenWord}>cooking</TitleWord>
      </span>{" "}
      <span className={`${styles.titleLine} ${styles.titleLineIndent}`}>
        <TitleWord>to</TitleWord> <TitleWord className={styles.codeWord}>coding.</TitleWord>
        <span className={styles.caret} aria-hidden="true" />
      </span>
    </Heading>
  );
}
