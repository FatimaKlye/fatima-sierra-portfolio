"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./HeroSection.module.css";

const FOCUS_AREAS = [
    "building solutions",
    "creating experiences",
    "solving problems",
    "developing ideas" 
];

type ExpertiseId =
  | "mobile"
  | "web"
  | "responsive-ui"
  | "database"
  | "documentation"
  | "ai-assisted-development";

type Technology = {
  name: string;
  mark: string;
  icon: string;
};

type ExpertiseArea = {
  id: ExpertiseId;
  label: string;
  technologies: string[];
};

const DEVICON_BASE =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

const TECHNOLOGIES: Technology[] = [
  {
    name: "Flutter",
    mark: "FL",
    icon: `${DEVICON_BASE}/flutter/flutter-original.svg`,
  },
  {
    name: "React",
    mark: "RE",
    icon: `${DEVICON_BASE}/react/react-original.svg`,
  },
  {
    name: "Dart",
    mark: "DA",
    icon: `${DEVICON_BASE}/dart/dart-original.svg`,
  },
  {
    name: "C#",
    mark: "C#",
    icon: `${DEVICON_BASE}/csharp/csharp-original.svg`,
  },
  {
    name: "Supabase",
    mark: "SU",
    icon: `${DEVICON_BASE}/supabase/supabase-original.svg`,
  },
  {
    name: "PostgreSQL",
    mark: "PG",
    icon: `${DEVICON_BASE}/postgresql/postgresql-original.svg`,
  },
  {
    name: "Next.js",
    mark: "NX",
    icon: `${DEVICON_BASE}/nextjs/nextjs-original.svg`,
  },
  {
    name: "TypeScript",
    mark: "TS",
    icon: `${DEVICON_BASE}/typescript/typescript-original.svg`,
  },
  {
    name: "JavaScript",
    mark: "JS",
    icon: `${DEVICON_BASE}/javascript/javascript-original.svg`,
  },
  {
    name: "HTML",
    mark: "HT",
    icon: `${DEVICON_BASE}/html5/html5-original.svg`,
  },
  {
    name: "CSS",
    mark: "CS",
    icon: `${DEVICON_BASE}/css3/css3-original.svg`,
  },
  {
    name: "Java",
    mark: "JV",
    icon: `${DEVICON_BASE}/java/java-original.svg`,
  },
  {
    name: "Git",
    mark: "GT",
    icon: `${DEVICON_BASE}/git/git-original.svg`,
  },
  {
    name: "GitHub",
    mark: "GH",
    icon: `${DEVICON_BASE}/github/github-original.svg`,
  },
  {
    name: "ChatGPT",
    mark: "AI",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@15/icons/openai.svg",
  },
  {
    name: "Claude",
    mark: "AI",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@15/icons/claude.svg",
  },
  {
    name: "Figma",
    mark: "FI",
    icon: `${DEVICON_BASE}/figma/figma-original.svg`,
  },
  {
    name: "Figma Make",
    mark: "FM",
    icon: `${DEVICON_BASE}/figma/figma-original.svg`,
  },
  {
    name: "Canva",
    mark: "CV",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@15/icons/canva.svg",
  },
  {
    name: "Visual Studio Code",
    mark: "VS",
    icon: `${DEVICON_BASE}/vscode/vscode-original.svg`,
  },
  {
    name: "Cursor",
    mark: "CU",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@15/icons/cursor.svg",
  },
];

const EXPERTISE_AREAS: ExpertiseArea[] = [
  {
    id: "mobile",
    label: "Mobile application development",
    technologies: [
      "Visual Studio Code",
      "Cursor",
      "Flutter",
      "Dart",
      "Java",
      "Supabase",
    ],
  },
  {
    id: "web",
    label: "Web application development",
    technologies: [
      "Visual Studio Code",
      "Cursor",
      "Next.js",
      "React",
      "TypeScript",
      "JavaScript",
      "HTML",
      "CSS",
      "Supabase",
      "PostgreSQL",
    ],
  },
  {
    id: "responsive-ui",
    label: "Responsive user interface design",
    technologies: [
      "Figma",
      "Figma Make",
      "Canva",
      "React",
      "Next.js",
      "TypeScript",
      "HTML",
      "CSS",
      "Flutter",
    ],
  },
  {
    id: "database",
    label: "Database integration",
    technologies: ["Supabase", "PostgreSQL", "TypeScript", "JavaScript"],
  },
  {
    id: "documentation",
    label: "Basic system documentation",
    technologies: ["Git", "GitHub", "TypeScript"],
  },
  {
    id: "ai-assisted-development",
    label: "AI-assisted development",
    technologies: ["ChatGPT", "Claude", "Cursor", "Figma Make"],
  },
];


