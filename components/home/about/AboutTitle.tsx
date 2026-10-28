import defaultStyles from "./AboutStory.module.css";

/** A CSS module with the title's class names (title, titleLine, mask, word, …). */
type TitleStyles = Readonly<Record<string, string>>;

function TitleWord({ children, accent, styles }: { children: string; accent?: string; styles: TitleStyles }) {
  return (
    <span className={styles.mask}>
      <span className={accent ? `${styles.word} ${accent}` : styles.word} data-word>
        {children}
      </span>
    </span>
  );
}

/**
 * "From cooking to coding." — shared by the homepage preview and the /about
 * opening so the headline never drifts between the two. Each page passes its
 * own CSS module (same class names) to size it for its layout.
 */
export default function AboutTitle({ as: Heading, styles = defaultStyles }: { as: "h1" | "h2"; styles?: TitleStyles }) {
  return (
    <Heading id="about-title" className={styles.title}>
      <span className={styles.titleLine}>
        <TitleWord styles={styles}>From</TitleWord> <TitleWord styles={styles} accent={styles.kitchenWord}>cooking</TitleWord>
      </span>{" "}
      <span className={`${styles.titleLine} ${styles.titleLineIndent}`}>
        <TitleWord styles={styles}>to</TitleWord> <TitleWord styles={styles} accent={styles.codeWord}>coding.</TitleWord>
        <span className={styles.caret} aria-hidden="true" />
      </span>
    </Heading>
  );
}
