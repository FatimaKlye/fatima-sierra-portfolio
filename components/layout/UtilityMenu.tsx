"use client";

import gsap from "gsap";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { ArrowUpRight, Moon, Pause, Play, Sun } from "lucide-react";
import { JUKEBOX_PANEL_ID, findTrack, minimizeJukebox, openJukebox, preloadMusic, toggleMusic, useMusic } from "@/lib/music";
import { getTheme, setTheme, useTheme, watchThemeSources } from "@/lib/theme";
import styles from "./UtilityMenu.module.css";

// The game (and its word list) only loads once someone shows interest — the navbar stays light.
const WordBreakModal = dynamic(() => import("@/components/wordbreak/WordBreakModal"), { ssr: false });

const preloadWordBreak = () => {
  import("@/components/wordbreak/WordBreakModal").catch(() => {});
  import("@/components/wordbreak/words").catch(() => {});
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The navbar's one utility control: a quiet "···" that opens a small card with the daily word
 * game, the music player and the light/dark switch. It owns no music or theme state of its own —
 * it reads the shared stores, so the homepage vinyl and the jukebox stay in step with it.
 */
export default function UtilityMenu() {
  const music = useMusic();
  const isDark = useTheme() === "dark";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusFirst = useRef(false);
  const panelId = useId();
  const musicStatusId = useId();

  const track = findTrack(music.trackId);
  const playing = music.status === "playing";
  const active = playing || music.status === "loading";
  const musicStatus =
    music.status === "loading"
      ? "Loading…"
      : music.status === "error"
        ? "Unavailable · press play to retry"
        : track
          ? `${playing ? "Playing" : music.status === "paused" ? "Paused" : "Ready"} · ${track.title}`
          : "Not playing";

  // Mounted once in the persistent header: follow the system and other tabs until a choice is made.
  useEffect(() => watchThemeSources(), []);

  const close = useCallback((refocus = false) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  // A page change folds the card away (adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Close on presses outside the control.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  // A short drop and fade; the rows follow a beat behind. Layout effect, so there's no settled first frame.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const still = reducedMotion();
    const rows = panel.querySelectorAll("[data-row]");
    gsap.killTweensOf([panel, ...rows]);

    if (open) {
      // Visible from the first frame (only opacity animates) so a row can take focus straight away.
      if (still) {
        gsap.fromTo(panel, { opacity: 0, visibility: "visible" }, { opacity: 1, duration: 0.14 });
      } else {
        gsap.fromTo(
          panel,
          { opacity: 0, visibility: "visible", y: -6, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: "power3.out" }
        );
        gsap.fromTo(
          rows,
          { opacity: 0, y: 4 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.035, delay: 0.04, clearProps: "opacity,transform" }
        );
      }
      if (focusFirst.current) panel.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
      focusFirst.current = false;
      return;
    }

    gsap.to(
      panel,
      still ? { autoAlpha: 0, duration: 0.1 } : { autoAlpha: 0, y: -4, scale: 0.985, duration: 0.16, ease: "power2.in" }
    );
  }, [open]);

  useEffect(() => {
    const panel = panelRef.current;
    return () => {
      if (panel) gsap.killTweensOf(panel);
    };
  }, []);

  const handleTrigger = (event: MouseEvent<HTMLButtonElement>) => {
    if (!open) {
      // Keyboard activation (detail 0) moves focus into the card; a pointer click leaves it on the trigger.
      focusFirst.current = event.detail === 0;
      preloadWordBreak();
    }
    setOpen((value) => !value);
  };

  // Arrow keys walk the controls; Escape folds the card and hands focus back to the trigger.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      close(true);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    if (!open) {
      if (event.target !== triggerRef.current || event.key !== "ArrowDown") return;
      event.preventDefault();
      focusFirst.current = true;
      setOpen(true);
      return;
    }
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("button") ?? []);
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? (index + 1) % items.length
            : index <= 0
              ? items.length - 1
              : index - 1;
    items[next].focus();
  };

  // Tabbing out of the control closes it.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (open && !wrapRef.current?.contains(event.relatedTarget as Node | null)) close();
  };

  const openGame = () => {
    close();
    // The game takes the stage; a full jukebox tucks into its mini dock and keeps playing.
    if (music.panel === "open") minimizeJukebox();
    setGameOpen(true);
  };

  const closeGame = useCallback(() => {
    setGameOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const openPlayer = () => {
    close();
    // Focus returns to the always-present trigger when the jukebox closes.
    openJukebox(triggerRef.current);
  };

  // The reveal grows from the centre of the screen, so the toggle's position doesn't matter.
  const handleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");

  return (
    <>
      <div ref={wrapRef} className={styles.wrap} onKeyDown={handleKeyDown} onBlur={handleBlur}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          aria-label={active ? "More: word game, music (playing) and appearance" : "More: word game, music and appearance"}
          aria-expanded={open}
          aria-controls={panelId}
          data-open={open || undefined}
          data-jukebox-opener
          onClick={handleTrigger}
          onPointerEnter={preloadMusic}
          onFocus={preloadMusic}
        >
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {/* The soundwave tile no longer sits in the bar, so a small dot says the music is on. */}
          <span className={styles.liveDot} data-live={active || undefined} aria-hidden="true" />
        </button>

        <div ref={panelRef} id={panelId} className={styles.panel} role="group" aria-label="Utilities" inert={!open}>
          <div className={styles.row} data-row>
            <button
              type="button"
              className={styles.item}
              aria-haspopup="dialog"
              onClick={openGame}
              onPointerEnter={preloadWordBreak}
            >
              <span className={`${styles.icon} ${styles.letter}`} aria-hidden="true">
                W
              </span>
              <span className={styles.text}>
                <span className={styles.label}>Mini Wordle</span>
                <span className={styles.meta}>A little daily word break</span>
              </span>
              <ArrowUpRight className={styles.go} size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.row} data-row>
            <button
              type="button"
              className={styles.item}
              aria-haspopup="dialog"
              aria-controls={JUKEBOX_PANEL_ID}
              aria-describedby={musicStatusId}
              onClick={openPlayer}
            >
              <span className={`${styles.icon} ${styles.wave}`} data-state={music.status} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
              <span className={styles.text}>
                <span className={styles.label}>Music player</span>
                <span id={musicStatusId} className={styles.meta}>
                  <span className={styles.statusDot} data-live={active || undefined} aria-hidden="true" />
                  <span className={styles.metaText}>{musicStatus}</span>
                </span>
              </span>
            </button>
            <button
              type="button"
              className={styles.play}
              aria-label={active ? "Pause music" : music.status === "error" ? "Retry music" : "Play music"}
              onClick={toggleMusic}
            >
              {active ? (
                <Pause size={12} strokeWidth={2.2} fill="currentColor" aria-hidden="true" />
              ) : (
                <Play size={12} strokeWidth={2.2} fill="currentColor" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className={styles.divider} aria-hidden="true" />

          <div className={styles.row} data-row>
            <button
              type="button"
              className={styles.item}
              role="switch"
              aria-checked={isDark}
              aria-label="Appearance: dark mode"
              onClick={handleTheme}
            >
              <span className={`${styles.icon} ${styles.theme}`} aria-hidden="true">
                <Moon className={styles.moon} size={15} strokeWidth={1.9} />
                <Sun className={styles.sun} size={16} strokeWidth={1.9} />
              </span>
              <span className={styles.text}>
                <span className={styles.label}>Appearance</span>
                <span className={styles.meta}>{isDark ? "Dark" : "Light"}</span>
              </span>
              <span className={styles.switch} aria-hidden="true">
                <span />
              </span>
            </button>
          </div>
        </div>
      </div>

      {gameOpen && <WordBreakModal onClose={closeGame} />}
    </>
  );
}
