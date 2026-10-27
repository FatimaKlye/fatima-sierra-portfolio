"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import TechIcon from "./TechIcon";
import type { PracticeArea } from "./skillsData";
import styles from "./Skills.module.css";

type PracticeIndexProps = {
  areas: PracticeArea[];
  /** slug → preview image for the hover peek. */
  images: Record<string, string>;
};

const pad = (value: number) => String(value).padStart(2, "0");

/* Small drawings that give each build area its own silhouette: a browser, a phone, a table. */
function Motif({ id }: { id: string }) {
  if (id === "web") {
    return (
      <div className={`${styles.motif} ${styles.motifWeb}`} aria-hidden="true">
        <span className={styles.motifBar}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.motifGrid}>
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
    );
  }
  if (id === "mobile") {
    return (
      <div className={`${styles.motif} ${styles.motifPhone}`} aria-hidden="true">
        <span className={styles.motifNotch} />
        <span className={styles.motifRows}>
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
    );
  }
  return (
    <div className={`${styles.motif} ${styles.motifTable}`} aria-hidden="true">
      {Array.from({ length: 5 }, (_, row) => (
        <span className={styles.motifRow} key={row}>
          <i />
          <i />
          <i />
        </span>
      ))}
    </div>
  );
}

/**
 * The eight knowledge areas. The three build areas get large editorial
 * spreads with their tools and the projects that prove them; the five
 * supporting areas sit in an index whose rows open to show the detail.
 */
export default function PracticeIndex({ areas, images }: PracticeIndexProps) {
  const build = areas.filter((area) => area.tier === "build");
  const support = areas.filter((area) => area.tier === "support");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <div className={styles.build}>
        {build.map((area, index) => (
          <article className={styles.spread} key={area.id} aria-labelledby={`practice-${area.id}`} data-reveal>
            <span className={styles.spreadIndex} aria-hidden="true">
              {pad(index + 1)}
            </span>

            <div className={styles.spreadBody}>
              <h3 id={`practice-${area.id}`} className={styles.spreadTitle}>
                {area.title}
              </h3>
              <p className={styles.spreadSummary}>{area.summary}</p>

              <ul className={styles.toolRow} aria-label="Tools">
                {area.tools.map((tool) => (
                  <li key={tool.name} className={styles.toolChip}>
                    <TechIcon tech={tool} size={20} fallbackClassName={styles.iconFallback} />
                    {tool.name}
                  </li>
                ))}
              </ul>

              <p className={styles.topics}>
                {area.topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </p>

              {area.projects.length > 0 && (
                <div className={styles.spreadUsed}>
                  <p className={styles.usedLabel}>Used in</p>
                  <ul className={styles.usedList}>
                    {area.projects.map((project) => (
                      <li key={project.slug}>
                        <Link
                          className={styles.usedRow}
                          href={`/projects/${project.slug}`}
                          data-peek-src={images[project.slug]}
                        >
                          <span>{project.title}</span>
                          <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Motif id={area.id} />
          </article>
        ))}
      </div>

      <div className={styles.support}>
        <p className={styles.supportLabel} data-reveal>
          Supporting practice
        </p>
        <ol className={styles.supportList} data-stagger>
          {support.map((area, index) => {
            const isOpen = open === area.id;
            return (
              <li className={`${styles.supportRow}${isOpen ? ` ${styles.supportOpen}` : ""}`} key={area.id}>
                <h3 className={styles.supportHeading}>
                  <button
                    type="button"
                    className={styles.supportToggle}
                    aria-expanded={isOpen}
                    aria-controls={`practice-panel-${area.id}`}
                    onClick={() => setOpen(isOpen ? null : area.id)}
                  >
                    <span className={styles.supportIndex} aria-hidden="true">
                      {pad(build.length + index + 1)}
                    </span>
                    <span className={styles.supportTitle}>{area.title}</span>
                    <span className={styles.supportSummary}>{area.summary}</span>
                    <span className={styles.supportIcons} aria-hidden="true">
                      {area.tools.map((tool) => (
                        <TechIcon key={tool.name} tech={tool} size={22} fallbackClassName={styles.iconFallback} />
                      ))}
                    </span>
                    <Plus className={styles.supportPlus} size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </h3>

                <div className={styles.supportPanel} id={`practice-panel-${area.id}`} inert={!isOpen}>
                  <div className={styles.supportPanelInner}>
                    <p className={styles.topics}>
                      {area.topics.map((topic) => (
                        <span key={topic}>{topic}</span>
                      ))}
                    </p>
                    <ul className={styles.supportTools}>
                      {area.tools.map((tool) => (
                        <li key={tool.name}>
                          <strong>{tool.name}</strong>
                          <span>{tool.usage}</span>
                        </li>
                      ))}
                    </ul>
                    {area.repos.length > 0 && (
                      <div className={styles.repos}>
                        <p className={styles.usedLabel}>Source on GitHub</p>
                        <ul className={styles.readoutLinks}>
                          {area.repos.map((repo) => (
                            <li key={repo.url}>
                              <a
                                className={styles.repoLink}
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {repo.title}
                                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                                <span className={styles.srOnly}> (opens in a new tab)</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
