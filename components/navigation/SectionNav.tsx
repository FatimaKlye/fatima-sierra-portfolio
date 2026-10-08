"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./SectionNav.module.css";

/**
 * Site-wide "on this page" index and scrollspy.
 *
 * Pages opt sections in with plain markup, so server components stay server components:
 *
 *  data-nav-label="Overview"   element becomes an entry (give it a stable id for deep links)
 *  data-nav-intro              the page opening; numbered 00 so the rest match the pages' own 01, 02… kickers
 *
 * Entries are discovered from the live DOM on every route and re-scanned when the
 * DOM changes, so conditional or filtered sections simply appear or drop out.
 * Wide screens get a fixed rail on the right; smaller screens a compact menu button.
 */

type Section = { id: string; label: string; number: string };

const SECTION_SELECTOR = "main [data-nav-label]";
const DESKTOP_QUERY = "(min-width: 1100px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const HEADER_FALLBACK = 72;
const MIN_SECTIONS = 2;
/** Pages that barely scroll don't need an index. */
const MIN_SCROLL_RANGE = 160;
/** Where a section counts as "current": this fraction down the space below the header. */
const ACTIVATION_RATIO = 0.32;
const RING_RADIUS = 15;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const pad = (value: number) => String(value).padStart(2, "0");
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const NO_SECTIONS: Section[] = [];

/** The global `scroll-behavior: smooth` would fight GSAP's per-frame scroll updates (and delay instant jumps). */
function setCssSmoothScroll(enabled: boolean) {
  document.documentElement.style.scrollBehavior = enabled ? "" : "auto";
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

function headerOffset(): number {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  return header ? header.getBoundingClientRect().bottom : HEADER_FALLBACK;
}

function maxScroll(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/** Scroll position that puts the element's top edge right under the fixed header. */
function scrollTargetFor(element: HTMLElement): number {
  const y = element.getBoundingClientRect().top + window.scrollY - headerOffset();
  return Math.round(clamp(y, 0, maxScroll()));
}

/** Labelled, rendered elements in document order (nested markers defer to their outermost ancestor). */
function collectSections(): { elements: HTMLElement[]; sections: Section[] } {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)).filter(
    (element) =>
      element.dataset.navLabel?.trim() &&
      element.getClientRects().length > 0 &&
      !element.parentElement?.closest("[data-nav-label]")
  );

  const startsAtZero = elements[0]?.hasAttribute("data-nav-intro") ?? false;
  const sections = elements.map((element, index) => {
    const label = element.dataset.navLabel!.trim();
    if (!element.id) {
      const base = slugify(label);
      let id = base;
      for (let suffix = 2; document.getElementById(id); suffix += 1) id = `${base}-${suffix}`;
      element.id = id;
    }
    return { id: element.id, label, number: pad(startsAtZero ? index : index + 1) };
  });

  return { elements, sections };
}

/** Arrow/Home/End roving between the links of one list. */
function handleListKeys(event: ReactKeyboardEvent<HTMLOListElement>) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

  const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
  const current = links.indexOf(document.activeElement as HTMLAnchorElement);
  if (current === -1) return;

  event.preventDefault();
  const last = links.length - 1;
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? last
        : event.key === "ArrowDown"
          ? Math.min(last, current + 1)
          : Math.max(0, current - 1);
  links[next]?.focus();
}

