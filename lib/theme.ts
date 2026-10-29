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

/* ---------- Switching ----------
   A theme flip restyles every element once; that part is unavoidable. What made it lag was the
   ~190 colour transitions in component styles: each one kept restyling and repainting the page
   for the next ~250ms. So the flip happens under <html data-theme-switching> (transitions off,
   see globals.css), set in the same mutation so it costs no extra restyle. Lifting it restyles
   everything once more, so that rides along with the reveal's own teardown, or waits for idle. */

const SWITCHING_ATTR = "data-theme-switching";
/** Styles the reveal's view-transition pseudos only, so toggling it costs next to nothing. */
const REVEAL_ATTR = "data-theme-reveal";
const REVEAL_MS = 520;
const REVEAL_EASING = "cubic-bezier(0.55, 0, 0.15, 1)";
/* No slow-device fallback: a late capture used to count as a strike, and two strikes switched the
   heart off until the next page load. On slower laptops that tripped within the first few toggles,
   so the heart played once or twice and then never again. Every supported switch now gets one. */

type ViewTransitionLike = { ready: Promise<void>; finished: Promise<void>; skipTransition: () => void };
type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => ViewTransitionLike };
type ViewTransitionCapable = ViewTransitionDocument & Required<Pick<ViewTransitionDocument, "startViewTransition">>;

let running: ViewTransitionLike | null = null;
/** Whether `running` has passed its update callback (old page captured, theme committed). */
let captured = false;
/** The latest theme asked for; a transition's deferred update applies this, never a stale choice. */
let target: Theme = "light";
let generation = 0;
let releaseTimer = 0;

/** Flips the theme with transitions held off, so colours land in the same frame as the flip. */
function commit(theme: Theme) {
  const root = document.documentElement;
  generation++;
  window.clearTimeout(releaseTimer);
  root.setAttribute(SWITCHING_ATTR, "");
  root.setAttribute(THEME_ATTR, theme);
}

/** Re-enables transitions, unless another flip has started since `scheduled`. */
function release(scheduled: number) {
  if (scheduled === generation) document.documentElement.removeAttribute(SWITCHING_ATTR);
}

/** Releases once the flip has painted, at an idle moment, since it costs a full restyle. */
function releaseSoon() {
  const scheduled = generation;
  window.clearTimeout(releaseTimer);
  releaseTimer = window.setTimeout(() => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(() => release(scheduled), { timeout: 600 });
    else release(scheduled);
  }, 120);
}

function switchInstantly(theme: Theme) {
  target = theme;
  commit(theme);
  releaseSoon();
}

/* ---------- Heart reveal ----------
   One heart, in unit space (about 2 wide, y down, origin at its visual centre). */
const HEART_START = [0, -0.59] as const;
const HEART_CURVES = [
  [0.18, -0.99, 0.92, -1.09, 1, -0.49],
  [1.07, -0.01, 0.6, 0.41, 0, 0.91],
  [-0.6, 0.41, -1.07, -0.01, -1, -0.49],
  [-0.92, -1.09, -0.18, -0.99, 0, -0.59],
] as const;
const START_SIZE = 14; // half-width in px of the heart that first appears
const RIM = 12; // px of rim colour between the old page and the new one

/* The heart is a mask image, drawn once and then only resized. Measured on an Iris Xe laptop
   (About page), a growing path() clip re-rasterises every frame and falls to ~40fps; this holds
   60. The SVG box is 2.2 units wide, so a mask-size of 2.2 × scale is a heart `scale` px wide
   in half-width. */
const MASK_BOX = 2.2;
const HEART_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.1 -1.1 2.2 2.2"><path d="M ${HEART_START.join(" ")} ${HEART_CURVES.map((c) => `C ${c.join(" ")}`).join(" ")} Z"/></svg>`
)}")`;

let outline: number[] | null = null;

/** The heart's edge as a flat polygon, sampled once. */
function heartOutline() {
  if (outline) return outline;
  const points: number[] = [];
  let [x0, y0]: readonly number[] = HEART_START;
  for (const [x1, y1, x2, y2, x3, y3] of HEART_CURVES) {
    for (let i = 1; i <= 24; i++) {
      const t = i / 24;
      const m = 1 - t;
      points.push(
        m * m * m * x0 + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t * x3,
        m * m * m * y0 + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t * y3
      );
    }
    [x0, y0] = [x3, y3];
  }
  return (outline = points);
}

/** Distance from the heart's centre to its edge along (dx, dy), for the unit heart. */
function edgeDistance(dx: number, dy: number) {
  const points = heartOutline();
  let nearest = Infinity;
  for (let i = 0; i < points.length; i += 2) {
    const ax = points[i];
    const ay = points[i + 1];
    const ex = points[(i + 2) % points.length] - ax;
    const ey = points[(i + 3) % points.length] - ay;
    const den = dx * ey - dy * ex;
    if (!den) continue;
    const t = (ax * ey - ay * ex) / den;
    const u = (ax * dy - ay * dx) / den;
    if (t > 0 && u >= 0 && u <= 1) nearest = Math.min(nearest, t);
  }
  return nearest;
}

