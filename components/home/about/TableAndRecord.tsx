"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  KITCHEN_VALUES,
  LEADERSHIP_ROLE_COUNT,
  MEDALS,
  OTHER_CERTIFICATE_COUNT,
  PHOTOGRAPHER_ROLE,
  RECORD_ENTRIES,
  RECORD_TYPES,
  RECORD_YEARS,
  SERVICE_ROLES,
  TEAM_SKILLS,
  type RecordType,
} from "./aboutStoryData";
import styles from "./TableAndRecord.module.css";

/**
 * "What I bring to the table" + "Honours, Leadership & Education".
 *
 * The two sections share one piece of state: which kind of record is highlighted.
 * Each strength's "On the record" link scrolls down to the timeline with its
 * evidence highlighted, so every claim above points at a verified entry below.
 *
 * Motion follows EditorialMotion's rule: nothing is hidden by CSS, GSAP sets the
 * start states after hydration, and reduced-motion visitors get the static layout.
 */

type Filter = "all" | RecordType;

const RECORD_ID = "honours";
const HEADER_FALLBACK = 72;
const pad = (value: number) => String(value).padStart(2, "0");
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const COUNTS: Record<Filter, number> = {
  all: RECORD_ENTRIES.length,
  ...(Object.fromEntries(
    RECORD_TYPES.map((type) => [type.id, RECORD_ENTRIES.filter((entry) => entry.type === type.id).length])
  ) as Record<RecordType, number>),
};

const FIRST_YEAR = RECORD_YEARS[0]?.year;

