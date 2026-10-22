"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { INTRO_ATTR } from "./introScript";

/* If the cover's 8s failsafe (globals.css) has already revealed the page, popping the intro up
   now would be more jarring than skipping it. */
const LATE_HYDRATION_MS = 7500;

const dropIntro = () => document.documentElement.removeAttribute(INTRO_ATTR);

// Loaded only for the one visit that needs it, so every other page view pays nothing.
const EntranceIntro = dynamic(
  () =>
    import("./EntranceIntro").catch(() => {
      dropIntro();
      return { default: () => null };
    }),
  { ssr: false }
);

/* Decided once per page load; the head script has already set (or not set) the flag. */
let decision: boolean | null = null;
const shouldPlay = () => {
  if (decision === null) {
    decision = document.documentElement.hasAttribute(INTRO_ATTR) && performance.now() <= LATE_HYDRATION_MS;
  }
  return decision;
};
const subscribe = () => () => {};
const serverSnapshot = () => false;

/**
 * Mounted once in the root layout, which persists across client navigations, so the intro can
 * only ever start on a full page load. Whether it starts is decided by the inline head script.
 */
export default function IntroGate() {
  const play = useSyncExternalStore(subscribe, shouldPlay, serverSnapshot);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!shouldPlay()) dropIntro(); // late hydration: let the cover go without an intro
  }, []);

  if (!play || done) return null;
  return <EntranceIntro onDone={() => setDone(true)} />;
}
