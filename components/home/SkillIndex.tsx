"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { observeReveals } from "@/components/motion/reveal";
import TechIcon from "@/components/skills/TechIcon";
import type { SkillEntry } from "@/components/skills/skillsData";
import styles from "./SkillIndex.module.css";

type SkillIndexProps = {
  groups: { id: string; label: string; items: SkillEntry[] }[];
};

/** How the spotlight was opened — decides when it closes and which hint it shows. */
type Mode = "pointer" | "touch" | "keyboard";
/** A fresh object on every show() so the layout effect re-places the panel. */
type Spot = { name: string; mode: Mode };

const pad = (value: number) => String(value).padStart(2, "0");
const plural = (count: number) => `${count} project${count === 1 ? "" : "s"}`;
/** The projects index reads this and highlights the projects built with the tool. */
const techHref = (name: string) => `/projects?tech=${encodeURIComponent(name)}`;
/** Id of the hidden usage note each tool is described by. */
const noteId = (name: string) => `skill-note-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const HIDE_DELAY = 240; // ms — long enough to travel from a tool into the spotlight
const GAP = 10; // px between a tool and its spotlight
const EDGE = 8; // px kept clear of the viewport edge and the fixed header
const HINTS: Record<Mode, string> = {
  pointer: "Click to see them in Projects",
  touch: "Tap again to see them in Projects",
  keyboard: "Press Enter to see them in Projects",
};

const isFocusVisible = (element: Element) => {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
};

/**
 * Direction-aware row state. A row is active while hovered or while it holds
 * the spotlighted tool; the pink fill grows from the edge the pointer crossed,
 * and the rule under the row sweeps in from the left and out to the right.
 * Origins only flip once a tween has fully settled, so nothing ever jumps.
 */
function syncRow(row: HTMLElement, reduced: boolean) {
  const on = row.hasAttribute("data-hover") || row.hasAttribute("data-spot");
  if (on === row.hasAttribute("data-active")) return;
  row.toggleAttribute("data-active", on);

  const edge = row.dataset.edge === "bottom" ? "bottom" : "top";
  const fill = Number(gsap.getProperty(row, "--fill")) || 0;
  const line = parseFloat(String(gsap.getProperty(row, "--line"))) || 0;
  const speed = reduced ? 0 : 1;

  if (on) {
    if (fill <= 0.01) gsap.set(row, { "--fill-origin": edge });
    if (line <= 1) gsap.set(row, { "--line-origin": "left" });
  } else {
    if (fill >= 0.99) gsap.set(row, { "--fill-origin": edge });
    if (line >= 99) gsap.set(row, { "--line-origin": "right" });
  }

  gsap.to(row, { "--fill": on ? 1 : 0, duration: 0.55 * speed, ease: "power3.out", overwrite: "auto" });
  gsap.to(row, { "--line": on ? "100%" : "0%", duration: 0.7 * speed, ease: "power3.inOut", overwrite: "auto" });
}

/**
 * Homepage skill index: one border-separated row per area. Hovering, focusing
 * or tapping a tool opens a small spotlight listing the projects on this site
 * that actually use it (from the verified project data); tools with projects
 * link to the Projects page, which highlights them on arrival.
 */
export default function SkillIndex({ groups }: SkillIndexProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const spotRowRef = useRef<HTMLElement | null>(null);
  const modeRef = useRef<Mode>("pointer");
  const shownRef = useRef(false);
  const lastNameRef = useRef<string | null>(null);
  const reducedRef = useRef(false);
  const navigatingRef = useRef(false);
  const lastPointerRef = useRef("");
  const hideTimer = useRef<number | undefined>(undefined);
  const navTimer = useRef<number | undefined>(undefined);
  const pushTimer = useRef<number | undefined>(undefined);

  const [spot, setSpot] = useState<Spot | null>(null);
  const [navigating, setNavigating] = useState(false);

  const current = spot ? groups.flatMap((group) => group.items).find((item) => item.name === spot.name) : undefined;

  const liftIcon = useCallback((tech: HTMLElement | null, on: boolean) => {
    const icon = tech?.querySelector("[data-icon]");
    if (!icon || reducedRef.current) return;
    gsap.to(
      icon,
      on
        ? { y: -3, scale: 1.15, duration: 0.7, ease: "elastic.out(1, 0.45)", overwrite: "auto" }
        : { y: 0, scale: 1, duration: 0.45, ease: "power3.out", overwrite: "auto" }
    );
  }, []);

  const setSpotRow = useCallback((row: HTMLElement | null) => {
    const previous = spotRowRef.current;
    if (previous === row) return;
    spotRowRef.current = row;
    if (previous) {
      previous.removeAttribute("data-spot");
      syncRow(previous, reducedRef.current);
    }
    if (row) {
      row.setAttribute("data-spot", "");
      syncRow(row, reducedRef.current);
    }
  }, []);

  const show = useCallback(
    (item: SkillEntry, anchor: HTMLElement, mode: Mode) => {
      window.clearTimeout(hideTimer.current);
      const previous = anchorRef.current;
      if (previous !== anchor) {
        previous?.removeAttribute("data-current");
        liftIcon(previous, false);
        liftIcon(anchor, true);
      }
      anchor.setAttribute("data-current", "");
      anchorRef.current = anchor;
      modeRef.current = mode;
      setSpotRow(anchor.closest<HTMLElement>("[data-row]"));
      setSpot({ name: item.name, mode });
    },
    [liftIcon, setSpotRow]
  );

  const hide = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    if (navigatingRef.current) return;
    const anchor = anchorRef.current;
    anchor?.removeAttribute("data-current");
    liftIcon(anchor, false);
    anchorRef.current = null;
    setSpotRow(null);

    const panel = panelRef.current;
    if (!panel || !shownRef.current) return;
    gsap.to(panel, {
      autoAlpha: 0,
      duration: reducedRef.current ? 0 : 0.2,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        shownRef.current = false;
      },
    });
  }, [liftIcon, setSpotRow]);

  const scheduleHide = useCallback(
    (delay: number) => {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(hide, delay);
    },
    [hide]
  );

  // Place the spotlight under its tool — or above it when the viewport runs out
  // below and there is room under the fixed header. Reveal from the tool's side
  // the first time, glide between tools afterwards, cross-fade changed content.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const anchor = anchorRef.current;
    if (!spot || !root || !panel || !anchor) return;

    const rootBox = root.getBoundingClientRect();
    const anchorBox = anchor.getBoundingClientRect();
    const maxX = Math.max(rootBox.width - panel.offsetWidth, 0);
    const x = Math.min(Math.max(anchorBox.left - rootBox.left, 0), maxX);
    const height = panel.offsetHeight;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0;
    const fitsBelow = anchorBox.bottom + GAP + height <= window.innerHeight - EDGE;
    const fitsAbove = anchorBox.top - GAP - height >= header + EDGE;
    const above = !fitsBelow && fitsAbove;
    panel.dataset.placement = above ? "top" : "bottom";
    const y = above ? anchorBox.top - rootBox.top - GAP - height : anchorBox.bottom - rootBox.top + GAP;
    const reduced = reducedRef.current;
    const changed = lastNameRef.current !== spot.name;
    lastNameRef.current = spot.name;
    const content = innerRef.current ? Array.from(innerRef.current.children) : [];

    if (!shownRef.current) {
      shownRef.current = true;
      gsap.killTweensOf(panel);
      gsap.set(panel, { x, y, autoAlpha: 1 });
      if (reduced) return;
      gsap.fromTo(
        panel,
        { y: above ? y - 8 : y + 8, clipPath: above ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
        { y, clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power4.out", clearProps: "clipPath" }
      );
      if (ruleRef.current) {
        gsap.fromTo(ruleRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut" });
      }
      gsap.fromTo(
        content,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, delay: 0.08, stagger: 0.05, ease: "power3.out", clearProps: "transform,opacity" }
      );
      return;
    }

    gsap.to(panel, { x, y, autoAlpha: 1, duration: reduced ? 0 : 0.45, ease: "power3.out", overwrite: "auto" });
    if (changed && !reduced) {
      gsap.fromTo(
        content,
        { y: 4, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.03, ease: "power2.out", clearProps: "transform,opacity" }
      );
    }
  }, [spot]);

  // Scroll entrance, magnetic tools and the reduced-motion flag.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => {
      reducedRef.current = reducedQuery.matches;
    };
    syncReduced();
    reducedQuery.addEventListener("change", syncReduced);

    const all = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
    const mm = gsap.matchMedia();

    // Rows rise in (and their dividers draw) as the index enters view. This runs on the shared
    // IntersectionObserver reveals rather than a ScrollTrigger: content must never wait on a
    // recorded trigger position (stale after late layout shifts, iOS toolbar resizes) to appear.
    const stopReveals = observeReveals(root);

    // Magnetic pull toward the pointer — a few pixels at most.
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const cleanups = all("[data-tech]").map((tech) => {
        const xTo = gsap.quickTo(tech, "x", { duration: 0.6, ease: "power3.out" });
        const yTo = gsap.quickTo(tech, "y", { duration: 0.6, ease: "power3.out" });
        let box: DOMRect | null = null;

        const onEnter = () => {
          box = tech.getBoundingClientRect();
        };
        const onMove = (event: globalThis.PointerEvent) => {
          if (!box) box = tech.getBoundingClientRect();
          const dx = event.clientX - (box.left + box.width / 2);
          const dy = event.clientY - (box.top + box.height / 2);
          xTo(gsap.utils.clamp(-6, 6, dx * 0.22));
          yTo(gsap.utils.clamp(-4, 4, dy * 0.3));
        };
        const onLeave = () => {
          box = null;
          xTo(0);
          yTo(0);
        };

        tech.addEventListener("pointerenter", onEnter);
        tech.addEventListener("pointermove", onMove);
        tech.addEventListener("pointerleave", onLeave);
        return () => {
          tech.removeEventListener("pointerenter", onEnter);
          tech.removeEventListener("pointermove", onMove);
          tech.removeEventListener("pointerleave", onLeave);
        };
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    });

    return () => {
      reducedQuery.removeEventListener("change", syncReduced);
      stopReveals();
      mm.revert();
    };
  }, []);

  // Close a pinned spotlight on an outside tap, and any spotlight on resize.
  useEffect(() => {
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!anchorRef.current || modeRef.current === "pointer") return;
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current.contains(target)) return;
      hide();
    };
    const onResize = () => {
      if (anchorRef.current) hide();
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(navTimer.current);
      window.clearTimeout(pushTimer.current);
    };
  }, [hide]);

  /** A short hand-off before leaving: the other rows recede, the chosen tool pops. */
  const navigate = (item: SkillEntry, tech: HTMLElement) => {
    if (navigatingRef.current) return;
    const href = techHref(item.name);
    show(item, tech, modeRef.current);
    navigatingRef.current = true;
    setNavigating(true);

    const root = rootRef.current;
    if (reducedRef.current || !root) {
      router.push(href);
      return;
    }

    const row = tech.closest("[data-row]");
    const others = Array.from(root.querySelectorAll<HTMLElement>("[data-row]")).filter((entry) => entry !== row);
    gsap.to(others, { opacity: 0.35, duration: 0.4, ease: "power2.out" });
    gsap.to(tech.querySelector("[data-icon]"), { y: -4, scale: 1.3, duration: 0.4, ease: "back.out(2.5)", overwrite: "auto" });
    // Wall-clock timer, not the tween's onComplete: frame-throttled tabs must still navigate on time.
    pushTimer.current = window.setTimeout(() => router.push(href), 380);

    // If the route never changes (offline, aborted), give the section back.
    // Generous, so a slow-but-working navigation is never interrupted visually.
    navTimer.current = window.setTimeout(() => {
      navigatingRef.current = false;
      setNavigating(false);
      gsap.to(others, { opacity: 1, duration: 0.3, clearProps: "opacity" });
    }, 10000);
  };

  const onRowEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const row = event.currentTarget;
    const box = row.getBoundingClientRect();
    row.dataset.edge = event.clientY < box.top + box.height / 2 ? "top" : "bottom";
    row.setAttribute("data-hover", "");
    syncRow(row, reducedRef.current);
  };

  const onRowLeave = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const row = event.currentTarget;
    const box = row.getBoundingClientRect();
    row.dataset.edge = event.clientY < box.top + box.height / 2 ? "top" : "bottom";
    row.removeAttribute("data-hover");
    syncRow(row, reducedRef.current);
  };

  const techHandlers = (item: SkillEntry) => ({
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      lastPointerRef.current = event.pointerType;
    },
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "touch") show(item, event.currentTarget, "pointer");
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "touch" && modeRef.current === "pointer") scheduleHide(HIDE_DELAY);
    },
  });

  /** Keyboard focus opens the spotlight; leaving the tool closes it. */
  const focusHandlers = (item: SkillEntry) => ({
    onKeyDown: () => {
      lastPointerRef.current = "";
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (isFocusVisible(event.currentTarget)) show(item, event.currentTarget, "keyboard");
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (modeRef.current === "keyboard" && anchorRef.current === event.currentTarget) scheduleHide(120);
    },
  });

  const onLinkClick = (item: SkillEntry) => (event: MouseEvent<HTMLAnchorElement>) => {
    const pointer = lastPointerRef.current;
    lastPointerRef.current = "";
    // Let new-tab and new-window clicks behave natively.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const tech = event.currentTarget;
    const isOpen = shownRef.current && anchorRef.current === tech;
    // Touch has no hover: the first tap opens the spotlight, the second follows the link.
    if (pointer === "touch" && !isOpen) {
      show(item, tech, "touch");
      return;
    }
    navigate(item, tech);
  };

  /** Tools without projects: tap or Enter toggles the spotlight; a mouse already opened it on hover. */
  const onStaticClick = (item: SkillEntry) => (event: MouseEvent<HTMLButtonElement>) => {
    const pointer = lastPointerRef.current;
    lastPointerRef.current = "";
    if (pointer && pointer !== "touch") return;
    const tech = event.currentTarget;
    if (shownRef.current && anchorRef.current === tech) hide();
    else show(item, tech, pointer === "touch" ? "touch" : "keyboard");
  };

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onKeyDown={(event) => {
        if (event.key === "Escape" && anchorRef.current) hide();
      }}
    >
      <dl className={styles.groups} data-stagger>
        {groups.map((group, groupIndex) => (
          <div
            className={styles.row}
            key={group.id}
            data-row
            onPointerEnter={onRowEnter}
            onPointerLeave={onRowLeave}
          >
            <dt className={styles.label}>
              <span className={styles.labelIndex} aria-hidden="true">{pad(groupIndex + 1)}</span>
              <span className={styles.labelText}>{group.label}</span>
            </dt>
            <dd className={styles.tools}>
              <ul className={styles.list}>
                {group.items.map((item) => {
                  const count = item.projects.length;
                  const inner = (
                    <>
                      <span className={styles.techIcon} data-icon>
                        <TechIcon tech={item} size={20} fallbackClassName={styles.fallback} />
                      </span>
                      <span className={styles.techName}>{item.name}</span>
                      {count > 0 && <span className={styles.count} aria-hidden="true">{count}</span>}
                    </>
                  );

                  return (
                    <li key={item.name}>
                      {count > 0 ? (
                        <Link
                          className={styles.tech}
                          href={techHref(item.name)}
                          data-tech
                          aria-describedby={noteId(item.name)}
                          {...techHandlers(item)}
                          {...focusHandlers(item)}
                          onClick={onLinkClick(item)}
                        >
                          {inner}
                          <span className="sr-only">
                            , used in {plural(count)}: {item.projects.map((project) => project.title).join(", ")}
                          </span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className={`${styles.tech} ${styles.techStatic}`}
                          data-tech
                          aria-describedby={noteId(item.name)}
                          {...techHandlers(item)}
                          {...focusHandlers(item)}
                          onClick={onStaticClick(item)}
                        >
                          {inner}
                        </button>
                      )}
                      <span id={noteId(item.name)} hidden>
                        {item.usage}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </dd>
          </div>
        ))}
      </dl>

      {/* Visual companion to the rows; the same facts are in each tool's accessible name. */}
      <div
        ref={panelRef}
        className={styles.spot}
        aria-hidden="true"
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") window.clearTimeout(hideTimer.current);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch" && modeRef.current === "pointer") scheduleHide(HIDE_DELAY);
        }}
      >
        <span ref={ruleRef} className={styles.spotRule} />
        {current && spot && (
          <div ref={innerRef} className={styles.spotInner}>
            <p className={styles.spotKicker}>{current.groupLabel}</p>
            <p className={styles.spotNote}>{current.usage}</p>
            {current.projects.length > 0 && (
              <>
                <p className={styles.spotLabel}>
                  <span>Used in</span>
                  <span>{pad(current.projects.length)}</span>
                </p>
                <ul className={styles.spotList}>
                  {current.projects.map((project) => (
                    <li key={project.slug}>
                      <Link
                        className={styles.spotLink}
                        href={`/projects/${project.slug}`}
                        tabIndex={-1}
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {project.title}
                        <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className={styles.spotHint}>
                  {navigating ? "Opening Projects…" : HINTS[spot.mode]}
                  <ArrowRight size={12} strokeWidth={2} aria-hidden="true" />
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
