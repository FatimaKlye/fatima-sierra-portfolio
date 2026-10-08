import styles from "./ProjectDetails.module.css";

type SectionHeadProps = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  tone?: "light" | "onDark";
  className?: string;
};

export default function SectionHead({ id, number, eyebrow, title, tone = "light", className }: SectionHeadProps) {
  const toneClass = tone === "onDark" ? styles.onDark : "";

  return (
    <header className={[styles.sectionHead, toneClass, className].filter(Boolean).join(" ")} data-reveal>
      <p className={styles.eyebrow}>
        <span className={styles.eyebrowNum}>{number}</span>
        <span className={styles.eyebrowRule} aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 id={id} className={styles.sectionTitle}>
        {title}
      </h2>
    </header>
  );
}
