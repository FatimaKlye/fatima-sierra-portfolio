import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./HomeEditorial.module.css";

type PreviewHeaderProps = {
  /** e.g. "03 — Skills" */
  number: string;
  headingId: string;
  /** Wrap the accent phrase in <em>. */
  title: ReactNode;
  intro: string;
  href: string;
  linkLabel: string;
};

/** Header for a homepage highlight: number, title, one-line intro and the link to the full page. */
export default function PreviewHeader({ number, headingId, title, intro, href, linkLabel }: PreviewHeaderProps) {
  return (
    <header className={styles.previewHeader}>
      <p className={styles.sectionNumber}>{number}</p>
      <div className={styles.previewHeading}>
        <div>
          <h2 id={headingId} className={styles.sectionTitle}>
            {title}
          </h2>
          <p className={styles.sectionIntro}>{intro}</p>
        </div>
        <Link className="ui-btn ui-btn--secondary" href={href}>
          {linkLabel}
        </Link>
      </div>
    </header>
  );
}
