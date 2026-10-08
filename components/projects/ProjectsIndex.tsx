"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import styles from "./ProjectsShowcase.module.css";

export type ProjectIndexItem = {
  slug: string;
  title: string;
  category: string;
  period?: string;
  image: { src: string; alt: string };
};

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
      <ol ref={listRef} className={styles.index} onPointerLeave={() => setActive(null)}>
        {items.map((item, index) => (
          <li key={item.slug}>
            <Link
              className={`${styles.indexLink}${active === index ? ` ${styles.indexLinkActive}` : ""}`}
              href={`/projects/${item.slug}`}
              onPointerEnter={() => setActive(index)}
            >
              <span className={styles.indexNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.indexTitle}>{item.title}</span>
              <span className={styles.indexCategory}>{item.category}</span>
              <span className={styles.indexPeriod}>{item.period ?? ""}</span>
              <span className={styles.indexArrow} aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
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
