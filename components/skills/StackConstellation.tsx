"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TechIcon from "./TechIcon";
import type { SkillEntry } from "./skillsData";
import styles from "./Skills.module.css";

type Side = { id: string; label: string; items: SkillEntry[] };
type Project = { slug: string; title: string; category: string; image: string };
type Hover = { kind: "tech"; name: string } | { kind: "project"; slug: string } | null;
type Wire = { key: string; d: string; tech: string; slug: string };

type StackConstellationProps = {
  sides: Side[];
  projects: Project[];
  initial?: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * The core stack as a map: technologies on either side, the projects between,
 * and a wire wherever a project's verified stack lists the technology.
 * Hovering or focusing a technology lights its projects and fills the readout;
 * hovering a project lights the technologies behind it. Below 900px the wires
 * are dropped and the same highlights carry the connection.
 */
export default function StackConstellation({ sides, projects, initial }: StackConstellationProps) {
  const all = sides.flatMap((side) => side.items);
  const [selected, setSelected] = useState(initial ?? all[0]?.name);
  const [hover, setHover] = useState<Hover>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [inView, setInView] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());

  const register = (key: string) => (element: HTMLElement | null) => {
    if (element) nodes.current.set(key, element);
    else nodes.current.delete(key);
  };

  const shown = all.find((item) => item.name === (hover?.kind === "tech" ? hover.name : selected)) ?? all[0];

  const litProjects = new Set<string>();
  const litTechs = new Set<string>();
  if (hover?.kind === "project") {
    litProjects.add(hover.slug);
    all.forEach((item) => item.projects.some((p) => p.slug === hover.slug) && litTechs.add(item.name));
  } else if (shown) {
    litTechs.add(shown.name);
    shown.projects.forEach((p) => litProjects.add(p.slug));
  }

  // Wires are measured from the rendered nodes so they follow any layout.
  const measure = useCallback(() => {
    const map = mapRef.current;
    const svg = svgRef.current;
    if (!map || !svg || getComputedStyle(svg).display === "none") {
      setWires([]);
      return;
    }
    const origin = map.getBoundingClientRect();
    const next: Wire[] = [];
    sides.forEach((side, sideIndex) => {
      side.items.forEach((item) => {
        const tech = nodes.current.get(`tech:${item.name}`);
        if (!tech) return;
        const t = tech.getBoundingClientRect();
        item.projects.forEach((project) => {
          const target = nodes.current.get(`project:${project.slug}`);
          if (!target) return;
          const p = target.getBoundingClientRect();
          const fromLeft = sideIndex === 0;
          const x1 = (fromLeft ? t.right : t.left) - origin.left;
          const y1 = t.top + t.height / 2 - origin.top;
          const x2 = (fromLeft ? p.left : p.right) - origin.left;
          const y2 = p.top + p.height / 2 - origin.top;
          const bend = (x2 - x1) * 0.5;
          next.push({
            key: `${item.name}->${project.slug}`,
            d: `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`,
            tech: item.name,
            slug: project.slug,
          });
        });
      });
    });
    setWires(next);
  }, [sides]);

  useLayoutEffect(() => {
    measure();
    const map = mapRef.current;
    if (!map) return;
    const observer = new ResizeObserver(measure);
    observer.observe(map);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => observer.disconnect();
  }, [measure]);

  // Wires draw in once, the first time the map scrolls into view.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(map);
    return () => observer.disconnect();
  }, []);

  if (!shown) return null;

  const shownIndex = all.indexOf(shown) + 1;

  const techButton = (item: SkillEntry) => {
    const isSelected = item.name === selected;
    const lit = litTechs.has(item.name);
    return (
      <li key={item.name}>
        <button
          ref={register(`tech:${item.name}`)}
          type="button"
          className={`${styles.node}${lit ? ` ${styles.nodeLit}` : ""}${isSelected ? ` ${styles.nodeSelected}` : ""}`}
          aria-pressed={isSelected}
          aria-controls="stack-readout"
          onClick={() => setSelected(item.name)}
          onFocus={() => setSelected(item.name)}
          onPointerEnter={() => setHover({ kind: "tech", name: item.name })}
        >
          <span className={styles.nodeIcon}>
            <TechIcon tech={item} size={24} fallbackClassName={styles.iconFallback} />
          </span>
          <span className={styles.nodeName}>{item.name}</span>
          {item.projects.length > 0 && (
            <span className={styles.nodeCount}>
              <span aria-hidden="true">{item.projects.length}</span>
              <span className={styles.srOnly}>
                , used in {item.projects.length} project{item.projects.length === 1 ? "" : "s"}
              </span>
            </span>
          )}
        </button>
      </li>
    );
  };

  return (
    <div
      ref={mapRef}
      className={`${styles.map}${inView ? ` ${styles.mapInView}` : ""}`}
      onPointerLeave={() => setHover(null)}
    >
      <svg ref={svgRef} className={styles.wires} aria-hidden="true">
        {wires.map((wire) => (
          <path
            key={wire.key}
            d={wire.d}
            pathLength={1}
            className={litTechs.has(wire.tech) && litProjects.has(wire.slug) ? styles.wireLit : undefined}
          />
        ))}
      </svg>

      {sides.map((side, sideIndex) => (
        <div
          className={`${styles.side} ${sideIndex === 0 ? styles.sideStart : styles.sideEnd}`}
          key={side.id}
          role="group"
          aria-labelledby={`stack-side-${side.id}`}
        >
          <p id={`stack-side-${side.id}`} className={styles.sideLabel}>
            {side.label}
          </p>
          <ul className={styles.nodeList}>{side.items.map(techButton)}</ul>
        </div>
      ))}

      <div className={styles.hub}>
        <p className={styles.sideLabel}>Projects</p>
        <ol className={styles.hubList}>
          {projects.map((project, index) => (
            <li key={project.slug}>
              <Link
                ref={register(`project:${project.slug}`)}
                href={`/projects/${project.slug}`}
                className={`${styles.hubItem}${litProjects.has(project.slug) ? ` ${styles.hubItemLit}` : ""}`}
                onPointerEnter={() => setHover({ kind: "project", slug: project.slug })}
                onFocus={() => setHover({ kind: "project", slug: project.slug })}
                onBlur={() => setHover(null)}
                data-peek-src={project.image}
              >
                <span className={styles.hubIndex} aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <span className={styles.hubText}>
                  <span className={styles.hubTitle}>{project.title}</span>
                  <span className={styles.hubCategory}>{project.category}</span>
                </span>
                <ArrowUpRight className={styles.hubArrow} size={16} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <aside id="stack-readout" className={styles.readout} aria-live="polite" aria-label="Selected technology">
        <div className={styles.readoutInner} key={shown.name}>
          <div className={styles.readoutHead}>
            <span className={styles.readoutIcon}>
              <TechIcon tech={shown} size={48} fallbackClassName={styles.iconFallback} />
            </span>
            <div>
              <p className={styles.readoutMeta}>
                {shown.groupLabel}
                <span aria-hidden="true">
                  {" "}
                  · {pad(shownIndex)}/{pad(all.length)}
                </span>
              </p>
              <p className={styles.readoutName}>{shown.name}</p>
            </div>
          </div>

          <p className={styles.readoutUsage}>{shown.usage}</p>

          {shown.projects.length > 0 && (
            <div className={styles.readoutUsed}>
              <p className={styles.readoutLabel}>Used in</p>
              <ul className={styles.readoutLinks}>
                {shown.projects.map((project) => (
                  <li key={project.slug}>
                    <Link
                      className={styles.usedLink}
                      href={`/projects/${project.slug}`}
                      data-magnetic
                      data-peek-src={projects.find((entry) => entry.slug === project.slug)?.image}
                    >
                      {project.title}
                      <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