export default function HeroSection() {
  const [focusIndex, setFocusIndex] = useState(0);
  const [typedFocus, setTypedFocus] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedExpertise, setSelectedExpertise] =
    useState<ExpertiseId>("mobile");
  const [brokenIcons, setBrokenIcons] = useState<Set<string>>(new Set());

  const selectedArea =
    EXPERTISE_AREAS.find((area) => area.id === selectedExpertise) ??
    EXPERTISE_AREAS[0];
  const activeTechnologies = new Set(selectedArea.technologies);

  useEffect(() => {
    const currentFocus = FOCUS_AREAS[focusIndex];

    let delay = isDeleting ? 42 : 72;

    if (!isDeleting && typedFocus === currentFocus) {
      delay = 1450;
    } else if (isDeleting && typedFocus === "") {
      delay = 260;
    }

    const timer = window.setTimeout(() => {
      if (!isDeleting && typedFocus === currentFocus) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && typedFocus === "") {
        setIsDeleting(false);
        setFocusIndex((currentIndex) => (currentIndex + 1) % FOCUS_AREAS.length);
        return;
      }

      setTypedFocus(
        currentFocus.slice(0, typedFocus.length + (isDeleting ? -1 : 1)),
      );
    }, delay);

    return () => window.clearTimeout(timer);
  }, [focusIndex, isDeleting, typedFocus]);

  return (
    <>
      <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.decorativeOrbOne} aria-hidden="true" />
      <div className={styles.decorativeOrbTwo} aria-hidden="true" />
      <div className={styles.decorativeRing} aria-hidden="true" />

      <div className={styles.container}>

        <div className={styles.heroGrid}>
          <div className={styles.copyColumn}>
            <p className={styles.eyebrow}>WEB &amp; MOBILE DEVELOPER</p>

            <h1 id="home-heading" className={styles.heading}>
              Creating purposeful digital solutions
            </h1>

            <p
              className={styles.focusLine}
              aria-label="Fatima Klye M. Sierra. Focused on public safety, education, sustainability, and community development."
            >
              <span aria-hidden="true">
                <strong>Fatima Klye M. Sierra</strong>
                <span className={styles.focusSeparator}> · </span>
                Focused on{" "}
                <span className={styles.typewriterGroup}>
                  <span className={styles.rotatingFocus}>{typedFocus}</span>
                  <span className={styles.typeCursor}>|</span>
                </span>
              </span>
            </p>
          </div>

          <div className={styles.visualColumn}>
            <div className={styles.portraitArea}>
              <div className={styles.portraitGlow} aria-hidden="true" />

              <div className={styles.codeWindowGroup}>
                <div
                  className={styles.portraitFrame}
                  aria-label="Code profile for Fatima Klye M. Sierra"
                >
                <div className={styles.codeHeader} aria-hidden="true">
                  <span className={styles.codeDots}>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className={styles.codeFilename}>profile.ts</span>
                  <span className={styles.codeHeaderSpacer} />
                </div>

                <div className={styles.codeBody} aria-hidden="true">
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>1</span>
                    <span>
                      <span className={styles.codeKeyword}>const</span>{" "}
                      <span className={styles.codeVariable}>developer</span>{" "}
                      <span className={styles.codePunctuation}>= {"{"}</span>
                    </span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>2</span>
                    <span className={styles.codeIndentOne}>
                      <span className={styles.codeProperty}>name</span>
                      <span className={styles.codePunctuation}>: </span>
                      <span className={styles.codeString}>
                        &quot;Fatima Klye M. Sierra&quot;
                      </span>
                      <span className={styles.codePunctuation}>,</span>
                    </span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>3</span>
                    <span className={styles.codeIndentOne}>
                      <span className={styles.codeProperty}>role</span>
                      <span className={styles.codePunctuation}>: </span>
                      <span className={styles.codeString}>
                        &quot;Web &amp; Mobile Developer&quot;
                      </span>
                      <span className={styles.codePunctuation}>,</span>
                    </span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>4</span>
                    <span className={styles.codeIndentOne}>
                      <span className={styles.codeProperty}>focus</span>
                      <span className={styles.codePunctuation}>: [</span>
                    </span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>5</span>
                    <span className={styles.codeIndentTwo}>
                      <span className={styles.codeString}>
                        &quot;building digital solutions&quot;
                      </span>
                      <span className={styles.codePunctuation}>,</span>
                    </span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>6</span>
                    <span className={styles.codeIndentTwo}>
                      <span className={styles.codeString}>
                        &quot;creating useful experiences&quot;
                      </span>
                      <span className={styles.codePunctuation}>,</span>
                    </span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>7</span>
                    <span className={styles.codeIndentTwo}>
                      <span className={styles.codeString}>
                        &quot;solving real-world problems&quot;
                      </span>
                      <span className={styles.codePunctuation}>,</span>
                    </span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>8</span>
                    <span className={styles.codeIndentTwo}>
                      <span className={styles.codeString}>
                        &quot;turning ideas into systems&quot;
                      </span>
                      <span className={styles.codePunctuation}>,</span>
                    </span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>9</span>
                    <span className={styles.codeIndentOne}>
                      <span className={styles.codePunctuation}>],</span>
                    </span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>10</span>
                    <span className={styles.codeIndentOne}>
                      <span className={styles.codeProperty}>stack</span>
                      <span className={styles.codePunctuation}>: [</span>
                      <span className={styles.codeString}>
                        &quot;Next.js&quot;
                      </span>
                      <span className={styles.codePunctuation}>, </span>
                      <span className={styles.codeString}>
                        &quot;Flutter&quot;
                      </span>
                      <span className={styles.codePunctuation}>, </span>
                      <span className={styles.codeString}>
                        &quot;Java&quot;
                      </span>
                      <span className={styles.codePunctuation}>, </span>
                      <span className={styles.codeString}>
                        &quot;React JS&quot;
                      </span>
                      <span className={styles.codePunctuation}>],</span>
                    </span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>11</span>
                    <span className={styles.codePunctuation}>{"};"}</span>
                  </div>

                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>12</span>
                    <span>
                      <span className={styles.codeKeyword}>export default</span>{" "}
                      <span className={styles.codeVariable}>developer</span>
                      <span className={styles.codePunctuation}>;</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.codeBadgeOne} aria-hidden="true">
                <span>MOBILE</span>
                Flutter + Supabase
              </div>

              <div className={styles.codeBadgeTwo} aria-hidden="true">
                <span>WEB</span>
                Next.js + TypeScript
              </div>
              </div>

              <div className={styles.smallOrb} aria-hidden="true" />
            </div>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/projects">
              Explore my work
              <span aria-hidden="true">↗</span>
            </Link>

            <a
              className={styles.secondaryButton}
              href="/assets/resume/fatima-sierra-resume.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Download resume
            </a>
          </div>
        </div>
      </div>
      </section>

      <section
        className={styles.expertiseSection}
        aria-labelledby="expertise-heading"
      >
        <div className={styles.expertiseGlowOne} aria-hidden="true" />
        <div className={styles.expertiseGlowTwo} aria-hidden="true" />

        <div className={styles.expertiseContainer}>
          <header className={styles.expertiseHeader}>
            <p className={styles.sectionEyebrow}>OVERVIEW</p>
            <h2 id="expertise-heading" className={styles.expertiseTitle}>
              CORE CAPABILITIES 
            </h2>
            <p className={styles.expertiseIntro}>
             Explore each area to see the tools and technologies I use to design, develop, and deliver reliable digital solutions.
            </p>
          </header>

          <div className={styles.expertiseLayout}>
            <div className={styles.expertiseColumn}>
              <p className={styles.columnLabel}>
                Expertise & Technology
              </p>

              <div
                className={styles.expertisePills}
                role="group"
                aria-label="Expertise areas"
              >
                {EXPERTISE_AREAS.map((area) => {
                  const isActive = selectedExpertise === area.id;

                  return (
                    <button
                      key={area.id}
                      type="button"
                      className={`${styles.expertisePill}${
                        isActive ? ` ${styles.expertisePillActive}` : ""
                      }`}
                      aria-pressed={isActive}
                      onClick={() => setSelectedExpertise(area.id)}
                    >
                      {area.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.technologyColumn}>
              <p className={styles.columnLabel}>RELATED TECHNOLOGY</p>

              <div
                className={styles.technologyGrid}
                aria-label={`Technologies related to ${selectedArea.label}`}
              >
                {TECHNOLOGIES.map((technology) => {
                  const isActive = activeTechnologies.has(technology.name);
                  const iconFailed = brokenIcons.has(technology.name);

                  return (
                    <span
                      key={technology.name}
                      className={`${styles.techChip} ${
                        isActive
                          ? styles.techChipActive
                          : styles.techChipMuted
                      }`}
                    >
                      <span
                        className={styles.techIconFrame}
                        aria-hidden="true"
                      >
                        {iconFailed ? (
                          <span className={styles.techIconFallback}>
                            {technology.mark}
                          </span>
                        ) : (
                          <img
                            className={styles.techIcon}
                            src={technology.icon}
                            alt=""
                            width="24"
                            height="24"
                            loading="lazy"
                            onError={() => {
                              setBrokenIcons((previous) => {
                                const next = new Set(previous);
                                next.add(technology.name);
                                return next;
                              });
                            }}
                          />
                        )}
                      </span>
                      <span>{technology.name}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}