"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { SkillNote } from "./beyondData";
import styles from "./Beyond.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/** Staggered left offsets that give the stack its asymmetric, set-by-hand rhythm. */
const INDENTS = ["0%", "9%", "3%", "15%", "6%", "19%"];

/**
 * Professional skills as large set type. Hovering (fine pointers), tapping or arrowing onto a
 * skill inks it in and shows where it is documented — a tablist under the hood.
 */
export default function SkillsTypeset({ skills }: { skills: SkillNote[] }) {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const current = skills[active];
  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = `${baseId}-panel`;

  const handleKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const last = skills.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? active === last ? 0 : active + 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? active === 0 ? last : active - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <div className={styles.typeset}>
      <ol className={styles.skillWall} role="tablist" aria-label="Professional skills" aria-orientation="vertical" onKeyDown={handleKeyDown}>
        {skills.map((skill, index) => (
          <li key={skill.title} role="presentation" style={{ "--indent": INDENTS[index % INDENTS.length] } as CSSProperties}>
            <button
              ref={(element) => {
                tabsRef.current[index] = element;
              }}
              type="button"
              role="tab"
              id={tabId(index)}
              className={styles.skillLine}
              aria-selected={index === active}
              aria-controls={panelId}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              onPointerEnter={(event) => event.pointerType === "mouse" && setActive(index)}
            >
              <span className={styles.skillNumber} aria-hidden="true">
                {pad(index + 1)}
              </span>
              <span className={styles.skillText}>{skill.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.skillNote} role="tabpanel" id={panelId} aria-labelledby={tabId(active)}>
        <p className={styles.skillNoteCount} aria-hidden="true">
          {pad(active + 1)} <span>/ {pad(skills.length)}</span>
        </p>
        <div key={current.title} className={styles.skillNoteBody}>
          <p className={styles.skillNoteTitle}>{current.title}</p>
          <p className={styles.skillNoteText}>{current.evidence ?? "Listed among the skills on my résumé."}</p>
          <p className={styles.skillNoteSource}>
            <span>On record</span> {current.source}
          </p>
        </div>
      </div>
    </div>
  );
}
