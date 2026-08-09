"use client";

import { useState, type ReactNode } from "react";
import {
  CAPABILITIES,
  CAPABILITIES_CONTENT,
  CORE_TECHNOLOGIES_CONTENT,
  KNOWLEDGE_CONTENT,
  LEARNING_EXPOSURE,
  PROFESSIONAL_SKILLS,
  TECHNOLOGY_GROUPS,
  type CapabilityItem,
} from "./aboutData";
import styles from "@/app/about/AboutPage.module.css";

const CAPABILITY_ICONS: Record<CapabilityItem["id"], ReactNode> = {
  build: (
    <>
      <polyline points="8 6 3 12 8 18" />
      <polyline points="16 6 21 12 16 18" />
    </>
  ),
  integrate: (
    <>
      <path d="M9 17H7a5 5 0 0 1 0-10h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  test: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 11l2 2 4-4" />
    </>
  ),
  document: (
    <>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="13 2 13 8 19 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </>
  ),
};

export default function KnowledgeSection() {
  const [brokenIcons, setBrokenIcons] = useState<Set<string>>(new Set());

  return (
    <section className={styles.section} aria-labelledby="knowledge-heading">
      <div className={styles.sectionContainer}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>{KNOWLEDGE_CONTENT.eyebrow}</p>
          <h2 id="knowledge-heading" className={styles.sectionTitle}>
            {KNOWLEDGE_CONTENT.title}
          </h2>
          <p className={styles.sectionIntro}>{KNOWLEDGE_CONTENT.intro}</p>
        </header>

        {/* Core Technologies ------------------------------------------------ */}
        <div className={styles.knowledgeSubBlock}>
          <h3 className={styles.knowledgeSubheading}>
            {CORE_TECHNOLOGIES_CONTENT.title}
          </h3>

          <div className={styles.techGroupsGrid}>
            {TECHNOLOGY_GROUPS.map((group) => (
              <article key={group.id} className={styles.techGroupCard}>
                <h4 className={styles.techGroupTitle}>{group.label}</h4>
                <div className={styles.techChipsRow}>
                  {group.items.map((tech) => {
                    const iconKey = `${group.id}-${tech.name}`;
                    const iconFailed = brokenIcons.has(iconKey);

                    return (
                      <span key={tech.name} className={styles.techChip}>
                        <span
                          className={styles.techIconFrame}
                          aria-hidden="true"
                        >
                          {iconFailed ? (
                            <span className={styles.techIconFallback}>
                              {tech.mark}
                            </span>
                          ) : (
                            <img
                              className={styles.techIcon}
                              src={tech.icon}
                              alt=""
                              width="20"
                              height="20"
                              loading="lazy"
                              onError={() => {
                                setBrokenIcons((previous) => {
                                  const next = new Set(previous);
                                  next.add(iconKey);
                                  return next;
                                });
                              }}
                            />
                          )}
                        </span>
                        <span>{tech.name}</span>
                      </span>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* What I Can Do ------------------------------------------------------ */}
        <div className={styles.knowledgeSubBlock}>
          <h3 className={styles.knowledgeSubheading}>
            {CAPABILITIES_CONTENT.title}
          </h3>

          <div className={styles.capabilityGrid}>
            {CAPABILITIES.map((capability) => (
              <article key={capability.id} className={styles.capabilityCard}>
                <span className={styles.capabilityIcon} aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {CAPABILITY_ICONS[capability.id]}
                  </svg>
                </span>
                <p className={styles.capabilityVerb}>{capability.verb}</p>
                <h4 className={styles.capabilityTitle}>{capability.title}</h4>
                <p className={styles.capabilityDesc}>
                  {capability.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Additional Technical Learning Exposure ----------------------------- */}
        <div className={styles.knowledgeSubBlock}>
          <h3 className={styles.knowledgeSubheadingCompact}>
            Additional Technical Learning Exposure
          </h3>
          <ul className={styles.learningTagList}>
            {LEARNING_EXPOSURE.map((item) => (
              <li key={item} className={styles.learningTagCompact}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Professional Skills -------------------------------------------------- */}
        <div className={styles.knowledgeSubBlock}>
          <h3 className={styles.knowledgeSubheadingCompact}>
            Professional Skills
          </h3>
          <ul className={styles.skillsList}>
            {PROFESSIONAL_SKILLS.map((skill) => (
              <li key={skill} className={styles.skillItemCompact}>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