export default function SectionNav() {
  const pathname = usePathname();
  const panelId = useId();

  // Discovered sections and the open menu belong to the route they were found on,
  // so a navigation resets both without an effect having to clear them.
  const [discovered, setDiscovered] = useState<{ path: string; list: Section[] }>({ path: "", list: [] });
  const sections = discovered.path === pathname ? discovered.list : NO_SECTIONS;
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (value: boolean) => setOpenPath(value ? pathname : null);

  const [active, setActive] = useState(0);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [scrollable, setScrollable] = useState(false);
  const [obscured, setObscured] = useState(false);
  const [compactShown, setCompactShown] = useState(false);

  const elementsRef = useRef<HTMLElement[]>([]);
  const signatureRef = useRef("");
  const activeRef = useRef(0);
  const isDesktopRef = useRef<boolean | null>(null);
  const openRef = useRef(false);
  /** Section index pinned by a click until the visitor scrolls on their own. */
  const lockRef = useRef<number | null>(null);
  const lockYRef = useRef<number | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const userInteractedRef = useRef(false);
  const lastYRef = useRef(0);
  const directionRef = useRef<"up" | "down" | "idle">("idle");
  const idleTimerRef = useRef<number | undefined>(undefined);
  const updateRef = useRef<() => void>(() => undefined);

  const capsuleRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const sectionFillRef = useRef<HTMLSpanElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef<HTMLElement>(null);
  const expandedRef = useRef({ hover: false, focus: false, shown: false });
  const thumbPlacedRef = useRef(false);
  const flashReadyRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  /* Breakpoint ------------------------------------------------------------ */
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const apply = () => {
      isDesktopRef.current = query.matches;
      setIsDesktop(query.matches);
      if (query.matches) setOpenPath(null);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  /* Scrollspy: one ScrollTrigger drives active section, progress and visibility. */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const update = () => {
      const elements = elementsRef.current;
      const scrollY = window.scrollY;
      const viewport = window.innerHeight;
      const max = maxScroll();

      setScrollable(max >= MIN_SCROLL_RANGE);
      if (!elements.length) return;

      // A click pins its section; any scroll the visitor makes afterwards releases it.
      if (lockRef.current !== null && lockYRef.current !== null && Math.abs(scrollY - lockYRef.current) > 4) {
        lockRef.current = null;
        lockYRef.current = null;
      }

      const offset = headerOffset();
      const line = offset + (viewport - offset) * ACTIVATION_RATIO;
      const tops = elements.map((element) => element.getBoundingClientRect().top);
      const atBottom = max > 0 && scrollY >= max - 2;

      let index = 0;
      tops.forEach((top, i) => {
        if (top <= line) index = i;
      });
      if (atBottom) index = elements.length - 1;
      if (lockRef.current !== null && lockRef.current < elements.length) index = lockRef.current;

      // Progress through the current section: from its top reaching the line to the next one's.
      const start = scrollY + tops[index] - line;
      const end = index < elements.length - 1 ? scrollY + tops[index + 1] - line : max;
      const sectionProgress = atBottom || end <= start ? 1 : clamp((scrollY - start) / (end - start), 0, 1);
      const pageProgress = max > 0 ? clamp(scrollY / max, 0, 1) : 0;

      if (index !== activeRef.current) {
        activeRef.current = index;
        setActive(index);
      }
      if (sectionFillRef.current) gsap.set(sectionFillRef.current, { scaleY: sectionProgress });
      if (ringRef.current) gsap.set(ringRef.current, { strokeDashoffset: RING_LENGTH * (1 - pageProgress) });

      // Step aside for the footer instead of sitting on top of it.
      const footerTop = document.querySelector("body > footer")?.getBoundingClientRect().top ?? Infinity;
      if (isDesktopRef.current) {
        const railBottom = capsuleRef.current?.getBoundingClientRect().bottom ?? viewport / 2;
        setObscured(footerTop < railBottom + 24);
      } else {
        setObscured(footerTop < viewport - 8);
      }

      // Compact button: out of the way while reading downwards, back on scroll up or a pause.
      const delta = scrollY - lastYRef.current;
      lastYRef.current = scrollY;
      if (delta > 6) directionRef.current = "down";
      else if (delta < -6) directionRef.current = "up";
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        directionRef.current = "idle";
        setCompactShown(window.scrollY > window.innerHeight * 0.35);
      }, 900);
      setCompactShown(scrollY > viewport * 0.35 && directionRef.current !== "down");
    };

    updateRef.current = update;

    const trigger = ScrollTrigger.create({ start: 0, end: "max", onUpdate: update, onRefresh: update });
    window.addEventListener("resize", update);

    const markInteracted = () => {
      userInteractedRef.current = true;
    };
    const interactionEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    interactionEvents.forEach((type) => window.addEventListener(type, markInteracted, { passive: true }));

    return () => {
      trigger.kill();
      window.removeEventListener("resize", update);
      interactionEvents.forEach((type) => window.removeEventListener(type, markInteracted));
      window.clearTimeout(idleTimerRef.current);
      tweenRef.current?.kill();
      setCssSmoothScroll(true);
    };
  }, []);

  /* Smooth scroll to a section, then hand focus to it for keyboard and screen-reader users. */
  const scrollToSection = (index: number, options: { focus: boolean; instant?: boolean }) => {
    const element = elementsRef.current[index];
    if (!element) return;

    tweenRef.current?.kill();
    lockRef.current = index;
    lockYRef.current = null;
    activeRef.current = index;
    setActive(index);

    const finish = () => {
      tweenRef.current = null;
      // Lazy media may have shifted the layout while travelling; land exactly.
      const corrected = scrollTargetFor(element);
      if (Math.abs(window.scrollY - corrected) > 2) window.scrollTo({ top: corrected, behavior: "instant" });
      setCssSmoothScroll(true);
      lockYRef.current = window.scrollY;
      lastYRef.current = window.scrollY;
      if (options.focus) {
        if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "-1");
        element.focus({ preventScroll: true });
      }
      updateRef.current();
    };

    const target = scrollTargetFor(element);
    setCssSmoothScroll(false);

    if (options.instant || prefersReducedMotion()) {
      window.scrollTo({ top: target, behavior: "instant" });
      finish();
      return;
    }

    const distance = Math.abs(target - window.scrollY);
    tweenRef.current = gsap.to(window, {
      duration: clamp(0.55 + distance / 5000, 0.6, 1.35),
      ease: "power3.inOut",
      scrollTo: {
        y: target,
        autoKill: true,
        onAutoKill: () => {
          // The visitor took over mid-flight: follow their scroll again.
          tweenRef.current = null;
          setCssSmoothScroll(true);
          lockRef.current = null;
          lockYRef.current = null;
          updateRef.current();
        },
      },
      onComplete: finish,
    });
  };

  const handleLinkClick = (event: ReactMouseEvent<HTMLAnchorElement>, index: number) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    const id = elementsRef.current[index]?.id;
    // A history entry per jump keeps the back button meaningful; skip duplicates.
    if (id && window.location.hash !== `#${id}`) window.history.pushState(null, "", `#${id}`);

    if (openRef.current) setOpen(false);
    scrollToSection(index, { focus: true });
  };

  /* Discovery: per route, kept current as the page's DOM changes. */
  useEffect(() => {
    let frame = 0;
    let cancelled = false;

    tweenRef.current?.kill();
    setCssSmoothScroll(true);
    lockRef.current = null;
    lockYRef.current = null;
    signatureRef.current = "";
    elementsRef.current = [];
    thumbPlacedRef.current = false;
    flashReadyRef.current = false;
    userInteractedRef.current = false;

    const scan = () => {
      frame = 0;
      if (cancelled) return;
      const { elements, sections: found } = collectSections();
      elementsRef.current = elements;
      const signature = found.map((section) => `${section.id}:${section.label}`).join("|");
      if (signature !== signatureRef.current) {
        signatureRef.current = signature;
        setDiscovered({ path: pathname, list: found });
      }
      updateRef.current();
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(scan);
    };

    const hashIndex = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      return id ? elementsRef.current.findIndex((element) => element.id === id) : -1;
    };
    // Deep links: land on the section once the page has settled (fonts, images), unless the visitor already moved.
    const settleOnHash = () => {
      if (cancelled || userInteractedRef.current) return;
      const index = hashIndex();
      if (index !== -1) scrollToSection(index, { focus: false, instant: true });
    };

    schedule();
    // Queued after the scan, so the hash is resolved against the fresh section list.
    const hashFrame = window.requestAnimationFrame(settleOnHash);
    if (document.readyState !== "complete") window.addEventListener("load", settleOnHash, { once: true });
    document.fonts?.ready.then(settleOnHash).catch(() => undefined);

    // Back/forward between in-page entries: honour the hash when the browser won't restore scroll itself.
    const onPopState = () => {
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        const index = hashIndex();
        if (window.history.scrollRestoration === "manual" && index !== -1) {
          scrollToSection(index, { focus: false });
        } else {
          lockRef.current = null;
          lockYRef.current = null;
          updateRef.current();
        }
      });
    };
    window.addEventListener("popstate", onPopState);

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(hashFrame);
      window.removeEventListener("load", settleOnHash);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [pathname]);

  const visible = sections.length >= MIN_SECTIONS && scrollable && isDesktop !== null;
  const current = sections[active] ?? sections[0];

  /* Desktop: entrance, sliding thumb, and the active-label flash. ----------- */
  useEffect(() => {
    const capsule = capsuleRef.current;
    if (!visible || !isDesktop || !capsule) return;

    expandedRef.current = { hover: false, focus: false, shown: false };
    gsap.set(capsule.querySelectorAll("[data-label]"), { width: 0, opacity: 0, x: 8 });
    if (prefersReducedMotion()) return;

    const tween = gsap.fromTo(
      capsule.querySelectorAll("li"),
      { opacity: 0, x: 14 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", stagger: 0.035, delay: 0.15, clearProps: "opacity,transform" }
    );
    return () => {
      tween.kill();
    };
  }, [visible, isDesktop, sections]);

  useEffect(() => {
    if (!visible || !isDesktop) {
      thumbPlacedRef.current = false;
      return;
    }
    const thumb = thumbRef.current;
    const row = capsuleRef.current?.querySelectorAll<HTMLElement>("li")[active];
    if (!thumb || !row) return;

    const placement = { y: row.offsetTop, height: row.offsetHeight };
    if (!thumbPlacedRef.current || prefersReducedMotion()) {
      gsap.set(thumb, placement);
      thumbPlacedRef.current = true;
    } else {
      gsap.to(thumb, { ...placement, duration: 0.6, ease: "expo.out", overwrite: true });
    }
  }, [active, visible, isDesktop, sections]);

  useEffect(() => {
    const chip = chipRef.current;
    const row = capsuleRef.current?.querySelectorAll<HTMLElement>("li")[active];
    if (!visible || !isDesktop || !chip || !row) return;

    // No flash for the section the page opens on; only when the position changes.
    if (!flashReadyRef.current) {
      flashReadyRef.current = true;
      gsap.set(chip, { autoAlpha: 0 });
      return;
    }
    if (expandedRef.current.shown) return;

    const reduce = prefersReducedMotion();
    const timeline = gsap
      .timeline()
      .set(chip, { y: row.offsetTop + row.offsetHeight / 2, yPercent: -50 })
      .fromTo(chip, { autoAlpha: 0, x: reduce ? 0 : 10 }, { autoAlpha: 1, x: 0, duration: reduce ? 0 : 0.45, ease: "power3.out" })
      .to(chip, { autoAlpha: 0, x: reduce ? 0 : 6, duration: reduce ? 0 : 0.4, ease: "power2.in" }, "+=1.4");
    return () => {
      timeline.kill();
    };
  }, [active, visible, isDesktop]);

  const setExpanded = (key: "hover" | "focus", value: boolean) => {
    const state = expandedRef.current;
    state[key] = value;
    const shouldShow = state.hover || state.focus;
    if (shouldShow === state.shown || !capsuleRef.current) return;
    state.shown = shouldShow;

    const reduce = prefersReducedMotion();
    if (shouldShow && chipRef.current) gsap.to(chipRef.current, { autoAlpha: 0, duration: 0.15, overwrite: true });
    gsap.to(capsuleRef.current.querySelectorAll("[data-label]"), {
      width: shouldShow ? "auto" : 0,
      opacity: shouldShow ? 1 : 0,
      x: shouldShow ? 0 : 8,
      duration: reduce ? 0 : shouldShow ? 0.5 : 0.3,
      ease: shouldShow ? "expo.out" : "power2.inOut",
      stagger: reduce ? 0 : { each: 0.022, from: shouldShow ? "start" : "end" },
      overwrite: true,
    });
  };

  /* Compact menu: open/close motion, Escape and outside clicks. ------------- */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || isDesktop) return;
    const reduce = prefersReducedMotion();

    if (!open) {
      gsap.to(panel, {
        autoAlpha: 0,
        y: reduce ? 0 : 10,
        scale: reduce ? 1 : 0.98,
        duration: reduce ? 0 : 0.22,
        ease: "power2.in",
        overwrite: true,
      });
      return;
    }

    // Visible from the first frame (only transparent), so focus can move into the panel right away.
    gsap.fromTo(
      panel,
      { opacity: 0, visibility: "visible", y: reduce ? 0 : 14, scale: reduce ? 1 : 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: reduce ? 0 : 0.45, ease: "expo.out", overwrite: true }
    );
    if (!reduce) {
      gsap.fromTo(
        panel.querySelectorAll("li"),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.03, delay: 0.05, clearProps: "opacity,transform" }
      );
    }
    panel.querySelector<HTMLAnchorElement>('[aria-current="location"]')?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenPath(null);
      triggerRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!compactRef.current?.contains(event.target as Node)) setOpenPath(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, isDesktop]);

  if (!visible || !current) return null;

  const renderLinks = (variant: "rail" | "panel") =>
    sections.map((section, index) => {
      const isActive = index === active;
      return (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className={`${variant === "rail" ? styles.railLink : styles.panelLink}${isActive ? ` ${styles.isActive}` : ""}`}
            aria-current={isActive ? "location" : undefined}
            onClick={(event) => handleLinkClick(event, index)}
          >
            {variant === "rail" ? (
              <>
                <span className={styles.railLabel} data-label>
                  {section.label}
                </span>
                <span className={styles.railNumber} aria-hidden="true">
                  {section.number}
                </span>
              </>
            ) : (
              <>
                <span className={styles.panelNumber} aria-hidden="true">
                  {section.number}
                </span>
                <span className={styles.panelLabel}>{section.label}</span>
              </>
            )}
          </a>
        </li>
      );
    });

  if (isDesktop) {
    return (
      <nav className={`${styles.rail}${obscured ? ` ${styles.isObscured}` : ""}`} aria-label="On this page">
        <span ref={chipRef} className={styles.chip} aria-hidden="true">
          {current.label}
        </span>
        <div
          ref={capsuleRef}
          className={styles.capsule}
          onPointerEnter={(event) => event.pointerType === "mouse" && setExpanded("hover", true)}
          onPointerLeave={(event) => event.pointerType === "mouse" && setExpanded("hover", false)}
          onFocus={() => setExpanded("focus", true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setExpanded("focus", false);
          }}
        >
          <span ref={thumbRef} className={styles.thumb} aria-hidden="true">
            <span ref={sectionFillRef} className={styles.thumbFill} />
          </span>
          <ol className={styles.railList} onKeyDown={handleListKeys}>
            {renderLinks("rail")}
          </ol>
        </div>
      </nav>
    );
  }

  const shown = open || (compactShown && !obscured);

  return (
    <nav ref={compactRef} className={`${styles.compact}${shown ? ` ${styles.isShown}` : ""}`} aria-label="On this page">
      <div ref={panelRef} id={panelId} className={styles.panel}>
        <p className={styles.panelHead}>
          <span>On this page</span>
          <span aria-hidden="true">
            {current.number} / {sections[sections.length - 1]?.number}
          </span>
        </p>
        <ol className={styles.panelList} onKeyDown={handleListKeys}>
          {renderLinks("panel")}
        </ol>
      </div>

      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Sections on this page. Current: ${current.label}`}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.ring} aria-hidden="true">
          <svg viewBox="0 0 36 36">
            <circle className={styles.ringTrack} cx="18" cy="18" r={RING_RADIUS} />
            <circle
              ref={ringRef}
              className={styles.ringFill}
              cx="18"
              cy="18"
              r={RING_RADIUS}
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH}
            />
          </svg>
          <span className={styles.ringNumber}>{current.number}</span>
        </span>
        <span className={styles.triggerLabel} aria-hidden="true">
          {current.label}
        </span>
      </button>
    </nav>
  );
}
