"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { getLastNavigation } from "@/components/navigation/ScrollManager";
import styles from "./ProjectsShowcase.module.css";

export type ProjectIndexItem = {
  slug: string;
  title: string;
  category: string;
  period?: string;
  image: { src: string; alt: string };
  /** Toolkit entries this project uses — matched against "?tech=" from the skill index. */
  skills: string[];
};

const subscribeNoop = () => () => undefined;
const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Typographic project index. On devices with a fine pointer (and motion
 * allowed) a screenshot of the hovered project follows the cursor; touch and
 * keyboard visitors get the plain list, which is fully usable on its own.
 */
export default function ProjectsIndex({ items }: { items: ProjectIndexItem[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Arriving from the homepage skill index ("/projects?tech=React") highlights
  // the projects built with that tool. Read after hydration; the server renders the plain list.
  const search = useSyncExternalStore(subscribeNoop, () => window.location.search, () => "");
  const requested = new URLSearchParams(search).get("tech");
  const tech = !dismissed && requested && items.some((item) => item.skills.includes(requested)) ? requested : null;
  const matchCount = tech ? items.filter((item) => item.skills.includes(tech)).length : 0;

  useEffect(() => {
    // Back/Forward returns to where the visitor was; only a fresh arrival glides to the index.
    if (!tech || getLastNavigation() === "traverse") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Let the route's scroll-to-top settle, then glide down to the index.
    const timer = window.setTimeout(() => {
      listRef.current?.closest("section")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }, reduced ? 0 : 260);
    return () => window.clearTimeout(timer);
  }, [tech]);

  const clearHighlight = () => {
    setDismissed(true);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
  };

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!enabled || !list || !preview) return;

    const xTo = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3.out" });
    const onMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
    };
    const onEnter = (event: PointerEvent) => {
      gsap.set(preview, { x: event.clientX, y: event.clientY });
    };

    list.addEventListener("pointerenter", onEnter);
    list.addEventListener("pointermove", onMove);
    return () => {
      list.removeEventListener("pointerenter", onEnter);
      list.removeEventListener("pointermove", onMove);
    };
  }, [enabled]);

  return (
    <div className={styles.indexWrap}>
      {tech && (
        <p className={styles.indexFilter} role="status">
          <span>
            Built with <strong>{tech}</strong>
          </span>
          <span className={styles.indexFilterCount}>
            {pad(matchCount)} of {pad(items.length)}
          </span>
          <button type="button" className={styles.indexFilterClear} onClick={clearHighlight}>
            Show all
          </button>
        </p>
      )}
      <ol ref={listRef} className={styles.index} onPointerLeave={() => setActive(null)}>
        {items.map((item, index) => {
          const matched = tech ? item.skills.includes(tech) : false;
          const order = tech ? items.filter((entry, at) => at < index && entry.skills.includes(tech)).length : 0;
          const className = [
            styles.indexLink,
            active === index && styles.indexLinkActive,
            tech && (matched ? styles.indexLinkMatch : styles.indexLinkMuted),
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={item.slug}>
              <Link
                className={className}
                href={`/projects/${item.slug}`}
                style={matched ? ({ "--match-order": order } as CSSProperties) : undefined}
                onPointerEnter={() => setActive(index)}
              >
                <span className={styles.indexNumber}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.indexTitle}>{item.title}</span>
                <span className={styles.indexCategory}>{item.category}</span>
                <span className={styles.indexPeriod}>{item.period ?? ""}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      {enabled && (
        <div
          ref={previewRef}
          className={`${styles.indexPreview}${active !== null ? ` ${styles.indexPreviewShown}` : ""}`}
          aria-hidden="true"
        >
          {items.map((item, index) => (
            <div
              key={item.slug}
              className={`${styles.indexPreviewImage}${active === index ? ` ${styles.indexPreviewImageActive}` : ""}`}
            >
              <Image src={item.image.src} alt="" fill sizes="320px" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