/** Shapes, not colours alone, tell the four kinds of record apart. */
function Glyph({ type }: { type: RecordType }) {
  return (
    <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true">
      {type === "award" && <path d="M8 1.5l1.8 4.2 4.5.4-3.4 3 1 4.4L8 11.2l-3.9 2.3 1-4.4-3.4-3 4.5-.4z" fill="currentColor" />}
      {type === "certification" && (
        <>
          <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 8.2l2 2 4-4.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {type === "leadership" && <path d="M8 1.5L14.5 8 8 14.5 1.5 8z" fill="currentColor" />}
      {type === "education" && <circle cx="8" cy="8" r="5.25" fill="none" stroke="currentColor" strokeWidth="2" />}
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2.5v11M3.5 9L8 13.5 12.5 9" />
    </svg>
  );
}

/** Text that rolls up to a second copy on hover; the copy is hidden from screen readers. */
function Roll({ text }: { text: string }) {
  return (
    <span className={styles.roll}>
      <span className={styles.rollFront}>{text}</span>
      <span className={styles.rollBack} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}

/** Each word in its own mask so the heading can rise in word by word. */
function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return words.map((word, index) => (
    <span key={`${word}-${index}`}>
      <span className={styles.mask}>
        <span className={styles.word} data-tr-word>
          {word}
        </span>
      </span>
      {index < words.length - 1 ? " " : null}
    </span>
  ));
}

/** Moves the glowing segment of a course's divider to follow the pointer. */
function trackDivider(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse") return;
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--dx", `${Math.round(event.clientX - rect.left)}px`);
}

export default function TableAndRecord() {
  const [filter, setFilter] = useState<Filter>("all");
  const tableRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const table = tableRef.current;
    const record = recordRef.current;
    if (!table || !record) return;

    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        finePointer: "(hover: hover) and (pointer: fine)",
      },
      (context) => {
        const { motion, finePointer } = context.conditions as { motion: boolean; finePointer: boolean };
        const cleanups: (() => void)[] = [];

        // The current year lights up as it passes the reading line (a colour change, so always on).
        record.querySelectorAll<HTMLElement>("[data-tr-year-row]").forEach((row) => {
          ScrollTrigger.create({
            trigger: row,
            start: "top 62%",
            end: "bottom 62%",
            toggleClass: { targets: row, className: styles.yearActive },
          });
        });

        if (motion) {
          // Headings: staggered, masked word reveal.
          [table, record].forEach((section) => {
            const words = section.querySelectorAll("[data-tr-word]");
            gsap.fromTo(
              words,
              { yPercent: 115 },
              {
                yPercent: 0,
                duration: 1.1,
                ease: "power4.out",
                stagger: 0.07,
                clearProps: "transform",
                scrollTrigger: { trigger: words[0], start: "top 88%", once: true },
              }
            );
            gsap.fromTo(
              section.querySelectorAll("[data-tr-fade]"),
              { y: 18, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.1,
                delay: 0.25,
                clearProps: "transform,opacity",
                scrollTrigger: { trigger: words[0], start: "top 88%", once: true },
              }
            );
          });

          // Courses: divider draws, number rises, then the skills follow.
          table.querySelectorAll<HTMLElement>("[data-tr-course]").forEach((course) => {
            const timeline = gsap.timeline({ scrollTrigger: { trigger: course, start: "top 86%", once: true } });
            timeline
              .fromTo(course.querySelector("[data-tr-line]"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power3.inOut", clearProps: "transform" })
              .fromTo(course.querySelector("[data-tr-no]"), { yPercent: 105 }, { yPercent: 0, duration: 0.9, ease: "power4.out", clearProps: "transform" }, 0.15)
              .fromTo(course.querySelector("[data-tr-label]"), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", clearProps: "transform,opacity" }, 0.3)
              .fromTo(
                course.querySelectorAll("[data-tr-item]"),
                { y: 26, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.75, ease: "power3.out", stagger: 0.06, clearProps: "transform,opacity" },
                0.35
              )
              .fromTo(course.querySelector("[data-tr-evidence]"), { opacity: 0 }, { opacity: 1, duration: 0.6, clearProps: "opacity" }, "-=0.3");
          });

          // Oversized background word drifts against the scroll.
          gsap.fromTo(
            table.querySelector("[data-tr-ghost]"),
            { xPercent: 6 },
            { xPercent: -10, ease: "none", scrollTrigger: { trigger: table, start: "top bottom", end: "bottom top", scrub: true } }
          );

          // Timeline: the spine fills as you read; each year and its entries rise in.
          gsap.fromTo(
            record.querySelector("[data-tr-spine]"),
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: { trigger: record.querySelector("[data-tr-timeline]"), start: "top 62%", end: "bottom 62%", scrub: 0.5 },
            }
          );
          record.querySelectorAll<HTMLElement>("[data-tr-year-row]").forEach((row) => {
            const timeline = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 88%", once: true } });
            timeline
              .fromTo(row.querySelector("[data-tr-year]"), { yPercent: 105 }, { yPercent: 0, duration: 0.9, ease: "power4.out", clearProps: "transform" })
              .fromTo(
                row.querySelectorAll("[data-tr-entry]"),
                { y: 28, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.08, clearProps: "transform,opacity" },
                0.1
              );
          });
          gsap.fromTo(
            record.querySelectorAll("[data-tr-filter]"),
            { y: 12, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.05,
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: record.querySelector("[data-tr-filters]"), start: "top 92%", once: true },
            }
          );
        }

        if (motion && finePointer) {
          // A soft glow trails the cursor across the strengths section.
          const point = { x: 0, y: 0 };
          const paint = () => {
            table.style.setProperty("--mx", `${point.x}px`);
            table.style.setProperty("--my", `${point.y}px`);
          };
          const toX = gsap.quickTo(point, "x", { duration: 0.8, ease: "power3", onUpdate: paint });
          const toY = gsap.quickTo(point, "y", { duration: 0.8, ease: "power3", onUpdate: paint });
          const onMove = (event: globalThis.PointerEvent) => {
            const rect = table.getBoundingClientRect();
            toX(event.clientX - rect.left);
            toY(event.clientY - rect.top);
          };
          const onEnter = (event: globalThis.PointerEvent) => {
            const rect = table.getBoundingClientRect();
            point.x = event.clientX - rect.left;
            point.y = event.clientY - rect.top;
            paint();
            table.dataset.glow = "on";
          };
          const onLeave = () => delete table.dataset.glow;
          table.addEventListener("pointermove", onMove);
          table.addEventListener("pointerenter", onEnter);
          table.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            table.removeEventListener("pointermove", onMove);
            table.removeEventListener("pointerenter", onEnter);
            table.removeEventListener("pointerleave", onLeave);
            delete table.dataset.glow;
          });

          // The record button leans gently toward the cursor.
          const cta = ctaRef.current;
          if (cta) {
            const leanX = gsap.quickTo(cta, "x", { duration: 0.5, ease: "power3" });
            const leanY = gsap.quickTo(cta, "y", { duration: 0.5, ease: "power3" });
            const onCtaMove = (event: globalThis.PointerEvent) => {
              const rect = cta.getBoundingClientRect();
              leanX((event.clientX - (rect.left + rect.width / 2)) * 0.18);
              leanY((event.clientY - (rect.top + rect.height / 2)) * 0.28);
            };
            const onCtaLeave = () => {
              leanX(0);
              leanY(0);
            };
            cta.addEventListener("pointermove", onCtaMove);
            cta.addEventListener("pointerleave", onCtaLeave);
            cleanups.push(() => {
              cta.removeEventListener("pointermove", onCtaMove);
              cta.removeEventListener("pointerleave", onCtaLeave);
            });
          }
        }

        return () => cleanups.forEach((cleanup) => cleanup());
      }
    );

    return () => {
      scrollTweenRef.current?.kill();
      mm.revert();
    };
  }, []);

  /** Highlight a kind of record, then glide down to the timeline (same feel as the section index). */
  const goToRecord = (event: MouseEvent<HTMLAnchorElement>, next: Filter) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const record = recordRef.current;
    if (!record) return;
    event.preventDefault();
    setFilter(next);

    if (window.location.hash !== `#${RECORD_ID}`) window.history.pushState(null, "", `#${RECORD_ID}`);

    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const offset = header ? header.getBoundingClientRect().bottom : HEADER_FALLBACK;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const target = Math.round(clamp(record.getBoundingClientRect().top + window.scrollY - offset, 0, maxScroll));
    const root = document.documentElement;

    const land = () => {
      scrollTweenRef.current = null;
      root.style.scrollBehavior = "";
      if (!record.hasAttribute("tabindex")) record.setAttribute("tabindex", "-1");
      record.focus({ preventScroll: true });
    };

    scrollTweenRef.current?.kill();
    // The global `scroll-behavior: smooth` would fight the tween's per-frame updates.
    root.style.scrollBehavior = "auto";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: target, behavior: "instant" });
      land();
      return;
    }

    scrollTweenRef.current = gsap.to(window, {
      duration: clamp(0.6 + Math.abs(target - window.scrollY) / 5000, 0.7, 1.4),
      ease: "power3.inOut",
      scrollTo: {
        y: target,
        autoKill: true,
        onAutoKill: () => {
          scrollTweenRef.current = null;
          root.style.scrollBehavior = "";
        },
      },
      onComplete: land,
    });
  };

  const isMatch = (type: RecordType) => filter === "all" || filter === type;
  const activeType = RECORD_TYPES.find((type) => type.id === filter);
  const announcement = activeType
    ? `Highlighting ${COUNTS[filter]} of ${COUNTS.all} entries: ${activeType.label}.`
    : `Showing all ${COUNTS.all} entries.`;

  return (
    <div className={styles.root}>
      {/* What I bring to the table ------------------------------------------ */}
      <div className={styles.table} id="what-i-bring" data-nav-label="What I bring" ref={tableRef}>
        <p className={styles.ghost} aria-hidden="true" data-tr-ghost>
          à la carte
        </p>

        <div className={styles.container}>
          <header className={styles.head}>
            <div>
              <p className={styles.eyebrow} data-tr-fade>
                Three courses
              </p>
              <h2 className={styles.title}>
                <span className={styles.titleLine}>
                  <Words text="What I bring" />
                </span>{" "}
                <span className={`${styles.titleLine} ${styles.titleIndent}`}>
                  <em>
                    <Words text="to the table." />
                  </em>
                </span>
              </h2>
            </div>
            <p className={styles.lede} data-tr-fade>
              What the kitchen taught me, what teamwork sharpened, and who I am off the clock — each one traced to
              the record below.
            </p>
          </header>

          <ol className={styles.courses}>
            {/* 01 — the kitchen: big words that roll on hover */}
            <li className={`${styles.course} ${styles.courseKitchen}`} data-tr-course onPointerMove={trackDivider}>
              <span className={styles.divider} aria-hidden="true" data-tr-line>
                <span className={styles.dividerGlow} />
              </span>
              <div className={styles.courseHead}>
                <span className={styles.courseNo} aria-hidden="true">
                  <span data-tr-no>01</span>
                </span>
                <h3 className={styles.courseLabel} data-tr-label>
                  Carried over from the kitchen
                </h3>
              </div>
              <ul className={styles.kitchenWords}>
                {KITCHEN_VALUES.map((value) => (
                  <li key={value} data-tr-item>
                    <Roll text={value} />
                  </li>
                ))}
              </ul>
              {MEDALS.length > 0 && (
                <a className={styles.evidence} href={`#${RECORD_ID}`} onClick={(event) => goToRecord(event, "award")} data-tr-evidence>
                  <span className={styles.evidenceKicker}>On the record</span>
                  <span className={styles.evidenceText}>
                    Gold Medalist — {MEDALS.map((medal) => medal.label).join(" & ")}
                  </span>
                  <span className={styles.evidenceArrow}>
                    <ArrowDown />
                  </span>
                </a>
              )}
            </li>

            {/* 02 — teams: a lettered index with drawn underlines */}
            <li className={`${styles.course} ${styles.courseTeams}`} data-tr-course onPointerMove={trackDivider}>
              <span className={styles.divider} aria-hidden="true" data-tr-line>
                <span className={styles.dividerGlow} />
              </span>
              <div className={styles.courseHead}>
                <span className={styles.courseNo} aria-hidden="true">
                  <span data-tr-no>02</span>
                </span>
                <h3 className={styles.courseLabel} data-tr-label>
                  Sharpened in teams
                </h3>
              </div>
              <ol className={styles.teamList}>
                {TEAM_SKILLS.map((skill) => (
                  <li key={skill} data-tr-item>
                    <span className={styles.teamText}>{skill}</span>
                  </li>
                ))}
              </ol>
              {LEADERSHIP_ROLE_COUNT > 0 && (
                <a className={styles.evidence} href={`#${RECORD_ID}`} onClick={(event) => goToRecord(event, "leadership")} data-tr-evidence>
                  <span className={styles.evidenceKicker}>On the record</span>
                  <span className={styles.evidenceText}>{pad(LEADERSHIP_ROLE_COUNT)} student organisation roles</span>
                  <span className={styles.evidenceArrow}>
                    <ArrowDown />
                  </span>
                </a>
              )}
            </li>

            {/* 03 — away from the keyboard: titled notes with their sources */}
            <li className={`${styles.course} ${styles.courseAway}`} data-tr-course onPointerMove={trackDivider}>
              <span className={styles.divider} aria-hidden="true" data-tr-line>
                <span className={styles.dividerGlow} />
              </span>
              <div className={styles.courseHead}>
                <span className={styles.courseNo} aria-hidden="true">
                  <span data-tr-no>03</span>
                </span>
                <h3 className={styles.courseLabel} data-tr-label>
                  Away from the keyboard
                </h3>
              </div>
              <ul className={styles.awayList}>
                <li className={styles.awayItem} data-tr-item>
                  <span className={styles.awayTitle}>Cooking &amp; baking</span>
                  <span className={styles.awaySub}>Cookery and Bread &amp; Pastry Production NC II</span>
                </li>
                {PHOTOGRAPHER_ROLE && (
                  <li className={styles.awayItem} data-tr-item>
                    <span className={styles.awayTitle}>Behind the camera</span>
                    <span className={styles.awaySub}>
                      {PHOTOGRAPHER_ROLE.role}, {PHOTOGRAPHER_ROLE.organization}
                    </span>
                  </li>
                )}
                {SERVICE_ROLES.length > 0 && (
                  <li className={styles.awayItem} data-tr-item>
                    <span className={styles.awayTitle}>Student service</span>
                    {SERVICE_ROLES.map((role) => (
                      <span className={styles.awaySub} key={role.role}>
                        {role.role}, {role.organization}
                      </span>
                    ))}
                  </li>
                )}
              </ul>
              {FIRST_YEAR && (
                <a className={styles.evidence} href={`#${RECORD_ID}`} onClick={(event) => goToRecord(event, "all")} data-tr-evidence>
                  <span className={styles.evidenceKicker}>On the record</span>
                  <span className={styles.evidenceText}>
                    {pad(COUNTS.all)} verified entries since {FIRST_YEAR}
                  </span>
                  <span className={styles.evidenceArrow}>
                    <ArrowDown />
                  </span>
                </a>
              )}
            </li>
          </ol>

          <div className={styles.tableFoot}>
            <p className={styles.footNote} data-tr-fade>
              <strong>Every strength has a source.</strong> Follow it down to the record.
            </p>
            <a
              className={`ui-btn ui-btn--primary ${styles.cta}`}
              href={`#${RECORD_ID}`}
              onClick={(event) => goToRecord(event, "all")}
              ref={ctaRef}
            >
              <Roll text="Honours, Leadership & Education" />
              <span className={styles.ctaIcon}>
                <span className={styles.ctaArrow}>
                  <ArrowDown />
                </span>
                <span className={`${styles.ctaArrow} ${styles.ctaArrowNext}`}>
                  <ArrowDown />
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Honours, Leadership & Education ----------------------------------- */}
      <section
        className={styles.record}
        id={RECORD_ID}
        aria-labelledby="record-title"
        data-nav-label="Honours & education"
        ref={recordRef}
      >
        <div className={styles.container}>
          <header className={styles.head}>
            <div>
              <p className={styles.eyebrow} data-tr-fade>
                On the record
              </p>
              <h2 id="record-title" className={styles.title}>
                <span className={styles.titleLine}>
                  <Words text="Honours, leadership" />
                </span>{" "}
                <span className={`${styles.titleLine} ${styles.titleIndent}`}>
                  <em>
                    <Words text="& education." />
                  </em>
                </span>
              </h2>
            </div>
            <p className={styles.lede} data-tr-fade>
              Every award, certification, role and school in the order it happened — taken from my résumé and
              verified certificates.
            </p>
          </header>

          <div className={styles.filters} role="group" aria-label="Highlight a kind of record" data-tr-filters>
            <button
              type="button"
              className={styles.filter}
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
              data-tr-filter
            >
              All <sup>{pad(COUNTS.all)}</sup>
            </button>
            {RECORD_TYPES.map((type) =>
              COUNTS[type.id] > 0 ? (
                <button
                  type="button"
                  key={type.id}
                  className={styles.filter}
                  data-type={type.id}
                  aria-pressed={filter === type.id}
                  onClick={() => setFilter(filter === type.id ? "all" : type.id)}
                  data-tr-filter
                >
                  <Glyph type={type.id} />
                  {type.label} <sup>{pad(COUNTS[type.id])}</sup>
                </button>
              ) : null
            )}
          </div>
          <p className={styles.srOnly} aria-live="polite">
            {announcement}
          </p>

          <div className={styles.timeline} data-tr-timeline>
            <span className={styles.spine} aria-hidden="true">
              <span className={styles.spineFill} data-tr-spine />
            </span>
            <ol className={styles.years}>
              {RECORD_YEARS.map((group) => (
                <li
                  className={styles.yearRow}
                  key={group.year}
                  data-tr-year-row
                  data-dim={!group.entries.some((entry) => isMatch(entry.type))}
                >
                  <p className={styles.year}>
                    <span data-tr-year>{group.year}</span>
                  </p>
                  <ul className={styles.entries}>
                    {group.entries.map((entry) => {
                      const type = RECORD_TYPES.find((item) => item.id === entry.type);
                      return (
                        <li className={styles.entry} key={entry.id} data-type={entry.type} data-dim={!isMatch(entry.type)}>
                          <div className={styles.entryInner} data-tr-entry>
                            <p className={styles.entryType}>
                              <Glyph type={entry.type} />
                              {type?.singular}
                            </p>
                            <h3 className={styles.entryTitle}>{entry.title}</h3>
                            <p className={styles.entryDate}>{entry.date}</p>
                            <p className={styles.entryOrg}>
                              {entry.organization}
                              {entry.location ? ` · ${entry.location}` : ""}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.recordFoot}>
            <p>
              {OTHER_CERTIFICATE_COUNT > 0
                ? `Plus ${OTHER_CERTIFICATE_COUNT} course completions, workshops and webinars.`
                : "The full journey, role by role."}
            </p>
            <div className={styles.footLinks}>
              {OTHER_CERTIFICATE_COUNT > 0 && (
                <Link className="ui-btn ui-btn--secondary ui-btn--sm" href="/certifications">
                  All Certifications
                </Link>
              )}
              <Link className="ui-btn ui-btn--secondary ui-btn--sm" href="/experience">
                Full Experience
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
