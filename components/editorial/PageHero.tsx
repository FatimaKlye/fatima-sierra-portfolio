import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  /** Breadcrumb label for the current page, e.g. "Projects". */
  label: string;
  /** Small kicker above the title. */
  eyebrow: string;
  /** Page title; wrap the accent phrase in <em>. */
  title: ReactNode;
  intro: string;
  /** Short facts shown along the bottom rule. */
  meta?: { label: string; value: string }[];
  /** Oversized decorative number in the corner (e.g. "05"). */
  index?: string;
  children?: ReactNode;
};

/** Opening block shared by every dedicated page: breadcrumb, oversized title, intro and a fact row. */
export default function PageHero({ label, eyebrow, title, intro, meta, index, children }: PageHeroProps) {
  return (
    <header className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      {index && (
        <span className={styles.index} aria-hidden="true">
          {index}
        </span>
      )}

      <div className={styles.inner}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-current="page">{label}</li>
          </ol>
        </nav>

        <p className={styles.eyebrow} data-reveal>
          {eyebrow}
        </p>
        <h1 className={styles.title} data-reveal>
          {title}
        </h1>

        <div className={styles.foot}>
          <p className={styles.intro} data-reveal>
            {intro}
          </p>
          {meta && meta.length > 0 && (
            <dl className={styles.meta} data-stagger>
              {meta.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {children}
      </div>
    </header>
  );
}
