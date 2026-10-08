"use client";

import { useState } from "react";
import Link from "next/link";
import TechIcon from "./TechIcon";
import type { SkillEntry } from "./skillsData";
import styles from "./Skills.module.css";

type SkillsExplorerProps = {
  groups: { id: string; label: string; items: SkillEntry[] }[];
};

/**
 * Toolkit grouped by category. Selecting a tool shows where it was actually
 * used — the "Used in" links come from each project's verified stack, so no
 * proficiency ratings are needed.
 */
export default function SkillsExplorer({ groups }: SkillsExplorerProps) {
  const all = groups.flatMap((group) => group.items);
  const [selectedName, setSelectedName] = useState(all[0]?.name);
  const selected = all.find((item) => item.name === selectedName) ?? all[0];

  if (!selected) return null;

  return (
    <div className={styles.explorer}>
      <div className={styles.groups}>
        {groups.map((group, groupIndex) => (
          <div className={styles.group} key={group.id} role="group" aria-labelledby={`skill-group-${group.id}`}>
            <h3 id={`skill-group-${group.id}`} className={styles.groupLabel}>
              <span aria-hidden="true">{String(groupIndex + 1).padStart(2, "0")}</span>
              {group.label}
            </h3>
            <ul className={styles.toolGrid}>
              {group.items.map((item) => {
                const isSelected = item.name === selected.name;
                return (
                  <li key={item.name}>
                    <button
                      type="button"
                      className={`${styles.tool}${isSelected ? ` ${styles.toolSelected}` : ""}`}
                      aria-pressed={isSelected}
                      aria-controls="skill-detail"
                      onClick={() => setSelectedName(item.name)}
                    >
                      <span className={styles.toolIcon}>
                        <TechIcon tech={item} size={28} fallbackClassName={styles.toolFallback} />
                      </span>
                      <span className={styles.toolName}>{item.name}</span>
                      {item.projects.length > 0 && (
                        <span className={styles.toolCount}>
                          <span aria-hidden="true">{item.projects.length}</span>
                          <span className={styles.srOnly}>
                            , used in {item.projects.length} project{item.projects.length === 1 ? "" : "s"}
                          </span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <aside id="skill-detail" className={styles.detail} aria-live="polite" aria-label="Selected technology">
        <div className={styles.detailInner} key={selected.name}>
          <span className={styles.detailIcon}>
            <TechIcon tech={selected} size={56} fallbackClassName={styles.toolFallback} />
          </span>
          <p className={styles.detailGroup}>{selected.groupLabel}</p>
          <p className={styles.detailName}>{selected.name}</p>

          <p className={styles.detailLabel}>Used in</p>
          {selected.projects.length > 0 ? (
            <ul className={styles.detailProjects}>
              {selected.projects.map((project) => (
                <li key={project.slug}>
                  <Link className="ui-btn ui-btn--ghost-light ui-btn--sm" href={`/projects/${project.slug}`}>
                    {project.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.detailEmpty}>Part of my development toolkit — not tied to a featured case study.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
