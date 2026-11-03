"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import PracticeShowcase from "./PracticeShowcase";
import TechIcon from "./TechIcon";
import type { PracticeArea } from "./skillsData";
import styles from "./Skills.module.css";

type PracticeIndexProps = {
  areas: PracticeArea[];
};

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * The eight knowledge areas. The three build areas get large editorial
 * spreads with their tools, the projects that prove them and a real view of
 * that work — pointing at a project in "Used in" brings it up in the visual.
 * The five supporting areas sit in an index whose rows open to show the detail.
 */
export default function PracticeIndex({ areas }: PracticeIndexProps) {
  const build = areas.filter((area) => area.tier === "build");
  const support = areas.filter((area) => area.tier === "support");
  const [open, setOpen] = useState<string | null>(null);
  // area id → project slug pointed at in that area's "Used in" list.
  const [active, setActive] = useState<Record<string, string>>({});
  const activate = (areaId: string, slug: string) =>
    setActive((current) => (current[areaId] === slug ? current : { ...current, [areaId]: slug }));

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
                          data-current={active[area.id] === project.slug ? "" : undefined}
                          onPointerEnter={() => activate(area.id, project.slug)}
                          onFocus={() => activate(area.id, project.slug)}
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

            {area.showcase && (
              <div className={styles.spreadVisual}>
                <PracticeShowcase
                  showcase={area.showcase}
                  active={active[area.id]}
                  onActivate={(slug) => activate(area.id, slug)}
                />
              </div>
            )}
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
