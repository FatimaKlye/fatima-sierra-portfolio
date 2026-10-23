"use client";

import { useSyncExternalStore } from "react";
import { THEME_ATTR, THEME_STORAGE_KEY as STORAGE_KEY, THEME_SYSTEM_QUERY as SYSTEM_QUERY } from "./themeScript";

/* Client-side theme state. The pre-paint <head> script lives in ./themeScript (server-safe). */

export type Theme = "light" | "dark";

export function getTheme(): Theme {
  return document.documentElement.getAttribute(THEME_ATTR) === "dark" ? "dark" : "light";
}

function readStored(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** Subscribes to theme changes from any source (the toggle, the system, another tab). */
export function subscribeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_ATTR] });
  return () => observer.disconnect();
}

/** Current theme for client components. The server can't know it, so hydration starts at "light". */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, getTheme, () => "light");
}

const apply = (theme: Theme) => document.documentElement.setAttribute(THEME_ATTR, theme);

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

/**
 * Switches theme in place — no reload, scroll or state change. Where supported, the new theme
 * spreads outward from `origin` (the toggle) as a soft circle; otherwise colours cross-fade.
 */
export function setTheme(theme: Theme, origin?: { x: number; y: number }) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the switch still applies for this visit.
  }
  if (theme === getTheme()) return;

  const root = document.documentElement;
  const doc = document as ViewTransitionDocument;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply(theme);
    return;
  }

  if (typeof doc.startViewTransition === "function" && origin) {
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y)
    );
    root.setAttribute("data-theme-switching", "");
    const transition = doc.startViewTransition(() => apply(theme));
    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${origin.x}px ${origin.y}px)`,
              `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
            ],
          },
          { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      })
      .catch(() => {});
    transition.finished.catch(() => {}).finally(() => root.removeAttribute("data-theme-switching"));
    return;
  }

  // Fallback: a brief, global colour cross-fade (see .theme-fade in globals.css).
  root.classList.add("theme-fade");
  apply(theme);
  window.setTimeout(() => root.classList.remove("theme-fade"), 420);
}

/**
 * Keeps the page in step with the system preference until the visitor picks a theme, and with
 * choices made in other tabs. Returns a cleanup function.
 */
export function watchThemeSources(): () => void {
  const media = window.matchMedia(SYSTEM_QUERY);
  const systemTheme = (): Theme => (media.matches ? "dark" : "light");
  const onSystem = () => {
    if (!readStored()) apply(systemTheme());
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) apply(readStored() ?? systemTheme());
  };
  media.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    media.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}