/** The smallest heart scale that covers a w × h box centred on it, notch and corners included. */
function coverScale(w: number, h: number) {
  let scale = 0;
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const along = (i / steps - 0.5) * w;
    const down = (i / steps - 0.5) * h;
    for (const [x, y] of [[along, -h / 2], [along, h / 2], [-w / 2, down], [w / 2, down]]) {
      const length = Math.hypot(x, y);
      scale = Math.max(scale, length / edgeDistance(x / length, y / length));
    }
  }
  return scale * 1.03;
}

/**
 * Grows one heart from the middle of the screen. The new theme shows inside it; the old page is
 * cut away just outside it, and the thin gap between the two shows the rim colour (globals.css).
 * Both masks share one timing and only their size moves — nothing is recalculated per frame.
 * Returns the reveal's animation, which finishes in the same frame the transition is torn down.
 */
function revealHeart(): Animation {
  // Mobile snapshots span the largest viewport (browser bars hidden), so cover that too.
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const end = coverScale(window.innerWidth, coarse ? Math.max(window.innerHeight, screen.height) : window.innerHeight);
  const size = (scale: number) => `${Math.round(scale * MASK_BOX)}px`;
  // No fill: the transition ends the frame these finish, and nothing is left attached to <html>.
  const timing: KeyframeAnimationOptions = { duration: REVEAL_MS, easing: REVEAL_EASING };
  const root = document.documentElement;
  const still = { maskRepeat: "no-repeat", maskPosition: "center" };

  // The old page keeps everything but the heart: a full layer minus the heart layer.
  const page = `linear-gradient(#000 0 0), ${HEART_MASK}`;
  root.animate(
    [
      { ...still, maskImage: page, maskComposite: "subtract", maskSize: `100% 100%, ${size(START_SIZE)}` },
      { ...still, maskImage: page, maskComposite: "subtract", maskSize: `100% 100%, ${size(end + RIM)}` },
    ],
    { ...timing, pseudoElement: "::view-transition-old(root)" }
  );
  return root.animate(
    [
      { ...still, maskImage: HEART_MASK, maskSize: size(0) },
      { ...still, maskImage: HEART_MASK, maskSize: size(end) },
    ],
    { ...timing, pseudoElement: "::view-transition-new(root)" }
  );
}

/** Opens one heart onto `target`. Its teardown resets everything, or starts the next heart. */
function startReveal(doc: ViewTransitionCapable) {
  const root = document.documentElement;
  // Set before the transition starts, so every reveal's pseudos are styled from their first frame.
  root.setAttribute(REVEAL_ATTR, "");
  captured = false;
  const transition = doc.startViewTransition(() => {
    captured = true;
    // Presses before the capture cancelled each other out: nothing to reveal.
    if (target === getTheme()) transition.skipTransition();
    else commit(target);
  });
  running = transition;
  transition.ready
    .then(() => {
      // Lifting the hold as the heart lands folds its restyle into the teardown's.
      const scheduled = generation;
      revealHeart().finished.then(() => release(scheduled), () => {});
    })
    .catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (running !== transition) return;
      running = null;
      // A press during this reveal asked for the other theme: open a fresh heart for it.
      if (target !== getTheme()) {
        startReveal(doc);
        return;
      }
      root.removeAttribute(REVEAL_ATTR);
      releaseSoon();
    });
}

/**
 * Switches theme in place — no reload, scroll or React state beyond the two theme readers. Where
 * view transitions exist, the new theme opens inside a heart from the centre of the screen, every
 * time; reduced motion and older browsers get an instant switch instead.
 */
export function setTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the switch still applies for this visit.
  }

  target = theme;
  if (running) {
    // Before the capture, the pending reveal will simply commit the new `target`. Mid-reveal, cut
    // the current heart short; its teardown opens a new one toward `target`.
    if (captured) running.skipTransition();
    return;
  }
  if (theme === getTheme()) return;

  const doc = document as ViewTransitionDocument;
  if (typeof doc.startViewTransition !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    switchInstantly(theme);
    return;
  }
  startReveal(doc as ViewTransitionCapable);
}

/**
 * Keeps the page in step with the system preference until the visitor picks a theme, and with
 * choices made in other tabs. Returns a cleanup function.
 */
export function watchThemeSources(): () => void {
  const media = window.matchMedia(SYSTEM_QUERY);
  const systemTheme = (): Theme => (media.matches ? "dark" : "light");
  const follow = (theme: Theme) => {
    if (theme !== getTheme()) switchInstantly(theme);
  };
  const onSystem = () => {
    if (!readStored()) follow(systemTheme());
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) follow(readStored() ?? systemTheme());
  };
  media.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    media.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}
